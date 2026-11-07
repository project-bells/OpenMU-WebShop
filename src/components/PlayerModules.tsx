import React, { useEffect, useState } from 'react';
import {
  AccountData,
  Character,
  LanguageCode,
  MuClassCode,
  WebShopConfig,
} from '../types/webshop';
import {
  BUY_CHAR_400_CREDITS,
  CLASS_3_CLASSES,
  DELETE_CHAR_400_REWARD_CREDITS,
  INITIAL_STARTING_POINTS,
  MU_CLASSES,
  ONLINE_HOUR_REWARD_CREDITS,
  WAREHOUSE_ZEN_MAX_LIMIT,
  ZEN_PURCHASE_AMOUNT,
  ZEN_PURCHASE_CREDITS,
  calculateClassStatPoints,
  getClassDisplayName,
} from '../utils/muItemLogic';
import { L, t } from '../translations';
import {
  AlertTriangle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  Clock,
  Coins,
  Info,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';

export interface ActionResponse {
  ok: boolean;
  message: string;
}

const StatusNotice: React.FC<{ status: ActionResponse | null }> = ({ status }) => {
  if (!status) return null;
  return (
    <div
      className={`p-3.5 rounded border text-xs flex items-center gap-2.5 ${
        status.ok
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
          : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
      }`}
    >
      {status.ok ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      ) : (
        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
      )}
      <span>{status.message}</span>
    </div>
  );
};

