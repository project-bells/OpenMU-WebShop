import { MuClassCode, VaultItemInstance, WebShopConfig, WebShopItem } from '../types/webshop';

export const CATEGORY_NAMES: Record<
  number,
  { en: string; th: string; pt: string; ru: string; es: string; bg: string }
> = {
  0: {
    en: 'Swords',
    th: 'ดาบ (Swords)',
    pt: 'Espadas (Swords)',
    ru: 'Мечи (Swords)',
    es: 'Espadas (Swords)',
    bg: 'Мечове (Swords)',
  },
  1: {
    en: 'Axes',
    th: 'ขวาน (Axes)',
    pt: 'Machados (Axes)',
    ru: 'Топоры (Axes)',
    es: 'Hachas (Axes)',
    bg: 'Брадви (Axes)',
  },
  2: {
    en: 'Maces',
    th: 'กระบองและค้อน (Maces)',
    pt: 'Maças e Cetros (Maces)',
    ru: 'Булавы и Молоты (Maces)',
    es: 'Mazas y Martillos (Maces)',
    bg: 'Боздугани (Maces)',
  },
  3: {
    en: 'Spears',
    th: 'หอกและทวน (Spears)',
    pt: 'Lanças (Spears)',
    ru: 'Копья (Spears)',
    es: 'Lanzas (Spears)',
    bg: 'Копия (Spears)',
  },
  4: {
    en: 'Bows & Crossbows',
    th: 'ธนูและหน้าไม้ (Bows & Crossbows)',
    pt: 'Arcos e Bestas (Bows)',
    ru: 'Луки и Арбалеты (Bows)',
    es: 'Arcos y Ballestas (Bows)',
    bg: 'Лъкове и Арбалети (Bows)',
  },
  5: {
    en: 'Staffs',
    th: 'คทาเวทย์ (Staffs)',
    pt: 'Cajados (Staffs)',
    ru: 'Посохи (Staffs)',
    es: 'Báculos (Staffs)',
    bg: 'Жезли (Staffs)',
  },
  6: {
    en: 'Helmets',
    th: 'หมวกเกราะ (Helmets)',
    pt: 'Elmos (Helmets)',
    ru: 'Шлемы (Helmets)',
    es: 'Cascos (Helmets)',
    bg: 'Шлемове (Helmets)',
  },
  7: {
    en: 'Armors',
    th: 'เสื้อเกราะ (Armors)',
    pt: 'Armaduras (Armors)',
    ru: 'Броня (Armors)',
    es: 'Armaduras (Armors)',
    bg: 'Брони (Armors)',
  },
  8: {
    en: 'Gloves',
    th: 'ถุงมือ (Gloves)',
    pt: 'Luvas (Gloves)',
    ru: 'Перчатки (Gloves)',
    es: 'Guantes (Gloves)',
    bg: 'Ръкавици (Gloves)',
  },
  9: {
    en: 'Pants',
    th: 'กางเกงเกราะ (Pants)',
    pt: 'Calças (Pants)',
    ru: 'Штаны (Pants)',
    es: 'Pantalones (Pants)',
    bg: 'Панталони (Pants)',
  },
  10: {
    en: 'Boots',
    th: 'รองเท้าเกราะ (Boots)',
    pt: 'Botas (Boots)',
    ru: 'Ботинки (Boots)',
    es: 'Botas (Boots)',
    bg: 'Ботуши (Boots)',
  },
  11: {
    en: 'Shields',
    th: 'โล่ป้องกัน (Shields)',
    pt: 'Escudos (Shields)',
    ru: 'Щиты (Shields)',
    es: 'Escudos (Shields)',
    bg: 'Щитове (Shields)',
  },
  12: {
    en: 'Rings, Pendants, Others',
    th: 'แหวน สร้อย และสัตว์ขี่ (Rings & Pets)',
    pt: 'Anéis, Pendants e Pets',
    ru: 'Кольца, Амулеты и Питомцы',
    es: 'Anillos, Colgantes y Mascotas',
    bg: 'Пръстени, Амулети и Любимци',
  },
  13: {
    en: 'Jewels, Quest',
    th: 'เพชรและไอเทมเควส (Jewels & Quest)',
    pt: 'Joias e Itens de Quest',
    ru: 'Камни и Квестовые предметы',
    es: 'Joyas e Ítems de Misión',
    bg: 'Камъни и Предмети за Куестове',
  },
  14: {
    en: 'Wings, Capes',
    th: 'ปีกและผ้าคลุม (Wings & Capes)',
    pt: 'Asas e Capas (Wings)',
    ru: 'Крылья и Плащи (Wings)',
    es: 'Alas y Capas (Wings)',
    bg: 'Крила и Наметала (Wings)',
  },
  15: {
    en: 'Scrolls, Orbs, Consumables',
    th: 'คัมภีร์เวทย์และลูกแก้ว (Scrolls & Orbs)',
    pt: 'Pergaminhos e Orbs',
    ru: 'Свитки и Сферы заклинаний',
    es: 'Pergaminos y Orbes',
    bg: 'Свитъци и Кълба',
  },
};

