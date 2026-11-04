import React, { useState } from 'react';
import { VaultItemInstance, WebShopConfig, WebShopItem } from '../types/webshop';
import { formatItemTooltip } from '../utils/muItemLogic';
import { ItemTooltipCard } from './ItemTooltip';
import { RotateCcw, Search, Sparkles } from 'lucide-react';

interface WarehouseGridProps {
  vaultItems: VaultItemInstance[];
  catalog: WebShopItem[];
  config: WebShopConfig;
  allowRefund?: boolean;
  onRefundItem?: (instance: VaultItemInstance) => void;
  onTrackSerial?: (serial: string) => void;
  classicMode?: boolean;
}

export const WarehouseGrid: React.FC<WarehouseGridProps> = ({
  vaultItems,
  catalog,
  config,
  allowRefund = true,
  onRefundItem,
  onTrackSerial,
  classicMode = false,
}) => {
  const [hoveredItem, setHoveredItem] = useState<VaultItemInstance | null>(null);
  const [selectedItem, setSelectedItem] = useState<VaultItemInstance | null>(
    vaultItems[0] || null
  );
  const [confirmRefundId, setConfirmRefundId] = useState<string | null>(null);

  const catalogMap = React.useMemo(() => {
    const map = new Map<number, WebShopItem>();
    for (const it of catalog) map.set(it.uid, it);
    return map;
  }, [catalog]);

  // Build 8x15 rendering matrix with top-left anchors and covered slots
  const topLeftMap = new Map<number, VaultItemInstance>();
  const coveredSlots = new Set<number>();

  for (const item of vaultItems) {
    topLeftMap.set(item.slotIndex, item);
    const startX = item.slotIndex % 8;
    const startY = Math.floor(item.slotIndex / 8);
    for (let dy = 0; dy < item.Y; dy++) {
      for (let dx = 0; dx < item.X; dx++) {
        if (dx === 0 && dy === 0) continue;
        const x = startX + dx;
        const y = startY + dy;
        if (x < 8 && y < 15) {
          coveredSlots.add(y * 8 + x);
        }
      }
    }
  }

  const activeInspectItem = hoveredItem || selectedItem || vaultItems[0] || null;
  const activeTooltip = activeInspectItem
    ? formatItemTooltip(
        activeInspectItem,
        catalogMap.get(activeInspectItem.itemUid),
        config
      )
    : null;

  const usedCellsCount = vaultItems.reduce((acc, it) => acc + it.X * it.Y, 0);

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6">
      {/* Authentic 8x15 MU Online Vault Table */}
      <div className="shrink-0">
        <div
          className={`inline-block p-2 rounded border ${
            classicMode
              ? 'bg-[#888888] border-black'
              : 'bg-zinc-900/90 border-zinc-700 shadow-xl'
          }`}
        >
          <table className="border-collapse select-none">
            <tbody>
              {Array.from({ length: 15 }, (_, rowIdx) => (
                <tr key={rowIdx}>
                  {Array.from({ length: 8 }, (_, colIdx) => {
                    const slotIndex = rowIdx * 8 + colIdx;
                    if (coveredSlots.has(slotIndex)) {
                      return null;
                    }
                    const item = topLeftMap.get(slotIndex);
                    if (item) {
                      const tip = formatItemTooltip(
                        item,
                        catalogMap.get(item.itemUid),
                        config
                      );
                      const isSelected = selectedItem?.instanceId === item.instanceId;
                      return (
                        <td
                          key={colIdx}
                          colSpan={item.X}
                          rowSpan={item.Y}
                          onMouseEnter={() => setHoveredItem(item)}
                          onMouseLeave={() => setHoveredItem(null)}
                          onClick={() => {
                            setSelectedItem(item);
                            setConfirmRefundId(null);
                          }}
                          onDoubleClick={() => {
                            if (allowRefund && onRefundItem && tip.refundCredits > 0) {
                              setSelectedItem(item);
                              setConfirmRefundId(item.instanceId);
                            }
                          }}
                          style={{
                            width: `${item.X * 34}px`,
                            height: `${item.Y * 34}px`,
                          }}
                          className={`vault-cell relative p-0 align-middle text-center cursor-pointer transition-colors ${
                            isSelected
                              ? 'ring-1 ring-inset ring-amber-400 !bg-amber-500/15'
                              : 'hover:!bg-zinc-700/70'
                          }`}
                        >
                          {config.misc.whshow ? (
                            <div className="w-full h-full flex items-center justify-center p-0.5 relative">
                              <img
                                src={tip.thumb}
                                alt={tip.displayName}
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src =
                                    '/items/SinFoto.gif';
                                }}
                                className="max-w-full max-h-full object-contain pixelated drop-shadow"
                              />
                              {item.level > 0 && (
                                <span
                                  className="absolute bottom-0.5 right-1 text-[9px] font-mono-tabular font-bold px-0.5 rounded bg-black/75"
                                  style={{ color: tip.color }}
                                >
                                  +{item.level}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span
                              className="text-[9px] font-bold leading-tight block px-0.5 break-words"
                              style={{ color: tip.color }}
                            >
                              {item.name}
                            </span>
                          )}
                        </td>
                      );
                    }

                    return (
                      <td
                        key={colIdx}
                        style={{ width: '34px', height: '34px' }}
                        className="vault-cell p-0 text-center align-middle text-[9px] text-zinc-600"
                      />
                    );
                  })}
                  {/* Row coordinate 1..15 */}
                  <td
                    style={{ width: '28px', height: '34px' }}
                    className={`vault-cell text-center font-mono-tabular text-[11px] font-bold ${
                      classicMode ? 'text-black bg-[#999999]' : 'text-zinc-400 bg-zinc-950/60'
                    }`}
                  >
                    {rowIdx + 1}
                  </td>
                </tr>
              ))}
              {/* Bottom column coordinates 1..8 + X */}
              <tr>
                {Array.from({ length: 8 }, (_, colIdx) => (
                  <td
                    key={colIdx}
                    style={{ width: '34px', height: '28px' }}
                    className={`vault-cell text-center font-mono-tabular text-[11px] font-bold ${
                      classicMode ? 'text-black bg-[#999999]' : 'text-zinc-400 bg-zinc-950/60'
                    }`}
                  >
                    {colIdx + 1}
                  </td>
                ))}
                <td
                  style={{ width: '28px', height: '28px' }}
                  title="Creator: Savoy (Open-Webshop)"
                  className={`vault-cell text-center font-mono-tabular text-[11px] font-bold ${
                    classicMode ? 'text-black bg-[#999999]' : 'text-amber-400 bg-zinc-950/80'
                  }`}
                >
                  X
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono-tabular">
          <span>
            Occupied Slots: {usedCellsCount} / 120 ({vaultItems.length} items)
          </span>
          <span>Grid: 8 × 15</span>
        </div>
      </div>

      {/* Right-hand Item Inspector & Refund Control */}
      <div className="flex-1 w-full min-w-[260px] space-y-3">
        {activeInspectItem && activeTooltip ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Vault Slot #{activeInspectItem.slotIndex} (Col{' '}
                {(activeInspectItem.slotIndex % 8) + 1}, Row{' '}
                {Math.floor(activeInspectItem.slotIndex / 8) + 1})
              </span>
              <span className="font-mono-tabular">
                Paid: {activeInspectItem.paidCredits.toLocaleString()} credits
              </span>
            </div>

            <ItemTooltipCard
              tooltip={activeTooltip}
              showRefundHint={allowRefund && config.credits.sellback_Q > 0}
            />

            {/* Actions on selected item */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {allowRefund &&
                onRefundItem &&
                config.credits.sellback_Q > 0 &&
                activeTooltip.refundCredits > 0 && (
                  <>
                    {confirmRefundId === activeInspectItem.instanceId ? (
                      <div className="w-full p-3 rounded border border-amber-500/40 bg-amber-500/10 flex flex-col sm:flex-row items-center justify-between gap-2">
                        <span className="text-xs text-amber-200">
                          Confirm selling{' '}
                          <strong className="font-semibold">
                            {activeTooltip.displayName}
                          </strong>{' '}
                          for{' '}
                          <strong className="font-mono-tabular">
                            {activeTooltip.refundCredits.toLocaleString()}
                          </strong>{' '}
                          credits?
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              onRefundItem(activeInspectItem);
                              setConfirmRefundId(null);
                              setSelectedItem(null);
                              setHoveredItem(null);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Confirm Sell Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmRefundId(null)}
                            className="px-2.5 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmRefundId(activeInspectItem.instanceId)
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Sell Back for {activeTooltip.refundCredits.toLocaleString()} Credits (
                        {Math.round(config.credits.sellback_Q * 100)}%)
                      </button>
                    )}
                  </>
                )}

              {onTrackSerial && (
                <button
                  type="button"
                  onClick={() => onTrackSerial(activeInspectItem.serial)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Search className="w-3.5 h-3.5" />
                  Track Serial ({activeInspectItem.serial})
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded border border-zinc-800 bg-zinc-900/50 text-center text-xs text-zinc-400">
            Your 8×15 warehouse vault is currently empty. Visit{' '}
            <strong className="text-amber-400">Get Items</strong> to forge and add
            equipment directly into your vault.
          </div>
        )}
      </div>
    </div>
  );
};
