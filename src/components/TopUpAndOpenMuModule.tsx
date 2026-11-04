import React, { useEffect, useState } from 'react';
import {
  AccountData,
  LanguageCode,
  PayPalPromoPackage,
  PromotionConfig,
  TrueMoneyPromoTier,
} from '../types/webshop';
import { L } from '../translations';
import {
  AlertTriangle,
  CheckCircle2,
  Coins,
  CreditCard,
  ExternalLink,
  History,
  QrCode,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
} from 'lucide-react';

export interface OpenMuCoinGrantRecord {
  id: string;
  accountLoginName: string;
  coinType: 'WCoinC' | 'WCoinP' | 'GoblinPoints';
  amount: number;
  creditsAdded: number;
  reason: string;
  reference: string;
  clientName: string;
  createdAt: string;
  status: 'Created' | 'AlreadyGranted';
}

type PayPalPackage = PayPalPromoPackage & {
  baseCredits?: number;
  baseWCoinC?: number;
};

type TrueMoneyTier = TrueMoneyPromoTier & {
  baseCredits?: number;
  baseWCoinC?: number;
};

interface TopUpAndOpenMuModuleProps {
  account: AccountData;
  wCoinCBalance: number;
  lang?: LanguageCode;
  onCreditsGranted: (
    creditsAdded: number,
    wCoinCAdded: number,
    logDetail: string
  ) => void;
  onManagePromotions?: () => void;
  initialTab?: 'truemoney' | 'paypal' | 'history';
}

const DEFAULT_PAYPAL_PACKAGES: PayPalPackage[] = [
  {
    code: 'PKG_50',
    name: 'Egis Explorer Pack',
    nameTh: 'แพ็กเกจนักผจญภัย Egis',
    priceUsd: 1.43,
    priceThb: 50,
    bonusPercent: 0,
    credits: 500,
    wCoinC: 100,
    bonusTag: 'Standard Rate',
    bonusTagTh: 'เรทมาตรฐาน',
    enabled: true,
  },
  {
    code: 'PKG_100',
    name: 'Egis Starter Pack',
    nameTh: 'แพ็กเกจผู้เริ่มต้น Egis',
    priceUsd: 2.86,
    priceThb: 100,
    bonusPercent: 5,
    credits: 1050,
    wCoinC: 210,
    bonusTag: '+5% Bonus',
    bonusTagTh: 'โบนัส +5%',
    enabled: true,
  },
  {
    code: 'PKG_150',
    name: 'Lorencia Vanguard Pack',
    nameTh: 'แพ็กเกจแนวหน้า Lorencia',
    priceUsd: 4.29,
    priceThb: 150,
    bonusPercent: 10,
    credits: 1650,
    wCoinC: 330,
    bonusTag: '+10% Bonus',
    bonusTagTh: 'โบนัส +10%',
    enabled: true,
  },
  {
    code: 'PKG_300',
    name: 'Blade Knight Treasury',
    nameTh: 'แพ็กเกจขุนพล Blade Knight',
    priceUsd: 8.57,
    priceThb: 300,
    bonusPercent: 15,
    credits: 3450,
    wCoinC: 690,
    bonusTag: '+15% Bonus',
    bonusTagTh: 'โบนัส +15%',
    enabled: true,
  },
  {
    code: 'PKG_500',
    name: 'Icarus Sky Sovereign',
    nameTh: 'แพ็กเกจเจ้าเวหา Icarus',
    priceUsd: 14.29,
    priceThb: 500,
    bonusPercent: 20,
    credits: 6000,
    wCoinC: 1200,
    bonusTag: 'Popular · +20% Bonus',
    bonusTagTh: 'ยอดนิยม · โบนัส +20%',
    enabled: true,
  },
  {
    code: 'PKG_1000',
    name: 'Kundun Conqueror Chest',
    nameTh: 'แพ็กเกจผู้พิชิต Kundun',
    priceUsd: 28.57,
    priceThb: 1000,
    bonusPercent: 30,
    credits: 13000,
    wCoinC: 2600,
    bonusTag: 'Best Value · +30% Bonus',
    bonusTagTh: 'คุ้มค่าสูงสุด · โบนัส +30%',
    enabled: true,
  },
];

const DEFAULT_TRUEMONEY_TIERS: TrueMoneyTier[] = [
  {
    amountThb: 50,
    bonusPercent: 0,
    credits: 500,
    wCoinC: 100,
    bonusText: 'เรทมาตรฐาน',
    bonusTextEn: 'Standard Rate',
    enabled: true,
  },
  {
    amountThb: 100,
    bonusPercent: 5,
    credits: 1050,
    wCoinC: 210,
    bonusText: 'โบนัส +5%',
    bonusTextEn: '+5% Bonus',
    enabled: true,
  },
  {
    amountThb: 150,
    bonusPercent: 10,
    credits: 1650,
    wCoinC: 330,
    bonusText: 'โบนัส +10%',
    bonusTextEn: '+10% Bonus',
    enabled: true,
  },
  {
    amountThb: 300,
    bonusPercent: 15,
    credits: 3450,
    wCoinC: 690,
    bonusText: 'โบนัส +15%',
    bonusTextEn: '+15% Bonus',
    enabled: true,
  },
  {
    amountThb: 500,
    bonusPercent: 20,
    credits: 6000,
    wCoinC: 1200,
    bonusText: 'ยอดนิยม · โบนัส +20%',
    bonusTextEn: 'Popular · +20% Bonus',
    enabled: true,
  },
  {
    amountThb: 1000,
    bonusPercent: 30,
    credits: 13000,
    wCoinC: 2600,
    bonusText: 'คุ้มค่าสูงสุด · โบนัส +30%',
    bonusTextEn: 'Best Value · +30% Bonus',
    enabled: true,
  },
];