export const INITIAL_STARTING_POINTS = 300;
export const BUY_CHAR_400_CREDITS = 500;
export const DELETE_CHAR_400_REWARD_CREDITS = 300;
export const ONLINE_HOUR_REWARD_CREDITS = 5;
export const ZEN_PURCHASE_CREDITS = 50;
export const ZEN_PURCHASE_AMOUNT = 500_000_000; // 500M
export const WAREHOUSE_ZEN_MAX_LIMIT = 900_000_000; // 900M

export interface MuClassDefinition {
  code: MuClassCode;
  id: number;
  name: string;
  nameTh: string;
  s3: boolean; // True = Class 3 (Grand Master, Blade Master, High Elf, Duel Master, Lord Emperor)
  pointsPerLevel: number; // Base points per level (5 for DW/DK/ELF lineage, 7 for MG/DL lineage)
  hasMarlonAndClass2Quest: boolean; // True for DW/DK/ELF lineage (+20 Class 2 Quest, +180 Marlon Lv.220 Quest)
  baseStr: number;
  baseAgi: number;
  baseVit: number;
  baseEne: number;
  baseCmd: number;
  tierLabel: string;
}

export const MU_CLASSES: readonly MuClassDefinition[] = [
  {
    code: 'dw',
    id: 0,
    name: 'Dark Wizard',
    nameTh: 'นักเวทย์ (Dark Wizard)',
    s3: false,
    pointsPerLevel: 5,
    hasMarlonAndClass2Quest: true,
    baseStr: 18,
    baseAgi: 18,
    baseVit: 15,
    baseEne: 30,
    baseCmd: 0,
    tierLabel: 'คลาส 1 (5 พอยต์/เลเวล)',
  },
  {
    code: 'sm',
    id: 1,
    name: 'Soul Master',
    nameTh: 'โซลมาสเตอร์ (Soul Master)',
    s3: false,
    pointsPerLevel: 5,
    hasMarlonAndClass2Quest: true,
    baseStr: 18,
    baseAgi: 18,
    baseVit: 15,
    baseEne: 30,
    baseCmd: 0,
    tierLabel: 'คลาส 2 (ฐาน 5 พอยต์/เลเวล)',
  },
  {
    code: 'gm',
    id: 2,
    name: 'Grand Master',
    nameTh: 'แกรนด์มาสเตอร์ (Grand Master)',
    s3: true,
    pointsPerLevel: 5,
    hasMarlonAndClass2Quest: true,
    baseStr: 18,
    baseAgi: 18,
    baseVit: 15,
    baseEne: 30,
    baseCmd: 0,
    tierLabel: 'คลาส 3 (ฐาน 5 พอยต์/เลเวล)',
  },
  {
    code: 'dk',
    id: 16,
    name: 'Dark Knight',
    nameTh: 'นักรบ (Dark Knight)',
    s3: false,
    pointsPerLevel: 5,
    hasMarlonAndClass2Quest: true,
    baseStr: 28,
    baseAgi: 20,
    baseVit: 25,
    baseEne: 10,
    baseCmd: 0,
    tierLabel: 'คลาส 1 (5 พอยต์/เลเวล)',
  },
  {
    code: 'bk',
    id: 17,
    name: 'Blade Knight',
    nameTh: 'เบลดไนท์ (Blade Knight)',
    s3: false,
    pointsPerLevel: 5,
    hasMarlonAndClass2Quest: true,
    baseStr: 28,
    baseAgi: 20,
    baseVit: 25,
    baseEne: 10,
    baseCmd: 0,
    tierLabel: 'คลาส 2 (ฐาน 5 พอยต์/เลเวล)',
  },
  {
    code: 'bm',
    id: 18,
    name: 'Blade Master',
    nameTh: 'เบลดมาสเตอร์ (Blade Master)',
    s3: true,
    pointsPerLevel: 5,
    hasMarlonAndClass2Quest: true,
    baseStr: 28,
    baseAgi: 20,
    baseVit: 25,
    baseEne: 10,
    baseCmd: 0,
    tierLabel: 'คลาส 3 (ฐาน 5 พอยต์/เลเวล)',
  },
  {
    code: 'elf',
    id: 32,
    name: 'Fairy Elf',
    nameTh: 'เอลฟ์ (Fairy Elf)',
    s3: false,
    pointsPerLevel: 5,
    hasMarlonAndClass2Quest: true,
    baseStr: 22,
    baseAgi: 25,
    baseVit: 20,
    baseEne: 15,
    baseCmd: 0,
    tierLabel: 'คลาส 1 (5 พอยต์/เลเวล)',
  },
  {
    code: 'me',
    id: 33,
    name: 'Muse Elf',
    nameTh: 'มิวส์เอลฟ์ (Muse Elf)',
    s3: false,
    pointsPerLevel: 5,
    hasMarlonAndClass2Quest: true,
    baseStr: 22,
    baseAgi: 25,
    baseVit: 20,
    baseEne: 15,
    baseCmd: 0,
    tierLabel: 'คลาส 2 (ฐาน 5 พอยต์/เลเวล)',
  },
  {
    code: 'he',
    id: 34,
    name: 'High Elf',
    nameTh: 'ไฮเอลฟ์ (High Elf)',
    s3: true,
    pointsPerLevel: 5,
    hasMarlonAndClass2Quest: true,
    baseStr: 22,
    baseAgi: 25,
    baseVit: 20,
    baseEne: 15,
    baseCmd: 0,
    tierLabel: 'คลาส 3 (ฐาน 5 พอยต์/เลเวล)',
  },
  {
    code: 'mg',
    id: 48,
    name: 'Magic Gladiator',
    nameTh: 'เมจิกกลาดิเอเตอร์ (Magic Gladiator)',
    s3: false,
    pointsPerLevel: 7,
    hasMarlonAndClass2Quest: false,
    baseStr: 26,
    baseAgi: 26,
    baseVit: 26,
    baseEne: 26,
    baseCmd: 0,
    tierLabel: 'อาชีพพิเศษ (7 พอยต์/เลเวล)',
  },
  {
    code: 'dm',
    id: 50,
    name: 'Duel Master',
    nameTh: 'ดูเอลมาสเตอร์ (Duel Master)',
    s3: true,
    pointsPerLevel: 7,
    hasMarlonAndClass2Quest: false,
    baseStr: 26,
    baseAgi: 26,
    baseVit: 26,
    baseEne: 26,
    baseCmd: 0,
    tierLabel: 'คลาส 3 พิเศษ (7 พอยต์/เลเวล)',
  },
  {
    code: 'dl',
    id: 64,
    name: 'Dark Lord',
    nameTh: 'ดาร์คลอร์ด (Dark Lord)',
    s3: false,
    pointsPerLevel: 7,
    hasMarlonAndClass2Quest: false,
    baseStr: 26,
    baseAgi: 20,
    baseVit: 20,
    baseEne: 15,
    baseCmd: 25,
    tierLabel: 'อาชีพพิเศษ (7 พอยต์/เลเวล)',
  },
  {
    code: 'le',
    id: 66,
    name: 'Lord Emperor',
    nameTh: 'ลอร์ดเอ็มเพอเรอร์ (Lord Emperor)',
    s3: true,
    pointsPerLevel: 7,
    hasMarlonAndClass2Quest: false,
    baseStr: 26,
    baseAgi: 20,
    baseVit: 20,
    baseEne: 15,
    baseCmd: 25,
    tierLabel: 'คลาส 3 พิเศษ (7 พอยต์/เลเวล)',
  },
] as const;

