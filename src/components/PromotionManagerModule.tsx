import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../utils/apiClient';
import {
  PayPalPromoPackage,
  PromotionConfig,
  TrueMoneyPromoTier,
  LanguageCode,
} from '../types/webshop';
import { L } from '../translations';
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  CreditCard,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Smartphone,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface PromotionManagerModuleProps {
  adminUsername: string;
  lang: LanguageCode;
  onConfigSaved?: (saved: PromotionConfig, summaryLog: string) => void;
  onPreviewPlayerTopUp?: () => void;
}

const FALLBACK_CONFIG: PromotionConfig = {
  campaignActive: false,
  campaignTitleTh:
    'โปรโมชั่นเติมเงินพิเศษ รับโบนัสเพิ่มทุกช่องทาง (TrueMoney & PayPal)',
  campaignTitleEn:
    'Special Top-Up Event: Extra Bonus Across TrueMoney & PayPal',
  extraBonusPercent: 0,
  baseCreditsPerThb: 10,
  baseWCoinCPerThb: 2,
  usdToThbRate: 35,
  merchantPhone: '',
  trueMoneyTiers: [
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
  ],
  payPalPackages: [
    {
      code: 'PKG_50',
      name: 'Mu Origins Explorer Pack',
      nameTh: 'แพ็กเกจนักผจญภัย Mu Origins',
      priceThb: 50,
      priceUsd: 1.43,
      bonusPercent: 0,
      credits: 500,
      wCoinC: 100,
      bonusTag: 'Standard Rate',
      bonusTagTh: 'เรทมาตรฐาน',
      enabled: true,
    },
    {
      code: 'PKG_100',
      name: 'Mu Origins Starter Pack',
      nameTh: 'แพ็กเกจผู้เริ่มต้น Mu Origins',
      priceThb: 100,
      priceUsd: 2.86,
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
      priceThb: 150,
      priceUsd: 4.29,
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
      priceThb: 300,
      priceUsd: 8.57,
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
      priceThb: 500,
      priceUsd: 14.29,
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
      priceThb: 1000,
      priceUsd: 28.57,
      bonusPercent: 30,
      credits: 13000,
      wCoinC: 2600,
      bonusTag: 'Best Value · +30% Bonus',
      bonusTagTh: 'คุ้มค่าสูงสุด · โบนัส +30%',
      enabled: true,
    },
  ],
  updatedAt: new Date().toISOString(),
};

