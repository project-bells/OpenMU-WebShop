import { INITIAL_WEBSHOP_ITEMS } from './webshopItems';
import {
  AccountData,
  Character,
  IpBanEntry,
  ItemGroup,
  LogEntry,
  WebShopConfig,
} from '../types/webshop';

export const EGIS_MU_LOGO_URL =
  '/assets/aistudio/Gemini_Generated_Image_hppasvhppasvhppa_7bd6cc6a.jpg';

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
    unbanchar: 100, // 100 Credits: Unban Character fee
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
    title: 'Welcome to The Egis-MU WEBSHOP',
    admins: 'admin,admin01',
    servername: 'Continent of Egis-MU S6E3',
    serverlink: '#',
    topcredits: 20,
    s3classes: true,
    solidbans: '',
    bannedcode: 1,
    whshow: true,
    addshow: true,
  },
};

export const INITIAL_ACCOUNTS: AccountData[] = [
  {
    username: 'user01',
    characterDeleteCode: '123456',
    credits: 0,
    vaultMoney: 0,
    vaultItems: [],
    onlineMinutes: 0,
    exchangedOnlineHours: 0,
    isAdmin: false,
    isMasterAdmin: false,
    role: 'USER',
    isOnline: false,
  },
  {
    username: 'admin01',
    characterDeleteCode: '123456',
    credits: 0,
    vaultMoney: 0,
    vaultItems: [],
    onlineMinutes: 0,
    exchangedOnlineHours: 0,
    isAdmin: true,
    isMasterAdmin: false,
    role: 'ADMIN',
    isOnline: false,
  },
];

export const INITIAL_CHARACTERS: Character[] = [];

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

export const INITIAL_LOGS: LogEntry[] = [];

export const INITIAL_BANS: IpBanEntry[] = [];
