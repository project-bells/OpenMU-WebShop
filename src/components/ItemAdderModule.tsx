import React, { useMemo, useState } from 'react';
import {
  AccountData,
  ItemGroup,
  LanguageCode,
  VaultItemInstance,
  WebShopConfig,
  WebShopItem,
} from '../types/webshop';
import { L } from '../translations';
import {
  CATEGORY_NAMES,
  calculateItemTotalCredits,
  findFreeVaultSlot,
  formatItemTooltip,
  getExcellentOptionLabels,
} from '../utils/muItemLogic';
import { ItemTooltipCard } from './ItemTooltip';
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Layers,
  LogIn,
  PackagePlus,
  Search,
  Sparkles,
} from 'lucide-react';

interface ItemAdderModuleProps {
  account: AccountData | null;
  catalog: WebShopItem[];
  groups: ItemGroup[];
  config: WebShopConfig;
  lang: LanguageCode;
  onRequireLogin?: () => void;
  onBuySingleItem: (
    item: WebShopItem,
    level: number,
    option: number,
    luck: boolean,
    skill: boolean,
    exlOptions: boolean[],
    ancientStamina: 0 | 5 | 10,
    fenrirVariant: 0 | 1 | 2 | 3,
    totalCredits: number
  ) => Promise<{ ok: boolean; message: string }> | { ok: boolean; message: string };
  onBuyGroupSet: (
    group: ItemGroup,
    level: number,
    option: number,
    luck: boolean,
    skill: boolean,
    exlOptions: boolean[],
    ancientStamina: 0 | 5 | 10,
    totalCredits: number
  ) => Promise<{ ok: boolean; message: string }> | { ok: boolean; message: string };
  onAdminEditItem?: (uid: number) => void;
}

