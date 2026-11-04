import { INITIAL_WEBSHOP_ITEMS } from './webshopItems';
import {
  AccountData,
  Character,
  IpBanEntry,
  ItemGroup,
  LogEntry,
  VaultItemInstance,
  WebShopConfig,
} from '../types/webshop';

export const DEFAULT_WEBSHOP_CONFIG: WebShopConfig = {
  credits: {
    reset: 200, // Cost to Reset Points
    buychar400: 500, // 500 Credits: Buy Level 400 Class 3 Character
    deletechar400: 300, // 300 Credits: Delete Level 400 Character reward
    onlineHourReward: 5, // 5 Credits per 1 Hour Online
    classchg: 1000,
    itemexl: 15,
    itemluck: 15,
    itemskill: 13,
    itemlvl: 4,
    itemopt: 5,
    ancient1: 13,
    ancient2: 20,
    unbanchar: 3500,
    points: 20,
    multiplier: 1,
    zerocredit: 0,
    fenrir_destroy: 40,
    fenrir_protect: 40,
    golden_fenrir: 45,
    zen: 10000000, // 1 Credit = 10M Zen -> 50 Credits = 500M Zen
    zenPackageCredits: 50,
    zenPackageAmount: 500000000, // 500M Zen
    sellback_Q: 0.5,
    namechg: 1000,
    vipMonthlyCost: 800, // 800 Credits / month (30 days)
  },
  limit: {
    item_level: 13,
    item_option: 7,
    item_excellent: 3, // Max 3 Excellent options per item
    zen_limit: 900000000, // 900M Warehouse Zen Maximum Limit
  },
  misc: {
    title: 'Welcome to our Web Based MuOnline Shop',
    admins: 'netsplit,admin',
    servername: 'Continent of Lorencia S3',
    serverlink: 'https://github.com/project-bells/Open-Webshop',
    topcredits: 20,
    s3classes: true,
    solidbans: 'duper99,perma_pk',
    bannedcode: 1,
    whshow: true,
    addshow: true,
  },
};

function findItemByName(name: string) {
  return (
    INITIAL_WEBSHOP_ITEMS.find(
      (it) => it.name.toLowerCase() === name.toLowerCase()
    ) || INITIAL_WEBSHOP_ITEMS[0]
  );
}

function createInitialVaultItem(
  name: string,
  slotIndex: number,
  serial: string,
  level: number,
  option: number,
  luck: boolean,
  skill: boolean,
  exlOptions: boolean[],
  paidCredits: number,
  fenrirVariant: 0 | 1 | 2 | 3 = 0
): VaultItemInstance {
  const item = findItemByName(name);
  return {
    instanceId: `init_${serial}`,
    serial,
    slotIndex,
    itemUid: item.uid,
    itemId: item.id,
    itemType: item.type,
    name: item.name,
    X: item.X,
    Y: item.Y,
    level,
    option,
    luck,
    skill,
    exlOptions,
    ancientStamina: 0,
    fenrirVariant,
    durability: 255,
    paidCredits,
    canSellBack: item.cansellitem === 1,
    purchasedAt: Math.floor(Date.now() / 1000) - 3600,
  };
}