export const CLASS_3_CLASSES: readonly MuClassDefinition[] = MU_CLASSES.filter(
  (c) => c.s3
);

export interface ClassStatPointCalculation {
  classDef: MuClassDefinition;
  level: number;
  levelUps: number;
  pointsPerLevel: number;
  startingPoints: number;
  levelPoints: number;
  totalPoints: number; // Base Level Points + 300 Starting Points (excludes +20 Class 2 Quest & +180 Marlon 220 Quest)
  excludedClass2QuestPoints: number; // 20 for DW/DK/ELF lineage, 0 for MG/DL
  excludedMarlon220Points: number; // 180 for DW/DK/ELF lineage at Lv.400, 0 for MG/DL
  totalIfQuestsCompleted: number; // 2,495 for GM/BM/HE at Lv.400; 3,093 for DM/LE at Lv.400
}

/**
 * Calculates LevelUpPoints for a character based on their class and level:
 * - Standard lineages (DW/SM/GM, DK/BK/BM, ELF/ME/HE):
 *   (level - 1) * 5 + 300 starting points -> At Lv.400: 399 * 5 + 300 = 1,995 + 300 = 2,295 points
 *   (Excludes +20 Class Change Quest Lv.150 and +180 Marlon Quest Lv.220 [180 levels * 1 pt])
 * - Special lineages (MG/DM, DL/LE):
 *   (level - 1) * 7 + 300 starting points -> At Lv.400: 399 * 7 + 300 = 2,793 + 300 = 3,093 points
 */
