/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch, setCsrfToken } from './utils/apiClient';
import {
  INITIAL_WEBSHOP_ITEMS,
  WebShopItem,
} from './data/webshopItems';
import {
  DEFAULT_WEBSHOP_CONFIG,
  EGIS_MU_LOGO_URL,
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
  WAREHOUSE_ZEN_MAX_LIMIT,
  ZEN_PURCHASE_AMOUNT,
  ZEN_PURCHASE_CREDITS,
  calculateClassStatPoints,
  getClassDisplayName,
} from './utils/muItemLogic';
import { WarehouseGrid } from './components/WarehouseGrid';
import { ItemAdderModule } from './components/ItemAdderModule';
import { L, t } from './translations';
import {
  BuyCharacter400Module,
  CharNameModule,
  DeleteCharacter400Module,
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
import { PromotionManagerModule } from './components/PromotionManagerModule';
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
  LogIn,
  LogOut,
  Package,
  RefreshCw,
  ShieldAlert,
  ShieldBan,
  Sparkles,
  Trash2,
  Trophy,
  UserCheck,
  UserPlus,
  Wrench,
} from 'lucide-react';

const STORAGE_KEY = 'egis_mu_webshop_prod_v2';

const ADMIN_MODULE_IDS: ModuleId[] = [
  'admin_promos',
  'im',
  'groupmngr',
  'u_credits',
  'log',
  'search',
  'thetop',
  'whviewer',
  'ipbanish',
  'admin_roles',
];

