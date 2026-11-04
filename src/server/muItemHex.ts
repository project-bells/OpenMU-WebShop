import crypto from 'crypto';
import {
  ItemGroup,
  VaultItemInstance,
  WebShopConfig,
  WebShopItem,
} from '../types/webshop';
import {
  buildOccupancyMatrix,
  calculateItemTotalCredits,
  findFreeVaultSlot,
} from '../utils/muItemLogic';

export const WAREHOUSE_SLOT_COUNT = 120; // 8x15 grid
export const S6_ITEM_BYTE_LENGTH = 16; // 16 bytes = 32 hex chars per Season 6 item
export const EMPTY_S6_SLOT_HEX = 'F'.repeat(S6_ITEM_BYTE_LENGTH * 2);

const issuedSerials = new Set<string>([
  '00000000',
  'FFFFFFFF',
  '00A84F21',
  '00A84F22',
  '00B91E04',
  '00C73D90',
  '00D14A88',
  '00E52C11',
  '00E52C12',
  '00F77B01',
  '00991A01',
  '00991A02',
  '00772C05',
  '00772C09',
  '00334D01',
]);

let monotonicCounter = crypto.randomInt(0x00100000, 0x0fffffff);

/**
 * Generates a collision-free, non-zero 8-character uppercase hexadecimal MU Item Serial.
 * Never produces 00000000 or FFFFFFFF.
 */
export function generateUniqueItemSerial(): string {
  for (let attempt = 0; attempt < 64; attempt++) {
    monotonicCounter = (monotonicCounter + 1) >>> 0;
    const entropy = crypto.randomBytes(2).readUInt16BE(0);
    const combined = (((monotonicCounter & 0xffff) << 16) | entropy) >>> 0;
    if (combined === 0 || combined === 0xffffffff) continue;
    const hex = combined.toString(16).toUpperCase().padStart(8, '0');
    if (!issuedSerials.has(hex)) {
      issuedSerials.add(hex);
      return hex;
    }
  }
  throw new Error('SERIAL_GENERATION_EXHAUSTED');
}

export function registerExistingSerial(serial: string): void {
  if (serial && serial.length === 8) {
    issuedSerials.add(serial.toUpperCase());
  }
}

/**
 * Encodes a VaultItemInstance into an authentic 16-byte (32-hex-char) MU Online Season 6 item hex.
 */
export function encodeSeason6ItemHex(item: {
  itemId: number;
  itemType: number;
  level: number;
  option: number;
  luck: boolean;
  skill: boolean;
  durability: number;
  serial: string;
  exlOptions: boolean[];
  ancientStamina: 0 | 5 | 10;
  fenrirVariant: 0 | 1 | 2 | 3;
}): string {
  const buf = Buffer.alloc(S6_ITEM_BYTE_LENGTH, 0x00);

  const safeId = Math.max(0, Math.min(511, item.itemId));
  const safeType = Math.max(0, Math.min(15, item.itemType));
  const safeLevel = Math.max(0, Math.min(15, item.level));
  const safeOption = Math.max(0, Math.min(7, item.option));
  const safeDurability = Math.max(1, Math.min(255, item.durability || 255));

  // Byte 0: Item Index (lower 8 bits)
  buf[0] = safeId & 0xff;

  // Byte 1: [Skill:1][Level:4][Luck:1][OptionLow:2]
  let byte1 = 0;
  if (item.skill) byte1 |= 0x80;
  byte1 |= (safeLevel & 0x0f) << 3;
  if (item.luck) byte1 |= 0x04;
  byte1 |= safeOption & 0x03;
  buf[1] = byte1;

  // Byte 2: Durability
  buf[2] = safeDurability;

  // Bytes 3..6: 4-byte Big-Endian Item Serial
  const cleanSerial = /^[0-9A-Fa-f]{8}$/.test(item.serial)
    ? item.serial.toUpperCase()
    : generateUniqueItemSerial();
  const serialBytes = Buffer.from(cleanSerial, 'hex');
  serialBytes.copy(buf, 3, 0, 4);

  // Byte 7: [ItemIdHighBit:1][OptionBit4:1][ExcellentBits:6]
  let exlMask = 0;
  const isFenrir = safeType === 12 && safeId === 37;
  if (isFenrir) {
    if (item.fenrirVariant === 1) exlMask = 0x01; // Destroy
    else if (item.fenrirVariant === 2) exlMask = 0x02; // Protect
    else if (item.fenrirVariant === 3) exlMask = 0x04; // Golden
  } else {
    for (let i = 0; i < 6; i++) {
      if (item.exlOptions[i]) {
        exlMask |= 1 << i;
      }
    }
  }
  let byte7 = exlMask & 0x3f;
  if (safeOption >= 4) byte7 |= 0x40;
  if ((safeId & 0x100) !== 0) byte7 |= 0x80;
  buf[7] = byte7;

  // Byte 8: Ancient Set Option (0x05 = +5 Stamina, 0x0A = +10 Stamina)
  buf[8] = item.ancientStamina === 10 ? 0x0a : item.ancientStamina === 5 ? 0x05 : 0x00;

  // Byte 9: [ItemTypeGroup:4][380PvPOption:1][Reserved:3]
  buf[9] = (safeType & 0x0f) << 4;

  // Byte 10: Harmony Jewel Option (0x00 = unrefined)
  buf[10] = 0x00;

  // Bytes 11..15: Season 6 5-Socket Slots (0xFF = no socket)
  buf[11] = 0xff;
  buf[12] = 0xff;
  buf[13] = 0xff;
  buf[14] = 0xff;
  buf[15] = 0xff;

  return buf.toString('hex').toUpperCase();
}