export const INITIAL_ACCOUNTS: AccountData[] = [
  {
    username: 'netsplit',
    credits: 14850,
    vaultMoney: 350000000, // 350M in Vault (Buying +500M = 850M <= 900M limit)
    onlineMinutes: 385, // 6 hours 25 minutes ready to exchange (6 hrs * 5 = +30 Credits)
    exchangedOnlineHours: 18,
    vipUntil: null,
    isAdmin: true,
    role: 'SUPER_ADMIN',
    isMasterAdmin: true,
    isOnline: false,
    vaultItems: [
      createInitialVaultItem(
        'Bone Blade',
        0, // col 0, row 0 (1x4)
        '00A84F21',
        13,
        7,
        true,
        true,
        [false, true, true, false, true, true],
        322
      ),
      createInitialVaultItem(
        'Knight Blade',
        1, // col 1, row 0 (1x4)
        '00A84F22',
        13,
        7,
        true,
        true,
        [true, false, true, false, true, true],
        315
      ),
      createInitialVaultItem(
        'Wings Of Storm',
        2, // col 2..5, row 0..2 (4x3)
        '00B91E04',
        13,
        7,
        true,
        false,
        [true, true, true, false, true, false],
        412
      ),
      createInitialVaultItem(
        'Dragon Shield',
        6, // col 6..7, row 0..2 (2x3)
        '00C73D90',
        13,
        7,
        true,
        true,
        [false, true, true, true, false, true],
        215
      ),
      createInitialVaultItem(
        'Grand Soul Staff',
        32, // col 0..1, row 4..7 (2x4)
        '00D14A88',
        13,
        7,
        true,
        false,
        [true, false, true, true, false, true],
        280
      ),
      createInitialVaultItem(
        'Black Dragon Armor',
        34, // col 2..3, row 4..6 (2x3)
        '00E52C11',
        13,
        7,
        true,
        false,
        [false, true, true, true, false, true],
        245
      ),
      createInitialVaultItem(
        'Black Dragon Helm',
        36, // col 4..5, row 4..5 (2x2)
        '00E52C12',
        13,
        7,
        true,
        false,
        [false, true, true, true, false, true],
        210
      ),
      createInitialVaultItem(
        'Horn of Fenrir',
        38, // col 6..7, row 4..5 (2x2)
        '00F77B01',
        0,
        0,
        false,
        true,
        [true, false, false, false, false, false],
        260,
        1
      ),
      createInitialVaultItem(
        'Ring of Ice',
        52, // col 4, row 6 (1x1)
        '00991A01',
        13,
        4,
        false,
        false,
        [false, true, true, true, false, true],
        195
      ),
      createInitialVaultItem(
        'Pendant of Lighting',
        53, // col 5, row 6 (1x1)
        '00991A02',
        13,
        4,
        false,
        false,
        [true, false, true, true, false, true],
        195
      ),
      createInitialVaultItem(
        'Box Of Kundun +5',
        54, // col 6, row 6 (1x1)
        '00772C05',
        0,
        0,
        false,
        false,
        [false, false, false, false, false, false],
        20
      ),
      createInitialVaultItem(
        'Jewel Of Bless Bundle +3',
        55, // col 7, row 6 (1x1)
        '00772C09',
        0,
        0,
        false,
        false,
        [false, false, false, false, false, false],
        75
      ),
    ],
  },
  {
    username: 'darkknight',
    credits: 4200,
    vaultMoney: 185000000,
    onlineMinutes: 195, // 3 hours 15 mins
    exchangedOnlineHours: 6,
    vipUntil: null,
    isAdmin: false,
    role: 'USER',
    isMasterAdmin: false,
    isOnline: false,
    vaultItems: [
      createInitialVaultItem(
        'Sword of Destruction',
        0,
        '00334D01',
        11,
        4,
        true,
        true,
        [false, false, true, false, true, true],
        219
      ),
    ],
  },
  {
    username: 'soulmaster',
    credits: 2950,
    vaultMoney: 92000000,
    onlineMinutes: 130, // 2 hours 10 mins
    exchangedOnlineHours: 4,
    vipUntil: null,
    isAdmin: false,
    role: 'USER',
    isMasterAdmin: false,
    isOnline: false,
    vaultItems: [],
  },
];

export const INITIAL_CHARACTERS: Character[] = [
  {
    name: 'BladeKing',
    accountId: 'netsplit',
    classCode: 'bm',
    classId: 18,
    level: 400,
    resets: 0,
    levelUpPoints: 195,
    strength: 1128,
    agility: 620,
    vitality: 325,
    energy: 110,
    command: 0,
    money: 240000000,
    ctlCode: 0,
    isOnline: false,
  },
  {
    name: 'DarkLordX',
    accountId: 'netsplit',
    classCode: 'le',
    classId: 66,
    level: 400,
    resets: 0,
    levelUpPoints: 93,
    strength: 826,
    agility: 620,
    vitality: 420,
    energy: 515,
    command: 725,
    money: 150000000,
    ctlCode: 0,
    isOnline: false,
  },
  {
    name: 'SoulWizard',
    accountId: 'netsplit',
    classCode: 'gm',
    classId: 2,
    level: 400,
    resets: 0,
    levelUpPoints: 95,
    strength: 318,
    agility: 618,
    vitality: 215,
    energy: 1130,
    command: 0,
    money: 110000000,
    ctlCode: 0,
    isOnline: false,
  },
  {
    name: 'PK_Outlaw',
    accountId: 'netsplit',
    classCode: 'dk',
    classId: 16,
    level: 365,
    resets: 0,
    levelUpPoints: 120,
    strength: 928,
    agility: 620,
    vitality: 325,
    energy: 210,
    command: 0,
    money: 45000000,
    ctlCode: 1, // Banned! Ready to test Unban Character module
    isOnline: false,
  },
  {
    name: 'AegisBK',
    accountId: 'darkknight',
    classCode: 'bm',
    classId: 18,
    level: 400,
    resets: 0,
    levelUpPoints: 295,
    strength: 1028,
    agility: 620,
    vitality: 325,
    energy: 110,
    command: 0,
    money: 120000000,
    ctlCode: 0,
    isOnline: false,
  },
];