export default function App() {
  // Core WebShop production state (clean initial state without temp/demo users)
  const [config, setConfig] = useState<WebShopConfig>(DEFAULT_WEBSHOP_CONFIG);
  const [catalog, setCatalog] = useState<WebShopItem[]>(INITIAL_WEBSHOP_ITEMS);
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [groups, setGroups] = useState<ItemGroup[]>(INITIAL_GROUPS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [bans, setBans] = useState<IpBanEntry[]>(INITIAL_BANS);

  // Navigation & UI state
  const [activeModule, setActiveModule] = useState<ModuleId>('home');
  const [lang, setLang] = useState<LanguageCode>('Thai');
  const [classicMode, setClassicMode] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [loginModalMode, setLoginModalMode] = useState<'login' | 'register'>('login');
  const [wCoinCByAccount, setWCoinCByAccount] = useState<Record<string, number>>({});

  // Cross-module parameters
  const [adminEditUid, setAdminEditUid] = useState<number | null>(null);
  const [adminTargetUser, setAdminTargetUser] = useState<string>('');
  const [targetSerialSearch, setTargetSerialSearch] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setLoginModalMode(mode);
    setLoginModalOpen(true);
  };

  // Load persisted session state & hydrate catalog from backend cache
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lang) setLang(parsed.lang);
      }
    } catch {
      // ignore corrupted storage
    }

    apiFetch('/api/shop/catalog')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || !data.ok) return;
        if (Array.isArray(data.items) && data.items.length > 0) {
          setCatalog(data.items);
        }
        if (Array.isArray(data.groups) && data.groups.length > 0) {
          setGroups(data.groups);
        }
        if (data.pricing && data.limits) {
          setConfig((prev) => ({
            ...prev,
            credits: { ...prev.credits, ...data.pricing },
            limit: { ...prev.limit, ...data.limits },
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Persist production state
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          lang,
        })
      );
    } catch {
      // ignore quota error
    }
  }, [
    lang,
  ]);

  const currentAccount: AccountData | null = useMemo(() => {
    if (!currentUsername) return null;
    return (
      accounts.find(
        (a) => a.username.toLowerCase() === currentUsername.toLowerCase()
      ) || null
    );
  }, [accounts, currentUsername]);

  const isAdminUser = useMemo(() => {
    if (!currentAccount) return false;
    return Boolean(
      currentAccount.isAdmin ||
        currentAccount.role === 'ADMIN' ||
        currentAccount.role === 'SUPER_ADMIN'
    );
  }, [currentAccount]);

  // Guard restricted Admin modules if not logged in as Admin
  useEffect(() => {
    if (activeModule === 'login') {
      setActiveModule('home');
      return;
    }
    if (!isAdminUser && ADMIN_MODULE_IDS.includes(activeModule)) {
      setActiveModule('home');
    }
  }, [activeModule, isAdminUser]);

  // Hydrate server-side Audit Logs when opening Hawk Eye Audit Module (Admin only)
  useEffect(() => {
    if (!isAdminUser || !currentAccount || activeModule !== 'log') return;
    apiFetch('/api/admin/audit-logs?limit=250')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.ok || !Array.isArray(data.logs)) return;
        const mapped: LogEntry[] = data.logs.map((entry: any) => ({
          id: entry.numericId || 1,
          accountId: entry.accountId,
          details: entry.details,
          dateline: entry.dateline,
          itemSerial: entry.itemSerial || undefined,
          itemHex: entry.itemHex || undefined,
          action: entry.action || undefined,
          ipAddress: entry.ipAddress || undefined,
        }));
        setLogs(mapped);
      })
      .catch(() => {});
  }, [activeModule, currentAccount, isAdminUser]);

  const myCharacters = useMemo(() => {
    if (!currentAccount) return [];
    return characters.filter(
      (c) => c.accountId.toLowerCase() === currentAccount.username.toLowerCase()
    );
  }, [characters, currentAccount]);

  const appendShopLog = (
    details: string,
    itemSerial?: string,
    extra?: { itemHex?: string; action?: string; ipAddress?: string }
  ) => {
    if (!currentAccount) return;
    setLogs((prev) => [
      {
        id: prev.length + 1,
        accountId: currentAccount.username,
        details,
        dateline: Math.floor(Date.now() / 1000),
        itemSerial,
        itemHex: extra?.itemHex,
        action: extra?.action,
        ipAddress: extra?.ipAddress,
      },
      ...prev,
    ]);
  };

  const updateCurrentAccount = (updater: (acc: AccountData) => AccountData) => {
    if (!currentAccount) return;
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
    const serverIsAdmin = Boolean(
      accountData?.isAdmin ||
        accountData?.isMasterAdmin ||
        accountData?.role === 'ADMIN' ||
        accountData?.role === 'SUPER_ADMIN' ||
        accountData?.state === 'GameMaster'
    );
    const resolvedRole =
      accountData?.role || (serverIsAdmin ? 'ADMIN' : 'USER');

    setAccounts((prev) => {
      const exists = prev.some(
        (a) => a.username.toLowerCase() === clean.toLowerCase()
      );
      if (exists) {
        return prev.map((a) =>
          a.username.toLowerCase() === clean.toLowerCase()
            ? {
                ...a,
                isAdmin: serverIsAdmin,
                role: resolvedRole,
                credits:
                  typeof accountData?.credits === 'number'
                    ? accountData.credits
                    : a.credits,
                vaultMoney:
                  typeof accountData?.vaultMoney === 'number'
                    ? accountData.vaultMoney
                    : a.vaultMoney,
                vipUntil: accountData?.vipUntil ?? a.vipUntil,
                vaultItems: Array.isArray(accountData?.vaultItems)
                  ? accountData.vaultItems
                  : a.vaultItems,
                characterDeleteCode:
                  accountData?.characterDeleteCode || a.characterDeleteCode,
              }
            : a
        );
      }
      return [
        ...prev,
        {
          username: clean,
          characterDeleteCode: accountData?.characterDeleteCode || '',
          credits:
            typeof accountData?.credits === 'number' ? accountData.credits : 0,
          vaultMoney:
            typeof accountData?.vaultMoney === 'number'
              ? accountData.vaultMoney
              : 0,
          vipUntil: accountData?.vipUntil || undefined,
          vaultItems: Array.isArray(accountData?.vaultItems)
            ? accountData.vaultItems
            : [],
          onlineMinutes: 0,
          exchangedOnlineHours: 0,
          isAdmin: serverIsAdmin,
          role: resolvedRole,
          isOnline: false,
        },
      ];
    });

    if (typeof accountData?.wCoinC === 'number') {
      setWCoinCByAccount((prev) => ({
        ...prev,
        [clean.toLowerCase()]: accountData.wCoinC,
      }));
    }

    setCurrentUsername(clean);
    showToast(
      L(lang, {
        en: `Signed in as ${clean} (${serverIsAdmin ? 'Admin' : 'Player'})`,
        th: `เข้าสู่ระบบด้วยบัญชี ${clean} (${serverIsAdmin ? 'Admin' : 'ผู้เล่น'}) สำเร็จ!`,
        pt: `Conectado como ${clean} (${serverIsAdmin ? 'Admin' : 'Jogador'})`,
        ru: `Вы вошли как ${clean} (${serverIsAdmin ? 'Админ' : 'Игрок'})`,
        es: `Sesión iniciada como ${clean} (${serverIsAdmin ? 'Admin' : 'Jugador'})`,
        bg: `Влязохте като ${clean} (${serverIsAdmin ? 'Админ' : 'Играч'})`,
      })
    );
  };

  useEffect(() => {
    apiFetch('/api/openmu/session')
      .then(async (response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!data?.ok || !data.account?.loginName) return;
        setCsrfToken(data.csrfToken);
        handleAuthSuccess(data.account.loginName, data.account);
      })
      .catch(() => setCsrfToken(undefined));
  }, []);

  const handleLogout = () => {
    void apiFetch('/api/openmu/logout', { method: 'POST' });
    setCsrfToken(undefined);
    setCurrentUsername(null);
    setActiveModule('home');
    showToast(
      L(lang, {
        en: 'You have signed out successfully.',
        th: 'ออกจากระบบเรียบร้อยแล้ว',
        pt: 'Você saiu da conta com sucesso.',
        ru: 'Вы успешно вышли из системы.',
        es: 'Has cerrado sesión correctamente.',
        bg: 'Успешно излязохте от профила.',
      })
    );
  };

  // --- BUSINESS LOGIC HANDLERS ---

  const requireAuthResponse = () => ({
    ok: false,
    message: L(lang, {
      en: 'Please sign in before performing this action.',
      th: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      pt: 'Faça login antes de realizar esta ação.',
      ru: 'Войдите в аккаунт перед выполнением действия.',
      es: 'Inicia sesión antes de realizar esta acción.',
      bg: 'Моля, влезте в профила си преди това действие.',
    }),
  });

  // 1. Buy Single Item — Server-Side ACID Transaction + MEMB_STAT Guard
  const handleBuySingleItem = async (
    item: WebShopItem,
    level: number,
    option: number,
    luck: boolean,
    skill: boolean,
    exlOptions: boolean[],
    ancientStamina: 0 | 5 | 10,
    fenrirVariant: 0 | 1 | 2 | 3,
    _totalCredits: number
  ): Promise<{ ok: boolean; message: string }> => {
    if (!currentAccount) {
      openAuthModal('login');
      return requireAuthResponse();
    }

    const idempotencyKey = crypto.randomUUID();
    try {
      const response = await apiFetch('/api/shop/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          accountId: currentAccount.username,
          idempotencyKey,
          currency: 'credits',
          clientCurrentCredits: currentAccount.credits,
          clientVaultItems: currentAccount.vaultItems,
          itemUid: item.uid,
          level,
          option,
          luck,
          skill,
          exlOptions,
          ancientStamina,
          fenrirVariant,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        return {
          ok: false,
          message:
            data?.message ||
            L(lang, {
              en: 'Transaction rejected by anti-dupe protection.',
              th: 'ธุรกรรมถูกยกเลิกโดยระบบป้องกันปั๊มไอเทม',
              pt: 'Transação rejeitada pela proteção anti-dupe.',
              ru: 'Транзакция отклонена защитой анти-дюп.',
              es: 'Transacción rechazada por la protección anti-dupe.',
              bg: 'Транзакцията е отхвърлена от анти-дюп защитата.',
            }),
        };
      }

      const added: VaultItemInstance[] = Array.isArray(data.addedItems)
        ? data.addedItems
        : [];
      const created = added[0];

      updateCurrentAccount((acc) => ({
        ...acc,
        credits:
          typeof data.remainingCredits === 'number'
            ? data.remainingCredits
            : acc.credits - (data.chargedCredits || 0),
        vaultItems: [...acc.vaultItems, ...added],
      }));

      if (created) {
        appendShopLog(
          `Bought ${
            exlOptions.some(Boolean) ? 'Excellent ' : ''
          }${item.name}${level > 0 ? ` +${level}` : ''} [Slot #${
            created.slotIndex
          }, Serial: ${created.serial}] for ${data.chargedCredits} credits`,
          created.serial,
          {
            itemHex: created.itemHex,
            action: 'PURCHASE_SINGLE_ITEM',
          }
        );
        showToast(
          L(lang, {
            en: `Added ${item.name} (Serial: ${created.serial}) to Vault Slot #${created.slotIndex}!`,
            th: `ส่งไอเทม ${item.name} (Serial: ${created.serial}) เข้าคลังช่อง #${created.slotIndex} สำเร็จ!`,
            pt: `Adicionado ${item.name} (Serial: ${created.serial}) ao Slot #${created.slotIndex}!`,
            ru: `Предмет ${item.name} (Serial: ${created.serial}) добавлен в слот #${created.slotIndex}!`,
            es: `¡${item.name} (Serial: ${created.serial}) añadido al Slot #${created.slotIndex}!`,
            bg: `Добавен ${item.name} (Serial: ${created.serial}) в слот #${created.slotIndex}!`,
          })
        );
      }

      return {
        ok: true,
        message: data.message,
      };
    } catch {
      return {
        ok: false,
        message: L(lang, {
          en: 'Unable to reach WebShop transaction server. No credits were deducted.',
          th: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ธุรกรรมได้ ระบบยังไม่ได้หักเครดิตของคุณ',
          pt: 'Não foi possível conectar ao servidor. Nenhum crédito foi descontado.',
          ru: 'Сервер транзакций недоступен. Кредиты не списаны.',
          es: 'No se pudo conectar al servidor. No se descontaron créditos.',
          bg: 'Няма връзка със сървъра. Не са удържани кредити.',
        }),
      };
    }
  };

  // 2. Buy Group Set — Server-Side ACID Transaction + MEMB_STAT Guard
  const handleBuyGroupSet = async (
    group: ItemGroup,
    level: number,
    option: number,
    luck: boolean,
    _skill: boolean,
    exlOptions: boolean[],
    ancientStamina: 0 | 5 | 10,
    _totalCredits: number
  ): Promise<{ ok: boolean; message: string }> => {
    if (!currentAccount) {
      openAuthModal('login');
      return requireAuthResponse();
    }

    const idempotencyKey = crypto.randomUUID();
    try {
      const response = await apiFetch('/api/shop/purchase-group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          accountId: currentAccount.username,
          idempotencyKey,
          clientCurrentCredits: currentAccount.credits,
          clientVaultItems: currentAccount.vaultItems,
          groupId: group.id,
          level,
          option,
          luck,
          exlOptions,
          ancientStamina,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        return {
          ok: false,
          message:
            data?.message ||
            L(lang, {
              en: 'Set purchase rolled back by anti-dupe protection.',
              th: 'การสั่งซื้อเซ็ตถูกยกเลิกโดยระบบป้องกันปั๊มไอเทม',
              pt: 'Compra do conjunto revertida pela proteção anti-dupe.',
              ru: 'Покупка набора отменена защитой анти-дюп.',
              es: 'Compra del set revertida por protección anti-dupe.',
              bg: 'Покупката на сета е отменена от анти-дюп защитата.',
            }),
        };
      }

      const added: VaultItemInstance[] = Array.isArray(data.addedItems)
        ? data.addedItems
        : [];

      updateCurrentAccount((acc) => ({
        ...acc,
        credits:
          typeof data.remainingCredits === 'number'
            ? data.remainingCredits
            : acc.credits - (data.chargedCredits || 0),
        vaultItems: [...acc.vaultItems, ...added],
      }));

      appendShopLog(
        `Bought Set Pack "${group.name}" (${added.length} items) for ${data.chargedCredits} credits`,
        added[0]?.serial,
        {
          itemHex: added.map((i) => i.itemHex).filter(Boolean).join(','),
          action: 'PURCHASE_ITEM_SET',
        }
      );

      showToast(
        L(lang, {
          en: `Added ${group.name} (${added.length} items) to your Vault!`,
          th: `ส่งเซ็ต ${group.name} (${added.length} ชิ้น) เข้าคลังเรียบร้อยแล้ว!`,
          pt: `${group.name} (${added.length} itens) adicionado ao seu Baú!`,
          ru: `Набор ${group.name} (${added.length} предм.) добавлен в сундук!`,
          es: `¡${group.name} (${added.length} objetos) añadido a tu Baúl!`,
          bg: `Сет ${group.name} (${added.length} предм.) е добавен в сандъка!`,
        })
      );

      return {
        ok: true,
        message: data.message,
      };
    } catch {
      return {
        ok: false,
        message: L(lang, {
          en: 'Unable to reach WebShop transaction server. Set purchase rolled back.',
          th: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ธุรกรรมได้ ยกเลิกรายการสั่งซื้อเซ็ต',
          pt: 'Servidor indisponível. Compra do conjunto revertida.',
          ru: 'Сервер недоступен. Покупка набора отменена.',
          es: 'Servidor no disponible. Compra del set revertida.',
          bg: 'Сървърът е недостъпен. Покупката е отменена.',
        }),
      };
    }
  };

  // 3. Refund / Sell Back Item
  const handleRefundItem = async (instance: VaultItemInstance) => {
    if (!currentAccount) return;
    try {
      const response = await apiFetch('/api/shop/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: currentAccount.username,
          instanceId: instance.instanceId,
          serial: instance.serial,
          clientCurrentCredits: currentAccount.credits,
          clientVaultItems: currentAccount.vaultItems,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        showToast(
          data?.message ||
            L(lang, {
              en: 'Refund rejected by server anti-dupe guard.',
              th: 'การขายคืนถูกปฏิเสธโดยระบบความปลอดภัยของเซิร์ฟเวอร์',
              pt: 'Reembolso rejeitado pela proteção do servidor.',
              ru: 'Возврат отклонён защитой сервера.',
              es: 'Reembolso rechazado por la protección del servidor.',
              bg: 'Връщането е отхвърлено от защитата на сървъра.',
            })
        );
        return;
      }

      updateCurrentAccount((acc) => ({
        ...acc,
        credits:
          typeof data.remainingCredits === 'number'
            ? data.remainingCredits
            : acc.credits + (data.refundCredits || 0),
        vaultItems: acc.vaultItems.filter(
          (it) => it.instanceId !== instance.instanceId
        ),
      }));

      appendShopLog(
        `${currentAccount.username} sold back ${instance.name} (Serial: ${instance.serial}) for ${data.refundCredits} credits`,
        instance.serial,
        {
          itemHex: instance.itemHex,
          action: 'REFUND_VAULT_ITEM',
        }
      );

      showToast(data.message);
    } catch {
      showToast(
        L(lang, {
          en: 'Unable to process item sellback right now.',
          th: 'ไม่สามารถทำรายการขายคืนไอเทมได้ในขณะนี้',
          pt: 'Não foi possível processar a venda agora.',
          ru: 'Не удалось выполнить продажу предмета.',
          es: 'No se pudo procesar la venta del objeto.',
          bg: 'Неуспешна продажба на предмета в момента.',
        })
      );
    }
  };

  // 4. Reset Stat Points
  const handleResetCharacterPoints = (charName: string) => {
    if (!currentAccount) return requireAuthResponse();
    const cost = config.credits.reset;
    if (currentAccount.credits < cost) {
      return {
        ok: false,
        message: L(lang, {
          en: `Insufficient credits (${cost.toLocaleString()} Credits required).`,
          th: `เครดิตของคุณไม่เพียงพอ (ต้องการ ${cost.toLocaleString()} Credits)`,
          pt: `Créditos insuficientes (${cost.toLocaleString()} Créditos necessários).`,
          ru: `Недостаточно кредитов (требуется ${cost.toLocaleString()} кредитов).`,
          es: `Créditos insuficientes (se requieren ${cost.toLocaleString()} Créditos).`,
          bg: `Недостатъчно кредити (необходими са ${cost.toLocaleString()} кредита).`,
        }),
      };
    }
    const targetChar = myCharacters.find(
      (c) => c.name.toLowerCase() === charName.toLowerCase()
    );
    if (!targetChar) {
      return {
        ok: false,
        message: L(lang, {
          en: 'Selected character was not found on your account.',
          th: 'ไม่พบตัวละครที่เลือกในบัญชีของคุณ',
          pt: 'Personagem selecionado não encontrado na sua conta.',
          ru: 'Выбранный персонаж не найден на вашем аккаунте.',
          es: 'El personaje seleccionado no existe en tu cuenta.',
          bg: 'Избраният герой не е намерен във вашия акаунт.',
        }),
      };
    }
    if (targetChar.isOnline || currentAccount.isOnline) {
      return {
        ok: false,
        message: L(lang, {
          en: 'Your account and character must be Offline before resetting stat points.',
          th: 'ตัวละครและบัญชีต้องอยู่ในสถานะออฟไลน์ (Offline) ก่อนขอ Reset Point',
          pt: 'Sua conta e personagem devem estar Offline antes de resetar os pontos.',
          ru: 'Аккаунт и персонаж должны быть Offline перед сбросом статов.',
          es: 'Tu cuenta y personaje deben estar Offline antes de resetear puntos.',
          bg: 'Акаунтът и героят трябва да са Offline преди ресет на точки.',
        }),
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
      `Reset stat points for ${targetChar.name} (${calc.classDef.name} Lv.${targetChar.level}) -> ${calc.totalPoints} pts (${cost} credits)`
    );

    const msg = L(lang, {
      en: `Reset stats for ${targetChar.name} (${getClassDisplayName(calc.classDef, lang)})! Granted ${calc.totalPoints.toLocaleString()} free points.`,
      th: `รีเซ็ตสเตตัสของ ${targetChar.name} (${getClassDisplayName(calc.classDef, lang)}) เรียบร้อยแล้ว! ได้รับพอยต์รวม ${calc.totalPoints.toLocaleString()} พอยต์`,
      pt: `Atributos de ${targetChar.name} resetados! Recebeu ${calc.totalPoints.toLocaleString()} pontos livres.`,
      ru: `Статы ${targetChar.name} сброшены! Начислено ${calc.totalPoints.toLocaleString()} свободных очков.`,
      es: `¡Atributos de ${targetChar.name} restablecidos! Recibiste ${calc.totalPoints.toLocaleString()} puntos libres.`,
      bg: `Статовете на ${targetChar.name} са нулирани! Получени ${calc.totalPoints.toLocaleString()} точки.`,
    });
    showToast(msg);
    return { ok: true, message: msg };
  };

  // 5. Buy Level 400 Class 3 Character
  const handleBuyCharacter400 = (charName: string, classCode: MuClassCode) => {
    if (!currentAccount) return requireAuthResponse();
    const cleanName = charName.trim();
    if (cleanName.length < 2 || cleanName.length > 10) {
      return {
        ok: false,
        message: L(lang, {
          en: 'Character name must be between 2 and 10 characters.',
          th: 'ชื่อตัวละครต้องมีความยาวระหว่าง 2 ถึง 10 ตัวอักษร',
          pt: 'O nome do personagem deve ter entre 2 e 10 caracteres.',
          ru: 'Имя персонажа должно быть от 2 до 10 символов.',
          es: 'El nombre del personaje debe tener entre 2 y 10 caracteres.',
          bg: 'Името на героя трябва да е между 2 и 10 символа.',
        }),
      };
    }
    if (myCharacters.length >= 5) {
      return {
        ok: false,
        message: L(lang, {
          en: 'Your account already has the maximum of 5 characters.',
          th: 'บัญชีของคุณมีตัวละครครบสูงสุด 5 ตัวแล้ว',
          pt: 'Sua conta já possui o limite máximo de 5 personagens.',
          ru: 'На вашем аккаунте уже создано максимум 5 персонажей.',
          es: 'Tu cuenta ya alcanzó el máximo de 5 personajes.',
          bg: 'Акаунтът ви вече има максимум 5 героя.',
        }),
      };
    }
    if (
      characters.some((c) => c.name.toLowerCase() === cleanName.toLowerCase())
    ) {
      return {
        ok: false,
        message: L(lang, {
          en: `Character name "${cleanName}" is already taken.`,
          th: `ชื่อตัวละคร "${cleanName}" มีอยู่ในระบบแล้ว กรุณาตั้งชื่ออื่น`,
          pt: `O nome "${cleanName}" já está em uso.`,
          ru: `Имя персонажа «${cleanName}» уже занято.`,
          es: `El nombre "${cleanName}" ya está en uso.`,
          bg: `Името "${cleanName}" вече е заето.`,
        }),
      };
    }

    const calc = calculateClassStatPoints(classCode, 400);
    if (!calc.classDef.s3) {
      return {
        ok: false,
        message: L(lang, {
          en: 'Only 3rd Class characters can be purchased.',
          th: 'ระบบอนุญาตให้ซื้อเฉพาะสายอาชีพ Class 3 เท่านั้น',
          pt: 'Apenas personagens de 3ª Classe podem ser comprados.',
          ru: 'Доступна покупка только персонажей 3-го класса.',
          es: 'Solo se permite comprar personajes de 3ra Clase.',
          bg: 'Могат да се купуват само герои от 3-ти клас.',
        }),
      };
    }

    const cost = BUY_CHAR_400_CREDITS;
    if (currentAccount.credits < cost) {
      return {
        ok: false,
        message: L(lang, {
          en: `Insufficient credits (${cost.toLocaleString()} Credits required).`,
          th: `เครดิตของคุณไม่เพียงพอ (ต้องการ ${cost.toLocaleString()} Credits)`,
          pt: `Créditos insuficientes (${cost.toLocaleString()} Créditos necessários).`,
          ru: `Недостаточно кредитов (требуется ${cost.toLocaleString()} кредитов).`,
          es: `Créditos insuficientes (se requieren ${cost.toLocaleString()} Créditos).`,
          bg: `Недостатъчно кредити (необходими са ${cost.toLocaleString()} кредита).`,
        }),
      };
    }
    if (currentAccount.isOnline) {
      return {
        ok: false,
        message: L(lang, {
          en: 'Your account must be Offline before purchasing a new character.',
          th: 'บัญชีต้องอยู่ในสถานะออฟไลน์ (Offline) ก่อนซื้อตัวละครใหม่',
          pt: 'Sua conta deve estar Offline antes de comprar um personagem.',
          ru: 'Аккаунт должен быть Offline перед покупкой персонажа.',
          es: 'Tu cuenta debe estar Offline antes de comprar un personaje.',
          bg: 'Акаунтът трябва да е Offline преди покупка на герой.',
        }),
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
      money: 0,
      ctlCode: 0,
      isOnline: false,
    };

    setCharacters((prev) => [...prev, newChar]);
    updateCurrentAccount((acc) => ({
      ...acc,
      credits: acc.credits - cost,
    }));

    appendShopLog(
      `Purchased Lv.400 Class 3 character "${cleanName}" (${calc.classDef.name}) with ${calc.totalPoints} pts for ${cost} credits`
    );

    const msg = L(lang, {
      en: `Created "${cleanName}" (${getClassDisplayName(calc.classDef, lang)} · Lv.400) with ${calc.totalPoints.toLocaleString()} free stat points!`,
      th: `ซื้อตัวละคร "${cleanName}" อาชีพ ${getClassDisplayName(calc.classDef, lang)} (Lv.400) สำเร็จ! ได้รับพอยต์พร้อมอัป ${calc.totalPoints.toLocaleString()} พอยต์`,
      pt: `Personagem "${cleanName}" (${getClassDisplayName(calc.classDef, lang)} · Nv.400) criado com ${calc.totalPoints.toLocaleString()} pontos!`,
      ru: `Создан персонаж «${cleanName}» (${getClassDisplayName(calc.classDef, lang)} · 400 ур.) с ${calc.totalPoints.toLocaleString()} очками!`,
      es: `¡Personaje "${cleanName}" (${getClassDisplayName(calc.classDef, lang)} · Lv.400) creado con ${calc.totalPoints.toLocaleString()} puntos!`,
      bg: `Герой "${cleanName}" (${getClassDisplayName(calc.classDef, lang)} · 400 ниво) е създаден с ${calc.totalPoints.toLocaleString()} точки!`,
    });
    showToast(msg);
    return { ok: true, message: msg };
  };

  // 6. Delete Level 400 Character (+300 Credits)
  const handleDeleteCharacter400 = (charName: string, deleteCode: string) => {
    if (!currentAccount) return requireAuthResponse();
    if (currentAccount.isOnline) {
      return {
        ok: false,
        message: L(lang, {
          en: 'Your account must be Offline before deleting a character.',
          th: 'บัญชีต้องอยู่ในสถานะออฟไลน์ (Offline) ก่อนลบตัวละคร',
          pt: 'Sua conta deve estar Offline antes de excluir um personagem.',
          ru: 'Аккаунт должен быть Offline перед удалением персонажа.',
          es: 'Tu cuenta debe estar Offline antes de eliminar un personaje.',
          bg: 'Акаунтът трябва да е Offline преди изтриване на герой.',
        }),
      };
    }

    const cleanCode = (deleteCode || '').trim();
    if (!/^\d{4,8}$/.test(cleanCode)) {
      return {
        ok: false,
        message: L(lang, {
          en: 'Character Delete Code must contain digits (0–9) only.',
          th: 'รหัสสำหรับลบตัวละครต้องเป็นตัวเลข 0–9 เท่านั้น',
          pt: 'O código de exclusão deve conter apenas dígitos (0–9).',
          ru: 'Код удаления должен состоять только из цифр (0–9).',
          es: 'El código de borrado debe contener solo números (0–9).',
          bg: 'Кодът за изтриване трябва да съдържа само цифри (0–9).',
        }),
      };
    }

    if (
      currentAccount.characterDeleteCode &&
      cleanCode !== currentAccount.characterDeleteCode
    ) {
      return {
        ok: false,
        message: L(lang, {
          en: 'Incorrect Character Delete Code.',
          th: 'รหัสสำหรับลบตัวละครไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
          pt: 'Código de exclusão de personagem incorreto.',
          ru: 'Неверный код удаления персонажа.',
          es: 'Código de borrado de personaje incorrecto.',
          bg: 'Невалиден код за изтриване на герой.',
        }),
      };
    }

    const targetChar = myCharacters.find(
      (c) => c.name.toLowerCase() === charName.toLowerCase()
    );
    if (!targetChar) {
      return {
        ok: false,
        message: L(lang, {
          en: 'Character not found on your account.',
          th: 'ไม่พบตัวละครนี้ในบัญชีของคุณ',
          pt: 'Personagem não encontrado na sua conta.',
          ru: 'Персонаж не найден на вашем аккаунте.',
          es: 'Personaje no encontrado en tu cuenta.',
          bg: 'Героят не е намерен във вашия акаунт.',
        }),
      };
    }
    if (targetChar.isOnline) {
      return {
        ok: false,
        message: L(lang, {
          en: 'Character must be Offline before deletion.',
          th: 'ตัวละครต้องอยู่ในสถานะออฟไลน์ (Offline) ก่อนลบ',
          pt: 'O personagem deve estar Offline.',
          ru: 'Персонаж должен быть Offline.',
          es: 'El personaje debe estar Offline.',
          bg: 'Героят трябва да е Offline.',
        }),
      };
    }
    if (targetChar.ctlCode !== 0) {
      return {
        ok: false,
        message: L(lang, {
          en: 'Suspended characters cannot be deleted for credits.',
          th: 'ไม่สามารถลบตัวละครที่ติดสถานะแบนได้',
          pt: 'Personagens banidos não podem ser excluídos por créditos.',
          ru: 'Заблокированного персонажа нельзя удалить за кредиты.',
          es: 'Los personajes baneados no pueden eliminarse por créditos.',
          bg: 'Блокирани герои не могат да бъдат изтривани за кредити.',
        }),
      };
    }
    if (targetChar.level !== 400) {
      return {
        ok: false,
        message: L(lang, {
          en: `Character "${targetChar.name}" is Level ${targetChar.level}. Level 400 is required.`,
          th: `ตัวละคร "${targetChar.name}" มีเลเวล ${targetChar.level} (ต้องเป็นตัวละคร Level 400 เท่านั้น)`,
          pt: `"${targetChar.name}" está no Nível ${targetChar.level} (requer Nível 400).`,
          ru: `Персонаж «${targetChar.name}» ${targetChar.level} ур. (требуется 400 ур.).`,
          es: `"${targetChar.name}" es Nivel ${targetChar.level} (se requiere Nivel 400).`,
          bg: `"${targetChar.name}" е ${targetChar.level} ниво (изисква се 400 ниво).`,
        }),
      };
    }

    const reward = DELETE_CHAR_400_REWARD_CREDITS;
    setCharacters((prev) =>
      prev.filter((c) => c.name.toLowerCase() !== charName.toLowerCase())
    );
    updateCurrentAccount((acc) => ({
      ...acc,
      credits: acc.credits + reward,
    }));

    appendShopLog(
      `Deleted Lv.400 character "${targetChar.name}" for +${reward} Credits`
    );

    const msg = L(lang, {
      en: `Deleted "${targetChar.name}" (Lv.400) and credited +${reward.toLocaleString()} Credits!`,
      th: `ลบตัวละคร "${targetChar.name}" (Lv.400) สำเร็จ! ได้รับ +${reward.toLocaleString()} Credits`,
      pt: `Personagem "${targetChar.name}" (Nv.400) excluído! +${reward.toLocaleString()} Créditos adicionados.`,
      ru: `Персонаж «${targetChar.name}» (400 ур.) удалён! Начислено +${reward.toLocaleString()} кредитов.`,
      es: `¡"${targetChar.name}" (Lv.400) eliminado! Recibiste +${reward.toLocaleString()} Créditos.`,
      bg: `"${targetChar.name}" (400 ниво) е изтрит! Получихте +${reward.toLocaleString()} кредита.`,
    });
    showToast(msg);
    return { ok: true, message: msg };
  };

  // 8. Buy Warehouse Zen (50 Credits = 500M Zen, Max 900M)
  const handleBuyWarehouseZen = () => {
    if (!currentAccount) return requireAuthResponse();
    if (currentAccount.isOnline) {
      return {
        ok: false,
        message: L(lang, {
          en: 'Your account must be Offline before buying Warehouse Zen.',
          th: 'บัญชีต้องอยู่ในสถานะออฟไลน์ (Offline) ก่อนซื้อเงิน Zen เข้าคลัง',
          pt: 'Sua conta deve estar Offline antes de comprar Zen para o baú.',
          ru: 'Аккаунт должен быть Offline перед покупкой Zen в сундук.',
          es: 'Tu cuenta debe estar Offline antes de comprar Zen para el baúl.',
          bg: 'Акаунтът трябва да е Offline преди покупка на Zen.',
        }),
      };
    }
    if (currentAccount.credits < ZEN_PURCHASE_CREDITS) {
      return {
        ok: false,
        message: L(lang, {
          en: `Insufficient credits (${ZEN_PURCHASE_CREDITS} Credits required for 500M Zen).`,
          th: `เครดิตของคุณไม่เพียงพอ (ต้องการ ${ZEN_PURCHASE_CREDITS} Credits สำหรับ 500M Zen)`,
          pt: `Créditos insuficientes (${ZEN_PURCHASE_CREDITS} Créditos necessários).`,
          ru: `Недостаточно кредитов (нужно ${ZEN_PURCHASE_CREDITS} кредитов).`,
          es: `Créditos insuficientes (se requieren ${ZEN_PURCHASE_CREDITS} Créditos).`,
          bg: `Недостатъчно кредити (нужни са ${ZEN_PURCHASE_CREDITS} кредита).`,
        }),
      };
    }

    const projectedZen = currentAccount.vaultMoney + ZEN_PURCHASE_AMOUNT;
    if (projectedZen > WAREHOUSE_ZEN_MAX_LIMIT) {
      return {
        ok: false,
        message: L(lang, {
          en: `Vault Zen would reach ${projectedZen.toLocaleString()} Zen, exceeding the 900,000,000 Zen (900M) limit.`,
          th: `เงินในคลังรวมจะกลายเป็น ${projectedZen.toLocaleString()} Zen ซึ่งเกินเพดานสูงสุด 900,000,000 Zen (900M)`,
          pt: `O Zen do baú atingiria ${projectedZen.toLocaleString()}, excedendo o limite de 900M.`,
          ru: `Баланс сундука составит ${projectedZen.toLocaleString()} Zen, превышая лимит 900M.`,
          es: `El Zen del baúl alcanzaría ${projectedZen.toLocaleString()}, superando el límite de 900M.`,
          bg: `Zen в сандъка ще стане ${projectedZen.toLocaleString()}, над лимита от 900M.`,
        }),
      };
    }

    updateCurrentAccount((acc) => ({
      ...acc,
      credits: acc.credits - ZEN_PURCHASE_CREDITS,
      vaultMoney: acc.vaultMoney + ZEN_PURCHASE_AMOUNT,
    }));

    appendShopLog(
      `Bought +500,000,000 Zen for ${ZEN_PURCHASE_CREDITS} Credits (Vault total: ${projectedZen.toLocaleString()} Zen)`
    );

    const msg = L(lang, {
      en: `Purchased +500M Zen! Current Vault Zen: ${projectedZen.toLocaleString()} / 900,000,000.`,
      th: `ซื้อ +500M Zen สำเร็จ! ยอดในคลังปัจจุบัน: ${projectedZen.toLocaleString()} / 900,000,000 Zen`,
      pt: `Comprou +500M Zen! Saldo no baú: ${projectedZen.toLocaleString()} Zen.`,
      ru: `Куплено +500M Zen! Баланс сундука: ${projectedZen.toLocaleString()} Zen.`,
      es: `¡Compraste +500M Zen! Saldo en baúl: ${projectedZen.toLocaleString()} Zen.`,
      bg: `Закупихте +500M Zen! Наличност в сандъка: ${projectedZen.toLocaleString()} Zen.`,
    });
    showToast(msg);
    return { ok: true, message: msg };
  };

  const handleTransferVaultZenToChar = (charName: string, amount: number) => {
    if (!currentAccount) return requireAuthResponse();
    if (currentAccount.vaultMoney < amount) {
      return {
        ok: false,
        message: L(lang, {
          en: `Your Warehouse has less than ${amount.toLocaleString()} Zen.`,
          th: `เงิน Zen ในคลังของคุณมีไม่ถึง ${amount.toLocaleString()} Zen`,
          pt: `Seu baú possui menos de ${amount.toLocaleString()} Zen.`,
          ru: `В сундуке меньше ${amount.toLocaleString()} Zen.`,
          es: `Tu baúl tiene menos de ${amount.toLocaleString()} Zen.`,
          bg: `В сандъка има по-малко от ${amount.toLocaleString()} Zen.`,
        }),
      };
    }
    const targetChar = myCharacters.find(
      (c) => c.name.toLowerCase() === charName.toLowerCase()
    );
    if (!targetChar) {
      return {
        ok: false,
        message: L(lang, {
          en: 'Recipient character not found.',
          th: 'ไม่พบตัวละครผู้รับเงิน Zen',
          pt: 'Personagem destinatário não encontrado.',
          ru: 'Персонаж-получатель не найден.',
          es: 'Personaje destinatario no encontrado.',
          bg: 'Героят получател не е намерен.',
        }),
      };
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

    const msg = L(lang, {
      en: `Transferred ${(amount / 1_000_000).toFixed(0)}M Zen to ${targetChar.name}!`,
      th: `โอน ${(amount / 1_000_000).toFixed(0)}M Zen เข้าตัวละคร ${targetChar.name} สำเร็จ!`,
      pt: `Transferiu ${(amount / 1_000_000).toFixed(0)}M Zen para ${targetChar.name}!`,
      ru: `Переведено ${(amount / 1_000_000).toFixed(0)}M Zen персонажу ${targetChar.name}!`,
      es: `¡Transferiste ${(amount / 1_000_000).toFixed(0)}M Zen a ${targetChar.name}!`,
      bg: `Прехвърлихте ${(amount / 1_000_000).toFixed(0)}M Zen към ${targetChar.name}!`,
    });
    showToast(msg);
    return { ok: true, message: msg };
  };

  // 9. Change Character Name
  const handleChangeName = (oldName: string, newName: string) => {
    if (!currentAccount) return requireAuthResponse();
    if (newName.length < 2 || newName.length > 10) {
      return {
        ok: false,
        message: L(lang, {
          en: 'New character name must be 2–10 characters.',
          th: 'ชื่อตัวละครใหม่ต้องมีความยาว 2–10 ตัวอักษร',
          pt: 'O novo nome deve ter de 2 a 10 caracteres.',
          ru: 'Новое имя должно содержать от 2 до 10 символов.',
          es: 'El nuevo nombre debe tener de 2 a 10 caracteres.',
          bg: 'Новото име трябва да е от 2 до 10 символа.',
        }),
      };
    }
    if (currentAccount.credits < config.credits.namechg) {
      return {
        ok: false,
        message: L(lang, {
          en: 'Not enough credits to change character name.',
          th: 'เครดิตของคุณไม่เพียงพอสำหรับเปลี่ยนชื่อตัวละคร',
          pt: 'Créditos insuficientes para trocar o nome.',
          ru: 'Недостаточно кредитов для смены имени.',
          es: 'Créditos insuficientes para cambiar el nombre.',
          bg: 'Недостатъчно кредити за смяна на име.',
        }),
      };
    }
    if (
      characters.some((c) => c.name.toLowerCase() === newName.toLowerCase())
    ) {
      return {
        ok: false,
        message: L(lang, {
          en: 'A character with that name already exists.',
          th: 'มีตัวละครที่ใช้ชื่อนี้อยู่ในระบบแล้ว',
          pt: 'Já existe um personagem com esse nome.',
          ru: 'Персонаж с таким именем уже существует.',
          es: 'Ya existe un personaje con ese nombre.',
          bg: 'Вече съществува герой с това име.',
        }),
      };
    }
    const targetChar = myCharacters.find(
      (c) => c.name.toLowerCase() === oldName.toLowerCase()
    );
    if (!targetChar) {
      return {
        ok: false,
        message: L(lang, {
          en: 'Character not found on your account.',
          th: 'ไม่พบตัวละครเดิมในบัญชีของคุณ',
          pt: 'Personagem não encontrado na sua conta.',
          ru: 'Персонаж не найден на вашем аккаунте.',
          es: 'Personaje no encontrado en tu cuenta.',
          bg: 'Героят не е намерен във вашия акаунт.',
        }),
      };
    }
    if (targetChar.isOnline || currentAccount.isOnline) {
      return {
        ok: false,
        message: L(lang, {
          en: 'Character must be Offline before changing name.',
          th: 'ตัวละครต้องอยู่ในสถานะ Offline ก่อนเปลี่ยนชื่อ',
          pt: 'O personagem deve estar Offline.',
          ru: 'Персонаж должен быть Offline.',
          es: 'El personaje debe estar Offline.',
          bg: 'Героят трябва да е Offline.',
        }),
      };
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
    appendShopLog(`Renamed character ${oldName} -> ${newName}`);

    return {
      ok: true,
      message: L(lang, {
        en: `Character renamed from ${oldName} to ${newName}!`,
        th: `เปลี่ยนชื่อตัวละครจาก ${oldName} เป็น ${newName} สำเร็จ!`,
        pt: `Nome alterado de ${oldName} para ${newName}!`,
        ru: `Имя персонажа изменено с ${oldName} на ${newName}!`,
        es: `¡Nombre cambiado de ${oldName} a ${newName}!`,
        bg: `Името е променено от ${oldName} на ${newName}!`,
      }),
    };
  };

  // 10. Unban Character (100 Credits)
  const handleUnbanCharacter = (charName: string) => {
    if (!currentAccount) return requireAuthResponse();
    if (currentAccount.credits < config.credits.unbanchar) {
      return {
        ok: false,
        message: L(lang, {
          en: `Insufficient credits (${config.credits.unbanchar} Credits required).`,
          th: `เครดิตของคุณไม่เพียงพอ (ต้องการ ${config.credits.unbanchar} Credits)`,
          pt: `Créditos insuficientes (${config.credits.unbanchar} Créditos necessários).`,
          ru: `Недостаточно кредитов (требуется ${config.credits.unbanchar} кредитов).`,
          es: `Créditos insuficientes (${config.credits.unbanchar} Créditos requeridos).`,
          bg: `Недостатъчно кредити (нужни са ${config.credits.unbanchar} кредита).`,
        }),
      };
    }
    const solidList = config.misc.solidbans
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (solidList.includes(charName.toLowerCase())) {
      return {
        ok: false,
        message: L(lang, {
          en: 'This character is permanently banned and cannot be unbanned via WebShop.',
          th: 'ตัวละครนี้อยู่ในรายชื่อแบนถาวร ไม่สามารถปลดแบนผ่านระบบอัตโนมัติได้',
          pt: 'Este personagem possui banimento permanente.',
          ru: 'Этот персонаж заблокирован навсегда.',
          es: 'Este personaje tiene baneo permanente.',
          bg: 'Този герой е перманентно блокиран.',
        }),
      };
    }
    const targetChar = characters.find(
      (c) => c.name.toLowerCase() === charName.toLowerCase()
    );
    if (!targetChar || targetChar.ctlCode !== config.misc.bannedcode) {
      return {
        ok: false,
        message: L(lang, {
          en: 'The specified character is not currently banned.',
          th: 'ไม่พบตัวละครนี้ในรายชื่อที่ติดสถานะแบน',
          pt: 'O personagem informado não está banido.',
          ru: 'Указанный персонаж не находится в бан-листе.',
          es: 'El personaje indicado no está baneado.',
          bg: 'Посоченият герой не е в списъка с блокирани.',
        }),
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
    appendShopLog(
      `Unbanned character ${targetChar.name} for ${config.credits.unbanchar} credits`
    );

    return {
      ok: true,
      message: L(lang, {
        en: `${targetChar.name} has been unbanned!`,
        th: `ปลดแบนตัวละคร ${targetChar.name} เรียบร้อยแล้ว!`,
        pt: `${targetChar.name} foi desbanido!`,
        ru: `Персонаж ${targetChar.name} разблокирован!`,
        es: `¡${targetChar.name} ha sido desbaneado!`,
        bg: `Героят ${targetChar.name} е отблокиран!`,
      }),
    };
  };

  // 11. Buy / Extend VIP Membership (800 Credits / 30 days)
  const handleBuyVip = (months: number = 1): { ok: boolean; message: string } => {
    if (!currentAccount) return requireAuthResponse();
    const VIP_MONTHLY_COST = 800;
    const totalCost = months * VIP_MONTHLY_COST;
    const daysToAdd = months * 30;

    if (currentAccount.credits < totalCost) {
      return {
        ok: false,
        message: L(lang, {
          en: `Insufficient credits! ${totalCost.toLocaleString()} Credits required.`,
          th: `เครดิตของคุณไม่เพียงพอ! ต้องการ ${totalCost.toLocaleString()} Credits`,
          pt: `Créditos insuficientes! Necessário ${totalCost.toLocaleString()} Créditos.`,
          ru: `Недостаточно кредитов! Требуется ${totalCost.toLocaleString()} кредитов.`,
          es: `¡Créditos insuficientes! Se requieren ${totalCost.toLocaleString()} Créditos.`,
          bg: `Недостатъчно кредити! Нужни са ${totalCost.toLocaleString()} кредита.`,
        }),
      };
    }

    const now = new Date();
    const currentExpiry = currentAccount.vipUntil
      ? new Date(currentAccount.vipUntil)
      : null;
    const baseDate =
      currentExpiry && currentExpiry > now ? currentExpiry : now;
    const newExpiry = new Date(
      baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000
    );
    const newExpiryIso = newExpiry.toISOString();

    updateCurrentAccount((acc) => ({
      ...acc,
      credits: acc.credits - totalCost,
      vipUntil: newExpiryIso,
    }));

    appendShopLog(
      `Activated/extended VIP +${daysToAdd} days for ${totalCost} Credits`
    );

    const msg = L(lang, {
      en: `VIP Membership extended (+${daysToAdd} days)! Valid until ${newExpiry.toLocaleDateString()}.`,
      th: `สมัคร/ต่ออายุสมาชิก VIP (+${daysToAdd} วัน) สำเร็จ! ใช้ได้ถึง ${newExpiry.toLocaleDateString('th-TH')}`,
      pt: `Assinatura VIP estendida (+${daysToAdd} dias)! Válida até ${newExpiry.toLocaleDateString('pt-BR')}.`,
      ru: `VIP-подписка продлена (+${daysToAdd} дн.)! Действует до ${newExpiry.toLocaleDateString('ru-RU')}.`,
      es: `¡Membresía VIP extendida (+${daysToAdd} días)! Válida hasta ${newExpiry.toLocaleDateString('es-ES')}.`,
      bg: `VIP абонаментът е удължен (+${daysToAdd} дни)! Валиден до ${newExpiry.toLocaleDateString('bg-BG')}.`,
    });
    showToast(msg);
    return { ok: true, message: msg };
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
      L(lang, {
        en: `Deleted item (Serial: ${serial}) from ${username}'s vault`,
        th: `ลบไอเทม Serial: ${serial} จากคลังของ ${username} สำเร็จ`,
        pt: `Item (Serial: ${serial}) removido do baú de ${username}`,
        ru: `Предмет (Serial: ${serial}) удалён из сундука ${username}`,
        es: `Objeto (Serial: ${serial}) eliminado del baúl de ${username}`,
        bg: `Предмет (Serial: ${serial}) е изтрит от сандъка на ${username}`,
      })
    );
  };

  const handleAdminAdjustVaultZen = (username: string, amount: number) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.username.toLowerCase() === username.toLowerCase()) {
          return {
            ...acc,
            vaultMoney: Math.min(
              WAREHOUSE_ZEN_MAX_LIMIT,
              Math.max(0, acc.vaultMoney + amount)
            ),
          };
        }
        return acc;
      })
    );
    appendShopLog(
      `Admin adjusted ${username}'s vault Zen by ${
        amount >= 0 ? `+${amount.toLocaleString()}` : amount.toLocaleString()
      }`
    );
    showToast(
      L(lang, {
        en: `Adjusted ${username}'s vault Zen by ${amount.toLocaleString()}`,
        th: `ปรับยอด Zen ในคลังของ ${username} สำเร็จ`,
        pt: `Zen do baú de ${username} ajustado`,
        ru: `Баланс Zen сундука ${username} изменён`,
        es: `Zen del baúl de ${username} ajustado`,
        bg: `Балансът на Zen на ${username} е променен`,
      })
    );
  };

  const handleAdminClearLogs = () => {
    setLogs([]);
    showToast(
      L(lang, {
        en: 'All WebShop logs have been cleared.',
        th: 'ล้างประวัติการทำรายการในร้านค้าทั้งหมดเรียบร้อยแล้ว',
        pt: 'Todos os registros foram limpos.',
        ru: 'Журнал транзакций очищен.',
        es: 'Todos los registros han sido limpiados.',
        bg: 'Всички логове са изчистени.',
      })
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
      id: 'admin_promos',
      translationKey: 'nav_admin_promos',
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
    },
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

  const GuestAuthPromptCard = () => (
    <div className="max-w-2xl p-6 rounded border border-zinc-800 bg-zinc-900/85 space-y-4">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-white">
            {t('guest_welcome_title', lang)}
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {t('guest_welcome_desc', lang)}
          </p>
        </div>
      </div>

      <div className="pt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => openAuthModal('login')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>{t('login_btn', lang)}</span>
        </button>
        <button
          type="button"
          onClick={() => openAuthModal('register')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 font-semibold text-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-emerald-400" />
          <span>{t('register_btn', lang)}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveModule('items')}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-xs transition-colors cursor-pointer"
        >
          <Package className="w-4 h-4" />
          <span>{t('nav_items', lang)}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen flex flex-col ${
        classicMode
          ? 'classic-theme bg-[#CCCCCC] text-zinc-900'
          : 'bg-[#0b0d13] text-zinc-100'
      }`}
    >
      {/* Top Bar: Brand Wordmark (No Front Logo, No Top Nav Menu — Navigation via Left Sidebar Only) */}
      <header className="flex items-center justify-between gap-8 px-6 py-3 border-b border-zinc-800 bg-[#090b10]">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            setActiveModule('home');
          }}
          className="inline-flex items-center whitespace-nowrap shrink-0"
        >
          <span className="text-lg font-display font-bold tracking-wider text-amber-400">
            Egis-MU WEBSHOP
          </span>
        </a>

        {/* Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {currentAccount ? (
            <button
              type="button"
              onClick={() => setActiveModule('howto')}
              className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 rounded hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {currentAccount.credits.toLocaleString()} Credits ·{' '}
              {(wCoinCByAccount[currentAccount.username.toLowerCase()] ?? 0).toLocaleString()} WCoinC ·{' '}
              {t('nav_topup', lang)}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 rounded hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t('register_btn', lang)}
            </button>
          )}
        </div>
      </header>

      {/* Secondary Workspace Status & Language/Auth Bar (Auth button placed at the FAR RIGHT) */}
      <div className="px-6 py-2.5 border-b border-zinc-800/80 bg-zinc-900/90 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3 text-zinc-300">
          {currentAccount ? (
            <>
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
              {currentAccount.vipUntil &&
              new Date(currentAccount.vipUntil) > new Date() ? (
                <button
                  type="button"
                  onClick={() => setActiveModule('vip')}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold hover:bg-amber-500/30 transition-colors cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>
                    {t('vip_active', lang)} (
                    {Math.max(
                      1,
                      Math.ceil(
                        (new Date(currentAccount.vipUntil).getTime() -
                          Date.now()) /
                          (24 * 60 * 60 * 1000)
                      )
                    )}
                    d)
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveModule('vip')}
                  className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
                >
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>{t('btn_buy_vip', lang)} (800Cr)</span>
                </button>
              )}
            </>
          ) : (
            <span className="text-zinc-400">
              {t('logged_in_as', lang)}{' '}
              <strong className="text-zinc-200">{t('guest_label', lang)}</strong>
            </span>
          )}
        </div>

        {/* Rightmost Workspace Controls — Sign In / Sign Out anchored at the FAR RIGHT */}
        <div className="flex flex-wrap items-center gap-2.5 ml-auto">
          {currentAccount && (
            <span
              className={`px-2.5 py-1 rounded border text-[11px] font-medium whitespace-nowrap ${
                currentAccount.isOnline
                  ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                  : 'border-zinc-700 bg-zinc-950 text-zinc-300'
              }`}
            >
              {t('ingame_status', lang)}{' '}
              {currentAccount.isOnline
                ? t('status_online', lang)
                : t('status_offline', lang)}
            </span>
          )}

          {/* Language Selector (6 Languages) */}
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
              <option value="English" className="bg-zinc-900">
                English
              </option>
              <option value="Portuguese_BR" className="bg-zinc-900">
                Português (Brasil)
              </option>
              <option value="Russian" className="bg-zinc-900">
                Русский (Russian)
              </option>
              <option value="Spanish" className="bg-zinc-900">
                Español (Spanish)
              </option>
              <option value="Bulgarian" className="bg-zinc-900">
                Български (Bulgarian)
              </option>
            </select>
          </div>

          {/* Vault Theme Toggle */}
          <button
            type="button"
            onClick={() => setClassicMode(!classicMode)}
            className="px-2.5 py-1 rounded border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-[11px] text-zinc-300 cursor-pointer whitespace-nowrap"
          >
            {classicMode
              ? t('theme_dark', lang)
              : t('theme_classic', lang)}
          </button>

          {/* Far-Right Auth Action: Sign In when logged out, Sign Out when logged in */}
          {currentAccount ? (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25 text-[11px] font-semibold text-rose-300 cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('logout_btn', lang)}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-amber-500/50 bg-amber-500/15 hover:bg-amber-500/25 text-[11px] font-semibold text-amber-300 cursor-pointer whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('login_btn', lang)}</span>
            </button>
          )}
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded border border-amber-500/50 bg-zinc-950/95 text-amber-300 text-xs font-medium shadow-2xl">
          {toastMessage}
        </div>
      )}

      {/* Main Two-Column Layout: Left Crest & Menu + Content Area */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto flex flex-col md:flex-row gap-6 p-6">
        {/* Left Navigation Menu */}
        <aside className="w-full md:w-60 shrink-0 space-y-4">
          {/* Official Egis-MU Online Emblem Showcase */}
          <button
            type="button"
            onClick={() => setActiveModule('home')}
            className="w-full rounded border border-zinc-800 bg-[#0c0504] overflow-hidden text-left group cursor-pointer block"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-[#0c0504]">
              <img
                src={EGIS_MU_LOGO_URL}
                alt="Egis-MU WEBSHOP — Continent of Egis-MU S6E3"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
              />
            </div>
            <div className="px-3.5 py-2 bg-zinc-950/95 border-t border-zinc-800/90 text-center">
              <div className="text-xs font-display font-bold tracking-wider text-amber-400">
                Egis-MU WEBSHOP
              </div>
              <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                Continent of Egis-MU S6E3
              </div>
            </div>
          </button>

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

          {/* Admin Menu — Strictly visible ONLY when logged in as an Admin user */}
          {isAdminUser && (
            <div className="rounded border border-zinc-800 bg-zinc-900/90 overflow-hidden">
              <div className="px-3.5 py-2.5 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                  {t('nav_admin_menu', lang)}
                </span>
                <span className="text-[10px] font-mono-tabular px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  ADMIN
                </span>
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
          )}
        </aside>

        {/* Main Module Viewport */}
        <main className="flex-1 min-w-0">
          {activeModule === 'home' &&
            (currentAccount ? (
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
                          {t('vip_status', lang)}
                        </span>
                        {currentAccount.vipUntil &&
                        new Date(currentAccount.vipUntil) > new Date() ? (
                          <button
                            type="button"
                            onClick={() => setActiveModule('vip')}
                            className="font-mono-tabular font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 hover:underline cursor-pointer text-[11px]"
                          >
                            {t('vip_active', lang)} (
                            {Math.ceil(
                              (new Date(currentAccount.vipUntil).getTime() -
                                Date.now()) /
                                (24 * 60 * 60 * 1000)
                            )}
                            d) →
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveModule('vip')}
                            className="text-amber-400 hover:underline font-medium cursor-pointer text-xs"
                          >
                            {t('btn_buy_vip', lang)} (800Cr) →
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
                        <span>
                          {t('btn_buy_vip', lang)} (800 Cr · EXP +30% & Drop +20%)
                        </span>
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
                    {myCharacters.length === 0 ? (
                      <div className="py-8 text-center text-xs text-zinc-400 space-y-3">
                        <div>{t('no_characters', lang)}</div>
                        <button
                          type="button"
                          onClick={() => setActiveModule('buychar')}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-semibold cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{t('btn_buy_char400', lang)}</span>
                        </button>
                      </div>
                    ) : (
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
                                    {cls
                                      ? getClassDisplayName(cls, lang)
                                      : ch.classCode}{' '}
                                    <span className="text-[10px] text-amber-400 font-mono-tabular">
                                      ({cls?.pointsPerLevel || 5}pt/lv)
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-center font-mono-tabular text-amber-400 font-bold">
                                    Lv.{ch.level}
                                  </td>
                                  <td className="py-2 px-3 text-right font-mono-tabular text-zinc-300 text-[11px]">
                                    {ch.strength}/{ch.agility}/{ch.vitality}/
                                    {ch.energy}
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
                                        onClick={() =>
                                          setActiveModule('delchar')
                                        }
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
                    )}
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
                    lang={lang}
                    allowRefund={true}
                    onRefundItem={handleRefundItem}
                    onTrackSerial={
                      isAdminUser
                        ? (serial) => {
                            setTargetSerialSearch(serial);
                            setActiveModule('search');
                          }
                        : undefined
                    }
                    classicMode={classicMode}
                  />
                </div>
              </div>
            ) : (
              <GuestAuthPromptCard />
            ))}

          {activeModule === 'items' && (
            <ItemAdderModule
              account={currentAccount}
              catalog={catalog}
              groups={groups}
              config={config}
              lang={lang}
              onBuySingleItem={handleBuySingleItem}
              onBuyGroupSet={handleBuyGroupSet}
              onRequireLogin={() => openAuthModal('login')}
              onAdminEditItem={
                isAdminUser
                  ? (uid) => {
                      setAdminEditUid(uid);
                      setActiveModule('im');
                    }
                  : undefined
              }
            />
          )}

          {activeModule === 'resets' &&
            (currentAccount ? (
              <ResetPointsModule
                characters={myCharacters}
                config={config}
                lang={lang}
                onResetCharacterPoints={handleResetCharacterPoints}
              />
            ) : (
              <GuestAuthPromptCard />
            ))}

          {activeModule === 'buychar' &&
            (currentAccount ? (
              <BuyCharacter400Module
                characters={myCharacters}
                config={config}
                lang={lang}
                onBuyCharacter400={handleBuyCharacter400}
              />
            ) : (
              <GuestAuthPromptCard />
            ))}

          {activeModule === 'delchar' &&
            (currentAccount ? (
              <DeleteCharacter400Module
                characters={myCharacters}
                lang={lang}
                onDeleteCharacter400={handleDeleteCharacter400}
              />
            ) : (
              <GuestAuthPromptCard />
            ))}

          {activeModule === 'onlinereward' &&
            (currentAccount ? (
              <div className="max-w-2xl rounded border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100">
                {L(lang, {
                  en: 'Online-time rewards are managed by the OpenMU game server. Browser-reported play time is disabled to prevent forged credit grants.',
                  th: 'รางวัลเวลาออนไลน์ต้องจัดการโดย OpenMU game server เท่านั้น ระบบจะไม่รับเวลาเล่นจาก browser เพื่อป้องกันการปลอมเครดิต',
                  pt: 'As recompensas por tempo online são gerenciadas pelo servidor OpenMU. O tempo informado pelo navegador está desativado.',
                  ru: 'Награды за онлайн-время выдаёт сервер OpenMU. Данные браузера отключены во избежание подделки кредитов.',
                  es: 'Las recompensas por tiempo online las gestiona el servidor OpenMU. El tiempo informado por el navegador está desactivado.',
                  bg: 'Наградите за онлайн време се управляват от OpenMU сървъра. Данните от браузъра са изключени.',
                })}
              </div>
            ) : (
              <GuestAuthPromptCard />
            ))}

          {activeModule === 'getzen' &&
            (currentAccount ? (
              <ZenModule
                account={currentAccount}
                characters={myCharacters}
                lang={lang}
                onBuyWarehouseZen={handleBuyWarehouseZen}
                onTransferVaultZenToChar={handleTransferVaultZenToChar}
              />
            ) : (
              <GuestAuthPromptCard />
            ))}

          {activeModule === 'charnamechg' &&
            (currentAccount ? (
              <CharNameModule
                characters={myCharacters}
                config={config}
                lang={lang}
                onChangeName={handleChangeName}
              />
            ) : (
              <GuestAuthPromptCard />
            ))}

          {activeModule === 'unban' &&
            (currentAccount ? (
              <UnbanModule
                allCharacters={characters}
                config={config}
                lang={lang}
                onUnbanCharacter={handleUnbanCharacter}
              />
            ) : (
              <GuestAuthPromptCard />
            ))}

          {activeModule === 'howto' &&
            (currentAccount ? (
              <TopUpAndOpenMuModule
                account={currentAccount}
                wCoinCBalance={
                  wCoinCByAccount[currentAccount.username.toLowerCase()] ?? 0
                }
                lang={lang}
                onManagePromotions={
                  isAdminUser ? () => setActiveModule('admin_promos') : undefined
                }
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
                    L(lang, {
                      en: `Received +${creditsAdded.toLocaleString()} Credits & +${wCoinCAdded.toLocaleString()} WCoinC!`,
                      th: `ได้รับ +${creditsAdded.toLocaleString()} Credits & +${wCoinCAdded.toLocaleString()} WCoinC!`,
                      pt: `Recebeu +${creditsAdded.toLocaleString()} Créditos & +${wCoinCAdded.toLocaleString()} WCoinC!`,
                      ru: `Получено +${creditsAdded.toLocaleString()} кредитов и +${wCoinCAdded.toLocaleString()} WCoinC!`,
                      es: `¡Recibiste +${creditsAdded.toLocaleString()} Créditos y +${wCoinCAdded.toLocaleString()} WCoinC!`,
                      bg: `Получихте +${creditsAdded.toLocaleString()} кредита и +${wCoinCAdded.toLocaleString()} WCoinC!`,
                    })
                  );
                }}
                onWalletSynchronized={(credits, wCoinC, logDetail) => {
                  updateCurrentAccount((acc) => ({ ...acc, credits }));
                  setWCoinCByAccount((prev) => ({
                    ...prev,
                    [currentAccount.username.toLowerCase()]: wCoinC,
                  }));
                  appendShopLog(logDetail);
                  showToast(
                    L(lang, {
                      en: `Wallet updated: ${credits.toLocaleString()} Credits · ${wCoinC.toLocaleString()} WCoinC`,
                      th: `อัปเดตกระเป๋าแล้ว: ${credits.toLocaleString()} Credits · ${wCoinC.toLocaleString()} WCoinC`,
                    })
                  );
                }}
              />
            ) : (
              <GuestAuthPromptCard />
            ))}

          {activeModule === 'vip' &&
            (currentAccount ? (
              <VipModule
                account={currentAccount}
                lang={lang}
                onBuyVip={handleBuyVip}
                onNavigateToTopUp={() => setActiveModule('howto')}
              />
            ) : (
              <GuestAuthPromptCard />
            ))}

          {/* --- ADMIN MODULES (Strictly rendered ONLY when isAdminUser === true) --- */}
          {isAdminUser && currentAccount && activeModule === 'admin_promos' && (
            <PromotionManagerModule
              adminUsername={currentAccount.username}
              lang={lang}
              onPreviewPlayerTopUp={() => setActiveModule('howto')}
              onConfigSaved={(_saved, summaryLog) => {
                appendShopLog(summaryLog, undefined, {
                  action: 'ADMIN_PROMOTION_UPDATE',
                });
                showToast(
                  L(lang, {
                    en: 'Top-up promotions saved and published!',
                    th: 'บันทึกการตั้งค่าโปรโมชั่นเติมเงินเรียบร้อยแล้ว!',
                  })
                );
              }}
            />
          )}
          {isAdminUser && currentAccount && activeModule === 'im' && (
            <ItemManagerModule
              catalog={catalog}
              initialEditUid={adminEditUid}
              lang={lang}
              onUpdateItem={(updated) => {
                setCatalog((prev) =>
                  prev.map((it) => (it.uid === updated.uid ? updated : it))
                );
                apiFetch('/api/admin/catalog/items', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ item: updated }),
                }).catch(() => {});
                appendShopLog(
                  `Admin updated item settings: ${updated.name} (UID #${updated.uid})`,
                  undefined,
                  { action: 'ADMIN_CATALOG_UPSERT_ITEM' }
                );
              }}
              onAddItem={(newItem) => {
                setCatalog((prev) => [...prev, newItem]);
                apiFetch('/api/admin/catalog/items', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ item: newItem }),
                }).catch(() => {});
                appendShopLog(
                  `Admin added new WebShop item: ${newItem.name} (UID #${newItem.uid})`,
                  undefined,
                  { action: 'ADMIN_CATALOG_UPSERT_ITEM' }
                );
              }}
              onRemoveItem={(uid) => {
                const target = catalog.find((c) => c.uid === uid);
                setCatalog((prev) => prev.filter((it) => it.uid !== uid));
                apiFetch(`/api/admin/catalog/items/${uid}`, {
                  method: 'DELETE',
                }).catch(() => {});
                appendShopLog(
                  `Admin removed item UID #${uid} (${target?.name || 'Item'})`,
                  undefined,
                  { action: 'ADMIN_CATALOG_DELETE_ITEM' }
                );
              }}
            />
          )}

          {isAdminUser && currentAccount && activeModule === 'groupmngr' && (
            <GroupManagerModule
              groups={groups}
              catalog={catalog}
              lang={lang}
              onAddGroup={(grp) => {
                setGroups((prev) => [...prev, grp]);
                apiFetch('/api/admin/catalog/groups', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ group: grp }),
                }).catch(() => {});
                appendShopLog(
                  `Admin created item set #${grp.id} (${grp.name})`,
                  undefined,
                  { action: 'ADMIN_CATALOG_UPSERT_GROUP' }
                );
              }}
              onUpdateGroup={(updatedGrp) => {
                setGroups((prev) =>
                  prev.map((g) => (g.id === updatedGrp.id ? updatedGrp : g))
                );
                apiFetch('/api/admin/catalog/groups', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ group: updatedGrp }),
                }).catch(() => {});
                appendShopLog(
                  `Admin updated item set #${updatedGrp.id} (${updatedGrp.name})`,
                  undefined,
                  { action: 'ADMIN_CATALOG_UPSERT_GROUP' }
                );
              }}
              onDeleteGroup={(id) => {
                const grp = groups.find((g) => g.id === id);
                setGroups((prev) => prev.filter((g) => g.id !== id));
                apiFetch(`/api/admin/catalog/groups/${id}`, {
                  method: 'DELETE',
                }).catch(() => {});
                appendShopLog(
                  `Admin deleted item set #${id} (${grp?.name || 'Group'})`,
                  undefined,
                  { action: 'ADMIN_CATALOG_DELETE_GROUP' }
                );
              }}
            />
          )}

          {isAdminUser && activeModule === 'u_credits' && (
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
                      characterDeleteCode: '',
                      credits: updatedBalance,
                      vaultMoney: 0,
                      vaultItems: [],
                      onlineMinutes: 0,
                      exchangedOnlineHours: 0,
                      isAdmin: false,
                      role: 'USER',
                      isOnline: false,
                    },
                  ]);
                }
                appendShopLog(
                  `Admin adjusted ${username}'s credits by ${
                    delta >= 0 ? `+${delta}` : delta
                  } (Total: ${updatedBalance.toLocaleString()} Cr)`
                );
                return updatedBalance;
              }}
              onAdjustVaultZen={handleAdminAdjustVaultZen}
            />
          )}

          {isAdminUser && activeModule === 'log' && (
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

          {isAdminUser && activeModule === 'search' && (
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

          {isAdminUser && activeModule === 'thetop' && (
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

          {isAdminUser && activeModule === 'whviewer' && (
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

          {isAdminUser && activeModule === 'ipbanish' && (
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
              }}
              onRemoveBan={(id) => {
                const ban = bans.find((b) => b.id === id);
                setBans((prev) => prev.filter((b) => b.id !== id));
                appendShopLog(
                  `Admin unbanned IP rule #${id} (${ban?.name || ''})`
                );
              }}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-4 px-6 border-t border-zinc-800/80 bg-[#090b10] text-center text-xs text-zinc-400">
        <div>
          (c) 2026 - The Egis-MU WEBSHOP [
          <span className="text-zinc-200">Continent of Egis-MU S6E3</span>]
        </div>
      </footer>

      {/* Account Login & Register Modal with Cloudflare Turnstile */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl my-8">
            <ModernLoginPage
              isModal={true}
              initialMode={loginModalMode}
              lang={lang}
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
