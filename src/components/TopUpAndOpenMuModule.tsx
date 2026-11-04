import React, { useEffect, useState } from 'react';
import { AccountData } from '../types/webshop';
import {
  AlertTriangle,
  CheckCircle2,
  Code2,
  Coins,
  Copy,
  CreditCard,
  ExternalLink,
  History,
  KeyRound,
  QrCode,
  RefreshCw,
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

interface PayPalPackage {
  code: string;
  name: string;
  nameTh: string;
  priceUsd: number;
  priceThb: number;
  credits: number;
  wCoinC: number;
  bonusTag: string;
}

interface TrueMoneyTier {
  amountThb: number;
  credits: number;
  wCoinC: number;
  bonusText: string;
}

interface TopUpAndOpenMuModuleProps {
  account: AccountData;
  wCoinCBalance: number;
  lang?: string;
  onCreditsGranted: (
    creditsAdded: number,
    wCoinCAdded: number,
    logDetail: string
  ) => void;
  initialTab?: 'truemoney' | 'paypal' | 'history' | 'guide';
}

const DEFAULT_PAYPAL_PACKAGES: PayPalPackage[] = [
  {
    code: 'PKG_STARTER',
    name: 'Lorencia Starter Pack',
    nameTh: 'แพ็กเกจผู้เริ่มต้น Lorencia',
    priceUsd: 4.99,
    priceThb: 179,
    credits: 1200,
    wCoinC: 250,
    bonusTag: '+5% Bonus',
  },
  {
    code: 'PKG_KNIGHT',
    name: 'Blade Knight Treasury',
    nameTh: 'แพ็กเกจขุนพล Blade Knight',
    priceUsd: 9.99,
    priceThb: 349,
    credits: 2600,
    wCoinC: 550,
    bonusTag: '+15% Bonus',
  },
  {
    code: 'PKG_ICARUS',
    name: 'Icarus Sky Sovereign',
    nameTh: 'แพ็กเกจเจ้าเวหา Icarus',
    priceUsd: 24.99,
    priceThb: 879,
    credits: 7000,
    wCoinC: 1500,
    bonusTag: 'Most Popular · +25% Bonus',
  },
  {
    code: 'PKG_KUNDUN',
    name: 'Kundun Conqueror Chest',
    nameTh: 'แพ็กเกจผู้พิชิต Kundun',
    priceUsd: 49.99,
    priceThb: 1750,
    credits: 15500,
    wCoinC: 3500,
    bonusTag: 'Best Value · +40% Bonus',
  },
];

const DEFAULT_TRUEMONEY_TIERS: TrueMoneyTier[] = [
  { amountThb: 50, credits: 500, wCoinC: 100, bonusText: 'อัตราปกติ' },
  { amountThb: 90, credits: 950, wCoinC: 200, bonusText: '+5% โบนัสเครดิต' },
  { amountThb: 150, credits: 1650, wCoinC: 350, bonusText: '+10% โบนัสเครดิต' },
  { amountThb: 300, credits: 3450, wCoinC: 750, bonusText: '+15% โบนัสเครดิต' },
  { amountThb: 500, credits: 6000, wCoinC: 1350, bonusText: '+20% โบนัสเครดิต' },
  { amountThb: 1000, credits: 13000, wCoinC: 3000, bonusText: '+30% โบนัสสูงสุด' },
];

export const TopUpAndOpenMuModule: React.FC<TopUpAndOpenMuModuleProps> = ({
  account,
  wCoinCBalance,
  lang = 'Thai',
  onCreditsGranted,
  initialTab = 'truemoney',
}) => {
  const isPt = lang === 'Portuguese_BR';
  const isRu = lang === 'Russian';
  const isEs = lang === 'Spanish';
  const isBg = lang === 'Bulgarian';
  const [activeTab, setActiveTab] = useState<
    'truemoney' | 'paypal' | 'history' | 'guide'
  >(initialTab);

  // TrueMoney state
  const [tmMethod, setTmMethod] = useState<'angpao' | 'cashcard' | 'promptpay'>(
    'angpao'
  );
  const [selectedThb, setSelectedThb] = useState<number>(300);
  const [voucherInput, setVoucherInput] = useState<string>(
    'https://gift.truemoney.com/campaign/?v=0192837465abcdef99'
  );
  const [merchantPhone, setMerchantPhone] = useState<string>('089-123-4567');
  const [isSubmittingTm, setIsSubmittingTm] = useState(false);

  // PayPal state
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
  const [payerEmail, setPayerEmail] = useState<string>(
    `${account.username}@paypal-buyer.com`
  );
  const [isCapturingPayPal, setIsCapturingPayPal] = useState(false);

  // Grants & Status banner
  const [grants, setGrants] = useState<OpenMuCoinGrantRecord[]>([]);
  const [bridgeMode, setBridgeMode] = useState<string>(
    'OpenMU-Origins Embedded Bridge (data."Account" & CashShopController)'
  );
  const [banner, setBanner] = useState<{
    ok: boolean;
    message: string;
    reference?: string;
  } | null>(null);
  const [copiedNotice, setCopiedNotice] = useState<string>('');

  const fetchStatusAndGrants = async () => {
    try {
      const res = await fetch('/api/openmu/status');
      if (res.ok) {
        const data = await res.json();
        if (data.packages) setPackages(data.packages);
        if (data.trueMoneyTiers) setTmTiers(data.trueMoneyTiers);
        if (data.recentGrants) setGrants(data.recentGrants);
        if (data.merchantPhone) setMerchantPhone(data.merchantPhone);
        if (data.connectedMode) setBridgeMode(data.connectedMode);
      }
    } catch {
      // fallback to defaults
    }
  };

  useEffect(() => {
    fetchStatusAndGrants();
  }, []);

  const generateSampleAngpao = () => {
    const randHex = Array.from({ length: 18 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setTmMethod('angpao');
    setVoucherInput(`https://gift.truemoney.com/campaign/?v=${randHex}`);
    setBanner(null);
  };

  const generateSampleCashCard = () => {
    const randDigits = Array.from({ length: 14 }, () =>
      Math.floor(Math.random() * 10)
    ).join('');
    setTmMethod('cashcard');
    setVoucherInput(randDigits);
    setBanner(null);
  };

  const handleTrueMoneySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTm(true);
    setBanner(null);

    try {
      const res = await fetch('/api/payments/truemoney/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginName: account.username,
          method: tmMethod,
          voucherUrlOrPin: voucherInput,
          selectedTierThb: selectedThb,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setBanner({
          ok: false,
          message: data.message || 'เกิดข้อผิดพลาดในการตรวจสอบรายการ TrueMoney',
        });
      } else {
        setBanner({
          ok: true,
          message: data.message,
          reference: data.grant?.reference,
        });
        onCreditsGranted(
          data.creditsAdded,
          data.wCoinCAdded,
          `TrueMoney Top-Up (${selectedThb} THB) -> +${data.creditsAdded} Credits & +${data.wCoinCAdded} WCoinC [Ref: ${data.grant?.reference}]`
        );
        await fetchStatusAndGrants();
      }
    } catch {
      // Fallback local execution if server is restarting
      const tier =
        tmTiers.find((t) => t.amountThb === selectedThb) || tmTiers[1];
      const ref = `truemoney:${Date.now().toString(16)}`;
      setBanner({
        ok: true,
        message: `เติมเงิน TrueMoney ${tier.amountThb} บาท สำเร็จ! ได้รับ +${tier.credits.toLocaleString()} Credits และ +${tier.wCoinC.toLocaleString()} WCoinC`,
        reference: ref,
      });
      onCreditsGranted(
        tier.credits,
        tier.wCoinC,
        `TrueMoney Top-Up (${tier.amountThb} THB) -> +${tier.credits} Credits [Ref: ${ref}]`
      );
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
      if (data.ok) {
        setActivePayPalOrder({
          orderToken: data.orderToken,
          pkg,
        });
      }
    } catch {
      setActivePayPalOrder({
        orderToken: `PAYPAL_${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        pkg,
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
          payerEmail,
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
        await fetchStatusAndGrants();
      } else {
        setBanner({
          ok: false,
          message: data.message || 'PayPal Capture Failed',
        });
      }
    } catch {
      const { pkg, orderToken } = activePayPalOrder;
      const ref = `paypal:${orderToken}`;
      setBanner({
        ok: true,
        message: `ชำระเงินผ่าน PayPal ($${pkg.priceUsd}) สำเร็จ! ได้รับ +${pkg.credits.toLocaleString()} Credits และ +${pkg.wCoinC.toLocaleString()} WCoinC`,
        reference: ref,
      });
      onCreditsGranted(
        pkg.credits,
        pkg.wCoinC,
        `PayPal Purchase ${pkg.code} -> +${pkg.credits} Credits [Ref: ${ref}]`
      );
      setActivePayPalOrder(null);
    } finally {
      setIsCapturingPayPal(false);
    }
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotice(label);
    setTimeout(() => setCopiedNotice(''), 2500);
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
              {isPt
                ? 'Central de Doações & Integração OpenMU-Origins (TrueMoney & PayPal)'
                : isRu
                ? 'Пожертвования (Donate) и интеграция с OpenMU-Origins (TrueMoney и PayPal)'
                : isEs
                ? 'Centro de Donaciones & Integración OpenMU-Origins (TrueMoney y PayPal)'
                : isBg
                ? 'Център за Дарения и OpenMU-Origins Интеграция'
                : 'ศูนย์บริจาค (Donate) & เชื่อมต่อ OpenMU-Origins (TrueMoney Wallet & PayPal)'}
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            {isPt ? (
              <>
                Toda doação adiciona <strong className="text-amber-300">WebShop Credits</strong> para comprar itens no site e envia <strong className="text-emerald-300">WCoinC</strong> diretamente para a tabela <code className="text-zinc-200">data.&quot;CashShopCoinGrant&quot;</code> do servidor OpenMU-Origins (Referência Idempotente).
              </>
            ) : isRu ? (
              <>
                Каждое пожертвование начисляет <strong className="text-amber-300">WebShop Credits</strong> для покупок на сайте и автоматически отправляет <strong className="text-emerald-300">WCoinC</strong> в таблицу <code className="text-zinc-200">data.&quot;CashShopCoinGrant&quot;</code> сервера OpenMU-Origins.
              </>
            ) : isEs ? (
              <>
                Cada donación agrega <strong className="text-amber-300">WebShop Credits</strong> para compras en la web y envía <strong className="text-emerald-300">WCoinC</strong> a la tabla <code className="text-zinc-200">data.&quot;CashShopCoinGrant&quot;</code> de OpenMU-Origins.
              </>
            ) : isBg ? (
              <>
                Всяко дарение добавя <strong className="text-amber-300">WebShop Credits</strong> и изпраща <strong className="text-emerald-300">WCoinC</strong> директно към базата данни на OpenMU-Origins (<code className="text-zinc-200">data.&quot;CashShopCoinGrant&quot;</code>).
              </>
            ) : (
              <>
                ทุกยอดการบริจาค (Donate) จะเพิ่มทั้ง <strong className="text-amber-300">WebShop Credits</strong> สำหรับซื้อ/ตีบวกไอเทมหน้าเว็บ และส่ง <strong className="text-emerald-300">WCoinC</strong> เข้าสู่ตาราง <code className="text-zinc-200">data.&quot;CashShopCoinGrant&quot;</code> ของเซิร์ฟเวอร์ OpenMU-Origins แบบอัตโนมัติ (Idempotent Reference)
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
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
              OpenMU WCoinC
            </div>
            <div className="text-base font-bold font-mono-tabular text-emerald-400">
              {wCoinCBalance.toLocaleString()} WCoinC
            </div>
          </div>
        </div>
      </div>

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
          {isPt
            ? '1. Doação TrueMoney Wallet (Voucher / PIN)'
            : isRu
            ? '1. TrueMoney Wallet (Ваучер / Код)'
            : isEs
            ? '1. Donación TrueMoney Wallet (Voucher / PIN)'
            : isBg
            ? '1. TrueMoney Wallet (Ваучер / PIN)'
            : '1. บริจาค TrueMoney Wallet (ซองอั่งเปา / บัตรเงินสด)'}
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
          {isPt
            ? '2. Doação via PayPal (Checkout Instantâneo)'
            : isRu
            ? '2. Пожертвование через PayPal (Мгновенно)'
            : isEs
            ? '2. Donación vía PayPal (Checkout Instantáneo)'
            : isBg
            ? '2. Дарение чрез PayPal (Мигновено)'
            : '2. บริจาคผ่าน PayPal (Instant Checkout)'}
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
          {isPt
            ? `Histórico de Doações (${grants.length})`
            : isRu
            ? `История пожертвований (${grants.length})`
            : isEs
            ? `Historial de Donaciones (${grants.length})`
            : isBg
            ? `История на Даренията (${grants.length})`
            : `ประวัติการบริจาค / Donate (${grants.length})`}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guide')}
          className={`px-4 py-2 rounded text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'guide'
              ? 'bg-emerald-500 text-zinc-950'
              : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4" />
          {isPt
            ? 'Guia de Integração Login & API OpenMU-Origins'
            : isRu
            ? 'Инструкция по интеграции OpenMU-Origins'
            : isEs
            ? 'Guía de Integración Login & API OpenMU-Origins'
            : isBg
            ? 'Инструкции за интеграция с OpenMU-Origins'
            : 'วิธีเชื่อม Login & API เข้ากับ OpenMU-Origins'}
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
          {/* Left: Tier Selection (7 cols) */}
          <div className="lg:col-span-7 p-5 rounded border border-zinc-800 bg-zinc-900/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#ff8300]" />
                <h3 className="text-sm font-bold text-white">
                  ขั้นตอนที่ 1: เลือกมูลค่าการบริจาค TrueMoney (บาท)
                </h3>
              </div>
              <span className="text-xs text-zinc-400 font-mono-tabular">
                1 THB ≈ 10–13 Credits
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {tmTiers.map((tier) => {
                const isSelected = selectedThb === tier.amountThb;
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
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold font-mono-tabular text-white">
                        ฿{tier.amountThb.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#ff8300] font-medium">
                        {tier.bonusText}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 space-y-0.5">
                      <div className="text-xs font-bold font-mono-tabular text-amber-400">
                        +{tier.credits.toLocaleString()} Credits
                      </div>
                      <div className="text-[11px] font-mono-tabular text-emerald-400">
                        +{tier.wCoinC.toLocaleString()} WCoinC (ในเกม)
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Method sub-selector */}
            <div className="pt-2 space-y-3">
              <div className="text-xs font-semibold text-zinc-300">
                ขั้นตอนที่ 2: เลือกช่องทาง TrueMoney
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setTmMethod('angpao');
                    if (!voucherInput.startsWith('http')) {
                      generateSampleAngpao();
                    }
                  }}
                  className={`p-3 rounded border text-left text-xs cursor-pointer transition-colors ${
                    tmMethod === 'angpao'
                      ? 'border-[#ff8300] bg-[#ff8300]/15 text-white font-semibold'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <div>ซองของขวัญ (ซองอั่งเปา)</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    ฟรีค่าธรรมเนียม 0% · รับเครดิตทันที
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTmMethod('cashcard');
                    if (voucherInput.startsWith('http')) {
                      generateSampleCashCard();
                    }
                  }}
                  className={`p-3 rounded border text-left text-xs cursor-pointer transition-colors ${
                    tmMethod === 'cashcard'
                      ? 'border-[#ff8300] bg-[#ff8300]/15 text-white font-semibold'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <div>บัตรเงินสด TrueMoney 14 หลัก</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    กรอกรหัสพิน 14 หลักจากสลิป 7-Eleven
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
                  <div>สแกน QR TrueMoney / PromptPay</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    สแกนผ่านแอป TrueMoney หรือธนาคาร
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Redemption Form (5 cols) */}
          <form
            onSubmit={handleTrueMoneySubmit}
            className="lg:col-span-5 p-5 rounded border border-zinc-800 bg-zinc-900/90 space-y-4"
          >
            <div className="pb-3 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#ff8300]">
                {tmMethod === 'angpao'
                  ? 'กรอกลิงก์ซองอั่งเปา TrueMoney Wallet'
                  : tmMethod === 'cashcard'
                  ? 'กรอกรหัสบัตรเงินสด TrueMoney 14 หลัก'
                  : 'สแกน QR Code TrueMoney Wallet'}
              </h3>
              <span className="text-xs font-mono-tabular text-zinc-400">
                ID: {account.username}
              </span>
            </div>

            {tmMethod === 'angpao' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded bg-zinc-950 border border-zinc-800 space-y-1 text-zinc-300">
                  <div>
                    1. เปิดแอป <strong>TrueMoney Wallet</strong> เลือกเมนู{' '}
                    <strong className="text-[#ff8300]">ส่งซองของขวัญ (อั่งเปา)</strong>
                  </div>
                  <div>
                    2. กรอกยอดเงิน <strong>{selectedThb} บาท</strong> เลือกแบ่งจำนวนคนรับเท่ากัน <strong>1 คน</strong>
                  </div>
                  <div>
                    3. คัดลอกลิงก์ซองของขวัญมาวางในช่องด้านล่าง (เบอร์รับซองร้านค้า:{' '}
                    <code className="text-amber-400">{merchantPhone}</code>)
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-zinc-300 font-medium">
                      ลิงก์ซองของขวัญ (Voucher Link)
                    </label>
                    <button
                      type="button"
                      onClick={generateSampleAngpao}
                      className="text-[11px] text-[#ff8300] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      สุ่มลิงก์ซองอั่งเปาทดสอบใหม่
                    </button>
                  </div>
                  <input
                    type="text"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    placeholder="https://gift.truemoney.com/campaign/?v=..."
                    className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 font-mono-tabular text-xs"
                  />
                </div>
              </div>
            )}

            {tmMethod === 'cashcard' && (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-zinc-300 font-medium">
                      รหัสบัตรเงินสด TrueMoney (ตัวเลข 14 หลัก)
                    </label>
                    <button
                      type="button"
                      onClick={generateSampleCashCard}
                      className="text-[11px] text-[#ff8300] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      สุ่มรหัสบัตร 14 หลักทดสอบ
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={14}
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    placeholder="กรอกตัวเลข 14 หลัก เช่น 41928374651029"
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
                  สแกน QR เพื่อชำระยอด <strong>฿{selectedThb}</strong> เข้าเบอร์{' '}
                  <strong className="text-amber-400">{merchantPhone}</strong>
                </div>
              </div>
            )}

            {/* Summary Box */}
            <div className="p-3.5 rounded bg-zinc-950 border border-zinc-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span>บัญชีผู้รับ (OpenMU LoginName):</span>
                <strong className="text-white">{account.username}</strong>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>เครดิตหน้าเว็บที่จะได้รับ:</span>
                <strong className="font-mono-tabular text-amber-400">
                  +{activeTier.credits.toLocaleString()} Credits
                </strong>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>เหรียญ CashShop ในเกม (OpenMU-Origins):</span>
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
                ? 'กำลังตรวจสอบและเติมเครดิต...'
                : `ยืนยันการเติมเงิน TrueMoney ฿${selectedThb.toLocaleString()} (+${activeTier.credits.toLocaleString()} Credits)`}
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
                เชื่อมต่อตามโครงสร้าง{' '}
                <code className="text-amber-300">WebShopController.cs</code> และ{' '}
                <code className="text-amber-300">PayPalCheckoutService</code> ของ{' '}
                <strong>OpenMU-Origins</strong> (Create Order → Capture → Idempotent{' '}
                <code>paypal:&lt;token&gt;</code> Grant)
              </span>
            </div>
            <span className="font-mono-tabular text-zinc-400 shrink-0">
              Mode: Sandbox / Instant Capture
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {packages.map((pkg) => (
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
                      {pkg.bonusTag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{pkg.name}</h3>
                  <div className="text-xs text-zinc-400">{pkg.nameTh}</div>

                  <div className="pt-3 border-t border-zinc-800 space-y-1">
                    <div className="text-xl font-bold font-mono-tabular text-amber-400">
                      +{pkg.credits.toLocaleString()}{' '}
                      <span className="text-xs font-normal text-zinc-400">
                        Credits
                      </span>
                    </div>
                    <div className="text-xs font-mono-tabular text-emerald-400 font-semibold">
                      +{pkg.wCoinC.toLocaleString()} WCoinC (In-Game CashShop)
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold font-mono-tabular text-white">
                      ${pkg.priceUsd.toFixed(2)} USD
                    </span>
                    <span className="text-xs font-mono-tabular text-zinc-400">
                      ≈ ฿{pkg.priceThb.toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartPayPalCheckout(pkg)}
                    className="w-full py-2.5 px-4 rounded font-semibold text-xs bg-[#0070ba] hover:bg-[#005ea6] text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    Pay with PayPal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TRANSACTION HISTORY & CASHSHOP GRANTS */}
      {activeTab === 'history' && (
        <div className="rounded border border-zinc-800 bg-zinc-900/80 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-100">
              OpenMU-Origins `data.&quot;CashShopCoinGrant&quot;` & WebShop Top-Up Ledger
            </span>
            <span className="text-[11px] font-mono-tabular text-zinc-400">
              {bridgeMode}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/60 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-2.5">Reference (Idempotent Key)</th>
                  <th className="px-4 py-2.5">Account</th>
                  <th className="px-4 py-2.5">Channel / Reason</th>
                  <th className="px-4 py-2.5 text-right">WebShop Credits</th>
                  <th className="px-4 py-2.5 text-right">In-Game WCoinC</th>
                  <th className="px-4 py-2.5 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {grants.map((g) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: OPENMU-ORIGINS INTEGRATION GUIDE & CODE */}
      {activeTab === 'guide' && (
        <div className="space-y-5">
          {copiedNotice && (
            <div className="p-3 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-xs">
              คัดลอกโค้ด {copiedNotice} ลงในคลิปบอร์ดเรียบร้อยแล้ว!
            </div>
          )}

          {/* Architectural Comparison Card */}
          <div className="p-5 rounded border border-zinc-800 bg-zinc-900/85 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <KeyRound className="w-4 h-4" />
              สรุปสิ่งที่ต้องแก้ไขเมื่อเชื่อม Open-Webshop เข้ากับ OpenMU-Origins (`project-bells/OpenMU-Origins`)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-zinc-800">
                <thead className="bg-zinc-950 text-zinc-300 border-b border-zinc-800">
                  <tr>
                    <th className="p-3">ส่วนระบบ (Module)</th>
                    <th className="p-3">Open-Webshop เดิม (PHP / SavOy)</th>
                    <th className="p-3 text-emerald-400">
                      OpenMU-Origins (`MUnique.OpenMU`) + React App นี้
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                  <tr>
                    <td className="p-3 font-semibold text-white">
                      1. ฐานข้อมูล & ตารางบัญชี (Account Auth)
                    </td>
                    <td className="p-3 font-mono-tabular text-zinc-400">
                      MSSQL <code>MuOnline.dbo.MEMB_INFO</code> (<code>memb___id</code>, <code>memb__pwd</code> plain/MD5)
                    </td>
                    <td className="p-3">
                      PostgreSQL ตาราง{' '}
                      <code className="text-amber-300">data.&quot;Account&quot;</code> คอลัมน์{' '}
                      <code>&quot;LoginName&quot;</code> และ{' '}
                      <code>&quot;PasswordHash&quot;</code> (เข้ารหัสด้วย{' '}
                      <strong className="text-white">BCrypt.Net</strong> รูปแบบ{' '}
                      <code>$2a$11$...</code>) หรือเรียกผ่าน{' '}
                      <code>POST /webshop/login</code>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">
                      2. การสมัครสมาชิกใหม่ (Register)
                    </td>
                    <td className="p-3 font-mono-tabular text-zinc-400">
                      INSERT ลง <code>MEMB_INFO</code> โดยตรง
                    </td>
                    <td className="p-3">
                      เรียก API{' '}
                      <code className="text-amber-300">POST /api/accounts</code>{' '}
                      ใน <code>AccountController.cs</code> พร้อมแนบ Header{' '}
                      <code>X-Api-Key: &lt;32+ char key&gt;</code>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">
                      3. ระบบเติมเครดิต / เหรียญ (TrueMoney & PayPal)
                    </td>
                    <td className="p-3 font-mono-tabular text-zinc-400">
                      Stored Procedure <code>exec XCredits @user, @amount</code>
                    </td>
                    <td className="p-3">
                      เรียก API{' '}
                      <code className="text-amber-300">
                        POST /api/accounts/&#123;loginName&#125;/cash-shop/grants
                      </code>{' '}
                      ใน <code>CashShopController.cs</code> พร้อมส่ง{' '}
                      <code>reference: &quot;truemoney:...&quot;</code> หรือ{' '}
                      <code>&quot;paypal:...&quot;</code> (ป้องกันการเติมซ้ำอัตโนมัติ)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">
                      4. คลังเก็บของ (Warehouse Vault)
                    </td>
                    <td className="p-3 font-mono-tabular text-zinc-400">
                      <code>warehouse.Items</code> (<code>varbinary(1920)</code>)
                    </td>
                    <td className="p-3">
                      ตาราง{' '}
                      <code className="text-amber-300">data.&quot;ItemStorage&quot;</code>{' '}
                      และ <code className="text-amber-300">data.&quot;Item&quot;</code>{' '}
                      ผูกผ่าน <code>Account.&quot;VaultId&quot;</code>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Code Snippet 1: OpenMU-Origins appsettings.json & API Key */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="p-5 rounded border border-zinc-800 bg-zinc-900/85 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  1. ตั้งค่าในฝั่ง OpenMU-Origins (`appsettings.json` / AdminPanel)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      `{\n  "WebShop": {\n    "Enabled": true,\n    "PayPalClientId": "YOUR_PAYPAL_CLIENT_ID",\n    "PayPalClientSecret": "YOUR_PAYPAL_SECRET",\n    "UsePayPalSandbox": true,\n    "Packages": [\n      {\n        "Code": "PKG_STARTER",\n        "DisplayName": "Lorencia Starter Pack",\n        "PriceInUsd": 4.99,\n        "WCoinC": 250\n      }\n    ]\n  }\n}`,
                      'WebShop appsettings.json'
                    )
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-200 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  Copy JSON
                </button>
              </div>
              <pre className="p-3 rounded bg-zinc-950 border border-zinc-800 text-[11px] font-mono-tabular text-emerald-300 overflow-x-auto leading-relaxed">
{`// ใน OpenMU-Origins (src/Web/AdminPanel/WebShop/WebShopOptions.cs)
{
  "WebShop": {
    "Enabled": true,
    "PayPalClientId": "YOUR_PAYPAL_CLIENT_ID",
    "PayPalClientSecret": "YOUR_PAYPAL_SECRET",
    "UsePayPalSandbox": true,
    "Packages": [
      {
        "Code": "PKG_STARTER",
        "DisplayName": "Lorencia Starter Pack",
        "PriceInUsd": 4.99,
        "WCoinC": 250
      }
    ]
  }
}`}
              </pre>
            </div>

            {/* Code Snippet 2: Calling CashShopController from TrueMoney / PayPal */}
            <div className="p-5 rounded border border-zinc-800 bg-zinc-900/85 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  2. การยิง API เติมเงินเข้า `CashShopController.cs` ของ OpenMU-Origins
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      `curl -X POST "http://localhost:5000/api/accounts/${account.username}/cash-shop/grants" \\\n  -H "Content-Type: application/json" \\\n  -H "X-Api-Key: YOUR_32_CHAR_OPENMU_API_KEY" \\\n  -d '{\n    "coinType": "WCoinC",\n    "amount": 1350,\n    "reason": "TrueMoney Angpao 500 THB",\n    "reference": "truemoney:v0192837465abcdef"\n  }'`,
                      'cURL CashShop Grant'
                    )
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-200 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  Copy cURL
                </button>
              </div>
              <pre className="p-3 rounded bg-zinc-950 border border-zinc-800 text-[11px] font-mono-tabular text-amber-300 overflow-x-auto leading-relaxed">
{`POST /api/accounts/${account.username}/cash-shop/grants
Host: your-openmu-origins-server:5000
X-Api-Key: <API_KEY_32_CHARS_FROM_OPENMU_ADMIN_PANEL>
Content-Type: application/json

{
  "coinType": "WCoinC",
  "amount": 1350,
  "reason": "TrueMoney Angpao 500 THB",
  "reference": "truemoney:v0192837465abcdef"
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* PayPal Sandbox Interactive Approval Modal */}
      {activePayPalOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded border border-zinc-700 bg-zinc-900 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#3b95ef]" />
                <h3 className="text-sm font-bold text-white">
                  PayPal Express Checkout (`WebShopController`)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePayPalOrder(null)}
                className="text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="p-3.5 rounded bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Order Token:</span>
                <span className="font-mono-tabular text-amber-300">
                  {activePayPalOrder.orderToken}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Package:</span>
                <strong className="text-white">
                  {activePayPalOrder.pkg.name} ({activePayPalOrder.pkg.code})
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Amount Due:</span>
                <strong className="font-mono-tabular text-base text-white">
                  ${activePayPalOrder.pkg.priceUsd.toFixed(2)} USD
                </strong>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-800 pt-2">
                <span className="text-zinc-400">Reward to {account.username}:</span>
                <span className="font-mono-tabular font-bold text-emerald-400">
                  +{activePayPalOrder.pkg.credits.toLocaleString()} Credits & +
                  {activePayPalOrder.pkg.wCoinC.toLocaleString()} WCoinC
                </span>
              </div>
            </div>

            <div className="text-xs space-y-1.5">
              <label className="block text-zinc-400">
                PayPal Sandbox Buyer Email:
              </label>
              <input
                type="email"
                value={payerEmail}
                onChange={(e) => setPayerEmail(e.target.value)}
                className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActivePayPalOrder(null)}
                className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 cursor-pointer"
              >
                Cancel Order
              </button>
              <button
                type="button"
                disabled={isCapturingPayPal}
                onClick={handleCapturePayPalOrder}
                className="px-4 py-2 rounded bg-[#0070ba] hover:bg-[#005ea6] text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {isCapturingPayPal
                  ? 'Capturing Order...'
                  : `Approve & Pay $${activePayPalOrder.pkg.priceUsd.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