function buildInitialGroups(): ItemGroup[] {
  const bdNames = [
    'Black Dragon Helm',
    'Black Dragon Armor',
    'Black Dragon Pants',
    'Black Dragon Gloves',
    'Black Dragon Boots',
  ];
  const gsNames = [
    'Grand Soul Helm',
    'Grand Soul Armor',
    'Grand Soul Pants',
    'Grand Soul Gloves',
    'Grand Soul Boots',
  ];
  const dpNames = [
    'Dark Phoenix Helm',
    'Dark Phoenix Armor',
    'Dark Phoenix Pants',
    'Dark Phoenix Gloves',
    'Dark Phoenix Boots',
  ];
  const dmNames = [
    'Dark Master Mask',
    'Dark Master Armor',
    'Dark Master Pants',
    'Dark Master Gloves',
    'Dark Master Boots',
  ];

  const getUids = (names: string[]) =>
    names
      .map((n) => INITIAL_WEBSHOP_ITEMS.find((i) => i.name.toLowerCase() === n.toLowerCase())?.uid)
      .filter((u): u is number => Boolean(u));

  const bdUids = getUids(bdNames);
  const gsUids = getUids(gsNames);
  const dpUids = getUids(dpNames);
  const dmUids = getUids(dmNames);

  return [
    {
      id: 1,
      name: 'Black Dragon Full Set (5 pcs)',
      credits: 420,
      basedon: bdUids[1] || 1,
      memberUids: bdUids,
    },
    {
      id: 2,
      name: 'Grand Soul Full Set (5 pcs)',
      credits: 440,
      basedon: gsUids[1] || 1,
      memberUids: gsUids,
    },
    {
      id: 3,
      name: 'Dark Phoenix Full Set (5 pcs)',
      credits: 510,
      basedon: dpUids[1] || 1,
      memberUids: dpUids,
    },
    {
      id: 4,
      name: 'Dark Master Full Set (5 pcs)',
      credits: 620,
      basedon: dmUids[1] || 1,
      memberUids: dmUids,
    },
  ];
}

export const INITIAL_GROUPS: ItemGroup[] = buildInitialGroups();

export const INITIAL_LOGS: LogEntry[] = [
  {
    id: 1,
    accountId: 'netsplit',
    details: 'Bought Excellent Bone Blade +13 (Serial: 00A84F21) for 322 credits',
    dateline: Math.floor(Date.now() / 1000) - 7200,
    itemSerial: '00A84F21',
  },
  {
    id: 2,
    accountId: 'netsplit',
    details: 'Bought Wings Of Storm +13 (Serial: 00B91E04) for 412 credits',
    dateline: Math.floor(Date.now() / 1000) - 5400,
    itemSerial: '00B91E04',
  },
  {
    id: 3,
    accountId: 'darkknight',
    details: 'Reset Points on AegisBK (Received 2,295 LevelUpPoints) for 200 credits',
    dateline: Math.floor(Date.now() / 1000) - 3600,
  },
  {
    id: 4,
    accountId: 'netsplit',
    details: 'Redeemed 4 Online Hours for +20 credits',
    dateline: Math.floor(Date.now() / 1000) - 1800,
  },
];

export const INITIAL_BANS: IpBanEntry[] = [
  {
    id: 1,
    name: 'Speedhack Subnet',
    iprange: '192.168.99.1-192.168.99.255',
    displtxt: 'Access denied: Packet injection detected on Lorencia Gate.',
    attempts: 14,
  },
  {
    id: 2,
    name: 'Dupe Exploit Bot',
    iprange: '10.44.12.0-10.44.12.128',
    displtxt: 'Your IP range is blocked due to warehouse packet flooding.',
    attempts: 7,
  },
];
