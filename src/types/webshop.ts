import { WebShopItem } from '../data/webshopItems';

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export type ModuleId =
  | 'home'
  | 'login'
  | 'items'
  | 'resets'
  | 'buychar'
  | 'delchar'
  | 'onlinereward'
  | 'points'
  | 'getzen'
  | 'vip'
  | 'classchange'
  | 'charnamechg'
  | 'unban'
  | 'howto'
  // Admin modules
  | 'admin_roles'
  | 'im'
  | 'groupmngr'
  | 'u_credits'
  | 'log'
  | 'search'
  | 'thetop'
  | 'ipbanish'
  | 'whviewer';

export type LanguageCode =
  | 'English'
  | 'Thai'
  | 'Portuguese_BR'
  | 'Bulgarian'
  | 'Spanish'
  | 'Russian';

export interface VaultItemInstance {
  instanceId: string;
  serial: string; // 8-char hex serial e.g. "00A4F812"
  itemHex?: string; // 32-char MU Season 6 item hex
  slotIndex: number; // 0..119 in 8x15 warehouse grid
  itemUid: number;
  itemId: number;
  itemType: number;
  name: string;
  X: number;
  Y: number;
  level: number; // 0..13
  option: number; // 0..7 (multiplied by 4, 5, or 1%)
  luck: boolean;
  skill: boolean;
  exlOptions: boolean[]; // [ex1, ex2, ex3, ex4, ex5, ex6]
  ancientStamina: 0 | 5 | 10;
  fenrirVariant: 0 | 1 | 2 | 3; // 0=normal, 1=Destroy, 2=Protect, 3=Golden
  durability: number;
  paidCredits: number;
  canSellBack: boolean;
  purchasedAt: number;
}

export type MuClassCode =
  | 'dw'
  | 'sm'
  | 'gm'
  | 'dk'
  | 'bk'
  | 'bm'
  | 'elf'
  | 'me'
  | 'he'
  | 'mg'
  | 'dm'
  | 'dl'
  | 'le';

export interface Character {
  name: string;
  accountId: string;
  classCode: MuClassCode;
  classId: number;
  level: number;
  resets: number;
  levelUpPoints: number;
  strength: number;
  agility: number;
  vitality: number;
  energy: number;
  command: number;
  money: number; // Zen on character
  ctlCode: number; // 0 = normal, 1 = banned
  isOnline: boolean;
}

export interface AccountData {
  username: string;
  password?: string;
  characterDeleteCode?: string; // Numeric-only Character Delete Code (รหัสสำหรับลบตัวละคร)
  credits: number;
  vaultMoney: number; // Zen in warehouse (max 900M when buying Zen)
  vaultItems: VaultItemInstance[];
  onlineMinutes: number; // Unredeemed online minutes (60 mins = 1 hr = 5 Credits)
  exchangedOnlineHours: number; // Total hours already redeemed for credits
  vipUntil?: string | null; // ISO timestamp string of VIP expiration (800 Cr/month)
  isAdmin: boolean;
  role?: UserRole; // 'USER' | 'ADMIN' | 'SUPER_ADMIN' (strictly defaults to USER)
  isMasterAdmin?: boolean; // Protected .env Master Admin (cannot be deleted or demoted)
  isOnline: boolean;
}

export interface ItemGroup {
  id: number;
  name: string;
  credits: number;
  basedon: number; // uid of root WebShopItem
  memberUids: number[]; // uids of items in this set
}

export interface LogEntry {
  id: number;
  accountId: string;
  ipAddress?: string;
  action?: string;
  details: string;
  dateline: number; // unix timestamp seconds
  itemSerial?: string;
  itemHex?: string;
}

export interface IpBanEntry {
  id: number;
  name: string;
  iprange: string;
  displtxt: string;
  attempts: number;
}

export interface WebShopConfig {
  credits: {
    reset: number; // Cost for Reset Points
    buychar400: number; // 500 Credits: Cost to buy a Level 400 Class 3 character
    deletechar400: number; // 300 Credits: Reward for deleting a Level 400 character
    onlineHourReward: number; // 5 Credits per 1 hour online
    classchg: number;
    itemexl: number;
    itemluck: number;
    itemskill: number;
    itemlvl: number;
    itemopt: number;
    ancient1: number;
    ancient2: number;
    unbanchar: number;
    points: number; // points per 1 credit
    multiplier: number;
    zerocredit: number;
    fenrir_destroy: number;
    fenrir_protect: number;
    golden_fenrir: number;
    zen: number; // zen per 1 credit (10,000,000 -> 50 Credits = 500M)
    zenPackageCredits: number; // 50 Credits
    zenPackageAmount: number; // 500,000,000 Zen (500M)
    sellback_Q: number; // 0.5 = 50%
    namechg: number;
    vipMonthlyCost: number; // 800 Credits / month (30 days)
  };
  limit: {
    item_level: number;
    item_option: number;
    item_excellent: number;
    zen_limit: number; // 900,000,000 (900M) Warehouse Zen limit
  };
  misc: {
    title: string;
    admins: string;
    servername: string;
    serverlink: string;
    topcredits: number;
    s3classes: boolean;
    solidbans: string;
    bannedcode: number;
    whshow: boolean;
    addshow: boolean;
  };
}

export type { WebShopItem };