export function calculateClassStatPoints(
  classCode: MuClassCode,
  level = 400
): ClassStatPointCalculation {
  const classDef =
    MU_CLASSES.find((c) => c.code === classCode) || MU_CLASSES[0];
  const safeLevel = Math.max(1, Math.min(400, level));
  const levelUps = Math.max(0, safeLevel - 1);
  const pointsPerLevel = classDef.pointsPerLevel;
  const startingPoints = INITIAL_STARTING_POINTS; // 300
  const levelPoints = levelUps * pointsPerLevel;
  const totalPoints = startingPoints + levelPoints;

  const excludedClass2QuestPoints = classDef.hasMarlonAndClass2Quest ? 20 : 0;
  const excludedMarlon220Points =
    classDef.hasMarlonAndClass2Quest && safeLevel > 220
      ? safeLevel - 220
      : 0;
  const totalIfQuestsCompleted =
    totalPoints + excludedClass2QuestPoints + excludedMarlon220Points;

  return {
    classDef,
    level: safeLevel,
    levelUps,
    pointsPerLevel,
    startingPoints,
    levelPoints,
    totalPoints,
    excludedClass2QuestPoints,
    excludedMarlon220Points,
    totalIfQuestsCompleted,
  };
}

export function getExcellentOptionLabels(exType: number, lang?: string): string[] {
  const isPt = lang === 'Portuguese_BR';
  const isRu = lang === 'Russian';
  const isEs = lang === 'Spanish';
  const isBg = lang === 'Bulgarian';

  switch (exType) {
    case 0: // Weapons & Pendants
      if (isPt) {
        return [
          'Recuperação de Mana por monstro morto +Mana/8',
          'Recuperação de Vida por monstro morto +Vida/8',
          'Velocidade de ataque (mágico) +7',
          'Aumento de dano (mágico) +2%',
          'Aumento de dano +Nível/20',
          'Taxa de Dano Excelente +10%',
        ];
      }
      if (isRu) {
        return [
          'Восстановление Mana при убийстве +Mana/8',
          'Восстановление HP при убийстве +HP/8',
          'Скорость атаки (магии) +7',
          'Увеличение урона (магии) +2%',
          'Увеличение урона +Уровень/20',
          'Шанс отличного урона (Excellent Damage) +10%',
        ];
      }
      if (isEs) {
        return [
          'Recuperación de Mana por monstruo muerto +Mana/8',
          'Recuperación de Vida por monstruo muerto +Vida/8',
          'Velocidad de ataque (mágico) +7',
          'Aumento de daño (mágico) +2%',
          'Aumento de daño +Nivel/20',
          'Probabilidad de Daño Excelente +10%',
        ];
      }
      if (isBg) {
        return [
          'Възстановяване на Мана при убийство +Mana/8',
          'Възстановяване на HP при убийство +HP/8',
          'Скорост на атака (магия) +7',
          'Увеличаване на щетите (магия) +2%',
          'Увеличаване на щетите +Ниво/20',
          'Шанс за Excellent Damage +10%',
        ];
      }
      return [
        'Increase Mana per kill +8',
        'Increase hit points per kill +8',
        'Increase attacking(wizardly)speed +7',
        'Increase wizardly damage +2%',
        'Increase Damage +level/20',
        'Excellent Damage Rate +10%',
      ];

    case 1: // Armors, Shields, Rings
      if (isPt) {
        return [
          'Aumento de Zen após caçar monstros +40%',
          'Taxa de sucesso de defesa +10%',
          'Refletir dano +5%',
          'Diminuição de dano +4%',
          'Aumento de Mana máxima +4%',
          'Aumento de Vida máxima +4%',
        ];
      }
      if (isRu) {
        return [
          'Увеличение Zen после охоты +40%',
          'Шанс успешной защиты (Defense Rate) +10%',
          'Отражение урона (Reflect) +5%',
          'Снижение урона (Damage Decrease) +4%',
          'Увеличение макс. Mana +4%',
          'Увеличение макс. HP +4%',
        ];
      }
      if (isEs) {
        return [
          'Aumento de Zen tras cazar monstruos +40%',
          'Tasa de éxito de defensa +10%',
          'Reflejar daño +5%',
          'Disminución de daño +4%',
          'Aumento de Mana máxima +4%',
          'Aumento de Vida máxima +4%',
        ];
      }
      if (isBg) {
        return [
          'Увеличаване на Zen след лов +40%',
          'Шанс за успешна защита +10%',
          'Отразяване на щетите (Reflect) +5%',
          'Намаляване на щетите +4%',
          'Увеличаване на макс. Мана +4%',
          'Увеличаване на макс. HP +4%',
        ];
      }
      return [
        'Increase Zen After Hunt +40%',
        'Defense success rate +10%',
        'Reflect damage +5%',
        'Damage Decrease +4%',
        'Increase MaxMana +4%',
        'Increase MaxHP +4%',
      ];

    case 2: // Wings Season II
      if (isPt) {
        return [
          'Aumento de HP +50~115',
          'Aumento de MP +50~115',
          'Ignorar defesa do oponente +3%',
          'Aumento de AG (Stamina) máxima +50',
          'Velocidade de ataque +5',
        ];
      }
      if (isRu) {
        return [
          'Увеличение HP +50~115',
          'Увеличение MP +50~115',
          'Игнорирование защиты цели +3%',
          'Увеличение макс. стамины (AG) +50',
          'Скорость атаки +5',
        ];
      }
      if (isEs) {
        return [
          'Aumento de HP +50~115',
          'Aumento de MP +50~115',
          'Ignorar defensa del oponente +3%',
          'Aumento de Estamina (AG) máxima +50',
          'Velocidad de ataque +5',
        ];
      }
      if (isBg) {
        return [
          'Увеличаване на HP +50~115',
          'Увеличаване на MP +50~115',
          'Игнориране на защитата на врага +3%',
          'Увеличаване на макс. стамина +50',
          'Скорост на атака +5',
        ];
      }
      return [
        'Increase HP +50~115',
        'Increase MP +50~115',
        'Ignore opponent defense +3%',
        'Increase Max Stamina +50',
        'Increase Attack Speed +5',
      ];

    case 4: // Wings Season III (v0.9)
      if (isPt) {
        return [
          '+115 HP Máximo',
          '+115 MP Máximo',
          'Ignorar defesa do inimigo 3%',
          '+50 Stamina (AG) Máxima',
          'Velocidade de ataque +7',
        ];
      }
      if (isRu) {
        return [
          '+115 Макс. HP',
          '+115 Макс. MP',
          'Игнорирование защиты противника 3%',
          '+50 Макс. стамины (AG)',
          'Скорость атаки/магии +7',
        ];
      }
      if (isEs) {
        return [
          '+115 HP Máximo',
          '+115 MP Máximo',
          'Ignorar defensa enemiga 3%',
          '+50 Estamina (AG) Máxima',
          'Velocidad de ataque +7',
        ];
      }
      if (isBg) {
        return [
          '+115 Макс. HP',
          '+115 Макс. MP',
          'Игнориране защитата на врага 3%',
          '+50 Макс. стамина (AG)',
          'Скорост на атака +7',
        ];
      }
      return [
        '+115 HP',
        '+115 MP',
        'Ignore Enemy defense 3%',
        '+50 Max stamina',
        'Wizardly speed +7',
      ];

    default:
      return [];
  }
}