/**
 * Encodes an entire 8x15 warehouse (120 slots * 32 hex chars = 3840 hex chars / 1920 bytes).
 */
export function encodeWarehouseHex3840(vaultItems: VaultItemInstance[]): string {
  const slots = new Array<string>(WAREHOUSE_SLOT_COUNT).fill(EMPTY_S6_SLOT_HEX);
  for (const inst of vaultItems) {
    if (inst.slotIndex >= 0 && inst.slotIndex < WAREHOUSE_SLOT_COUNT) {
      slots[inst.slotIndex] = inst.itemHex || encodeSeason6ItemHex(inst);
    }
  }
  return slots.join('');
}

/**
 * Verifies that placing an item of size (X, Y) at slotIndex does not go out of bounds
 * or overlap any existing item in the 8x15 warehouse grid.
 */
export function verifySlotPlacement(
  existingItems: VaultItemInstance[],
  slotIndex: number,
  itemX: number,
  itemY: number
): boolean {
  if (
    !Number.isInteger(slotIndex) ||
    slotIndex < 0 ||
    slotIndex >= WAREHOUSE_SLOT_COUNT ||
    itemX < 1 ||
    itemX > 8 ||
    itemY < 1 ||
    itemY > 15
  ) {
    return false;
  }
  const startCol = slotIndex % 8;
  const startRow = Math.floor(slotIndex / 8);
  if (startCol + itemX > 8 || startRow + itemY > 15) {
    return false;
  }

  const matrix = buildOccupancyMatrix(existingItems);
  for (let dy = 0; dy < itemY; dy++) {
    for (let dx = 0; dx < itemX; dx++) {
      if (matrix[startRow + dy][startCol + dx] !== null) {
        return false;
      }
    }
  }
  return true;
}

export function locateFreeWarehouseSlot(
  existingItems: VaultItemInstance[],
  itemX: number,
  itemY: number
): number {
  return findFreeVaultSlot(existingItems, itemX, itemY);
}

/**
 * Server-authoritative item option sanitization and credit calculation.
 * Never trusts client-computed prices or unbounded option flags.
 */
