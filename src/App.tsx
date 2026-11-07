/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch, setCsrfToken } from './utils/apiClient';
import {
  INITIAL_WEBSHOP_ITEMS,
  WebShopItem,
} from './data/webshopItems';
import {
  DEFAULT_WEBSHOP_CONFIG,
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
  const [wCoinCByAccount, setWCoinCByAccount] = useState<Record<string, number>>({});
  const pendingPurchaseKeys = useRef<Map<number, string>>(new Map());

  // Cross-module parameters
  const [adminEditUid, setAdminEditUid] = useState<number | null>(null);
  const [adminTargetUser, setAdminTargetUser] = useState<string>('');
  const [targetSerialSearch, setTargetSerialSearch] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const openAuthModal = () => {
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

  // Hydrate accounts from database for Admin modules
  useEffect(() => {
    if (!isAdminUser || !currentAccount) return;
    if (
      activeModule !== 'u_credits' &&
      activeModule !== 'thetop' &&
      activeModule !== 'whviewer'
    ) {
      return;
    }
    apiFetch('/api/admin/accounts')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.ok || !Array.isArray(data.accounts)) return;
        setAccounts((prev) => {
          const map = new Map(
            prev.map((acc) => [acc.username.toLowerCase(), acc])
          );
          for (const srvAcc of data.accounts) {
            const key = String(srvAcc.username || '').toLowerCase();
            if (!key) continue;
            const existing = map.get(key);
            if (existing) {
              map.set(key, {
                ...existing,
                credits: Number(srvAcc.credits || 0),
                vaultMoney: Number(srvAcc.vaultMoney || 0),
                vipUntil: srvAcc.vipUntil || existing.vipUntil,
                isAdmin: Boolean(srvAcc.isAdmin),
                role: srvAcc.role || existing.role,
              });
            } else {
              map.set(key, {
                username: srvAcc.username,
                characterDeleteCode: '',
                credits: Number(srvAcc.credits || 0),
                vaultMoney: Number(srvAcc.vaultMoney || 0),
                vaultItems: [],
                onlineMinutes: 0,
                exchangedOnlineHours: 0,
                vipUntil: srvAcc.vipUntil || undefined,
                isAdmin: Boolean(srvAcc.isAdmin),
                role: srvAcc.role || 'USER',
                isOnline: false,
              });
            }
          }
          return Array.from(map.values());
        });
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
                onlineMinutes:
                  typeof accountData?.onlineMinutes === 'number'
                    ? accountData.onlineMinutes
                    : a.onlineMinutes,
                exchangedOnlineHours:
                  typeof accountData?.exchangedOnlineHours === 'number'
                    ? accountData.exchangedOnlineHours
                    : a.exchangedOnlineHours,
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
          onlineMinutes:
            typeof accountData?.onlineMinutes === 'number'
              ? accountData.onlineMinutes
              : 0,
          exchangedOnlineHours:
            typeof accountData?.exchangedOnlineHours === 'number'
              ? accountData.exchangedOnlineHours
              : 0,
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

  // Hydrate account characters from backend when signed in
  useEffect(() => {
    if (!currentUsername) return;
    apiFetch('/api/accounts/characters')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.ok || !Array.isArray(data.characters)) return;
        setCharacters((prev) => {
          const otherChars = prev.filter(
            (c) => c.accountId.toLowerCase() !== currentUsername.toLowerCase()
          );
          return [...otherChars, ...data.characters];
        });
      })
      .catch(() => {});
  }, [currentUsername, activeModule]);

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
      openAuthModal();
      return requireAuthResponse();
    }

    if (item.openMuPackageSequence === undefined) {
      return {
        ok: false,
        message: L(lang, {
          en: 'This item is not mapped to an authoritative OpenMU offer yet.',
          th: 'ไอเทมนี้ยังไม่ได้เชื่อมกับรายการขาย authoritative ของ OpenMU',
          pt: 'Este item ainda não está mapeado para uma oferta autoritativa do OpenMU.',
          ru: 'Предмет ещё не сопоставлен с авторитетным предложением OpenMU.',
          es: 'Este objeto aún no está vinculado a una oferta autoritativa de OpenMU.',
          bg: 'Предметът още не е свързан с авторитетна оферта на OpenMU.',
        }),
      };
    }

    if (
      level !== 0 || option !== 0 || luck || skill || exlOptions.some(Boolean) ||
      ancientStamina !== 0 || fenrirVariant !== 0
    ) {
      return {
        ok: false,
        message: L(lang, {
          en: 'Options are fixed by the OpenMU offer. Select the base item without custom options.',
          th: 'ออปชันถูกกำหนดโดย OpenMU กรุณาเลือกไอเทมพื้นฐานโดยไม่เพิ่มออปชัน',
          pt: 'As opções são fixadas pela oferta OpenMU. Selecione o item base.',
          ru: 'Опции задаются предложением OpenMU. Выберите базовый предмет.',
          es: 'Las opciones están fijadas por OpenMU. Selecciona el objeto base.',
          bg: 'Опциите се определят от OpenMU. Изберете базовия предмет.',
        }),
      };
    }

    const storageKey = `openmu:pending-purchase:${currentAccount.username.toLowerCase()}:${item.uid}`;
    const persistedKey = window.localStorage.getItem(storageKey);
    const idempotencyKey =
      pendingPurchaseKeys.current.get(item.uid) || persistedKey || crypto.randomUUID();
    pendingPurchaseKeys.current.set(item.uid, idempotencyKey);
    window.localStorage.setItem(storageKey, idempotencyKey);
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
        if (!data?.pending) {
          pendingPurchaseKeys.current.delete(item.uid);
          window.localStorage.removeItem(storageKey);
        }
        if (typeof data?.remainingCredits === 'number') {
          updateCurrentAccount((acc) => ({
            ...acc,
            credits: data.remainingCredits,
          }));
        }
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

      pendingPurchaseKeys.current.delete(item.uid);
      window.localStorage.removeItem(storageKey);

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
          en: 'The order result is unknown. Retry this same item to reconcile the existing order; do not submit a different purchase.',
          th: 'ยังไม่ทราบผลคำสั่งซื้อ กรุณากดซื้อไอเทมเดิมอีกครั้งเพื่อตรวจสอบคำสั่งซื้อเดิม และอย่าสร้างคำสั่งซื้ออื่น',
          pt: 'O resultado é desconhecido. Tente novamente o mesmo item para reconciliar o pedido existente.',
          ru: 'Результат заказа неизвестен. Повторите покупку того же предмета для сверки заказа.',
          es: 'El resultado es desconocido. Reintenta el mismo artículo para conciliar el pedido existente.',
          bg: 'Резултатът е неизвестен. Опитайте отново същия предмет, за да сверите поръчката.',
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
      openAuthModal();
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
  const handleBuyCharacter400 = async (
    charName: string,
    classCode: MuClassCode
  ) => {
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

    try {
      const response = await apiFetch('/api/accounts/characters/buy-400', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName: cleanName,
          classCode,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        return {
          ok: false,
          message:
            data?.message ||
            L(lang, {
              en: 'Failed to purchase character.',
              th: 'ไม่สามารถซื้อตัวละครได้ กรุณาตรวจสอบเครดิตและสถานะตัวละคร',
              pt: 'Falha ao comprar personagem.',
              ru: 'Не удалось купить персонажа.',
              es: 'Error al comprar el personaje.',
              bg: 'Неуспешна покупка на герой.',
            }),
        };
      }

      if (Array.isArray(data.characters)) {
        setCharacters((prev) => {
          const otherChars = prev.filter(
            (c) =>
              c.accountId.toLowerCase() !==
              currentAccount.username.toLowerCase()
          );
          return [...otherChars, ...data.characters];
        });
      }
      if (typeof data.newCredits === 'number') {
        updateCurrentAccount((acc) => ({
          ...acc,
          credits: data.newCredits,
        }));
      }

      appendShopLog(
        `Purchased Lv.400 Class 3 character "${cleanName}" (${calc.classDef.name}) with ${calc.totalPoints} pts for ${BUY_CHAR_400_CREDITS} credits`,
        undefined,
        { action: 'BUY_CHARACTER_400' }
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
    } catch {
      return {
        ok: false,
        message: L(lang, {
          en: 'Network error while purchasing character.',
          th: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์',
          pt: 'Erro de rede ao comprar personagem.',
          ru: 'Ошибка сети при покупке персонажа.',
          es: 'Error de red al comprar el personaje.',
          bg: 'Мрежова грешка при покупка на герой.',
        }),
      };
    }
  };

  // 6. Delete Level 400 Character (+300 Credits)
  const handleDeleteCharacter400 = async (
    charName: string,
    deleteCode: string
  ) => {
    if (!currentAccount) return requireAuthResponse();

    const cleanCode = (deleteCode || '').trim();
    if (cleanCode.length < 4 || cleanCode.length > 32) {
      return {
        ok: false,
        message: L(lang, {
          en: 'Please enter your Character Delete Code or account password.',
          th: 'กรุณากรอกรหัสสำหรับลบตัวละคร (Security Code) หรือรหัสผ่านของบัญชี',
          pt: 'Digite seu código de exclusão ou senha da conta.',
          ru: 'Введите код удаления персонажа или пароль аккаунта.',
          es: 'Ingresa tu código de borrado o contraseña de cuenta.',
          bg: 'Въведете код за изтриване или парола на акаунта.',
        }),
      };
    }

    try {
      const response = await apiFetch('/api/accounts/characters/delete-400', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName: charName.trim(),
          deleteCode: cleanCode,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        return {
          ok: false,
          message:
            data?.message ||
            L(lang, {
              en: 'Failed to delete character for credits.',
              th: 'ไม่สามารถลบตัวละครเพื่อแลกเครดิตได้ กรุณาตรวจสอบรหัสยืนยันและสถานะ Offline',
              pt: 'Falha ao excluir personagem por créditos.',
              ru: 'Не удалось удалить персонажа за кредиты.',
              es: 'Error al eliminar el personaje por créditos.',
              bg: 'Неуспешно изтриване на герой за кредити.',
            }),
        };
      }

      const reward =
        typeof data.rewardCredits === 'number'
          ? data.rewardCredits
          : DELETE_CHAR_400_REWARD_CREDITS;

      if (Array.isArray(data.characters)) {
        setCharacters((prev) => {
          const otherChars = prev.filter(
            (c) =>
              c.accountId.toLowerCase() !==
              currentAccount.username.toLowerCase()
          );
          return [...otherChars, ...data.characters];
        });
      } else {
        setCharacters((prev) =>
          prev.filter((c) => c.name.toLowerCase() !== charName.toLowerCase())
        );
      }

      if (typeof data.newCredits === 'number') {
        updateCurrentAccount((acc) => ({
          ...acc,
          credits: data.newCredits,
        }));
      }

      appendShopLog(
        `Deleted Lv.400 character "${charName}" for +${reward} Credits`,
        undefined,
        { action: 'DELETE_CHARACTER_400' }
      );

      const msg = L(lang, {
        en: `Deleted "${charName}" (Lv.400) and credited +${reward.toLocaleString()} Credits!`,
        th: `ลบตัวละคร "${charName}" (Lv.400) สำเร็จ! ได้รับ +${reward.toLocaleString()} Credits`,
        pt: `Personagem "${charName}" (Nv.400) excluído! +${reward.toLocaleString()} Créditos adicionados.`,
        ru: `Персонаж «${charName}» (400 ур.) удалён! Начислено +${reward.toLocaleString()} кредитов.`,
        es: `¡"${charName}" (Lv.400) eliminado! Recibiste +${reward.toLocaleString()} Créditos.`,
        bg: `"${charName}" (400 ниво) е изтрит! Получихте +${reward.toLocaleString()} кредита.`,
      });
      showToast(msg);
      return { ok: true, message: msg };
    } catch {
      return {
        ok: false,
        message: L(lang, {
          en: 'Network error while deleting character.',
          th: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์',
          pt: 'Erro de rede ao excluir personagem.',
          ru: 'Ошибка сети при удалении персонажа.',
          es: 'Error de red al eliminar el personaje.',
          bg: 'Мрежова грешка при изтриване на герой.',
        }),
      };
    }
  };

  // 7. Redeem Online Hours for Credits (1 Hour = 5 Credits)
  const handleRedeemOnlineHours = async (hoursToRedeem: number) => {
    if (!currentAccount) return requireAuthResponse();
    try {
      const response = await apiFetch('/api/accounts/online-reward/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hoursToRedeem }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        return {
          ok: false,
          message:
            data?.message ||
            L(lang, {
              en: 'Unable to redeem online hours.',
              th: 'ไม่สามารถแลกเวลาออนไลน์เป็นเครดิตได้',
              pt: 'Não foi possível trocar horas online.',
              ru: 'Не удалось обменять онлайн-часы.',
              es: 'No se pudieron canjear las horas online.',
              bg: 'Неуспешна обмяна на онлайн часове.',
            }),
        };
      }

      updateCurrentAccount((acc) => ({
        ...acc,
        credits:
          typeof data.newCredits === 'number' ? data.newCredits : acc.credits,
        onlineMinutes:
          typeof data.remainingOnlineMinutes === 'number'
            ? data.remainingOnlineMinutes
            : acc.onlineMinutes,
        exchangedOnlineHours:
          typeof data.exchangedOnlineHours === 'number'
            ? data.exchangedOnlineHours
            : acc.exchangedOnlineHours,
      }));

      appendShopLog(
        `Exchanged ${data.redeemedHours} online hour(s) for +${data.creditsAdded} Credits`,
        undefined,
        { action: 'ONLINE_TIME_EXCHANGE' }
      );

      const msg = L(lang, {
        en: `Exchanged ${data.redeemedHours} online hour(s) for +${Number(data.creditsAdded || 0).toLocaleString()} Credits!`,
        th: `แลกเวลาออนไลน์ ${data.redeemedHours} ชั่วโมง สำเร็จ! ได้รับ +${Number(data.creditsAdded || 0).toLocaleString()} Credits`,
        pt: `Trocou ${data.redeemedHours}h online por +${Number(data.creditsAdded || 0).toLocaleString()} Créditos!`,
        ru: `Обменено ${data.redeemedHours} ч. онлайна на +${Number(data.creditsAdded || 0).toLocaleString()} кредитов!`,
        es: `¡Canjeaste ${data.redeemedHours}h online por +${Number(data.creditsAdded || 0).toLocaleString()} Créditos!`,
        bg: `Обменихте ${data.redeemedHours}ч онлайн за +${Number(data.creditsAdded || 0).toLocaleString()} кредита!`,
      });
      showToast(msg);
      return { ok: true, message: msg };
    } catch {
      return {
        ok: false,
        message: L(lang, {
          en: 'Network error while redeeming online time.',
          th: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์',
          pt: 'Erro de rede ao trocar horas online.',
          ru: 'Ошибка сети при обмене онлайн-времени.',
          es: 'Error de red al canjear tiempo online.',
          bg: 'Мрежова грешка при обмяна на онлайн време.',
        }),
      };
    }
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
  const handleBuyVip = async (months: number = 1): Promise<{ ok: boolean; message: string }> => {
    if (!currentAccount) return requireAuthResponse();
    const storageKey = `openmu:pending-vip:${currentAccount.username.toLowerCase()}`;
    const stored = window.localStorage.getItem(storageKey);
    let pending: { months: number; idempotencyKey: string } | null = null;
    try { pending = stored ? JSON.parse(stored) : null; } catch { window.localStorage.removeItem(storageKey); }
    if (pending && pending.months !== months) {
      return { ok: false, message: 'A different VIP activation is pending. Retry the original duration first.' };
    }
    pending ??= { months, idempotencyKey: crypto.randomUUID() };
    window.localStorage.setItem(storageKey, JSON.stringify(pending));
    try {
      const response = await apiFetch('/api/shop/vip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': pending.idempotencyKey },
        body: JSON.stringify(pending),
      });
      const data = await response.json();
      if (typeof data.remainingCredits === 'number') {
        updateCurrentAccount((acc) => ({ ...acc, credits: data.remainingCredits }));
      }
      if (!response.ok || !data.ok) {
        if (!data.pending) window.localStorage.removeItem(storageKey);
        return { ok: false, message: data.message || 'VIP activation failed.' };
      }
      window.localStorage.removeItem(storageKey);
      updateCurrentAccount((acc) => ({ ...acc, vipUntil: data.vipUntil }));
      appendShopLog(`Activated/extended VIP +${months * 30} days for ${data.chargedCredits} Credits`);
      showToast(data.message);
      return { ok: true, message: data.message };
    } catch {
      return { ok: false, message: 'VIP activation result is unknown. Retry the same duration to reconcile it.' };
    }
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

  const handleAdminAdjustVaultZen = async (username: string, amount: number) => {
    try {
      const res = await apiFetch('/api/admin/accounts/adjust-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          vaultZenDelta: amount,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok || !data?.account) {
        const msg =
          data?.message ||
          L(lang, {
            en: 'Failed to update warehouse Zen on server.',
            th: 'ไม่สามารถอัปเดตยอด Zen ในฐานข้อมูลได้',
            pt: 'Falha ao atualizar Zen no servidor.',
            ru: 'Не удалось обновить Zen на сервере.',
            es: 'Error al actualizar Zen en el servidor.',
            bg: 'Грешка при обновяване на Zen в сървъра.',
          });
        showToast(msg);
        return { ok: false, message: msg };
      }

      const srvAcc = data.account;
      setAccounts((prev) => {
        const exists = prev.some(
          (acc) => acc.username.toLowerCase() === srvAcc.username.toLowerCase()
        );
        if (exists) {
          return prev.map((acc) =>
            acc.username.toLowerCase() === srvAcc.username.toLowerCase()
              ? {
                  ...acc,
                  credits: Number(srvAcc.credits || 0),
                  vaultMoney: Number(srvAcc.vaultMoney || 0),
                }
              : acc
          );
        }
        return [
          ...prev,
          {
            username: srvAcc.username,
            characterDeleteCode: '',
            credits: Number(srvAcc.credits || 0),
            vaultMoney: Number(srvAcc.vaultMoney || 0),
            vaultItems: [],
            onlineMinutes: 0,
            exchangedOnlineHours: 0,
            isAdmin: Boolean(srvAcc.isAdmin),
            role: srvAcc.role || 'USER',
            isOnline: false,
          },
        ];
      });

      appendShopLog(
        `Admin adjusted ${srvAcc.username}'s vault Zen by ${
          amount >= 0 ? `+${amount.toLocaleString()}` : amount.toLocaleString()
        } (Total: ${Number(srvAcc.vaultMoney || 0).toLocaleString()} Zen)`
      );
      showToast(
        L(lang, {
          en: `Adjusted ${srvAcc.username}'s vault Zen by ${amount.toLocaleString()}`,
          th: `ปรับยอด Zen ในคลังของ ${srvAcc.username} สำเร็จ (${Number(srvAcc.vaultMoney || 0).toLocaleString()} Zen)`,
          pt: `Zen do baú de ${srvAcc.username} ajustado`,
          ru: `Баланс Zen сундука ${srvAcc.username} изменён`,
          es: `Zen del baúl de ${srvAcc.username} ajustado`,
          bg: `Балансът на Zen на ${srvAcc.username} е променен`,
        })
      );
      return {
        ok: true,
        credits: Number(srvAcc.credits || 0),
        vaultMoney: Number(srvAcc.vaultMoney || 0),
      };
    } catch {
      const msg = L(lang, {
        en: 'Network error while updating warehouse Zen.',
        th: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ขณะปรับยอด Zen',
        pt: 'Erro de rede ao atualizar Zen.',
        ru: 'Ошибка сети при обновлении Zen.',
        es: 'Error de red al actualizar Zen.',
        bg: 'Мрежова грешка при обновяване на Zen.',
      });
      showToast(msg);
      return { ok: false, message: msg };
    }
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
    <div className="py-2 sm:py-4">
      <ModernLoginPage
        lang={lang}
        onLoginSuccess={(clean, data) => {
          handleAuthSuccess(clean, data);
          setLoginModalOpen(false);
        }}
      />
    </div>
  );

  return (
    <div
      className={`min-h-screen flex flex-col relative overflow-x-hidden ${
        classicMode
          ? 'classic-theme bg-[#CCCCCC] text-zinc-900'
          : 'bg-[#090d16] text-zinc-100'
      }`}
    >
      {/* Ambient Background Grid & Radial Glow matching muorigins.online */}
      {!classicMode && (
        <>
          <div className="pointer-events-none fixed inset-0 grid-bg opacity-70" />
          <div className="pointer-events-none fixed inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.09),rgba(139,92,246,0.04)_45%,transparent_75%)]" />
        </>
      )}

      {/* Top Bar: Brand Wordmark matching muorigins.online */}
      <header className="relative z-20 flex items-center justify-between gap-8 px-6 py-4 border-b border-white/10 bg-[#090d16]/90 backdrop-blur-xl">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            setActiveModule('home');
          }}
          className="inline-flex items-center whitespace-nowrap shrink-0"
        >
          <span className="font-display text-xl font-black tracking-wider text-white">
            MU <span className="text-gradient-gold">ORIGINS</span>
          </span>
        </a>

        {/* Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {currentAccount && (
            <button
              type="button"
              onClick={() => setActiveModule('howto')}
              className="btn-shine px-4 py-2 text-xs font-extrabold text-[#090d16] bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] rounded-xl shadow-[0_8px_25px_-6px_rgba(212,175,55,0.45)] hover:brightness-110 transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              {currentAccount.credits.toLocaleString()} Credits ·{' '}
              {(wCoinCByAccount[currentAccount.username.toLowerCase()] ?? 0).toLocaleString()} WCoinC ·{' '}
              {t('nav_topup', lang)}
            </button>
          )}
        </div>
      </header>

      {/* Secondary Workspace Status & Language/Auth Bar */}
      <div className="relative z-20 px-6 py-2.5 border-b border-white/10 bg-[#0d1322]/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3 text-white/75">
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
                  className="inline-flex items-center gap-1.5 text-amber-300 font-bold hover:text-amber-200 hover:underline transition-colors cursor-pointer"
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
            <span className="text-white/60">
              {t('logged_in_as', lang)}{' '}
              <strong className="text-white/90">{t('guest_label', lang)}</strong>
              <span aria-hidden="true" className="mx-2">·</span>
              <span className="text-amber-300/90">Season 6 Episode 3</span>
            </span>
          )}
        </div>

        {/* Rightmost Workspace Controls */}
        <div className="flex flex-wrap items-center gap-2.5 ml-auto">
          {currentAccount && (
            <span
              className={`text-[11px] font-medium whitespace-nowrap ${
                currentAccount.isOnline ? 'text-amber-300' : 'text-white/65'
              }`}
            >
              {t('ingame_status', lang)}{' '}
              {currentAccount.isOnline
                ? t('status_online', lang)
                : t('status_offline', lang)}
            </span>
          )}

          {/* Language Selector (6 Languages) */}
          <div className="flex items-center gap-1.5 bg-[#090d16]/90 border border-white/15 rounded-lg px-2.5 py-1">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LanguageCode)}
              className="bg-transparent text-[11px] text-white/90 focus:outline-none cursor-pointer"
            >
              <option value="Thai" className="bg-[#090d16]">
                ภาษาไทย (Thai)
              </option>
              <option value="English" className="bg-[#090d16]">
                English
              </option>
              <option value="Portuguese_BR" className="bg-[#090d16]">
                Português (Brasil)
              </option>
              <option value="Russian" className="bg-[#090d16]">
                Русский (Russian)
              </option>
              <option value="Spanish" className="bg-[#090d16]">
                Español (Spanish)
              </option>
              <option value="Bulgarian" className="bg-[#090d16]">
                Български (Bulgarian)
              </option>
            </select>
          </div>

          {/* Vault Theme Toggle */}
          <button
            type="button"
            onClick={() => setClassicMode(!classicMode)}
            className="px-2.5 py-1 rounded-lg border border-white/15 bg-[#090d16]/90 hover:bg-white/10 text-[11px] text-white/80 cursor-pointer whitespace-nowrap transition-colors"
          >
            {classicMode
              ? t('theme_dark', lang)
              : t('theme_classic', lang)}
          </button>

          {/* Far-Right Auth Action: Sign Out when logged in */}
          {currentAccount && (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25 text-[11px] font-semibold text-rose-300 cursor-pointer whitespace-nowrap transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('logout_btn', lang)}</span>
            </button>
          )}
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl fantasy-panel gold-border text-amber-300 text-xs font-medium shadow-2xl">
          {toastMessage}
        </div>
      )}

      {/* Main Two-Column Layout: Left Menu (visible only after login) + Content Area */}
      <div className="relative z-10 flex-1 max-w-[1440px] w-full mx-auto flex flex-col md:flex-row gap-6 p-6">
        {/* Left Navigation Menu — Strictly visible ONLY when logged in */}
        {currentAccount && (
          <aside className="w-full md:w-64 shrink-0 space-y-4">
            {/* Mu Origins Title Card (No Logo) */}
            <button
              type="button"
              onClick={() => setActiveModule('home')}
              className="w-full fantasy-panel gold-border rounded-2xl px-4 py-3.5 text-center hover:brightness-110 transition-all cursor-pointer block"
            >
              <div className="text-sm font-display font-black tracking-wider text-white">
                MU <span className="text-gradient-gold">ORIGINS</span>
              </div>
              <div className="text-[11px] text-white/55 truncate mt-0.5">
                Season 6 Episode 3 · Portal
              </div>
            </button>

            <div className="fantasy-panel gold-border rounded-2xl overflow-hidden">
              <div className="px-4 py-3 bg-[#090d16]/60 border-b border-white/10 text-[11px] font-bold tracking-wider text-amber-300/90">
                {t('nav_player_menu', lang)}
              </div>
              <div className="p-2 space-y-1">
                {navMenuPlayer.map((item) => {
                  const isActive = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveModule(item.id)}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs flex items-center gap-2.5 transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] text-[#090d16] font-extrabold shadow-md shadow-amber-500/20'
                          : 'text-white/75 hover:bg-white/10 hover:text-white'
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
              <div className="fantasy-panel gold-border rounded-2xl overflow-hidden">
                <div className="px-4 py-3 bg-[#090d16]/60 border-b border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider text-emerald-400">
                    {t('nav_admin_menu', lang)}
                  </span>
                  <span className="text-[10px] font-mono-tabular font-bold text-emerald-300">
                    ADMIN
                  </span>
                </div>
                <div className="p-2 space-y-1">
                  {navMenuAdmin.map((item) => {
                    const isActive = activeModule === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveModule(item.id)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs flex items-center gap-2.5 transition-all cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'bg-emerald-500 text-[#090d16] font-extrabold shadow-md shadow-emerald-500/20'
                            : 'text-white/75 hover:bg-white/10 hover:text-white'
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
        )}

        {/* Main Module Viewport */}
        <main className="flex-1 min-w-0">
          {!currentAccount ? (
            <GuestAuthPromptCard />
          ) : (
            <>
          {activeModule === 'home' &&
            (currentAccount ? (
              <div className="space-y-6">
                {/* Top Summary Row: My Shop + My Characters */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* My Shop Card */}
                  <div className="lg:col-span-4 p-6 rounded-2xl fantasy-panel gold-border space-y-4">
                    <h2 className="text-sm font-display font-bold text-amber-400 tracking-wider border-b border-white/10 pb-2.5">
                      {t('my_shop', lang)}
                    </h2>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">
                          {t('logged_in_as', lang)}
                        </span>
                        <span className="font-bold text-white">
                          {currentAccount.username}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">
                          {t('credits', lang)}
                        </span>
                        <span className="font-mono-tabular font-bold text-amber-400">
                          {currentAccount.credits.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">
                          {t('vault_zen', lang)} (Max 900M)
                        </span>
                        <span className="font-mono-tabular font-semibold text-white/90">
                          {currentAccount.vaultMoney.toLocaleString()} Zen
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">
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
                        <span className="text-white/60 flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                          {t('vip_status', lang)}
                        </span>
                        {currentAccount.vipUntil &&
                        new Date(currentAccount.vipUntil) > new Date() ? (
                          <button
                            type="button"
                            onClick={() => setActiveModule('vip')}
                            className="font-mono-tabular font-bold text-amber-300 hover:underline cursor-pointer text-[11px]"
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
                        className="btn-shine flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] text-[#090d16] font-extrabold text-xs transition-all cursor-pointer whitespace-nowrap"
                      >
                        {t('btn_buy_items', lang)}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveModule('buychar')}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-[#090d16]/80 hover:bg-white/10 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {t('btn_buy_char400', lang)}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveModule('howto')}
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#090d16] font-extrabold text-xs transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {t('btn_topup', lang)}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveModule('vip')}
                        className="w-full py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>
                          {t('btn_buy_vip', lang)} (800 Cr · EXP +30% & Drop +20%)
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Account Characters Roster */}
                  <div className="lg:col-span-8 p-6 rounded-2xl fantasy-panel gold-border space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <h2 className="text-sm font-display font-bold text-white tracking-wider">
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
                      <div className="py-8 text-center text-xs text-white/60 space-y-3">
                        <div>{t('no_characters', lang)}</div>
                        <button
                          type="button"
                          onClick={() => setActiveModule('buychar')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-semibold cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{t('btn_buy_char400', lang)}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="text-white/55 border-b border-white/10">
                            <tr>
                              <th className="py-2.5 pr-3">
                                {t('table_name', lang)}
                              </th>
                              <th className="py-2.5 px-3">
                                {t('table_class', lang)}
                              </th>
                              <th className="py-2.5 px-3 text-center">
                                {t('table_level', lang)}
                              </th>
                              <th className="py-2.5 px-3 text-right">
                                {t('table_stats', lang)}
                              </th>
                              <th className="py-2.5 px-3 text-right">
                                {t('table_free_pts', lang)}
                              </th>
                              <th className="py-2.5 pl-3 text-right">
                                {t('table_action', lang)}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {myCharacters.map((ch) => {
                              const cls = MU_CLASSES.find(
                                (m) => m.code === ch.classCode
                              );
                              return (
                                <tr key={ch.name} className="hover:bg-white/5 transition-colors">
                                  <td className="py-2.5 pr-3 font-bold text-white">
                                    {ch.name}
                                  </td>
                                  <td className="py-2.5 px-3 text-white/80">
                                    {cls
                                      ? getClassDisplayName(cls, lang)
                                      : ch.classCode}{' '}
                                    <span className="text-[10px] text-amber-400 font-mono-tabular">
                                      ({cls?.pointsPerLevel || 5}pt/lv)
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-mono-tabular text-amber-400 font-bold">
                                    Lv.{ch.level}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono-tabular text-white/75 text-[11px]">
                                    {ch.strength}/{ch.agility}/{ch.vitality}/
                                    {ch.energy}
                                    {ch.command > 0 ? `/${ch.command}` : ''}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono-tabular text-emerald-400 font-bold">
                                    {ch.levelUpPoints.toLocaleString()}
                                  </td>
                                  <td className="py-2.5 pl-3 text-right">
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
                                      <span className="text-white/50">
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
                <div className="p-6 rounded-2xl fantasy-panel gold-border space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                    <div>
                      <h2 className="text-sm font-display font-bold text-white tracking-wider">
                        {t('vault_grid_title', lang)}
                      </h2>
                      <p className="text-xs text-white/60 mt-0.5">
                        {t('vault_grid_desc', lang)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveModule('items')}
                      className="btn-shine px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] text-[#090d16] transition-all cursor-pointer self-start whitespace-nowrap"
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
              onRequireLogin={() => openAuthModal()}
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
              <OnlineHoursRewardModule
                account={currentAccount}
                lang={lang}
                onRedeemOnlineHours={handleRedeemOnlineHours}
              />
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
              onAdjustCredits={async (username, delta) => {
                try {
                  const res = await apiFetch(
                    '/api/admin/accounts/adjust-balance',
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        username,
                        creditsDelta: delta,
                      }),
                    }
                  );
                  const data = await res.json().catch(() => null);
                  if (!res.ok || !data?.ok || !data?.account) {
                    const msg =
                      data?.message ||
                      L(lang, {
                        en: 'Failed to update credits on server.',
                        th: 'ไม่สามารถอัปเดตเครดิตในฐานข้อมูลได้',
                        pt: 'Falha ao atualizar créditos no servidor.',
                        ru: 'Не удалось обновить кредиты на сервере.',
                        es: 'Error al actualizar créditos en el servidor.',
                        bg: 'Грешка при обновяване на кредити в сървъра.',
                      });
                    showToast(msg);
                    return { ok: false, message: msg };
                  }

                  const srvAcc = data.account;
                  const updatedBalance = Number(srvAcc.credits || 0);
                  const updatedVaultMoney = Number(srvAcc.vaultMoney || 0);

                  setAccounts((prev) => {
                    const exists = prev.some(
                      (a) =>
                        a.username.toLowerCase() ===
                        srvAcc.username.toLowerCase()
                    );
                    if (exists) {
                      return prev.map((a) =>
                        a.username.toLowerCase() ===
                        srvAcc.username.toLowerCase()
                          ? {
                              ...a,
                              credits: updatedBalance,
                              vaultMoney: updatedVaultMoney,
                            }
                          : a
                      );
                    }
                    return [
                      ...prev,
                      {
                        username: srvAcc.username,
                        characterDeleteCode: '',
                        credits: updatedBalance,
                        vaultMoney: updatedVaultMoney,
                        vaultItems: [],
                        onlineMinutes: 0,
                        exchangedOnlineHours: 0,
                        isAdmin: Boolean(srvAcc.isAdmin),
                        role: srvAcc.role || 'USER',
                        isOnline: false,
                      },
                    ];
                  });

                  appendShopLog(
                    `Admin adjusted ${srvAcc.username}'s credits by ${
                      delta >= 0
                        ? `+${delta.toLocaleString()}`
                        : delta.toLocaleString()
                    } (Total: ${updatedBalance.toLocaleString()} Cr)`
                  );
                  showToast(
                    L(lang, {
                      en: `Adjusted ${srvAcc.username}'s credits (${updatedBalance.toLocaleString()} Cr)`,
                      th: `ปรับเครดิตของ ${srvAcc.username} สำเร็จ (คงเหลือ ${updatedBalance.toLocaleString()} Cr)`,
                      pt: `Créditos de ${srvAcc.username} ajustados`,
                      ru: `Кредиты ${srvAcc.username} изменены`,
                      es: `Créditos de ${srvAcc.username} ajustados`,
                      bg: `Кредитите на ${srvAcc.username} са променени`,
                    })
                  );
                  return {
                    ok: true,
                    credits: updatedBalance,
                    vaultMoney: updatedVaultMoney,
                  };
                } catch {
                  const msg = L(lang, {
                    en: 'Network error while updating credits.',
                    th: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ขณะปรับเครดิต',
                    pt: 'Erro de rede ao atualizar créditos.',
                    ru: 'Ошибка сети при обновлении кредитов.',
                    es: 'Error de red al actualizar créditos.',
                    bg: 'Мрежова грешка при обновяване на кредити.',
                  });
                  showToast(msg);
                  return { ok: false, message: msg };
                }
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
            </>
          )}
        </main>
      </div>

      {/* Footer matching muorigins.online */}
      <footer className="relative z-20 mt-auto py-5 px-6 border-t border-white/10 bg-[#090d16]/95 text-center text-xs text-white/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © 2026 <span className="text-white font-semibold">MuOrigins</span> ·{' '}
            <span className="text-amber-300/90">Season 6 Episode 3</span>
          </div>
          <a
            href="https://muorigins.online/"
            target="_blank"
            rel="noreferrer"
            className="text-amber-400 hover:text-amber-300 hover:underline transition-colors"
          >
            muorigins.online
          </a>
        </div>
      </footer>

      {/* Account Login Modal */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl my-8">
            <ModernLoginPage
              isModal={true}
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
