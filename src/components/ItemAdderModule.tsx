import React, { useMemo, useState } from 'react';
import {
  AccountData,
  ItemGroup,
  VaultItemInstance,
  WebShopConfig,
  WebShopItem,
} from '../types/webshop';
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
  PackagePlus,
  Search,
  Sparkles,
} from 'lucide-react';

interface ItemAdderModuleProps {
  account: AccountData;
  catalog: WebShopItem[];
  groups: ItemGroup[];
  config: WebShopConfig;
  lang: string;
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
  ) => { ok: boolean; message: string };
  onBuyGroupSet: (
    group: ItemGroup,
    level: number,
    option: number,
    luck: boolean,
    skill: boolean,
    exlOptions: boolean[],
    ancientStamina: 0 | 5 | 10,
    totalCredits: number
  ) => { ok: boolean; message: string };
  onAdminEditItem?: (uid: number) => void;
}

export const ItemAdderModule: React.FC<ItemAdderModuleProps> = ({
  account,
  catalog,
  groups,
  config,
  lang,
  onBuySingleItem,
  onBuyGroupSet,
  onAdminEditItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<number | 'groups'>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemUid, setSelectedItemUid] = useState<number | null>(20); // Default Knight Blade
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  // Item Forge customization state
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

  // Category counts (active vs banned, matching itemadder.php)
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

  // Items in current category or search
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

  // Build live preview VaultItemInstance for tooltip
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
    return formatItemTooltip(previewInstance, activeItem, config);
  }, [previewInstance, activeItem, config]);

  const targetSlot = useMemo(() => {
    if (!activeItem) return 1337;
    return findFreeVaultSlot(account.vaultItems, activeItem.X, activeItem.Y);
  }, [account.vaultItems, activeItem]);

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

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;

    if (selectedExCount > maxExlAllowed) {
      setFeedbackBanner({
        ok: false,
        message:
          lang === 'Thai'
            ? `ไม่สามารถสั่งซื้อไอเทมได้! ระบบจำกัดให้เลือกออปชัน Excellent ได้สูงสุดไม่เกิน ${maxExlAllowed} ออปชันเท่านั้น (คุณเลือกไว้ ${selectedExCount} ออปชัน)`
            : lang === 'Portuguese_BR'
            ? `Não é possível comprar o item! O limite máximo é de ${maxExlAllowed} opções Excelentes por item (você selecionou ${selectedExCount} opções).`
            : lang === 'Russian'
            ? `Невозможно купить предмет! Максимум опций Excellent: ${maxExlAllowed} (выбрано ${selectedExCount}).`
            : lang === 'Spanish'
            ? `¡No se puede comprar el ítem! El límite máximo es de ${maxExlAllowed} opciones Excellent (seleccionaste ${selectedExCount}).`
            : lang === 'Bulgarian'
            ? `Не може да закупите предмета! Лимитът за Excellent опции е ${maxExlAllowed} (избрани ${selectedExCount}).`
            : `Cannot purchase item! The maximum excellent options an item can have is ${maxExlAllowed} (you selected ${selectedExCount}).`,
      });
      return;
    }

    if (activeGroup) {
      const res = onBuyGroupSet(
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
      const res = onBuySingleItem(
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
  };

  return (
    <div className="space-y-6">
      {/* Warning Fieldset (Authentic itemadder.php warning) */}
      <div className="p-4 rounded border border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-300 leading-relaxed">
          <span className="font-semibold text-amber-300 uppercase tracking-wider block mb-0.5">
            {lang === 'Thai'
              ? 'คำเตือนการส่งไอเทมเข้าคลัง (Item Adder)'
              : lang === 'Portuguese_BR'
              ? 'Aviso Importante de Entrega no Baú (Item Adder)'
              : lang === 'Russian'
              ? 'Важное уведомление о сундуке (Item Adder)'
              : lang === 'Spanish'
              ? 'Aviso importante sobre el baúl (Item Adder)'
              : lang === 'Bulgarian'
              ? 'Важно известие за сандъка (Item Adder)'
              : 'Item Adder Vault Notice'}
          </span>
          {lang === 'Thai' ? (
            <>
              ใช้ระบบนี้เพื่อแลกเครดิตเป็นไอเทมเข้าสู่ช่องว่างแรกในคลังเก็บของ (Warehouse 8×15) ของคุณโดยอัตโนมัติ{' '}
              <strong className="text-white">
                ห้ามเปิดคลังเก็บของในเกมค้างไว้ขณะสั่งซื้อ
              </strong>{' '}
              มิฉะนั้นไอเทมจะไม่ถูกบันทึกเข้าคลัง! (ราคาไอเทมปัจจุบันอยู่ที่{' '}
              {Math.round(config.credits.multiplier * 100)}%)
            </>
          ) : lang === 'Portuguese_BR' ? (
            <>
              Use esta função para trocar seus créditos por itens diretamente no primeiro espaço livre do seu Baú (8×15).{' '}
              <strong className="text-white">
                NÃO faça compras enquanto seu baú estiver aberto dentro do jogo
              </strong>{' '}
              ou você não receberá o item! Preço atual dos itens:{' '}
              <span className="font-mono-tabular font-semibold text-amber-300">
                {Math.round(config.credits.multiplier * 100)}%
              </span>
              .
            </>
          ) : lang === 'Russian' ? (
            <>
              Используйте эту функцию для обмена кредитов на предметы в первую свободную ячейку сундука (8×15).{' '}
              <strong className="text-white">
                НЕ совершайте покупку, если ваш сундук открыт в игре
              </strong>
              , иначе предмет не сохранится! Текущие цены на предметы:{' '}
              <span className="font-mono-tabular font-semibold text-amber-300">
                {Math.round(config.credits.multiplier * 100)}%
              </span>
              .
            </>
          ) : lang === 'Spanish' ? (
            <>
              Usa esta función para canjear créditos por ítems en el primer espacio libre de tu Baúl (8×15).{' '}
              <strong className="text-white">
                NO compres mientras tengas el baúl abierto en el juego
              </strong>
              , de lo contrario no recibirás los ítems. Precio actual:{' '}
              <span className="font-mono-tabular font-semibold text-amber-300">
                {Math.round(config.credits.multiplier * 100)}%
              </span>
              .
            </>
          ) : lang === 'Bulgarian' ? (
            <>
              Използвайте тази функция за размяна на кредити за предмети в първото свободно място на сандъка (8×15).{' '}
              <strong className="text-white">
                НЕ правете покупки, докато сандъкът ви е отворен в играта
              </strong>
              ! Текущи цени:{' '}
              <span className="font-mono-tabular font-semibold text-amber-300">
                {Math.round(config.credits.multiplier * 100)}%
              </span>
              .
            </>
          ) : (
            <>
              Use this function to exchange credits for items.{' '}
              <strong className="text-white">
                Do NOT do this while your vault is open in-game or you will not receive your items while being charged credits for them.
              </strong>{' '}
              Current item prices are at{' '}
              <span className="font-mono-tabular font-semibold text-amber-300">
                {Math.round(config.credits.multiplier * 100)}%
              </span>
              .
            </>
          )}
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

      {/* 3-Column Category Matrix (Authentic Open-Webshop 16 categories + Sets) */}
      <div className="p-4 rounded border border-zinc-800 bg-zinc-900/70 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-zinc-100">
              {lang === 'Thai'
                ? 'หมวดหมู่ไอเทม (16 Categories + Armor Sets)'
                : lang === 'Portuguese_BR'
                ? 'Categorias de Itens (16 Categorias + Sets Completos)'
                : lang === 'Russian'
                ? 'Категории предметов (16 категорий + Сеты)'
                : lang === 'Spanish'
                ? 'Categorías de Ítems (16 Categorías + Sets)'
                : lang === 'Bulgarian'
                ? 'Категории Предмети (16 категории + Сетове)'
                : 'Categories'}
            </h3>
            {hoveredCatInfo && (
              <span className="text-xs font-mono-tabular text-amber-400 ml-2">
                · {hoveredCatInfo}
              </span>
            )}
          </div>

          {/* Fast item search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === 'Thai'
                  ? 'ค้นหาชื่อไอเทม (เช่น Bone Blade, Wings)...'
                  : lang === 'Portuguese_BR'
                  ? 'Buscar item (ex: Bone Blade, Wings)...'
                  : lang === 'Russian'
                  ? 'Поиск предметов (напр. Bone Blade, Wings)...'
                  : lang === 'Spanish'
                  ? 'Buscar ítem (ej. Bone Blade, Wings)...'
                  : lang === 'Bulgarian'
                  ? 'Търсене на предмети (напр. Bone Blade)...'
                  : 'Search all 456+ items...'
              }
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
          {Array.from({ length: 16 }, (_, catId) => {
            const stat = categoryStats[catId];
            const isSelected =
              !searchQuery && selectedCategory === catId && !selectedGroupId;
            const catObj = CATEGORY_NAMES[catId];
            const catName =
              lang === 'Thai'
                ? catObj?.th
                : lang === 'Portuguese_BR'
                ? catObj?.pt
                : lang === 'Russian'
                ? catObj?.ru
                : lang === 'Spanish'
                ? catObj?.es
                : lang === 'Bulgarian'
                ? catObj?.bg
                : catObj?.en;
            return (
              <button
                key={catId}
                type="button"
                onMouseEnter={() =>
                  setHoveredCatInfo(
                    `Items: ${stat.active} active, ${stat.banned} banned`
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

          {/* Grouped Items / Sets button */}
          <button
            type="button"
            onMouseEnter={() =>
              setHoveredCatInfo(`Groups: ${groups.length} full sets`)
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
              {lang === 'Portuguese_BR'
                ? '★ Pacotes de Sets / Armaduras Completas'
                : lang === 'Russian'
                ? '★ Полные сеты брони (Armor Sets)'
                : lang === 'Spanish'
                ? '★ Sets Completos de Armadura'
                : lang === 'Bulgarian'
                ? '★ Комплекти Брони (Armor Sets)'
                : '★ Grouped Items / Full Armor Sets'}
            </span>
            <span className="text-[10px] font-mono-tabular shrink-0">
              {groups.length} sets
            </span>
          </button>
        </div>
      </div>

      {/* Main Split View: Left = Category Item Table, Right = Item Settings / Forge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Item List Table (5 cols) */}
        <div className="lg:col-span-5 rounded border border-zinc-800 bg-zinc-900/70 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
            <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              {searchQuery
                ? `Search Results (${displayedItems.length})`
                : selectedCategory === 'groups'
                ? `Grouped Armor Sets (${groups.length})`
                : `${
                    lang === 'Portuguese_BR'
                      ? CATEGORY_NAMES[selectedCategory]?.pt
                      : CATEGORY_NAMES[selectedCategory]?.en
                  } (${displayedItems.length})`}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono-tabular">
              {lang === 'Portuguese_BR' ? 'Créditos Base' : 'Base Credits'}
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
                          Size {item.X}×{item.Y}
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
                No items found in this category.
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
                      {account.isAdmin && onAdminEditItem && !activeGroup && (
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
                      Item Size: {activeGroup ? 'Full Set (5 pcs)' : `${activeItem.X}×${activeItem.Y}`} · Base Price:{' '}
                      {Math.round(
                        baseCredits * config.credits.multiplier
                      ).toLocaleString()}{' '}
                      credits
                    </div>
                  </div>
                </div>

                {/* Live Total Credits Box */}
                <div className="px-4 py-2.5 rounded bg-zinc-950 border border-amber-500/40 text-right shrink-0">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400">
                    Total Cost
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
                    This item can be sold back for{' '}
                    <strong className="font-mono-tabular text-amber-300">
                      {Math.round(totalCredits * config.credits.sellback_Q).toLocaleString()}
                    </strong>{' '}
                    credits ({Math.round(config.credits.sellback_Q * 100)}% of its
                    purchase price)
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
                        Item Level
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
                        Item Option
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
                        Luck (+25% Jewel of Soul / +5% Crit)
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
                        Weapon Special Skill
                      </span>
                      <span className="text-xs font-mono-tabular text-amber-400">
                        +{effectiveSkill ? config.credits.itemskill : 0} cr
                      </span>
                    </label>
                  )}

                  {/* Excellent Options (ex_type 0, 1, 2, 4) — Max 3 Options */}
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
                          {lang === 'Thai'
                            ? `ออปชัน Excellent (สูงสุด ${maxExlAllowed} ออปชัน)`
                            : lang === 'Portuguese_BR'
                            ? `Opções Excelentes (Máx. ${maxExlAllowed} opções)`
                            : lang === 'Russian'
                            ? `Опции Excellent (макс. ${maxExlAllowed} опции)`
                            : lang === 'Spanish'
                            ? `Opciones Excellent (Máx. ${maxExlAllowed} opciones)`
                            : lang === 'Bulgarian'
                            ? `Опции Excellent (макс. ${maxExlAllowed} опции)`
                            : `Excellent Options (Max ${maxExlAllowed})`}
                        </span>
                        <span
                          className={`font-mono-tabular font-semibold ${
                            selectedExCount > maxExlAllowed
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {selectedExCount}/{maxExlAllowed} opt · +
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
                            {lang === 'Thai'
                              ? `คุณเลือกเกินกำหนด (${selectedExCount}/${maxExlAllowed} ออปชัน) กรุณานำออกอย่างน้อย ${
                                  selectedExCount - maxExlAllowed
                                } ออปชันจึงจะสามารถสั่งซื้อได้`
                              : lang === 'Portuguese_BR'
                              ? `Limite excedido (${selectedExCount}/${maxExlAllowed} opções). Desmarque pelo menos ${
                                  selectedExCount - maxExlAllowed
                                } opção(ões) para comprar.`
                              : lang === 'Russian'
                              ? `Превышен лимит (${selectedExCount}/${maxExlAllowed} опций). Снимите как минимум ${
                                  selectedExCount - maxExlAllowed
                                } опцию для покупки.`
                              : lang === 'Spanish'
                              ? `Límite superado (${selectedExCount}/${maxExlAllowed} opciones). Desmarca al menos ${
                                  selectedExCount - maxExlAllowed
                                } opción(es) para comprar.`
                              : lang === 'Bulgarian'
                              ? `Превишен лимит (${selectedExCount}/${maxExlAllowed} опции). Премахнете поне ${
                                  selectedExCount - maxExlAllowed
                                } опция(и) за покупка.`
                              : `Exceeded limit (${selectedExCount}/${maxExlAllowed} options). Uncheck ${
                                  selectedExCount - maxExlAllowed
                                } option(s) to buy.`}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ancient Stamina Options (ex_type === 3) */}
                  {activeItem.ex_type === 3 && (
                    <div className="p-3 rounded bg-zinc-950/60 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-blue-400">
                          Ancient Stamina Option
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
                                ? 'None'
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
                        Horn of Fenrir Evolution
                      </div>
                      <div className="space-y-1.5 text-xs text-zinc-300">
                        {[
                          { val: 0, label: 'Red Fenrir (Standard)', cost: 0 },
                          {
                            val: 1,
                            label: 'Black Fenrir (+Destroy / +10% Dmg)',
                            cost: config.credits.fenrir_destroy,
                          },
                          {
                            val: 2,
                            label: 'Blue Fenrir (+Protect / +10% Absorb)',
                            cost: config.credits.fenrir_protect,
                          },
                          {
                            val: 3,
                            label: 'Golden Fenrir (Rare v0.9)',
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
                      {lang === 'Portuguese_BR'
                        ? 'Prévia do Item no Jogo'
                        : lang === 'Russian'
                        ? 'Предпросмотр предмета в игре'
                        : lang === 'Spanish'
                        ? 'Vista previa del ítem en el juego'
                        : lang === 'Bulgarian'
                        ? 'Преглед на предмета в играта'
                        : 'In-Game Item Preview'}
                    </div>
                    <ItemTooltipCard tooltip={previewTooltip} />
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <div className="px-3 py-2 rounded bg-zinc-950/80 border border-zinc-800 text-[11px] flex items-center justify-between text-zinc-400 font-mono-tabular">
                      <span>
                        {lang === 'Portuguese_BR'
                          ? 'Localizador de Baú:'
                          : lang === 'Russian'
                          ? 'Слот в сундуке:'
                          : lang === 'Spanish'
                          ? 'Localizador de baúl:'
                          : lang === 'Bulgarian'
                          ? 'Място в сандъка:'
                          : 'Smart Vault Locator:'}
                      </span>
                      {targetSlot === 1337 ? (
                        <span className="text-rose-400 font-semibold">
                          Vault Full (No {activeItem.X}×{activeItem.Y} slot)
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">
                          Slot #{targetSlot} (Col {(targetSlot % 8) + 1}, Row{' '}
                          {Math.floor(targetSlot / 8) + 1})
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={targetSlot === 1337}
                      className="w-full py-3 px-4 rounded font-semibold text-xs bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
                    >
                      <PackagePlus className="w-4 h-4" />
                      {lang === 'Thai'
                        ? `เพิ่มไอเทมเข้าสู่ช่องว่างแรกในคลัง (${totalCredits.toLocaleString()} เครดิต)`
                        : lang === 'Portuguese_BR'
                        ? `Adicionar item ao primeiro espaço livre no Baú (${totalCredits.toLocaleString()} créditos)`
                        : lang === 'Russian'
                        ? `Добавить предмет в сундук (${totalCredits.toLocaleString()} кредитов)`
                        : lang === 'Spanish'
                        ? `Agregar ítem al primer espacio libre del baúl (${totalCredits.toLocaleString()} créditos)`
                        : lang === 'Bulgarian'
                        ? `Добави предмета в сандъка (${totalCredits.toLocaleString()} кредита)`
                        : `Add this item to the first open slot in your vault (${totalCredits.toLocaleString()} cr)`}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-8 rounded border border-zinc-800 bg-zinc-900/50 text-center text-xs text-zinc-400">
              {lang === 'Portuguese_BR'
                ? 'Selecione um item ou set na lista à esquerda para configurar nível, opção, luck, skill e atributos excelentes (máx. 3 opções).'
                : lang === 'Russian'
                ? 'Выберите предмет или сет из списка слева для настройки уровня, опций, удачи, навыка и опций Excellent (макс. 3 опции).'
                : lang === 'Spanish'
                ? 'Selecciona un ítem o set en la lista izquierda para configurar nivel, opciones, luck, skill y atributos Excellent (máx. 3 opciones).'
                : lang === 'Bulgarian'
                ? 'Изберете предмет или сет от списъка вляво, за да настроите ниво, опция, късмет, умение и Excellent опции (макс. 3 опции).'
                : 'Select an item or set from the list on the left to configure its level, options, luck, skill, and excellent attributes.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
