/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  INITIAL_WEBSHOP_ITEMS,
  WebShopItem,
} from './data/webshopItems';
import {
  DEFAULT_WEBSHOP_CONFIG,
  INITIAL_ACCOUNTS,
  INITIAL_BANS,
  INITIAL_CHARACTERS,
  INITIAL_GROUPS,
  INITIAL_LOGS,
} from './data/initialState';
import {
  AccountData,
  Character,
  IpBanEntry,
  ItemGroup,
  LanguageCode,
  LogEntry,
  ModuleId,
  MuClassCode,
  VaultItemInstance,
  WebShopConfig,
} from './types/webshop';
import {
  BUY_CHAR_400_CREDITS,
  DELETE_CHAR_400_REWARD_CREDITS,
  MU_CLASSES,
  ONLINE_HOUR_REWARD_CREDITS,
  WAREHOUSE_ZEN_MAX_LIMIT,
  ZEN_PURCHASE_AMOUNT,
  ZEN_PURCHASE_CREDITS,
  calculateClassStatPoints,
  findFreeVaultSlot,
  generateSerialHex,
} from './utils/muItemLogic';
import { WarehouseGrid } from './components/WarehouseGrid';
import { ItemAdderModule } from './components/ItemAdderModule';
import { t } from './translations';
import {
  BuyCharacter400Module,
  CharNameModule,
  DeleteCharacter400Module,
  OnlineHoursRewardModule,
  ResetPointsModule,
  UnbanModule,
  ZenModule,
} from './components/PlayerModules';
import {
  GroupManagerModule,
  HawkEyeLogModule,
  IpBanManagerModule,
  ItemManagerModule,
  ManageCreditsModule,
  SerialSearchModule,
  TopAccountsModule,
  UserVaultsViewerModule,
} from './components/AdminModules';
import { TopUpAndOpenMuModule } from './components/TopUpAndOpenMuModule';
import { VipModule } from './components/VipModule';
import { ModernLoginPage } from './components/ModernLoginPage';
import {
  Clock,
  Coins,
  Crown,
  Eye,
  FileSearch,
  Globe,
  Home,
  Layers,
  Lock,
  LogOut,
  Package,
  RefreshCw,
  ShieldAlert,
  ShieldBan,
  Trash2,
  TrendingUp,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  Wrench,
} from 'lucide-react';

const STORAGE_KEY = 'open_webshop_react_state_v3';