export interface FormattedItemTooltip {
  displayName: string;
  color: string;
  durabilityText: string;
  requirements: string[];
  optionLine: string | null;
  luckLines: string[];
  skillLine: string | null;
  excellentLines: string[];
  ancientLine: string | null;
  serial: string;
  thumb: string;
  sizeText: string;
  refundCredits: number;
}

export function formatItemTooltip(
  instance: VaultItemInstance,
  catalogItem: WebShopItem | undefined,
  config: WebShopConfig
): FormattedItemTooltip {
  const exType = catalogItem?.ex_type ?? 0;
  const optionType = catalogItem?.optionType ?? 0;
  const exLabels = getExcellentOptionLabels(exType);
  const activeExl = instance.exlOptions
    .map((on, idx) => (on && exLabels[idx] ? exLabels[idx] : null))
    .filter((v): v is string => Boolean(v));

  const hasExl = activeExl.length > 0;
  const isWing = exType === 2 || exType === 4;
  const isFenrir = instance.itemType === 12 && instance.itemId === 37;

  let optionPrefix = 'Additional Damage';
  let optionValueStr = '';
  if (instance.option > 0) {
    if (optionType === 1) {
      optionPrefix = 'Automatic HP Recovery rate';
      optionValueStr = `${instance.option}%`;
    } else if (optionType === 2) {
      optionPrefix = 'Additional Defense rate';
      optionValueStr = `+${instance.option * 5}`;
    } else {
      optionPrefix = exType === 1 ? 'Additional Defense' : 'Additional Damage';
      optionValueStr = `+${instance.option * 4}`;
    }
  }

  let optionLine = instance.option > 0 ? `${optionPrefix} ${optionValueStr}` : null;
  let skillLine = instance.skill ? 'This weapon has a special skill' : null;
  const luckLines = instance.luck
    ? [
        'Luck (success rate of jewel of soul +25%)',
        'Luck (critical damage rate +5%)',
      ]
    : [];

  let color = '#FFFFFF';
  if (instance.option > 0 || instance.luck) color = '#8CB0EA';
  if (instance.level > 6) color = '#F4CB3F';
  if (hasExl) color = '#2FF387';
  if (instance.ancientStamina > 0) color = '#2347F3';
  if (isWing) color = '#F4CB3F';

  let baseName = instance.name;
  if (isFenrir) {
    skillLine = 'Plasma storm skill (Mana:50)';
    color = '#8CB0EA';
    if (instance.fenrirVariant === 1) {
      baseName = `${instance.name} +Destroy`;
      optionLine = 'Increase final damage 10% · Increase speed';
    } else if (instance.fenrirVariant === 2) {
      baseName = `${instance.name} +Protect`;
      optionLine = 'Absorb final damage 10% · Increase speed';
    } else if (instance.fenrirVariant === 3) {
      baseName = 'Golden Fenrir';
      color = '#F4CB3F';
      optionLine = 'Increase speed';
    }
  } else if (!isWing && hasExl) {
    baseName = `Excellent ${instance.name}`;
  }

  const levelSuffix =
    instance.level > 0 && !(catalogItem && catalogItem.stickLevel > 0)
      ? ` +${instance.level}`
      : '';

  const incrAll = hasExl ? 20 : 0;
  const reqs: string[] = [];
  if (catalogItem) {
    if (catalogItem.str > 0) {
      const strReq =
        catalogItem.str + instance.level * 7 + instance.option * 20 + incrAll;
      reqs.push(`${strReq} Strength required`);
    }
    if (catalogItem.agi > 0) {
      const agiReq = catalogItem.agi + instance.level * 4 + incrAll;
      reqs.push(`${agiReq} Agility required`);
    }
    if (catalogItem.nrg > 0) {
      reqs.push(`${catalogItem.nrg + incrAll} Energy required`);
    }
    if (catalogItem.cmd > 0) {
      reqs.push(`${catalogItem.cmd + incrAll} Command required`);
    }
  }

  const ancientLine =
    instance.ancientStamina > 0
      ? `Ancient: +${instance.ancientStamina} stamina`
      : null;

  const thumb =
    hasExl && catalogItem?.exlThumb
      ? catalogItem.exlThumb
      : catalogItem?.thumb || '/items/SinFoto.gif';

  const refundCredits = instance.canSellBack
    ? Math.round(instance.paidCredits * config.credits.sellback_Q)
    : 0;

  return {
    displayName: `${baseName}${levelSuffix}`,
    color,
    durabilityText: `[${instance.durability || 255}/255] Durability`,
    requirements: reqs,
    optionLine,
    luckLines,
    skillLine,
    excellentLines: activeExl,
    ancientLine,
    serial: instance.serial,
    thumb,
    sizeText: `${instance.X}×${instance.Y}`,
    refundCredits,
  };
}