export const TopUpAndOpenMuModule: React.FC<TopUpAndOpenMuModuleProps> = ({
  account,
  wCoinCBalance,
  lang = 'Thai',
  onCreditsGranted,
  onManagePromotions,
  initialTab = 'truemoney',
}) => {
  const [activeTab, setActiveTab] = useState<'truemoney' | 'paypal' | 'history'>(
    initialTab
  );

  const [tmMethod, setTmMethod] = useState<'angpao' | 'cashcard' | 'promptpay'>(
    'angpao'
  );
  const [selectedThb, setSelectedThb] = useState<number>(300);
  const [voucherInput, setVoucherInput] = useState<string>('');
  const [merchantPhone, setMerchantPhone] = useState<string>('');
  const [isSubmittingTm, setIsSubmittingTm] = useState(false);

  const [promoConfig, setPromoConfig] = useState<PromotionConfig | null>(null);
  const [packages, setPackages] = useState<PayPalPackage[]>(
    DEFAULT_PAYPAL_PACKAGES
  );
  const [tmTiers, setTmTiers] = useState<TrueMoneyTier[]>(
    DEFAULT_TRUEMONEY_TIERS
  );
  const [activePayPalOrder, setActivePayPalOrder] = useState<{
    orderToken: string;
    pkg: PayPalPackage;
  } | null>(null);
  const [payerEmail, setPayerEmail] = useState<string>('');
  const [isCapturingPayPal, setIsCapturingPayPal] = useState(false);

  const [grants, setGrants] = useState<OpenMuCoinGrantRecord[]>([]);
  const [banner, setBanner] = useState<{
    ok: boolean;
    message: string;
    reference?: string;
  } | null>(null);

  const fetchStatusAndGrants = async () => {
    try {
      const res = await fetch('/api/openmu/status');
      if (res.ok) {
        const data = await res.json();
        if (data.promotionConfig) {
          setPromoConfig(data.promotionConfig);
        }
        if (Array.isArray(data.packages) && data.packages.length > 0) {
          setPackages(data.packages);
        }
        if (Array.isArray(data.trueMoneyTiers) && data.trueMoneyTiers.length > 0) {
          setTmTiers(data.trueMoneyTiers);
          if (
            !data.trueMoneyTiers.some(
              (t: TrueMoneyTier) => t.amountThb === selectedThb
            )
          ) {
            setSelectedThb(data.trueMoneyTiers[0].amountThb);
          }
        }
        if (Array.isArray(data.recentGrants)) {
          setGrants(
            data.recentGrants.filter(
              (g: OpenMuCoinGrantRecord) =>
                account.isAdmin ||
                g.accountLoginName.toLowerCase() === account.username.toLowerCase()
            )
          );
        }
        if (typeof data.merchantPhone === 'string') {
          setMerchantPhone(data.merchantPhone);
        }
      }
    } catch {
      // keep existing state
    }
  };

  useEffect(() => {
    fetchStatusAndGrants();
  }, [account.username]);

  const handleTrueMoneySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tmMethod !== 'promptpay' && !voucherInput.trim()) {
      setBanner({
        ok: false,
        message: L(lang, {
          en: 'Please enter a valid TrueMoney voucher link or 14-digit PIN.',
          th: 'กรุณากรอกลิงก์ซองของขวัญ TrueMoney หรือรหัสบัตรเงินสด 14 หลัก',
          pt: 'Insira um link de voucher TrueMoney válido ou PIN de 14 dígitos.',
          ru: 'Введите ссылку на ваучер TrueMoney или 14-значный PIN-код.',
          es: 'Ingresa un enlace de cupón TrueMoney válido o PIN de 14 dígitos.',
          bg: 'Въведете валиден линк за ваучер TrueMoney или 14-цифрен PIN.',
        }),
      });
      return;
    }

    setIsSubmittingTm(true);
    setBanner(null);

    try {
      const res = await fetch('/api/payments/truemoney/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginName: account.username,
          method: tmMethod,
          voucherUrlOrPin: voucherInput.trim(),
          selectedTierThb: selectedThb,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setBanner({
          ok: false,
          message:
            data.message ||
            L(lang, {
              en: 'TrueMoney verification failed. Please check your voucher or PIN.',
              th: 'ไม่สามารถตรวจสอบรายการ TrueMoney ได้ กรุณาตรวจสอบข้อมูลอีกครั้ง',
              pt: 'Falha na verificação TrueMoney. Verifique o código informado.',
              ru: 'Ошибка проверки TrueMoney. Проверьте введённый код.',
              es: 'Error al verificar TrueMoney. Revisa los datos ingresados.',
              bg: 'Грешка при проверка на TrueMoney. Проверете въведения код.',
            }),
        });
      } else {
        setBanner({
          ok: true,
          message: data.message,
          reference: data.grant?.reference,
        });
        setVoucherInput('');
        onCreditsGranted(
          data.creditsAdded,
          data.wCoinCAdded,
          `TrueMoney Top-Up (${selectedThb} THB) -> +${data.creditsAdded} Credits & +${data.wCoinCAdded} WCoinC [Ref: ${data.grant?.reference}]`
        );
        await fetchStatusAndGrants();
      }
    } catch {
      setBanner({
        ok: false,
        message: L(lang, {
          en: 'Payment gateway could not be reached. Please try again.',
          th: 'ไม่สามารถติดต่อระบบชำระเงินได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
          pt: 'Não foi possível conectar ao gateway de pagamento. Tente novamente.',
          ru: 'Не удалось связаться с платёжным шлюзом. Попробуйте позже.',
          es: 'No se pudo conectar con la pasarela de pago. Inténtalo de nuevo.',
          bg: 'Няма връзка с платежната система. Опитайте отново.',
        }),
      });
    } finally {
      setIsSubmittingTm(false);
    }
  };

  const handleStartPayPalCheckout = async (pkg: PayPalPackage) => {
    setBanner(null);
    try {
      const res = await fetch('/api/payments/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginName: account.username,
          packageCode: pkg.code,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setActivePayPalOrder({
          orderToken: data.orderToken,
          pkg,
        });
      } else {
        setBanner({
          ok: false,
          message:
            data.message ||
            L(lang, {
              en: 'Unable to initialize PayPal order.',
              th: 'ไม่สามารถสร้างรายการสั่งซื้อ PayPal ได้',
              pt: 'Não foi possível iniciar o pedido PayPal.',
              ru: 'Не удалось создать заказ PayPal.',
              es: 'No se pudo crear la orden de PayPal.',
              bg: 'Неуспешно създаване на PayPal поръчка.',
            }),
        });
      }
    } catch {
      setBanner({
        ok: false,
        message: L(lang, {
          en: 'Unable to reach PayPal checkout service.',
          th: 'ไม่สามารถเชื่อมต่อบริการชำระเงิน PayPal ได้',
          pt: 'Não foi possível conectar ao serviço PayPal.',
          ru: 'Сервис оплаты PayPal недоступен.',
          es: 'No se pudo conectar con el servicio de PayPal.',
          bg: 'Няма връзка с услугата на PayPal.',
        }),
      });
    }
  };

  const handleCapturePayPalOrder = async () => {
    if (!activePayPalOrder) return;
    setIsCapturingPayPal(true);

    try {
      const res = await fetch('/api/payments/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginName: account.username,
          packageCode: activePayPalOrder.pkg.code,
          orderToken: activePayPalOrder.orderToken,
          payerEmail: payerEmail.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setBanner({
          ok: true,
          message: data.message,
          reference: data.grant?.reference,
        });
        onCreditsGranted(
          data.creditsAdded,
          data.wCoinCAdded,
          `PayPal Purchase ${activePayPalOrder.pkg.code} ($${activePayPalOrder.pkg.priceUsd}) -> +${data.creditsAdded} Credits & +${data.wCoinCAdded} WCoinC [Ref: ${data.grant?.reference}]`
        );
        setActivePayPalOrder(null);
        setPayerEmail('');
        await fetchStatusAndGrants();
      } else {
        setBanner({
          ok: false,
          message:
            data.message ||
            L(lang, {
              en: 'PayPal payment capture failed.',
              th: 'การยืนยันยอดชำระ PayPal ล้มเหลว',
              pt: 'Falha ao capturar pagamento PayPal.',
              ru: 'Ошибка подтверждения платежа PayPal.',
              es: 'Error al confirmar el pago de PayPal.',
              bg: 'Грешка при потвърждаване на PayPal плащане.',
            }),
        });
      }
    } catch {
      setBanner({
        ok: false,
        message: L(lang, {
          en: 'Unable to reach payment gateway. Please try again.',
          th: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ชำระเงินได้ กรุณาลองใหม่อีกครั้ง',
          pt: 'Não foi possível conectar ao servidor de pagamento.',
          ru: 'Не удалось связаться с сервером оплаты.',
          es: 'No se pudo conectar con el servidor de pagos.',
          bg: 'Няма връзка със сървъра за плащания.',
        }),
      });
    } finally {
      setIsCapturingPayPal(false);
    }
  };

  const activeTier =
    tmTiers.find((t) => t.amountThb === selectedThb) || tmTiers[0];

  return (
    <div className="space-y-6">
      {/* Top Account Currency Header */}
      <div className="p-5 rounded border border-zinc-800 bg-zinc-900/90 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              {L(lang, {
                en: 'Donate & Top Up Center (TrueMoney Wallet & PayPal)',
                th: 'ศูนย์บริจาคและเติมเครดิต (TrueMoney Wallet & PayPal)',
                pt: 'Central de Doações & Recarga (TrueMoney & PayPal)',
                ru: 'Центр пополнения и пожертвований (TrueMoney & PayPal)',
                es: 'Centro de Donaciones y Recargas (TrueMoney y PayPal)',
                bg: 'Център за Дарения и Зареждане (TrueMoney & PayPal)',
              })}
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            {L(lang, {
              en: 'Every top-up grants WebShop Credits for website purchases and delivers WCoinC directly to your Egis-MU in-game CashShop.',
              th: 'ทุกยอดการเติมจะเพิ่มทั้ง WebShop Credits สำหรับซื้อไอเทมหน้าเว็บ และส่งเหรียญ WCoinC เข้าสู่ CashShop ในเกมโดยอัตโนมัติ',
              pt: 'Cada doação adiciona WebShop Credits para compras no site e entrega WCoinC diretamente no CashShop do jogo.',
              ru: 'Каждое пополнение начисляет WebShop Credits на сайте и автоматически отправляет WCoinC в игровой CashShop.',
              es: 'Cada recarga otorga WebShop Credits para la tienda web y envía WCoinC directamente al CashShop del juego.',
              bg: 'Всяко зареждане добавя WebShop Credits за сайта и изпраща WCoinC директно в игралния CashShop.',
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {account.isAdmin && onManagePromotions && (
            <button
              type="button"
              onClick={onManagePromotions}
              className="px-3.5 py-2.5 rounded border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-xs font-semibold text-amber-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>
                {L(lang, {
                  en: 'Manage Promotions (Admin)',
                  th: 'ตั้งค่าโปรโมชั่น (Admin)',
                })}
              </span>
            </button>
          )}

          <div className="px-4 py-2.5 rounded bg-zinc-950 border border-amber-500/40">
            <div className="text-[10px] uppercase tracking-wider text-zinc-400">
              WebShop Credits
            </div>
            <div className="text-base font-bold font-mono-tabular text-amber-400">
              {account.credits.toLocaleString()} cr
            </div>
          </div>

          <div className="px-4 py-2.5 rounded bg-zinc-950 border border-emerald-500/40">
            <div className="text-[10px] uppercase tracking-wider text-zinc-400">
              In-Game WCoinC
            </div>
            <div className="text-base font-bold font-mono-tabular text-emerald-400">
              {wCoinCBalance.toLocaleString()} WCoinC
            </div>
          </div>
        </div>
      </div>

      {/* Unified Promotion Parity Info + Active Campaign Event Banner */}
      {promoConfig?.campaignActive && promoConfig.extraBonusPercent > 0 ? (
        <div className="p-4 rounded border border-amber-500/50 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-amber-300">
                {lang === 'Thai'
                  ? promoConfig.campaignTitleTh
                  : promoConfig.campaignTitleEn}
              </div>
              <div className="text-zinc-300 mt-0.5">
                {L(lang, {
                  en: `Extra +${promoConfig.extraBonusPercent}% bonus is automatically applied to all TrueMoney Wallet & PayPal packages below!`,
                  th: `รับโบนัสพิเศษเพิ่มอีก +${promoConfig.extraBonusPercent}% ทั้งช่องทาง TrueMoney Wallet และ PayPal โดยคำนวณรวมในยอดด้านล่างเรียบร้อยแล้ว`,
                })}
              </div>
            </div>
          </div>
          <span className="font-mono-tabular font-bold text-amber-300 whitespace-nowrap shrink-0">
            +{promoConfig.extraBonusPercent}% EVENT BONUS
          </span>
        </div>
      ) : (
        <div className="px-4 py-2.5 rounded border border-zinc-800 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-300">
          <span>
            {L(lang, {
              en: 'Unified Promotion Standard: TrueMoney Wallet and PayPal receive identical bonus tiers (0% to +30%).',
              th: 'มาตรฐานโปรโมชั่นเดียวกันทั้งระบบ: เติมผ่าน TrueMoney Wallet หรือ PayPal ได้รับเรทเครดิตและโบนัสเท่ากันทุกขั้น (0% ถึง +30%)',
            })}
          </span>
          <span className="font-mono-tabular text-amber-400">
            1 THB = {promoConfig?.baseCreditsPerThb ?? 10} Cr +{' '}
            {promoConfig?.baseWCoinCPerThb ?? 2} WCoinC
          </span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded bg-zinc-900 border border-zinc-800">
        <button
          type="button"
          onClick={() => {
            setActiveTab('truemoney');
            setBanner(null);
          }}
          className={`px-4 py-2 rounded text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'truemoney'
              ? 'bg-[#ff8300] text-zinc-950 shadow-sm'
              : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          {L(lang, {
            en: '1. TrueMoney Wallet (Voucher / PIN / QR)',
            th: '1. เติมผ่าน TrueMoney Wallet (ซองอั่งเปา / บัตรเงินสด / QR)',
            pt: '1. TrueMoney Wallet (Voucher / PIN / QR)',
            ru: '1. TrueMoney Wallet (Ваучер / PIN / QR)',
            es: '1. TrueMoney Wallet (Cupón / PIN / QR)',
            bg: '1. TrueMoney Wallet (Ваучер / PIN / QR)',
          })}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('paypal');
            setBanner(null);
          }}
          className={`px-4 py-2 rounded text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'paypal'
              ? 'bg-[#0070ba] text-white shadow-sm'
              : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          {L(lang, {
            en: '2. PayPal Instant Checkout',
            th: '2. ชำระผ่าน PayPal (Instant Checkout)',
            pt: '2. Doação via PayPal (Instantâneo)',
            ru: '2. Пополнение через PayPal',
            es: '2. Pago vía PayPal (Instantáneo)',
            bg: '2. Плащане чрез PayPal',
          })}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-amber-500 text-zinc-950'
              : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          {L(lang, {
            en: `Transaction History (${grants.length})`,
            th: `ประวัติการเติมเครดิต (${grants.length})`,
            pt: `Histórico de Transações (${grants.length})`,
            ru: `История платежей (${grants.length})`,
            es: `Historial de Transacciones (${grants.length})`,
            bg: `История на Плащанията (${grants.length})`,
          })}
        </button>
      </div>

      {/* Feedback Banner */}
      {banner && (
        <div
          className={`p-4 rounded border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            banner.ok
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
              : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {banner.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{banner.message}</span>
          </div>
          {banner.reference && (
            <span className="font-mono-tabular text-[11px] px-2.5 py-1 rounded bg-zinc-950/80 border border-emerald-500/30 text-emerald-300 shrink-0">
              Ref: {banner.reference}
            </span>
          )}
        </div>
      )}

      {/* TAB 1: TRUEMONEY WALLET */}
      {activeTab === 'truemoney' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Tier Selection */}
          <div className="lg:col-span-7 p-5 rounded border border-zinc-800 bg-zinc-900/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#ff8300]" />
                <h3 className="text-sm font-bold text-white">
                  {L(lang, {
                    en: 'Step 1: Select TrueMoney Amount (THB)',
                    th: 'ขั้นตอนที่ 1: เลือกมูลค่าการเติม TrueMoney (บาท)',
                    pt: 'Passo 1: Selecione o Valor TrueMoney (THB)',
                    ru: 'Шаг 1: Выберите сумму TrueMoney (THB)',
                    es: 'Paso 1: Selecciona el Monto TrueMoney (THB)',
                    bg: 'Стъпка 1: Изберете сума TrueMoney (THB)',
                  })}
                </h3>
              </div>
              <span className="text-xs text-zinc-400 font-mono-tabular">
                1 THB = {promoConfig?.baseCreditsPerThb ?? 10} Cr (+Bonus)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {tmTiers.map((tier) => {
                const isSelected = selectedThb === tier.amountThb;
                const label =
                  lang === 'Thai'
                    ? tier.bonusText
                    : tier.bonusTextEn || tier.bonusText;
                return (
                  <button
                    key={tier.amountThb}
                    type="button"
                    onClick={() => setSelectedThb(tier.amountThb)}
                    className={`p-3.5 rounded border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-[#ff8300] bg-[#ff8300]/15 ring-1 ring-[#ff8300]'
                        : 'border-zinc-800 bg-zinc-950/70 hover:bg-zinc-800/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-base font-bold font-mono-tabular text-white">
                        ฿{tier.amountThb.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#ff9f38] font-semibold text-right">
                        {label}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 space-y-0.5">
                      <div className="text-xs font-bold font-mono-tabular text-amber-400">
                        +{tier.credits.toLocaleString()} Credits
                      </div>
                      {tier.baseCredits && tier.baseCredits < tier.credits ? (
                        <div className="text-[10px] font-mono-tabular text-zinc-500 line-through">
                          +{tier.baseCredits.toLocaleString()} Cr
                        </div>
                      ) : null}
                      <div className="text-[11px] font-mono-tabular text-emerald-400">
                        +{tier.wCoinC.toLocaleString()} WCoinC
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Method sub-selector */}
            <div className="pt-2 space-y-3">
              <div className="text-xs font-semibold text-zinc-300">
                {L(lang, {
                  en: 'Step 2: Select Payment Channel',
                  th: 'ขั้นตอนที่ 2: เลือกช่องทางชำระเงิน TrueMoney',
                  pt: 'Passo 2: Selecione o Canal TrueMoney',
                  ru: 'Шаг 2: Выберите способ оплаты TrueMoney',
                  es: 'Paso 2: Selecciona el Canal TrueMoney',
                  bg: 'Стъпка 2: Изберете метод за плащане TrueMoney',
                })}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setTmMethod('angpao');
                    setVoucherInput('');
                  }}
                  className={`p-3 rounded border text-left text-xs cursor-pointer transition-colors ${
                    tmMethod === 'angpao'
                      ? 'border-[#ff8300] bg-[#ff8300]/15 text-white font-semibold'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <div>
                    {L(lang, {
                      en: 'Gift Voucher (Angpao)',
                      th: 'ซองของขวัญ (ซองอั่งเปา)',
                      pt: 'Envelope de Presente (Angpao)',
                      ru: 'Подарочный конверт (Angpao)',
                      es: 'Sobre de Regalo (Angpao)',
                      bg: 'Подаръчен ваучер (Angpao)',
                    })}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    {L(lang, {
                      en: '0% Fee · Instant credit',
                      th: 'ฟรีค่าธรรมเนียม 0% · รับเครดิตทันที',
                      pt: 'Taxa 0% · Crédito imediato',
                      ru: 'Комиссия 0% · Мгновенно',
                      es: '0% Comisión · Acreditación inmediata',
                      bg: '0% Такса · Мигновено зареждане',
                    })}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTmMethod('cashcard');
                    setVoucherInput('');
                  }}
                  className={`p-3 rounded border text-left text-xs cursor-pointer transition-colors ${
                    tmMethod === 'cashcard'
                      ? 'border-[#ff8300] bg-[#ff8300]/15 text-white font-semibold'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <div>
                    {L(lang, {
                      en: '14-Digit Cash Card',
                      th: 'บัตรเงินสด TrueMoney 14 หลัก',
                      pt: 'Cartão Pré-Pago 14 Dígitos',
                      ru: 'Карта оплаты (14 цифр)',
                      es: 'Tarjeta Prepago 14 Dígitos',
                      bg: 'Предплатена карта (14 цифри)',
                    })}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    {L(lang, {
                      en: 'Enter 14-digit TrueMoney PIN',
                      th: 'กรอกรหัสพิน 14 หลัก',
                      pt: 'Insira o PIN de 14 dígitos',
                      ru: 'Введите 14-значный PIN-код',
                      es: 'Ingresa el PIN de 14 dígitos',
                      bg: 'Въведете 14-цифрен PIN код',
                    })}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTmMethod('promptpay')}
                  className={`p-3 rounded border text-left text-xs cursor-pointer transition-colors ${
                    tmMethod === 'promptpay'
                      ? 'border-[#ff8300] bg-[#ff8300]/15 text-white font-semibold'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <div>
                    {L(lang, {
                      en: 'TrueMoney / PromptPay QR',
                      th: 'สแกน QR TrueMoney / PromptPay',
                      pt: 'QR Code TrueMoney / PromptPay',
                      ru: 'QR-код TrueMoney / PromptPay',
                      es: 'Código QR TrueMoney / PromptPay',
                      bg: 'QR Код TrueMoney / PromptPay',
                    })}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    {L(lang, {
                      en: 'Scan with mobile banking app',
                      th: 'สแกนผ่านแอปธนาคารหรือ TrueMoney',
                      pt: 'Escaneie pelo aplicativo bancário',
                      ru: 'Сканируйте банковским приложением',
                      es: 'Escanea desde tu app bancaria',
                      bg: 'Сканирайте с банково приложение',
                    })}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Redemption Form */}
          <form
            onSubmit={handleTrueMoneySubmit}
            className="lg:col-span-5 p-5 rounded border border-zinc-800 bg-zinc-900/90 space-y-4"
          >
            <div className="pb-3 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#ff8300]">
                {tmMethod === 'angpao'
                  ? L(lang, {
                      en: 'Redeem TrueMoney Gift Voucher',
                      th: 'กรอกลิงก์ซองอั่งเปา TrueMoney Wallet',
                      pt: 'Resgatar Voucher TrueMoney',
                      ru: 'Активация ваучера TrueMoney',
                      es: 'Canjear Enlace TrueMoney',
                      bg: 'Активиране на TrueMoney ваучер',
                    })
                  : tmMethod === 'cashcard'
                  ? L(lang, {
                      en: 'Redeem 14-Digit Cash Card PIN',
                      th: 'กรอกรหัสบัตรเงินสด TrueMoney 14 หลัก',
                      pt: 'Inserir PIN de 14 Dígitos',
                      ru: 'Ввод 14-значного PIN-кода',
                      es: 'Ingresar PIN de 14 Dígitos',
                      bg: 'Въвеждане на 14-цифрен PIN',
                    })
                  : L(lang, {
                      en: 'Scan PromptPay / TrueMoney QR',
                      th: 'สแกน QR Code ชำระเงิน',
                      pt: 'Escanear QR Code TrueMoney',
                      ru: 'Оплата по QR-коду',
                      es: 'Escanear Código QR',
                      bg: 'Сканиране на QR код',
                    })}
              </h3>
              <span className="text-xs font-mono-tabular text-zinc-400">
                ID: {account.username}
              </span>
            </div>

            {tmMethod === 'angpao' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded bg-zinc-950 border border-zinc-800 space-y-1 text-zinc-300 leading-relaxed">
                  <div>
                    {L(lang, {
                      en: `1. Open TrueMoney Wallet and create a Gift Envelope for ฿${selectedThb} (1 recipient).`,
                      th: `1. เปิดแอป TrueMoney Wallet เลือกส่งซองของขวัญ ยอด ฿${selectedThb} จำนวน 1 คน`,
                      pt: `1. Abra o TrueMoney Wallet e crie um envelope de presente de ฿${selectedThb} (1 destinatário).`,
                      ru: `1. Откройте TrueMoney Wallet и создайте подарочный конверт на ฿${selectedThb} (1 получатель).`,
                      es: `1. Abre TrueMoney Wallet y crea un sobre de regalo por ฿${selectedThb} (1 destinatario).`,
                      bg: `1. Отворете TrueMoney Wallet и създайте подаръчен плик за ฿${selectedThb} (1 получател).`,
                    })}
                  </div>
                  <div>
                    {L(lang, {
                      en: '2. Copy the gift link and paste it in the field below.',
                      th: '2. คัดลอกลิงก์ซองของขวัญมาวางในช่องด้านล่างแล้วกดยืนยัน',
                      pt: '2. Copie o link gerado e cole no campo abaixo.',
                      ru: '2. Скопируйте ссылку и вставьте её в поле ниже.',
                      es: '2. Copia el enlace generado y pégalo abajo.',
                      bg: '2. Копирайте линка и го поставете в полето по-долу.',
                    })}
                    {merchantPhone ? (
                      <span className="block mt-1 text-amber-400 font-mono-tabular">
                        Merchant: {merchantPhone}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">
                    {L(lang, {
                      en: 'Voucher Link',
                      th: 'ลิงก์ซองของขวัญ (Voucher Link)',
                      pt: 'Link do Voucher',
                      ru: 'Ссылка на ваучер',
                      es: 'Enlace del Cupón',
                      bg: 'Линк към ваучера',
                    })}
                  </label>
                  <input
                    type="url"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    placeholder="https://gift.truemoney.com/campaign/?v=..."
                    required
                    className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 font-mono-tabular text-xs"
                  />
                </div>
              </div>
            )}

            {tmMethod === 'cashcard' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">
                    {L(lang, {
                      en: '14-Digit Cash Card PIN',
                      th: 'รหัสบัตรเงินสด TrueMoney (ตัวเลข 14 หลัก)',
                      pt: 'PIN de 14 Dígitos do Cartão',
                      ru: '14-значный PIN-код карты',
                      es: 'PIN de 14 Dígitos de la Tarjeta',
                      bg: '14-цифрен PIN код на картата',
                    })}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={14}
                    value={voucherInput}
                    onChange={(e) =>
                      setVoucherInput(e.target.value.replace(/\D+/g, '').slice(0, 14))
                    }
                    placeholder={L(lang, {
                      en: 'Enter 14-digit PIN',
                      th: 'กรอกตัวเลข 14 หลักบนสลิปบัตรเงินสด',
                      pt: 'Digite os 14 números do PIN',
                      ru: 'Введите 14 цифр PIN-кода',
                      es: 'Ingresa los 14 dígitos del PIN',
                      bg: 'Въведете 14-те цифри на PIN кода',
                    })}
                    required
                    className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 font-mono-tabular text-sm tracking-widest"
                  />
                </div>
              </div>
            )}

            {tmMethod === 'promptpay' && (
              <div className="p-4 rounded bg-zinc-950 border border-zinc-800 text-center space-y-2">
                <div className="w-32 h-32 mx-auto rounded bg-white p-3 flex flex-col items-center justify-center text-zinc-900">
                  <QrCode className="w-20 h-20 text-zinc-900" />
                  <span className="text-[9px] font-mono-tabular font-bold mt-1">
                    ฿{selectedThb}.00
                  </span>
                </div>
                <div className="text-xs text-zinc-300">
                  {L(lang, {
                    en: `Scan QR to pay ฿${selectedThb}`,
                    th: `สแกน QR เพื่อชำระยอด ฿${selectedThb}`,
                    pt: `Escaneie o QR para pagar ฿${selectedThb}`,
                    ru: `Отсканируйте QR для оплаты ฿${selectedThb}`,
                    es: `Escanea el QR para pagar ฿${selectedThb}`,
                    bg: `Сканирайте QR кода за плащане на ฿${selectedThb}`,
                  })}
                  {merchantPhone ? (
                    <span className="block text-amber-400 font-mono-tabular mt-0.5">
                      {merchantPhone}
                    </span>
                  ) : null}
                </div>
              </div>
            )}

            {/* Summary Box */}
            <div className="p-3.5 rounded bg-zinc-950 border border-zinc-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span>
                  {L(lang, {
                    en: 'Recipient Account:',
                    th: 'บัญชีผู้รับเครดิต:',
                    pt: 'Conta de Destino:',
                    ru: 'Аккаунт получателя:',
                    es: 'Cuenta Destino:',
                    bg: 'Получаващ Акаунт:',
                  })}
                </span>
                <strong className="text-white">{account.username}</strong>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>
                  {L(lang, {
                    en: 'WebShop Credits:',
                    th: 'เครดิตหน้าเว็บที่จะได้รับ:',
                    pt: 'Créditos WebShop:',
                    ru: 'Кредиты WebShop:',
                    es: 'Créditos WebShop:',
                    bg: 'WebShop Кредити:',
                  })}
                </span>
                <strong className="font-mono-tabular text-amber-400">
                  +{activeTier.credits.toLocaleString()} Credits
                </strong>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>
                  {L(lang, {
                    en: 'In-Game CashShop:',
                    th: 'เหรียญ CashShop ในเกม:',
                    pt: 'CashShop no Jogo:',
                    ru: 'Игровой CashShop:',
                    es: 'CashShop en el Juego:',
                    bg: 'CashShop в Играта:',
                  })}
                </span>
                <strong className="font-mono-tabular text-emerald-400">
                  +{activeTier.wCoinC.toLocaleString()} WCoinC
                </strong>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingTm}
              className="w-full py-3 px-4 rounded font-bold text-xs bg-[#ff8300] hover:bg-[#ff9526] text-zinc-950 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              {isSubmittingTm
                ? L(lang, {
                    en: 'Verifying Payment...',
                    th: 'กำลังตรวจสอบรายการ...',
                    pt: 'Verificando Pagamento...',
                    ru: 'Проверка платежа...',
                    es: 'Verificando Pago...',
                    bg: 'Проверка на плащането...',
                  })
                : L(lang, {
                    en: `Confirm TrueMoney ฿${selectedThb.toLocaleString()} (+${activeTier.credits.toLocaleString()} Credits)`,
                    th: `ยืนยันเติมเงิน TrueMoney ฿${selectedThb.toLocaleString()} (+${activeTier.credits.toLocaleString()} Credits)`,
                    pt: `Confirmar TrueMoney ฿${selectedThb.toLocaleString()} (+${activeTier.credits.toLocaleString()} Créditos)`,
                    ru: `Подтвердить TrueMoney ฿${selectedThb.toLocaleString()} (+${activeTier.credits.toLocaleString()} кред.)`,
                    es: `Confirmar TrueMoney ฿${selectedThb.toLocaleString()} (+${activeTier.credits.toLocaleString()} Créditos)`,
                    bg: `Потвърди TrueMoney ฿${selectedThb.toLocaleString()} (+${activeTier.credits.toLocaleString()} Кредита)`,
                  })}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: PAYPAL CHECKOUT */}
      {activeTab === 'paypal' && (
        <div className="space-y-5">
          <div className="p-4 rounded border border-zinc-800 bg-zinc-900/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-zinc-300">
              <ShieldCheck className="w-4 h-4 text-[#3b95ef] shrink-0" />
              <span>
                {L(lang, {
                  en: 'Instant PayPal Checkout with idempotent replay protection. Credits and WCoinC are granted immediately upon order capture.',
                  th: 'ชำระเงินผ่าน PayPal แบบรับเครดิตและ WCoinC อัตโนมัติทันทีหลังยืนยันยอด พร้อมระบบป้องกันการตัดยอดซ้ำ (Idempotency Protection)',
                  pt: 'Checkout instantâneo via PayPal com proteção contra duplicidade. Créditos e WCoinC são entregues imediatamente.',
                  ru: 'Мгновенная оплата через PayPal с защитой от повторного списания. Кредиты и WCoinC начисляются сразу.',
                  es: 'Pago instantáneo con PayPal con protección idempotente. Créditos y WCoinC se acreditan al instante.',
                  bg: 'Мигновено плащане с PayPal и автоматично начисляване на Credits и WCoinC след потвърждение.',
                })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {packages.map((pkg) => {
              const badge =
                lang === 'Thai'
                  ? pkg.bonusTagTh || pkg.bonusTag
                  : pkg.bonusTag;
              return (
                <div
                  key={pkg.code}
                  className="p-5 rounded border border-zinc-800 bg-zinc-900/85 flex flex-col justify-between gap-4 hover:border-[#0070ba] transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono-tabular text-zinc-400">
                        {pkg.code}
                      </span>
                      <span className="text-amber-400 font-semibold">
                        {badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {lang === 'Thai' ? pkg.nameTh : pkg.name}
                    </h3>

                    <div className="pt-3 border-t border-zinc-800 space-y-1">
                      <div className="text-xl font-bold font-mono-tabular text-amber-400">
                        +{pkg.credits.toLocaleString()}{' '}
                        <span className="text-xs font-normal text-zinc-400">
                          Credits
                        </span>
                      </div>
                      {pkg.baseCredits && pkg.baseCredits < pkg.credits ? (
                        <div className="text-[11px] font-mono-tabular text-zinc-500 line-through">
                          +{pkg.baseCredits.toLocaleString()} Credits
                        </div>
                      ) : null}
                      <div className="text-xs font-mono-tabular text-emerald-400 font-semibold">
                        +{pkg.wCoinC.toLocaleString()} WCoinC
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold font-mono-tabular text-white">
                        ${pkg.priceUsd.toFixed(2)} USD
                      </span>
                      <span className="text-xs font-mono-tabular text-zinc-400">
                        เทียบเท่า ฿{pkg.priceThb.toLocaleString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartPayPalCheckout(pkg)}
                      className="w-full py-2.5 px-4 rounded font-semibold text-xs bg-[#0070ba] hover:bg-[#005ea6] text-white transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <CreditCard className="w-4 h-4" />
                      {L(lang, {
                        en: 'Pay with PayPal',
                        th: 'ชำระด้วย PayPal',
                        pt: 'Pagar com PayPal',
                        ru: 'Оплатить через PayPal',
                        es: 'Pagar con PayPal',
                        bg: 'Плати с PayPal',
                      })}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TRANSACTION HISTORY */}
      {activeTab === 'history' && (
        <div className="rounded border border-zinc-800 bg-zinc-900/80 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-100">
              {L(lang, {
                en: 'Payment & Coin Grant Ledger',
                th: 'รายการประวัติการเติมเครดิตและเหรียญ WCoinC',
                pt: 'Registro de Pagamentos e Créditos',
                ru: 'Журнал пополнений и начислений',
                es: 'Registro de Pagos y Acreditaciones',
                bg: 'Дневник на плащанията и кредитите',
              })}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/60 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-2.5">
                    {L(lang, {
                      en: 'Reference',
                      th: 'เลขอ้างอิง (Reference)',
                      pt: 'Referência',
                      ru: 'Референс',
                      es: 'Referencia',
                      bg: 'Референция',
                    })}
                  </th>
                  <th className="px-4 py-2.5">
                    {L(lang, {
                      en: 'Account',
                      th: 'บัญชี',
                      pt: 'Conta',
                      ru: 'Аккаунт',
                      es: 'Cuenta',
                      bg: 'Акаунт',
                    })}
                  </th>
                  <th className="px-4 py-2.5">
                    {L(lang, {
                      en: 'Details',
                      th: 'รายละเอียด',
                      pt: 'Detalhes',
                      ru: 'Описание',
                      es: 'Detalles',
                      bg: 'Детайли',
                    })}
                  </th>
                  <th className="px-4 py-2.5 text-right">Credits</th>
                  <th className="px-4 py-2.5 text-right">WCoinC</th>
                  <th className="px-4 py-2.5 text-right">
                    {L(lang, {
                      en: 'Time',
                      th: 'เวลา',
                      pt: 'Data/Hora',
                      ru: 'Время',
                      es: 'Fecha/Hora',
                      bg: 'Време',
                    })}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {grants.length > 0 ? (
                  grants.map((g) => (
                    <tr key={g.id} className="hover:bg-zinc-800/40">
                      <td className="px-4 py-2.5 font-mono-tabular text-amber-300">
                        {g.reference}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-white">
                        {g.accountLoginName}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-300">{g.reason}</td>
                      <td className="px-4 py-2.5 text-right font-mono-tabular font-bold text-amber-400">
                        +{g.creditsAdded.toLocaleString()} cr
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono-tabular font-bold text-emerald-400">
                        +{g.amount.toLocaleString()} {g.coinType}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono-tabular text-zinc-400">
                        {new Date(g.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-zinc-500"
                    >
                      {L(lang, {
                        en: 'No payment transactions recorded yet.',
                        th: 'ยังไม่มีประวัติการทำรายการเติมเครดิต',
                        pt: 'Nenhuma transação registrada ainda.',
                        ru: 'Платежей пока не зарегистрировано.',
                        es: 'Aún no hay transacciones registradas.',
                        bg: 'Все още няма записани плащания.',
                      })}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PayPal Checkout Approval Modal */}
      {activePayPalOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-900 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#3b95ef]" />
                <h3 className="text-sm font-bold text-white">
                  PayPal Express Checkout
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePayPalOrder(null)}
                className="text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                {L(lang, {
                  en: 'Close',
                  th: 'ปิด',
                  pt: 'Fechar',
                  ru: 'Закрыть',
                  es: 'Cerrar',
                  bg: 'Затвори',
                })}
              </button>
            </div>

            <div className="p-3.5 rounded bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Order ID:</span>
                <span className="font-mono-tabular text-amber-300">
                  {activePayPalOrder.orderToken}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">
                  {L(lang, {
                    en: 'Package:',
                    th: 'แพ็กเกจ:',
                    pt: 'Pacote:',
                    ru: 'Пакет:',
                    es: 'Paquete:',
                    bg: 'Пакет:',
                  })}
                </span>
                <strong className="text-white">
                  {lang === 'Thai'
                    ? activePayPalOrder.pkg.nameTh
                    : activePayPalOrder.pkg.name}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">
                  {L(lang, {
                    en: 'Amount Due:',
                    th: 'ยอดชำระ:',
                    pt: 'Valor Total:',
                    ru: 'К оплате:',
                    es: 'Importe Total:',
                    bg: 'Сума за плащане:',
                  })}
                </span>
                <strong className="font-mono-tabular text-base text-white">
                  ${activePayPalOrder.pkg.priceUsd.toFixed(2)} USD
                </strong>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-800 pt-2">
                <span className="text-zinc-400">
                  {L(lang, {
                    en: `Account (${account.username}):`,
                    th: `รับเข้าบัญชี (${account.username}):`,
                    pt: `Conta (${account.username}):`,
                    ru: `Аккаунт (${account.username}):`,
                    es: `Cuenta (${account.username}):`,
                    bg: `Акаунт (${account.username}):`,
                  })}
                </span>
                <span className="font-mono-tabular font-bold text-emerald-400">
                  +{activePayPalOrder.pkg.credits.toLocaleString()} Cr & +
                  {activePayPalOrder.pkg.wCoinC.toLocaleString()} WCoinC
                </span>
              </div>
            </div>

            <div className="text-xs space-y-1.5">
              <label className="block text-zinc-400">
                {L(lang, {
                  en: 'Payer Email (Receipt):',
                  th: 'อีเมลผู้ชำระเงิน (สำหรับใบเสร็จ):',
                  pt: 'E-mail do Pagador:',
                  ru: 'E-mail плательщика:',
                  es: 'Correo del Pagador:',
                  bg: 'Имейл на платеца:',
                })}
              </label>
              <input
                type="email"
                value={payerEmail}
                onChange={(e) => setPayerEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActivePayPalOrder(null)}
                className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 cursor-pointer"
              >
                {L(lang, {
                  en: 'Cancel',
                  th: 'ยกเลิก',
                  pt: 'Cancelar',
                  ru: 'Отмена',
                  es: 'Cancelar',
                  bg: 'Отказ',
                })}
              </button>
              <button
                type="button"
                disabled={isCapturingPayPal}
                onClick={handleCapturePayPalOrder}
                className="px-4 py-2 rounded bg-[#0070ba] hover:bg-[#005ea6] text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {isCapturingPayPal
                  ? L(lang, {
                      en: 'Processing...',
                      th: 'กำลังยืนยันยอด...',
                      pt: 'Processando...',
                      ru: 'Обработка...',
                      es: 'Procesando...',
                      bg: 'Обработка...',
                    })
                  : L(lang, {
                      en: `Confirm & Pay $${activePayPalOrder.pkg.priceUsd.toFixed(2)}`,
                      th: `ยืนยันชำระเงิน $${activePayPalOrder.pkg.priceUsd.toFixed(2)}`,
                      pt: `Confirmar e Pagar $${activePayPalOrder.pkg.priceUsd.toFixed(2)}`,
                      ru: `Оплатить $${activePayPalOrder.pkg.priceUsd.toFixed(2)}`,
                      es: `Confirmar y Pagar $${activePayPalOrder.pkg.priceUsd.toFixed(2)}`,
                      bg: `Потвърди и Плати $${activePayPalOrder.pkg.priceUsd.toFixed(2)}`,
                    })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
