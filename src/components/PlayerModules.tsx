import React, { useState } from 'react';
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
} from '../utils/muItemLogic';
import { t } from '../translations';
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

// 1. ขอ Reset Point (รีเซ็ตสเตตัสและคำนวณพอยต์ใหม่ตามสายอาชีพ + พอยต์เริ่มต้น 300)
export const ResetPointsModule: React.FC<{
  characters: Character[];
  config: WebShopConfig;
  lang?: LanguageCode;
  onResetCharacterPoints: (charName: string) => ActionResponse;
}> = ({ characters, config, lang = 'Thai', onResetCharacterPoints }) => {
  const isPt = lang === 'Portuguese_BR';
  const isRu = lang === 'Russian';
  const isEs = lang === 'Spanish';
  const isBg = lang === 'Bulgarian';
  const [charName, setCharName] = useState(characters[0]?.name || '');
  const [status, setStatus] = useState<ActionResponse | null>(null);

  const selectedChar =
    characters.find((c) => c.name.toLowerCase() === charName.toLowerCase()) ||
    characters[0];

  const calc = selectedChar
    ? calculateClassStatPoints(selectedChar.classCode, selectedChar.level)
    : calculateClassStatPoints('bm', 400);

  const cost = config.credits.reset;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChar) {
      setStatus({
        ok: false,
        message: isPt
          ? 'Por favor, selecione o personagem para resetar os pontos.'
          : isRu
          ? 'Пожалуйста, выберите персонажа для сброса статов.'
          : isEs
          ? 'Por favor, selecciona un personaje para resetear puntos.'
          : isBg
          ? 'Моля, изберете герой за нулиране на точките.'
          : 'กรุณาเลือกตัวละครที่ต้องการรีเซ็ตพอยต์',
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
                {isPt
                  ? 'Resetar Pontos (Redefinir atributos base da classe + 300 pontos iniciais)'
                  : isRu
                  ? 'Сброс статов (Базовые характеристики класса + 300 начальных очков)'
                  : isEs
                  ? 'Resetear Puntos (Restablecer atributos base + 300 puntos iniciales)'
                  : isBg
                  ? 'Ресет на Точки (Възстановяване на базови точки + 300 начални)'
                  : 'ขอ Reset Point (รีเซ็ตสเตตัสและคำนวณพอยต์ตามสายอาชีพ + พอยต์เริ่มต้น 300)'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {isPt
                  ? 'Retorna STR / AGI / VIT / ENE / CMD aos valores iniciais da classe e calcula os pontos de nível mais +300 pontos iniciais (sem incluir quests +20 e Marlon Nv.220 +180).'
                  : isRu
                  ? 'Сбрасывает STR / AGI / VIT / ENE / CMD до базовых значений класса и начисляет очки за уровень + 300 начальных очков (без учета квестов +20 и Марлона +180).'
                  : isEs
                  ? 'Restablece STR / AGI / VIT / ENE / CMD a valores base y calcula puntos de nivel más +300 puntos iniciales.'
                  : isBg
                  ? 'Възстановява базовите статове и изчислява точките за ниво плюс 300 начални точки.'
                  : 'คืนค่าสเตตัส STR / AGI / VIT / ENE / CMD กลับสู่ค่าเริ่มต้นของอาชีพ และคำนวณเฉพาะพอยต์เลเวลปกติรวมกับพอยต์เริ่มต้น 300 (ไม่รวมเควสเปลี่ยนอาชีพ +20 และเควส Marlon 220 อีก +180)'}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono-tabular font-semibold shrink-0 self-start">
            {isPt
              ? `Custo: ${cost.toLocaleString()} Créditos`
              : isRu
              ? `Цена: ${cost.toLocaleString()} кредитов`
              : isEs
              ? `Costo: ${cost.toLocaleString()} créditos`
              : isBg
              ? `Цена: ${cost.toLocaleString()} кредита`
              : `ค่าบริการ ${cost.toLocaleString()} Credits`}
          </span>
        </div>

        {/* Character Selector */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            {isPt
              ? 'Selecione o personagem para Resetar Pontos'
              : isRu
              ? 'Выберите персонажа для сброса статов'
              : isEs
              ? 'Selecciona el personaje para resetear puntos'
              : isBg
              ? 'Изберете герой за нулиране на точки'
              : 'เลือกตัวละครที่ต้องการขอ Reset Point'}
          </label>
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
                  {c.name} — {cCalc.classDef.name} (Lv.{c.level}) ·{' '}
                  {isPt
                    ? `Receberá ${cCalc.totalPoints.toLocaleString()} pontos`
                    : isRu
                    ? `Получит ${cCalc.totalPoints.toLocaleString()} очков`
                    : isEs
                    ? `Recibirá ${cCalc.totalPoints.toLocaleString()} puntos`
                    : isBg
                    ? `Ще получи ${cCalc.totalPoints.toLocaleString()} точки`
                    : `รีพอยต์แล้วจะได้ ${cCalc.totalPoints.toLocaleString()} พอยต์`}
                </option>
              );
            })}
          </select>
        </div>

        {selectedChar && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Calculation Breakdown Card */}
            <div className="p-4 rounded border border-amber-500/30 bg-zinc-950/90 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 border-b border-zinc-800 pb-2">
                <Calculator className="w-3.5 h-3.5" />
                <span>
                  {isPt
                    ? `Cálculo de Pontos por Classe (${calc.classDef.name})`
                    : isRu
                    ? `Расчет очков по классу (${calc.classDef.name})`
                    : isEs
                    ? `Cálculo de Puntos por Clase (${calc.classDef.name})`
                    : isBg
                    ? `Изчисляване на точки по клас (${calc.classDef.name})`
                    : `การคำนวณพอยต์ตามสายอาชีพ (${calc.classDef.name})`}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">
                    {isPt ? 'Classe:' : isRu ? 'Класс:' : isEs ? 'Clase:' : isBg ? 'Клас:' : 'สายอาชีพ (Class):'}
                  </span>
                  <span className="text-zinc-100 font-semibold">
                    {calc.classDef.name} ({calc.pointsPerLevel}{' '}
                    {isPt ? 'pts/nível' : isRu ? 'очк/ур' : isEs ? 'pts/nivel' : isBg ? 'т/ниво' : 'พอยต์/เลเวล'})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">
                    {isPt ? 'Nível do Personagem:' : isRu ? 'Уровень персонажа:' : isEs ? 'Nivel del Personaje:' : isBg ? 'Ниво на героя:' : 'เลเวลของตัวละคร:'}
                  </span>
                  <span className="font-mono-tabular text-zinc-100 font-semibold">
                    Level {calc.level} ({calc.levelUps} Level-Ups)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">
                    {isPt
                      ? `Pontos de Nível (${calc.levelUps} × ${calc.pointsPerLevel} pts):`
                      : isRu
                      ? `Очки за уровень (${calc.levelUps} × ${calc.pointsPerLevel}):`
                      : isEs
                      ? `Puntos de Nivel (${calc.levelUps} × ${calc.pointsPerLevel} pts):`
                      : isBg
                      ? `Точки за ниво (${calc.levelUps} × ${calc.pointsPerLevel} т):`
                      : `พอยต์จากเลเวลปกติ (${calc.levelUps} × ${calc.pointsPerLevel} พอยต์):`}
                  </span>
                  <span className="font-mono-tabular text-zinc-200 font-semibold">
                    +{calc.levelPoints.toLocaleString()} {isPt ? 'pts' : isRu ? 'очков' : isEs ? 'pts' : isBg ? 'точки' : 'พอยต์'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">
                    {isPt
                      ? 'Bônus Inicial (Starting Bonus):'
                      : isRu
                      ? 'Начальный бонус (Starting Bonus):'
                      : isEs
                      ? 'Bono Inicial (Starting Bonus):'
                      : isBg
                      ? 'Начален Бонус (Starting Bonus):'
                      : 'พอยต์ชุดแรกที่จุดเริ่มต้น (Starting Bonus):'}
                  </span>
                  <span className="font-mono-tabular text-emerald-400 font-semibold">
                    +{calc.startingPoints.toLocaleString()} {isPt ? 'pts' : isRu ? 'очков' : isEs ? 'pts' : isBg ? 'точки' : 'พอยต์'}
                  </span>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-sm">
                  <span className="font-bold text-white">
                    {isPt ? 'Total de Pontos Recebidos:' : isRu ? 'Итого очков:' : isEs ? 'Total de Puntos:' : isBg ? 'Общо получени точки:' : 'รวมพอยต์ที่ได้รับทันที:'}
                  </span>
                  <span className="font-mono-tabular font-bold text-amber-400 text-base">
                    {calc.totalPoints.toLocaleString()} {isPt ? 'pontos' : isRu ? 'очков' : isEs ? 'puntos' : isBg ? 'точки' : 'พอยต์'}
                  </span>
                </div>

                {calc.classDef.hasMarlonAndClass2Quest && (
                  <div className="pt-1.5 text-[11px] text-zinc-400 border-t border-zinc-800/70">
                    {isPt
                      ? `* Não inclui quest de evolução (+${calc.excludedClass2QuestPoints} pts) e quest Marlon Nv.220 (+${calc.excludedMarlon220Points} pts).`
                      : isRu
                      ? `* Без учета квеста смены профессии (+${calc.excludedClass2QuestPoints} очков) и квеста Марлона 220 ур. (+${calc.excludedMarlon220Points} очков).`
                      : isEs
                      ? `* No incluye quest de cambio de clase (+${calc.excludedClass2QuestPoints} pts) ni quest de Marlon Lv.220 (+${calc.excludedMarlon220Points} pts).`
                      : isBg
                      ? `* Не включва куеста за клас (+${calc.excludedClass2QuestPoints} т) и Марлон 220 ниво (+${calc.excludedMarlon220Points} т).`
                      : `* ยังไม่นับรวมเควสเปลี่ยนอาชีพ (+${calc.excludedClass2QuestPoints} พอยต์) และเควส Marlon Lv.220 (+${calc.excludedMarlon220Points} พอยต์)`}
                  </div>
                )}
              </div>
            </div>

            {/* Stat Reset Before -> After Comparison */}
            <div className="p-4 rounded border border-zinc-800 bg-zinc-950/90 space-y-3">
              <div className="text-xs font-bold text-zinc-200 border-b border-zinc-800 pb-2">
                {isPt
                  ? 'Redefinição de Atributos (Atuais → Base)'
                  : isRu
                  ? 'Сброс характеристик (Текущие → Базовые)'
                  : isEs
                  ? 'Reinicio de Atributos (Actuales → Base)'
                  : isBg
                  ? 'Възстановяване на Статове (Текущи → Базови)'
                  : 'การคืนค่าสเตตัสพื้นฐาน (Current Stats → Base Stats)'}
              </div>

              <div className="space-y-1.5 text-xs font-mono-tabular">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-sans">Strength (STR):</span>
                  <span>
                    <span className="text-zinc-400">
                      {selectedChar.strength.toLocaleString()}
                    </span>{' '}
                    <ArrowRight className="inline w-3 h-3 text-amber-400 mx-1" />
                    <strong className="text-emerald-400">
                      {calc.classDef.baseStr}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-sans">Agility (AGI):</span>
                  <span>
                    <span className="text-zinc-400">
                      {selectedChar.agility.toLocaleString()}
                    </span>{' '}
                    <ArrowRight className="inline w-3 h-3 text-amber-400 mx-1" />
                    <strong className="text-emerald-400">
                      {calc.classDef.baseAgi}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-sans">Vitality (VIT):</span>
                  <span>
                    <span className="text-zinc-400">
                      {selectedChar.vitality.toLocaleString()}
                    </span>{' '}
                    <ArrowRight className="inline w-3 h-3 text-amber-400 mx-1" />
                    <strong className="text-emerald-400">
                      {calc.classDef.baseVit}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-sans">Energy (ENE):</span>
                  <span>
                    <span className="text-zinc-400">
                      {selectedChar.energy.toLocaleString()}
                    </span>{' '}
                    <ArrowRight className="inline w-3 h-3 text-amber-400 mx-1" />
                    <strong className="text-emerald-400">
                      {calc.classDef.baseEne}
                    </strong>
                  </span>
                </div>
                {calc.classDef.baseCmd > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-sans">Command (CMD):</span>
                    <span>
                      <span className="text-zinc-400">
                        {selectedChar.command.toLocaleString()}
                      </span>{' '}
                      <ArrowRight className="inline w-3 h-3 text-amber-400 mx-1" />
                      <strong className="text-emerald-400">
                        {calc.classDef.baseCmd}
                      </strong>
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-300 font-sans font-semibold">
                    {isPt
                      ? 'Pontos Disponíveis (LevelUpPoints):'
                      : isRu
                      ? 'Свободные очки (LevelUpPoints):'
                      : isEs
                      ? 'Puntos Disponibles (LevelUpPoints):'
                      : isBg
                      ? 'Свободни точки (LevelUpPoints):'
                      : 'พอยต์คงเหลือพร้อมอัป (LevelUpPoints):'}
                  </span>
                  <span>
                    <span className="text-zinc-400">
                      {selectedChar.levelUpPoints.toLocaleString()}
                    </span>{' '}
                    <ArrowRight className="inline w-3 h-3 text-amber-400 mx-1" />
                    <strong className="text-amber-400">
                      {calc.totalPoints.toLocaleString()}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-zinc-300">
            {isPt ? 'Resetar pontos de ' : isRu ? 'Сброс статов персонажа ' : isEs ? 'Resetear puntos de ' : isBg ? 'Ресет на точки за ' : 'รีเซ็ตพอยต์สเตตัสของ '}
            <strong className="text-white">{selectedChar?.name}</strong>{' '}
            {isPt ? 'recebendo ' : isRu ? 'с получением ' : isEs ? 'recibiendo ' : isBg ? 'получавайки ' : 'รับพอยต์รวม '}
            <strong className="text-emerald-400 font-mono-tabular">
              {calc.totalPoints.toLocaleString()} {isPt ? 'pontos' : isRu ? 'очков' : isEs ? 'puntos' : isBg ? 'точки' : 'พอยต์'}
            </strong>{' '}
            ({cost.toLocaleString()} Credits)
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors cursor-pointer whitespace-nowrap"
          >
            {isPt
              ? `Confirmar Reset de Pontos (${cost.toLocaleString()} Créditos)`
              : isRu
              ? `Подтвердить сброс статов (${cost.toLocaleString()} кредитов)`
              : isEs
              ? `Confirmar Reset de Puntos (${cost.toLocaleString()} Créditos)`
              : isBg
              ? `Потвърди ресет на точки (${cost.toLocaleString()} кредита)`
              : `ยืนยันการขอ Reset Point (${cost.toLocaleString()} Credits)`}
          </button>
        </div>
      </form>
    </div>
  );
};

// 2. ซื้อตัวละคร เลเวล 400 (เฉพาะ Class 3 เท่านั้น ราคา 500 Credits คำนวณเฉพาะพอยต์เลเวล + 300 ครั้งแรก ไม่รวมเควสเปลี่ยนอาชีพ +20 และเควส 220 อีก +180)
export const BuyCharacter400Module: React.FC<{
  characters: Character[];
  config: WebShopConfig;
  lang?: LanguageCode;
  onBuyCharacter400: (charName: string, classCode: MuClassCode) => ActionResponse;
}> = ({ characters, lang = 'Thai', onBuyCharacter400 }) => {
  const isPt = lang === 'Portuguese_BR';
  const isRu = lang === 'Russian';
  const isEs = lang === 'Spanish';
  const isBg = lang === 'Bulgarian';
  const [newCharName, setNewCharName] = useState('');
  const [selectedClass, setSelectedClass] = useState<MuClassCode>('bm');
  const [status, setStatus] = useState<ActionResponse | null>(null);

  const calc = calculateClassStatPoints(selectedClass, 400);
  const cost = BUY_CHAR_400_CREDITS; // 500 Credits

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onBuyCharacter400(newCharName.trim(), selectedClass);
    setStatus(res);
    if (res.ok) {
      setNewCharName('');
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
                {isPt
                  ? 'Comprar Personagem Nível 400 — Somente 3ª Classe (500 Créditos)'
                  : isRu
                  ? 'Покупка персонажа 400 уровня — Только 3-й класс (500 кредитов)'
                  : isEs
                  ? 'Comprar Personaje Nivel 400 — Solo 3ra Clase (500 Créditos)'
                  : isBg
                  ? 'Купи Герой 400 Ниво — Само 3-ти клас (500 кредита)'
                  : 'ซื้อตัวละคร เลเวล 400 — เฉพาะสายอาชีพ Class 3 เท่านั้น (ราคา 500 Credits)'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {isPt
                  ? 'Calcula os pontos ganhos do nível 1 ao 400 + 300 pontos iniciais (não inclui os +20 pontos da quest de classe nem os +180 pontos da quest Marlon Nv.220).'
                  : isRu
                  ? 'Начисляются очки за уровни 1-400 + 300 начальных очков (без учета квестов +20 и Марлона +180).'
                  : isEs
                  ? 'Calcula puntos de nivel 1 a 400 + 300 puntos iniciales (no incluye quest de clase +20 ni Marlon +180).'
                  : isBg
                  ? 'Точки за нива 1-400 + 300 начални точки (без куестове +20 и Марлон +180).'
                  : 'คำนวณเฉพาะพอยต์ที่ได้จากการอัปเลเวลปกติ (Lv.1 → 400) รวมกับพอยต์ชุดแรก 300 พอยต์ (ยังไม่นับรวมเควสเปลี่ยนอาชีพ 20 พอยต์ และเควสเลเวล 220 อีก 180 พอยต์)'}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono-tabular font-semibold shrink-0 self-start">
            {isPt
              ? `Preço: ${cost.toLocaleString()} Créditos`
              : isRu
              ? `Цена: ${cost.toLocaleString()} кредитов`
              : isEs
              ? `Precio: ${cost.toLocaleString()} créditos`
              : isBg
              ? `Цена: ${cost.toLocaleString()} кредита`
              : `ราคา ${cost.toLocaleString()} Credits`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              {isPt
                ? 'Nome do Novo Personagem (2 a 10 caracteres)'
                : isRu
                ? 'Имя нового персонажа (2-10 символов)'
                : isEs
                ? 'Nombre del Nuevo Personaje (2 a 10 caracteres)'
                : isBg
                ? 'Име на нов герой (2-10 символа)'
                : 'ตั้งชื่อตัวละครใหม่ (ความยาว 2–10 ตัวอักษร)'}
            </label>
            <input
              type="text"
              maxLength={10}
              value={newCharName}
              onChange={(e) => {
                setNewCharName(e.target.value);
                setStatus(null);
              }}
              placeholder={
                isPt
                  ? 'Ex: AresBM, Valkyrie, Zephyr'
                  : isRu
                  ? 'Напр.: AresBM, Valkyrie'
                  : isEs
                  ? 'Ej: AresBM, Valkyrie'
                  : isBg
                  ? 'Напр.: AresBM, Valkyrie'
                  : 'เช่น AresBM, Valkyrie, Zephyr'
              }
              className="w-full px-3 py-2.5 text-xs rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              {isPt
                ? 'Escolha a Classe (Apenas 3ª Classe)'
                : isRu
                ? 'Выберите класс (Только 3-й класс)'
                : isEs
                ? 'Elige la Clase (Solo 3ra Clase)'
                : isBg
                ? 'Изберете Клас (Само 3-ти клас)'
                : 'เลือกสายอาชีพ (เฉพาะ Class 3 เท่านั้น)'}
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
                    {c.name} (Class 3 · {c.pointsPerLevel}{' '}
                    {isPt ? 'pts/nv' : isRu ? 'очк/ур' : isEs ? 'pts/nv' : isBg ? 'т/ниво' : 'พอยต์/เลเวล'}) —{' '}
                    {isPt
                      ? `Recebe ${c400.totalPoints.toLocaleString()} pts`
                      : isRu
                      ? `Получит ${c400.totalPoints.toLocaleString()} очков`
                      : isEs
                      ? `Recibe ${c400.totalPoints.toLocaleString()} pts`
                      : isBg
                      ? `Получава ${c400.totalPoints.toLocaleString()} т`
                      : `ได้รับ ${c400.totalPoints.toLocaleString()} พอยต์`}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Live Calculation Card for Selected Class 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded border border-amber-500/30 bg-zinc-950/90 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 border-b border-zinc-800 pb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isPt
                  ? `Resumo de Pontos (${calc.classDef.name} — 3ª Classe)`
                  : isRu
                  ? `Сводка по очкам (${calc.classDef.name} — 3-й класс)`
                  : isEs
                  ? `Resumen de Puntos (${calc.classDef.name} — 3ra Clase)`
                  : isBg
                  ? `Справка за точки (${calc.classDef.name} — 3-ти клас)`
                  : `สรุปการคำนวณพอยต์ (${calc.classDef.name} — Class 3)`}
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">
                  {isPt ? 'Nível Recebido:' : isRu ? 'Уровень персонажа:' : isEs ? 'Nivel Obtenido:' : isBg ? 'Получено ниво:' : 'ระดับเลเวลที่ได้รับ:'}
                </span>
                <span className="font-mono-tabular font-bold text-white">
                  Level 400 (399 Level-Ups)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">
                  {isPt
                    ? 'Pontos Base por Nível:'
                    : isRu
                    ? 'Базовые очки за уровень:'
                    : isEs
                    ? 'Puntos Base por Nivel:'
                    : isBg
                    ? 'Базови точки за ниво:'
                    : 'พอยต์พื้นฐานต่อเลเวลของสายอาชีพ:'}
                </span>
                <span className="font-mono-tabular text-amber-300 font-semibold">
                  {calc.pointsPerLevel} {isPt ? 'pts / nível' : isRu ? 'очк / ур' : isEs ? 'pts / nivel' : isBg ? 'т / ниво' : 'พอยต์ / เลเวล'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">
                  {isPt
                    ? `Pontos Nv.1 → 400 (399 × ${calc.pointsPerLevel}):`
                    : isRu
                    ? `Очки за 1 → 400 (399 × ${calc.pointsPerLevel}):`
                    : isEs
                    ? `Puntos Nv.1 → 400 (399 × ${calc.pointsPerLevel}):`
                    : isBg
                    ? `Точки 1 → 400 (399 × ${calc.pointsPerLevel}):`
                    : `พอยต์จากเลเวล 1 → 400 (399 × ${calc.pointsPerLevel}):`}
                </span>
                <span className="font-mono-tabular text-zinc-200 font-semibold">
                  +{calc.levelPoints.toLocaleString()} {isPt ? 'pts' : isRu ? 'очков' : isEs ? 'pts' : isBg ? 'точки' : 'พอยต์'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">
                  {isPt
                    ? 'Bônus Inicial (Starting Bonus):'
                    : isRu
                    ? 'Начальный бонус (Starting Bonus):'
                    : isEs
                    ? 'Bono Inicial (Starting Bonus):'
                    : isBg
                    ? 'Начален Бонус (Starting Bonus):'
                    : 'บวกพอยต์ชุดแรกเริ่มต้น (Starting Bonus):'}
                </span>
                <span className="font-mono-tabular text-emerald-400 font-semibold">
                  +{calc.startingPoints.toLocaleString()} {isPt ? 'pts' : isRu ? 'очков' : isEs ? 'pts' : isBg ? 'точки' : 'พอยต์'}
                </span>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-sm">
                <span className="font-bold text-white">
                  {isPt ? 'Total de Pontos Imediatos:' : isRu ? 'Итого сразу:' : isEs ? 'Total Inmediato:' : isBg ? 'Общо веднага:' : 'รวมพอยต์ที่ได้รับทันที:'}
                </span>
                <span className="font-mono-tabular font-bold text-amber-400 text-base">
                  {calc.totalPoints.toLocaleString()} {isPt ? 'pontos' : isRu ? 'очков' : isEs ? 'puntos' : isBg ? 'точки' : 'พอยต์'}
                </span>
              </div>

              {calc.classDef.hasMarlonAndClass2Quest ? (
                <div className="pt-2 border-t border-zinc-800/70 text-[11px] text-zinc-400 space-y-0.5">
                  <div>
                    •{' '}
                    {isPt
                      ? 'Não inclui quest de evolução Nv.150: +20 pontos'
                      : isRu
                      ? 'Без квеста смены профессии 150 ур.: +20 очков'
                      : isEs
                      ? 'No incluye quest de clase Lv.150: +20 puntos'
                      : isBg
                      ? 'Без куеста за клас 150 ниво: +20 точки'
                      : 'ยังไม่รวมพอยต์เควสเปลี่ยนอาชีพ Lv.150: +20 พอยต์'}
                  </div>
                  <div>
                    •{' '}
                    {isPt
                      ? 'Não inclui quest Marlon Nv.220 (Nv.221–400): +180 pontos'
                      : isRu
                      ? 'Без квеста Марлона 220 ур. (221–400): +180 очков'
                      : isEs
                      ? 'No incluye quest Marlon Lv.220 (221–400): +180 puntos'
                      : isBg
                      ? 'Без куеста Марлон 220 ниво (221–400): +180 точки'
                      : 'ยังไม่รวมพอยต์เควส Marlon Lv.220 (Lv.221–400): +180 พอยต์'}
                  </div>
                  <div className="text-amber-300/90">
                    {isPt
                      ? `(Completando as quests 150 & 220 no jogo, ganha +200 totalizando ${calc.totalIfQuestsCompleted.toLocaleString()} pontos)`
                      : isRu
                      ? `(Пройдя квесты 150 и 220 в игре, получите еще +200 очков, всего ${calc.totalIfQuestsCompleted.toLocaleString()})`
                      : isEs
                      ? `(Completando quests 150 y 220 en el juego, ganas +200 totalizando ${calc.totalIfQuestsCompleted.toLocaleString()} puntos)`
                      : isBg
                      ? `(След изпълнение на куестове 150 и 220 в играта се добавят още +200, общо ${calc.totalIfQuestsCompleted.toLocaleString()} точки)`
                      : `(หากไปทำเควส 150 & 220 เพิ่มในเกม จะได้เพิ่มอีก +200 รวมเป็น ${calc.totalIfQuestsCompleted.toLocaleString()} พอยต์)`}
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-zinc-800/70 text-[11px] text-zinc-400">
                  {isPt
                    ? `* Classes especiais (${calc.classDef.name}) já recebem 7 pts/nível desde o nível 1 e não possuem quests de +20 / +180.`
                    : isRu
                    ? `* Специальные классы (${calc.classDef.name}) получают по 7 очков за уровень с 1 ур. и не имеют квестов +20 / +180.`
                    : isEs
                    ? `* Clases especiales (${calc.classDef.name}) reciben 7 pts/nivel desde nivel 1 y no tienen quests de +20 / +180.`
                    : isBg
                    ? `* Специалните класове (${calc.classDef.name}) получават по 7 точки/ниво от началото и нямат куестове +20 / +180.`
                    : `* สายอาชีพพิเศษ (${calc.classDef.name}) ได้รับ 7 พอยต์/เลเวล ตั้งต้นตั้งแต่เลเวล 1 จึงไม่มีเควส Lv.150 (+20) และเควส Marlon Lv.220 (+180)`}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded border border-zinc-800 bg-zinc-950/90 space-y-2.5">
            <div className="text-xs font-bold text-zinc-200 border-b border-zinc-800 pb-2">
              {isPt
                ? `Atributos Base da Classe (${calc.classDef.name})`
                : isRu
                ? `Базовые параметры (${calc.classDef.name})`
                : isEs
                ? `Atributos Base (${calc.classDef.name})`
                : isBg
                ? `Базови характеристики (${calc.classDef.name})`
                : `สเตตัสเริ่มต้นของสายอาชีพ (${calc.classDef.name})`}
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
              {isPt ? 'Personagens na sua conta:' : isRu ? 'Персонажей на аккаунте:' : isEs ? 'Personajes en tu cuenta:' : isBg ? 'Герои в акаунта ви:' : 'ตัวละครปัจจุบันในไอดีของคุณ:'}{' '}
              <strong className="text-white">{characters.length}</strong>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-zinc-300">
            {isPt ? 'Criar personagem 3ª Classe ' : isRu ? 'Создать персонажа 3-го класса ' : isEs ? 'Crear personaje 3ra Clase ' : isBg ? 'Създай герой 3-ти клас ' : 'ซื้อตัวละคร Class 3 '}
            <strong className="text-white">
              {newCharName.trim() || (isPt ? '(nome)' : isRu ? '(имя)' : isEs ? '(nombre)' : isBg ? '(име)' : '(ระบุชื่อ)')}
            </strong>{' '}
            <strong className="text-amber-300">{calc.classDef.name}</strong> Lv.400 (+
            <strong className="text-emerald-400 font-mono-tabular">
              {calc.totalPoints.toLocaleString()} {isPt ? 'pts' : isRu ? 'очков' : isEs ? 'pts' : isBg ? 'точки' : 'พอยต์'}
            </strong>
            )
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors cursor-pointer whitespace-nowrap"
          >
            {isPt
              ? `Comprar Personagem Nv.400 (${cost.toLocaleString()} Créditos)`
              : isRu
              ? `Купить персонажа 400 ур. (${cost.toLocaleString()} кредитов)`
              : isEs
              ? `Comprar Personaje Lv.400 (${cost.toLocaleString()} Créditos)`
              : isBg
              ? `Купи Герой 400 Ниво (${cost.toLocaleString()} кредита)`
              : `ซื้อตัวละคร Class 3 Lv.400 (${cost.toLocaleString()} Credits)`}
          </button>
        </div>
      </form>

      {/* Class 3 Comparison Table verifying the exact calculation */}
      <div className="p-4 rounded border border-zinc-800 bg-zinc-900/60 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
          <Info className="w-4 h-4 text-amber-400" />
          <span>
            {isPt
              ? 'Tabela de Cálculo de Pontos das 5 Classes (Nível 400 + 300 Pontos Iniciais)'
              : isRu
              ? 'Таблица расчёта очков для 5 классов (400 ур. + 300 начальных очков)'
              : isEs
              ? 'Tabla de Cálculo de Puntos de 5 Clases (Nivel 400 + 300 Puntos Iniciales)'
              : isBg
              ? 'Таблица за изчисление на точки за 5-те класа (400 ниво + 300 начални точки)'
              : 'ตารางตรวจสอบสูตรคำนวณพอยต์ Class 3 ทั้ง 5 อาชีพ (Level 400 + พอยต์เริ่มต้น 300)'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="py-2 pr-3">
                  {isPt ? '3ª Classe' : isRu ? '3-й класс' : isEs ? '3ra Clase' : isBg ? '3-ти клас' : 'อาชีพ Class 3'}
                </th>
                <th className="py-2 px-3 text-center">
                  {isPt ? 'Pts/Nível' : isRu ? 'Очков/ур.' : isEs ? 'Pts/Nivel' : isBg ? 'Точки/ниво' : 'พอยต์/เลเวล'}
                </th>
                <th className="py-2 px-3 text-right">
                  {isPt ? 'Pontos Nv.1→400 (399x)' : isRu ? 'Очки 1→400 ур. (399x)' : isEs ? 'Puntos Nivel 1→400 (399x)' : isBg ? 'Точки 1→400 ниво (399x)' : 'พอยต์ Lv.1→400 (399 เลเวล)'}
                </th>
                <th className="py-2 px-3 text-right">
                  {isPt ? 'Bônus Inicial' : isRu ? 'Начальный бонус' : isEs ? 'Bono Inicial' : isBg ? 'Начален бонус' : 'พอยต์เริ่มต้น'}
                </th>
                <th className="py-2 px-3 text-right text-amber-300">
                  {isPt ? 'Total Imediato' : isRu ? 'Итого сразу' : isEs ? 'Total Inmediato' : isBg ? 'Общо веднага' : 'รวมพอยต์ที่ได้รับทันที'}
                </th>
                <th className="py-2 pl-3 text-right text-zinc-400">
                  {isPt ? 'Quests Excluídas (+20 / +180)' : isRu ? 'Без квестов (+20 / +180)' : isEs ? 'Quests Excluidas (+20 / +180)' : isBg ? 'Без куестове (+20 / +180)' : 'พอยต์เควสที่ยังไม่รวม (+20 / +180)'}
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
                      {c.name}
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
                      {c400.totalPoints.toLocaleString()} {isPt ? 'pts' : isRu ? 'очков' : isEs ? 'pts' : isBg ? 'точки' : 'พอยต์'}
                    </td>
                    <td className="py-2 pl-3 text-right text-zinc-400 font-sans text-[11px]">
                      {c.hasMarlonAndClass2Quest
                        ? isPt
                          ? 'Sem +20 (Quest 150) e +180 (Quest 220)'
                          : isRu
                          ? 'Без +20 (квест 150) и +180 (квест 220)'
                          : isEs
                          ? 'Sin +20 (Quest 150) y +180 (Quest 220)'
                          : isBg
                          ? 'Без +20 (куест 150) и +180 (куест 220)'
                          : 'ยังไม่รวม +20 (เควส 150) และ +180 (เควส 220)'
                        : isPt
                        ? 'Sem quests 150/220 (7 pts/nv nativo)'
                        : isRu
                        ? 'Без квестов 150/220 (базово 7 очков/ур.)'
                        : isEs
                        ? 'Sin quests 150/220 (7 pts/nivel nativo)'
                        : isBg
                        ? 'Без куестове 150/220 (7 точки/ниво по подразбиране)'
                        : 'ไม่มีเควส 150/220 (ได้ 7 พอยต์/เลเวลตั้งแต่ต้น)'}
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

// 3. ลบตัวละคร เลเวล 400 ได้รับ 300 Credits (Delete Level 400 Character for +300 Credits)
export const DeleteCharacter400Module: React.FC<{
  characters: Character[];
  lang?: LanguageCode;
  onDeleteCharacter400: (charName: string) => ActionResponse;
}> = ({ characters, lang = 'Thai', onDeleteCharacter400 }) => {
  const isPt = lang === 'Portuguese_BR';
  const isRu = lang === 'Russian';
  const isEs = lang === 'Spanish';
  const isBg = lang === 'Bulgarian';
  const level400Chars = characters.filter((c) => c.level === 400);
  const [selectedName, setSelectedName] = useState(
    level400Chars[0]?.name || characters[0]?.name || ''
  );
  const [confirmText, setConfirmText] = useState('');
  const [status, setStatus] = useState<ActionResponse | null>(null);

  const targetChar = characters.find(
    (c) => c.name.toLowerCase() === selectedName.toLowerCase()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetChar) {
      setStatus({
        ok: false,
        message: isPt
          ? 'Selecione o personagem que deseja excluir.'
          : isRu
          ? 'Выберите персонажа для удаления.'
          : isEs
          ? 'Selecciona el personaje que deseas eliminar.'
          : isBg
          ? 'Изберете героя, който желаете да изтриете.'
          : 'กรุณาเลือกตัวละครที่ต้องการลบ',
      });
      return;
    }
    const res = onDeleteCharacter400(targetChar.name);
    setStatus(res);
    if (res.ok) {
      setConfirmText('');
      const remaining = characters.filter(
        (c) => c.name.toLowerCase() !== targetChar.name.toLowerCase()
      );
      setSelectedName(remaining[0]?.name || '');
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
                {isPt
                  ? `Excluir Personagem Nível 400 por Créditos (+${DELETE_CHAR_400_REWARD_CREDITS} Créditos)`
                  : isRu
                  ? `Удалить персонажа 400 ур. за кредиты (+${DELETE_CHAR_400_REWARD_CREDITS} кредитов)`
                  : isEs
                  ? `Eliminar Personaje Nivel 400 por Créditos (+${DELETE_CHAR_400_REWARD_CREDITS} Créditos)`
                  : isBg
                  ? `Изтрий Герой 400 Ниво за Кредити (+${DELETE_CHAR_400_REWARD_CREDITS} Кредита)`
                  : `ลบตัวละคร เลเวล 400 แลกรับเครดิต (+${DELETE_CHAR_400_REWARD_CREDITS} Credits)`}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {isPt
                  ? `Personagens no Nível 400 podem ser excluídos para receber +${DELETE_CHAR_400_REWARD_CREDITS} Créditos instantaneamente na sua conta.`
                  : isRu
                  ? `Персонажей 400 уровня можно удалить и мгновенно получить +${DELETE_CHAR_400_REWARD_CREDITS} кредитов на свой аккаунт.`
                  : isEs
                  ? `Los personajes de Nivel 400 se pueden eliminar para recibir +${DELETE_CHAR_400_REWARD_CREDITS} Créditos instantáneamente en tu cuenta.`
                  : isBg
                  ? `Героите от 400 ниво могат да бъдат изтрити за незабавно получаване на +${DELETE_CHAR_400_REWARD_CREDITS} кредита в акаунта.`
                  : `ตัวละครที่มีระดับเลเวล 400 สามารถนำมาลบเพื่อแลกรับเครดิตคืนเข้าบัญชีได้ทันที +${DELETE_CHAR_400_REWARD_CREDITS} Credits`}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono-tabular font-semibold shrink-0 self-start">
            {isPt
              ? `Receba +${DELETE_CHAR_400_REWARD_CREDITS} Créditos`
              : isRu
              ? `+${DELETE_CHAR_400_REWARD_CREDITS} Кредитов`
              : isEs
              ? `Recibe +${DELETE_CHAR_400_REWARD_CREDITS} Créditos`
              : isBg
              ? `Получи +${DELETE_CHAR_400_REWARD_CREDITS} Кредита`
              : `ได้รับ +${DELETE_CHAR_400_REWARD_CREDITS} Credits`}
          </span>
        </div>

        {/* Character Cards Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-300">
            {isPt
              ? 'Selecione o personagem da sua conta para excluir em troca de créditos'
              : isRu
              ? 'Выберите персонажа вашего аккаунта для удаления в обмен на кредиты'
              : isEs
              ? 'Selecciona el personaje de tu cuenta a eliminar a cambio de créditos'
              : isBg
              ? 'Изберете герой от вашия акаунт за изтриване срещу кредити'
              : 'เลือกตัวละครในบัญชีของคุณที่ต้องการลบแลกเครดิต'}
          </label>
          {characters.length === 0 ? (
            <div className="p-4 rounded border border-zinc-800 bg-zinc-950 text-xs text-zinc-400">
              {isPt
                ? 'Nenhum personagem encontrado na sua conta.'
                : isRu
                ? 'Персонажи на вашем аккаунте не найдены.'
                : isEs
                ? 'No se encontraron personajes en tu cuenta.'
                : isBg
                ? 'Няма намерени герои във вашия акаунт.'
                : 'ไม่มีตัวละครในบัญชีของคุณ'}
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
                      <span className="font-bold text-white text-sm">
                        {ch.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono-tabular font-semibold ${
                          isEligible
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {ch.ctlCode !== 0
                          ? isPt
                            ? 'Banido'
                            : isRu
                            ? 'Заблокирован'
                            : isEs
                            ? 'Baneado'
                            : isBg
                            ? 'Блокиран'
                            : 'ติดสถานะแบน'
                          : ch.level === 400
                          ? isPt
                            ? `Nv.400 · Ganhe +${DELETE_CHAR_400_REWARD_CREDITS} Cr`
                            : isRu
                            ? `400 ур. · Бонус +${DELETE_CHAR_400_REWARD_CREDITS} Кр`
                            : isEs
                            ? `Lv.400 · Gana +${DELETE_CHAR_400_REWARD_CREDITS} Cr`
                            : isBg
                            ? `400 нив. · Вземи +${DELETE_CHAR_400_REWARD_CREDITS} Кр`
                            : `Lv.400 · แลกได้ +${DELETE_CHAR_400_REWARD_CREDITS} Cr`
                          : isPt
                          ? `Nv.${ch.level} (Requer Nv.400)`
                          : isRu
                          ? `${ch.level} ур. (нужен 400 ур.)`
                          : isEs
                          ? `Lv.${ch.level} (Requiere Lv.400)`
                          : isBg
                          ? `${ch.level} нив. (изисква 400 ниво)`
                          : `Lv.${ch.level} (ต้อง Lv.400)`}
                      </span>
                    </div>
                    <div className="text-zinc-400 mt-1">
                      {isPt ? 'Classe:' : isRu ? 'Класс:' : isEs ? 'Clase:' : isBg ? 'Клас:' : 'อาชีพ:'}{' '}
                      <strong className="text-zinc-200">
                        {cls?.name || ch.classCode}
                      </strong>{' '}
                      · {isPt ? 'Pontos:' : isRu ? 'Очки:' : isEs ? 'Puntos:' : isBg ? 'Точки:' : 'พอยต์คงเหลือ:'}{' '}
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
                {isPt ? 'Personagem selecionado:' : isRu ? 'Выбранный персонаж:' : isEs ? 'Personaje seleccionado:' : isBg ? 'Избран герой:' : 'ตัวละครที่เลือก:'}{' '}
                <strong className="text-white">{targetChar.name}</strong> (Level{' '}
                {targetChar.level})
              </span>
              <span className="font-mono-tabular font-bold text-emerald-400">
                {isPt
                  ? `Recompensa: +${DELETE_CHAR_400_REWARD_CREDITS} Créditos`
                  : isRu
                  ? `Награда: +${DELETE_CHAR_400_REWARD_CREDITS} Кредитов`
                  : isEs
                  ? `Recompensa: +${DELETE_CHAR_400_REWARD_CREDITS} Créditos`
                  : isBg
                  ? `Награда: +${DELETE_CHAR_400_REWARD_CREDITS} Кредита`
                  : `เครดิตที่จะได้รับ: +${DELETE_CHAR_400_REWARD_CREDITS} Credits`}
              </span>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">
                {isPt ? (
                  <>
                    Digite o nome <strong className="text-amber-300">{targetChar.name}</strong> para confirmar a exclusão permanente:
                  </>
                ) : isRu ? (
                  <>
                    Введите имя <strong className="text-amber-300">{targetChar.name}</strong> для подтверждения безвозвратного удаления:
                  </>
                ) : isEs ? (
                  <>
                    Escribe el nombre <strong className="text-amber-300">{targetChar.name}</strong> para confirmar la eliminación permanente:
                  </>
                ) : isBg ? (
                  <>
                    Въведете името <strong className="text-amber-300">{targetChar.name}</strong> за потвърждение на окончателното изтриване:
                  </>
                ) : (
                  <>
                    พิมพ์ชื่อตัวละคร <strong className="text-amber-300">{targetChar.name}</strong> เพื่อยืนยันการลบถาวร (หรือกดปุ่มยืนยันด้านล่าง):
                  </>
                )}
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={
                  isPt
                    ? `Digite ${targetChar.name} ou clique em confirmar`
                    : isRu
                    ? `Введите ${targetChar.name} или нажмите подтвердить`
                    : isEs
                    ? `Escribe ${targetChar.name} o haz clic en confirmar`
                    : isBg
                    ? `Въведете ${targetChar.name} или натиснете потвърди`
                    : `พิมพ์ ${targetChar.name} หรือกดปุ่มยืนยัน`
                }
                className="w-full px-3 py-2 text-xs rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
              />
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-zinc-400">
            {isPt
              ? '* O personagem deve estar no Nível 400 e Offline.'
              : isRu
              ? '* Персонаж должен быть 400 уровня и Offline в игре.'
              : isEs
              ? '* El personaje debe estar en Nivel 400 y Desconectado (Offline).'
              : isBg
              ? '* Героят трябва да е 400 ниво и Офлайн (Offline).'
              : '* ตัวละครต้องมีเลเวล 400 และอยู่ในสถานะ Offline เท่านั้น'}
          </span>
          <button
            type="submit"
            disabled={!targetChar || targetChar.level !== 400}
            className="px-5 py-2.5 text-xs font-semibold rounded bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-zinc-950 transition-colors cursor-pointer whitespace-nowrap"
          >
            {isPt
              ? `Confirmar Exclusão de ${targetChar?.name || ''} (+${DELETE_CHAR_400_REWARD_CREDITS} Créditos)`
              : isRu
              ? `Удалить ${targetChar?.name || ''} (+${DELETE_CHAR_400_REWARD_CREDITS} кредитов)`
              : isEs
              ? `Confirmar Eliminación de ${targetChar?.name || ''} (+${DELETE_CHAR_400_REWARD_CREDITS} Créditos)`
              : isBg
              ? `Потвърди изтриването на ${targetChar?.name || ''} (+${DELETE_CHAR_400_REWARD_CREDITS} кредита)`
              : `ยืนยันลบตัวละคร ${targetChar?.name || ''} รับ +${DELETE_CHAR_400_REWARD_CREDITS} Credits`}
          </button>
        </div>
      </form>
    </div>
  );
};

// 4. ระบบออนไลน์แลกเครดิต (1 ชั่วโมง = 5 Credits)
export const OnlineHoursRewardModule: React.FC<{
  account: AccountData;
  lang?: LanguageCode;
  onRedeemOnlineHours: (hoursToRedeem: number) => ActionResponse;
  onSimulateAddOnlineMinutes: (minutes: number) => void;
}> = ({ account, lang = 'Thai', onRedeemOnlineHours, onSimulateAddOnlineMinutes }) => {
  const isPt = lang === 'Portuguese_BR';
  const isRu = lang === 'Russian';
  const isEs = lang === 'Spanish';
  const isBg = lang === 'Bulgarian';
  const availableFullHours = Math.floor((account.onlineMinutes || 0) / 60);
  const remainingMinutes = (account.onlineMinutes || 0) % 60;

  const [hoursInput, setHoursInput] = useState<number>(
    Math.max(1, availableFullHours)
  );
  const [status, setStatus] = useState<ActionResponse | null>(null);

  React.useEffect(() => {
    if (availableFullHours > 0) {
      setHoursInput(availableFullHours);
    } else {
      setHoursInput(1);
    }
  }, [availableFullHours]);

  const creditsToReceive =
    Math.max(0, Math.min(hoursInput, availableFullHours)) *
    ONLINE_HOUR_REWARD_CREDITS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(onRedeemOnlineHours(hoursInput));
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
                {isPt
                  ? `Trocar Horas Online por Créditos (1 Hora = ${ONLINE_HOUR_REWARD_CREDITS} Créditos)`
                  : isRu
                  ? `Обмен онлайн-времени на кредиты (1 час = ${ONLINE_HOUR_REWARD_CREDITS} кредитов)`
                  : isEs
                  ? `Canjear Horas Online por Créditos (1 Hora = ${ONLINE_HOUR_REWARD_CREDITS} Créditos)`
                  : isBg
                  ? `Обмяна на онлайн време за кредити (1 час = ${ONLINE_HOUR_REWARD_CREDITS} кредита)`
                  : `ระบบออนไลน์แลกเครดิต (Online Time Exchange · 1 ชั่วโมง = ${ONLINE_HOUR_REWARD_CREDITS} Credits)`}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {isPt
                  ? `Acumule tempo online no jogo! Cada 1 hora completa (60 minutos) pode ser trocada por ${ONLINE_HOUR_REWARD_CREDITS} Créditos. Os minutos restantes permanecem acumulados.`
                  : isRu
                  ? `Копите время в игре! Каждый 1 полный час (60 мин) можно обменять на ${ONLINE_HOUR_REWARD_CREDITS} кредитов. Оставшиеся минуты сохраняются.`
                  : isEs
                  ? `¡Acumula tiempo en el juego! Cada 1 hora completa (60 min) se puede canjear por ${ONLINE_HOUR_REWARD_CREDITS} Créditos. Los minutos restantes quedan acumulados.`
                  : isBg
                  ? `Натрупвайте онлайн време в играта! Всеки 1 пълен час (60 мин) се обменя за ${ONLINE_HOUR_REWARD_CREDITS} кредита. Останалите минути се запазват.`
                  : `สะสมเวลาออนไลน์ในเกมครบทุก 1 ชั่วโมง (60 นาที) สามารถนำมาแลกรับได้ทันที ${ONLINE_HOUR_REWARD_CREDITS} Credits โดยเศษนาทีที่เหลือจะถูกเก็บสะสมไว้ต่อ`}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono-tabular font-semibold shrink-0 self-start">
            {isPt
              ? `1 Hora = ${ONLINE_HOUR_REWARD_CREDITS} Créditos`
              : isRu
              ? `1 час = ${ONLINE_HOUR_REWARD_CREDITS} Кр`
              : isEs
              ? `1 Hora = ${ONLINE_HOUR_REWARD_CREDITS} Créditos`
              : isBg
              ? `1 час = ${ONLINE_HOUR_REWARD_CREDITS} Кр`
              : `1 ชม. = ${ONLINE_HOUR_REWARD_CREDITS} Credits`}
          </span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono-tabular">
          <div className="p-3.5 rounded bg-zinc-950 border border-zinc-800">
            <div className="text-[11px] text-zinc-400 font-sans">
              {isPt ? 'Tempo Online Acumulado' : isRu ? 'Накопленное онлайн-время' : isEs ? 'Tiempo Online Acumulado' : isBg ? 'Натрупано онлайн време' : 'เวลาออนไลน์สะสมคงเหลือ'}
            </div>
            <div className="text-sm font-bold text-white mt-1">
              {availableFullHours}h {remainingMinutes}m
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              {isPt
                ? `Total: ${(account.onlineMinutes || 0).toLocaleString()} min`
                : isRu
                ? `Всего: ${(account.onlineMinutes || 0).toLocaleString()} мин`
                : isEs
                ? `Total: ${(account.onlineMinutes || 0).toLocaleString()} min`
                : isBg
                ? `Общо: ${(account.onlineMinutes || 0).toLocaleString()} мин`
                : `รวม ${(account.onlineMinutes || 0).toLocaleString()} นาที`}
            </div>
          </div>

          <div className="p-3.5 rounded bg-zinc-950 border border-amber-500/30">
            <div className="text-[11px] text-zinc-400 font-sans">
              {isPt ? 'Horas Disponíveis para Troca' : isRu ? 'Доступно полных часов' : isEs ? 'Horas Disponibles para Canje' : isBg ? 'Достъпни часове за обмяна' : 'จำนวนชั่วโมงที่แลกได้ทันที'}
            </div>
            <div className="text-sm font-bold text-amber-400 mt-1">
              {availableFullHours} {isPt ? 'horas completas' : isRu ? 'полных часов' : isEs ? 'horas completas' : isBg ? 'пълни часа' : 'ชั่วโมงเต็ม'}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              {isPt
                ? `Sobram ${remainingMinutes} min acumulados`
                : isRu
                ? `Остаток ${remainingMinutes} мин сохранится`
                : isEs
                ? `Quedan ${remainingMinutes} min acumulados`
                : isBg
                ? `Остават ${remainingMinutes} мин натрупани`
                : `คงเหลือเศษ ${remainingMinutes} นาทีเก็บสะสมต่อ`}
            </div>
          </div>

          <div className="p-3.5 rounded bg-zinc-950 border border-emerald-500/30">
            <div className="text-[11px] text-zinc-400 font-sans">
              {isPt
                ? `Créditos a Receber (${availableFullHours} × ${ONLINE_HOUR_REWARD_CREDITS})`
                : isRu
                ? `Кредитов к получению (${availableFullHours} × ${ONLINE_HOUR_REWARD_CREDITS})`
                : isEs
                ? `Créditos a Recibir (${availableFullHours} × ${ONLINE_HOUR_REWARD_CREDITS})`
                : isBg
                ? `Кредити за получаване (${availableFullHours} × ${ONLINE_HOUR_REWARD_CREDITS})`
                : `เครดิตที่จะได้รับ (${availableFullHours} × ${ONLINE_HOUR_REWARD_CREDITS})`}
            </div>
            <div className="text-sm font-bold text-emerald-400 mt-1">
              +{(availableFullHours * ONLINE_HOUR_REWARD_CREDITS).toLocaleString()} Credits
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              {isPt
                ? `Total já trocado: ${account.exchangedOnlineHours || 0}h`
                : isRu
                ? `Уже обменено: ${account.exchangedOnlineHours || 0} ч`
                : isEs
                ? `Total canjeado: ${account.exchangedOnlineHours || 0}h`
                : isBg
                ? `Вече обменено: ${account.exchangedOnlineHours || 0}ч`
                : `แลกสะสมแล้วทั้งหมด ${account.exchangedOnlineHours || 0} ชม.`}
            </div>
          </div>
        </div>

        {/* Redeem Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs text-zinc-300 mb-1.5">
              {isPt
                ? `Horas para resgatar (máx. ${availableFullHours} horas)`
                : isRu
                ? `Часов для обмена (макс. ${availableFullHours} ч.)`
                : isEs
                ? `Horas a canjear (máx. ${availableFullHours} horas)`
                : isBg
                ? `Часове за обмяна (макс. ${availableFullHours} часа)`
                : `ระบุจำนวนชั่วโมงที่ต้องการแลก (สูงสุด ${availableFullHours} ชั่วโมง)`}
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
            disabled={availableFullHours < 1}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 transition-colors cursor-pointer"
          >
            {isPt
              ? `Trocar ${Math.min(hoursInput, availableFullHours)}h por +${creditsToReceive.toLocaleString()} Créditos`
              : isRu
              ? `Обменять ${Math.min(hoursInput, availableFullHours)} ч. на +${creditsToReceive.toLocaleString()} Кр.`
              : isEs
              ? `Canjear ${Math.min(hoursInput, availableFullHours)}h por +${creditsToReceive.toLocaleString()} Créditos`
              : isBg
              ? `Обмени ${Math.min(hoursInput, availableFullHours)}ч за +${creditsToReceive.toLocaleString()} Кр.`
              : `แลกเวลาออนไลน์ ${Math.min(hoursInput, availableFullHours)} ชม. รับ +${creditsToReceive.toLocaleString()} Credits`}
          </button>
        </div>
      </form>

      {/* Simulation / Testing Helper */}
      <div className="p-4 rounded border border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="text-zinc-400">
          <strong className="text-zinc-200">
            {isPt
              ? 'Simulador de Tempo Online (Para Teste):'
              : isRu
              ? 'Симулятор онлайн-времени (Тест):'
              : isEs
              ? 'Simulador de Tiempo Online (Prueba):'
              : isBg
              ? 'Симулатор на онлайн време (Тест):'
              : 'ปุ่มจำลองเวลาออนไลน์ (สำหรับทดสอบระบบ):'}
          </strong>{' '}
          {isPt ? 'Adicionar tempo na conta' : isRu ? 'Добавить время на аккаунт' : isEs ? 'Añadir tiempo a la cuenta' : isBg ? 'Добави време към акаунта' : 'กดเพื่อเพิ่มเวลาออนไลน์สะสมเข้าไอดี'}{' '}
          <strong>{account.username}</strong>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              onSimulateAddOnlineMinutes(60);
              setStatus({
                ok: true,
                message: isPt
                  ? '+1 Hora (+60 minutos) de tempo online adicionada com sucesso!'
                  : isRu
                  ? '+1 час (+60 минут) онлайн-времени успешно добавлено!'
                  : isEs
                  ? '¡+1 Hora (+60 minutos) de tiempo online añadida con éxito!'
                  : isBg
                  ? '+1 час (+60 минути) онлайн време бе добавено успешно!'
                  : 'จำลองเวลาออนไลน์เพิ่ม +1 ชั่วโมง (+60 นาที) สำเร็จ!',
              });
            }}
            className="px-3 py-1.5 rounded border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-amber-300 font-mono-tabular cursor-pointer"
          >
            {isPt ? '+1 Hora (+60 min)' : isRu ? '+1 Час (+60 мин)' : isEs ? '+1 Hora (+60 min)' : isBg ? '+1 Час (+60 мин)' : '+1 ชั่วโมง (+60 นาที)'}
          </button>
          <button
            type="button"
            onClick={() => {
              onSimulateAddOnlineMinutes(300);
              setStatus({
                ok: true,
                message: isPt
                  ? '+5 Horas (+300 minutos) de tempo online adicionadas com sucesso!'
                  : isRu
                  ? '+5 часов (+300 минут) онлайн-времени успешно добавлено!'
                  : isEs
                  ? '¡+5 Horas (+300 minutos) de tiempo online añadidas con éxito!'
                  : isBg
                  ? '+5 часа (+300 минути) онлайн време бяха добавени успешно!'
                  : 'จำลองเวลาออนไลน์เพิ่ม +5 ชั่วโมง (+300 นาที) สำเร็จ!',
              });
            }}
            className="px-3 py-1.5 rounded border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-emerald-300 font-mono-tabular cursor-pointer"
          >
            {isPt ? '+5 Horas (+300 min)' : isRu ? '+5 Часов (+300 мин)' : isEs ? '+5 Horas (+300 min)' : isBg ? '+5 Часа (+300 мин)' : '+5 ชั่วโมง (+300 นาที)'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 5. Get Points (modules/points.php)
export const PointsModule: React.FC<{
  characters: Character[];
  config: WebShopConfig;
  lang?: LanguageCode;
  onAddPoints: (charName: string, points: number) => ActionResponse;
}> = ({ characters, config, lang = 'Thai', onAddPoints }) => {
  const isPt = lang === 'Portuguese_BR';
  const isRu = lang === 'Russian';
  const isEs = lang === 'Spanish';
  const isBg = lang === 'Bulgarian';
  const [charName, setCharName] = useState(characters[0]?.name || '');
  const [points, setPoints] = useState(500);
  const [status, setStatus] = useState<ActionResponse | null>(null);

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
            {isPt
              ? 'Comprar Pontos de Atributo (Get LevelUp Points)'
              : isRu
              ? 'Покупка очков характеристик (LevelUp Points)'
              : isEs
              ? 'Comprar Puntos de Atributo (LevelUp Points)'
              : isBg
              ? 'Купи точки за характеристики (LevelUp Points)'
              : 'ซื้อพอยต์สเตตัสเพิ่ม (Get LevelUp Points for Credits)'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              {isPt
                ? 'Selecione o Personagem'
                : isRu
                ? 'Выберите персонажа'
                : isEs
                ? 'Seleccionar Personaje'
                : isBg
                ? 'Изберете герой'
                : 'เลือกตัวละคร (Character Name)'}
            </label>
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
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              {isPt
                ? `Quantidade de Pontos (Mín. ${config.credits.points})`
                : isRu
                ? `Количество очков (Мин. ${config.credits.points})`
                : isEs
                ? `Cantidad de Puntos (Mín. ${config.credits.points})`
                : isBg
                ? `Брой точки (Мин. ${config.credits.points})`
                : `จำนวนพอยต์ที่ต้องการซื้อ (ขั้นต่ำ ${config.credits.points})`}
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
            1 Credit = <strong>{config.credits.points}</strong> points ·{' '}
            {isPt ? 'Total:' : isRu ? 'Итого:' : isEs ? 'Total:' : isBg ? 'Общо:' : 'รวมราคา:'}{' '}
            <strong className="text-amber-400">
              {requiredCredits.toLocaleString()} credits
            </strong>
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors cursor-pointer whitespace-nowrap"
          >
            {isPt ? 'Comprar Pontos' : isRu ? 'Купить очки' : isEs ? 'Comprar Puntos' : isBg ? 'Купи точки' : 'ซื้อพอยต์เพิ่ม'}
          </button>
        </div>
      </form>
    </div>
  );
};

// 6. ซื้อเงิน Zen (50 Credits = 500M Zen, ตรวจสอบเงื่อนไขในคลังรวมกันต้องไม่เกิน 900M)
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
  const isPt = lang === 'Portuguese_BR';
  const isRu = lang === 'Russian';
  const isEs = lang === 'Spanish';
  const isBg = lang === 'Bulgarian';
  const [status, setStatus] = useState<ActionResponse | null>(null);
  const [withdrawChar, setWithdrawChar] = useState(characters[0]?.name || '');
  const [withdrawAmount, setWithdrawAmount] = useState(200_000_000);

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
                {isPt
                  ? 'Comprar Zen para o Baú (50 Créditos = 500.000.000 Zen / 500M)'
                  : isRu
                  ? 'Покупка Zen в сундук (50 кредитов = 500.000.000 Zen / 500M)'
                  : isEs
                  ? 'Comprar Zen para el Baúl (50 Créditos = 500.000.000 Zen / 500M)'
                  : isBg
                  ? 'Купи Zen за сандъка (50 кредита = 500.000.000 Zen / 500M)'
                  : 'ซื้อเงิน Zen เข้าคลังเก็บของ (50 Credits = 500,000,000 Zen / 500M)'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {isPt
                  ? 'Condição: O saldo total de Zen no Baú (Warehouse) após a compra não pode ultrapassar 900.000.000 Zen (900M).'
                  : isRu
                  ? 'Условие: Общий баланс Zen в сундуке (Warehouse) после покупки не должен превышать 900.000.000 Zen (900M).'
                  : isEs
                  ? 'Condición: El saldo total de Zen en el baúl (Warehouse) tras la compra no puede superar 900.000.000 Zen (900M).'
                  : isBg
                  ? 'Условие: Общият баланс на Zen в сандъка (Warehouse) след покупката не бива да надвишава 900.000.000 Zen (900M).'
                  : 'เงื่อนไขระบบ: เงิน Zen ในคลังเก็บของ (Warehouse Vault) เมื่อรวมกับจำนวนที่ซื้อแล้วต้องไม่เกิน 900,000,000 Zen (900M)'}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono-tabular font-semibold shrink-0 self-start">
            50 Credits = 500M Zen
          </span>
        </div>

        {/* Warehouse Zen Capacity Meter */}
        <div className="p-4 rounded border border-zinc-800 bg-zinc-950/90 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">
              {isPt
                ? 'Capacidade Atual de Zen no Baú:'
                : isRu
                ? 'Текущая вместимость Zen в сундуке:'
                : isEs
                ? 'Capacidad Actual de Zen en el Baúl:'
                : isBg
                ? 'Текущ капацитет на Zen в сандъка:'
                : 'ความจุเงิน Zen ในคลังปัจจุบัน:'}
            </span>
            <span className="font-mono-tabular font-bold text-white">
              {currentVaultZen.toLocaleString()} / {WAREHOUSE_ZEN_MAX_LIMIT.toLocaleString()} Zen (900M)
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full transition-all ${
                isOverLimit ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono-tabular">
            <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
              <div className="text-[11px] text-zinc-400 font-sans">
                {isPt ? 'Zen Atual no Baú' : isRu ? 'Текущий Zen в сундуке' : isEs ? 'Zen Actual en Baúl' : isBg ? 'Текущ Zen в сандъка' : 'Zen ในคลังปัจจุบัน'}
              </div>
              <div className="font-bold text-zinc-100 mt-0.5">
                {(currentVaultZen / 1_000_000).toFixed(0)}M ({currentVaultZen.toLocaleString()})
              </div>
            </div>
            <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
              <div className="text-[11px] text-zinc-400 font-sans">
                {isPt ? 'Pacote de Compra (50 Cr)' : isRu ? 'Пакет покупки (50 Кр)' : isEs ? 'Paquete de Compra (50 Cr)' : isBg ? 'Пакет за покупка (50 Кр)' : 'จำนวนที่ซื้อเพิ่ม (50 Cr)'}
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
                {isPt ? 'Total Após Compra (Máx 900M)' : isRu ? 'Итого после покупки (Макс 900M)' : isEs ? 'Total Tras Compra (Máx 900M)' : isBg ? 'Общо след покупка (Макс 900M)' : 'ยอดรวมหลังซื้อ (เพดาน 900M)'}
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
                {isPt ? (
                  <>
                    Seu baú possui <strong>{currentVaultZen.toLocaleString()} Zen</strong>. Comprar +500M resultaria em{' '}
                    <strong>{projectedVaultZen.toLocaleString()} Zen</strong>, excedendo o limite máximo de <strong>900.000.000 Zen (900M)</strong>. Transfira Zen para um personagem abaixo antes de comprar.
                  </>
                ) : isRu ? (
                  <>
                    В сундуке сейчас <strong>{currentVaultZen.toLocaleString()} Zen</strong>. Покупка +500M составит{' '}
                    <strong>{projectedVaultZen.toLocaleString()} Zen</strong>, что превышает лимит <strong>900.000.000 Zen (900M)</strong>. Переведите Zen персонажу ниже перед покупкой.
                  </>
                ) : isEs ? (
                  <>
                    Tu baúl tiene <strong>{currentVaultZen.toLocaleString()} Zen</strong>. Comprar +500M resultaría en{' '}
                    <strong>{projectedVaultZen.toLocaleString()} Zen</strong>, excediendo el límite de <strong>900.000.000 Zen (900M)</strong>. Transfiere Zen a un personaje abajo antes de comprar.
                  </>
                ) : isBg ? (
                  <>
                    В сандъка имате <strong>{currentVaultZen.toLocaleString()} Zen</strong>. Закупуването на +500M ще даде{' '}
                    <strong>{projectedVaultZen.toLocaleString()} Zen</strong>, надвишавайки лимита от <strong>900.000.000 Zen (900M)</strong>. Прехвърлете Zen към герой отдолу преди покупка.
                  </>
                ) : (
                  <>
                    ขณะนี้เงินในคลังของคุณมีอยู่ <strong>{currentVaultZen.toLocaleString()} Zen</strong> หากซื้อเพิ่มอีก 500M จะกลายเป็น{' '}
                    <strong>{projectedVaultZen.toLocaleString()} Zen</strong> ซึ่งเกินเงื่อนไขสูงสุด <strong>900,000,000 Zen (900M)</strong> กรุณาถอนเงินจากคลังเข้าตัวละครด้านล่างก่อนสั่งซื้อเพิ่ม
                  </>
                )}
              </span>
            </div>
          ) : (
            <div className="p-3 rounded border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {isPt
                  ? `Dentro do limite: O saldo após a compra (${projectedVaultZen.toLocaleString()} Zen) não excede 900.000.000 Zen (900M).`
                  : isRu
                  ? `Лимит соблюдён: Баланс после покупки (${projectedVaultZen.toLocaleString()} Zen) не превышает 900.000.000 Zen (900M).`
                  : isEs
                  ? `Dentro del límite: El saldo tras la compra (${projectedVaultZen.toLocaleString()} Zen) no supera 900.000.000 Zen (900M).`
                  : isBg
                  ? `В рамките на лимита: Балансът след покупката (${projectedVaultZen.toLocaleString()} Zen) не надвишава 900.000.000 Zen (900M).`
                  : `ผ่านเงื่อนไข: ยอดรวมหลังซื้อ (${projectedVaultZen.toLocaleString()} Zen) ไม่เกิน 900,000,000 Zen (900M) สามารถกดซื้อได้ทันที`}
              </span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-zinc-300 font-mono-tabular">
            {isPt ? 'Taxa:' : isRu ? 'Курс:' : isEs ? 'Tasa:' : isBg ? 'Курс:' : 'อัตราแลกเปลี่ยน:'}{' '}
            <strong className="text-amber-400">{ZEN_PURCHASE_CREDITS} Credits</strong> ={' '}
            <strong className="text-emerald-400">500,000,000 Zen (500M)</strong>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors cursor-pointer whitespace-nowrap"
          >
            {isPt
              ? 'Comprar 500M Zen (50 Créditos)'
              : isRu
              ? 'Купить 500M Zen (50 кредитов)'
              : isEs
              ? 'Comprar 500M Zen (50 Créditos)'
              : isBg
              ? 'Купи 500M Zen (50 кредита)'
              : 'ซื้อเงิน 500M Zen (50 Credits)'}
          </button>
        </div>
      </form>

      {/* Helper: Transfer Zen from Warehouse to Character so user can clear Warehouse space */}
      <form
        onSubmit={handleWithdraw}
        className="p-4 rounded border border-zinc-800 bg-zinc-900/50 space-y-3"
      >
        <div className="text-xs font-semibold text-zinc-200">
          {isPt
            ? 'Transferir Zen do Baú (Warehouse) para um Personagem (Liberar espaço abaixo de 900M)'
            : isRu
            ? 'Перевод Zen из сундука персонажу (Освободить место до 900M)'
            : isEs
            ? 'Transferir Zen del Baúl (Warehouse) a un Personaje (Liberar espacio bajo 900M)'
            : isBg
            ? 'Прехвърли Zen от сандъка към герой (Освободи място под 900M)'
            : 'โอนเงิน Zen จากคลัง (Warehouse) เข้าตัวละคร (เพื่อเคลียร์พื้นที่คลังไม่ให้เกิน 900M)'}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">
              {isPt ? 'Personagem Destino' : isRu ? 'Персонаж-получатель' : isEs ? 'Personaje Destino' : isBg ? 'Герой получател' : 'เลือกตัวละครผู้รับ'}
            </label>
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
          </div>
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">
              {isPt ? 'Quantidade de Zen' : isRu ? 'Сумма Zen для вывода' : isEs ? 'Cantidad de Zen' : isBg ? 'Сума на Zen за теглене' : 'จำนวน Zen ที่ต้องการถอนจากคลัง'}
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
            className="px-4 py-2 text-xs font-semibold rounded border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 transition-colors cursor-pointer"
          >
            {isPt ? 'Transferir Zen (Grátis)' : isRu ? 'Перевести Zen (Бесплатно)' : isEs ? 'Transferir Zen (Gratis)' : isBg ? 'Прехвърли Zen (Безплатно)' : 'โอน Zen เข้าตัวละคร (ฟรี)'}
          </button>
        </div>
      </form>
    </div>
  );
};

// 7. Change Class (modules/class.php)
export const ClassChangeModule: React.FC<{
  characters: Character[];
  config: WebShopConfig;
  lang?: LanguageCode;
  onChangeClass: (charName: string, newClass: MuClassCode) => ActionResponse;
}> = ({ characters, config, lang = 'Thai', onChangeClass }) => {
  const isPt = lang === 'Portuguese_BR';
  const isRu = lang === 'Russian';
  const isEs = lang === 'Spanish';
  const isBg = lang === 'Bulgarian';
  const [charName, setCharName] = useState(characters[0]?.name || '');
  const [newClass, setNewClass] = useState<MuClassCode>('bm');
  const [status, setStatus] = useState<ActionResponse | null>(null);

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
            {isPt
              ? 'Trocar Classe do Personagem (Character Class Change)'
              : isRu
              ? 'Смена класса персонажа (Character Class Change)'
              : isEs
              ? 'Cambiar Clase de Personaje (Character Class Change)'
              : isBg
              ? 'Смяна на класа на героя (Character Class Change)'
              : 'เปลี่ยนสายอาชีพตัวละคร (Character Class Change)'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              {isPt ? 'Selecione o Personagem' : isRu ? 'Выберите персонажа' : isEs ? 'Seleccionar Personaje' : isBg ? 'Изберете герой' : 'เลือกตัวละคร'}
            </label>
            <select
              value={charName}
              onChange={(e) => setCharName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            >
              {characters.map((c) => {
                const cls = MU_CLASSES.find((m) => m.code === c.classCode);
                return (
                  <option key={c.name} value={c.name}>
                    {c.name} ({cls?.name || c.classCode})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              {isPt ? 'Nova Classe' : isRu ? 'Новый класс' : isEs ? 'Nueva Clase' : isBg ? 'Нов клас' : 'สายอาชีพใหม่'}
            </label>
            <select
              value={newClass}
              onChange={(e) => setNewClass(e.target.value as MuClassCode)}
              className="w-full px-3 py-2 text-xs rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            >
              {availableClasses.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.pointsPerLevel} {isPt ? 'pts/nv' : isRu ? 'очк/ур' : isEs ? 'pts/nv' : isBg ? 'т/ниво' : 'พอยต์/เลเวล'})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
          <span className="text-xs text-zinc-300 font-mono-tabular">
            {isPt ? 'Custo:' : isRu ? 'Стоимость:' : isEs ? 'Costo:' : isBg ? 'Такса:' : 'ค่าธรรมเนียม'}{' '}
            <strong className="text-amber-400">
              {config.credits.classchg.toLocaleString()} credits
            </strong>
          </span>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors cursor-pointer"
          >
            {isPt ? 'Trocar Classe' : isRu ? 'Сменить класс' : isEs ? 'Cambiar Clase' : isBg ? 'Смени клас' : 'เปลี่ยนสายอาชีพ'}
          </button>
        </div>
      </form>
    </div>
  );
};

// 8. Change Character Name (modules/charname.php)
export const CharNameModule: React.FC<{
  characters: Character[];
  config: WebShopConfig;
  lang?: LanguageCode;
  onChangeName: (oldName: string, newName: string) => ActionResponse;
}> = ({ characters, config, lang = 'Thai', onChangeName }) => {
  const isPt = lang === 'Portuguese_BR';
  const isRu = lang === 'Russian';
  const isEs = lang === 'Spanish';
  const isBg = lang === 'Bulgarian';
  const [oldName, setOldName] = useState(characters[0]?.name || '');
  const [newName, setNewName] = useState('');
  const [status, setStatus] = useState<ActionResponse | null>(null);

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
            {isPt
              ? 'Trocar Nome do Personagem (Change Character Name)'
              : isRu
              ? 'Смена имени персонажа (Change Character Name)'
              : isEs
              ? 'Cambiar Nombre de Personaje (Change Character Name)'
              : isBg
              ? 'Смяна на име на герой (Change Character Name)'
              : 'เปลี่ยนชื่อตัวละคร (Change Character Name)'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              {isPt ? 'Personagem Atual' : isRu ? 'Текущий персонаж' : isEs ? 'Personaje Actual' : isBg ? 'Текущ герой' : 'ตัวละครเดิม'}
            </label>
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
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              {isPt
                ? 'Novo Nome (2 a 10 caracteres)'
                : isRu
                ? 'Новое имя (от 2 до 10 символов)'
                : isEs
                ? 'Nuevo Nombre (2 a 10 caracteres)'
                : isBg
                ? 'Ново име (от 2 до 10 символа)'
                : 'ชื่อใหม่ (ความยาว 2–10 ตัวอักษร)'}
            </label>
            <input
              type="text"
              maxLength={10}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={
                isPt
                  ? 'Novo nome do personagem'
                  : isRu
                  ? 'Новое имя персонажа'
                  : isEs
                  ? 'Nuevo nombre del personaje'
                  : isBg
                  ? 'Ново име на героя'
                  : 'New character name'
              }
              className="w-full px-3 py-2 text-xs rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
          <span className="text-xs text-zinc-300 font-mono-tabular">
            {isPt ? 'Custo:' : isRu ? 'Стоимость:' : isEs ? 'Costo:' : isBg ? 'Такса:' : 'ค่าธรรมเนียม:'}{' '}
            <strong className="text-amber-400">
              {config.credits.namechg.toLocaleString()} credits
            </strong>
          </span>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors cursor-pointer"
          >
            {isPt ? 'Trocar Nome' : isRu ? 'Сменить имя' : isEs ? 'Cambiar Nombre' : isBg ? 'Смени име' : 'เปลี่ยนชื่อตัวละคร'}
          </button>
        </div>
      </form>
    </div>
  );
};

// 9. Unban Character (modules/unban.php)
export const UnbanModule: React.FC<{
  allCharacters: Character[];
  config: WebShopConfig;
  lang?: LanguageCode;
  onUnbanCharacter: (charName: string) => ActionResponse;
}> = ({ allCharacters, config, lang = 'Thai', onUnbanCharacter }) => {
  const isPt = lang === 'Portuguese_BR';
  const isRu = lang === 'Russian';
  const isEs = lang === 'Spanish';
  const isBg = lang === 'Bulgarian';
  const bannedChars = allCharacters.filter(
    (c) => c.ctlCode === config.misc.bannedcode
  );
  const [charName, setCharName] = useState(bannedChars[0]?.name || 'PK_Outlaw');
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
            {isPt
              ? 'Desbanir Personagem (Unban Character)'
              : isRu
              ? 'Разблокировка персонажа (Unban Character)'
              : isEs
              ? 'Desbanear Personaje (Unban Character)'
              : isBg
              ? 'Отблокиране на герой (Unban Character)'
              : 'ปลดแบนตัวละคร (Unban Character)'}
          </h3>
        </div>

        <div className="text-xs text-zinc-300">
          {isPt
            ? `Desbanir personagem suspenso (ctlCode = ${config.misc.bannedcode}) pelo custo de `
            : isRu
            ? `Разблокировать заблокированного персонажа (ctlCode = ${config.misc.bannedcode}) за `
            : isEs
            ? `Desbanear personaje suspendido (ctlCode = ${config.misc.bannedcode}) por un costo de `
            : isBg
            ? `Отблокирай спрян герой (ctlCode = ${config.misc.bannedcode}) срещу такса от `
            : `ปลดแบนตัวละครที่ถูกระงับ (ctlCode = ${config.misc.bannedcode}) ด้วยค่าธรรมเนียม `}
          <strong className="font-mono-tabular text-amber-400">
            {config.credits.unbanchar.toLocaleString()} credits
          </strong>
          .
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">
            {isPt ? 'Nome do Personagem' : isRu ? 'Имя персонажа' : isEs ? 'Nombre del Personaje' : isBg ? 'Име на героя' : 'ชื่อตัวละคร (Character Name)'}
          </label>
          <input
            type="text"
            maxLength={10}
            value={charName}
            onChange={(e) => setCharName(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
          />
          {bannedChars.length > 0 && (
            <div className="mt-2 text-[11px] text-zinc-400">
              {isPt
                ? 'Personagens banidos no momento: '
                : isRu
                ? 'Заблокированные персонажи: '
                : isEs
                ? 'Personajes baneados actualmente: '
                : isBg
                ? 'Текущо блокирани герои: '
                : 'ตัวละครที่ติดสถานะแบนในขณะนี้: '}
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
            className="px-4 py-2 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors cursor-pointer"
          >
            {isPt
              ? `Desbanir Personagem (${config.credits.unbanchar.toLocaleString()} cr)`
              : isRu
              ? `Разблокировать (${config.credits.unbanchar.toLocaleString()} кр)`
              : isEs
              ? `Desbanear Personaje (${config.credits.unbanchar.toLocaleString()} cr)`
              : isBg
              ? `Отблокирай герой (${config.credits.unbanchar.toLocaleString()} кр)`
              : `ปลดแบนตัวละคร (${config.credits.unbanchar.toLocaleString()} cr)`}
          </button>
        </div>
      </form>
    </div>
  );
};
