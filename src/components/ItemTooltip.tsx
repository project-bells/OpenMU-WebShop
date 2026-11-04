import React from 'react';
import { LanguageCode } from '../types/webshop';
import { L } from '../translations';
import { FormattedItemTooltip } from '../utils/muItemLogic';

interface ItemTooltipProps {
  tooltip: FormattedItemTooltip;
  showRefundHint?: boolean;
  className?: string;
  lang?: LanguageCode;
}

export const ItemTooltipCard: React.FC<ItemTooltipProps> = ({
  tooltip,
  showRefundHint = false,
  className = '',
  lang = 'English',
}) => {
  return (
    <div
      className={`bg-[#090c14]/95 border border-zinc-600/80 shadow-2xl px-4 py-3 text-center text-xs leading-relaxed select-none rounded ${className}`}
    >
      <div
        className="font-bold text-sm tracking-wide mb-1"
        style={{ color: tooltip.color }}
      >
        {tooltip.displayName}
      </div>

      <div className="text-zinc-200 font-mono-tabular text-[11px] mb-1.5">
        {tooltip.durabilityText} ·{' '}
        {L(lang, {
          en: 'Size',
          th: 'ขนาด',
          pt: 'Tam.',
          ru: 'Размер',
          es: 'Tam.',
          bg: 'Размер',
        })}{' '}
        {tooltip.sizeText}
      </div>

      {tooltip.requirements.length > 0 && (
        <div className="text-zinc-300 text-[11px] space-y-0.5 mb-2">
          {tooltip.requirements.map((req, idx) => (
            <div key={idx}>{req}</div>
          ))}
        </div>
      )}

      {tooltip.skillLine && (
        <div className="text-[#9aadd5] text-[11px]">{tooltip.skillLine}</div>
      )}

      {tooltip.luckLines.map((line, idx) => (
        <div key={idx} className="text-[#9aadd5] text-[11px]">
          {line}
        </div>
      ))}

      {tooltip.optionLine && (
        <div className="text-[#9aadd5] text-[11px] font-medium">
          {tooltip.optionLine}
        </div>
      )}

      {tooltip.excellentLines.length > 0 && (
        <div className="mt-1 space-y-0.5 text-[#8CB0EA] text-[11px] font-medium">
          {tooltip.excellentLines.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      )}

      {tooltip.ancientLine && (
        <div className="mt-1 text-[#2FF387] text-[11px] font-semibold">
          {tooltip.ancientLine}
        </div>
      )}

      <div className="mt-2 pt-1.5 border-t border-zinc-800 text-[10px] text-zinc-400 font-mono-tabular">
        Serial: {tooltip.serial}
      </div>

      {showRefundHint && tooltip.refundCredits > 0 && (
        <div className="mt-1 text-[11px] text-amber-300 font-medium">
          {L(lang, {
            en: `Double-click or click Sell Back for ${tooltip.refundCredits.toLocaleString()} credits`,
            th: `ดับเบิลคลิกหรือกดปุ่มขายคืนเพื่อรับ ${tooltip.refundCredits.toLocaleString()} เครดิต`,
            pt: `Clique duas vezes ou em Vender para receber ${tooltip.refundCredits.toLocaleString()} créditos`,
            ru: `Дважды нажмите или нажмите Продать за ${tooltip.refundCredits.toLocaleString()} кредитов`,
            es: `Haz doble clic o pulsa Vender por ${tooltip.refundCredits.toLocaleString()} créditos`,
            bg: `Кликнете два пъти или Продай за ${tooltip.refundCredits.toLocaleString()} кредити`,
          })}
        </div>
      )}
    </div>
  );
};