export const ItemAdderModule: React.FC<ItemAdderModuleProps> = ({
  account,
  catalog,
  groups,
  config,
  lang,
  onRequireLogin,
  onBuySingleItem,
  onBuyGroupSet,
  onAdminEditItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<number | 'groups'>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemUid, setSelectedItemUid] = useState<number | null>(20);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const [itemLevel, setItemLevel] = useState<number>(13);
  const [itemOption, setItemOption] = useState<number>(7);
  const [itemLuck, setItemLuck] = useState<boolean>(true);
  const [itemSkill, setItemSkill] = useState<boolean>(true);
  const [exlOptions, setExlOptions] = useState<boolean[]>([
    true,
    false,
    true,
    false,
    false,
    true,
  ]);
  const [ancientStamina, setAncientStamina] = useState<0 | 5 | 10>(0);
  const [fenrirVariant, setFenrirVariant] = useState<0 | 1 | 2 | 3>(0);
  const [hoveredCatInfo, setHoveredCatInfo] = useState<string>('');
  const [feedbackBanner, setFeedbackBanner] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);

  const getLocalizedCatName = (catId: number) => {
    const catObj = CATEGORY_NAMES[catId];
    if (!catObj) return '';
    return L(lang, {
      en: catObj.en,
      th: catObj.th,
      pt: catObj.pt,
      ru: catObj.ru,
      es: catObj.es,
      bg: catObj.bg,
    });
  };

  const categoryStats = useMemo(() => {
    const stats: Record<number, { active: number; banned: number }> = {};
    for (let c = 0; c < 16; c++) {
      stats[c] = { active: 0, banned: 0 };
    }
    for (const item of catalog) {
      const cat = item.category;
      if (stats[cat]) {
        if (item.credits > 0) stats[cat].active++;
        else stats[cat].banned++;
      }
    }
    return stats;
  }, [catalog]);

  const displayedItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return catalog
      .filter((it) => {
        if (config.credits.zerocredit === 0 && it.credits <= 0) return false;
        if (q) return it.name.toLowerCase().includes(q);
        if (selectedCategory === 'groups') return false;
        return it.category === selectedCategory;
      })
      .sort((a, b) => a.credits - b.credits);
  }, [catalog, selectedCategory, searchQuery, config.credits.zerocredit]);

  const activeGroup = useMemo(() => {
    if (selectedGroupId === null) return null;
    return groups.find((g) => g.id === selectedGroupId) || null;
  }, [groups, selectedGroupId]);

  const activeItem = useMemo(() => {
    if (activeGroup) {
      return (
        catalog.find((it) => it.uid === activeGroup.basedon) ||
        catalog.find((it) => activeGroup.memberUids.includes(it.uid)) ||
        catalog[0]
      );
    }
    if (selectedItemUid !== null) {
      return catalog.find((it) => it.uid === selectedItemUid) || null;
    }
    return null;
  }, [catalog, selectedItemUid, activeGroup]);

  const handleSelectSingleItem = (item: WebShopItem) => {
    setSelectedGroupId(null);
    setSelectedItemUid(item.uid);
    setFeedbackBanner(null);

    const maxLv = item.maxitlv > 0 ? item.maxitlv : config.limit.item_level;
    const maxOp = item.maxitop > 0 ? item.maxitop : config.limit.item_option;

    setItemLevel(item.hasLevel === 1 ? Math.min(itemLevel, maxLv) : 0);
    setItemOption(item.hasOption === 1 ? Math.min(itemOption, maxOp) : 0);
    setItemLuck(item.luck === 1 ? itemLuck : false);
    setItemSkill(item.skill === 1 ? itemSkill : false);

    if (item.ex_type === -1 || item.ex_type === 3) {
      setExlOptions([false, false, false, false, false, false]);
    }
    if (item.ex_type !== 3) {
      setAncientStamina(0);
    }
    if (!(item.type === 12 && item.id === 37)) {
      setFenrirVariant(0);
    }
  };

  const handleSelectGroup = (group: ItemGroup) => {
    setSelectedGroupId(group.id);
    setSelectedItemUid(group.basedon);
    setFeedbackBanner(null);
    setItemSkill(false);
    setAncientStamina(0);
    setFenrirVariant(0);
  };

  const maxLevelAllowed =
    activeItem && activeItem.maxitlv > 0
      ? activeItem.maxitlv
      : config.limit.item_level;
  const maxOptionAllowed =
    activeItem && activeItem.maxitop > 0
      ? activeItem.maxitop
      : config.limit.item_option;
  const maxExlAllowed = Math.min(
    3,
    activeItem && activeItem.maxitxl > 0
      ? activeItem.maxitxl
      : config.limit.item_excellent
  );

  const isFenrir = Boolean(
    !activeGroup && activeItem && activeItem.type === 12 && activeItem.id === 37
  );

  const effectiveLevel = activeItem?.hasLevel === 1 ? itemLevel : 0;
  const effectiveOption = activeItem?.hasOption === 1 ? itemOption : 0;
  const effectiveLuck = activeItem?.luck === 1 ? itemLuck : false;
  const effectiveSkill =
    !activeGroup && activeItem?.skill === 1 ? itemSkill : false;
  const effectiveExl =
    activeItem &&
    activeItem.ex_type >= 0 &&
    activeItem.ex_type !== 3 &&
    !isFenrir
      ? exlOptions
      : [false, false, false, false, false, false];
  const effectiveAncient =
    activeItem?.ex_type === 3 ? ancientStamina : (0 as 0 | 5 | 10);
  const effectiveFenrir = isFenrir ? fenrirVariant : (0 as 0 | 1 | 2 | 3);

  const baseCredits = activeGroup
    ? activeGroup.credits
    : activeItem?.credits || 0;

  const totalCredits = calculateItemTotalCredits(
    baseCredits,
    effectiveLevel,
    effectiveOption,
    effectiveLuck,
    effectiveSkill,
    effectiveExl,
    effectiveAncient,
    effectiveFenrir,
    config
  );

  const previewInstance: VaultItemInstance | null = useMemo(() => {
    if (!activeItem) return null;
    return {
      instanceId: 'preview',
      serial: 'PREVIEW8',
      slotIndex: 0,
      itemUid: activeItem.uid,
      itemId: activeItem.id,
      itemType: activeItem.type,
      name: activeGroup ? activeGroup.name : activeItem.name,
      X: activeItem.X,
      Y: activeItem.Y,
      level: effectiveLevel,
      option: effectiveOption,
      luck: effectiveLuck,
      skill: effectiveSkill,
      exlOptions: effectiveExl,
      ancientStamina: effectiveAncient,
      fenrirVariant: effectiveFenrir,
      durability: 255,
      paidCredits: totalCredits,
      canSellBack: !activeGroup && activeItem.cansellitem === 1,
      purchasedAt: Math.floor(Date.now() / 1000),
    };
  }, [
    activeItem,
    activeGroup,
    effectiveLevel,
    effectiveOption,
    effectiveLuck,
    effectiveSkill,
    effectiveExl,
    effectiveAncient,
    effectiveFenrir,
    totalCredits,
  ]);

  const previewTooltip = useMemo(() => {
    if (!previewInstance || !activeItem) return null;
    return formatItemTooltip(previewInstance, activeItem, config, lang);
  }, [previewInstance, activeItem, config, lang]);

  const targetSlot = useMemo(() => {
    if (!activeItem) return 1337;
    return findFreeVaultSlot(account?.vaultItems || [], activeItem.X, activeItem.Y);
  }, [account, activeItem]);

  const exLabels = activeItem
    ? getExcellentOptionLabels(activeItem.ex_type, lang)
    : [];
  const selectedExCount = effectiveExl.filter(Boolean).length;

  const toggleExlOption = (idx: number) => {
    const next = [...exlOptions];
    next[idx] = !next[idx];
    setExlOptions(next);
  };

  const optionMultiplier =
    activeItem?.optionType === 1 ? 1 : activeItem?.optionType === 2 ? 5 : 4;
  const optionSuffix = activeItem?.optionType === 1 ? '%' : '';

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || isPurchasing) return;

    if (!account) {
      onRequireLogin?.();
      return;
    }

    if (selectedExCount > maxExlAllowed) {
      setFeedbackBanner({
        ok: false,
        message: L(lang, {
          en: `Cannot purchase item! Maximum Excellent options allowed is ${maxExlAllowed} (you selected ${selectedExCount}).`,
          th: `ไม่สามารถสั่งซื้อไอเทมได้! ระบบจำกัดให้เลือกออปชัน Excellent ได้สูงสุดไม่เกิน ${maxExlAllowed} ออปชัน (คุณเลือกไว้ ${selectedExCount} ออปชัน)`,
          pt: `Não é possível comprar o item! O limite máximo é de ${maxExlAllowed} opções Excelentes (você selecionou ${selectedExCount}).`,
          ru: `Невозможно купить предмет! Максимум опций Excellent: ${maxExlAllowed} (выбрано ${selectedExCount}).`,
          es: `¡No se puede comprar el ítem! El límite máximo es de ${maxExlAllowed} opciones Excellent (seleccionaste ${selectedExCount}).`,
          bg: `Не може да закупите предмета! Лимитът за Excellent опции е ${maxExlAllowed} (избрани ${selectedExCount}).`,
        }),
      });
      return;
    }

    setIsPurchasing(true);
    try {
      if (activeGroup) {
        const res = await onBuyGroupSet(
          activeGroup,
          effectiveLevel,
          effectiveOption,
          effectiveLuck,
          false,
          effectiveExl,
          effectiveAncient,
          totalCredits
        );
        setFeedbackBanner(res);
      } else {
        const res = await onBuySingleItem(
          activeItem,
          effectiveLevel,
          effectiveOption,
          effectiveLuck,
          effectiveSkill,
          effectiveExl,
          effectiveAncient,
          effectiveFenrir,
          totalCredits
        );
        setFeedbackBanner(res);
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning Fieldset */}
      <div className="p-4 rounded border border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-300 leading-relaxed">
          <span className="font-semibold text-amber-300 uppercase tracking-wider block mb-0.5">
            {L(lang, {
              en: 'Item Adder Vault Notice',
              th: 'คำเตือนการส่งไอเทมเข้าคลัง (Item Adder)',
              pt: 'Aviso Importante de Entrega no Baú (Item Adder)',
              ru: 'Важное уведомление о сундуке (Item Adder)',
              es: 'Aviso importante sobre el baúl (Item Adder)',
              bg: 'Важно известие за сандъка (Item Adder)',
            })}
          </span>
          {L(lang, {
            en: `Exchange credits for items placed directly into the first available slot of your 8×15 Warehouse. Do NOT keep your vault open in-game during purchase! Current pricing rate: ${Math.round(config.credits.multiplier * 100)}%.`,
            th: `ใช้ระบบนี้เพื่อแลกเครดิตเป็นไอเทมเข้าสู่ช่องว่างแรกในคลังเก็บของ (Warehouse 8×15) ของคุณโดยอัตโนมัติ ห้ามเปิดคลังเก็บของในเกมค้างไว้ขณะสั่งซื้อเด็ดขาด! (อัตราค่าบริการปัจจุบัน: ${Math.round(config.credits.multiplier * 100)}%)`,
            pt: `Troque seus créditos por itens enviados diretamente ao primeiro espaço livre do seu Baú 8×15. NÃO mantenha o baú aberto no jogo durante a compra! Taxa atual: ${Math.round(config.credits.multiplier * 100)}%.`,
            ru: `Обменивайте кредиты на предметы с доставкой в первую свободную ячейку сундука 8×15. НЕ держите сундук открытым в игре во время покупки! Текущий тариф: ${Math.round(config.credits.multiplier * 100)}%.`,
            es: `Canjea créditos por ítems entregados en el primer espacio libre de tu Baúl 8×15. ¡NO mantengas el baúl abierto en el juego al comprar! Tarifa actual: ${Math.round(config.credits.multiplier * 100)}%.`,
            bg: `Обменете кредити за предмети директно в първото свободно място на сандъка 8×15. НЕ дръжте сандъка си отворен в играта по време на покупка! Текуща тарифа: ${Math.round(config.credits.multiplier * 100)}%.`,
          })}
        </div>
      </div>

      {feedbackBanner && (
        <div
          className={`p-3.5 rounded border text-xs flex items-center gap-2.5 ${
            feedbackBanner.ok
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
              : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
          }`}
        >
          {feedbackBanner.ok ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedbackBanner.message}</span>
        </div>
      )}

      {/* 16 Categories + Sets Matrix */}
      <div className="p-4 rounded border border-zinc-800 bg-zinc-900/70 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-zinc-100">
              {L(lang, {
                en: 'Categories (16 Categories + Armor Sets)',
                th: 'หมวดหมู่ไอเทม (16 หมวดหมู่ + เซ็ตเกราะครบชุด)',
                pt: 'Categorias de Itens (16 Categorias + Sets)',
                ru: 'Категории предметов (16 категорий + Сеты)',
                es: 'Categorías de Ítems (16 Categorías + Sets)',
                bg: 'Категории Предмети (16 категории + Сетове)',
              })}
            </h3>
            {hoveredCatInfo && (
              <span className="text-xs font-mono-tabular text-amber-400 ml-2">
                · {hoveredCatInfo}
              </span>
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={L(lang, {
                en: 'Search all items (e.g. Bone Blade)...',
                th: 'ค้นหาชื่อไอเทม (เช่น Bone Blade, Wings)...',
                pt: 'Buscar item (ex: Bone Blade, Wings)...',
                ru: 'Поиск предметов (напр. Bone Blade)...',
                es: 'Buscar ítem (ej. Bone Blade, Wings)...',
                bg: 'Търсене на предмети (напр. Bone Blade)...',
              })}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
          {Array.from({ length: 16 }, (_, catId) => {
            const stat = categoryStats[catId];
            const isSelected =
              !searchQuery && selectedCategory === catId && !selectedGroupId;
            const catName = getLocalizedCatName(catId);
            return (
              <button
                key={catId}
                type="button"
                onMouseEnter={() =>
                  setHoveredCatInfo(
                    L(lang, {
                      en: `${stat.active} available`,
                      th: `พร้อมจำหน่าย ${stat.active} ชิ้น`,
                      pt: `${stat.active} disponíveis`,
                      ru: `Доступно: ${stat.active}`,
                      es: `${stat.active} disponibles`,
                      bg: `Налични: ${stat.active}`,
                    })
                  )
                }
                onMouseLeave={() => setHoveredCatInfo('')}
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(catId);
                  setSelectedGroupId(null);
                  const firstInCat = catalog.find(
                    (it) => it.category === catId && it.credits > 0
                  );
                  if (firstInCat) handleSelectSingleItem(firstInCat);
                }}
                className={`px-2.5 py-2 rounded text-left text-xs transition-colors flex items-center justify-between gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-zinc-950 font-semibold'
                    : 'bg-zinc-950/60 hover:bg-zinc-800 text-zinc-300 border border-zinc-800/80'
                }`}
              >
                <span className="truncate">{catName}</span>
                <span
                  className={`text-[10px] font-mono-tabular shrink-0 ${
                    isSelected ? 'text-zinc-900' : 'text-zinc-500'
                  }`}
                >
                  {stat.active}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onMouseEnter={() =>
              setHoveredCatInfo(
                L(lang, {
                  en: `${groups.length} full armor sets`,
                  th: `${groups.length} เซ็ตเกราะครบชุด`,
                  pt: `${groups.length} sets completos`,
                  ru: `${groups.length} полных сетов`,
                  es: `${groups.length} sets completos`,
                  bg: `${groups.length} пълни сета`,
                })
              )
            }
            onMouseLeave={() => setHoveredCatInfo('')}
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('groups');
              if (groups[0]) handleSelectGroup(groups[0]);
            }}
            className={`col-span-2 sm:col-span-3 lg:col-span-2 px-3 py-2 rounded text-left text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
              !searchQuery && selectedCategory === 'groups'
                ? 'bg-amber-500 text-zinc-950 font-semibold'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            <span className="truncate font-medium">
              {L(lang, {
                en: '★ Grouped Items / Full Armor Sets',
                th: '★ ชุดเซ็ตเกราะครบชุด (Full Armor Sets)',
                pt: '★ Pacotes de Sets / Armaduras Completas',
                ru: '★ Полные сеты брони (Armor Sets)',
                es: '★ Sets Completos de Armadura',
                bg: '★ Комплекти Брони (Armor Sets)',
              })}
            </span>
            <span className="text-[10px] font-mono-tabular shrink-0">
              {groups.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Item List Table (5 cols) */}
        <div className="lg:col-span-5 rounded border border-zinc-800 bg-zinc-900/70 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
            <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              {searchQuery
                ? `${L(lang, {
                    en: 'Search Results',
                    th: 'ผลการค้นหา',
                    pt: 'Resultados da Busca',
                    ru: 'Результаты поиска',
                    es: 'Resultados de Búsqueda',
                    bg: 'Резултати от търсенето',
                  })} (${displayedItems.length})`
                : selectedCategory === 'groups'
                ? `${L(lang, {
                    en: 'Full Armor Sets',
                    th: 'ชุดเซ็ตเกราะครบชุด',
                    pt: 'Sets de Armadura',
                    ru: 'Сеты брони',
                    es: 'Sets de Armadura',
                    bg: 'Комплекти Брони',
                  })} (${groups.length})`
                : `${getLocalizedCatName(selectedCategory)} (${displayedItems.length})`}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono-tabular">
              {L(lang, {
                en: 'Base Credits',
                th: 'ราคาพื้นฐาน',
                pt: 'Créditos Base',
                ru: 'Базовая цена',
                es: 'Créditos Base',
                bg: 'Базова цена',
              })}
            </span>
          </div>

          <div className="max-h-[520px] overflow-y-auto divide-y divide-zinc-800/60">
            {selectedCategory === 'groups' && !searchQuery ? (
              groups.map((grp, idx) => {
                const isSelected = selectedGroupId === grp.id;
                const memberItems = grp.memberUids
                  .map((u) => catalog.find((it) => it.uid === u))
                  .filter((it): it is WebShopItem => Boolean(it));
                return (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => handleSelectGroup(grp)}
                    className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'hover:bg-zinc-800/60 text-zinc-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold flex items-center gap-2">
                        <span className="text-zinc-500 font-mono-tabular">
                          {idx + 1}.
                        </span>
                        <span className="truncate">{grp.name}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {memberItems.map((m) => m.name).join(', ')}
                      </div>
                    </div>
                    <span className="font-mono-tabular text-xs font-bold text-amber-400 shrink-0">
                      {Math.round(
                        grp.credits * config.credits.multiplier
                      ).toLocaleString()}{' '}
                      cr
                    </span>
                  </button>
                );
              })
            ) : displayedItems.length > 0 ? (
              displayedItems.map((item, idx) => {
                const isSelected =
                  selectedGroupId === null && selectedItemUid === item.uid;
                const price = Math.round(
                  item.credits * config.credits.multiplier
                );
                return (
                  <button
                    key={item.uid}
                    type="button"
                    onClick={() => handleSelectSingleItem(item)}
                    className={`w-full px-3.5 py-2.5 text-left transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 text-amber-200'
                        : 'hover:bg-zinc-800/60 text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[11px] font-mono-tabular text-zinc-500 w-5">
                        {idx + 1}.
                      </span>
                      <div className="w-8 h-8 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 p-0.5">
                        <img
                          src={item.thumb}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              '/items/SinFoto.gif';
                          }}
                          className="max-w-full max-h-full object-contain pixelated"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono-tabular">
                          {item.X}×{item.Y}
                          {item.str > 0 ? ` · STR ${item.str}` : ''}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono-tabular text-xs font-bold text-amber-400 shrink-0">
                      {price.toLocaleString()} cr
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-zinc-500">
                {L(lang, {
                  en: 'No items found in this category.',
                  th: 'ไม่พบไอเทมในหมวดหมู่นี้',
                  pt: 'Nenhum item encontrado nesta categoria.',
                  ru: 'В этой категории нет предметов.',
                  es: 'No se encontraron ítems en esta categoría.',
                  bg: 'Няма намерени предмети в тази категория.',
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Item Settings & Live Tooltip Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {activeItem && previewTooltip ? (
            <form
              onSubmit={handlePurchase}
              className="rounded border border-zinc-800 bg-zinc-900/80 p-5 space-y-5"
            >
              {/* Item Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded bg-zinc-950 border border-zinc-700 flex items-center justify-center p-1.5 shrink-0">
                    <img
                      src={previewTooltip.thumb}
                      alt={activeItem.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          '/items/SinFoto.gif';
                      }}
                      className="max-w-full max-h-full object-contain pixelated"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        className="text-base font-bold tracking-tight"
                        style={{ color: previewTooltip.color }}
                      >
                        {previewTooltip.displayName}
                      </h3>
                      {account?.isAdmin && onAdminEditItem && !activeGroup && (
                        <button
                          type="button"
                          onClick={() => onAdminEditItem(activeItem.uid)}
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          [edit]
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400 font-mono-tabular mt-0.5">
                      {L(lang, {
                        en: 'Size:',
                        th: 'ขนาด:',
                        pt: 'Tamanho:',
                        ru: 'Размер:',
                        es: 'Tamaño:',
                        bg: 'Размер:',
                      })}{' '}
                      {activeGroup
                        ? L(lang, {
                            en: 'Full Set (5 pcs)',
                            th: 'ครบเซ็ต (5 ชิ้น)',
                            pt: 'Set Completo (5 pçs)',
                            ru: 'Полный сет (5 шт.)',
                            es: 'Set Completo (5 pzas)',
                            bg: 'Пълен сет (5 ч.)',
                          })
                        : `${activeItem.X}×${activeItem.Y}`}{' '}
                      ·{' '}
                      {L(lang, {
                        en: 'Base:',
                        th: 'ราคาต้น:',
                        pt: 'Base:',
                        ru: 'База:',
                        es: 'Base:',
                        bg: 'База:',
                      })}{' '}
                      {Math.round(
                        baseCredits * config.credits.multiplier
                      ).toLocaleString()}{' '}
                      cr
                    </div>
                  </div>
                </div>

                {/* Live Total Credits Box */}
                <div className="px-4 py-2.5 rounded bg-zinc-950 border border-amber-500/40 text-right shrink-0">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400">
                    {L(lang, {
                      en: 'Total Cost',
                      th: 'ราคารวมสุทธิ',
                      pt: 'Custo Total',
                      ru: 'Итоговая цена',
                      es: 'Costo Total',
                      bg: 'Обща Цена',
                    })}
                  </div>
                  <div className="text-lg font-bold font-mono-tabular text-amber-400">
                    {totalCredits.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-zinc-400">
                      credits
                    </span>
                  </div>
                </div>
              </div>

              {/* Sellback Notice */}
              {!activeGroup &&
                activeItem.cansellitem === 1 &&
                config.credits.sellback_Q > 0 && (
                  <div className="px-3 py-2 rounded bg-zinc-950/70 border border-zinc-800 text-center text-xs text-zinc-300">
                    {L(lang, {
                      en: `This item can be sold back for ${Math.round(totalCredits * config.credits.sellback_Q).toLocaleString()} credits (${Math.round(config.credits.sellback_Q * 100)}% refund).`,
                      th: `ไอเทมชิ้นนี้สามารถขายคืนในคลังเพื่อรับเครดิตคืนได้ ${Math.round(totalCredits * config.credits.sellback_Q).toLocaleString()} เครดิต (${Math.round(config.credits.sellback_Q * 100)}% ของราคาซื้อ)`,
                      pt: `Este item pode ser vendido de volta por ${Math.round(totalCredits * config.credits.sellback_Q).toLocaleString()} créditos (${Math.round(config.credits.sellback_Q * 100)}% de reembolso).`,
                      ru: `Этот предмет можно продать обратно за ${Math.round(totalCredits * config.credits.sellback_Q).toLocaleString()} кредитов (возврат ${Math.round(config.credits.sellback_Q * 100)}%).`,
                      es: `Este ítem se puede vender de vuelta por ${Math.round(totalCredits * config.credits.sellback_Q).toLocaleString()} créditos (${Math.round(config.credits.sellback_Q * 100)}% de reembolso).`,
                      bg: `Този предмет може да бъде продаден обратно за ${Math.round(totalCredits * config.credits.sellback_Q).toLocaleString()} кредита (${Math.round(config.credits.sellback_Q * 100)}%).`,
                    })}
                  </div>
                )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Customization Controls Column */}
                <div className="space-y-3.5">
                  {/* Item Level */}
                  {activeItem.hasLevel === 1 && (
                    <div className="flex items-center justify-between p-2.5 rounded bg-zinc-950/60 border border-zinc-800">
                      <label
                        htmlFor="item_level"
                        className="text-xs font-medium text-zinc-200"
                      >
                        {L(lang, {
                          en: 'Item Level',
                          th: 'ระดับตีบวก (Item Level)',
                          pt: 'Nível do Item',
                          ru: 'Уровень предмета',
                          es: 'Nivel del Ítem',
                          bg: 'Ниво на Предмета',
                        })}
                      </label>
                      <div className="flex items-center gap-2.5">
                        <select
                          id="item_level"
                          value={itemLevel}
                          onChange={(e) => setItemLevel(Number(e.target.value))}
                          className="px-2.5 py-1 text-xs font-mono-tabular rounded bg-zinc-900 border border-zinc-700 text-zinc-100"
                        >
                          <option value={0}>+0</option>
                          {Array.from(
                            { length: maxLevelAllowed },
                            (_, i) => i + 1
                          ).map((lvl) => (
                            <option key={lvl} value={lvl}>
                              +{lvl}
                            </option>
                          ))}
                        </select>
                        <span className="text-xs font-mono-tabular text-amber-400 w-16 text-right">
                          +{effectiveLevel * config.credits.itemlvl} cr
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Item Option */}
                  {activeItem.hasOption === 1 && (
                    <div className="flex items-center justify-between p-2.5 rounded bg-zinc-950/60 border border-zinc-800">
                      <label
                        htmlFor="item_option"
                        className="text-xs font-medium text-zinc-200"
                      >
                        {L(lang, {
                          en: 'Additional Option (Jewel of Life)',
                          th: 'ออปชันเสริม (Jewel of Life)',
                          pt: 'Opção Adicional (Life)',
                          ru: 'Доп. опция (Jewel of Life)',
                          es: 'Opción Adicional (Life)',
                          bg: 'Доп. Опция (Jewel of Life)',
                        })}
                      </label>
                      <div className="flex items-center gap-2.5">
                        <select
                          id="item_option"
                          value={itemOption}
                          onChange={(e) =>
                            setItemOption(Number(e.target.value))
                          }
                          className="px-2.5 py-1 text-xs font-mono-tabular rounded bg-zinc-900 border border-zinc-700 text-zinc-100"
                        >
                          <option value={0}>+0</option>
                          {Array.from(
                            { length: maxOptionAllowed },
                            (_, i) => i + 1
                          ).map((opt) => (
                            <option key={opt} value={opt}>
                              +{opt * optionMultiplier}
                              {optionSuffix}
                            </option>
                          ))}
                        </select>
                        <span className="text-xs font-mono-tabular text-amber-400 w-16 text-right">
                          +{effectiveOption * config.credits.itemopt} cr
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Item Luck */}
                  {activeItem.luck === 1 && (
                    <label className="flex items-center justify-between p-2.5 rounded bg-zinc-950/60 border border-zinc-800 cursor-pointer">
                      <span className="flex items-center gap-2 text-xs font-medium text-zinc-200">
                        <input
                          type="checkbox"
                          checked={itemLuck}
                          onChange={(e) => setItemLuck(e.target.checked)}
                          className="rounded border-zinc-600 accent-amber-500"
                        />
                        {L(lang, {
                          en: 'Luck (+25% Soul / +5% Crit)',
                          th: 'โชค Luck (+25% ตีบวก / +5% คริติคอล)',
                          pt: 'Sorte / Luck (+25% Soul / +5% Crit)',
                          ru: 'Удача / Luck (+25% Soul / +5% Крит)',
                          es: 'Suerte / Luck (+25% Soul / +5% Crít)',
                          bg: 'Късмет / Luck (+25% Soul / +5% Крит)',
                        })}
                      </span>
                      <span className="text-xs font-mono-tabular text-amber-400">
                        +{effectiveLuck ? config.credits.itemluck : 0} cr
                      </span>
                    </label>
                  )}

                  {/* Item Skill */}
                  {!activeGroup && activeItem.skill === 1 && (
                    <label className="flex items-center justify-between p-2.5 rounded bg-zinc-950/60 border border-zinc-800 cursor-pointer">
                      <span className="flex items-center gap-2 text-xs font-medium text-zinc-200">
                        <input
                          type="checkbox"
                          checked={itemSkill}
                          onChange={(e) => setItemSkill(e.target.checked)}
                          className="rounded border-zinc-600 accent-amber-500"
                        />
                        {L(lang, {
                          en: 'Weapon Special Skill',
                          th: 'สกิลอาวุธพิเศษ (Weapon Skill)',
                          pt: 'Habilidade Especial (Skill)',
                          ru: 'Особый навык оружия (Skill)',
                          es: 'Habilidad Especial (Skill)',
                          bg: 'Специално Умение (Skill)',
                        })}
                      </span>
                      <span className="text-xs font-mono-tabular text-amber-400">
                        +{effectiveSkill ? config.credits.itemskill : 0} cr
                      </span>
                    </label>
                  )}

                  {/* Excellent Options */}
                  {!isFenrir && exLabels.length > 0 && (
                    <div
                      className={`p-3 rounded border space-y-2 ${
                        selectedExCount > maxExlAllowed
                          ? 'bg-rose-500/10 border-rose-500/50'
                          : 'bg-zinc-950/60 border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#2FF387]">
                          {L(lang, {
                            en: `Excellent Options (Max ${maxExlAllowed})`,
                            th: `ออปชัน Excellent (สูงสุด ${maxExlAllowed} ออปชัน)`,
                            pt: `Opções Excelentes (Máx. ${maxExlAllowed})`,
                            ru: `Опции Excellent (макс. ${maxExlAllowed})`,
                            es: `Opciones Excellent (Máx. ${maxExlAllowed})`,
                            bg: `Опции Excellent (макс. ${maxExlAllowed})`,
                          })}
                        </span>
                        <span
                          className={`font-mono-tabular font-semibold ${
                            selectedExCount > maxExlAllowed
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {selectedExCount}/{maxExlAllowed} · +
                          {selectedExCount * config.credits.itemexl} cr
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {exLabels.map((label, idx) => (
                          <label
                            key={idx}
                            className="flex items-center gap-2 text-xs text-zinc-300 hover:text-white cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={Boolean(exlOptions[idx])}
                              onChange={() => toggleExlOption(idx)}
                              className="rounded border-zinc-600 accent-emerald-500"
                            />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                      {selectedExCount > maxExlAllowed && (
                        <div className="pt-1.5 border-t border-rose-500/30 text-[11px] text-rose-300 font-medium flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>
                            {L(lang, {
                              en: `Limit exceeded (${selectedExCount}/${maxExlAllowed}). Uncheck ${selectedExCount - maxExlAllowed} option(s) to continue.`,
                              th: `คุณเลือกเกินกำหนด (${selectedExCount}/${maxExlAllowed}) กรุณานำออก ${selectedExCount - maxExlAllowed} ออปชัน`,
                              pt: `Limite excedido (${selectedExCount}/${maxExlAllowed}). Desmarque ${selectedExCount - maxExlAllowed} opção(ões).`,
                              ru: `Превышен лимит (${selectedExCount}/${maxExlAllowed}). Снимите ${selectedExCount - maxExlAllowed} опц.`,
                              es: `Límite superado (${selectedExCount}/${maxExlAllowed}). Desmarca ${selectedExCount - maxExlAllowed} opción(es).`,
                              bg: `Превишен лимит (${selectedExCount}/${maxExlAllowed}). Премахнете ${selectedExCount - maxExlAllowed} опц.`,
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ancient Stamina Options */}
                  {activeItem.ex_type === 3 && (
                    <div className="p-3 rounded bg-zinc-950/60 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-blue-400">
                          {L(lang, {
                            en: 'Ancient Stamina Option',
                            th: 'ออปชันไอเทมโบราณ (Ancient Stamina)',
                            pt: 'Opção Ancient Stamina',
                            ru: 'Опция Ancient Stamina',
                            es: 'Opción Ancient Stamina',
                            bg: 'Опция Ancient Stamina',
                          })}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs text-zinc-300">
                        {([0, 5, 10] as const).map((stam) => (
                          <label
                            key={stam}
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="ancient_stam"
                                checked={ancientStamina === stam}
                                onChange={() => setAncientStamina(stam)}
                                className="accent-blue-500"
                              />
                              {stam === 0
                                ? L(lang, {
                                    en: 'None',
                                    th: 'ไม่เลือก',
                                    pt: 'Nenhum',
                                    ru: 'Нет',
                                    es: 'Ninguno',
                                    bg: 'Няма',
                                  })
                                : `+${stam} Ancient Stamina`}
                            </span>
                            <span className="font-mono-tabular text-amber-400">
                              +
                              {stam === 5
                                ? config.credits.ancient1
                                : stam === 10
                                ? config.credits.ancient2
                                : 0}{' '}
                              cr
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Horn of Fenrir Special Options */}
                  {isFenrir && (
                    <div className="p-3 rounded bg-zinc-950/60 border border-zinc-800 space-y-2">
                      <div className="text-xs font-semibold text-amber-400">
                        {L(lang, {
                          en: 'Horn of Fenrir Evolution',
                          th: 'เลือกร่างสัตว์ขี่ Horn of Fenrir',
                          pt: 'Evolução Horn of Fenrir',
                          ru: 'Эволюция Horn of Fenrir',
                          es: 'Evolución Horn of Fenrir',
                          bg: 'Еволюция на Horn of Fenrir',
                        })}
                      </div>
                      <div className="space-y-1.5 text-xs text-zinc-300">
                        {[
                          {
                            val: 0,
                            label: L(lang, {
                              en: 'Red Fenrir (Standard)',
                              th: 'Red Fenrir (ร่างปกติ)',
                              pt: 'Red Fenrir (Padrão)',
                              ru: 'Red Fenrir (Стандарт)',
                              es: 'Red Fenrir (Estándar)',
                              bg: 'Red Fenrir (Стандартен)',
                            }),
                            cost: 0,
                          },
                          {
                            val: 1,
                            label: L(lang, {
                              en: 'Black Fenrir (+Destroy / +10% Dmg)',
                              th: 'Black Fenrir (+Destroy / โจมตี +10%)',
                              pt: 'Black Fenrir (+Destroy / +10% Dano)',
                              ru: 'Black Fenrir (+Destroy / +10% Урон)',
                              es: 'Black Fenrir (+Destroy / +10% Daño)',
                              bg: 'Black Fenrir (+Destroy / +10% Щети)',
                            }),
                            cost: config.credits.fenrir_destroy,
                          },
                          {
                            val: 2,
                            label: L(lang, {
                              en: 'Blue Fenrir (+Protect / +10% Absorb)',
                              th: 'Blue Fenrir (+Protect / ดูดซับดาเมจ 10%)',
                              pt: 'Blue Fenrir (+Protect / +10% Absorção)',
                              ru: 'Blue Fenrir (+Protect / +10% Поглощ.)',
                              es: 'Blue Fenrir (+Protect / +10% Absorción)',
                              bg: 'Blue Fenrir (+Protect / +10% Поглъщане)',
                            }),
                            cost: config.credits.fenrir_protect,
                          },
                          {
                            val: 3,
                            label: L(lang, {
                              en: 'Golden Fenrir (Rare)',
                              th: 'Golden Fenrir (ร่างทองพิเศษ)',
                              pt: 'Golden Fenrir (Raro)',
                              ru: 'Golden Fenrir (Редкий)',
                              es: 'Golden Fenrir (Raro)',
                              bg: 'Golden Fenrir (Рядък)',
                            }),
                            cost: config.credits.golden_fenrir,
                          },
                        ].map((opt) => (
                          <label
                            key={opt.val}
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="fenrir_opt"
                                checked={fenrirVariant === opt.val}
                                onChange={() =>
                                  setFenrirVariant(opt.val as 0 | 1 | 2 | 3)
                                }
                                className="accent-amber-500"
                              />
                              {opt.label}
                            </span>
                            <span className="font-mono-tabular text-amber-400">
                              +{opt.cost} cr
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Tooltip Preview & Vault Target Slot Column */}
                <div className="space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      {L(lang, {
                        en: 'In-Game Item Preview',
                        th: 'ตัวอย่างออปชันไอเทมในเกม',
                        pt: 'Prévia do Item no Jogo',
                        ru: 'Предпросмотр предмета в игре',
                        es: 'Vista previa del ítem en el juego',
                        bg: 'Преглед на предмета в играта',
                      })}
                    </div>
                    <ItemTooltipCard tooltip={previewTooltip} lang={lang} />
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <div className="px-3 py-2 rounded bg-zinc-950/80 border border-zinc-800 text-[11px] flex items-center justify-between text-zinc-400 font-mono-tabular">
                      <span>
                        {L(lang, {
                          en: 'Smart Vault Locator:',
                          th: 'ตำแหน่งช่องคลังที่จะเข้า:',
                          pt: 'Localizador de Baú:',
                          ru: 'Слот в сундуке:',
                          es: 'Localizador de baúl:',
                          bg: 'Място в сандъка:',
                        })}
                      </span>
                      {!account ? (
                        <span className="text-amber-300 font-semibold">
                          {L(lang, {
                            en: 'Sign in to check vault',
                            th: 'เข้าสู่ระบบเพื่อตรวจสอบช่องคลัง',
                            pt: 'Entre para verificar o baú',
                            ru: 'Войдите для проверки сундука',
                            es: 'Inicia sesión para revisar el baúl',
                            bg: 'Влезте за проверка на сандъка',
                          })}
                        </span>
                      ) : targetSlot === 1337 ? (
                        <span className="text-rose-400 font-semibold">
                          {L(lang, {
                            en: `Vault Full (No ${activeItem.X}×${activeItem.Y} slot)`,
                            th: `คลังเต็ม (ไม่มีช่องว่างขนาด ${activeItem.X}×${activeItem.Y})`,
                            pt: `Baú Cheio (Sem espaço ${activeItem.X}×${activeItem.Y})`,
                            ru: `Сундук полон (нет места ${activeItem.X}×${activeItem.Y})`,
                            es: `Baúl Lleno (Sin espacio ${activeItem.X}×${activeItem.Y})`,
                            bg: `Сандъкът е пълен (няма ${activeItem.X}×${activeItem.Y})`,
                          })}
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">
                          #{targetSlot} (C{(targetSlot % 8) + 1}, R
                          {Math.floor(targetSlot / 8) + 1})
                        </span>
                      )}
                    </div>

                    {!account ? (
                      <button
                        type="button"
                        onClick={onRequireLogin}
                        className="w-full py-3 px-4 rounded font-semibold text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
                      >
                        <LogIn className="w-4 h-4" />
                        {L(lang, {
                          en: `Sign In to Purchase (${totalCredits.toLocaleString()} Credits)`,
                          th: `เข้าสู่ระบบเพื่อสั่งซื้อไอเทม (${totalCredits.toLocaleString()} เครดิต)`,
                          pt: `Entrar para Comprar (${totalCredits.toLocaleString()} Créditos)`,
                          ru: `Войти для покупки (${totalCredits.toLocaleString()} кредитов)`,
                          es: `Inicia Sesión para Comprar (${totalCredits.toLocaleString()} Créditos)`,
                          bg: `Влезте за Покупка (${totalCredits.toLocaleString()} Кредита)`,
                        })}
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={targetSlot === 1337 || isPurchasing}
                        className="w-full py-3 px-4 rounded font-semibold text-xs bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
                      >
                        <PackagePlus className="w-4 h-4" />
                        {isPurchasing
                          ? L(lang, {
                              en: 'Delivering to Vault...',
                              th: 'กำลังส่งไอเทมเข้าคลัง...',
                              pt: 'Enviando para o Baú...',
                              ru: 'Отправка в сундук...',
                              es: 'Enviando al Baúl...',
                              bg: 'Изпращане в сандъка...',
                            })
                          : L(lang, {
                              en: `Add to Vault (${totalCredits.toLocaleString()} Credits)`,
                              th: `สั่งซื้อเข้าช่องว่างแรกในคลัง (${totalCredits.toLocaleString()} เครดิต)`,
                              pt: `Adicionar ao Baú (${totalCredits.toLocaleString()} Créditos)`,
                              ru: `Добавить в сундук (${totalCredits.toLocaleString()} кредитов)`,
                              es: `Agregar al Baúl (${totalCredits.toLocaleString()} Créditos)`,
                              bg: `Добави в Сандъка (${totalCredits.toLocaleString()} Кредита)`,
                            })}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-8 rounded border border-zinc-800 bg-zinc-900/50 text-center text-xs text-zinc-400">
              {L(lang, {
                en: 'Select an item or set from the list on the left to configure its level, options, luck, skill, and excellent attributes.',
                th: 'เลือกไอเทมหรือเซ็ตเกราะจากรายการด้านซ้าย เพื่อกำหนดระดับตีบวก ออปชัน โชค สกิล และออปชัน Excellent (สูงสุด 3 ออปชัน)',
                pt: 'Selecione um item ou set na lista à esquerda para configurar nível, opção, luck, skill e atributos excelentes.',
                ru: 'Выберите предмет или сет из списка слева для настройки уровня, опций, удачи, навыка и опций Excellent.',
                es: 'Selecciona un ítem o set en la lista izquierda para configurar nivel, opciones, luck, skill y atributos Excellent.',
                bg: 'Изберете предмет или сет от списъка вляво, за да настроите ниво, опция, късмет, умение и Excellent опции.',
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