export const PromotionManagerModule: React.FC<PromotionManagerModuleProps> = ({
  adminUsername,
  lang,
  onConfigSaved,
  onPreviewPlayerTopUp,
}) => {
  const [draft, setDraft] = useState<PromotionConfig>(FALLBACK_CONFIG);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/admin/promotions');
      if (res.ok) {
        const data = await res.json();
        if (data.promotionConfig) {
          setDraft(data.promotionConfig);
        }
      }
    } catch {
      // fallback to local draft
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, [adminUsername]);

  const campaignMultiplier =
    draft.campaignActive && draft.extraBonusPercent > 0
      ? 1 + draft.extraBonusPercent / 100
      : 1;

  // Check whether TrueMoney & PayPal enabled tiers have 100% consistent rates
  const parityReport = useMemo(() => {
    const activeTm = draft.trueMoneyTiers.filter((t) => t.enabled !== false);
    const activePp = draft.payPalPackages.filter((p) => p.enabled !== false);
    if (activeTm.length !== activePp.length) {
      return {
        aligned: false,
        reasonTh: `จำนวนรายการที่เปิดใช้งานไม่เท่ากัน (TrueMoney ${activeTm.length} รายการ vs PayPal ${activePp.length} รายการ)`,
        reasonEn: `Active tier count differs (TrueMoney: ${activeTm.length} vs PayPal: ${activePp.length})`,
      };
    }

    for (let i = 0; i < activeTm.length; i++) {
      const tm = activeTm[i];
      const matchPp = activePp.find((p) => p.priceThb === tm.amountThb);
      if (!matchPp) {
        return {
          aligned: false,
          reasonTh: `ไม่พบแพ็กเกจ PayPal ที่เทียบเท่ายอด ฿${tm.amountThb.toLocaleString()} ของ TrueMoney`,
          reasonEn: `Missing matching PayPal package for ฿${tm.amountThb.toLocaleString()} tier`,
        };
      }
      if (
        matchPp.credits !== tm.credits ||
        matchPp.wCoinC !== tm.wCoinC ||
        matchPp.bonusPercent !== tm.bonusPercent
      ) {
        return {
          aligned: false,
          reasonTh: `ยอด ฿${tm.amountThb.toLocaleString()} ได้รับโบนัสไม่ตรงกัน (TrueMoney: ${tm.credits.toLocaleString()} Cr / +${tm.bonusPercent}% vs PayPal: ${matchPp.credits.toLocaleString()} Cr / +${matchPp.bonusPercent}%)`,
          reasonEn: `Tier ฿${tm.amountThb.toLocaleString()} reward mismatch between TrueMoney and PayPal`,
        };
      }
    }

    return {
      aligned: true,
      reasonTh: `โปรโมชั่นทั้ง 2 ช่องทางสอดคล้องกัน 100% (${activeTm.length} ระดับราคา · เรทฐาน 1 THB = ${draft.baseCreditsPerThb} Cr + ${draft.baseWCoinCPerThb} WCoinC)`,
      reasonEn: `100% Aligned across TrueMoney & PayPal (${activeTm.length} tiers · Base 1 THB = ${draft.baseCreditsPerThb} Cr + ${draft.baseWCoinCPerThb} WCoinC)`,
    };
  }, [draft]);

  const handleRecalculateAllFromFormula = () => {
    const crRate = Math.max(1, Number(draft.baseCreditsPerThb) || 10);
    const wcRate = Math.max(0, Number(draft.baseWCoinCPerThb) || 2);
    const fxRate = Math.max(1, Number(draft.usdToThbRate) || 35);

    setDraft((prev) => ({
      ...prev,
      trueMoneyTiers: prev.trueMoneyTiers.map((t) => {
        const mult = 1 + (Number(t.bonusPercent) || 0) / 100;
        return {
          ...t,
          credits: Math.round(t.amountThb * crRate * mult),
          wCoinC: Math.round(t.amountThb * wcRate * mult),
          bonusText:
            t.bonusPercent > 0 ? `โบนัส +${t.bonusPercent}%` : 'เรทมาตรฐาน',
          bonusTextEn:
            t.bonusPercent > 0 ? `+${t.bonusPercent}% Bonus` : 'Standard Rate',
        };
      }),
      payPalPackages: prev.payPalPackages.map((p) => {
        const mult = 1 + (Number(p.bonusPercent) || 0) / 100;
        return {
          ...p,
          priceUsd: Number((p.priceThb / fxRate).toFixed(2)),
          credits: Math.round(p.priceThb * crRate * mult),
          wCoinC: Math.round(p.priceThb * wcRate * mult),
          bonusTag:
            p.bonusPercent > 0 ? `+${p.bonusPercent}% Bonus` : 'Standard Rate',
          bonusTagTh:
            p.bonusPercent > 0 ? `โบนัส +${p.bonusPercent}%` : 'เรทมาตรฐาน',
        };
      }),
    }));

    setStatusBanner({
      ok: true,
      message: L(lang, {
        en: 'Recalculated Credits, WCoinC, and USD prices across all tiers from Base Rate & Bonus %. Click "Save Promotions" to apply.',
        th: 'คำนวณยอด Credits, WCoinC และราคา USD ตามสูตรมาตรฐานใหม่ครบทุกรายการแล้ว กรุณากด "บันทึกการตั้งค่าโปรโมชั่น" เพื่อใช้งานจริง',
      }),
    });
  };

  const handleSyncPayPalFromTrueMoney = () => {
    const fxRate = Math.max(1, Number(draft.usdToThbRate) || 35);
    const crRate = Math.max(1, Number(draft.baseCreditsPerThb) || 10);
    const wcRate = Math.max(0, Number(draft.baseWCoinCPerThb) || 2);

    setDraft((prev) => {
      const updatedTm = prev.trueMoneyTiers
        .map((t) => {
          const mult = 1 + (Number(t.bonusPercent) || 0) / 100;
          return {
            ...t,
            credits: Math.round(t.amountThb * crRate * mult),
            wCoinC: Math.round(t.amountThb * wcRate * mult),
          };
        })
        .sort((a, b) => a.amountThb - b.amountThb);

      const syncedPayPal: PayPalPromoPackage[] = updatedTm.map((tm, idx) => {
        const existing = prev.payPalPackages.find(
          (p) => p.priceThb === tm.amountThb
        );
        return {
          code: existing?.code || `PKG_${tm.amountThb}`,
          name:
            existing?.name ||
            `Mu Origins Tier ${idx + 1} Pack (${tm.amountThb} THB)`,
          nameTh:
            existing?.nameTh ||
            `แพ็กเกจ Mu Origins ระดับ ${idx + 1} (${tm.amountThb} บาท)`,
          priceThb: tm.amountThb,
          priceUsd: Number((tm.amountThb / fxRate).toFixed(2)),
          bonusPercent: tm.bonusPercent,
          credits: tm.credits,
          wCoinC: tm.wCoinC,
          bonusTag:
            tm.bonusTextEn ||
            (tm.bonusPercent > 0
              ? `+${tm.bonusPercent}% Bonus`
              : 'Standard Rate'),
          bonusTagTh:
            tm.bonusText ||
            (tm.bonusPercent > 0 ? `โบนัส +${tm.bonusPercent}%` : 'เรทมาตรฐาน'),
          enabled: tm.enabled,
        };
      });

      return {
        ...prev,
        trueMoneyTiers: updatedTm,
        payPalPackages: syncedPayPal,
      };
    });

    setStatusBanner({
      ok: true,
      message: L(lang, {
        en: 'PayPal packages are now 100% synchronized with TrueMoney Wallet tiers! Click "Save Promotions" to publish.',
        th: 'ซิงค์แพ็กเกจ PayPal ให้ตรงกับโปรโมชั่น TrueMoney Wallet ครบ 100% แล้ว! กรุณากด "บันทึกการตั้งค่าโปรโมชั่น" เพื่อบันทึกเข้าระบบ',
      }),
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusBanner(null);
    setConfirmReset(false);
    try {
      const res = await apiFetch('/api/admin/promotions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ promotionConfig: draft }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatusBanner({
          ok: false,
          message:
            data.message ||
            L(lang, {
              en: 'Failed to save promotion settings.',
              th: 'ไม่สามารถบันทึกการตั้งค่าโปรโมชั่นได้',
            }),
        });
        return;
      }

      if (data.promotionConfig) {
        setDraft(data.promotionConfig);
        onConfigSaved?.(
          data.promotionConfig,
          `Admin updated TrueMoney & PayPal promotions (Campaign: ${
            data.promotionConfig.campaignActive
              ? `ON +${data.promotionConfig.extraBonusPercent}%`
              : 'OFF'
          })`
        );
      }

      setStatusBanner({
        ok: true,
        message:
          data.message ||
          L(lang, {
            en: 'Saved TrueMoney & PayPal promotion settings successfully.',
            th: 'บันทึกการตั้งค่าโปรโมชั่น TrueMoney Wallet & PayPal เรียบร้อยแล้ว (มีผลทันที)',
          }),
      });
    } catch {
      setStatusBanner({
        ok: false,
        message: L(lang, {
          en: 'Unable to reach server while saving promotion settings.',
          th: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อบันทึกโปรโมชั่นได้',
        }),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    setIsSaving(true);
    setStatusBanner(null);
    try {
      const res = await apiFetch('/api/admin/promotions/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok && data.ok && data.promotionConfig) {
        setDraft(data.promotionConfig);
        setConfirmReset(false);
        onConfigSaved?.(
          data.promotionConfig,
          'Admin reset TrueMoney & PayPal promotions to harmonized defaults'
        );
        setStatusBanner({
          ok: true,
          message: data.message,
        });
      } else {
        setStatusBanner({
          ok: false,
          message:
            data.message ||
            L(lang, {
              en: 'Failed to reset promotions.',
              th: 'ไม่สามารถรีเซ็ตค่าเริ่มต้นได้',
            }),
        });
      }
    } catch {
      setStatusBanner({
        ok: false,
        message: L(lang, {
          en: 'Network error while resetting promotions.',
          th: 'เกิดข้อผิดพลาดในการเชื่อมต่อขณะรีเซ็ตโปรโมชั่น',
        }),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateTmRow = (
    idx: number,
    patch: Partial<TrueMoneyPromoTier>,
    autoRecalc = false
  ) => {
    setDraft((prev) => {
      const nextRows = [...prev.trueMoneyTiers];
      const merged = { ...nextRows[idx], ...patch };
      if (autoRecalc) {
        const mult = 1 + (Number(merged.bonusPercent) || 0) / 100;
        merged.credits = Math.round(
          merged.amountThb * prev.baseCreditsPerThb * mult
        );
        merged.wCoinC = Math.round(
          merged.amountThb * prev.baseWCoinCPerThb * mult
        );
        merged.bonusText =
          merged.bonusPercent > 0
            ? `โบนัส +${merged.bonusPercent}%`
            : 'เรทมาตรฐาน';
        merged.bonusTextEn =
          merged.bonusPercent > 0
            ? `+${merged.bonusPercent}% Bonus`
            : 'Standard Rate';
      }
      nextRows[idx] = merged;
      return { ...prev, trueMoneyTiers: nextRows };
    });
  };

  const addTmRow = () => {
    setDraft((prev) => {
      const maxThb = prev.trueMoneyTiers.reduce(
        (m, r) => Math.max(m, r.amountThb),
        0
      );
      const nextThb = maxThb >= 1000 ? maxThb + 500 : 1500;
      const bonusPercent = 35;
      const mult = 1 + bonusPercent / 100;
      return {
        ...prev,
        trueMoneyTiers: [
          ...prev.trueMoneyTiers,
          {
            amountThb: nextThb,
            bonusPercent,
            credits: Math.round(nextThb * prev.baseCreditsPerThb * mult),
            wCoinC: Math.round(nextThb * prev.baseWCoinCPerThb * mult),
            bonusText: `โบนัส +${bonusPercent}%`,
            bonusTextEn: `+${bonusPercent}% Bonus`,
            enabled: true,
          },
        ],
      };
    });
  };

  const removeTmRow = (idx: number) => {
    if (draft.trueMoneyTiers.length <= 1) return;
    setDraft((prev) => ({
      ...prev,
      trueMoneyTiers: prev.trueMoneyTiers.filter((_, i) => i !== idx),
    }));
  };

  const updatePpRow = (
    idx: number,
    patch: Partial<PayPalPromoPackage>,
    autoRecalc = false
  ) => {
    setDraft((prev) => {
      const nextRows = [...prev.payPalPackages];
      const merged = { ...nextRows[idx], ...patch };
      if (autoRecalc) {
        const mult = 1 + (Number(merged.bonusPercent) || 0) / 100;
        merged.priceUsd = Number(
          (merged.priceThb / Math.max(1, prev.usdToThbRate)).toFixed(2)
        );
        merged.credits = Math.round(
          merged.priceThb * prev.baseCreditsPerThb * mult
        );
        merged.wCoinC = Math.round(
          merged.priceThb * prev.baseWCoinCPerThb * mult
        );
        merged.bonusTag =
          merged.bonusPercent > 0
            ? `+${merged.bonusPercent}% Bonus`
            : 'Standard Rate';
        merged.bonusTagTh =
          merged.bonusPercent > 0
            ? `โบนัส +${merged.bonusPercent}%`
            : 'เรทมาตรฐาน';
      }
      nextRows[idx] = merged;
      return { ...prev, payPalPackages: nextRows };
    });
  };

  const addPpRow = () => {
    setDraft((prev) => {
      const maxThb = prev.payPalPackages.reduce(
        (m, r) => Math.max(m, r.priceThb),
        0
      );
      const nextThb = maxThb >= 1000 ? maxThb + 500 : 1500;
      const bonusPercent = 35;
      const mult = 1 + bonusPercent / 100;
      return {
        ...prev,
        payPalPackages: [
          ...prev.payPalPackages,
          {
            code: `PKG_${nextThb}`,
            name: `Mu Origins Elite Chest (${nextThb} THB)`,
            nameTh: `แพ็กเกจ Mu Origins Elite (${nextThb} บาท)`,
            priceThb: nextThb,
            priceUsd: Number(
              (nextThb / Math.max(1, prev.usdToThbRate)).toFixed(2)
            ),
            bonusPercent,
            credits: Math.round(nextThb * prev.baseCreditsPerThb * mult),
            wCoinC: Math.round(nextThb * prev.baseWCoinCPerThb * mult),
            bonusTag: `+${bonusPercent}% Bonus`,
            bonusTagTh: `โบนัส +${bonusPercent}%`,
            enabled: true,
          },
        ],
      };
    });
  };

  const removePpRow = (idx: number) => {
    if (draft.payPalPackages.length <= 1) return;
    setDraft((prev) => ({
      ...prev,
      payPalPackages: prev.payPalPackages.filter((_, i) => i !== idx),
    }));
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded border border-zinc-800 bg-zinc-900/80 space-y-3">
        <div className="h-5 w-64 bg-zinc-800 rounded animate-pulse" />
        <div className="h-24 w-full bg-zinc-800/60 rounded animate-pulse" />
        <div className="h-48 w-full bg-zinc-800/60 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-5 rounded border border-zinc-800 bg-zinc-900/90 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              {L(lang, {
                en: 'Top-Up & Donation Promotion Manager (TrueMoney Wallet & PayPal)',
                th: 'ระบบจัดการโปรโมชั่นบริจาคและเติมเครดิต (TrueMoney Wallet & PayPal)',
              })}
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            {L(lang, {
              en: 'Configure base exchange rates, special event bonus multipliers, TrueMoney tiers, and PayPal packages with 1:1 rate parity.',
              th: 'กำหนดเรทแลกเปลี่ยนพื้นฐาน แคมเปญโบนัสพิเศษ และตารางราคา TrueMoney Wallet / PayPal ให้สอดคล้องกันทั้งระบบ มีผลกับธุรกรรมเติมเงินทันที',
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {onPreviewPlayerTopUp && (
            <button
              type="button"
              onClick={onPreviewPlayerTopUp}
              className="px-3.5 py-2 rounded border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {L(lang, {
                en: 'Preview Player Top-Up Page',
                th: 'ดูหน้าเติมเงินผู้เล่น',
              })}
            </button>
          )}

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="px-3.5 py-2 rounded border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>
                {L(lang, {
                  en: 'Reset Defaults',
                  th: 'คืนค่ามาตรฐาน',
                })}
              </span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleResetDefaults}
                className="px-3 py-2 rounded bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white cursor-pointer whitespace-nowrap shrink-0"
              >
                {L(lang, {
                  en: 'Confirm Reset',
                  th: 'ยืนยันรีเซ็ตเรทเริ่มต้น',
                })}
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-2.5 py-2 rounded border border-zinc-700 bg-zinc-950 text-xs text-zinc-300 cursor-pointer whitespace-nowrap shrink-0"
              >
                {L(lang, { en: 'Cancel', th: 'ยกเลิก' })}
              </button>
            </div>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>
              {isSaving
                ? L(lang, { en: 'Saving...', th: 'กำลังบันทึก...' })
                : L(lang, {
                    en: 'Save Promotions',
                    th: 'บันทึกการตั้งค่าโปรโมชั่น',
                  })}
            </span>
          </button>
        </div>
      </div>

      {/* Status Notification */}
      {statusBanner && (
        <div
          className={`p-3.5 rounded border text-xs flex items-center gap-2.5 ${
            statusBanner.ok
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
              : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
          }`}
        >
          {statusBanner.ok ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{statusBanner.message}</span>
        </div>
      )}

      {/* Channel Parity Diagnostic + One-Click Auto-Sync Toolbar */}
      <div
        className={`p-4 rounded border flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs ${
          parityReport.aligned
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : 'border-amber-500/40 bg-amber-500/10'
        }`}
      >
        <div className="flex items-start gap-2.5">
          {parityReport.aligned ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <div className="font-bold text-white">
              {L(lang, {
                en: 'TrueMoney Wallet & PayPal Promotion Consistency Check',
                th: 'สถานะความสอดคล้องของโปรโมชั่น TrueMoney Wallet & PayPal',
              })}
            </div>
            <div className="text-zinc-300 font-mono-tabular">
              {lang === 'Thai' ? parityReport.reasonTh : parityReport.reasonEn}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRecalculateAllFromFormula}
            className="px-3 py-2 rounded border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {L(lang, {
                en: 'Recalculate from Base Rate',
                th: 'คำนวณตามสูตรเรทฐานทั้งหมด',
              })}
            </span>
          </button>

          <button
            type="button"
            onClick={handleSyncPayPalFromTrueMoney}
            className="px-3.5 py-2 rounded border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>
              {L(lang, {
                en: 'Sync PayPal 1:1 with TrueMoney',
                th: 'ซิงค์โปรโมชั่น PayPal ให้ตรงกับ TrueMoney 100%',
              })}
            </span>
          </button>
        </div>
      </div>

      {/* Section 1: Global Base Exchange Rates & Event Bonus Campaign */}
      <div className="p-5 rounded border border-zinc-800 bg-zinc-900/85 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
          <h3 className="text-sm font-bold text-white">
            {L(lang, {
              en: '1. Global Exchange Rates & Special Event Bonus Campaign',
              th: '1. ตั้งค่าเรทแลกเปลี่ยนมาตรฐาน & แคมเปญโบนัสพิเศษ (ใช้ร่วมกันทั้ง TrueMoney และ PayPal)',
            })}
          </h3>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs">
            <input
              type="checkbox"
              checked={draft.campaignActive}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  campaignActive: e.target.checked,
                }))
              }
              className="rounded border-zinc-700 bg-zinc-950 text-amber-500"
            />
            <span
              className={
                draft.campaignActive
                  ? 'font-bold text-emerald-400'
                  : 'text-zinc-400'
              }
            >
              {draft.campaignActive
                ? L(lang, {
                    en: `Event Bonus ACTIVE (+${draft.extraBonusPercent}% Extra)`,
                    th: `เปิดใช้งานแคมเปญโบนัสพิเศษ (+${draft.extraBonusPercent}%)`,
                  })
                : L(lang, {
                    en: 'Enable Special Event Bonus',
                    th: 'เปิดใช้งานแคมเปญโบนัสพิเศษเพิ่มทุกช่องทาง',
                  })}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">
              {L(lang, {
                en: 'Base Credits / 1 THB',
                th: 'เรทฐาน Credits ต่อ 1 บาท',
              })}
            </label>
            <input
              type="number"
              min={1}
              max={1000}
              value={draft.baseCreditsPerThb}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  baseCreditsPerThb: Math.max(1, Number(e.target.value) || 1),
                }))
              }
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-700 text-amber-400 font-bold font-mono-tabular"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">
              {L(lang, {
                en: 'Base WCoinC / 1 THB',
                th: 'เรทฐาน WCoinC ต่อ 1 บาท',
              })}
            </label>
            <input
              type="number"
              min={0}
              max={1000}
              value={draft.baseWCoinCPerThb}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  baseWCoinCPerThb: Math.max(0, Number(e.target.value) || 0),
                }))
              }
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-700 text-emerald-400 font-bold font-mono-tabular"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">
              {L(lang, {
                en: 'USD Exchange Rate (THB / $1)',
                th: 'อัตราแลกเปลี่ยน 1 USD (บาท)',
              })}
            </label>
            <input
              type="number"
              min={1}
              max={200}
              step="0.5"
              value={draft.usdToThbRate}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  usdToThbRate: Math.max(1, Number(e.target.value) || 35),
                }))
              }
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 font-mono-tabular"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">
              {L(lang, {
                en: 'Event Extra Bonus (%)',
                th: 'โบนัสกิจกรรมพิเศษเพิ่ม (%)',
              })}
            </label>
            <input
              type="number"
              min={0}
              max={300}
              value={draft.extraBonusPercent}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  extraBonusPercent: Math.max(
                    0,
                    Math.min(300, Math.round(Number(e.target.value) || 0))
                  ),
                }))
              }
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-700 text-amber-300 font-bold font-mono-tabular"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">
              {L(lang, {
                en: 'TrueMoney Merchant Phone',
                th: 'เบอร์รับซอง TrueMoney (ถ้ามี)',
              })}
            </label>
            <input
              type="text"
              value={draft.merchantPhone}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  merchantPhone: e.target.value,
                }))
              }
              placeholder="08X-XXX-XXXX"
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 font-mono-tabular"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
          <div>
            <label className="block text-zinc-400 mb-1">
              {L(lang, {
                en: 'Campaign Banner Title (Thai)',
                th: 'ข้อความแบนเนอร์โปรโมชั่น (ภาษาไทย)',
              })}
            </label>
            <input
              type="text"
              value={draft.campaignTitleTh}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  campaignTitleTh: e.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">
              {L(lang, {
                en: 'Campaign Banner Title (English)',
                th: 'ข้อความแบนเนอร์โปรโมชั่น (ภาษาอังกฤษ)',
              })}
            </label>
            <input
              type="text"
              value={draft.campaignTitleEn}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  campaignTitleEn: e.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            />
          </div>
        </div>
      </div>

      {/* Section 2: TrueMoney Wallet Tiers Table */}
      <div className="rounded border border-zinc-800 bg-zinc-900/85 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#ff8300]" />
            <h3 className="text-sm font-bold text-white">
              {L(lang, {
                en: '2. TrueMoney Wallet Promotion Tiers',
                th: '2. ตารางโปรโมชั่น TrueMoney Wallet (ซองอั่งเปา / บัตรเงินสด / QR)',
              })}
            </h3>
          </div>

          <button
            type="button"
            onClick={addTmRow}
            className="px-3 py-1.5 rounded border border-[#ff8300]/50 bg-[#ff8300]/15 hover:bg-[#ff8300]/25 text-xs font-semibold text-[#ff9f38] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>
              {L(lang, {
                en: 'Add TrueMoney Tier',
                th: 'เพิ่มราคา TrueMoney',
              })}
            </span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/70 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-3 py-2.5">
                  {L(lang, { en: 'Active', th: 'เปิดใช้' })}
                </th>
                <th className="px-3 py-2.5 text-right">
                  {L(lang, { en: 'Amount (THB)', th: 'ยอดเงิน (บาท)' })}
                </th>
                <th className="px-3 py-2.5 text-right">
                  {L(lang, { en: 'Bonus %', th: 'โบนัส (%)' })}
                </th>
                <th className="px-3 py-2.5">
                  {L(lang, { en: 'Promo Label (TH)', th: 'ป้ายโปรโมชั่น (ไทย)' })}
                </th>
                <th className="px-3 py-2.5 text-right">Credits</th>
                <th className="px-3 py-2.5 text-right">WCoinC</th>
                <th className="px-3 py-2.5 text-right">
                  {L(lang, { en: 'Net Delivered', th: 'ผู้เล่นได้รับจริง' })}
                </th>
                <th className="px-3 py-2.5 text-right">
                  {L(lang, { en: 'Actions', th: 'จัดการ' })}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {draft.trueMoneyTiers.map((row, idx) => {
                const effCr = Math.round(row.credits * campaignMultiplier);
                const effWc = Math.round(row.wCoinC * campaignMultiplier);
                return (
                  <tr key={idx} className="hover:bg-zinc-800/30">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={row.enabled !== false}
                        onChange={(e) =>
                          updateTmRow(idx, { enabled: e.target.checked })
                        }
                        className="rounded border-zinc-700 bg-zinc-950"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min={1}
                        value={row.amountThb}
                        onChange={(e) =>
                          updateTmRow(
                            idx,
                            {
                              amountThb: Math.max(
                                1,
                                Math.round(Number(e.target.value) || 0)
                              ),
                            },
                            true
                          )
                        }
                        className="w-24 px-2 py-1 rounded bg-zinc-950 border border-zinc-700 text-right font-mono-tabular text-white"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min={0}
                        max={500}
                        value={row.bonusPercent}
                        onChange={(e) =>
                          updateTmRow(
                            idx,
                            {
                              bonusPercent: Math.max(
                                0,
                                Math.round(Number(e.target.value) || 0)
                              ),
                            },
                            true
                          )
                        }
                        className="w-20 px-2 py-1 rounded bg-zinc-950 border border-zinc-700 text-right font-mono-tabular text-[#ff9f38]"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.bonusText}
                        onChange={(e) =>
                          updateTmRow(idx, { bonusText: e.target.value })
                        }
                        className="w-40 px-2 py-1 rounded bg-zinc-950 border border-zinc-700 text-zinc-200"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min={1}
                        value={row.credits}
                        onChange={(e) =>
                          updateTmRow(idx, {
                            credits: Math.max(
                              1,
                              Math.round(Number(e.target.value) || 0)
                            ),
                          })
                        }
                        className="w-28 px-2 py-1 rounded bg-zinc-950 border border-zinc-700 text-right font-mono-tabular font-bold text-amber-400"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min={0}
                        value={row.wCoinC}
                        onChange={(e) =>
                          updateTmRow(idx, {
                            wCoinC: Math.max(
                              0,
                              Math.round(Number(e.target.value) || 0)
                            ),
                          })
                        }
                        className="w-24 px-2 py-1 rounded bg-zinc-950 border border-zinc-700 text-right font-mono-tabular font-bold text-emerald-400"
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-mono-tabular">
                      <div className="text-amber-300 font-bold">
                        +{effCr.toLocaleString()} Cr
                      </div>
                      <div className="text-[11px] text-emerald-400">
                        +{effWc.toLocaleString()} WCoinC
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          title="Auto-calculate from Base Rate & Bonus %"
                          onClick={() => updateTmRow(idx, {}, true)}
                          className="p-1.5 rounded border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 cursor-pointer"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={draft.trueMoneyTiers.length <= 1}
                          onClick={() => removeTmRow(idx)}
                          className="p-1.5 rounded border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 disabled:opacity-40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: PayPal Packages Table */}
      <div className="rounded border border-zinc-800 bg-zinc-900/85 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#3b95ef]" />
            <h3 className="text-sm font-bold text-white">
              {L(lang, {
                en: '3. PayPal Instant Checkout Promotion Packages',
                th: '3. ตารางแพ็กเกจโปรโมชั่น PayPal (Instant Checkout)',
              })}
            </h3>
          </div>

          <button
            type="button"
            onClick={addPpRow}
            className="px-3 py-1.5 rounded border border-[#3b95ef]/50 bg-[#0070ba]/20 hover:bg-[#0070ba]/30 text-xs font-semibold text-[#6cb6ff] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>
              {L(lang, {
                en: 'Add PayPal Package',
                th: 'เพิ่มแพ็กเกจ PayPal',
              })}
            </span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/70 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-3 py-2.5">
                  {L(lang, { en: 'Active', th: 'เปิดใช้' })}
                </th>
                <th className="px-3 py-2.5">Code</th>
                <th className="px-3 py-2.5">
                  {L(lang, { en: 'Package Name (TH / EN)', th: 'ชื่อแพ็กเกจ (ไทย / EN)' })}
                </th>
                <th className="px-3 py-2.5 text-right">THB</th>
                <th className="px-3 py-2.5 text-right">USD ($)</th>
                <th className="px-3 py-2.5 text-right">
                  {L(lang, { en: 'Bonus %', th: 'โบนัส (%)' })}
                </th>
                <th className="px-3 py-2.5 text-right">Credits</th>
                <th className="px-3 py-2.5 text-right">WCoinC</th>
                <th className="px-3 py-2.5 text-right">
                  {L(lang, { en: 'Net Delivered', th: 'ผู้เล่นได้รับจริง' })}
                </th>
                <th className="px-3 py-2.5 text-right">
                  {L(lang, { en: 'Actions', th: 'จัดการ' })}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {draft.payPalPackages.map((pkg, idx) => {
                const effCr = Math.round(pkg.credits * campaignMultiplier);
                const effWc = Math.round(pkg.wCoinC * campaignMultiplier);
                return (
                  <tr key={idx} className="hover:bg-zinc-800/30">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={pkg.enabled !== false}
                        onChange={(e) =>
                          updatePpRow(idx, { enabled: e.target.checked })
                        }
                        className="rounded border-zinc-700 bg-zinc-950"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={pkg.code}
                        onChange={(e) =>
                          updatePpRow(idx, {
                            code: e.target.value
                              .toUpperCase()
                              .replace(/[^A-Z0-9_-]/g, '_'),
                          })
                        }
                        className="w-24 px-2 py-1 rounded bg-zinc-950 border border-zinc-700 font-mono-tabular text-zinc-200"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={pkg.nameTh}
                          onChange={(e) =>
                            updatePpRow(idx, { nameTh: e.target.value })
                          }
                          placeholder="ชื่อภาษาไทย"
                          className="w-44 px-2 py-1 rounded bg-zinc-950 border border-zinc-700 text-white block"
                        />
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={(e) =>
                            updatePpRow(idx, { name: e.target.value })
                          }
                          placeholder="English Name"
                          className="w-44 px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 text-[11px] block"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min={1}
                        value={pkg.priceThb}
                        onChange={(e) =>
                          updatePpRow(
                            idx,
                            {
                              priceThb: Math.max(
                                1,
                                Math.round(Number(e.target.value) || 0)
                              ),
                            },
                            true
                          )
                        }
                        className="w-20 px-2 py-1 rounded bg-zinc-950 border border-zinc-700 text-right font-mono-tabular text-zinc-200"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min={0.5}
                        step="0.01"
                        value={pkg.priceUsd}
                        onChange={(e) =>
                          updatePpRow(idx, {
                            priceUsd: Math.max(
                              0.5,
                              Number(Number(e.target.value || 0.5).toFixed(2))
                            ),
                          })
                        }
                        className="w-20 px-2 py-1 rounded bg-zinc-950 border border-zinc-700 text-right font-mono-tabular text-white"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min={0}
                        max={500}
                        value={pkg.bonusPercent}
                        onChange={(e) =>
                          updatePpRow(
                            idx,
                            {
                              bonusPercent: Math.max(
                                0,
                                Math.round(Number(e.target.value) || 0)
                              ),
                            },
                            true
                          )
                        }
                        className="w-16 px-2 py-1 rounded bg-zinc-950 border border-zinc-700 text-right font-mono-tabular text-[#6cb6ff]"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min={1}
                        value={pkg.credits}
                        onChange={(e) =>
                          updatePpRow(idx, {
                            credits: Math.max(
                              1,
                              Math.round(Number(e.target.value) || 0)
                            ),
                          })
                        }
                        className="w-24 px-2 py-1 rounded bg-zinc-950 border border-zinc-700 text-right font-mono-tabular font-bold text-amber-400"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min={0}
                        value={pkg.wCoinC}
                        onChange={(e) =>
                          updatePpRow(idx, {
                            wCoinC: Math.max(
                              0,
                              Math.round(Number(e.target.value) || 0)
                            ),
                          })
                        }
                        className="w-24 px-2 py-1 rounded bg-zinc-950 border border-zinc-700 text-right font-mono-tabular font-bold text-emerald-400"
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-mono-tabular">
                      <div className="text-amber-300 font-bold">
                        +{effCr.toLocaleString()} Cr
                      </div>
                      <div className="text-[11px] text-emerald-400">
                        +{effWc.toLocaleString()} WCoinC
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          title="Auto-calculate from Base Rate & Bonus %"
                          onClick={() => updatePpRow(idx, {}, true)}
                          className="p-1.5 rounded border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 cursor-pointer"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={draft.payPalPackages.length <= 1}
                          onClick={() => removePpRow(idx)}
                          className="p-1.5 rounded border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 disabled:opacity-40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
