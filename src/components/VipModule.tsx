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
  ArrowRight,
  Server,
  Layers,
} from 'lucide-react';
import { AccountData, LanguageCode } from '../types/webshop';
import { L } from '../translations';

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

  const VIP_COST_PER_MONTH = 800;
  const totalCost = selectedMonths * VIP_COST_PER_MONTH;

  const now = new Date();
  const currentExpiry = account.vipUntil ? new Date(account.vipUntil) : null;
  const isVipActive = !!(currentExpiry && currentExpiry > now);

  const baseDate = isVipActive && currentExpiry ? currentExpiry : now;
  const projectedExpiry = new Date(
    baseDate.getTime() + selectedMonths * 30 * 24 * 60 * 60 * 1000
  );

  const remainingMs =
    isVipActive && currentExpiry ? currentExpiry.getTime() - now.getTime() : 0;
  const remainingDays = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
  const remainingHours = Math.floor(
    (remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
  );

  const localeCode =
    lang === 'Thai'
      ? 'th-TH'
      : lang === 'Portuguese_BR'
      ? 'pt-BR'
      : lang === 'Russian'
      ? 'ru-RU'
      : lang === 'Spanish'
      ? 'es-ES'
      : lang === 'Bulgarian'
      ? 'bg-BG'
      : 'en-US';

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
                {L(lang, {
                  en: 'Mu Origins VIP Membership & Sub-Server',
                  th: 'ระบบห้อง VIP & สิทธิพิเศษ Mu Origins',
                  pt: 'Sistema de Sala VIP & Benefícios Mu Origins',
                  ru: 'VIP Система и VIP Сервер Mu Origins',
                  es: 'Sistema de Sala VIP y Beneficios Mu Origins',
                  bg: 'VIP Система и VIP Зала Mu Origins',
                })}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>
                {L(lang, {
                  en: 'VIP Membership (800 Cr / Month)',
                  th: 'สมัครสมาชิก VIP (800 Cr / เดือน)',
                  pt: 'Assinatura VIP (800 Cr / mês)',
                  ru: 'Подписка VIP (800 Cr / месяц)',
                  es: 'Suscripción VIP (800 Cr / mes)',
                  bg: 'VIP Абонамент (800 Cr / месец)',
                })}
              </span>
            </h1>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              {L(lang, {
                en: 'Access the dedicated Continent of Mu Origins VIP sub-server with +30% EXP bonus and +20% Drop rate boost (Normal Room EXP 100x / Drop 40% → VIP Room EXP 130x / Drop 60%). Uncrowded farming spots!',
                th: 'เข้าสู่ห้อง VIP พิเศษเฉพาะสมาชิก Continent of Mu Origins เพิ่มค่า EXP +30% และอัตรา Drop +20% (ห้องธรรมดา EXP 100x ดรอป 40% → ห้อง VIP เป็น EXP 130x ดรอป 60%) จุดฟาร์มกว้างขวาง ไม่แออัด',
                pt: 'Acesse a sala VIP exclusiva de Continent of Mu Origins com bônus de EXP +30% e taxa de Drop +20% (Sala normal EXP 100x / Drop 40% → Sala VIP EXP 130x / Drop 60%). Spawns livres e sem aglomeração.',
                ru: 'Доступ на выделенный VIP сервер Continent of Mu Origins с бонусом к Опыту +30% и шансу Дропа +20% (Обычный EXP 100x / Дроп 40% → VIP EXP 130x / Дроп 60%). Свободные споты!',
                es: 'Accede a la sala VIP exclusiva de Continent of Mu Origins con bono de EXP +30% y tasa de Drop +20% (Sala normal EXP 100x / Drop 40% → Sala VIP EXP 130x / Drop 60%). Spawns libres y amplios.',
                bg: 'Достъп до ексклузивна VIP зала на Continent of Mu Origins с бонус към EXP +30% и Drop +20% (Обикновена EXP 100x / Drop 40% → VIP EXP 130x / Drop 60%).',
              })}
            </p>
          </div>

          {/* Account status box */}
          <div className="flex flex-col sm:items-end justify-center bg-zinc-900/90 border border-zinc-800 p-3.5 rounded-lg min-w-[220px]">
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
              {L(lang, {
                en: 'Your VIP Status',
                th: 'สถานะ VIP บัญชีของคุณ',
                pt: 'Status VIP da Conta',
                ru: 'Статус VIP аккаунта',
                es: 'Estado VIP de la Cuenta',
                bg: 'VIP Статус на Акаунта',
              })}
            </span>
            {isVipActive ? (
              <div className="space-y-1 sm:text-right mt-1">
                <div className="inline-flex items-center gap-1.5 text-amber-300 font-bold text-sm bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>
                    {L(lang, {
                      en: 'VIP Active',
                      th: 'สมาชิก VIP ใช้งานอยู่',
                      pt: 'VIP Ativo',
                      ru: 'VIP Активен',
                      es: 'VIP Activo',
                      bg: 'VIP Активен',
                    })}
                  </span>
                </div>
                <div className="text-xs text-emerald-400 font-mono-tabular font-semibold">
                  {remainingDays}{' '}
                  {L(lang, {
                    en: 'days',
                    th: 'วัน',
                    pt: 'dias',
                    ru: 'дн.',
                    es: 'días',
                    bg: 'дни',
                  })}{' '}
                  {remainingHours}{' '}
                  {L(lang, {
                    en: 'hrs',
                    th: 'ชม.',
                    pt: 'h',
                    ru: 'ч.',
                    es: 'h',
                    bg: 'ч.',
                  })}
                </div>
                <div className="text-[10px] text-zinc-400">
                  {L(lang, {
                    en: 'Expires: ',
                    th: 'หมดอายุ: ',
                    pt: 'Expira em: ',
                    ru: 'Истекает: ',
                    es: 'Vence: ',
                    bg: 'Изтича: ',
                  })}
                  {currentExpiry?.toLocaleDateString(localeCode)}
                </div>
              </div>
            ) : (
              <div className="space-y-1 sm:text-right mt-1">
                <span className="inline-block px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-xs font-semibold">
                  {L(lang, {
                    en: 'Non-VIP Account',
                    th: 'ยังไม่ได้เป็นสมาชิก VIP',
                    pt: 'Conta Não-VIP',
                    ru: 'Нет VIP подписки',
                    es: 'Cuenta Sin VIP',
                    bg: 'Няма VIP абонамент',
                  })}
                </span>
                <p className="text-[10px] text-zinc-400">
                  {L(lang, {
                    en: 'Normal Room access only',
                    th: 'เข้าได้เฉพาะห้องธรรมดา',
                    pt: 'Acesso apenas à Sala Normal',
                    ru: 'Доступ только на обычный сервер',
                    es: 'Acceso solo a Sala Normal',
                    bg: 'Достъп само до обикновена зала',
                  })}
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
                  {L(lang, {
                    en: 'Normal Room (Sub-Server 1)',
                    th: 'ห้องธรรมดา (Sub-Server 1)',
                    pt: 'Sala Normal (Sub-Server 1)',
                    ru: 'Обычный сервер (Sub-Server 1)',
                    es: 'Sala Normal (Sub-Servidor 1)',
                    bg: 'Обикновена Зала (Сървър 1)',
                  })}
                </h3>
                <p className="text-xs text-zinc-400">
                  {L(lang, {
                    en: 'Public access for all players',
                    th: 'สำหรับผู้เล่นทั่วไปทุกคน',
                    pt: 'Acesso público para todos os jogadores',
                    ru: 'Общий доступ для всех игроков',
                    es: 'Acceso público para todos los jugadores',
                    bg: 'Общ достъп за всички играчи',
                  })}
                </p>
              </div>
            </div>
            <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs font-mono-tabular">
              {L(lang, {
                en: 'Free',
                th: 'ฟรี',
                pt: 'Grátis',
                ru: 'Бесплатно',
                es: 'Gratis',
                bg: 'Безплатно',
              })}
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-zinc-400" />
                {L(lang, {
                  en: 'EXP Multiplier',
                  th: 'อัตราค่า EXP คูณ',
                  pt: 'Multiplicador de EXP',
                  ru: 'Рейт опыта (EXP)',
                  es: 'Multiplicador de EXP',
                  bg: 'Множител на EXP',
                })}
              </span>
              <span className="text-sm font-bold text-zinc-200 font-mono-tabular">
                100x
              </span>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-zinc-400" />
                {L(lang, {
                  en: 'Item Drop Rate',
                  th: 'อัตราการดรอปไอเทม',
                  pt: 'Taxa de Drop de Itens',
                  ru: 'Шанс выпадения предметов',
                  es: 'Tasa de Drop de Ítems',
                  bg: 'Шанс за падане на предмети',
                })}
              </span>
              <span className="text-sm font-bold text-zinc-200 font-mono-tabular">
                40%
              </span>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-zinc-400" />
                {L(lang, {
                  en: 'Spot Crowding',
                  th: 'ความหนาแน่นจุดฟาร์ม',
                  pt: 'Lotação dos Spots',
                  ru: 'Загруженность спотов',
                  es: 'Ocupación de Spots',
                  bg: 'Натовареност на спотовете',
                })}
              </span>
              <span className="text-xs text-rose-400 font-medium">
                {L(lang, {
                  en: 'High (Contested spots)',
                  th: 'แออัดสูง (แข่งขันแย่งจุดฟาร์ม)',
                  pt: 'Alta (Spots disputados)',
                  ru: 'Высокая (конкуренция за споты)',
                  es: 'Alta (Spots disputados)',
                  bg: 'Висока (оспорвани спотове)',
                })}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-zinc-400" />
                {L(lang, {
                  en: 'VIP Room Access',
                  th: 'สิทธิ์เข้าห้องพิเศษ VIP',
                  pt: 'Acesso à Sala VIP',
                  ru: 'Доступ на VIP сервер',
                  es: 'Acceso a Sala VIP',
                  bg: 'Достъп до VIP Зала',
                })}
              </span>
              <span className="text-xs text-zinc-500">
                {L(lang, {
                  en: 'Locked',
                  th: 'ไม่สามารถเข้าได้',
                  pt: 'Bloqueado',
                  ru: 'Закрыто',
                  es: 'Bloqueado',
                  bg: 'Заключено',
                })}
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
                    {L(lang, {
                      en: 'VIP Room (Sub-Server 2)',
                      th: 'ห้อง VIP (Sub-Server 2)',
                      pt: 'Sala VIP (Sub-Server 2)',
                      ru: 'VIP Сервер (Sub-Server 2)',
                      es: 'Sala VIP (Sub-Servidor 2)',
                      bg: 'VIP Зала (Сървър 2)',
                    })}
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
                <p className="text-xs text-amber-400/80">
                  {L(lang, {
                    en: 'Continent of Mu Origins [VIP Room 2]',
                    th: 'สิทธิพิเศษเฉพาะสมาชิก VIP Continent of Mu Origins',
                    pt: 'Exclusivo para membros VIP Mu Origins',
                    ru: 'Эксклюзивно для VIP участников Mu Origins',
                    es: 'Exclusivo para miembros VIP Mu Origins',
                    bg: 'Ексклузивно за VIP членове на Mu Origins',
                  })}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-amber-500 text-zinc-950 text-xs font-bold font-mono-tabular">
              800 Cr /{' '}
              {L(lang, {
                en: 'Mo',
                th: 'เดือน',
                pt: 'mês',
                ru: 'мес',
                es: 'mes',
                bg: 'месец',
              })}
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs text-amber-200 flex items-center gap-2 font-medium">
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  {L(lang, {
                    en: 'EXP Multiplier',
                    th: 'อัตราค่า EXP คูณ',
                    pt: 'Multiplicador de EXP',
                    ru: 'Рейт опыта (EXP)',
                    es: 'Multiplicador de EXP',
                    bg: 'Множител на EXP',
                  })}
                </span>
                <span className="text-[10px] text-amber-400/80 block">
                  {L(lang, {
                    en: '+30% Faster Leveling',
                    th: 'เก็บเลเวลเร็วขึ้น 1.3 เท่า (+30%)',
                    pt: 'Evolução +30% mais rápida',
                    ru: 'Прокачка быстрее на +30%',
                    es: 'Subida de nivel +30% más rápida',
                    bg: '+30% по-бързо вдигане на ниво',
                  })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-amber-300 font-mono-tabular">
                  130x
                </span>
                <span className="block text-[10px] font-bold text-emerald-400">
                  +30%
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs text-amber-200 flex items-center gap-2 font-medium">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  {L(lang, {
                    en: 'Item Drop Rate',
                    th: 'อัตราการดรอปไอเทม',
                    pt: 'Taxa de Drop de Itens',
                    ru: 'Шанс выпадения предметов',
                    es: 'Tasa de Drop de Ítems',
                    bg: 'Шанс за падане на предмети',
                  })}
                </span>
                <span className="text-[10px] text-amber-400/80 block">
                  {L(lang, {
                    en: '+20% Higher Item & Jewel Drops',
                    th: 'ดรอปเพชร, Ancient และไอเทมดีขึ้น (+20%)',
                    pt: '+20% de chance de Joias e Itens',
                    ru: '+20% к выпадению камней и вещей',
                    es: '+20% en caída de Joyas e Ítems',
                    bg: '+20% повече Камъни и Предмети',
                  })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-emerald-400 font-mono-tabular">
                  60%
                </span>
                <span className="block text-[10px] font-bold text-emerald-400">
                  +20%
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                {L(lang, {
                  en: 'Spot Crowding',
                  th: 'ความหนาแน่นจุดฟาร์ม',
                  pt: 'Lotação dos Spots',
                  ru: 'Загруженность спотов',
                  es: 'Ocupación de Spots',
                  bg: 'Натовареност на спотовете',
                })}
              </span>
              <span className="text-xs text-emerald-400 font-medium">
                {L(lang, {
                  en: 'Uncrowded, spacious spots',
                  th: 'จุดฟาร์มกว้างขวาง ไม่แออัด',
                  pt: 'Spots amplos e tranquilos',
                  ru: 'Свободные просторные споты',
                  es: 'Spots amplios y despejados',
                  bg: 'Свободни и просторни спотове',
                })}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                {L(lang, {
                  en: 'In-Game VIP Tag',
                  th: 'ฉายาพิเศษในเกม',
                  pt: 'Tag VIP no Jogo',
                  ru: 'Префикс VIP в игре',
                  es: 'Etiqueta VIP en el Juego',
                  bg: 'VIP Префикс в Играта',
                })}
              </span>
              <span className="text-xs text-amber-300 font-bold font-mono-tabular">
                [VIP]
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
                  ? L(lang, {
                      en: 'Extend VIP Subscription',
                      th: 'ต่ออายุสมาชิก VIP',
                      pt: 'Estender Assinatura VIP',
                      ru: 'Продлить VIP подписку',
                      es: 'Extender Suscripción VIP',
                      bg: 'Удължи VIP Абонамента',
                    })
                  : L(lang, {
                      en: 'Select VIP Duration',
                      th: 'เลือกแพ็กเกจระยะเวลา VIP',
                      pt: 'Escolha o Período VIP',
                      ru: 'Выберите период подписки',
                      es: 'Selecciona el Período VIP',
                      bg: 'Изберете VIP Период',
                    })}
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {L(lang, {
                en: 'Rate: 800 Credits per month (30 days). Extra duration stacks onto any active VIP time.',
                th: 'ค่าบริการ 800 Credits ต่อเดือน (30 วัน) เวลาจะสะสมต่อเนื่องจากวันหมดอายุเดิมอัตโนมัติ',
                pt: 'Taxa: 800 Créditos por mês (30 dias). O tempo adicional acumula na validade atual.',
                ru: 'Тариф: 800 кредитов в месяц (30 дней). Дополнительное время суммируется с текущим.',
                es: 'Tarifa: 800 Créditos por mes (30 días). El tiempo adicional se acumula a tu vigencia actual.',
                bg: 'Цена: 800 Кредита на месец (30 дни). Допълнителното време се натрупва към текущото.',
              })}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-400">
              {L(lang, {
                en: 'Your Credits:',
                th: 'เครดิตของคุณ:',
                pt: 'Seus Créditos:',
                ru: 'Ваши кредиты:',
                es: 'Tus Créditos:',
                bg: 'Вашите Кредити:',
              })}
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
                {L(lang, {
                  en: '+ Top Up',
                  th: '+ เติมเครดิต',
                  pt: '+ Recarregar',
                  ru: '+ Пополнить',
                  es: '+ Recargar',
                  bg: '+ Зареди',
                })}
              </button>
            )}
          </div>
        </div>

        {/* Plan selection buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { months: 1, days: 30, cost: 800, popular: false },
            { months: 2, days: 60, cost: 1600, popular: false },
            { months: 3, days: 90, cost: 2400, popular: true },
            { months: 6, days: 180, cost: 4800, popular: false },
          ].map((plan) => {
            const isSelected = selectedMonths === plan.months;
            const planLabel = L(lang, {
              en: `${plan.months} ${plan.months === 1 ? 'Month' : 'Months'} (${plan.days} Days)`,
              th: `${plan.months} เดือน (${plan.days} วัน)`,
              pt: `${plan.months} ${plan.months === 1 ? 'Mês' : 'Meses'} (${plan.days} Dias)`,
              ru: `${plan.months} мес. (${plan.days} дн.)`,
              es: `${plan.months} ${plan.months === 1 ? 'Mes' : 'Meses'} (${plan.days} Días)`,
              bg: `${plan.months} мес. (${plan.days} дни)`,
            });

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
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 text-[10px] font-black uppercase tracking-wider shadow">
                    {L(lang, {
                      en: 'Popular',
                      th: 'ยอดนิยม',
                      pt: 'Popular',
                      ru: 'Популярный',
                      es: 'Popular',
                      bg: 'Популярен',
                    })}
                  </span>
                )}
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-zinc-300">
                    {planLabel}
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
                  800 Cr /{' '}
                  {L(lang, {
                    en: 'mo',
                    th: 'เดือน',
                    pt: 'mês',
                    ru: 'мес',
                    es: 'mes',
                    bg: 'месец',
                  })}
                </span>
              </button>
            );
          })}
        </div>

        {/* Calculation Summary Card */}
        <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
          <div className="flex justify-between items-center text-zinc-300">
            <span>
              {L(lang, {
                en: 'Selected Duration:',
                th: 'ระยะเวลาที่เลือก:',
                pt: 'Duração Selecionada:',
                ru: 'Выбранный срок:',
                es: 'Duración Seleccionada:',
                bg: 'Избран Период:',
              })}
            </span>
            <span className="font-semibold text-white">
              {L(lang, {
                en: `${selectedMonths} month(s) (${selectedMonths * 30} days)`,
                th: `${selectedMonths} เดือน (${selectedMonths * 30} วัน)`,
                pt: `${selectedMonths} mês(es) (${selectedMonths * 30} dias)`,
                ru: `${selectedMonths} мес. (${selectedMonths * 30} дн.)`,
                es: `${selectedMonths} mes(es) (${selectedMonths * 30} días)`,
                bg: `${selectedMonths} мес. (${selectedMonths * 30} дни)`,
              })}
            </span>
          </div>
          <div className="flex justify-between items-center text-zinc-300">
            <span>
              {L(lang, {
                en: 'Total Cost:',
                th: 'ค่าบริการที่ต้องชำระ:',
                pt: 'Custo Total:',
                ru: 'Итоговая стоимость:',
                es: 'Costo Total:',
                bg: 'Обща Цена:',
              })}
            </span>
            <span className="font-bold text-amber-400 font-mono-tabular">
              {totalCost.toLocaleString()} Credits
            </span>
          </div>
          <div className="flex justify-between items-center text-zinc-300">
            <span>
              {L(lang, {
                en: 'Balance After Purchase:',
                th: 'เครดิตคงเหลือหลังทำรายการ:',
                pt: 'Saldo Após a Compra:',
                ru: 'Остаток после покупки:',
                es: 'Saldo Después de la Compra:',
                bg: 'Остатък след Покупката:',
              })}
            </span>
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
              {L(lang, {
                en: 'VIP Expiration Date:',
                th: 'วันหมดอายุ VIP ที่จะได้รับ:',
                pt: 'Nova Data de Expiração VIP:',
                ru: 'Дата окончания VIP:',
                es: 'Nueva Fecha de Expiración VIP:',
                bg: 'Нова Дата на Изтичане на VIP:',
              })}
            </span>
            <span className="font-mono-tabular text-amber-300 font-semibold">
              {projectedExpiry.toLocaleString(localeCode)}
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
              <p className="font-semibold">
                {feedback.ok
                  ? L(lang, {
                      en: 'Success',
                      th: 'ทำรายการสำเร็จ',
                      pt: 'Sucesso',
                      ru: 'Успешно',
                      es: 'Éxito',
                      bg: 'Успешно',
                    })
                  : L(lang, {
                      en: 'Notice',
                      th: 'ไม่สามารถทำรายการได้',
                      pt: 'Aviso',
                      ru: 'Ошибка',
                      es: 'Aviso',
                      bg: 'Грешка',
                    })}
              </p>
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
                {L(lang, {
                  en: `Insufficient Credits (Need ${(totalCost - account.credits).toLocaleString()} more) → Top Up`,
                  th: `เครดิตไม่พอ (ขาดอีก ${(totalCost - account.credits).toLocaleString()} Cr) → ไปหน้าเติมเครดิต`,
                  pt: `Créditos Insuficientes (Faltam ${(totalCost - account.credits).toLocaleString()} Cr) → Recarregar`,
                  ru: `Недостаточно кредитов (не хватает ${(totalCost - account.credits).toLocaleString()} Cr) → Пополнить`,
                  es: `Créditos Insuficientes (Faltan ${(totalCost - account.credits).toLocaleString()} Cr) → Recargar`,
                  bg: `Недостатъчно Кредити (Нужни са още ${(totalCost - account.credits).toLocaleString()} Cr) → Зареди`,
                })}
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
                  ? L(lang, {
                      en: `Extend VIP +${selectedMonths * 30} Days (${totalCost.toLocaleString()} Credits)`,
                      th: `ยืนยันต่ออายุ VIP +${selectedMonths * 30} วัน (${totalCost.toLocaleString()} Credits)`,
                      pt: `Estender VIP +${selectedMonths * 30} Dias (${totalCost.toLocaleString()} Créditos)`,
                      ru: `Продлить VIP +${selectedMonths * 30} дн. (${totalCost.toLocaleString()} кредитов)`,
                      es: `Extender VIP +${selectedMonths * 30} Días (${totalCost.toLocaleString()} Créditos)`,
                      bg: `Удължи VIP +${selectedMonths * 30} Дни (${totalCost.toLocaleString()} Кредита)`,
                    })
                  : L(lang, {
                      en: `Confirm VIP ${selectedMonths * 30} Days (${totalCost.toLocaleString()} Credits)`,
                      th: `ยืนยันสมัคร VIP ${selectedMonths * 30} วัน (${totalCost.toLocaleString()} Credits)`,
                      pt: `Confirmar VIP ${selectedMonths * 30} Dias (${totalCost.toLocaleString()} Créditos)`,
                      ru: `Подтвердить VIP ${selectedMonths * 30} дн. (${totalCost.toLocaleString()} кредитов)`,
                      es: `Confirmar VIP ${selectedMonths * 30} Días (${totalCost.toLocaleString()} Créditos)`,
                      bg: `Потвърди VIP ${selectedMonths * 30} Дни (${totalCost.toLocaleString()} Кредита)`,
                    })}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