/**
 * Port of Open-Webshop's smartsearch($whbin, $itemX, $itemY) v0.9
 * Finds the first available top-left slot index (0..119) in the 8x15 warehouse grid
 * that can fit an item of dimensions itemX x itemY. Returns 1337 if no space.
 */
export function buildOccupancyMatrix(vaultItems: VaultItemInstance[]): (VaultItemInstance | null)[][] {
  const grid: (VaultItemInstance | null)[][] = Array.from({ length: 15 }, () =>
    Array.from({ length: 8 }, () => null)
  );

  for (const item of vaultItems) {
    const startX = item.slotIndex % 8;
    const startY = Math.floor(item.slotIndex / 8);
    for (let dy = 0; dy < item.Y; dy++) {
      for (let dx = 0; dx < item.X; dx++) {
        const y = startY + dy;
        const x = startX + dx;
        if (y < 15 && x < 8) {
          grid[y][x] = item;
        }
      }
    }
  }
  return grid;
}

export function findFreeVaultSlot(
  vaultItems: VaultItemInstance[],
  itemX: number,
  itemY: number
): number {
  const grid = buildOccupancyMatrix(vaultItems);

  for (let row = 0; row <= 15 - itemY; row++) {
    for (let col = 0; col <= 8 - itemX; col++) {
      let fits = true;
      for (let dy = 0; dy < itemY && fits; dy++) {
        for (let dx = 0; dx < itemX; dx++) {
          if (grid[row + dy][col + dx] !== null) {
            fits = false;
            break;
          }
        }
      }
      if (fits) {
        return row * 8 + col;
      }
    }
  }
  return 1337; // Classic Savoy Open-Webshop sentinel for "no space"
}

export function generateSerialHex(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).toUpperCase().padStart(2, '0'))
    .join('');
}

export function calculateItemTotalCredits(
  baseCredits: number,
  level: number,
  option: number,
  luck: boolean,
  skill: boolean,
  exlOptions: boolean[],
  ancientStamina: 0 | 5 | 10,
  fenrirVariant: 0 | 1 | 2 | 3,
  config: WebShopConfig
): number {
  let total = Math.ceil(baseCredits * config.credits.multiplier);
  total += level * config.credits.itemlvl;
  total += option * config.credits.itemopt;
  if (luck) total += config.credits.itemluck;
  if (skill) total += config.credits.itemskill;
  const exCount = exlOptions.filter(Boolean).length;
  total += exCount * config.credits.itemexl;
  if (ancientStamina === 5) total += config.credits.ancient1;
  if (ancientStamina === 10) total += config.credits.ancient2;
  if (fenrirVariant === 1) total += config.credits.fenrir_destroy;
  if (fenrirVariant === 2) total += config.credits.fenrir_protect;
  if (fenrirVariant === 3) total += config.credits.golden_fenrir;
  return total;
}