// 1. Reset Stat Points
export const ResetPointsModule: React.FC<{
  characters: Character[];
  config: WebShopConfig;
  lang?: LanguageCode;
  onResetCharacterPoints: (charName: string) => ActionResponse;
}> = ({ characters, config, lang = 'Thai', onResetCharacterPoints }) => {
  const [charName, setCharName] = useState(characters[0]?.name || '');
  const [status, setStatus] = useState<ActionResponse | null>(null);

  useEffect(() => {
    if (!characters.some((c) => c.name === charName)) {
      setCharName(characters[0]?.name || '');
    }
  }, [characters, charName]);

  const selectedChar =
    characters.find((c) => c.name.toLowerCase() === charName.toLowerCase()) ||
    characters[0];

  const calc = selectedChar
    ? calculateClassStatPoints(selectedChar.classCode, selectedChar.level)
    : calculateClassStatPoints('bm', 400);

  const cost = config.credits.reset;
  const ptsUnit = L(lang, {
    en: 'pts',
    th: 'พอยต์',
    pt: 'pts',
    ru: 'очков',
    es: 'pts',
    bg: 'точки',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChar) {
      setStatus({
        ok: false,
        message: L(lang, {
          en: 'Please select a character to reset stat points.',
          th: 'กรุณาเลือกตัวละครที่ต้องการรีเซ็ตพอยต์',
          pt: 'Por favor, selecione o personagem para resetar os pontos.',
          ru: 'Пожалуйста, выберите персонажа для сброса статов.',
          es: 'Por favor, selecciona un personaje para resetear puntos.',
          bg: 'Моля, изберете герой за нулиране на точките.',
        }),
      });
      return;
    }
    setStatus(onResetCharacterPoints(selectedChar.name));
  };

  return (
    <div className="max-w-3xl space-y-5">
      <StatusNotice status={status} />

      <form
        onSubmit={handleSubmit}
        className="p-5 rounded border border-zinc-800 bg-zinc-900/80 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                {L(lang, {
                  en: 'Reset Stat Points (Class Base Stats + 300 Starting Points)',
                  th: 'ขอ Reset Point (รีเซ็ตสเตตัสและคำนวณพอยต์ตามสายอาชีพ + พอยต์เริ่มต้น 300)',
                  pt: 'Resetar Pontos (Redefinir atributos base da classe + 300 pontos iniciais)',
                  ru: 'Сброс статов (Базовые характеристики класса + 300 начальных очков)',
                  es: 'Resetear Puntos (Restablecer atributos base + 300 puntos iniciales)',
                  bg: 'Ресет на Точки (Възстановяване на базови точки + 300 начални)',
                })}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {L(lang, {
                  en: 'Resets STR / AGI / VIT / ENE / CMD to class base stats and calculates level-up points + 300 starting bonus (excludes Lv.150 quest +20 & Marlon Lv.220 +180).',
                  th: 'คืนค่าสเตตัส STR / AGI / VIT / ENE / CMD กลับสู่ค่าเริ่มต้นของอาชีพ และคำนวณเฉพาะพอยต์เลเวลปกติรวมกับพอยต์เริ่มต้น 300 (ไม่รวมเควสเปลี่ยนอาชีพ +20 และเควส Marlon 220 อีก +180)',
                  pt: 'Retorna STR / AGI / VIT / ENE / CMD aos valores iniciais da classe e calcula os pontos de nível mais +300 pontos iniciais (sem incluir quests +20 e Marlon Nv.220 +180).',
                  ru: 'Сбрасывает STR / AGI / VIT / ENE / CMD до базовых значений класса и начисляет очки за уровень + 300 начальных очков (без учета квестов +20 и Марлона +180).',
                  es: 'Restablece STR / AGI / VIT / ENE / CMD a valores base y calcula puntos de nivel más +300 puntos iniciales.',
                  bg: 'Възстановява базовите статове и изчислява точките за ниво плюс 300 начални точки.',
                })}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono-tabular font-semibold shrink-0 self-start">
            {L(lang, {
              en: `Fee: ${cost.toLocaleString()} Credits`,
              th: `ค่าบริการ ${cost.toLocaleString()} Credits`,
              pt: `Custo: ${cost.toLocaleString()} Créditos`,
              ru: `Цена: ${cost.toLocaleString()} кредитов`,
              es: `Costo: ${cost.toLocaleString()} créditos`,
              bg: `Цена: ${cost.toLocaleString()} кредита`,
            })}
          </span>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            {L(lang, {
              en: 'Select character to reset stat points',
              th: 'เลือกตัวละครที่ต้องการขอ Reset Point',
              pt: 'Selecione o personagem para Resetar Pontos',
              ru: 'Выберите персонажа для сброса статов',
              es: 'Selecciona el personaje para resetear puntos',
              bg: 'Изберете герой за нулиране на точки',
            })}
          </label>
          {characters.length === 0 ? (
            <div className="p-3.5 rounded border border-zinc-800 bg-zinc-950 text-xs text-zinc-400">
              {t('no_characters', lang)}
            </div>
          ) : (
            <select
              value={selectedChar?.name || ''}
              onChange={(e) => {
                setCharName(e.target.value);
                setStatus(null);
              }}
              className="w-full px-3 py-2.5 text-xs rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            >
              {characters.map((c) => {
                const cCalc = calculateClassStatPoints(c.classCode, c.level);
                return (
                  <option key={c.name} value={c.name}>
                    {c.name} — {getClassDisplayName(cCalc.classDef, lang)} (Lv.{c.level}) ·{' '}
                    {L(lang, {
                      en: `Receives ${cCalc.totalPoints.toLocaleString()} pts`,
                      th: `รีพอยต์แล้วจะได้ ${cCalc.totalPoints.toLocaleString()} พอยต์`,
                      pt: `Receberá ${cCalc.totalPoints.toLocaleString()} pontos`,
                      ru: `Получит ${cCalc.totalPoints.toLocaleString()} очков`,
                      es: `Recibirá ${cCalc.totalPoints.toLocaleString()} puntos`,
                      bg: `Ще получи ${cCalc.totalPoints.toLocaleString()} точки`,
                    })}
                  </option>
                );
              })}
            </select>
          )}
        </div>

        {selectedChar && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded border border-amber-500/30 bg-zinc-950/90 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 border-b border-zinc-800 pb-2">
                <Calculator className="w-3.5 h-3.5" />
                <span>
                  {L(lang, {
                    en: `Class Point Formula (${getClassDisplayName(calc.classDef, lang)})`,
                    th: `การคำนวณพอยต์ตามสายอาชีพ (${getClassDisplayName(calc.classDef, lang)})`,
                    pt: `Cálculo de Pontos por Classe (${getClassDisplayName(calc.classDef, lang)})`,
                    ru: `Расчет очков по классу (${getClassDisplayName(calc.classDef, lang)})`,
                    es: `Cálculo de Puntos por Clase (${getClassDisplayName(calc.classDef, lang)})`,
                    bg: `Изчисляване на точки по клас (${getClassDisplayName(calc.classDef, lang)})`,
                  })}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">
                    {L(lang, {
                      en: 'Class:',
                      th: 'สายอาชีพ (Class):',
                      pt: 'Classe:',
                      ru: 'Класс:',
                      es: 'Clase:',
                      bg: 'Клас:',
                    })}
                  </span>
                  <span className="text-zinc-100 font-semibold">
                    {getClassDisplayName(calc.classDef, lang)} ({calc.pointsPerLevel}{' '}
                    {L(lang, {
                      en: 'pts/lv',
                      th: 'พอยต์/เลเวล',
                      pt: 'pts/nível',
                      ru: 'очк/ур',
                      es: 'pts/nivel',
                      bg: 'т/ниво',
                    })}
                    )
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">
                    {L(lang, {
                      en: 'Character Level:',
                      th: 'เลเวลของตัวละคร:',
                      pt: 'Nível do Personagem:',
                      ru: 'Уровень персонажа:',
                      es: 'Nivel del Personaje:',
                      bg: 'Ниво на героя:',
                    })}
                  </span>
                  <span className="font-mono-tabular text-zinc-100 font-semibold">
                    Level {calc.level} ({calc.levelUps} Level-Ups)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">
                    {L(lang, {
                      en: `Level Points (${calc.levelUps} × ${calc.pointsPerLevel}):`,
                      th: `พอยต์จากเลเวลปกติ (${calc.levelUps} × ${calc.pointsPerLevel} พอยต์):`,
                      pt: `Pontos de Nível (${calc.levelUps} × ${calc.pointsPerLevel} pts):`,
                      ru: `Очки за уровень (${calc.levelUps} × ${calc.pointsPerLevel}):`,
                      es: `Puntos de Nivel (${calc.levelUps} × ${calc.pointsPerLevel} pts):`,
                      bg: `Точки за ниво (${calc.levelUps} × ${calc.pointsPerLevel} т):`,
                    })}
                  </span>
                  <span className="font-mono-tabular text-zinc-200 font-semibold">
                    +{calc.levelPoints.toLocaleString()} {ptsUnit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">
                    {L(lang, {
                      en: 'Starting Bonus:',
                      th: 'พอยต์ชุดแรกที่จุดเริ่มต้น (Starting Bonus):',
                      pt: 'Bônus Inicial (Starting Bonus):',
                      ru: 'Начальный бонус (Starting Bonus):',
                      es: 'Bono Inicial (Starting Bonus):',
                      bg: 'Начален Бонус (Starting Bonus):',
                    })}
                  </span>
                  <span className="font-mono-tabular text-emerald-400 font-semibold">
                    +{calc.startingPoints.toLocaleString()} {ptsUnit}
                  </span>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-sm">
                  <span className="font-bold text-white">
                    {L(lang, {
                      en: 'Total Points Granted:',
                      th: 'รวมพอยต์ที่ได้รับทันที:',
                      pt: 'Total de Pontos Recebidos:',
                      ru: 'Итого очков:',
                      es: 'Total de Puntos:',
                      bg: 'Общо получени точки:',
                    })}
                  </span>
                  <span className="font-mono-tabular font-bold text-amber-400 text-base">
                    {calc.totalPoints.toLocaleString()} {ptsUnit}
                  </span>
                </div>

                {calc.classDef.hasMarlonAndClass2Quest && (
                  <div className="pt-1.5 text-[11px] text-zinc-400 border-t border-zinc-800/70">
                    {L(lang, {
                      en: `* Excludes Class 2 quest (+${calc.excludedClass2QuestPoints} pts) & Marlon Lv.220 quest (+${calc.excludedMarlon220Points} pts).`,
                      th: `* ยังไม่นับรวมเควสเปลี่ยนอาชีพ (+${calc.excludedClass2QuestPoints} พอยต์) และเควส Marlon Lv.220 (+${calc.excludedMarlon220Points} พอยต์)`,
                      pt: `* Não inclui quest de evolução (+${calc.excludedClass2QuestPoints} pts) e quest Marlon Nv.220 (+${calc.excludedMarlon220Points} pts).`,
                      ru: `* Без учета квеста смены профессии (+${calc.excludedClass2QuestPoints} очков) и квеста Марлона 220 ур. (+${calc.excludedMarlon220Points} очков).`,
                      es: `* No incluye quest de cambio de clase (+${calc.excludedClass2QuestPoints} pts) ni quest de Marlon Lv.220 (+${calc.excludedMarlon220Points} pts).`,
                      bg: `* Не включва куеста за клас (+${calc.excludedClass2QuestPoints} т) и Марлон 220 ниво (+${calc.excludedMarlon220Points} т).`,
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded border border-zinc-800 bg-zinc-950/90 space-y-3">
              <div className="text-xs font-bold text-zinc-200 border-b border-zinc-800 pb-2">
                {L(lang, {
                  en: 'Attribute Reset (Current → Base)',
                  th: 'การคืนค่าสเตตัสพื้นฐาน (Current Stats → Base Stats)',
                  pt: 'Redefinição de Atributos (Atuais → Base)',
                  ru: 'Сброс характеристик (Текущие → Базовые)',
                  es: 'Reinicio de Atributos (Actuales → Base)',
                  bg: 'Възстановяване на Статове (Текущи → Базови)',
                })}
              </div>

              <div className="space-y-1.5 text-xs font-mono-tabular">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-sans">Strength (STR):</span>
                  <span>
                    <span className="text-zinc-400">{selectedChar.strength.toLocaleString()}</span>
                    <ArrowRight className="inline w-3 h-3 text-amber-400 mx-1" />
                    <strong className="text-emerald-400">{calc.classDef.baseStr}</strong>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-sans">Agility (AGI):</span>
                  <span>
                    <span className="text-zinc-400">{selectedChar.agility.toLocaleString()}</span>
                    <ArrowRight className="inline w-3 h-3 text-amber-400 mx-1" />
                    <strong className="text-emerald-400">{calc.classDef.baseAgi}</strong>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-sans">Vitality (VIT):</span>
                  <span>
                    <span className="text-zinc-400">{selectedChar.vitality.toLocaleString()}</span>
                    <ArrowRight className="inline w-3 h-3 text-amber-400 mx-1" />
                    <strong className="text-emerald-400">{calc.classDef.baseVit}</strong>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-sans">Energy (ENE):</span>
                  <span>
                    <span className="text-zinc-400">{selectedChar.energy.toLocaleString()}</span>
                    <ArrowRight className="inline w-3 h-3 text-amber-400 mx-1" />
                    <strong className="text-emerald-400">{calc.classDef.baseEne}</strong>
                  </span>
                </div>
                {calc.classDef.baseCmd > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-sans">Command (CMD):</span>
                    <span>
                      <span className="text-zinc-400">{selectedChar.command.toLocaleString()}</span>
                      <ArrowRight className="inline w-3 h-3 text-amber-400 mx-1" />
                      <strong className="text-emerald-400">{calc.classDef.baseCmd}</strong>
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-300 font-sans font-semibold">
                    {L(lang, {
                      en: 'Free Stat Points:',
                      th: 'พอยต์คงเหลือพร้อมอัป:',
                      pt: 'Pontos Disponíveis:',
                      ru: 'Свободные очки:',
                      es: 'Puntos Disponibles:',
                      bg: 'Свободни точки:',
                    })}
                  </span>
                  <span>
                    <span className="text-zinc-400">
                      {selectedChar.levelUpPoints.toLocaleString()}
                    </span>
                    <ArrowRight className="inline w-3 h-3 text-amber-400 mx-1" />
                    <strong className="text-amber-400">{calc.totalPoints.toLocaleString()}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-zinc-300">
            {selectedChar ? (
              <>
                {L(lang, {
                  en: 'Reset stat points for ',
                  th: 'รีเซ็ตพอยต์สเตตัสของ ',
                  pt: 'Resetar pontos de ',
                  ru: 'Сброс статов персонажа ',
                  es: 'Resetear puntos de ',
                  bg: 'Ресет на точки за ',
                })}
                <strong className="text-white">{selectedChar.name}</strong>{' '}
                {L(lang, {
                  en: 'receiving ',
                  th: 'รับพอยต์รวม ',
                  pt: 'recebendo ',
                  ru: 'с получением ',
                  es: 'recibiendo ',
                  bg: 'получавайки ',
                })}
                <strong className="text-emerald-400 font-mono-tabular">
                  {calc.totalPoints.toLocaleString()} {ptsUnit}
                </strong>{' '}
                ({cost.toLocaleString()} Credits)
              </>
            ) : (
              t('no_characters', lang)
            )}
          </div>
          <button
            type="submit"
            disabled={!selectedChar}
            className="px-5 py-2.5 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 transition-colors cursor-pointer whitespace-nowrap"
          >
            {L(lang, {
              en: `Confirm Reset Points (${cost.toLocaleString()} Credits)`,
              th: `ยืนยันการขอ Reset Point (${cost.toLocaleString()} Credits)`,
              pt: `Confirmar Reset de Pontos (${cost.toLocaleString()} Créditos)`,
              ru: `Подтвердить сброс статов (${cost.toLocaleString()} кредитов)`,
              es: `Confirmar Reset de Puntos (${cost.toLocaleString()} Créditos)`,
              bg: `Потвърди ресет на точки (${cost.toLocaleString()} кредита)`,
            })}
          </button>
        </div>
      </form>
    </div>
  );
};

// 2. Buy Level 400 Class 3 Character
export const BuyCharacter400Module: React.FC<{
  characters: Character[];
  config: WebShopConfig;
  lang?: LanguageCode;
  onBuyCharacter400: (
    charName: string,
    classCode: MuClassCode
  ) => Promise<ActionResponse> | ActionResponse;
}> = ({ characters, lang = 'Thai', onBuyCharacter400 }) => {
  const [newCharName, setNewCharName] = useState('');
  const [selectedClass, setSelectedClass] = useState<MuClassCode>('bm');
  const [status, setStatus] = useState<ActionResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calc = calculateClassStatPoints(selectedClass, 400);
  const cost = BUY_CHAR_400_CREDITS;
  const ptsUnit = L(lang, {
    en: 'pts',
    th: 'พอยต์',
    pt: 'pts',
    ru: 'очков',
    es: 'pts',
    bg: 'точки',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await onBuyCharacter400(newCharName.trim(), selectedClass);
      setStatus(res);
      if (res.ok) {
        setNewCharName('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <StatusNotice status={status} />

      <form
        onSubmit={handleSubmit}
        className="p-5 rounded border border-zinc-800 bg-zinc-900/80 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                {L(lang, {
                  en: `Buy Level 400 Character — 3rd Class Only (${cost} Credits)`,
                  th: `ซื้อตัวละคร เลเวล 400 — เฉพาะสายอาชีพ Class 3 เท่านั้น (ราคา ${cost} Credits)`,
                  pt: `Comprar Personagem Nível 400 — Somente 3ª Classe (${cost} Créditos)`,
                  ru: `Покупка персонажа 400 уровня — Только 3-й класс (${cost} кредитов)`,
                  es: `Comprar Personaje Nivel 400 — Solo 3ra Clase (${cost} Créditos)`,
                  bg: `Купи Герой 400 Ниво — Само 3-ти клас (${cost} кредита)`,
                })}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {L(lang, {
                  en: 'Calculates level-up points from Lv.1 to 400 + 300 starting bonus (excludes Lv.150 quest +20 & Marlon Lv.220 quest +180).',
                  th: 'คำนวณเฉพาะพอยต์ที่ได้จากการอัปเลเวลปกติ (Lv.1 → 400) รวมกับพอยต์ชุดแรก 300 พอยต์ (ยังไม่นับรวมเควสเปลี่ยนอาชีพ 20 พอยต์ และเควสเลเวล 220 อีก 180 พอยต์)',
                  pt: 'Calcula os pontos ganhos do nível 1 ao 400 + 300 pontos iniciais (não inclui os +20 pontos da quest de classe nem os +180 pontos da quest Marlon Nv.220).',
                  ru: 'Начисляются очки за уровни 1-400 + 300 начальных очков (без учета квестов +20 и Марлона +180).',
                  es: 'Calcula puntos de nivel 1 a 400 + 300 puntos iniciales (no incluye quest de clase +20 ni Marlon +180).',
                  bg: 'Точки за нива 1-400 + 300 начални точки (без куестове +20 и Марлон +180).',
                })}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono-tabular font-semibold shrink-0 self-start">
            {L(lang, {
              en: `Price: ${cost.toLocaleString()} Credits`,
              th: `ราคา ${cost.toLocaleString()} Credits`,
              pt: `Preço: ${cost.toLocaleString()} Créditos`,
              ru: `Цена: ${cost.toLocaleString()} кредитов`,
              es: `Precio: ${cost.toLocaleString()} créditos`,
              bg: `Цена: ${cost.toLocaleString()} кредита`,
            })}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              {L(lang, {
                en: 'New Character Name (2–10 characters)',
                th: 'ตั้งชื่อตัวละครใหม่ (ความยาว 2–10 ตัวอักษร)',
                pt: 'Nome do Novo Personagem (2 a 10 caracteres)',
                ru: 'Имя нового персонажа (2-10 символов)',
                es: 'Nombre del Nuevo Personaje (2 a 10 caracteres)',
                bg: 'Име на нов герой (2-10 символа)',
              })}
            </label>
            <input
              type="text"
              maxLength={10}
              value={newCharName}
              onChange={(e) => {
                setNewCharName(e.target.value);
                setStatus(null);
              }}
              placeholder={L(lang, {
                en: 'Enter 2-10 alphanumeric characters',
                th: 'กรอกชื่อตัวละคร 2-10 ตัวอักษรภาษาอังกฤษ/ตัวเลข',
                pt: 'Digite de 2 a 10 caracteres',
                ru: 'Введите от 2 до 10 символов',
                es: 'Ingresa de 2 a 10 caracteres',
                bg: 'Въведете от 2 до 10 символа',
              })}
              className="w-full px-3 py-2.5 text-xs rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              {L(lang, {
                en: 'Select Class (3rd Class Only)',
                th: 'เลือกสายอาชีพ (เฉพาะ Class 3 เท่านั้น)',
                pt: 'Escolha a Classe (Apenas 3ª Classe)',
                ru: 'Выберите класс (Только 3-й класс)',
                es: 'Elige la Clase (Solo 3ra Clase)',
                bg: 'Изберете Клас (Само 3-ти клас)',
              })}
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value as MuClassCode);
                setStatus(null);
              }}
              className="w-full px-3 py-2.5 text-xs rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            >
              {CLASS_3_CLASSES.map((c) => {
                const c400 = calculateClassStatPoints(c.code, 400);
                return (
                  <option key={c.code} value={c.code}>
                    {getClassDisplayName(c, lang)} (Class 3 · {c.pointsPerLevel}{' '}
                    {L(lang, {
                      en: 'pts/lv',
                      th: 'พอยต์/เลเวล',
                      pt: 'pts/nv',
                      ru: 'очк/ур',
                      es: 'pts/nv',
                      bg: 'т/ниво',
                    })}
                    ) —{' '}
                    {L(lang, {
                      en: `${c400.totalPoints.toLocaleString()} pts`,
                      th: `ได้รับ ${c400.totalPoints.toLocaleString()} พอยต์`,
                      pt: `Recebe ${c400.totalPoints.toLocaleString()} pts`,
                      ru: `Получит ${c400.totalPoints.toLocaleString()} очков`,
                      es: `Recibe ${c400.totalPoints.toLocaleString()} pts`,
                      bg: `Получава ${c400.totalPoints.toLocaleString()} т`,
                    })}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded border border-amber-500/30 bg-zinc-950/90 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 border-b border-zinc-800 pb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {L(lang, {
                  en: `Point Breakdown (${getClassDisplayName(calc.classDef, lang)} — Class 3)`,
                  th: `สรุปการคำนวณพอยต์ (${getClassDisplayName(calc.classDef, lang)} — Class 3)`,
                  pt: `Resumo de Pontos (${getClassDisplayName(calc.classDef, lang)} — 3ª Classe)`,
                  ru: `Сводка по очкам (${getClassDisplayName(calc.classDef, lang)} — 3-й класс)`,
                  es: `Resumen de Puntos (${getClassDisplayName(calc.classDef, lang)} — 3ra Clase)`,
                  bg: `Справка за точки (${getClassDisplayName(calc.classDef, lang)} — 3-ти клас)`,
                })}
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">
                  {L(lang, {
                    en: 'Granted Level:',
                    th: 'ระดับเลเวลที่ได้รับ:',
                    pt: 'Nível Recebido:',
                    ru: 'Уровень персонажа:',
                    es: 'Nivel Obtenido:',
                    bg: 'Получено ниво:',
                  })}
                </span>
                <span className="font-mono-tabular font-bold text-white">
                  Level 400 (399 Level-Ups)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">
                  {L(lang, {
                    en: 'Base Points / Level:',
                    th: 'พอยต์พื้นฐานต่อเลเวลของสายอาชีพ:',
                    pt: 'Pontos Base por Nível:',
                    ru: 'Базовые очки за уровень:',
                    es: 'Puntos Base por Nivel:',
                    bg: 'Базови точки за ниво:',
                  })}
                </span>
                <span className="font-mono-tabular text-amber-300 font-semibold">
                  {calc.pointsPerLevel}{' '}
                  {L(lang, {
                    en: 'pts / lv',
                    th: 'พอยต์ / เลเวล',
                    pt: 'pts / nível',
                    ru: 'очк / ур',
                    es: 'pts / nivel',
                    bg: 'т / ниво',
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">
                  {L(lang, {
                    en: `Lv.1 → 400 Points (399 × ${calc.pointsPerLevel}):`,
                    th: `พอยต์จากเลเวล 1 → 400 (399 × ${calc.pointsPerLevel}):`,
                    pt: `Pontos Nv.1 → 400 (399 × ${calc.pointsPerLevel}):`,
                    ru: `Очки за 1 → 400 (399 × ${calc.pointsPerLevel}):`,
                    es: `Puntos Nv.1 → 400 (399 × ${calc.pointsPerLevel}):`,
                    bg: `Точки 1 → 400 (399 × ${calc.pointsPerLevel}):`,
                  })}
                </span>
                <span className="font-mono-tabular text-zinc-200 font-semibold">
                  +{calc.levelPoints.toLocaleString()} {ptsUnit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">
                  {L(lang, {
                    en: 'Starting Bonus:',
                    th: 'บวกพอยต์ชุดแรกเริ่มต้น (Starting Bonus):',
                    pt: 'Bônus Inicial (Starting Bonus):',
                    ru: 'Начальный бонус (Starting Bonus):',
                    es: 'Bono Inicial (Starting Bonus):',
                    bg: 'Начален Бонус (Starting Bonus):',
                  })}
                </span>
                <span className="font-mono-tabular text-emerald-400 font-semibold">
                  +{calc.startingPoints.toLocaleString()} {ptsUnit}
                </span>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-sm">
                <span className="font-bold text-white">
                  {L(lang, {
                    en: 'Immediate Points:',
                    th: 'รวมพอยต์ที่ได้รับทันที:',
                    pt: 'Total de Pontos Imediatos:',
                    ru: 'Итого сразу:',
                    es: 'Total Inmediato:',
                    bg: 'Общо веднага:',
                  })}
                </span>
                <span className="font-mono-tabular font-bold text-amber-400 text-base">
                  {calc.totalPoints.toLocaleString()} {ptsUnit}
                </span>
              </div>

              {calc.classDef.hasMarlonAndClass2Quest ? (
                <div className="pt-2 border-t border-zinc-800/70 text-[11px] text-zinc-400 space-y-0.5">
                  <div>
                    •{' '}
                    {L(lang, {
                      en: 'Excludes Lv.150 class quest: +20 pts',
                      th: 'ยังไม่รวมพอยต์เควสเปลี่ยนอาชีพ Lv.150: +20 พอยต์',
                      pt: 'Não inclui quest de evolução Nv.150: +20 pontos',
                      ru: 'Без квеста смены профессии 150 ур.: +20 очков',
                      es: 'No incluye quest de clase Lv.150: +20 puntos',
                      bg: 'Без куеста за клас 150 ниво: +20 точки',
                    })}
                  </div>
                  <div>
                    •{' '}
                    {L(lang, {
                      en: 'Excludes Marlon Lv.220 quest (Lv.221–400): +180 pts',
                      th: 'ยังไม่รวมพอยต์เควส Marlon Lv.220 (Lv.221–400): +180 พอยต์',
                      pt: 'Não inclui quest Marlon Nv.220 (Nv.221–400): +180 pontos',
                      ru: 'Без квеста Марлона 220 ур. (221–400): +180 очков',
                      es: 'No incluye quest Marlon Lv.220 (221–400): +180 puntos',
                      bg: 'Без куеста Марлон 220 ниво (221–400): +180 точки',
                    })}
                  </div>
                  <div className="text-amber-300/90">
                    {L(lang, {
                      en: `(Completing Lv.150 & Lv.220 quests in-game adds +200 for ${calc.totalIfQuestsCompleted.toLocaleString()} total pts)`,
                      th: `(หากไปทำเควส 150 & 220 เพิ่มในเกม จะได้เพิ่มอีก +200 รวมเป็น ${calc.totalIfQuestsCompleted.toLocaleString()} พอยต์)`,
                      pt: `(Completando as quests 150 & 220 no jogo, ganha +200 totalizando ${calc.totalIfQuestsCompleted.toLocaleString()} pontos)`,
                      ru: `(Пройдя квесты 150 и 220 в игре, получите еще +200 очков, всего ${calc.totalIfQuestsCompleted.toLocaleString()})`,
                      es: `(Completando quests 150 y 220 en el juego, ganas +200 totalizando ${calc.totalIfQuestsCompleted.toLocaleString()} puntos)`,
                      bg: `(След изпълнение на куестове 150 и 220 в играта се добавят още +200, общо ${calc.totalIfQuestsCompleted.toLocaleString()} точки)`,
                    })}
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-zinc-800/70 text-[11px] text-zinc-400">
                  {L(lang, {
                    en: `* Special classes (${getClassDisplayName(calc.classDef, lang)}) earn 7 pts/lv natively from Lv.1 without Lv.150/220 bonus quests.`,
                    th: `* สายอาชีพพิเศษ (${getClassDisplayName(calc.classDef, lang)}) ได้รับ 7 พอยต์/เลเวล ตั้งต้นตั้งแต่เลเวล 1 จึงไม่มีเควส Lv.150 (+20) และเควส Marlon Lv.220 (+180)`,
                    pt: `* Classes especiais (${getClassDisplayName(calc.classDef, lang)}) já recebem 7 pts/nível desde o nível 1 e não possuem quests de +20 / +180.`,
                    ru: `* Специальные классы (${getClassDisplayName(calc.classDef, lang)}) получают по 7 очков за уровень с 1 ур. и не имеют квестов +20 / +180.`,
                    es: `* Clases especiales (${getClassDisplayName(calc.classDef, lang)}) reciben 7 pts/nivel desde nivel 1 y no tienen quests de +20 / +180.`,
                    bg: `* Специалните класове (${getClassDisplayName(calc.classDef, lang)}) получават по 7 точки/ниво от началото и нямат куестове +20 / +180.`,
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded border border-zinc-800 bg-zinc-950/90 space-y-2.5">
            <div className="text-xs font-bold text-zinc-200 border-b border-zinc-800 pb-2">
              {L(lang, {
                en: `Base Attributes (${getClassDisplayName(calc.classDef, lang)})`,
                th: `สเตตัสเริ่มต้นของสายอาชีพ (${getClassDisplayName(calc.classDef, lang)})`,
                pt: `Atributos Base da Classe (${getClassDisplayName(calc.classDef, lang)})`,
                ru: `Базовые параметры (${getClassDisplayName(calc.classDef, lang)})`,
                es: `Atributos Base (${getClassDisplayName(calc.classDef, lang)})`,
                bg: `Базови характеристики (${getClassDisplayName(calc.classDef, lang)})`,
              })}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono-tabular">
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800 flex justify-between">
                <span className="text-zinc-400 font-sans">STR:</span>
                <strong className="text-zinc-100">{calc.classDef.baseStr}</strong>
              </div>
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800 flex justify-between">
                <span className="text-zinc-400 font-sans">AGI:</span>
                <strong className="text-zinc-100">{calc.classDef.baseAgi}</strong>
              </div>
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800 flex justify-between">
                <span className="text-zinc-400 font-sans">VIT:</span>
                <strong className="text-zinc-100">{calc.classDef.baseVit}</strong>
              </div>
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800 flex justify-between">
                <span className="text-zinc-400 font-sans">ENE:</span>
                <strong className="text-zinc-100">{calc.classDef.baseEne}</strong>
              </div>
              {calc.classDef.baseCmd > 0 && (
                <div className="col-span-2 p-2 rounded bg-zinc-900 border border-zinc-800 flex justify-between">
                  <span className="text-zinc-400 font-sans">Command (CMD):</span>
                  <strong className="text-amber-300">{calc.classDef.baseCmd}</strong>
                </div>
              )}
            </div>
            <div className="text-[11px] text-zinc-400 pt-1">
              {L(lang, {
                en: 'Characters on your account:',
                th: 'ตัวละครปัจจุบันในไอดีของคุณ:',
                pt: 'Personagens na sua conta:',
                ru: 'Персонажей на аккаунте:',
                es: 'Personajes en tu cuenta:',
                bg: 'Герои в акаунта ви:',
              })}{' '}
              <strong className="text-white">{characters.length} / 5</strong>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-zinc-300">
            {L(lang, {
              en: 'Create 3rd Class character ',
              th: 'ซื้อตัวละคร Class 3 ',
              pt: 'Criar personagem 3ª Classe ',
              ru: 'Создать персонажа 3-го класса ',
              es: 'Crear personaje 3ra Clase ',
              bg: 'Създай герой 3-ти клас ',
            })}
            <strong className="text-white">
              {newCharName.trim() ||
                L(lang, {
                  en: '(name)',
                  th: '(ระบุชื่อ)',
                  pt: '(nome)',
                  ru: '(имя)',
                  es: '(nombre)',
                  bg: '(име)',
                })}
            </strong>{' '}
            <strong className="text-amber-300">
              {getClassDisplayName(calc.classDef, lang)}
            </strong>{' '}
            Lv.400 (+
            <strong className="text-emerald-400 font-mono-tabular">
              {calc.totalPoints.toLocaleString()} {ptsUnit}
            </strong>
            )
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors cursor-pointer whitespace-nowrap"
          >
            {L(lang, {
              en: `Buy Lv.400 Character (${cost.toLocaleString()} Credits)`,
              th: `ซื้อตัวละคร Class 3 Lv.400 (${cost.toLocaleString()} Credits)`,
              pt: `Comprar Personagem Nv.400 (${cost.toLocaleString()} Créditos)`,
              ru: `Купить персонажа 400 ур. (${cost.toLocaleString()} кредитов)`,
              es: `Comprar Personaje Lv.400 (${cost.toLocaleString()} Créditos)`,
              bg: `Купи Герой 400 Ниво (${cost.toLocaleString()} кредита)`,
            })}
          </button>
        </div>
      </form>

      <div className="p-4 rounded border border-zinc-800 bg-zinc-900/60 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
          <Info className="w-4 h-4 text-amber-400" />
          <span>
            {L(lang, {
              en: '3rd Class Point Formula Reference (Level 400 + 300 Starting Points)',
              th: 'ตารางตรวจสอบสูตรคำนวณพอยต์ Class 3 ทั้ง 5 อาชีพ (Level 400 + พอยต์เริ่มต้น 300)',
              pt: 'Tabela de Cálculo de Pontos das 5 Classes (Nível 400 + 300 Pontos Iniciais)',
              ru: 'Таблица расчёта очков для 5 классов (400 ур. + 300 начальных очков)',
              es: 'Tabla de Cálculo de Puntos de 5 Clases (Nivel 400 + 300 Puntos Iniciales)',
              bg: 'Таблица за изчисление на точки за 5-те класа (400 ниво + 300 начални точки)',
            })}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="py-2 pr-3">
                  {L(lang, {
                    en: '3rd Class',
                    th: 'อาชีพ Class 3',
                    pt: '3ª Classe',
                    ru: '3-й класс',
                    es: '3ra Clase',
                    bg: '3-ти клас',
                  })}
                </th>
                <th className="py-2 px-3 text-center">
                  {L(lang, {
                    en: 'Pts/Lv',
                    th: 'พอยต์/เลเวล',
                    pt: 'Pts/Nível',
                    ru: 'Очков/ур.',
                    es: 'Pts/Nivel',
                    bg: 'Точки/ниво',
                  })}
                </th>
                <th className="py-2 px-3 text-right">Lv.1 → 400</th>
                <th className="py-2 px-3 text-right">
                  {L(lang, {
                    en: 'Starting Bonus',
                    th: 'พอยต์เริ่มต้น',
                    pt: 'Bônus Inicial',
                    ru: 'Начальный бонус',
                    es: 'Bono Inicial',
                    bg: 'Начален бонус',
                  })}
                </th>
                <th className="py-2 px-3 text-right text-amber-300">
                  {L(lang, {
                    en: 'Total Granted',
                    th: 'รวมพอยต์ที่ได้รับทันที',
                    pt: 'Total Imediato',
                    ru: 'Итого сразу',
                    es: 'Total Inmediato',
                    bg: 'Общо веднага',
                  })}
                </th>
                <th className="py-2 pl-3 text-right text-zinc-400">
                  {L(lang, {
                    en: 'Excluded Quests',
                    th: 'พอยต์เควสที่ยังไม่รวม',
                    pt: 'Quests Excluídas',
                    ru: 'Без квестов',
                    es: 'Quests Excluidas',
                    bg: 'Без куестове',
                  })}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono-tabular">
              {CLASS_3_CLASSES.map((c) => {
                const c400 = calculateClassStatPoints(c.code, 400);
                const isSelected = selectedClass === c.code;
                return (
                  <tr
                    key={c.code}
                    onClick={() => setSelectedClass(c.code)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-amber-500/10' : 'hover:bg-zinc-800/40'
                    }`}
                  >
                    <td className="py-2 pr-3 font-sans font-bold text-white">
                      {getClassDisplayName(c, lang)}
                    </td>
                    <td className="py-2 px-3 text-center text-amber-400 font-bold">
                      {c.pointsPerLevel}
                    </td>
                    <td className="py-2 px-3 text-right text-zinc-200">
                      399 × {c.pointsPerLevel} = {c400.levelPoints.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-400">
                      +{INITIAL_STARTING_POINTS}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-amber-300">
                      {c400.totalPoints.toLocaleString()} {ptsUnit}
                    </td>
                    <td className="py-2 pl-3 text-right text-zinc-400 font-sans text-[11px]">
                      {c.hasMarlonAndClass2Quest
                        ? L(lang, {
                            en: 'Excludes +20 (Lv.150) & +180 (Lv.220)',
                            th: 'ยังไม่รวม +20 (เควส 150) และ +180 (เควส 220)',
                            pt: 'Sem +20 (Quest 150) e +180 (Quest 220)',
                            ru: 'Без +20 (квест 150) и +180 (квест 220)',
                            es: 'Sin +20 (Quest 150) y +180 (Quest 220)',
                            bg: 'Без +20 (куест 150) и +180 (куест 220)',
                          })
                        : L(lang, {
                            en: 'Native 7 pts/lv (No 150/220 quests)',
                            th: 'ไม่มีเควส 150/220 (ได้ 7 พอยต์/เลเวลตั้งแต่ต้น)',
                            pt: 'Sem quests 150/220 (7 pts/nv nativo)',
                            ru: 'Без квестов 150/220 (базово 7 очков/ур.)',
                            es: 'Sin quests 150/220 (7 pts/nivel nativo)',
                            bg: 'Без куестове 150/220 (7 точки/ниво)',
                          })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 3. Delete Level 400 Character (+300 Credits)
export const DeleteCharacter400Module: React.FC<{
  characters: Character[];
  lang?: LanguageCode;
  onDeleteCharacter400: (
    charName: string,
    deleteCode: string
  ) => Promise<ActionResponse> | ActionResponse;
}> = ({ characters, lang = 'Thai', onDeleteCharacter400 }) => {
  const level400Chars = characters.filter((c) => c.level === 400);
  const [selectedName, setSelectedName] = useState(
    level400Chars[0]?.name || characters[0]?.name || ''
  );
  const [deleteCodeInput, setDeleteCodeInput] = useState('');
  const [status, setStatus] = useState<ActionResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!characters.some((c) => c.name === selectedName)) {
      setSelectedName(level400Chars[0]?.name || characters[0]?.name || '');
    }
  }, [characters, level400Chars, selectedName]);

  const targetChar = characters.find(
    (c) => c.name.toLowerCase() === selectedName.toLowerCase()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!targetChar) {
      setStatus({
        ok: false,
        message: L(lang, {
          en: 'Please select a character to delete.',
          th: 'กรุณาเลือกตัวละครที่ต้องการลบ',
          pt: 'Selecione o personagem que deseja excluir.',
          ru: 'Выберите персонажа для удаления.',
          es: 'Selecciona el personaje que deseas eliminar.',
          bg: 'Изберете героя, който желаете да изтриете.',
        }),
      });
      return;
    }
    const cleanCode = deleteCodeInput.trim();
    if (cleanCode.length < 4 || cleanCode.length > 32) {
      setStatus({
        ok: false,
        message: L(lang, {
          en: 'Please enter your Character Delete Code or account password (4–32 characters).',
          th: 'กรุณากรอกรหัสลบตัวละคร (Security Code) หรือรหัสผ่านบัญชีของคุณ (4–32 ตัวอักษร)',
          pt: 'Digite seu código de exclusão ou senha da conta (4–32 caracteres).',
          ru: 'Введите код удаления персонажа или пароль аккаунта (4–32 символа).',
          es: 'Ingresa tu código de borrado o contraseña de cuenta (4–32 caracteres).',
          bg: 'Въведете код за изтриване или парола на акаунта (4–32 символа).',
        }),
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await onDeleteCharacter400(targetChar.name, cleanCode);
      setStatus(res);
      if (res.ok) {
        setDeleteCodeInput('');
        const remaining = characters.filter(
          (c) => c.name.toLowerCase() !== targetChar.name.toLowerCase()
        );
        setSelectedName(remaining[0]?.name || '');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <StatusNotice status={status} />

      <form
        onSubmit={handleSubmit}
        className="p-5 rounded border border-zinc-800 bg-zinc-900/80 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-400" />
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                {L(lang, {
                  en: `Delete Level 400 Character for Credits (+${DELETE_CHAR_400_REWARD_CREDITS} Credits)`,
                  th: `ลบตัวละคร เลเวล 400 แลกรับเครดิต (+${DELETE_CHAR_400_REWARD_CREDITS} Credits)`,
                  pt: `Excluir Personagem Nível 400 por Créditos (+${DELETE_CHAR_400_REWARD_CREDITS} Créditos)`,
                  ru: `Удалить персонажа 400 ур. за кредиты (+${DELETE_CHAR_400_REWARD_CREDITS} кредитов)`,
                  es: `Eliminar Personaje Nivel 400 por Créditos (+${DELETE_CHAR_400_REWARD_CREDITS} Créditos)`,
                  bg: `Изтрий Герой 400 Ниво за Кредити (+${DELETE_CHAR_400_REWARD_CREDITS} Кредита)`,
                })}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {L(lang, {
                  en: `Level 400 characters can be permanently deleted in exchange for +${DELETE_CHAR_400_REWARD_CREDITS} Credits credited to your account.`,
                  th: `ตัวละครที่มีระดับเลเวล 400 สามารถนำมาลบเพื่อแลกรับเครดิตคืนเข้าบัญชีได้ทันที +${DELETE_CHAR_400_REWARD_CREDITS} Credits`,
                  pt: `Personagens no Nível 400 podem ser excluídos para receber +${DELETE_CHAR_400_REWARD_CREDITS} Créditos instantaneamente na sua conta.`,
                  ru: `Персонажей 400 уровня можно удалить и мгновенно получить +${DELETE_CHAR_400_REWARD_CREDITS} кредитов на свой аккаунт.`,
                  es: `Los personajes de Nivel 400 se pueden eliminar para recibir +${DELETE_CHAR_400_REWARD_CREDITS} Créditos instantáneamente en tu cuenta.`,
                  bg: `Героите от 400 ниво могат да бъдат изтрити за незабавно получаване на +${DELETE_CHAR_400_REWARD_CREDITS} кредита в акаунта.`,
                })}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono-tabular font-semibold shrink-0 self-start">
            {L(lang, {
              en: `Earn +${DELETE_CHAR_400_REWARD_CREDITS} Credits`,
              th: `ได้รับ +${DELETE_CHAR_400_REWARD_CREDITS} Credits`,
              pt: `Receba +${DELETE_CHAR_400_REWARD_CREDITS} Créditos`,
              ru: `+${DELETE_CHAR_400_REWARD_CREDITS} Кредитов`,
              es: `Recibe +${DELETE_CHAR_400_REWARD_CREDITS} Créditos`,
              bg: `Получи +${DELETE_CHAR_400_REWARD_CREDITS} Кредита`,
            })}
          </span>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-300">
            {L(lang, {
              en: 'Select the character on your account to delete for credits',
              th: 'เลือกตัวละครในบัญชีของคุณที่ต้องการลบแลกเครดิต',
              pt: 'Selecione o personagem da sua conta para excluir em troca de créditos',
              ru: 'Выберите персонажа вашего аккаунта для удаления в обмен на кредиты',
              es: 'Selecciona el personaje de tu cuenta a eliminar a cambio de créditos',
              bg: 'Изберете герой от вашия акаунт за изтриване срещу кредити',
            })}
          </label>
          {characters.length === 0 ? (
            <div className="p-4 rounded border border-zinc-800 bg-zinc-950 text-xs text-zinc-400">
              {t('no_characters', lang)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {characters.map((ch) => {
                const cls = MU_CLASSES.find((m) => m.code === ch.classCode);
                const isEligible = ch.level === 400 && ch.ctlCode === 0;
                const isSelected =
                  targetChar?.name.toLowerCase() === ch.name.toLowerCase();

                return (
                  <button
                    key={ch.name}
                    type="button"
                    onClick={() => {
                      setSelectedName(ch.name);
                      setStatus(null);
                    }}
                    className={`p-3.5 rounded border text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15'
                        : 'border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{ch.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono-tabular font-semibold ${
                          isEligible
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {ch.ctlCode !== 0
                          ? L(lang, {
                              en: 'Banned',
                              th: 'ติดสถานะแบน',
                              pt: 'Banido',
                              ru: 'Заблокирован',
                              es: 'Baneado',
                              bg: 'Блокиран',
                            })
                          : ch.level === 400
                          ? L(lang, {
                              en: `Lv.400 · +${DELETE_CHAR_400_REWARD_CREDITS} Cr`,
                              th: `Lv.400 · แลกได้ +${DELETE_CHAR_400_REWARD_CREDITS} Cr`,
                              pt: `Nv.400 · +${DELETE_CHAR_400_REWARD_CREDITS} Cr`,
                              ru: `400 ур. · +${DELETE_CHAR_400_REWARD_CREDITS} Кр`,
                              es: `Lv.400 · +${DELETE_CHAR_400_REWARD_CREDITS} Cr`,
                              bg: `400 нив. · +${DELETE_CHAR_400_REWARD_CREDITS} Кр`,
                            })
                          : L(lang, {
                              en: `Lv.${ch.level} (Requires Lv.400)`,
                              th: `Lv.${ch.level} (ต้อง Lv.400)`,
                              pt: `Nv.${ch.level} (Requer Nv.400)`,
                              ru: `${ch.level} ур. (нужен 400 ур.)`,
                              es: `Lv.${ch.level} (Requiere Lv.400)`,
                              bg: `${ch.level} нив. (изисква 400 ниво)`,
                            })}
                      </span>
                    </div>
                    <div className="text-zinc-400 mt-1">
                      {L(lang, {
                        en: 'Class:',
                        th: 'อาชีพ:',
                        pt: 'Classe:',
                        ru: 'Класс:',
                        es: 'Clase:',
                        bg: 'Клас:',
                      })}{' '}
                      <strong className="text-zinc-200">
                        {cls ? getClassDisplayName(cls, lang) : ch.classCode}
                      </strong>{' '}
                      ·{' '}
                      {L(lang, {
                        en: 'Points:',
                        th: 'พอยต์คงเหลือ:',
                        pt: 'Pontos:',
                        ru: 'Очки:',
                        es: 'Puntos:',
                        bg: 'Точки:',
                      })}{' '}
                      <span className="font-mono-tabular text-amber-300">
                        {ch.levelUpPoints.toLocaleString()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {targetChar && (
          <div className="p-4 rounded border border-rose-500/30 bg-rose-500/5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">
                {L(lang, {
                  en: 'Selected character:',
                  th: 'ตัวละครที่เลือก:',
                  pt: 'Personagem selecionado:',
                  ru: 'Выбранный персонаж:',
                  es: 'Personaje seleccionado:',
                  bg: 'Избран герой:',
                })}{' '}
                <strong className="text-white">{targetChar.name}</strong> (Level{' '}
                {targetChar.level})
              </span>
              <span className="font-mono-tabular font-bold text-emerald-400">
                {L(lang, {
                  en: `Reward: +${DELETE_CHAR_400_REWARD_CREDITS} Credits`,
                  th: `เครดิตที่จะได้รับ: +${DELETE_CHAR_400_REWARD_CREDITS} Credits`,
                  pt: `Recompensa: +${DELETE_CHAR_400_REWARD_CREDITS} Créditos`,
                  ru: `Награда: +${DELETE_CHAR_400_REWARD_CREDITS} Кредитов`,
                  es: `Recompensa: +${DELETE_CHAR_400_REWARD_CREDITS} Créditos`,
                  bg: `Награда: +${DELETE_CHAR_400_REWARD_CREDITS} Кредита`,
                })}
              </span>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">
                {L(lang, {
                  en: 'Enter your Character Delete Code (Security Code) or account password to confirm permanent deletion:',
                  th: 'กรอกรหัสลบตัวละคร (Security Code) หรือรหัสผ่านของบัญชีนี้เพื่อยืนยันการลบถาวร:',
                  pt: 'Digite seu código de exclusão ou senha da conta para confirmar:',
                  ru: 'Введите код удаления персонажа или пароль аккаунта для подтверждения:',
                  es: 'Ingresa tu código de borrado o contraseña de cuenta para confirmar:',
                  bg: 'Въведете кода си за изтриване или парола на акаунта за потвърждение:',
                })}
              </label>
              <input
                type="password"
                maxLength={32}
                value={deleteCodeInput}
                onChange={(e) => setDeleteCodeInput(e.target.value.slice(0, 32))}
                placeholder={L(lang, {
                  en: 'Security Code / Password',
                  th: 'กรอกรหัสลบตัวละคร หรือ รหัสผ่านบัญชี',
                  pt: 'Código de exclusão / Senha',
                  ru: 'Код удаления / Пароль',
                  es: 'Código de borrado / Contraseña',
                  bg: 'Код за изтриване / Парола',
                })}
                required
                className="w-full px-3 py-2 text-xs font-mono-tabular tracking-widest rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
              />
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-zinc-400">
            {L(lang, {
              en: '* Character must be Level 400 and Offline.',
              th: '* ตัวละครต้องมีเลเวล 400 และอยู่ในสถานะ Offline เท่านั้น',
              pt: '* O personagem deve estar no Nível 400 e Offline.',
              ru: '* Персонаж должен быть 400 уровня и Offline в игре.',
              es: '* El personaje debe estar en Nivel 400 y Desconectado (Offline).',
              bg: '* Героят трябва да е 400 ниво и Офлайн (Offline).',
            })}
          </span>
          <button
            type="submit"
            disabled={!targetChar || targetChar.level !== 400 || isSubmitting}
            className="px-5 py-2.5 text-xs font-semibold rounded bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-zinc-950 transition-colors cursor-pointer whitespace-nowrap"
          >
            {L(lang, {
              en: `Confirm Delete ${targetChar?.name || ''} (+${DELETE_CHAR_400_REWARD_CREDITS} Credits)`,
              th: `ยืนยันลบตัวละคร ${targetChar?.name || ''} รับ +${DELETE_CHAR_400_REWARD_CREDITS} Credits`,
              pt: `Confirmar Exclusão de ${targetChar?.name || ''} (+${DELETE_CHAR_400_REWARD_CREDITS} Créditos)`,
              ru: `Удалить ${targetChar?.name || ''} (+${DELETE_CHAR_400_REWARD_CREDITS} кредитов)`,
              es: `Confirmar Eliminación de ${targetChar?.name || ''} (+${DELETE_CHAR_400_REWARD_CREDITS} Créditos)`,
              bg: `Потвърди изтриването на ${targetChar?.name || ''} (+${DELETE_CHAR_400_REWARD_CREDITS} кредита)`,
            })}
          </button>
        </div>
      </form>
    </div>
  );
};

// 4. Online Hours -> Credits Exchange (1 Hour = 5 Credits)
export const OnlineHoursRewardModule: React.FC<{
  account: AccountData;
  lang?: LanguageCode;
  onRedeemOnlineHours: (
    hoursToRedeem: number
  ) => Promise<ActionResponse> | ActionResponse;
}> = ({ account, lang = 'Thai', onRedeemOnlineHours }) => {
  const availableFullHours = Math.floor((account.onlineMinutes || 0) / 60);
  const remainingMinutes = (account.onlineMinutes || 0) % 60;

  const [hoursInput, setHoursInput] = useState<number>(
    Math.max(1, availableFullHours)
  );
  const [status, setStatus] = useState<ActionResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (availableFullHours > 0) {
      setHoursInput(availableFullHours);
    } else {
      setHoursInput(1);
    }
  }, [availableFullHours]);

  const creditsToReceive =
    Math.max(0, Math.min(hoursInput, availableFullHours)) *
    ONLINE_HOUR_REWARD_CREDITS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await onRedeemOnlineHours(hoursInput);
      setStatus(res);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <StatusNotice status={status} />

      <form
        onSubmit={handleSubmit}
        className="p-5 rounded border border-zinc-800 bg-zinc-900/80 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                {L(lang, {
                  en: `Online Time Exchange (1 Hour = ${ONLINE_HOUR_REWARD_CREDITS} Credits)`,
                  th: `ระบบออนไลน์แลกเครดิต (1 ชั่วโมง = ${ONLINE_HOUR_REWARD_CREDITS} Credits)`,
                  pt: `Trocar Horas Online por Créditos (1 Hora = ${ONLINE_HOUR_REWARD_CREDITS} Créditos)`,
                  ru: `Обмен онлайн-времени на кредиты (1 час = ${ONLINE_HOUR_REWARD_CREDITS} кредитов)`,
                  es: `Canjear Horas Online por Créditos (1 Hora = ${ONLINE_HOUR_REWARD_CREDITS} Créditos)`,
                  bg: `Обмяна на онлайн време за кредити (1 час = ${ONLINE_HOUR_REWARD_CREDITS} кредита)`,
                })}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {L(lang, {
                  en: `Accumulate in-game online time! Every full hour (60 minutes) can be redeemed for ${ONLINE_HOUR_REWARD_CREDITS} Credits. Remaining minutes carry over.`,
                  th: `สะสมเวลาออนไลน์ในเกมครบทุก 1 ชั่วโมง (60 นาที) สามารถนำมาแลกรับได้ทันที ${ONLINE_HOUR_REWARD_CREDITS} Credits โดยเศษนาทีที่เหลือจะถูกเก็บสะสมไว้ต่อ`,
                  pt: `Acumule tempo online no jogo! Cada 1 hora completa (60 minutos) pode ser trocada por ${ONLINE_HOUR_REWARD_CREDITS} Créditos. Os minutos restantes permanecem acumulados.`,
                  ru: `Копите время в игре! Каждый 1 полный час (60 мин) можно обменять на ${ONLINE_HOUR_REWARD_CREDITS} кредитов. Оставшиеся минуты сохраняются.`,
                  es: `¡Acumula tiempo en el juego! Cada 1 hora completa (60 min) se puede canjear por ${ONLINE_HOUR_REWARD_CREDITS} Créditos. Los minutos restantes quedan acumulados.`,
                  bg: `Натрупвайте онлайн време в играта! Всеки 1 пълен час (60 мин) се обменя за ${ONLINE_HOUR_REWARD_CREDITS} кредита. Останалите минути се запазват.`,
                })}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono-tabular font-semibold shrink-0 self-start">
            {L(lang, {
              en: `1 Hr = ${ONLINE_HOUR_REWARD_CREDITS} Credits`,
              th: `1 ชม. = ${ONLINE_HOUR_REWARD_CREDITS} Credits`,
              pt: `1 Hora = ${ONLINE_HOUR_REWARD_CREDITS} Créditos`,
              ru: `1 час = ${ONLINE_HOUR_REWARD_CREDITS} Кр`,
              es: `1 Hora = ${ONLINE_HOUR_REWARD_CREDITS} Créditos`,
              bg: `1 час = ${ONLINE_HOUR_REWARD_CREDITS} Кр`,
            })}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono-tabular">
          <div className="p-3.5 rounded bg-zinc-950 border border-zinc-800">
            <div className="text-[11px] text-zinc-400 font-sans">
              {L(lang, {
                en: 'Accumulated Online Time',
                th: 'เวลาออนไลน์สะสมคงเหลือ',
                pt: 'Tempo Online Acumulado',
                ru: 'Накопленное онлайн-время',
                es: 'Tiempo Online Acumulado',
                bg: 'Натрупано онлайн време',
              })}
            </div>
            <div className="text-sm font-bold text-white mt-1">
              {availableFullHours}h {remainingMinutes}m
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              {L(lang, {
                en: `Total: ${(account.onlineMinutes || 0).toLocaleString()} min`,
                th: `รวม ${(account.onlineMinutes || 0).toLocaleString()} นาที`,
                pt: `Total: ${(account.onlineMinutes || 0).toLocaleString()} min`,
                ru: `Всего: ${(account.onlineMinutes || 0).toLocaleString()} мин`,
                es: `Total: ${(account.onlineMinutes || 0).toLocaleString()} min`,
                bg: `Общо: ${(account.onlineMinutes || 0).toLocaleString()} мин`,
              })}
            </div>
          </div>

          <div className="p-3.5 rounded bg-zinc-950 border border-amber-500/30">
            <div className="text-[11px] text-zinc-400 font-sans">
              {L(lang, {
                en: 'Redeemable Full Hours',
                th: 'จำนวนชั่วโมงที่แลกได้ทันที',
                pt: 'Horas Disponíveis para Troca',
                ru: 'Доступно полных часов',
                es: 'Horas Disponibles para Canje',
                bg: 'Достъпни часове за обмяна',
              })}
            </div>
            <div className="text-sm font-bold text-amber-400 mt-1">
              {availableFullHours}{' '}
              {L(lang, {
                en: 'full hours',
                th: 'ชั่วโมงเต็ม',
                pt: 'horas completas',
                ru: 'полных часов',
                es: 'horas completas',
                bg: 'пълни часа',
              })}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              {L(lang, {
                en: `${remainingMinutes} min carried forward`,
                th: `คงเหลือเศษ ${remainingMinutes} นาทีเก็บสะสมต่อ`,
                pt: `Sobram ${remainingMinutes} min acumulados`,
                ru: `Остаток ${remainingMinutes} мин сохранится`,
                es: `Quedan ${remainingMinutes} min acumulados`,
                bg: `Остават ${remainingMinutes} мин натрупани`,
              })}
            </div>
          </div>

          <div className="p-3.5 rounded bg-zinc-950 border border-emerald-500/30">
            <div className="text-[11px] text-zinc-400 font-sans">
              {L(lang, {
                en: `Credits Available (${availableFullHours} × ${ONLINE_HOUR_REWARD_CREDITS})`,
                th: `เครดิตที่จะได้รับ (${availableFullHours} × ${ONLINE_HOUR_REWARD_CREDITS})`,
                pt: `Créditos a Receber (${availableFullHours} × ${ONLINE_HOUR_REWARD_CREDITS})`,
                ru: `Кредитов к получению (${availableFullHours} × ${ONLINE_HOUR_REWARD_CREDITS})`,
                es: `Créditos a Recibir (${availableFullHours} × ${ONLINE_HOUR_REWARD_CREDITS})`,
                bg: `Кредити за получаване (${availableFullHours} × ${ONLINE_HOUR_REWARD_CREDITS})`,
              })}
            </div>
            <div className="text-sm font-bold text-emerald-400 mt-1">
              +{(availableFullHours * ONLINE_HOUR_REWARD_CREDITS).toLocaleString()} Credits
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              {L(lang, {
                en: `Total exchanged: ${account.exchangedOnlineHours || 0}h`,
                th: `แลกสะสมแล้วทั้งหมด ${account.exchangedOnlineHours || 0} ชม.`,
                pt: `Total já trocado: ${account.exchangedOnlineHours || 0}h`,
                ru: `Уже обменено: ${account.exchangedOnlineHours || 0} ч`,
                es: `Total canjeado: ${account.exchangedOnlineHours || 0}h`,
                bg: `Вече обменено: ${account.exchangedOnlineHours || 0}ч`,
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs text-zinc-300 mb-1.5">
              {L(lang, {
                en: `Hours to redeem (max ${availableFullHours} hours)`,
                th: `ระบุจำนวนชั่วโมงที่ต้องการแลก (สูงสุด ${availableFullHours} ชั่วโมง)`,
                pt: `Horas para resgatar (máx. ${availableFullHours} horas)`,
                ru: `Часов для обмена (макс. ${availableFullHours} ч.)`,
                es: `Horas a canjear (máx. ${availableFullHours} horas)`,
                bg: `Часове за обмяна (макс. ${availableFullHours} часа)`,
              })}
            </label>
            <input
              type="number"
              min={1}
              max={Math.max(1, availableFullHours)}
              value={hoursInput}
              onChange={(e) => setHoursInput(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-mono-tabular rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            />
          </div>

          <button
            type="submit"
            disabled={availableFullHours < 1 || isSubmitting}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 transition-colors cursor-pointer"
          >
            {L(lang, {
              en: `Exchange ${Math.min(hoursInput, availableFullHours)}h for +${creditsToReceive.toLocaleString()} Credits`,
              th: `แลกเวลาออนไลน์ ${Math.min(hoursInput, availableFullHours)} ชม. รับ +${creditsToReceive.toLocaleString()} Credits`,
              pt: `Trocar ${Math.min(hoursInput, availableFullHours)}h por +${creditsToReceive.toLocaleString()} Créditos`,
              ru: `Обменять ${Math.min(hoursInput, availableFullHours)} ч. на +${creditsToReceive.toLocaleString()} Кр.`,
              es: `Canjear ${Math.min(hoursInput, availableFullHours)}h por +${creditsToReceive.toLocaleString()} Créditos`,
              bg: `Обмени ${Math.min(hoursInput, availableFullHours)}ч за +${creditsToReceive.toLocaleString()} Кр.`,
            })}
          </button>
        </div>
      </form>
    </div>
  );
};

// 5. Get LevelUp Stat Points
export const PointsModule: React.FC<{
  characters: Character[];
  config: WebShopConfig;
  lang?: LanguageCode;
  onAddPoints: (charName: string, points: number) => ActionResponse;
}> = ({ characters, config, lang = 'Thai', onAddPoints }) => {
  const [charName, setCharName] = useState(characters[0]?.name || '');
  const [points, setPoints] = useState(500);
  const [status, setStatus] = useState<ActionResponse | null>(null);

  useEffect(() => {
    if (!characters.some((c) => c.name === charName)) {
      setCharName(characters[0]?.name || '');
    }
  }, [characters, charName]);

  const requiredCredits = Math.ceil(
    Math.max(0, points) / config.credits.points
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(onAddPoints(charName.trim(), points));
  };

  return (
    <div className="max-w-xl space-y-5">
      <StatusNotice status={status} />
      <form
        onSubmit={handleSubmit}
        className="p-5 rounded border border-zinc-800 bg-zinc-900/80 space-y-4"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-zinc-100">
            {L(lang, {
              en: 'Buy Attribute Stat Points (LevelUp Points)',
              th: 'ซื้อพอยต์สเตตัสเพิ่ม (Get LevelUp Points for Credits)',
              pt: 'Comprar Pontos de Atributo (Get LevelUp Points)',
              ru: 'Покупка очков характеристик (LevelUp Points)',
              es: 'Comprar Puntos de Atributo (LevelUp Points)',
              bg: 'Купи точки за характеристики (LevelUp Points)',
            })}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              {L(lang, {
                en: 'Select Character',
                th: 'เลือกตัวละคร',
                pt: 'Selecione o Personagem',
                ru: 'Выберите персонажа',
                es: 'Seleccionar Personaje',
                bg: 'Изберете герой',
              })}
            </label>
            {characters.length === 0 ? (
              <div className="px-3 py-2 text-xs rounded bg-zinc-950 border border-zinc-800 text-zinc-500">
                {t('no_characters', lang)}
              </div>
            ) : (
              <select
                value={charName}
                onChange={(e) => setCharName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
              >
                {characters.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.levelUpPoints.toLocaleString()} pts)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              {L(lang, {
                en: `Points Amount (Min. ${config.credits.points})`,
                th: `จำนวนพอยต์ที่ต้องการซื้อ (ขั้นต่ำ ${config.credits.points})`,
                pt: `Quantidade de Pontos (Mín. ${config.credits.points})`,
                ru: `Количество очков (Мин. ${config.credits.points})`,
                es: `Cantidad de Puntos (Mín. ${config.credits.points})`,
                bg: `Брой точки (Мин. ${config.credits.points})`,
              })}
            </label>
            <input
              type="number"
              min={config.credits.points}
              max={65000}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-mono-tabular rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-zinc-300 font-mono-tabular">
            1 Credit = <strong>{config.credits.points}</strong>{' '}
            {L(lang, {
              en: 'points · Total:',
              th: 'พอยต์ · รวมราคา:',
              pt: 'pontos · Total:',
              ru: 'очков · Итого:',
              es: 'puntos · Total:',
              bg: 'точки · Общо:',
            })}{' '}
            <strong className="text-amber-400">
              {requiredCredits.toLocaleString()} credits
            </strong>
          </div>
          <button
            type="submit"
            disabled={characters.length === 0}
            className="px-4 py-2 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 transition-colors cursor-pointer whitespace-nowrap"
          >
            {L(lang, {
              en: 'Buy Stat Points',
              th: 'ซื้อพอยต์เพิ่ม',
              pt: 'Comprar Pontos',
              ru: 'Купить очки',
              es: 'Comprar Puntos',
              bg: 'Купи точки',
            })}
          </button>
        </div>
      </form>
    </div>
  );
};

// 6. Buy Warehouse Zen (50 Credits = 500M Zen, Max 900M Vault Cap)
export const ZenModule: React.FC<{
  account: AccountData;
  characters: Character[];
  lang?: LanguageCode;
  onBuyWarehouseZen: () => ActionResponse;
  onTransferVaultZenToChar: (charName: string, amount: number) => ActionResponse;
}> = ({
  account,
  characters,
  lang = 'Thai',
  onBuyWarehouseZen,
  onTransferVaultZenToChar,
}) => {
  const [status, setStatus] = useState<ActionResponse | null>(null);
  const [withdrawChar, setWithdrawChar] = useState(characters[0]?.name || '');
  const [withdrawAmount, setWithdrawAmount] = useState(200_000_000);

  useEffect(() => {
    if (!characters.some((c) => c.name === withdrawChar)) {
      setWithdrawChar(characters[0]?.name || '');
    }
  }, [characters, withdrawChar]);

  const currentVaultZen = account.vaultMoney;
  const projectedVaultZen = currentVaultZen + ZEN_PURCHASE_AMOUNT;
  const isOverLimit = projectedVaultZen > WAREHOUSE_ZEN_MAX_LIMIT;
  const usagePercent = Math.min(
    100,
    Math.round((currentVaultZen / WAREHOUSE_ZEN_MAX_LIMIT) * 100)
  );

  const handleBuy = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(onBuyWarehouseZen());
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(onTransferVaultZenToChar(withdrawChar, withdrawAmount));
  };

  return (
    <div className="max-w-2xl space-y-5">
      <StatusNotice status={status} />

      <form
        onSubmit={handleBuy}
        className="p-5 rounded border border-zinc-800 bg-zinc-900/80 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                {L(lang, {
                  en: 'Buy Warehouse Zen (50 Credits = 500,000,000 Zen / 500M)',
                  th: 'ซื้อเงิน Zen เข้าคลังเก็บของ (50 Credits = 500,000,000 Zen / 500M)',
                  pt: 'Comprar Zen para o Baú (50 Créditos = 500.000.000 Zen / 500M)',
                  ru: 'Покупка Zen в сундук (50 кредитов = 500.000.000 Zen / 500M)',
                  es: 'Comprar Zen para el Baúl (50 Créditos = 500.000.000 Zen / 500M)',
                  bg: 'Купи Zen за сандъка (50 кредита = 500.000.000 Zen / 500M)',
                })}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {L(lang, {
                  en: 'Rule: Total Warehouse Zen after purchase must not exceed 900,000,000 Zen (900M).',
                  th: 'เงื่อนไขระบบ: เงิน Zen ในคลังเก็บของ (Warehouse Vault) เมื่อรวมกับจำนวนที่ซื้อแล้วต้องไม่เกิน 900,000,000 Zen (900M)',
                  pt: 'Condição: O saldo total de Zen no Baú (Warehouse) após a compra não pode ultrapassar 900.000.000 Zen (900M).',
                  ru: 'Условие: Общий баланс Zen в сундуке (Warehouse) после покупки не должен превышать 900.000.000 Zen (900M).',
                  es: 'Condición: El saldo total de Zen en el baúl (Warehouse) tras la compra no puede superar 900.000.000 Zen (900M).',
                  bg: 'Условие: Общият баланс на Zen в сандъка (Warehouse) след покупката не бива да надвишава 900.000.000 Zen (900M).',
                })}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono-tabular font-semibold shrink-0 self-start">
            50 Credits = 500M Zen
          </span>
        </div>

        <div className="p-4 rounded border border-zinc-800 bg-zinc-950/90 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">
              {L(lang, {
                en: 'Current Warehouse Zen Capacity:',
                th: 'ความจุเงิน Zen ในคลังปัจจุบัน:',
                pt: 'Capacidade Atual de Zen no Baú:',
                ru: 'Текущая вместимость Zen в сундуке:',
                es: 'Capacidad Actual de Zen en el Baúl:',
                bg: 'Текущ капацитет на Zen в сандъка:',
              })}
            </span>
            <span className="font-mono-tabular font-bold text-white">
              {currentVaultZen.toLocaleString()} / {WAREHOUSE_ZEN_MAX_LIMIT.toLocaleString()} Zen (900M)
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full transition-all ${
                isOverLimit ? 'bg-rose-500' : 'bg-emerald-500'
              } ${
                usagePercent === 0
                  ? 'w-0'
                  : usagePercent <= 25
                  ? 'w-1/4'
                  : usagePercent <= 50
                  ? 'w-1/2'
                  : usagePercent <= 75
                  ? 'w-3/4'
                  : 'w-full'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono-tabular">
            <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
              <div className="text-[11px] text-zinc-400 font-sans">
                {L(lang, {
                  en: 'Current Vault Zen',
                  th: 'Zen ในคลังปัจจุบัน',
                  pt: 'Zen Atual no Baú',
                  ru: 'Текущий Zen в сундуке',
                  es: 'Zen Actual en Baúl',
                  bg: 'Текущ Zen в сандъка',
                })}
              </div>
              <div className="font-bold text-zinc-100 mt-0.5">
                {(currentVaultZen / 1_000_000).toFixed(0)}M ({currentVaultZen.toLocaleString()})
              </div>
            </div>
            <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
              <div className="text-[11px] text-zinc-400 font-sans">
                {L(lang, {
                  en: 'Purchase Pack (50 Cr)',
                  th: 'จำนวนที่ซื้อเพิ่ม (50 Cr)',
                  pt: 'Pacote de Compra (50 Cr)',
                  ru: 'Пакет покупки (50 Кр)',
                  es: 'Paquete de Compra (50 Cr)',
                  bg: 'Пакет за покупка (50 Кр)',
                })}
              </div>
              <div className="font-bold text-amber-400 mt-0.5">
                +500M (+{ZEN_PURCHASE_AMOUNT.toLocaleString()})
              </div>
            </div>
            <div
              className={`p-2.5 rounded border ${
                isOverLimit
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              }`}
            >
              <div className="text-[11px] font-sans">
                {L(lang, {
                  en: 'Projected Total (Max 900M)',
                  th: 'ยอดรวมหลังซื้อ (เพดาน 900M)',
                  pt: 'Total Após Compra (Máx 900M)',
                  ru: 'Итого после покупки (Макс 900M)',
                  es: 'Total Tras Compra (Máx 900M)',
                  bg: 'Общо след покупка (Макс 900M)',
                })}
              </div>
              <div className="font-bold mt-0.5">
                {(projectedVaultZen / 1_000_000).toFixed(0)}M ({projectedVaultZen.toLocaleString()})
              </div>
            </div>
          </div>

          {isOverLimit ? (
            <div className="p-3 rounded border border-rose-500/40 bg-rose-500/10 text-xs text-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                {L(lang, {
                  en: `Your vault currently holds ${currentVaultZen.toLocaleString()} Zen. Buying +500M would reach ${projectedVaultZen.toLocaleString()} Zen, exceeding the 900,000,000 Zen (900M) cap. Transfer Zen to a character below first.`,
                  th: `ขณะนี้เงินในคลังของคุณมีอยู่ ${currentVaultZen.toLocaleString()} Zen หากซื้อเพิ่มอีก 500M จะกลายเป็น ${projectedVaultZen.toLocaleString()} Zen ซึ่งเกินเงื่อนไขสูงสุด 900,000,000 Zen (900M) กรุณาถอนเงินจากคลังเข้าตัวละครด้านล่างก่อนสั่งซื้อเพิ่ม`,
                  pt: `Seu baú possui ${currentVaultZen.toLocaleString()} Zen. Comprar +500M resultaria em ${projectedVaultZen.toLocaleString()} Zen, excedendo o limite máximo de 900.000.000 Zen (900M). Transfira Zen para um personagem abaixo antes de comprar.`,
                  ru: `В сундуке сейчас ${currentVaultZen.toLocaleString()} Zen. Покупка +500M составит ${projectedVaultZen.toLocaleString()} Zen, что превышает лимит 900.000.000 Zen (900M). Переведите Zen персонажу ниже перед покупкой.`,
                  es: `Tu baúl tiene ${currentVaultZen.toLocaleString()} Zen. Comprar +500M resultaría en ${projectedVaultZen.toLocaleString()} Zen, excediendo el límite de 900.000.000 Zen (900M). Transfiere Zen a un personaje abajo antes de comprar.`,
                  bg: `В сандъка имате ${currentVaultZen.toLocaleString()} Zen. Закупуването на +500M ще даде ${projectedVaultZen.toLocaleString()} Zen, надвишавайки лимита от 900.000.000 Zen (900M). Прехвърлете Zen към герой отдолу преди покупка.`,
                })}
              </span>
            </div>
          ) : (
            <div className="p-3 rounded border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {L(lang, {
                  en: `Eligible: Projected vault balance (${projectedVaultZen.toLocaleString()} Zen) is within the 900,000,000 Zen (900M) limit.`,
                  th: `ผ่านเงื่อนไข: ยอดรวมหลังซื้อ (${projectedVaultZen.toLocaleString()} Zen) ไม่เกิน 900,000,000 Zen (900M) สามารถกดซื้อได้ทันที`,
                  pt: `Dentro do limite: O saldo após a compra (${projectedVaultZen.toLocaleString()} Zen) não excede 900.000.000 Zen (900M).`,
                  ru: `Лимит соблюдён: Баланс после покупки (${projectedVaultZen.toLocaleString()} Zen) не превышает 900.000.000 Zen (900M).`,
                  es: `Dentro del límite: El saldo tras la compra (${projectedVaultZen.toLocaleString()} Zen) no supera 900.000.000 Zen (900M).`,
                  bg: `В рамките на лимита: Балансът след покупката (${projectedVaultZen.toLocaleString()} Zen) не надвишава 900.000.000 Zen (900M).`,
                })}
              </span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-zinc-300 font-mono-tabular">
            {L(lang, {
              en: 'Rate:',
              th: 'อัตราแลกเปลี่ยน:',
              pt: 'Taxa:',
              ru: 'Курс:',
              es: 'Tasa:',
              bg: 'Курс:',
            })}{' '}
            <strong className="text-amber-400">{ZEN_PURCHASE_CREDITS} Credits</strong> ={' '}
            <strong className="text-emerald-400">500,000,000 Zen (500M)</strong>
          </div>
          <button
            type="submit"
            disabled={isOverLimit}
            className="px-5 py-2.5 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 transition-colors cursor-pointer whitespace-nowrap"
          >
            {L(lang, {
              en: 'Buy 500M Zen (50 Credits)',
              th: 'ซื้อเงิน 500M Zen (50 Credits)',
              pt: 'Comprar 500M Zen (50 Créditos)',
              ru: 'Купить 500M Zen (50 кредитов)',
              es: 'Comprar 500M Zen (50 Créditos)',
              bg: 'Купи 500M Zen (50 кредита)',
            })}
          </button>
        </div>
      </form>

      <form
        onSubmit={handleWithdraw}
        className="p-4 rounded border border-zinc-800 bg-zinc-900/50 space-y-3"
      >
        <div className="text-xs font-semibold text-zinc-200">
          {L(lang, {
            en: 'Transfer Zen from Warehouse to Character (Free up vault space below 900M)',
            th: 'โอนเงิน Zen จากคลัง (Warehouse) เข้าตัวละคร (เพื่อเคลียร์พื้นที่คลังไม่ให้เกิน 900M)',
            pt: 'Transferir Zen do Baú (Warehouse) para um Personagem (Liberar espaço abaixo de 900M)',
            ru: 'Перевод Zen из сундука персонажу (Освободить место до 900M)',
            es: 'Transferir Zen del Baúl (Warehouse) a un Personaje (Liberar espacio bajo 900M)',
            bg: 'Прехвърли Zen от сандъка към герой (Освободи място под 900M)',
          })}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">
              {L(lang, {
                en: 'Recipient Character',
                th: 'เลือกตัวละครผู้รับ',
                pt: 'Personagem Destino',
                ru: 'Персонаж-получатель',
                es: 'Personaje Destino',
                bg: 'Герой получател',
              })}
            </label>
            {characters.length === 0 ? (
              <div className="px-3 py-2 text-xs rounded bg-zinc-950 border border-zinc-800 text-zinc-500">
                {t('no_characters', lang)}
              </div>
            ) : (
              <select
                value={withdrawChar}
                onChange={(e) => setWithdrawChar(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
              >
                {characters.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({(c.money / 1_000_000).toFixed(0)}M)
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">
              {L(lang, {
                en: 'Zen Amount',
                th: 'จำนวน Zen ที่ต้องการถอนจากคลัง',
                pt: 'Quantidade de Zen',
                ru: 'Сумма Zen для вывода',
                es: 'Cantidad de Zen',
                bg: 'Сума на Zen за теглене',
              })}
            </label>
            <select
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-mono-tabular rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            >
              <option value={100_000_000}>100,000,000 Zen (100M)</option>
              <option value={200_000_000}>200,000,000 Zen (200M)</option>
              <option value={300_000_000}>300,000,000 Zen (300M)</option>
              <option value={500_000_000}>500,000,000 Zen (500M)</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={characters.length === 0}
            className="px-4 py-2 text-xs font-semibold rounded border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-40 text-zinc-200 transition-colors cursor-pointer"
          >
            {L(lang, {
              en: 'Transfer Zen (Free)',
              th: 'โอน Zen เข้าตัวละคร (ฟรี)',
              pt: 'Transferir Zen (Grátis)',
              ru: 'Перевести Zen (Бесплатно)',
              es: 'Transferir Zen (Gratis)',
              bg: 'Прехвърли Zen (Безплатно)',
            })}
          </button>
        </div>
      </form>
    </div>
  );
};

// 7. Change Character Class
export const ClassChangeModule: React.FC<{
  characters: Character[];
  config: WebShopConfig;
  lang?: LanguageCode;
  onChangeClass: (charName: string, newClass: MuClassCode) => ActionResponse;
}> = ({ characters, config, lang = 'Thai', onChangeClass }) => {
  const [charName, setCharName] = useState(characters[0]?.name || '');
  const [newClass, setNewClass] = useState<MuClassCode>('bm');
  const [status, setStatus] = useState<ActionResponse | null>(null);

  useEffect(() => {
    if (!characters.some((c) => c.name === charName)) {
      setCharName(characters[0]?.name || '');
    }
  }, [characters, charName]);

  const availableClasses = MU_CLASSES.filter(
    (c) => config.misc.s3classes || !c.s3
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(onChangeClass(charName, newClass));
  };

  return (
    <div className="max-w-xl space-y-5">
      <StatusNotice status={status} />
      <form
        onSubmit={handleSubmit}
        className="p-5 rounded border border-zinc-800 bg-zinc-900/80 space-y-4"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
          <Users className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-zinc-100">
            {L(lang, {
              en: 'Character Class Change',
              th: 'เปลี่ยนสายอาชีพตัวละคร (Character Class Change)',
              pt: 'Trocar Classe do Personagem',
              ru: 'Смена класса персонажа',
              es: 'Cambiar Clase de Personaje',
              bg: 'Смяна на класа на героя',
            })}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              {L(lang, {
                en: 'Select Character',
                th: 'เลือกตัวละคร',
                pt: 'Selecione o Personagem',
                ru: 'Выберите персонажа',
                es: 'Seleccionar Personaje',
                bg: 'Изберете герой',
              })}
            </label>
            {characters.length === 0 ? (
              <div className="px-3 py-2 text-xs rounded bg-zinc-950 border border-zinc-800 text-zinc-500">
                {t('no_characters', lang)}
              </div>
            ) : (
              <select
                value={charName}
                onChange={(e) => setCharName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
              >
                {characters.map((c) => {
                  const cls = MU_CLASSES.find((m) => m.code === c.classCode);
                  return (
                    <option key={c.name} value={c.name}>
                      {c.name} ({cls ? getClassDisplayName(cls, lang) : c.classCode})
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              {L(lang, {
                en: 'New Class',
                th: 'สายอาชีพใหม่',
                pt: 'Nova Classe',
                ru: 'Новый класс',
                es: 'Nueva Clase',
                bg: 'Нов клас',
              })}
            </label>
            <select
              value={newClass}
              onChange={(e) => setNewClass(e.target.value as MuClassCode)}
              className="w-full px-3 py-2 text-xs rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            >
              {availableClasses.map((c) => (
                <option key={c.code} value={c.code}>
                  {getClassDisplayName(c, lang)} ({c.pointsPerLevel}{' '}
                  {L(lang, {
                    en: 'pts/lv',
                    th: 'พอยต์/เลเวล',
                    pt: 'pts/nv',
                    ru: 'очк/ур',
                    es: 'pts/nv',
                    bg: 'т/ниво',
                  })}
                  )
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
          <span className="text-xs text-zinc-300 font-mono-tabular">
            {L(lang, {
              en: 'Fee:',
              th: 'ค่าธรรมเนียม:',
              pt: 'Custo:',
              ru: 'Стоимость:',
              es: 'Costo:',
              bg: 'Такса:',
            })}{' '}
            <strong className="text-amber-400">
              {config.credits.classchg.toLocaleString()} credits
            </strong>
          </span>
          <button
            type="submit"
            disabled={characters.length === 0}
            className="px-4 py-2 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 transition-colors cursor-pointer"
          >
            {L(lang, {
              en: 'Change Class',
              th: 'เปลี่ยนสายอาชีพ',
              pt: 'Trocar Classe',
              ru: 'Сменить класс',
              es: 'Cambiar Clase',
              bg: 'Смени клас',
            })}
          </button>
        </div>
      </form>
    </div>
  );
};

// 8. Change Character Name
export const CharNameModule: React.FC<{
  characters: Character[];
  config: WebShopConfig;
  lang?: LanguageCode;
  onChangeName: (oldName: string, newName: string) => ActionResponse;
}> = ({ characters, config, lang = 'Thai', onChangeName }) => {
  const [oldName, setOldName] = useState(characters[0]?.name || '');
  const [newName, setNewName] = useState('');
  const [status, setStatus] = useState<ActionResponse | null>(null);

  useEffect(() => {
    if (!characters.some((c) => c.name === oldName)) {
      setOldName(characters[0]?.name || '');
    }
  }, [characters, oldName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onChangeName(oldName, newName.trim());
    setStatus(res);
    if (res.ok) {
      setOldName(newName.trim());
      setNewName('');
    }
  };

  return (
    <div className="max-w-xl space-y-5">
      <StatusNotice status={status} />
      <form
        onSubmit={handleSubmit}
        className="p-5 rounded border border-zinc-800 bg-zinc-900/80 space-y-4"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
          <UserCheck className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-zinc-100">
            {L(lang, {
              en: 'Change Character Name',
              th: 'เปลี่ยนชื่อตัวละคร (Change Character Name)',
              pt: 'Trocar Nome do Personagem',
              ru: 'Смена имени персонажа',
              es: 'Cambiar Nombre de Personaje',
              bg: 'Смяна на име на герой',
            })}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              {L(lang, {
                en: 'Current Character',
                th: 'ตัวละครเดิม',
                pt: 'Personagem Atual',
                ru: 'Текущий персонаж',
                es: 'Personaje Actual',
                bg: 'Текущ герой',
              })}
            </label>
            {characters.length === 0 ? (
              <div className="px-3 py-2 text-xs rounded bg-zinc-950 border border-zinc-800 text-zinc-500">
                {t('no_characters', lang)}
              </div>
            ) : (
              <select
                value={oldName}
                onChange={(e) => setOldName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
              >
                {characters.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              {L(lang, {
                en: 'New Name (2–10 characters)',
                th: 'ชื่อใหม่ (ความยาว 2–10 ตัวอักษร)',
                pt: 'Novo Nome (2 a 10 caracteres)',
                ru: 'Новое имя (от 2 до 10 символов)',
                es: 'Nuevo Nombre (2 a 10 caracteres)',
                bg: 'Ново име (от 2 до 10 символа)',
              })}
            </label>
            <input
              type="text"
              maxLength={10}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={L(lang, {
                en: 'New character name',
                th: 'ระบุชื่อตัวละครใหม่',
                pt: 'Novo nome do personagem',
                ru: 'Новое имя персонажа',
                es: 'Nuevo nombre del personaje',
                bg: 'Ново име на героя',
              })}
              className="w-full px-3 py-2 text-xs rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
          <span className="text-xs text-zinc-300 font-mono-tabular">
            {L(lang, {
              en: 'Fee:',
              th: 'ค่าธรรมเนียม:',
              pt: 'Custo:',
              ru: 'Стоимость:',
              es: 'Costo:',
              bg: 'Такса:',
            })}{' '}
            <strong className="text-amber-400">
              {config.credits.namechg.toLocaleString()} credits
            </strong>
          </span>
          <button
            type="submit"
            disabled={characters.length === 0}
            className="px-4 py-2 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 transition-colors cursor-pointer"
          >
            {L(lang, {
              en: 'Change Name',
              th: 'เปลี่ยนชื่อตัวละคร',
              pt: 'Trocar Nome',
              ru: 'Сменить имя',
              es: 'Cambiar Nombre',
              bg: 'Смени име',
            })}
          </button>
        </div>
      </form>
    </div>
  );
};

// 9. Unban Character (100 Credits)
export const UnbanModule: React.FC<{
  allCharacters: Character[];
  config: WebShopConfig;
  lang?: LanguageCode;
  onUnbanCharacter: (charName: string) => ActionResponse;
}> = ({ allCharacters, config, lang = 'Thai', onUnbanCharacter }) => {
  const bannedChars = allCharacters.filter(
    (c) => c.ctlCode === config.misc.bannedcode
  );
  const [charName, setCharName] = useState(bannedChars[0]?.name || '');
  const [status, setStatus] = useState<ActionResponse | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(onUnbanCharacter(charName.trim()));
  };

  return (
    <div className="max-w-xl space-y-5">
      <StatusNotice status={status} />
      <form
        onSubmit={handleSubmit}
        className="p-5 rounded border border-zinc-800 bg-zinc-900/80 space-y-4"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-zinc-100">
            {L(lang, {
              en: 'Unban Character',
              th: 'ปลดแบนตัวละคร (Unban Character)',
              pt: 'Desbanir Personagem',
              ru: 'Разблокировка персонажа',
              es: 'Desbanear Personaje',
              bg: 'Отблокиране на герой',
            })}
          </h3>
        </div>

        <div className="text-xs text-zinc-300">
          {L(lang, {
            en: `Unban a suspended character (ctlCode = ${config.misc.bannedcode}) for `,
            th: `ปลดแบนตัวละครที่ถูกระงับ (ctlCode = ${config.misc.bannedcode}) ด้วยค่าธรรมเนียม `,
            pt: `Desbanir personagem suspenso (ctlCode = ${config.misc.bannedcode}) pelo custo de `,
            ru: `Разблокировать заблокированного персонажа (ctlCode = ${config.misc.bannedcode}) за `,
            es: `Desbanear personaje suspendido (ctlCode = ${config.misc.bannedcode}) por un costo de `,
            bg: `Отблокирай спрян герой (ctlCode = ${config.misc.bannedcode}) срещу такса от `,
          })}
          <strong className="font-mono-tabular text-amber-400">
            {config.credits.unbanchar.toLocaleString()} credits
          </strong>
          .
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">
            {L(lang, {
              en: 'Character Name',
              th: 'ชื่อตัวละคร',
              pt: 'Nome do Personagem',
              ru: 'Имя персонажа',
              es: 'Nombre del Personaje',
              bg: 'Име на героя',
            })}
          </label>
          <input
            type="text"
            maxLength={10}
            value={charName}
            onChange={(e) => setCharName(e.target.value)}
            placeholder={L(lang, {
              en: 'Enter banned character name',
              th: 'ระบุชื่อตัวละครที่ต้องการปลดแบน',
              pt: 'Digite o nome do personagem banido',
              ru: 'Введите имя заблокированного персонажа',
              es: 'Ingresa el nombre del personaje baneado',
              bg: 'Въведете името на блокирания герой',
            })}
            className="w-full px-3 py-2 text-xs rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
          />
          {bannedChars.length > 0 && (
            <div className="mt-2 text-[11px] text-zinc-400">
              {L(lang, {
                en: 'Currently banned characters: ',
                th: 'ตัวละครที่ติดสถานะแบนในขณะนี้: ',
                pt: 'Personagens banidos no momento: ',
                ru: 'Заблокированные персонажи: ',
                es: 'Personajes baneados actualmente: ',
                bg: 'Текущо блокирани герои: ',
              })}
              {bannedChars.map((b) => (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => setCharName(b.name)}
                  className="text-amber-400 hover:underline mr-2 cursor-pointer"
                >
                  {b.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-zinc-800/80 flex justify-end">
          <button
            type="submit"
            disabled={!charName.trim()}
            className="px-4 py-2 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 transition-colors cursor-pointer"
          >
            {L(lang, {
              en: `Unban Character (${config.credits.unbanchar.toLocaleString()} cr)`,
              th: `ปลดแบนตัวละคร (${config.credits.unbanchar.toLocaleString()} cr)`,
              pt: `Desbanir Personagem (${config.credits.unbanchar.toLocaleString()} cr)`,
              ru: `Разблокировать (${config.credits.unbanchar.toLocaleString()} кр)`,
              es: `Desbanear Personaje (${config.credits.unbanchar.toLocaleString()} cr)`,
              bg: `Отблокирай герой (${config.credits.unbanchar.toLocaleString()} кр)`,
            })}
          </button>
        </div>
      </form>
    </div>
  );
};