export default function App() {
  // Core WebShop state
  const [config, setConfig] = useState<WebShopConfig>(DEFAULT_WEBSHOP_CONFIG);
  const [catalog, setCatalog] = useState<WebShopItem[]>(INITIAL_WEBSHOP_ITEMS);
  const [accounts, setAccounts] = useState<AccountData[]>(INITIAL_ACCOUNTS);
  const [currentUsername, setCurrentUsername] = useState<string>('netsplit');
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [groups, setGroups] = useState<ItemGroup[]>(INITIAL_GROUPS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [bans, setBans] = useState<IpBanEntry[]>(INITIAL_BANS);

  // Navigation & UI state
  const [activeModule, setActiveModule] = useState<ModuleId>('home');
  const [lang, setLang] = useState<LanguageCode>('Thai');
  const [classicMode, setClassicMode] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [wCoinCByAccount, setWCoinCByAccount] = useState<Record<string, number>>({
    netsplit: 2450,
    darkknight: 500,
    soulmaster: 300,
  });

  // Cross-module parameters
  const [adminEditUid, setAdminEditUid] = useState<number | null>(null);
  const [adminTargetUser, setAdminTargetUser] = useState<string>('');
  const [targetSerialSearch, setTargetSerialSearch] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load persisted state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.catalog && Array.isArray(parsed.catalog) && parsed.catalog.length > 0) {
          setCatalog(parsed.catalog);
        }
        if (parsed.accounts) setAccounts(parsed.accounts);
        if (parsed.characters) setCharacters(parsed.characters);
        if (parsed.groups) setGroups(parsed.groups);
        if (parsed.logs) setLogs(parsed.logs);
        if (parsed.bans) setBans(parsed.bans);
        if (parsed.currentUsername) setCurrentUsername(parsed.currentUsername);
        if (parsed.lang) setLang(parsed.lang);
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  // Save state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          catalog,
          accounts,
          characters,
          groups,
          logs,
          bans,
          currentUsername,
          lang,
        })
      );
    } catch {
      // ignore quota error
    }
  }, [catalog, accounts, characters, groups, logs, bans, currentUsername, lang]);

  const currentAccount = useMemo(() => {
    return (
      accounts.find(
        (a) => a.username.toLowerCase() === currentUsername.toLowerCase()
      ) || accounts[0]
    );
  }, [accounts, currentUsername]);

  const myCharacters = useMemo(() => {
    return characters.filter(
      (c) => c.accountId.toLowerCase() === currentAccount.username.toLowerCase()
    );
  }, [characters, currentAccount.username]);

  const appendShopLog = (details: string, itemSerial?: string) => {
    setLogs((prev) => [
      {
        id: prev.length + 1,
        accountId: currentAccount.username,
        details,
        dateline: Math.floor(Date.now() / 1000),
        itemSerial,
      },
      ...prev,
    ]);
  };

  const updateCurrentAccount = (updater: (acc: AccountData) => AccountData) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.username.toLowerCase() === currentAccount.username.toLowerCase()
          ? updater(a)
          : a
      )
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const handleAuthSuccess = (clean: string, accountData?: any) => {
    const existing = accounts.find(
      (a) => a.username.toLowerCase() === clean.toLowerCase()
    );
    if (!existing) {
      setAccounts((prev) => [
        ...prev,
        {
          username: clean,
          credits: 1500,
          vaultMoney: 100000000,
          vaultItems: [],
          onlineMinutes: 120,
          exchangedOnlineHours: 0,
          isAdmin: Boolean(accountData?.isAdmin),
          isOnline: false,
        },
      ]);
    }
    if (accountData?.wCoinC !== undefined) {
      setWCoinCByAccount((prev) => ({
        ...prev,
        [clean.toLowerCase()]: accountData.wCoinC,
      }));
    }
    setCurrentUsername(clean);
    showToast(
      `Authenticated as ${clean} (${accountData?.state || 'Normal'}) · Cloudflare Turnstile Verified`
    );
  };

  // --- BUSINESS LOGIC HANDLERS ---

  // 1. Buy Single Item (modules/itemadder.php)
  const handleBuySingleItem = (
    item: WebShopItem,
    level: number,
    option: number,
    luck: boolean,
    skill: boolean,
    exlOptions: boolean[],
    ancientStamina: 0 | 5 | 10,
    fenrirVariant: 0 | 1 | 2 | 3,
    totalCredits: number
  ): { ok: boolean; message: string } => {
    const selectedExCount = exlOptions.filter(Boolean).length;
    if (selectedExCount > 3) {
      return {
        ok: false,
        message: `ไม่สามารถสั่งซื้อไอเทมได้! ระบบจำกัดให้เลือกออปชัน Excellent ได้สูงสุดไม่เกิน 3 ออปชันเท่านั้น (คุณเลือกไว้ ${selectedExCount} ออปชัน)`,
      };
    }
    if (currentAccount.isOnline) {
      return {
        ok: false,
        message: 'The character / account must be offline before adding items to the vault.',
      };
    }
    if (currentAccount.credits < totalCredits) {
      return {
        ok: false,
        message: 'You do not have enough credits to do that.',
      };
    }
    const freeSlot = findFreeVaultSlot(
      currentAccount.vaultItems,
      item.X,
      item.Y
    );
    if (freeSlot === 1337) {
      return {
        ok: false,
        message: 'You do not have free slots in your vault to add this item.',
      };
    }

    const serial = generateSerialHex();
    const newInstance: VaultItemInstance = {
      instanceId: `${serial}_${Date.now()}`,
      serial,
      slotIndex: freeSlot,
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
      ancientStamina,
      fenrirVariant,
      durability: 255,
      paidCredits: totalCredits,
      canSellBack: item.cansellitem === 1,
      purchasedAt: Math.floor(Date.now() / 1000),
    };

    updateCurrentAccount((acc) => ({
      ...acc,
      credits: acc.credits - totalCredits,
      vaultItems: [...acc.vaultItems, newInstance],
    }));

    appendShopLog(
      `Bought ${
        exlOptions.some(Boolean) ? 'Excellent ' : ''
      }${item.name}${level > 0 ? ` +${level}` : ''} (Serial: ${serial}) for ${totalCredits} credits`,
      serial
    );

    showToast(
      `Added ${item.name} (Serial: ${serial}) to Vault Slot #${freeSlot}!`
    );

    return {
      ok: true,
      message: `Successfully added ${item.name} (Serial: ${serial}) to Vault Slot #${freeSlot} (Col ${(freeSlot % 8) + 1}, Row ${Math.floor(freeSlot / 8) + 1})! Charged ${totalCredits.toLocaleString()} credits.`,
    };
  };

  // 2. Buy Group Set (modules/itemadder.php groupid branch)
  const handleBuyGroupSet = (
    group: ItemGroup,
    level: number,
    option: number,
    luck: boolean,
    skill: boolean,
    exlOptions: boolean[],
    ancientStamina: 0 | 5 | 10,
    totalCredits: number
  ): { ok: boolean; message: string } => {
    const selectedExCount = exlOptions.filter(Boolean).length;
    if (selectedExCount > 3) {
      return {
        ok: false,
        message: `ไม่สามารถสั่งซื้อเซ็ตไอเทมได้! ระบบจำกัดให้เลือกออปชัน Excellent ได้สูงสุดไม่เกิน 3 ออปชันเท่านั้น (คุณเลือกไว้ ${selectedExCount} ออปชัน)`,
      };
    }
    if (currentAccount.isOnline) {
      return {
        ok: false,
        message: 'The character / account must be offline before adding set items.',
      };
    }
    if (currentAccount.credits < totalCredits) {
      return {
        ok: false,
        message: 'You do not have enough credits to do that.',
      };
    }

    const memberItems = group.memberUids
      .map((u) => catalog.find((it) => it.uid === u))
      .filter((it): it is WebShopItem => Boolean(it));

    const simulatedVault = [...currentAccount.vaultItems];
    const createdInstances: VaultItemInstance[] = [];

    for (const mItem of memberItems) {
      const slot = findFreeVaultSlot(simulatedVault, mItem.X, mItem.Y);
      if (slot === 1337) {
        return {
          ok: false,
          message: `You do not have enough free slots in your vault for all pieces of ${group.name} (failed at ${mItem.name}).`,
        };
      }
      const serial = generateSerialHex();
      const inst: VaultItemInstance = {
        instanceId: `${serial}_${Date.now()}_${mItem.uid}`,
        serial,
        slotIndex: slot,
        itemUid: mItem.uid,
        itemId: mItem.id,
        itemType: mItem.type,
        name: mItem.name,
        X: mItem.X,
        Y: mItem.Y,
        level: mItem.hasLevel === 1 ? level : 0,
        option: mItem.hasOption === 1 ? option : 0,
        luck: mItem.luck === 1 ? luck : false,
        skill: mItem.skill === 1 ? skill : false,
        exlOptions,
        ancientStamina,
        fenrirVariant: 0,
        durability: 255,
        paidCredits: Math.round(totalCredits / Math.max(1, memberItems.length)),
        canSellBack: false,
        purchasedAt: Math.floor(Date.now() / 1000),
      };
      simulatedVault.push(inst);
      createdInstances.push(inst);
    }

    updateCurrentAccount((acc) => ({
      ...acc,
      credits: acc.credits - totalCredits,
      vaultItems: simulatedVault,
    }));

    appendShopLog(
      `Bought Set Pack "${group.name}" (${createdInstances.length} items) for ${totalCredits} credits`,
      createdInstances[0]?.serial
    );

    showToast(`Added ${group.name} (${createdInstances.length} items) to your Vault!`);

    return {
      ok: true,
      message: `Successfully added all ${createdInstances.length} pieces of ${group.name} to your warehouse vault!`,
    };
  };

  // 3. Refund / Sell Back Item (modules/refund.php)
  const handleRefundItem = (instance: VaultItemInstance) => {
    if (currentAccount.isOnline) {
      showToast('Error: Character / account must be offline to sell back items!');
      return;
    }
    const refundCredits = Math.round(
      instance.paidCredits * config.credits.sellback_Q
    );
    if (!instance.canSellBack || refundCredits < 1) {
      showToast('You are not allowed to resell that item.');
      return;
    }

    updateCurrentAccount((acc) => ({
      ...acc,
      credits: acc.credits + refundCredits,
      vaultItems: acc.vaultItems.filter(
        (it) => it.instanceId !== instance.instanceId
      ),
    }));

    appendShopLog(
      `${currentAccount.username} has sold back ${instance.name} (Serial: ${instance.serial}) for ${refundCredits} credits`,
      instance.serial
    );

    showToast(
      `Sold back ${instance.name} for +${refundCredits.toLocaleString()} credits!`
    );
  };

  // 4. ขอ Reset Point (รีเซ็ตสเตตัสกลับเป็นค่าเริ่มต้นตามสายอาชีพ + คำนวณพอยต์ตามเลเวล + พอยต์เริ่มต้น 300)
  const handleResetCharacterPoints = (charName: string) => {
    const cost = config.credits.reset;
    if (currentAccount.credits < cost) {
      return {
        ok: false,
        message: `เครดิตของคุณไม่เพียงพอ (ต้องการ ${cost.toLocaleString()} Credits)`,
      };
    }
    const targetChar = characters.find(
      (c) => c.name.toLowerCase() === charName.toLowerCase()
    );
    if (!targetChar) {
      return {
        ok: false,
        message: 'ไม่พบตัวละครที่เลือกในระบบ',
      };
    }
    if (targetChar.isOnline || currentAccount.isOnline) {
      return {
        ok: false,
        message: 'ตัวละครและบัญชีต้องอยู่ในสถานะออฟไลน์ (Offline) ก่อนขอ Reset Point',
      };
    }

    const calc = calculateClassStatPoints(targetChar.classCode, targetChar.level);

    setCharacters((prev) =>
      prev.map((c) =>
        c.name.toLowerCase() === charName.toLowerCase()
          ? {
              ...c,
              strength: calc.classDef.baseStr,
              agility: calc.classDef.baseAgi,
              vitality: calc.classDef.baseVit,
              energy: calc.classDef.baseEne,
              command: calc.classDef.baseCmd,
              levelUpPoints: calc.totalPoints,
            }
          : c
      )
    );
    updateCurrentAccount((acc) => ({ ...acc, credits: acc.credits - cost }));
    appendShopLog(
      `Reset Point ตัวละคร ${targetChar.name} (${calc.classDef.name} Lv.${targetChar.level}) รับพอยต์ ${calc.totalPoints.toLocaleString()} พอยต์ (เลเวล ${calc.levelPoints.toLocaleString()} + เริ่มต้น ${calc.startingPoints}) ราคา ${cost} credits`
    );

    showToast(
      `รีเซ็ตพอยต์ ${targetChar.name} สำเร็จ! ได้รับ ${calc.totalPoints.toLocaleString()} พอยต์`
    );

    return {
      ok: true,
      message: `รีเซ็ตสเตตัสของ ${targetChar.name} (${calc.classDef.name}) เรียบร้อยแล้ว! คืนค่าสเตตัสเริ่มต้นและได้รับพอยต์รวมทั้งหมด ${calc.totalPoints.toLocaleString()} พอยต์ (พอยต์เลเวลปกติ ${calc.levelPoints.toLocaleString()} + พอยต์เริ่มต้น ${calc.startingPoints})`,
    };
  };

  // 5. ซื้อตัวละคร เลเวล 400 — เฉพาะ Class 3 เท่านั้น ราคา 500 Credits (คำนวณเฉพาะพอยต์เลเวล + 300 ครั้งแรก ไม่รวมเควส 150 [+20] และเควส 220 [+180])
  const handleBuyCharacter400 = (charName: string, classCode: MuClassCode) => {
    const cleanName = charName.trim();
    if (cleanName.length < 2 || cleanName.length > 10) {
      return {
        ok: false,
        message: 'ชื่อตัวละครต้องมีความยาวระหว่าง 2 ถึง 10 ตัวอักษร',
      };
    }
    if (
      characters.some((c) => c.name.toLowerCase() === cleanName.toLowerCase())
    ) {
      return {
        ok: false,
        message: `ชื่อตัวละคร "${cleanName}" มีอยู่ในระบบแล้ว กรุณาตั้งชื่ออื่น`,
      };
    }

    const calc = calculateClassStatPoints(classCode, 400);
    if (!calc.classDef.s3) {
      return {
        ok: false,
        message: 'ระบบอนุญาตให้ซื้อเฉพาะสายอาชีพ Class 3 เท่านั้น (Grand Master, Blade Master, High Elf, Duel Master, Lord Emperor)',
      };
    }

    const cost = BUY_CHAR_400_CREDITS; // 500 Credits
    if (currentAccount.credits < cost) {
      return {
        ok: false,
        message: `เครดิตของคุณไม่เพียงพอสำหรับการซื้อตัวละคร Class 3 Lv.400 (ต้องการ ${cost.toLocaleString()} Credits)`,
      };
    }
    if (currentAccount.isOnline) {
      return {
        ok: false,
        message: 'บัญชีต้องอยู่ในสถานะออฟไลน์ (Offline) ก่อนซื้อตัวละครใหม่',
      };
    }

    const newChar: Character = {
      name: cleanName,
      accountId: currentAccount.username,
      classCode: calc.classDef.code,
      classId: calc.classDef.id,
      level: 400,
      resets: 0,
      levelUpPoints: calc.totalPoints,
      strength: calc.classDef.baseStr,
      agility: calc.classDef.baseAgi,
      vitality: calc.classDef.baseVit,
      energy: calc.classDef.baseEne,
      command: calc.classDef.baseCmd,
      money: 50_000_000,
      ctlCode: 0,
      isOnline: false,
    };

    setCharacters((prev) => [...prev, newChar]);
    updateCurrentAccount((acc) => ({
      ...acc,
      credits: acc.credits - cost,
    }));

    appendShopLog(
      `ซื้อตัวละครใหม่ Class 3 Lv.400 "${cleanName}" อาชีพ ${calc.classDef.name} พร้อมพอยต์ ${calc.totalPoints.toLocaleString()} พอยต์ (เลเวล ${calc.levelPoints.toLocaleString()} + เริ่มต้น 300) ราคา ${cost} credits`
    );

    showToast(
      `สร้างตัวละคร ${cleanName} (${calc.classDef.name} Lv.400) พร้อมพอยต์ ${calc.totalPoints.toLocaleString()} สำเร็จ!`
    );

    return {
      ok: true,
      message: `ซื้อตัวละคร "${cleanName}" อาชีพ ${calc.classDef.name} (Class 3 · Level 400) ราคา ${cost} Credits สำเร็จ! ได้รับพอยต์พร้อมอัปทันที ${calc.totalPoints.toLocaleString()} พอยต์ (พอยต์เลเวลปกติ ${calc.levelPoints.toLocaleString()} + พอยต์ชุดแรก ${calc.startingPoints} · ยังไม่รวมเควสเปลี่ยนอาชีพ +20 และเควส 220 อีก +180)`,
    };
  };

  // 6. ลบตัวละคร เลเวล 400 ได้รับ +300 Credits
  const handleDeleteCharacter400 = (charName: string) => {
    if (currentAccount.isOnline) {
      return {
        ok: false,
        message: 'บัญชีต้องอยู่ในสถานะออฟไลน์ (Offline) ก่อนลบตัวละคร',
      };
    }

    const targetChar = characters.find(
      (c) =>
        c.name.toLowerCase() === charName.toLowerCase() &&
        c.accountId.toLowerCase() === currentAccount.username.toLowerCase()
    );

    if (!targetChar) {
      return {
        ok: false,
        message: 'ไม่พบตัวละครนี้ในบัญชีของคุณ',
      };
    }
    if (targetChar.isOnline) {
      return {
        ok: false,
        message: 'ตัวละครต้องอยู่ในสถานะออฟไลน์ (Offline) ก่อนลบ',
      };
    }
    if (targetChar.ctlCode !== 0) {
      return {
        ok: false,
        message: 'ไม่สามารถลบตัวละครที่ติดสถานะแบนได้',
      };
    }
    if (targetChar.level !== 400) {
      return {
        ok: false,
        message: `ตัวละคร "${targetChar.name}" มีเลเวล ${targetChar.level} (ต้องเป็นตัวละคร Level 400 เท่านั้นจึงจะลบแลกรับ ${DELETE_CHAR_400_REWARD_CREDITS} Credits ได้)`,
      };
    }

    const reward = DELETE_CHAR_400_REWARD_CREDITS; // 300 Credits
    setCharacters((prev) =>
      prev.filter((c) => c.name.toLowerCase() !== charName.toLowerCase())
    );
    updateCurrentAccount((acc) => ({
      ...acc,
      credits: acc.credits + reward,
    }));

    appendShopLog(
      `ลบตัวละคร Lv.400 "${targetChar.name}" ได้รับเครดิต +${reward} Credits`
    );

    showToast(
      `ลบตัวละคร ${targetChar.name} (Lv.400) สำเร็จ! ได้รับ +${reward} Credits`
    );

    return {
      ok: true,
      message: `ลบตัวละคร "${targetChar.name}" (Level 400) สำเร็จ! คุณได้รับเครดิต +${reward.toLocaleString()} Credits เข้าบัญชีเรียบร้อยแล้ว`,
    };
  };

  // 7. ระบบออนไลน์แลกเครดิต (1 ชั่วโมง = 5 Credits)
  const handleRedeemOnlineHours = (hoursToRedeem: number) => {
    const availableHours = Math.floor((currentAccount.onlineMinutes || 0) / 60);
    if (availableHours < 1) {
      return {
        ok: false,
        message: 'คุณยังไม่มีเวลาออนไลน์สะสมครบ 1 ชั่วโมง (60 นาที) สำหรับแลกเครดิต',
      };
    }
    const validHours = Math.max(1, Math.min(hoursToRedeem, availableHours));
    const minutesToDeduct = validHours * 60;
    const creditsEarned = validHours * ONLINE_HOUR_REWARD_CREDITS; // 5 Credits / hr

    updateCurrentAccount((acc) => ({
      ...acc,
      credits: acc.credits + creditsEarned,
      onlineMinutes: Math.max(0, (acc.onlineMinutes || 0) - minutesToDeduct),
      exchangedOnlineHours: (acc.exchangedOnlineHours || 0) + validHours,
    }));

    appendShopLog(
      `แลกเวลาออนไลน์ ${validHours} ชั่วโมง (${minutesToDeduct} นาที) ได้รับ +${creditsEarned} Credits`
    );

    showToast(
      `แลกเวลาออนไลน์ ${validHours} ชม. สำเร็จ! ได้รับ +${creditsEarned} Credits`
    );

    return {
      ok: true,
      message: `แลกเวลาออนไลน์จำนวน ${validHours} ชั่วโมง (${minutesToDeduct} นาที) สำเร็จ! คุณได้รับ +${creditsEarned.toLocaleString()} Credits (อัตรา 1 ชม. = ${ONLINE_HOUR_REWARD_CREDITS} Credits)`,
    };
  };

  const handleSimulateAddOnlineMinutes = (minutes: number) => {
    updateCurrentAccount((acc) => ({
      ...acc,
      onlineMinutes: (acc.onlineMinutes || 0) + minutes,
    }));
  };

  // 8. Add Points (modules/points.php)
  const handleAddPoints = (charName: string, pts: number) => {
    if (pts < config.credits.points) {
      return {
        ok: false,
        message: `You cannot add less points than: ${config.credits.points}`,
      };
    }
    const rqcreds = Math.ceil(pts / config.credits.points);
    if (currentAccount.credits < rqcreds) {
      return { ok: false, message: 'You do not have enough credits to do that.' };
    }
    const targetChar = characters.find(
      (c) => c.name.toLowerCase() === charName.toLowerCase()
    );
    if (!targetChar) {
      return { ok: false, message: 'The character you have chosen does not exist.' };
    }
    if (targetChar.isOnline || currentAccount.isOnline) {
      return { ok: false, message: 'The character must be offline.' };
    }

    setCharacters((prev) =>
      prev.map((c) =>
        c.name.toLowerCase() === charName.toLowerCase()
          ? { ...c, levelUpPoints: c.levelUpPoints + pts }
          : c
      )
    );
    updateCurrentAccount((acc) => ({ ...acc, credits: acc.credits - rqcreds }));
    appendShopLog(
      `Bought ${pts} point(s) on ${targetChar.name} for ${rqcreds} credits`
    );

    return {
      ok: true,
      message: `Points (+${pts.toLocaleString()}) added to character ${targetChar.name}! You were charged ${rqcreds.toLocaleString()} credits.`,
    };
  };

  // 9. ซื้อเงิน Zen เข้าคลัง: 50 Credits = 500M Zen (ตรวจสอบในคลังต้องรวมกันไม่เกิน 900M)
  const handleBuyWarehouseZen = () => {
    if (currentAccount.isOnline) {
      return {
        ok: false,
        message: 'บัญชีต้องอยู่ในสถานะออฟไลน์ (Offline) ก่อนซื้อเงิน Zen เข้าคลัง',
      };
    }
    if (currentAccount.credits < ZEN_PURCHASE_CREDITS) {
      return {
        ok: false,
        message: `เครดิตของคุณไม่เพียงพอ (ต้องการ ${ZEN_PURCHASE_CREDITS} Credits สำหรับ 500M Zen)`,
      };
    }

    const projectedZen = currentAccount.vaultMoney + ZEN_PURCHASE_AMOUNT;
    if (projectedZen > WAREHOUSE_ZEN_MAX_LIMIT) {
      return {
        ok: false,
        message: `ไม่สามารถซื้อเงิน Zen ได้! เงินในคลังปัจจุบัน (${currentAccount.vaultMoney.toLocaleString()} Zen) รวมกับ 500,000,000 Zen จะเป็น ${projectedZen.toLocaleString()} Zen ซึ่งเกินเงื่อนไขสูงสุดในคลัง 900,000,000 Zen (900M)`,
      };
    }

    updateCurrentAccount((acc) => ({
      ...acc,
      credits: acc.credits - ZEN_PURCHASE_CREDITS,
      vaultMoney: acc.vaultMoney + ZEN_PURCHASE_AMOUNT,
    }));

    appendShopLog(
      `ซื้อเงิน Zen 500,000,000 (500M) เข้าคลังด้วย ${ZEN_PURCHASE_CREDITS} Credits (ยอดในคลังรวม: ${projectedZen.toLocaleString()} Zen)`
    );

    showToast(
      `ซื้อ +500M Zen สำเร็จ! ยอด Zen ในคลังปัจจุบัน: ${projectedZen.toLocaleString()} Zen`
    );

    return {
      ok: true,
      message: `ซื้อเงิน +500,000,000 Zen (500M) ด้วย ${ZEN_PURCHASE_CREDITS} Credits สำเร็จ! เงินในคลังของคุณเพิ่มขึ้นเป็น ${projectedZen.toLocaleString()} / ${WAREHOUSE_ZEN_MAX_LIMIT.toLocaleString()} Zen`,
    };
  };

  const handleTransferVaultZenToChar = (charName: string, amount: number) => {
    if (currentAccount.vaultMoney < amount) {
      return {
        ok: false,
        message: `เงิน Zen ในคลังของคุณมีไม่ถึง ${amount.toLocaleString()} Zen`,
      };
    }
    const targetChar = characters.find(
      (c) => c.name.toLowerCase() === charName.toLowerCase()
    );
    if (!targetChar) {
      return { ok: false, message: 'ไม่พบตัวละครที่ต้องการรับเงิน Zen' };
    }

    updateCurrentAccount((acc) => ({
      ...acc,
      vaultMoney: acc.vaultMoney - amount,
    }));
    setCharacters((prev) =>
      prev.map((c) =>
        c.name.toLowerCase() === charName.toLowerCase()
          ? { ...c, money: c.money + amount }
          : c
      )
    );

    showToast(
      `โอน ${(amount / 1_000_000).toFixed(0)}M Zen จากคลังเข้าตัวละคร ${targetChar.name} สำเร็จ!`
    );

    return {
      ok: true,
      message: `โอนเงิน ${amount.toLocaleString()} Zen จากคลังเข้าตัวละคร ${targetChar.name} เรียบร้อยแล้ว (ยอดคงเหลือในคลัง: ${(currentAccount.vaultMoney - amount).toLocaleString()} Zen)`,
    };
  };

  // 10. Change Class (modules/class.php)
  const handleChangeClass = (charName: string, newClass: MuClassCode) => {
    const cost = config.credits.classchg;
    if (currentAccount.credits < cost) {
      return { ok: false, message: 'You do not have enough credits to do that.' };
    }
    const targetChar = characters.find(
      (c) => c.name.toLowerCase() === charName.toLowerCase()
    );
    if (!targetChar) {
      return { ok: false, message: 'The character you have chosen does not exist.' };
    }
    if (targetChar.isOnline || currentAccount.isOnline) {
      return { ok: false, message: 'The character must be offline.' };
    }
    if (targetChar.classCode === newClass) {
      return { ok: false, message: "That's the same as your current class." };
    }
    const classDef = MU_CLASSES.find((m) => m.code === newClass);
    if (!classDef) return { ok: false, message: 'Invalid class specified.' };

    setCharacters((prev) =>
      prev.map((c) =>
        c.name.toLowerCase() === charName.toLowerCase()
          ? { ...c, classCode: newClass, classId: classDef.id }
          : c
      )
    );
    updateCurrentAccount((acc) => ({ ...acc, credits: acc.credits - cost }));
    appendShopLog(
      `Changed character class of ${targetChar.name} to ${classDef.name} for ${cost} credits`
    );

    return {
      ok: true,
      message: `${targetChar.name}'s class was successfully changed to ${classDef.name}!`,
    };
  };

  // 11. Change Character Name (modules/charname.php)
  const handleChangeName = (oldName: string, newName: string) => {
    if (newName.length < 2 || newName.length > 10) {
      return {
        ok: false,
        message: 'The new character name does not match the length specifications (2–10 chars).',
      };
    }
    if (currentAccount.credits < config.credits.namechg) {
      return { ok: false, message: 'You do not have enough credits to do that.' };
    }
    if (
      characters.some((c) => c.name.toLowerCase() === newName.toLowerCase())
    ) {
      return {
        ok: false,
        message: 'A character with that name already exists, please select another one.',
      };
    }
    const targetChar = characters.find(
      (c) => c.name.toLowerCase() === oldName.toLowerCase()
    );
    if (!targetChar) {
      return { ok: false, message: 'The character you have chosen does not exist.' };
    }
    if (targetChar.isOnline || currentAccount.isOnline) {
      return { ok: false, message: 'The character must be offline.' };
    }

    setCharacters((prev) =>
      prev.map((c) =>
        c.name.toLowerCase() === oldName.toLowerCase()
          ? { ...c, name: newName }
          : c
      )
    );
    updateCurrentAccount((acc) => ({
      ...acc,
      credits: acc.credits - config.credits.namechg,
    }));
    appendShopLog(`The character ${oldName} changed his name to ${newName}`);

    return {
      ok: true,
      message: `Your character name has been successfully changed from ${oldName} to ${newName}!`,
    };
  };

  // 12. Unban Character (modules/unban.php)
  const handleUnbanCharacter = (charName: string) => {
    if (currentAccount.credits < config.credits.unbanchar) {
      return { ok: false, message: 'You do not have enough credits to do that.' };
    }
    const solidList = config.misc.solidbans
      .split(',')
      .map((s) => s.trim().toLowerCase());
    if (solidList.includes(charName.toLowerCase())) {
      return {
        ok: false,
        message:
          'This character is in the forbidden unban list and his freedom cannot be bought from here.',
      };
    }
    const targetChar = characters.find(
      (c) => c.name.toLowerCase() === charName.toLowerCase()
    );
    if (!targetChar || targetChar.ctlCode !== config.misc.bannedcode) {
      return {
        ok: false,
        message: 'The character you have specified is not on the banlist.',
      };
    }

    setCharacters((prev) =>
      prev.map((c) =>
        c.name.toLowerCase() === charName.toLowerCase()
          ? { ...c, ctlCode: 0 }
          : c
      )
    );
    updateCurrentAccount((acc) => ({
      ...acc,
      credits: acc.credits - config.credits.unbanchar,
    }));
    appendShopLog(`Paid to unban the character: ${targetChar.name}`);

    return {
      ok: true,
      message: `${targetChar.name} has been unbanned!`,
    };
  };

  // Buy / Extend VIP Membership (800 Credits / month = 30 days)
  const handleBuyVip = (months: number = 1): { ok: boolean; message: string } => {
    const VIP_MONTHLY_COST = 800;
    const totalCost = months * VIP_MONTHLY_COST;
    const daysToAdd = months * 30;

    if (currentAccount.credits < totalCost) {
      const msg =
        lang === 'Thai'
          ? `เครดิตของคุณไม่เพียงพอ! ต้องการ ${totalCost.toLocaleString()} Credits (ปัจจุบันมี ${currentAccount.credits.toLocaleString()} Credits)`
          : lang === 'Portuguese_BR'
          ? `Créditos insuficientes! Necessário ${totalCost.toLocaleString()} Créditos.`
          : lang === 'Russian'
          ? `Недостаточно кредитов! Требуется ${totalCost.toLocaleString()} кредитов.`
          : lang === 'Spanish'
          ? `¡Créditos insuficientes! Se requieren ${totalCost.toLocaleString()} créditos.`
          : lang === 'Bulgarian'
          ? `Недостатъчно кредити! Нужни са ${totalCost.toLocaleString()} кредита.`
          : `Insufficient credits! You need ${totalCost.toLocaleString()} credits.`;
      return { ok: false, message: msg };
    }

    const now = new Date();
    const currentExpiry = currentAccount.vipUntil ? new Date(currentAccount.vipUntil) : null;
    const baseDate = currentExpiry && currentExpiry > now ? currentExpiry : now;
    const newExpiry = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    const newExpiryIso = newExpiry.toISOString();

    updateCurrentAccount((acc) => ({
      ...acc,
      credits: acc.credits - totalCost,
      vipUntil: newExpiryIso,
    }));

    const logText = `สมัคร/ต่ออายุสมาชิก VIP ${daysToAdd} วัน ด้วย ${totalCost.toLocaleString()} Credits (หมดอายุ: ${newExpiry.toLocaleDateString()})`;
    appendShopLog(logText);

    const toastMsg =
      lang === 'Thai'
        ? `สมัคร VIP สำเร็จ (+${daysToAdd} วัน) EXP +30% & Drop +20%! หมดอายุ: ${newExpiry.toLocaleDateString('th-TH')}`
        : `VIP activated (+${daysToAdd} days) with +30% EXP & +20% Drop! Valid until ${newExpiry.toLocaleDateString()}`;
    showToast(toastMsg);

    const returnMsg =
      lang === 'Thai'
        ? `สมัคร/ต่ออายุสมาชิก VIP ${daysToAdd} วัน เรียบร้อยแล้ว! หัก ${totalCost.toLocaleString()} Credits สมาชิก VIP มีอายุถึง ${newExpiry.toLocaleString('th-TH')} (เข้าห้อง VIP Sub-Server 2 รับโบนัส EXP +30% และ Drop +20%)`
        : `VIP Membership successfully extended by ${daysToAdd} days! Charged ${totalCost.toLocaleString()} credits. Valid until ${newExpiry.toLocaleString()}. Enjoy +30% EXP & +20% Drop rates in VIP Room 2!`;

    return {
      ok: true,
      message: returnMsg,
    };
  };

  // Reset Demo Data helper
  const handleResetDemo = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConfig(DEFAULT_WEBSHOP_CONFIG);
    setCatalog(INITIAL_WEBSHOP_ITEMS);
    setAccounts(INITIAL_ACCOUNTS);
    setCharacters(INITIAL_CHARACTERS);
    setGroups(INITIAL_GROUPS);
    setLogs(INITIAL_LOGS);
    setBans(INITIAL_BANS);
    setCurrentUsername('netsplit');
    showToast('Reset Open-Webshop state to factory defaults.');
  };

  // Admin Action Handlers
  const handleAdminDeleteVaultItem = (
    username: string,
    instanceId: string,
    serial: string
  ) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.username.toLowerCase() === username.toLowerCase()) {
          return {
            ...acc,
            vaultItems: acc.vaultItems.filter(
              (it) => it.instanceId !== instanceId && it.serial !== serial
            ),
          };
        }
        return acc;
      })
    );
    appendShopLog(
      `Admin deleted item (Serial: ${serial}) from ${username}'s vault`,
      serial
    );
    showToast(
      lang === 'Thai'
        ? `ลบไอเทม Serial: ${serial} จากคลังของ ${username} สำเร็จ`
        : `Deleted item (Serial: ${serial}) from ${username}'s vault`
    );
  };

  const handleAdminAdjustVaultZen = (username: string, amount: number) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.username.toLowerCase() === username.toLowerCase()) {
          return {
            ...acc,
            vaultMoney: Math.min(
              config.limit.zen_limit,
              Math.max(0, acc.vaultMoney + amount)
            ),
          };
        }
        return acc;
      })
    );
    appendShopLog(
      `Admin adjusted ${username}'s vault Zen by ${amount >= 0 ? `+${amount.toLocaleString()}` : amount.toLocaleString()}`
    );
    showToast(
      lang === 'Thai'
        ? `ปรับยอดเงิน Zen ในคลังของ ${username} ${amount >= 0 ? `+${amount.toLocaleString()}` : amount.toLocaleString()} สำเร็จ`
        : `Adjusted ${username}'s vault Zen by ${amount >= 0 ? `+${amount.toLocaleString()}` : amount.toLocaleString()}`
    );
  };

  const handleAdminClearLogs = () => {
    setLogs([]);
    appendShopLog('Admin cleared all audit shop logs');
    showToast(
      lang === 'Thai'
        ? 'ล้างประวัติการทำรายการในร้านค้าทั้งหมดเรียบร้อยแล้ว'
        : 'All WebShop logs have been cleared.'
    );
  };

  const navMenuPlayer: {
    id: ModuleId;
    translationKey: import('./translations').TranslationKey;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'home',
      translationKey: 'nav_home',
      icon: <Home className="w-3.5 h-3.5" />,
    },
    {
      id: 'login',
      translationKey: 'nav_login',
      icon: <Lock className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      id: 'items',
      translationKey: 'nav_items',
      icon: <Package className="w-3.5 h-3.5" />,
    },
    {
      id: 'resets',
      translationKey: 'nav_resets',
      icon: <RefreshCw className="w-3.5 h-3.5" />,
    },
    {
      id: 'buychar',
      translationKey: 'nav_buychar',
      icon: <UserPlus className="w-3.5 h-3.5" />,
    },
    {
      id: 'delchar',
      translationKey: 'nav_delchar',
      icon: <Trash2 className="w-3.5 h-3.5" />,
    },
    {
      id: 'onlinereward',
      translationKey: 'nav_onlinereward',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    {
      id: 'getzen',
      translationKey: 'nav_zen',
      icon: <Coins className="w-3.5 h-3.5" />,
    },
    {
      id: 'charnamechg',
      translationKey: 'nav_charname',
      icon: <UserCheck className="w-3.5 h-3.5" />,
    },
    {
      id: 'unban',
      translationKey: 'nav_unban',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
    },
    {
      id: 'howto',
      translationKey: 'nav_topup',
      icon: <Coins className="w-3.5 h-3.5" />,
    },
    {
      id: 'vip',
      translationKey: 'nav_vip',
      icon: <Crown className="w-3.5 h-3.5 text-amber-400" />,
    },
  ];

  const navMenuAdmin: {
    id: ModuleId;
    translationKey: import('./translations').TranslationKey;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'im',
      translationKey: 'nav_admin_im',
      icon: <Wrench className="w-3.5 h-3.5" />,
    },
    {
      id: 'groupmngr',
      translationKey: 'nav_admin_group',
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: 'u_credits',
      translationKey: 'nav_admin_credits',
      icon: <Coins className="w-3.5 h-3.5" />,
    },
    {
      id: 'log',
      translationKey: 'nav_admin_logs',
      icon: <FileSearch className="w-3.5 h-3.5" />,
    },
    {
      id: 'search',
      translationKey: 'nav_admin_search',
      icon: <FileSearch className="w-3.5 h-3.5" />,
    },
    {
      id: 'thetop',
      translationKey: 'nav_admin_top',
      icon: <Trophy className="w-3.5 h-3.5" />,
    },
    {
      id: 'whviewer',
      translationKey: 'nav_admin_wh',
      icon: <Eye className="w-3.5 h-3.5" />,
    },
    {
      id: 'ipbanish',
      translationKey: 'nav_admin_bans',
      icon: <ShieldBan className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col ${
        classicMode
          ? 'classic-theme bg-[#CCCCCC] text-zinc-900'
          : 'bg-[#0b0d13] text-zinc-100'
      }`}
    >
      {/* Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (5 concise links) — Zone 3 (1 primary action) */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-zinc-800 bg-[#090b10]">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            setActiveModule('home');
          }}
          className="text-lg font-display font-bold tracking-wider text-amber-400 whitespace-nowrap shrink-0"
        >
          OPEN-WEBSHOP
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
          <button
            type="button"
            onClick={() => setActiveModule('home')}
            className={`hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeModule === 'home' ? 'text-amber-400 underline' : ''
            }`}
          >
            {t('nav_home', lang)}
          </button>
          <button
            type="button"
            onClick={() => setActiveModule('items')}
            className={`hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeModule === 'items' ? 'text-amber-400 underline' : ''
            }`}
          >
            {t('nav_items', lang)}
          </button>
          <button
            type="button"
            onClick={() => setActiveModule('resets')}
            className={`hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeModule === 'resets' ? 'text-amber-400 underline' : ''
            }`}
          >
            {t('nav_resets', lang)}
          </button>
          <button
            type="button"
            onClick={() => setActiveModule('buychar')}
            className={`hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeModule === 'buychar' ? 'text-amber-400 underline' : ''
            }`}
          >
            {t('nav_buychar', lang)}
          </button>
          <button
            type="button"
            onClick={() => setActiveModule('onlinereward')}
            className={`hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeModule === 'onlinereward' ? 'text-amber-400 underline' : ''
            }`}
          >
            {t('nav_onlinereward', lang)}
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveModule('howto')}
            className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 rounded hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {currentAccount.credits.toLocaleString()} Credits ·{' '}
            {t('nav_topup', lang)}
          </button>
        </div>
      </header>

      {/* Secondary Workspace Status & Language/Account Bar */}
      <div className="px-6 py-2.5 border-b border-zinc-800/80 bg-zinc-900/90 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3 text-zinc-300">
          <span>
            {t('logged_in_as', lang)}{' '}
            <strong className="text-white font-semibold">
              {currentAccount.username}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-tabular">
            {t('credits', lang)}{' '}
            <strong className="text-amber-400">
              {currentAccount.credits.toLocaleString()}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-tabular">
            {t('vault_zen', lang)}{' '}
            <strong className="text-zinc-100">
              {currentAccount.vaultMoney.toLocaleString()} / 900,000,000
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-tabular">
            {t('online_time', lang)}{' '}
            <strong className="text-emerald-400">
              {Math.floor((currentAccount.onlineMinutes || 0) / 60)}h{' '}
              {(currentAccount.onlineMinutes || 0) % 60}m
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          {currentAccount.vipUntil && new Date(currentAccount.vipUntil) > new Date() ? (
            <button
              type="button"
              onClick={() => setActiveModule('vip')}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold hover:bg-amber-500/30 transition-colors cursor-pointer"
              title="VIP Member: +30% EXP & +20% Drop in VIP Sub-Server 2"
            >
              <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>
                VIP ({Math.max(1, Math.ceil((new Date(currentAccount.vipUntil).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))}d)
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveModule('vip')}
              className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
            >
              <Crown className="w-3 h-3 text-amber-400" />
              <span>{lang === 'Thai' ? 'สมัคร VIP (800Cr)' : 'Buy VIP (800Cr)'}</span>
            </button>
          )}
        </div>

        {/* Workspace Controls: Account Switcher, Offline Toggle, Language, Classic Savoy Skin */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Online/Offline Status Toggle for testing offline requirement */}
          <button
            type="button"
            onClick={() =>
              updateCurrentAccount((acc) => ({
                ...acc,
                isOnline: !acc.isOnline,
              }))
            }
            className={`px-2.5 py-1 rounded border text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
              currentAccount.isOnline
                ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                : 'border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800'
            }`}
            title="Open-Webshop requires characters/vaults to be offline in-game before modifying items or stats"
          >
            {t('ingame_status', lang)}{' '}
            {currentAccount.isOnline
              ? t('status_online', lang)
              : t('status_offline', lang)}
          </button>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-700 rounded px-2 py-1">
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LanguageCode)}
              className="bg-transparent text-[11px] text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="Thai" className="bg-zinc-900">
                ภาษาไทย (Thai)
              </option>
              <option value="Portuguese_BR" className="bg-zinc-900">
                Português (Brasil)
              </option>
              <option value="English" className="bg-zinc-900">
                English
              </option>
              <option value="Bulgarian" className="bg-zinc-900">
                Bulgarian
              </option>
              <option value="Spanish" className="bg-zinc-900">
                Spanish
              </option>
              <option value="Russian" className="bg-zinc-900">
                Russian
              </option>
            </select>
          </div>

          {/* Classic Savoy Skin Toggle */}
          <button
            type="button"
            onClick={() => setClassicMode(!classicMode)}
            className="px-2.5 py-1 rounded border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-[11px] text-zinc-300 cursor-pointer whitespace-nowrap"
          >
            {classicMode ? 'Dark Fantasy Theme' : 'Classic v0.9 Vault Grid'}
          </button>

          {/* Switch Account / Login Modal Trigger */}
          <button
            type="button"
            onClick={() => setLoginModalOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-[11px] text-amber-400 cursor-pointer whitespace-nowrap"
          >
            <LogOut className="w-3 h-3" />
            {t('switch_account', lang)}
          </button>

          <button
            type="button"
            onClick={handleResetDemo}
            className="px-2 py-1 rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-[11px] text-zinc-400 cursor-pointer whitespace-nowrap"
          >
            {t('reset_demo', lang)}
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded border border-amber-500/50 bg-zinc-950/95 text-amber-300 text-xs font-medium shadow-2xl">
          {toastMessage}
        </div>
      )}

      {/* Main Two-Column Layout matching Open-Webshop's Left Menu + Content Area */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto flex flex-col md:flex-row gap-6 p-6">
        {/* Left Navigation Menu */}
        <aside className="w-full md:w-60 shrink-0 space-y-4">
          <div className="rounded border border-zinc-800 bg-zinc-900/90 overflow-hidden">
            <div className="px-3.5 py-2.5 bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              {t('nav_player_menu', lang)}
            </div>
            <div className="p-1.5 space-y-0.5">
              {navMenuPlayer.map((item) => {
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveModule(item.id)}
                    className={`w-full px-3 py-2 rounded text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-amber-500 text-zinc-950 font-semibold'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className="truncate">
                      {t(item.translationKey, lang)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin Menu */}
          <div className="rounded border border-zinc-800 bg-zinc-900/90 overflow-hidden">
            <div className="px-3.5 py-2.5 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                {t('nav_admin_menu', lang)}
              </span>
              {!currentAccount.isAdmin && (
                <button
                  type="button"
                  onClick={() =>
                    updateCurrentAccount((a) => ({ ...a, isAdmin: true }))
                  }
                  className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                >
                  Enable Admin
                </button>
              )}
            </div>
            <div className="p-1.5 space-y-0.5">
              {navMenuAdmin.map((item) => {
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveModule(item.id)}
                    className={`w-full px-3 py-2 rounded text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-emerald-500 text-zinc-950 font-semibold'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className="truncate">
                      {t(item.translationKey, lang)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Module Viewport */}
        <main className="flex-1 min-w-0">
          {activeModule === 'login' && (
            <ModernLoginPage
              lang={lang}
              presetAccounts={accounts}
              onLoginSuccess={(clean, data) => {
                handleAuthSuccess(clean, data);
                setActiveModule('home');
              }}
            />
          )}

          {activeModule === 'home' && (
            <div className="space-y-6">
              {/* Top Summary Row: My Shop + My Characters */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* My Shop Card */}
                <div className="lg:col-span-4 p-5 rounded border border-zinc-800 bg-zinc-900/80 space-y-3">
                  <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider border-b border-zinc-800 pb-2">
                    {t('my_shop', lang)}
                  </h2>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">
                        {t('logged_in_as', lang)}
                      </span>
                      <span className="font-bold text-white">
                        {currentAccount.username}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">
                        {t('credits', lang)}
                      </span>
                      <span className="font-mono-tabular font-bold text-amber-400">
                        {currentAccount.credits.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">
                        {t('vault_zen', lang)} (Max 900M)
                      </span>
                      <span className="font-mono-tabular font-semibold text-zinc-200">
                        {currentAccount.vaultMoney.toLocaleString()} Zen
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">
                        {t('online_time', lang)} (1h = 5Cr)
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveModule('onlinereward')}
                        className="font-mono-tabular font-semibold text-emerald-400 hover:underline cursor-pointer"
                      >
                        {Math.floor((currentAccount.onlineMinutes || 0) / 60)}h{' '}
                        {(currentAccount.onlineMinutes || 0) % 60}m →
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        VIP Status:
                      </span>
                      {currentAccount.vipUntil && new Date(currentAccount.vipUntil) > new Date() ? (
                        <button
                          type="button"
                          onClick={() => setActiveModule('vip')}
                          className="font-mono-tabular font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 hover:underline cursor-pointer text-[11px]"
                        >
                          VIP Active ({Math.ceil((new Date(currentAccount.vipUntil).getTime() - Date.now()) / (24 * 60 * 60 * 1000))}d) →
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveModule('vip')}
                          className="text-amber-400 hover:underline font-medium cursor-pointer text-xs"
                        >
                          {lang === 'Thai' ? 'สมัคร VIP (800Cr) →' : 'Buy VIP (800Cr) →'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveModule('items')}
                      className="flex-1 py-2 px-3 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {t('btn_buy_items', lang)}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModule('buychar')}
                      className="flex-1 py-2 px-3 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {t('btn_buy_char400', lang)}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModule('howto')}
                      className="w-full py-2 px-3 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {t('btn_topup', lang)}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModule('vip')}
                      className="w-full py-2 px-3 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{t('btn_buy_vip', lang)} (800 Cr/ด. · EXP +30% & Drop +20%)</span>
                    </button>
                  </div>
                </div>

                {/* Account Characters Roster */}
                <div className="lg:col-span-8 p-5 rounded border border-zinc-800 bg-zinc-900/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                      {t('account_characters', lang)}
                    </h2>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveModule('resets')}
                        className="text-xs text-amber-400 hover:underline cursor-pointer"
                      >
                        {t('nav_resets', lang)} →
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveModule('delchar')}
                        className="text-xs text-rose-400 hover:underline cursor-pointer"
                      >
                        {t('nav_delchar', lang)} →
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-zinc-400 border-b border-zinc-800/80">
                        <tr>
                          <th className="py-2 pr-3">
                            {t('table_name', lang)}
                          </th>
                          <th className="py-2 px-3">
                            {t('table_class', lang)}
                          </th>
                          <th className="py-2 px-3 text-center">
                            {t('table_level', lang)}
                          </th>
                          <th className="py-2 px-3 text-right">
                            {t('table_stats', lang)}
                          </th>
                          <th className="py-2 px-3 text-right">
                            {t('table_free_pts', lang)}
                          </th>
                          <th className="py-2 pl-3 text-right">
                            {t('table_action', lang)}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {myCharacters.map((ch) => {
                          const cls = MU_CLASSES.find(
                            (m) => m.code === ch.classCode
                          );
                          return (
                            <tr key={ch.name}>
                              <td className="py-2 pr-3 font-bold text-white">
                                {ch.name}
                              </td>
                              <td className="py-2 px-3 text-zinc-300">
                                {cls?.name || ch.classCode}{' '}
                                <span className="text-[10px] text-amber-400 font-mono-tabular">
                                  ({cls?.pointsPerLevel || 5}pt/lv)
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center font-mono-tabular text-amber-400 font-bold">
                                Lv.{ch.level}
                              </td>
                              <td className="py-2 px-3 text-right font-mono-tabular text-zinc-300 text-[11px]">
                                {ch.strength}/{ch.agility}/{ch.vitality}/{ch.energy}
                                {ch.command > 0 ? `/${ch.command}` : ''}
                              </td>
                              <td className="py-2 px-3 text-right font-mono-tabular text-emerald-400 font-bold">
                                {ch.levelUpPoints.toLocaleString()}
                              </td>
                              <td className="py-2 pl-3 text-right">
                                {ch.ctlCode === 1 ? (
                                  <button
                                    type="button"
                                    onClick={() => setActiveModule('unban')}
                                    className="text-rose-400 hover:underline font-medium cursor-pointer"
                                  >
                                    {t('banned_label', lang)}
                                  </button>
                                ) : ch.level === 400 ? (
                                  <button
                                    type="button"
                                    onClick={() => setActiveModule('delchar')}
                                    className="text-emerald-400 hover:underline font-mono-tabular cursor-pointer"
                                  >
                                    {t('delete_refund_label', lang)}
                                  </button>
                                ) : (
                                  <span className="text-zinc-400">
                                    {t('active_label', lang)}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* My Current Items — Authentic 8x15 Warehouse Grid */}
              <div className="p-5 rounded border border-zinc-800 bg-zinc-900/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                  <div>
                    <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                      {t('vault_grid_title', lang)}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {t('vault_grid_desc', lang)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModule('items')}
                    className="px-3.5 py-1.5 rounded text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer self-start"
                  >
                    {t('open_item_adder', lang)}
                  </button>
                </div>

                <WarehouseGrid
                  vaultItems={currentAccount.vaultItems}
                  catalog={catalog}
                  config={config}
                  allowRefund={true}
                  onRefundItem={handleRefundItem}
                  onTrackSerial={(serial) => {
                    setTargetSerialSearch(serial);
                    setActiveModule('search');
                  }}
                  classicMode={classicMode}
                />
              </div>
            </div>
          )}

          {activeModule === 'items' && (
            <ItemAdderModule
              account={currentAccount}
              catalog={catalog}
              groups={groups}
              config={config}
              lang={lang}
              onBuySingleItem={handleBuySingleItem}
              onBuyGroupSet={handleBuyGroupSet}
              onAdminEditItem={(uid) => {
                setAdminEditUid(uid);
                setActiveModule('im');
              }}
            />
          )}

          {activeModule === 'resets' && (
            <ResetPointsModule
              characters={myCharacters.length > 0 ? myCharacters : characters}
              config={config}
              lang={lang}
              onResetCharacterPoints={handleResetCharacterPoints}
            />
          )}

          {activeModule === 'buychar' && (
            <BuyCharacter400Module
              characters={myCharacters}
              config={config}
              lang={lang}
              onBuyCharacter400={handleBuyCharacter400}
            />
          )}

          {activeModule === 'delchar' && (
            <DeleteCharacter400Module
              characters={myCharacters}
              lang={lang}
              onDeleteCharacter400={handleDeleteCharacter400}
            />
          )}

          {activeModule === 'onlinereward' && (
            <OnlineHoursRewardModule
              account={currentAccount}
              lang={lang}
              onRedeemOnlineHours={handleRedeemOnlineHours}
              onSimulateAddOnlineMinutes={handleSimulateAddOnlineMinutes}
            />
          )}

          {activeModule === 'getzen' && (
            <ZenModule
              account={currentAccount}
              characters={myCharacters.length > 0 ? myCharacters : characters}
              lang={lang}
              onBuyWarehouseZen={handleBuyWarehouseZen}
              onTransferVaultZenToChar={handleTransferVaultZenToChar}
            />
          )}

          {activeModule === 'charnamechg' && (
            <CharNameModule
              characters={myCharacters.length > 0 ? myCharacters : characters}
              config={config}
              lang={lang}
              onChangeName={handleChangeName}
            />
          )}

          {activeModule === 'unban' && (
            <UnbanModule
              allCharacters={characters}
              config={config}
              lang={lang}
              onUnbanCharacter={handleUnbanCharacter}
            />
          )}

          {activeModule === 'howto' && (
            <TopUpAndOpenMuModule
              account={currentAccount}
              wCoinCBalance={
                wCoinCByAccount[currentAccount.username.toLowerCase()] ?? 0
              }
              lang={lang}
              onCreditsGranted={(creditsAdded, wCoinCAdded, logDetail) => {
                updateCurrentAccount((acc) => ({
                  ...acc,
                  credits: acc.credits + creditsAdded,
                }));
                setWCoinCByAccount((prev) => {
                  const key = currentAccount.username.toLowerCase();
                  return {
                    ...prev,
                    [key]: (prev[key] ?? 0) + wCoinCAdded,
                  };
                });
                appendShopLog(logDetail);
                showToast(
                  lang === 'Portuguese_BR'
                    ? `Recebeu +${creditsAdded.toLocaleString()} Credits & +${wCoinCAdded.toLocaleString()} WCoinC!`
                    : lang === 'Russian'
                    ? `Получено +${creditsAdded.toLocaleString()} кредитов и +${wCoinCAdded.toLocaleString()} WCoinC!`
                    : lang === 'Spanish'
                    ? `¡Recibiste +${creditsAdded.toLocaleString()} Créditos y +${wCoinCAdded.toLocaleString()} WCoinC!`
                    : lang === 'Bulgarian'
                    ? `Получени +${creditsAdded.toLocaleString()} кредита и +${wCoinCAdded.toLocaleString()} WCoinC!`
                    : `ได้รับ +${creditsAdded.toLocaleString()} Credits & +${wCoinCAdded.toLocaleString()} WCoinC!`
                );
              }}
            />
          )}

          {activeModule === 'vip' && (
            <VipModule
              account={currentAccount}
              lang={lang}
              onBuyVip={handleBuyVip}
              onNavigateToTopUp={() => setActiveModule('howto')}
            />
          )}

          {/* --- ADMIN MODULES --- */}
          {['im', 'groupmngr', 'u_credits', 'log', 'search', 'thetop', 'whviewer', 'ipbanish'].includes(
            activeModule
          ) &&
            !currentAccount.isAdmin && (
              <div className="mb-5 p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-200 text-xs flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <span className="font-medium">
                  {lang === 'Thai'
                    ? `บัญชีปัจจุบัน "${currentAccount.username}" ยังไม่ได้เปิดสิทธิ์แอดมิน กดปุ่มด้านขวาเพื่อเปิดสิทธิ์ผู้ดูแลระบบทันที:`
                    : `Account "${currentAccount.username}" is currently in Player Mode.`}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateCurrentAccount((a) => ({ ...a, isAdmin: true }))
                  }
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs cursor-pointer shadow"
                >
                  {lang === 'Thai' ? '👑 เปิดสิทธิ์แอดมิน (Enable Admin)' : '👑 Enable Admin Access'}
                </button>
              </div>
            )}

          {activeModule === 'im' && (
            <ItemManagerModule
              catalog={catalog}
              initialEditUid={adminEditUid}
              lang={lang}
              onUpdateItem={(updated) => {
                setCatalog((prev) =>
                  prev.map((it) => (it.uid === updated.uid ? updated : it))
                );
                appendShopLog(`Admin updated item settings: ${updated.name} (UID #${updated.uid})`);
                showToast(
                  lang === 'Thai'
                    ? `บันทึกการเปลี่ยนแปลงไอเทม ${updated.name} สำเร็จ`
                    : `Saved changes for ${updated.name}`
                );
              }}
              onAddItem={(newItem) => {
                setCatalog((prev) => [...prev, newItem]);
                appendShopLog(`Admin added new WebShop item: ${newItem.name} (UID #${newItem.uid})`);
                showToast(
                  lang === 'Thai'
                    ? `เพิ่มไอเทมใหม่ ${newItem.name} (UID #${newItem.uid}) เข้าสู่ระบบสำเร็จ!`
                    : `Added new item ${newItem.name} (UID #${newItem.uid})!`
                );
              }}
              onRemoveItem={(uid) => {
                const target = catalog.find((c) => c.uid === uid);
                setCatalog((prev) => prev.filter((it) => it.uid !== uid));
                appendShopLog(`Admin removed item UID #${uid} (${target?.name || 'Item'})`);
                showToast(
                  lang === 'Thai'
                    ? `ลบไอเทม #${uid} ออกจากระบบแล้ว`
                    : `Removed item #${uid} from shop.`
                );
              }}
            />
          )}

          {activeModule === 'groupmngr' && (
            <GroupManagerModule
              groups={groups}
              catalog={catalog}
              lang={lang}
              onAddGroup={(grp) => {
                setGroups((prev) => [...prev, grp]);
                appendShopLog(`Admin created item set #${grp.id} (${grp.name}) with ${grp.memberUids.length} items for ${grp.credits} credits`);
                showToast(
                  lang === 'Thai'
                    ? `เพิ่มเซ็ตไอเทมใหม่ "${grp.name}" สำเร็จ!`
                    : `Added new group "${grp.name}"!`
                );
              }}
              onUpdateGroup={(updatedGrp) => {
                setGroups((prev) =>
                  prev.map((g) => (g.id === updatedGrp.id ? updatedGrp : g))
                );
                appendShopLog(`Admin updated item set #${updatedGrp.id} (${updatedGrp.name})`);
                showToast(
                  lang === 'Thai'
                    ? `อัปเดตเซ็ตไอเทม "${updatedGrp.name}" สำเร็จ!`
                    : `Updated group "${updatedGrp.name}"!`
                );
              }}
              onDeleteGroup={(id) => {
                const grp = groups.find((g) => g.id === id);
                setGroups((prev) => prev.filter((g) => g.id !== id));
                appendShopLog(`Admin deleted item set #${id} (${grp?.name || 'Group'})`);
                showToast(
                  lang === 'Thai'
                    ? `ลบเซ็ตไอเทม #${id} สำเร็จ`
                    : `Deleted group #${id}`
                );
              }}
            />
          )}

          {activeModule === 'u_credits' && (
            <ManageCreditsModule
              accounts={accounts}
              initialUser={adminTargetUser}
              lang={lang}
              onAdjustCredits={(username, delta) => {
                const target = accounts.find(
                  (a) => a.username.toLowerCase() === username.toLowerCase()
                );
                const currentCreds = target ? target.credits : 0;
                const updatedBalance = Math.max(0, currentCreds + delta);

                if (target) {
                  setAccounts((prev) =>
                    prev.map((a) =>
                      a.username.toLowerCase() === username.toLowerCase()
                        ? { ...a, credits: updatedBalance }
                        : a
                    )
                  );
                } else {
                  setAccounts((prev) => [
                    ...prev,
                    {
                      username,
                      credits: updatedBalance,
                      vaultMoney: 50000000,
                      vaultItems: [],
                      onlineMinutes: 0,
                      exchangedOnlineHours: 0,
                      isAdmin: false,
                      isOnline: false,
                    },
                  ]);
                }
                appendShopLog(
                  `Admin adjusted ${username}'s credits by ${delta >= 0 ? `+${delta}` : delta} (New total: ${updatedBalance.toLocaleString()} Cr)`
                );
                showToast(
                  lang === 'Thai'
                    ? `ปรับเครดิต ${username} เป็น ${updatedBalance.toLocaleString()} Credits สำเร็จ`
                    : `Adjusted ${username}'s credits to ${updatedBalance.toLocaleString()} Credits`
                );
                return updatedBalance;
              }}
              onAdjustVaultZen={handleAdminAdjustVaultZen}
            />
          )}

          {activeModule === 'log' && (
            <HawkEyeLogModule
              logs={logs}
              initialAccountFilter={adminTargetUser}
              lang={lang}
              onSelectAccountCredits={(user) => {
                setAdminTargetUser(user);
                setActiveModule('u_credits');
              }}
              onSelectSerialSearch={(serial) => {
                setTargetSerialSearch(serial);
                setActiveModule('search');
              }}
              onClearLogs={handleAdminClearLogs}
            />
          )}

          {activeModule === 'search' && (
            <SerialSearchModule
              accounts={accounts}
              logs={logs}
              catalog={catalog}
              config={config}
              initialSerial={targetSerialSearch}
              lang={lang}
              onAdminDeleteVaultItem={handleAdminDeleteVaultItem}
            />
          )}

          {activeModule === 'thetop' && (
            <TopAccountsModule
              accounts={accounts}
              logs={logs}
              lang={lang}
              onManageUserCredits={(user) => {
                setAdminTargetUser(user);
                setActiveModule('u_credits');
              }}
              onViewUserLogs={(user) => {
                setAdminTargetUser(user);
                setActiveModule('log');
              }}
            />
          )}

          {activeModule === 'whviewer' && (
            <UserVaultsViewerModule
              accounts={accounts}
              catalog={catalog}
              config={config}
              lang={lang}
              onTrackSerial={(serial) => {
                setTargetSerialSearch(serial);
                setActiveModule('search');
              }}
              onAdminDeleteVaultItem={handleAdminDeleteVaultItem}
            />
          )}

          {activeModule === 'ipbanish' && (
            <IpBanManagerModule
              bans={bans}
              lang={lang}
              onAddBan={(name, iprange, displtxt) => {
                const nextId =
                  bans.length > 0 ? Math.max(...bans.map((b) => b.id)) + 1 : 1;
                setBans((prev) => [
                  ...prev,
                  {
                    id: nextId,
                    name,
                    iprange,
                    displtxt,
                    attempts: 0,
                  },
                ]);
                appendShopLog(`Admin banned IP Range: ${iprange} (${name})`);
                showToast(
                  lang === 'Thai'
                    ? `เพิ่มกฎแบน IP ${iprange} สำเร็จ`
                    : `Added IP ban for ${iprange}`
                );
              }}
              onRemoveBan={(id) => {
                const ban = bans.find((b) => b.id === id);
                setBans((prev) => prev.filter((b) => b.id !== id));
                appendShopLog(`Admin unbanned IP rule #${id} (${ban?.name || ''})`);
                showToast(
                  lang === 'Thai'
                    ? `ปลดแบน IP #${id} เรียบร้อยแล้ว`
                    : `Removed IP ban #${id}`
                );
              }}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-4 px-6 border-t border-zinc-800/80 bg-[#090b10] text-center text-xs text-zinc-500">
        <div>
          (c) {new Date().getFullYear()} - The MuOnline Advanced WebShop [
          <span className="text-zinc-300">{config.misc.servername}</span>]
        </div>
        <div className="text-[10px] text-zinc-600 mt-0.5">
          Original WebShop developer: Savoy · React Edition
        </div>
      </footer>

      {/* Modern OpenMU-Origins Account Login & Register Modal with Cloudflare Turnstile */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl my-8">
            <ModernLoginPage
              isModal={true}
              lang={lang}
              presetAccounts={accounts}
              onCancel={() => setLoginModalOpen(false)}
              onLoginSuccess={(clean, data) => {
                handleAuthSuccess(clean, data);
                setLoginModalOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