export function sanitizeAndPriceSingleItem(
  item: WebShopItem,
  rawOpts: {
    level?: number;
    option?: number;
    luck?: boolean;
    skill?: boolean;
    exlOptions?: boolean[];
    ancientStamina?: number;
    fenrirVariant?: number;
  },
  config: WebShopConfig
): {
  level: number;
  option: number;
  luck: boolean;
  skill: boolean;
  exlOptions: boolean[];
  ancientStamina: 0 | 5 | 10;
  fenrirVariant: 0 | 1 | 2 | 3;
  totalCredits: number;
} {
  if (config.credits.zerocredit === 0 && item.credits <= 0) {
    throw new Error('ITEM_NOT_FOR_SALE');
  }

  const maxLv = item.maxitlv > 0 ? item.maxitlv : config.limit.item_level;
  const maxOp = item.maxitop > 0 ? item.maxitop : config.limit.item_option;
  const maxEx = Math.min(
    3,
    item.maxitxl > 0 ? item.maxitxl : config.limit.item_excellent
  );

  const level =
    item.hasLevel === 1
      ? Math.max(0, Math.min(maxLv, Math.trunc(Number(rawOpts.level) || 0)))
      : 0;
  const option =
    item.hasOption === 1
      ? Math.max(0, Math.min(maxOp, Math.trunc(Number(rawOpts.option) || 0)))
      : 0;
  const luck = item.luck === 1 ? Boolean(rawOpts.luck) : false;
  const skill = item.skill === 1 ? Boolean(rawOpts.skill) : false;

  const isFenrir = item.type === 12 && item.id === 37;
  const exlAllowed = item.ex_type >= 0 && item.ex_type !== 3 && !isFenrir;
  const exlOptions = Array.from({ length: 6 }, (_, idx) =>
    exlAllowed ? Boolean(rawOpts.exlOptions?.[idx]) : false
  );

  const exCount = exlOptions.filter(Boolean).length;
  if (exCount > maxEx) {
    throw new Error(`MAX_EXCELLENT_OPTIONS_EXCEEDED:${maxEx}`);
  }

  const ancientStamina: 0 | 5 | 10 =
    item.ex_type === 3 && (rawOpts.ancientStamina === 5 || rawOpts.ancientStamina === 10)
      ? rawOpts.ancientStamina
      : 0;

  const fenrirVariant: 0 | 1 | 2 | 3 =
    isFenrir &&
    (rawOpts.fenrirVariant === 1 ||
      rawOpts.fenrirVariant === 2 ||
      rawOpts.fenrirVariant === 3)
      ? rawOpts.fenrirVariant
      : 0;

  const totalCredits = calculateItemTotalCredits(
    item.credits,
    level,
    option,
    luck,
    skill,
    exlOptions,
    ancientStamina,
    fenrirVariant,
    config
  );

  if (!Number.isFinite(totalCredits) || totalCredits < 0) {
    throw new Error('INVALID_PRICE_CALCULATION');
  }

  return {
    level,
    option,
    luck,
    skill,
    exlOptions,
    ancientStamina,
    fenrirVariant,
    totalCredits,
  };
}

export function sanitizeAndPriceGroupSet(
  group: ItemGroup,
  memberItems: WebShopItem[],
  rawOpts: {
    level?: number;
    option?: number;
    luck?: boolean;
    exlOptions?: boolean[];
    ancientStamina?: number;
  },
  config: WebShopConfig
): {
  level: number;
  option: number;
  luck: boolean;
  exlOptions: boolean[];
  ancientStamina: 0 | 5 | 10;
  totalCredits: number;
} {
  if (memberItems.length === 0) {
    throw new Error('EMPTY_ITEM_GROUP');
  }

  const baseItem = memberItems[0];
  const maxLv = baseItem.maxitlv > 0 ? baseItem.maxitlv : config.limit.item_level;
  const maxOp = baseItem.maxitop > 0 ? baseItem.maxitop : config.limit.item_option;
  const maxEx = Math.min(
    3,
    baseItem.maxitxl > 0 ? baseItem.maxitxl : config.limit.item_excellent
  );

  const level = Math.max(0, Math.min(maxLv, Math.trunc(Number(rawOpts.level) || 0)));
  const option = Math.max(0, Math.min(maxOp, Math.trunc(Number(rawOpts.option) || 0)));
  const luck = Boolean(rawOpts.luck);
  const exlOptions = Array.from({ length: 6 }, (_, idx) =>
    Boolean(rawOpts.exlOptions?.[idx])
  );

  if (exlOptions.filter(Boolean).length > maxEx) {
    throw new Error(`MAX_EXCELLENT_OPTIONS_EXCEEDED:${maxEx}`);
  }

  const ancientStamina: 0 | 5 | 10 =
    baseItem.ex_type === 3 &&
    (rawOpts.ancientStamina === 5 || rawOpts.ancientStamina === 10)
      ? rawOpts.ancientStamina
      : 0;

  const totalCredits = calculateItemTotalCredits(
    group.credits,
    level,
    option,
    luck,
    false,
    exlOptions,
    ancientStamina,
    0,
    config
  );

  return {
    level,
    option,
    luck,
    exlOptions,
    ancientStamina,
    totalCredits,
  };
}
