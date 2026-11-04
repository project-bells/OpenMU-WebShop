import React, { useState } from 'react';
import {
  Crown,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Database,
  ArrowRight,
  Server,
  Layers,
} from 'lucide-react';
import { AccountData, LanguageCode } from '../types/webshop';

interface VipModuleProps {
  account: AccountData;
  lang: LanguageCode;
  onBuyVip: (months: number) => { ok: boolean; message: string };
  onNavigateToTopUp: () => void;
}

export const VipModule: React.FC<VipModuleProps> = ({
  account,
  lang,
  onBuyVip,
  onNavigateToTopUp,
}) => {
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  const VIP_COST_PER_MONTH = 800;
  const totalCost = selectedMonths * VIP_COST_PER_MONTH;

  // VIP expiration calculations
  const now = new Date();
  const currentExpiry = account.vipUntil ? new Date(account.vipUntil) : null;
  const isVipActive = !!(currentExpiry && currentExpiry > now);

  // Calculate new expiration date if purchased
  const baseDate = isVipActive && currentExpiry ? currentExpiry : now;
  const projectedExpiry = new Date(
    baseDate.getTime() + selectedMonths * 30 * 24 * 60 * 60 * 1000
  );

  // Remaining days calculation
  const remainingMs = isVipActive && currentExpiry ? currentExpiry.getTime() - now.getTime() : 0;
  const remainingDays = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
  const remainingHours = Math.floor(
    (remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
  );

  const handlePurchase = () => {
    setIsSubmitting(true);
    setFeedback(null);
    const result = onBuyVip(selectedMonths);
    setFeedback({
      ok: result.ok,
      text: result.message,
    });
    setIsSubmitting(false);
  };

  const isTh = lang === 'Thai';
  const isPt = lang === 'Portuguese_BR';
  const isRu = lang === 'Russian';
  const isEs = lang === 'Spanish';
  const isBg = lang === 'Bulgarian';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 p-6 shadow-2xl">
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>
                {isTh
                  ? 'ระบบห้อง VIP & สิทธิพิเศษ'
                  : isPt
                  ? 'Sistema de Sala VIP & Benefícios'
                  : isRu
                  ? 'VIP Система и VIP Комнаты'
                  : isEs
                  ? 'Sistema de Sala VIP y Beneficios'
                  : isBg
                  ? 'VIP Система и VIP Зали'
                  : 'VIP Membership & Premium Sub-Server'}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>
                {isTh
                  ? 'สมัครสมาชิก VIP (800 Cr / เดือน)'
                  : isPt
                  ? 'Assinatura VIP (800 Cr / mês)'
                  : isRu
                  ? 'Подписка VIP (800 Cr / месяц)'
                  : isEs
                  ? 'Suscripción VIP (800 Cr / mes)'
                  : isBg
                  ? 'VIP Абонамент (800 Cr / месец)'
                  : 'VIP Membership (800 Cr / Month)'}
              </span>
            </h1>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              {isTh
                ? 'เข้าสู่ห้อง VIP พิเศษเฉพาะสมาชิก VIP เพิ่มค่า EXP +30% และอัตรา Drop +20% (เช่น ห้องธรรมดา EXP 100x ดรอป 40% → ห้อง VIP เป็น EXP 130x ดรอป 60%) จุดฟาร์มกว้างขวาง ไม่แออัด'
                : isPt
                ? 'Acesse a sala VIP exclusiva com bônus de EXP +30% e taxa de Drop +20% (Ex: Sala normal EXP 100x / Drop 40% → Sala VIP EXP 130x / Drop 60%). Spawns livres e sem aglomeração.'
                : isRu
                ? 'Доступ на выделенный VIP сервер с бонусом к Опыту +30% и шансу Дропа +20% (Напр.: Обычная комната EXP 100x / Дроп 40% → VIP комната EXP 130x / Дроп 60%). Свободные споты!'
                : isEs
                ? 'Accede a la sala VIP exclusiva con bono de EXP +30% y tasa de Drop +20% (Ej: Sala normal EXP 100x / Drop 40% → Sala VIP EXP 130x / Drop 60%). Spawns libres y sin aglomeración.'
                : isBg
                ? 'Достъп до ексклузивна VIP зала с бонус към EXP +30% и Drop +20% (Напр.: Обикновена зала EXP 100x / Drop 40% → VIP зала EXP 130x / Drop 60%).'
                : 'Access the dedicated VIP sub-server with +30% EXP bonus and +20% Drop rate boost (e.g., Normal Room EXP 100x / Drop 40% → VIP Room EXP 130x / Drop 60%). Less crowded farming spots!'}
            </p>
          </div>

          {/* Account status pill */}
          <div className="flex flex-col sm:items-end justify-center bg-zinc-900/90 border border-zinc-800 p-3.5 rounded-lg min-w-[220px]">
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
              {isTh
                ? 'สถานะ VIP บัญชีของคุณ'
                : isPt
                ? 'Status VIP da Conta'
                : isRu
                ? 'Статус VIP аккаунта'
                : isEs
                ? 'Estado VIP de la Cuenta'
                : isBg
                ? 'VIP Статус на Акаунта'
                : 'Your VIP Status'}
            </span>
            {isVipActive ? (
              <div className="space-y-1 sm:text-right mt-1">
                <div className="inline-flex items-center gap-1.5 text-amber-300 font-bold text-sm bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>
                    {isTh
                      ? 'สมาชิก VIP ใช้งานอยู่'
                      : isPt
                      ? 'VIP Ativo'
                      : isRu
                      ? 'VIP Активен'
                      : isEs
                      ? 'VIP Activo'
                      : isBg
                      ? 'VIP Активен'
                      : 'VIP Active'}
                  </span>
                </div>
                <div className="text-xs text-emerald-400 font-mono-tabular font-semibold">
                  {remainingDays} {isTh ? 'วัน' : isPt ? 'dias' : isRu ? 'дн.' : isEs ? 'días' : isBg ? 'дни' : 'days'}{' '}
                  {remainingHours} {isTh ? 'ชม.' : isPt ? 'horas' : isRu ? 'ч.' : isEs ? 'horas' : isBg ? 'часа' : 'hrs'}
                </div>
                <div className="text-[10px] text-zinc-400">
                  {isTh ? 'หมดอายุ: ' : 'Expires: '}{currentExpiry?.toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div className="space-y-1 sm:text-right mt-1">
                <span className="inline-block px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-xs font-semibold">
                  {isTh
                    ? 'ยังไม่ได้เป็นสมาชิก VIP'
                    : isPt
                    ? 'Não é VIP'
                    : isRu
                    ? 'Нет VIP подписки'
                    : isEs
                    ? 'No es VIP'
                    : isBg
                    ? 'Няма VIP абонамент'
                    : 'Non-VIP Account'}
                </span>
                <p className="text-[10px] text-zinc-400">
                  {isTh
                    ? 'ห้องธรรมดา (Normal Room)'
                    : 'Normal Room access only'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Grid: Normal Room vs VIP Room */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Normal Room Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  {isTh
                    ? 'ห้องธรรมดา (Normal Sub-Server)'
                    : isPt
                    ? 'Sala Normal (Sub-Server 1)'
                    : isRu
                    ? 'Обычная комната (Сервер 1)'
                    : isEs
                    ? 'Sala Normal (Sub-Servidor 1)'
                    : isBg
                    ? 'Обикновена Зала (Сървър 1)'
                    : 'Normal Room (Sub-Server 1)'}
                </h3>
                <p className="text-xs text-zinc-400">
                  {isTh ? 'สำหรับผู้เล่นทั่วไปทุกคน' : 'Public access for all players'}
                </p>
              </div>
            </div>
            <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs font-mono-tabular">
              Free
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-zinc-400" />
                {isTh ? 'อัตราค่า EXP คูณ (EXP Rate)' : 'EXP Multiplier'}
              </span>
              <span className="text-sm font-bold text-zinc-200 font-mono-tabular">
                100x (Base)
              </span>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-zinc-400" />
                {isTh ? 'อัตราการดรอปของไอเทม (Drop Rate)' : 'Item Drop Rate'}
              </span>
              <span className="text-sm font-bold text-zinc-200 font-mono-tabular">
                40% (Base)
              </span>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-zinc-400" />
                {isTh ? 'ความหนาแน่นจุดฟาร์ม' : 'Spot Crowding'}
              </span>
              <span className="text-xs text-rose-400 font-medium">
                {isTh ? 'แออัดสูง (แข่งขันแย่งจุดฟาร์ม)' : 'High (Contested spots)'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-zinc-400" />
                {isTh ? 'สิทธิ์เข้าห้องพิเศษ' : 'VIP Room Access'}
              </span>
              <span className="text-xs text-zinc-500">
                {isTh ? 'ไม่สามารถเข้าห้อง VIP ได้' : 'Locked'}
              </span>
            </div>
          </div>
        </div>

        {/* VIP Room Card */}
        <div className="rounded-xl border border-amber-500/40 bg-gradient-to-b from-amber-950/20 via-zinc-900 to-zinc-950 p-5 space-y-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Crown className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-amber-200 text-base flex items-center gap-1.5">
                  <span>
                    {isTh
                      ? 'ห้อง VIP (VIP Sub-Server 2)'
                      : isPt
                      ? 'Sala VIP (Sub-Server 2 VIP)'
                      : isRu
                      ? 'VIP комната (VIP Сервер 2)'
                      : isEs
                      ? 'Sala VIP (Sub-Servidor 2 VIP)'
                      : isBg
                      ? 'VIP Зала (Сървър 2 VIP)'
                      : 'VIP Room (Sub-Server 2)'}
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
                <p className="text-xs text-amber-400/80">
                  {isTh ? 'สิทธิพิเศษเฉพาะสมาชิก VIP เท่านั้น' : 'Exclusive VIP Room only'}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-amber-500 text-zinc-950 text-xs font-bold font-mono-tabular">
              800 Cr / {isTh ? 'เดือน' : isPt ? 'mês' : isRu ? 'мес' : isEs ? 'mes' : isBg ? 'месец' : 'Mo'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs text-amber-200 flex items-center gap-2 font-medium">
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  {isTh ? 'อัตราค่า EXP คูณ (EXP Rate)' : 'EXP Multiplier'}
                </span>
                <span className="text-[10px] text-amber-400/80 block">
                  {isTh ? 'เก็บเลเวลเร็วกว่าเดิม 1.3 เท่า (+30%)' : '+30% Faster Leveling'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-amber-300 font-mono-tabular">
                  130x
                </span>
                <span className="block text-[10px] font-bold text-emerald-400">
                  +30% Bonus
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs text-amber-200 flex items-center gap-2 font-medium">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  {isTh ? 'อัตราการดรอปของไอเทม (Drop Rate)' : 'Item Drop Rate'}
                </span>
                <span className="text-[10px] text-amber-400/80 block">
                  {isTh ? 'ดรอป Jewel, Ancient และไอเทมดีขึ้น (+20%)' : '+20% Higher Item & Jewel Drops'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-emerald-400 font-mono-tabular">
                  60%
                </span>
                <span className="block text-[10px] font-bold text-emerald-400">
                  +20% Bonus
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                {isTh ? 'ความหนาแน่นจุดฟาร์ม' : 'Spot Crowding'}
              </span>
              <span className="text-xs text-emerald-400 font-medium">
                {isTh ? 'จุดฟาร์มกว้างขวาง สบายตา ไม่แออัด' : 'Uncrowded, spacious spots'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                {isTh ? 'ฉายาพิเศษในเกม' : 'In-Game VIP Tag'}
              </span>
              <span className="text-xs text-amber-300 font-bold font-mono-tabular">
                [VIP] Prefix & Chat
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Action Form */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>
                {isVipActive
                  ? isTh
                    ? 'ต่ออายุสมาชิก VIP (Extend VIP)'
                    : isPt
                    ? 'Estender Assinatura VIP'
                    : isRu
                    ? 'Продлить VIP подписку'
                    : isEs
                    ? 'Extender Suscripción VIP'
                    : isBg
                    ? 'Удължи VIP Абонамента'
                    : 'Extend VIP Subscription'
                  : isTh
                  ? 'เลือกแพ็กเกจระยะเวลา VIP'
                  : isPt
                  ? 'Escolha o Período VIP'
                  : isRu
                  ? 'Выберите период подписки'
                  : isEs
                  ? 'Selecciona el Período VIP'
                  : isBg
                  ? 'Изберете VIP Период'
                  : 'Select VIP Duration'}
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isTh
                ? 'ค่าบริการ 800 Credits ต่อเดือน (30 วัน) เวลาจะสะสมเพิ่มขึ้นตามจำนวนเดือนที่เลือก'
                : 'Rate: 800 Credits per month (30 days). Extra duration stacks onto existing expiration.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-400">
              {isTh ? 'เครดิตของคุณ:' : 'Your Credits:'}
            </span>
            <span className="font-mono-tabular font-bold text-amber-400">
              {account.credits.toLocaleString()} Cr
            </span>
            {account.credits < totalCost && (
              <button
                type="button"
                onClick={onNavigateToTopUp}
                className="ml-2 text-[11px] text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                {isTh ? '+ เติมเครดิต' : '+ Top Up'}
              </button>
            )}
          </div>
        </div>

        {/* Plan selection buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              months: 1,
              days: 30,
              label: isTh ? '1 เดือน (30 วัน)' : '1 Month (30 Days)',
              cost: 800,
              popular: false,
            },
            {
              months: 2,
              days: 60,
              label: isTh ? '2 เดือน (60 วัน)' : '2 Months (60 Days)',
              cost: 1600,
              popular: false,
            },
            {
              months: 3,
              days: 90,
              label: isTh ? '3 เดือน (90 วัน)' : '3 Months (90 Days)',
              cost: 2400,
              popular: true,
            },
            {
              months: 6,
              days: 180,
              label: isTh ? '6 เดือน (180 วัน)' : '6 Months (180 Days)',
              cost: 4800,
              popular: false,
            },
          ].map((plan) => {
            const isSelected = selectedMonths === plan.months;
            return (
              <button
                key={plan.months}
                type="button"
                onClick={() => setSelectedMonths(plan.months)}
                className={`relative flex flex-col p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 shadow-lg ring-1 ring-amber-500/50'
                    : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700 hover:bg-zinc-900/60'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 text-[10px] font-black uppercase tracking-wider shadow">
                    {isTh ? 'ยอดนิยม' : 'Popular'}
                  </span>
                )}
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-zinc-300">
                    {plan.label}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div className="mt-3">
                  <span className="text-xl font-black text-amber-400 font-mono-tabular">
                    {plan.cost.toLocaleString()}
                  </span>
                  <span className="text-xs text-zinc-400 ml-1">Credits</span>
                </div>
                <span className="text-[10px] text-zinc-400 mt-1">
                  800 Cr / {isTh ? 'เดือน' : 'mo'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Calculation Summary Card */}
        <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
          <div className="flex justify-between items-center text-zinc-300">
            <span>{isTh ? 'ระยะเวลาที่เลือก:' : 'Selected Duration:'}</span>
            <span className="font-semibold text-white">
              {selectedMonths} {isTh ? 'เดือน' : 'month(s)'} ({selectedMonths * 30} {isTh ? 'วัน' : 'days'})
            </span>
          </div>
          <div className="flex justify-between items-center text-zinc-300">
            <span>{isTh ? 'ค่าบริการที่ต้องชำระ:' : 'Total Cost:'}</span>
            <span className="font-bold text-amber-400 font-mono-tabular">
              {totalCost.toLocaleString()} Credits
            </span>
          </div>
          <div className="flex justify-between items-center text-zinc-300">
            <span>{isTh ? 'เครดิตคงเหลือหลังทำรายการ:' : 'Projected Balance:'}</span>
            <span
              className={`font-mono-tabular font-bold ${
                account.credits >= totalCost ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {(account.credits - totalCost).toLocaleString()} Credits
            </span>
          </div>
          <div className="flex justify-between items-center text-zinc-300 pt-1 border-t border-zinc-800/80">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              {isTh ? 'วันหมดอายุ VIP ที่จะได้:' : 'Projected VIP Expiration:'}
            </span>
            <span className="font-mono-tabular text-amber-300 font-semibold">
              {projectedExpiry.toLocaleString(isTh ? 'th-TH' : 'en-US')}
            </span>
          </div>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`p-3.5 rounded-lg border flex items-start gap-3 text-xs leading-relaxed ${
              feedback.ok
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}
          >
            {feedback.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{feedback.ok ? 'สำเร็จ (Success)' : 'ผิดพลาด (Error)'}</p>
              <p className="mt-0.5">{feedback.text}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {account.credits < totalCost ? (
            <button
              type="button"
              onClick={onNavigateToTopUp}
              className="flex-1 py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>
                {isTh
                  ? `เครดิตไม่พอ (ขาด ${(totalCost - account.credits).toLocaleString()} Cr) → ไปหน้าเติมเงิน`
                  : `Insufficient Credits (Need ${(totalCost - account.credits).toLocaleString()} more) → Top Up`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handlePurchase}
              className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-[0.99]"
            >
              <Crown className="w-4 h-4 fill-zinc-950" />
              <span>
                {isVipActive
                  ? isTh
                    ? `ยืนยันต่ออายุ VIP +${selectedMonths * 30} วัน (${totalCost.toLocaleString()} Credits)`
                    : `Extend VIP for +${selectedMonths * 30} Days (${totalCost.toLocaleString()} Credits)`
                  : isTh
                  ? `ยืนยันสมัคร VIP ${selectedMonths * 30} วัน (${totalCost.toLocaleString()} Credits)`
                  : `Confirm Buy VIP ${selectedMonths * 30} Days (${totalCost.toLocaleString()} Credits)`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Technical OpenMU-Origins / PostgreSQL Architecture Accordion */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowTechnicalDetails(!showTechnicalDetails);
            }
          }}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
            <Database className="w-4 h-4 text-amber-400" />
            <span>
              {isTh
                ? 'คำสั่ง SQL เชื่อมต่อฐานข้อมูล OpenMU-Origins (PostgreSQL VIP Table)'
                : 'OpenMU-Origins & PostgreSQL VIP System Architecture'}
            </span>
          </div>
          <span className="text-[11px] text-amber-400 hover:underline">
            {showTechnicalDetails ? (isTh ? 'ซ่อนคำสั่ง' : 'Hide') : (isTh ? 'แสดงคำสั่ง SQL' : 'Show SQL')}
          </span>
        </div>

        {showTechnicalDetails && (
          <div className="space-y-3 pt-2 text-xs border-t border-zinc-800/80">
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              {isTh
                ? 'เมื่อผู้เล่นสั่งซื้อ VIP ใน WebShop ระบบจะทำการตัด Credits ในตารางเว็บช็อป และอัปเดตสถานะวันหมดอายุ VIP ในฐานข้อมูล OpenMU อัตโนมัติ โดย GameServer ของ OpenMU จะอ่าน Sub-Server 2 และปรับ EXP Multiplier = 1.30 (+30%) และ DropRate = 1.50 (+20%) ทันที:'
                : 'When VIP is purchased, WebShop updates the PostgreSQL OpenMU database and grants access to Sub-Server 2 with +30% EXP and +20% Drop rates:'}
            </p>

            {/* SQL Snippet */}
            <div className="rounded-lg bg-zinc-950 p-3 font-mono text-[11px] text-zinc-300 border border-zinc-800 overflow-x-auto">
              <div className="text-zinc-500 mb-1">
                -- 1. OpenMU PostgreSQL Account VIP Update
              </div>
              <div>
                <span className="text-amber-400 font-bold">UPDATE</span>{' '}
                <span className="text-sky-300">data."Account"</span>
              </div>
              <div className="pl-4">
                <span className="text-amber-400 font-bold">SET</span>{' '}
                <span className="text-emerald-300">"VipExpiry"</span> ={' '}
                <span className="text-amber-300">
                  &apos;{projectedExpiry.toISOString().slice(0, 19).replace('T', ' ')}&apos;::timestamp
                </span>
                ,
              </div>
              <div className="pl-8">
                <span className="text-emerald-300">"VipType"</span> = <span className="text-purple-300">1</span>
              </div>
              <div>
                <span className="text-amber-400 font-bold">WHERE</span>{' '}
                <span className="text-emerald-300">"LoginName"</span> ={' '}
                <span className="text-amber-300">&apos;{account.username}&apos;</span>;
              </div>
            </div>

            {/* GameServer Config snippet */}
            <div className="rounded-lg bg-zinc-950 p-3 font-mono text-[11px] text-zinc-300 border border-zinc-800 overflow-x-auto">
              <div className="text-zinc-500 mb-1">
                -- 2. OpenMU GameServer Configuration (Sub-Server 2 VIP Room)
              </div>
              <pre className="text-zinc-300 text-[10.5px]">
{`{
  "ServerId": 2,
  "Description": "Continent of Lorencia [VIP Room 2]",
  "IsVipOnly": true,
  "ExpMultiplier": 1.30,       // Base 100x -> VIP 130x (+30% EXP)
  "DropRateMultiplier": 1.50,  // Base 40% -> VIP 60% (+20% Drop)
  "AllowedVipTypes": [1]
}`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
