import React, { useEffect, useMemo, useState } from 'react';
import {
  AccountData,
  IpBanEntry,
  ItemGroup,
  LanguageCode,
  LogEntry,
  WebShopConfig,
  WebShopItem,
} from '../types/webshop';
import {
  CATEGORY_NAMES,
  formatItemTooltip,
  getCategoryName,
} from '../utils/muItemLogic';
import { WarehouseGrid } from './WarehouseGrid';
import { ItemTooltipCard } from './ItemTooltip';
import { L } from '../translations';
import {
  AlertTriangle,
  ArrowUpDown,
  Check,
  CheckCircle2,
  Coins,
  Copy,
  Crown,
  Download,
  Eye,
  FileSearch,
  Layers,
  Plus,
  Search,
  ShieldBan,
  Trash2,
  Trophy,
  Wrench,
  X,
} from 'lucide-react';

const getDateLocale = (lang: LanguageCode): string => {
  switch (lang) {
    case 'Thai':
      return 'th-TH';
    case 'Portuguese_BR':
      return 'pt-BR';
    case 'Russian':
      return 'ru-RU';
    case 'Spanish':
      return 'es-ES';
    case 'Bulgarian':
      return 'bg-BG';
    default:
      return 'en-US';
  }
};

// =========================================================================
// 1. Item Manager
// =========================================================================
export const ItemManagerModule: React.FC<{
  catalog: WebShopItem[];
  initialEditUid: number | null;
  lang?: LanguageCode;
  onUpdateItem: (updated: WebShopItem) => void;
  onAddItem: (newItem: WebShopItem) => void;
  onRemoveItem: (uid: number) => void;
}> = ({
  catalog,
  initialEditUid,
  lang = 'Thai',
  onUpdateItem,
  onAddItem,
  onRemoveItem,
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'create'>('edit');
  const [search, setSearch] = useState('');
  const [selectedUid, setSelectedUid] = useState<number>(
    initialEditUid || catalog[0]?.uid || 1
  );
  const [confirmRemoveUid, setConfirmRemoveUid] = useState<number | null>(null);
  const [savedNotice, setSavedNotice] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  useEffect(() => {
    if (initialEditUid) {
      setSelectedUid(initialEditUid);
      setActiveTab('edit');
    }
  }, [initialEditUid]);

  const activeItem =
    catalog.find((it) => it.uid === selectedUid) || catalog[0];

  const baseTemplateItem: WebShopItem = catalog[0] || {
    uid: 1,
    id: 0,
    type: 0,
    category: 0,
    name: '',
    credits: 100,
    X: 1,
    Y: 1,
    str: 0,
    agi: 0,
    nrg: 0,
    cmd: 0,
    ex_type: 0,
    hasLevel: 1,
    hasOption: 1,
    luck: 1,
    skill: 1,
    default_durability: 255,
    optionType: 0,
    stickLevel: 0,
    maxitop: 7,
    maxitlv: 13,
    maxitxl: 3,
    cansellitem: 1,
    class: 0,
    groupid: 0,
    thumb: '/items/00008000.gif',
    exlThumb: '/items/00008000.gif',
  };

  const [formState, setFormState] = useState<WebShopItem>(
    activeItem || baseTemplateItem
  );

  const nextUid = useMemo(() => {
    return catalog.length > 0
      ? Math.max(...catalog.map((it) => it.uid)) + 1
      : 1;
  }, [catalog]);

  const [newItemState, setNewItemState] = useState<WebShopItem>(() => ({
    ...baseTemplateItem,
    uid: nextUid,
    id: 0,
    type: 0,
    category: 0,
    name: '',
    credits: 100,
    X: 1,
    Y: 1,
    str: 0,
    agi: 0,
  }));

  useEffect(() => {
    setNewItemState((prev) => ({ ...prev, uid: nextUid }));
  }, [nextUid]);

  useEffect(() => {
    if (activeItem && activeTab === 'edit') {
      setFormState(activeItem);
      setConfirmRemoveUid(null);
    }
  }, [activeItem, activeTab]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (it) => it.name.toLowerCase().includes(q) || String(it.uid) === q
    );
  }, [catalog, search]);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateItem(formState);
    setSavedNotice({
      ok: true,
      text: L(lang, {
        en: `Saved item settings for "${formState.name}" (UID #${formState.uid}).`,
        th: `บันทึกการตั้งค่าไอเทม "${formState.name}" (UID #${formState.uid}) เรียบร้อยแล้ว`,
        pt: `Configurações do item "${formState.name}" (UID #${formState.uid}) salvas.`,
        ru: `Настройки предмета «${formState.name}» (UID #${formState.uid}) сохранены.`,
        es: `Configuración guardada para "${formState.name}" (UID #${formState.uid}).`,
        bg: `Настройките на предмет "${formState.name}" (UID #${formState.uid}) са запазени.`,
      }),
    });
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemState.name.trim()) return;
    const created: WebShopItem = {
      ...newItemState,
      name: newItemState.name.trim(),
    };
    onAddItem(created);
    setSavedNotice({
      ok: true,
      text: L(lang, {
        en: `Added new item "${created.name}" (UID #${created.uid}) to WebShop.`,
        th: `เพิ่มไอเทมใหม่ "${created.name}" (UID #${created.uid}) เข้าสู่ระบบสำเร็จ!`,
        pt: `Novo item "${created.name}" (UID #${created.uid}) adicionado ao WebShop.`,
        ru: `Добавлен новый предмет «${created.name}» (UID #${created.uid}).`,
        es: `Nuevo objeto "${created.name}" (UID #${created.uid}) añadido al WebShop.`,
        bg: `Добавен е нов предмет "${created.name}" (UID #${created.uid}).`,
      }),
    });
    setSelectedUid(created.uid);
    setActiveTab('edit');
    setNewItemState((prev) => ({
      ...prev,
      uid: prev.uid + 1,
      name: '',
    }));
  };

  const handleDuplicateCurrent = () => {
    const cloned: WebShopItem = {
      ...formState,
      uid: nextUid,
      name: `${formState.name} (Clone)`,
    };
    onAddItem(cloned);
    setSelectedUid(cloned.uid);
    setSavedNotice({
      ok: true,
      text: L(lang, {
        en: `Cloned item as "${cloned.name}" (UID #${cloned.uid}).`,
        th: `คัดลอกไอเทมเป็น "${cloned.name}" (UID #${cloned.uid}) สำเร็จ!`,
        pt: `Item duplicado como "${cloned.name}" (UID #${cloned.uid}).`,
        ru: `Предмет скопирован как «${cloned.name}» (UID #${cloned.uid}).`,
        es: `Objeto clonado como "${cloned.name}" (UID #${cloned.uid}).`,
        bg: `Предметът е клониран като "${cloned.name}" (UID #${cloned.uid}).`,
      }),
    });
  };

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/90 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {L(lang, {
                en: 'WebShop Item Manager',
                th: 'ระบบจัดการไอเทมในเว็บช็อป (Item Manager)',
                pt: 'Gerenciador de Itens do WebShop',
                ru: 'Управление предметами WebShop',
                es: 'Gestor de Objetos del WebShop',
                bg: 'Управление на предмети в WebShop',
              })}
            </h2>
            <p className="text-xs text-zinc-400">
              {L(lang, {
                en: `Manage store catalog (${catalog.length} items), configure prices, grid sizes, and options.`,
                th: `จัดการไอเทมทั้งหมดในระบบ (${catalog.length} รายการ) แก้ไขราคา ออปชัน และเพิ่มไอเทมใหม่`,
                pt: `Gerencie os itens do catálogo (${catalog.length} itens), preços, tamanhos e opções.`,
                ru: `Управление каталогом (${catalog.length} предметов), ценами, размерами и опциями.`,
                es: `Administra el catálogo (${catalog.length} objetos), precios, tamaños y opciones.`,
                bg: `Управлявайте каталога (${catalog.length} предмета), цени, размери и опции.`,
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${
              activeTab === 'edit'
                ? 'bg-amber-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {L(lang, {
              en: 'Edit Existing',
              th: 'แก้ไขไอเทมเดิม',
              pt: 'Editar Existente',
              ru: 'Редактировать',
              es: 'Editar Existente',
              bg: 'Редакция',
            })}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-emerald-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>
              {L(lang, {
                en: 'Add New Item',
                th: 'เพิ่มไอเทมใหม่',
                pt: 'Novo Item',
                ru: 'Новый предмет',
                es: 'Nuevo Objeto',
                bg: 'Нов предмет',
              })}
            </span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{savedNotice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setSavedNotice(null)}
            className="text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {activeTab === 'edit' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-amber-400" />
                {L(lang, {
                  en: 'Select Item',
                  th: 'เลือกไอเทมในระบบ',
                  pt: 'Selecionar Item',
                  ru: 'Выбор предмета',
                  es: 'Seleccionar Objeto',
                  bg: 'Избор на предмет',
                })}{' '}
                ({filteredItems.length})
              </span>
              <button
                type="button"
                onClick={handleDuplicateCurrent}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>
                  {L(lang, {
                    en: 'Duplicate',
                    th: 'คัดลอก',
                    pt: 'Duplicar',
                    ru: 'Копировать',
                    es: 'Duplicar',
                    bg: 'Дублирай',
                  })}
                </span>
              </button>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={L(lang, {
                en: 'Find item by name or UID...',
                th: 'ค้นหาชื่อไอเทม หรือ UID...',
                pt: 'Buscar por nome ou UID...',
                ru: 'Поиск по названию или UID...',
                es: 'Buscar por nombre o UID...',
                bg: 'Търсене по име или UID...',
              })}
              className="w-full px-3 py-1.5 text-xs rounded bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
            />
            <select
              size={16}
              value={selectedUid}
              onChange={(e) => {
                setSelectedUid(Number(e.target.value));
                setSavedNotice(null);
              }}
              className="w-full p-2 text-xs rounded bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono-tabular focus:outline-none"
            >
              {filteredItems.map((it) => (
                <option key={it.uid} value={it.uid} className="py-1">
                  #{it.uid} — {it.name} ({it.credits} Cr)
                </option>
              ))}
            </select>
          </div>

          <form
            onSubmit={handleSaveEdit}
            className="lg:col-span-8 p-5 rounded-xl border border-zinc-800 bg-zinc-900/80 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-zinc-800 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center p-1.5 shrink-0">
                  <img
                    src={formState.thumb}
                    alt={formState.name}
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-full object-contain pixelated"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {L(lang, {
                      en: 'Editing:',
                      th: 'กำลังแก้ไข:',
                      pt: 'Editando:',
                      ru: 'Редактирование:',
                      es: 'Editando:',
                      bg: 'Редактиране:',
                    })}{' '}
                    {formState.name} (UID #{formState.uid})
                  </h3>
                  <div className="text-[11px] font-mono-tabular text-zinc-400 truncate max-w-sm">
                    URL: {formState.thumb}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {confirmRemoveUid === formState.uid ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const removedUid = formState.uid;
                        onRemoveItem(removedUid);
                        setConfirmRemoveUid(null);
                        setSavedNotice({
                          ok: true,
                          text: L(lang, {
                            en: `Removed item #${removedUid}.`,
                            th: `ลบไอเทม #${removedUid} เรียบร้อยแล้ว`,
                            pt: `Item #${removedUid} removido.`,
                            ru: `Предмет #${removedUid} удалён.`,
                            es: `Objeto #${removedUid} eliminado.`,
                            bg: `Предмет #${removedUid} е премахнат.`,
                          }),
                        });
                      }}
                      className="px-3 py-1.5 rounded text-xs font-bold bg-rose-500 hover:bg-rose-400 text-zinc-950 cursor-pointer"
                    >
                      {L(lang, {
                        en: 'Confirm Delete',
                        th: 'ยืนยันลบ',
                        pt: 'Confirmar',
                        ru: 'Подтвердить',
                        es: 'Confirmar',
                        bg: 'Потвърди',
                      })}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmRemoveUid(null)}
                      className="px-2.5 py-1.5 rounded text-xs bg-zinc-800 text-zinc-300 cursor-pointer"
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
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmRemoveUid(formState.uid)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>
                      {L(lang, {
                        en: 'Remove Item',
                        th: 'ลบไอเทม',
                        pt: 'Remover Item',
                        ru: 'Удалить',
                        es: 'Eliminar',
                        bg: 'Премахни',
                      })}
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">
                  {L(lang, {
                    en: 'Item Name',
                    th: 'ชื่อไอเทม',
                    pt: 'Nome do Item',
                    ru: 'Название',
                    es: 'Nombre del Objeto',
                    bg: 'Име на предмет',
                  })}
                </label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(e) =>
                    setFormState({ ...formState, name: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  {L(lang, {
                    en: 'Credits (0 = Disabled)',
                    th: 'ราคาเครดิต (0 = ห้ามขาย)',
                    pt: 'Créditos (0 = Desativado)',
                    ru: 'Кредиты (0 = скрыто)',
                    es: 'Créditos (0 = Desactivado)',
                    bg: 'Кредити (0 = скрит)',
                  })}
                </label>
                <input
                  type="number"
                  value={formState.credits}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      credits: Number(e.target.value),
                    })
                  }
                  className="w-full px-2.5 py-1.5 font-mono-tabular rounded bg-zinc-950 border border-zinc-700 text-amber-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  {L(lang, {
                    en: 'Category',
                    th: 'หมวดหมู่ไอเทม',
                    pt: 'Categoria',
                    ru: 'Категория',
                    es: 'Categoría',
                    bg: 'Категория',
                  })}
                </label>
                <select
                  value={formState.category}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      category: Number(e.target.value),
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
                >
                  {Object.keys(CATEGORY_NAMES).map((id) => (
                    <option key={id} value={Number(id)}>
                      {getCategoryName(Number(id), lang)} ({id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  {L(lang, {
                    en: 'Grid Size (X × Y)',
                    th: 'ขนาดในคลัง (กว้าง × สูง)',
                    pt: 'Tamanho no Baú (X × Y)',
                    ru: 'Размер в сундуке (X × Y)',
                    es: 'Tamaño en Baúl (X × Y)',
                    bg: 'Размер в сандъка (X × Y)',
                  })}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={formState.X}
                    onChange={(e) =>
                      setFormState({ ...formState, X: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 font-mono-tabular rounded bg-zinc-950 border border-zinc-700 text-zinc-100 text-center"
                  />
                  <span>×</span>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={formState.Y}
                    onChange={(e) =>
                      setFormState({ ...formState, Y: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 font-mono-tabular rounded bg-zinc-950 border border-zinc-700 text-zinc-100 text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  {L(lang, {
                    en: 'STR / AGI Req',
                    th: 'สเตตัสที่ต้องการ (STR / AGI)',
                    pt: 'Req. STR / AGI',
                    ru: 'Треб. STR / AGI',
                    es: 'Req. STR / AGI',
                    bg: 'Изиск. STR / AGI',
                  })}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formState.str}
                    onChange={(e) =>
                      setFormState({ ...formState, str: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1.5 font-mono-tabular rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
                    placeholder="STR"
                  />
                  <input
                    type="number"
                    value={formState.agi}
                    onChange={(e) =>
                      setFormState({ ...formState, agi: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1.5 font-mono-tabular rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
                    placeholder="AGI"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  {L(lang, {
                    en: 'Excellent Type',
                    th: 'ประเภท Excellent (ex_type)',
                    pt: 'Tipo Excellent',
                    ru: 'Тип Excellent',
                    es: 'Tipo Excellent',
                    bg: 'Тип Excellent',
                  })}
                </label>
                <select
                  value={formState.ex_type}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      ex_type: Number(e.target.value),
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
                >
                  <option value={-1}>-1: None</option>
                  <option value={0}>0: Weapon</option>
                  <option value={1}>1: Armor / Shield</option>
                  <option value={2}>2: Wings S2</option>
                  <option value={3}>3: Ancient</option>
                  <option value={4}>4: Wings S3</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-zinc-400 mb-1">
                  {L(lang, {
                    en: 'Image URL',
                    th: 'URL รูปภาพไอเทม',
                    pt: 'URL da Imagem',
                    ru: 'URL изображения',
                    es: 'URL de Imagen',
                    bg: 'URL на изображение',
                  })}
                </label>
                <input
                  type="text"
                  value={formState.thumb}
                  onChange={(e) =>
                    setFormState({ ...formState, thumb: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 font-mono text-zinc-300 rounded bg-zinc-950 border border-zinc-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 text-xs">
              {[
                {
                  key: 'hasLevel',
                  label: L(lang, {
                    en: 'Level +1..13',
                    th: 'มีระดับ +1..13',
                    pt: 'Nível +1..13',
                    ru: 'Уровень +1..13',
                    es: 'Nivel +1..13',
                    bg: 'Ниво +1..13',
                  }),
                },
                {
                  key: 'hasOption',
                  label: L(lang, {
                    en: 'Option +4..28',
                    th: 'มีออปชัน +4..28',
                    pt: 'Opção +4..28',
                    ru: 'Опция +4..28',
                    es: 'Opción +4..28',
                    bg: 'Опция +4..28',
                  }),
                },
                { key: 'luck', label: 'Luck' },
                { key: 'skill', label: 'Skill' },
                {
                  key: 'cansellitem',
                  label: L(lang, {
                    en: '50% Refund',
                    th: 'ขายคืนรับ 50%',
                    pt: 'Venda 50%',
                    ru: 'Возврат 50%',
                    es: 'Reembolso 50%',
                    bg: 'Продажба 50%',
                  }),
                },
              ].map((flag) => (
                <label
                  key={flag.key}
                  className="flex items-center gap-2 p-2 rounded bg-zinc-950 border border-zinc-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(
                      (formState as unknown as Record<string, number>)[flag.key]
                    )}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        [flag.key]: e.target.checked ? 1 : 0,
                      })
                    }
                    className="accent-amber-500"
                  />
                  <span>{flag.label}</span>
                </label>
              ))}
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors cursor-pointer shadow-lg"
              >
                {L(lang, {
                  en: 'Save Changes',
                  th: 'บันทึกการเปลี่ยนแปลงไอเทม',
                  pt: 'Salvar Alterações',
                  ru: 'Сохранить изменения',
                  es: 'Guardar Cambios',
                  bg: 'Запази промените',
                })}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <form
          onSubmit={handleCreateNew}
          className="p-6 rounded-xl border border-emerald-500/30 bg-zinc-900/90 space-y-4 max-w-3xl"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <Plus className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              {L(lang, {
                en: 'Add New WebShop Item',
                th: 'เพิ่มไอเทมใหม่เข้าสู่ระบบ WebShop',
                pt: 'Adicionar Novo Item ao WebShop',
                ru: 'Добавить новый предмет в WebShop',
                es: 'Añadir Nuevo Objeto al WebShop',
                bg: 'Добави нов предмет в WebShop',
              })}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1">UID (Auto)</label>
              <input
                type="number"
                disabled
                value={newItemState.uid}
                className="w-full px-2.5 py-1.5 font-mono-tabular rounded bg-zinc-950 border border-zinc-800 text-zinc-400"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-zinc-400 mb-1">
                {L(lang, {
                  en: 'Item Name',
                  th: 'ชื่อไอเทม',
                  pt: 'Nome do Item',
                  ru: 'Название',
                  es: 'Nombre del Objeto',
                  bg: 'Име на предмет',
                })}
              </label>
              <input
                type="text"
                required
                value={newItemState.name}
                onChange={(e) =>
                  setNewItemState({ ...newItemState, name: e.target.value })
                }
                placeholder={L(lang, {
                  en: 'Enter item name',
                  th: 'ระบุชื่อไอเทม',
                  pt: 'Digite o nome do item',
                  ru: 'Введите название предмета',
                  es: 'Ingresa el nombre del objeto',
                  bg: 'Въведете име на предмета',
                })}
                className="w-full px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">
                {L(lang, {
                  en: 'Credits',
                  th: 'ราคาเครดิต',
                  pt: 'Créditos',
                  ru: 'Кредиты',
                  es: 'Créditos',
                  bg: 'Кредити',
                })}
              </label>
              <input
                type="number"
                min={0}
                required
                value={newItemState.credits}
                onChange={(e) =>
                  setNewItemState({
                    ...newItemState,
                    credits: Number(e.target.value),
                  })
                }
                className="w-full px-2.5 py-1.5 font-mono-tabular rounded bg-zinc-950 border border-zinc-700 text-amber-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">
                {L(lang, {
                  en: 'Category',
                  th: 'หมวดหมู่',
                  pt: 'Categoria',
                  ru: 'Категория',
                  es: 'Categoría',
                  bg: 'Категория',
                })}
              </label>
              <select
                value={newItemState.category}
                onChange={(e) =>
                  setNewItemState({
                    ...newItemState,
                    category: Number(e.target.value),
                  })
                }
                className="w-full px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
              >
                {Object.keys(CATEGORY_NAMES).map((id) => (
                  <option key={id} value={Number(id)}>
                    {getCategoryName(Number(id), lang)} ({id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">
                {L(lang, {
                  en: 'Size (X × Y)',
                  th: 'ขนาด (X × Y)',
                  pt: 'Tamanho (X × Y)',
                  ru: 'Размер (X × Y)',
                  es: 'Tamaño (X × Y)',
                  bg: 'Размер (X × Y)',
                })}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={newItemState.X}
                  onChange={(e) =>
                    setNewItemState({ ...newItemState, X: Number(e.target.value) })
                  }
                  className="w-full px-2 py-1.5 font-mono-tabular rounded bg-zinc-950 border border-zinc-700 text-zinc-100 text-center"
                />
                <span>×</span>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={newItemState.Y}
                  onChange={(e) =>
                    setNewItemState({ ...newItemState, Y: Number(e.target.value) })
                  }
                  className="w-full px-2 py-1.5 font-mono-tabular rounded bg-zinc-950 border border-zinc-700 text-zinc-100 text-center"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-zinc-400 mb-1">
                {L(lang, {
                  en: 'Image URL',
                  th: 'URL รูปภาพ',
                  pt: 'URL da Imagem',
                  ru: 'URL изображения',
                  es: 'URL de Imagen',
                  bg: 'URL на изображение',
                })}
              </label>
              <input
                type="text"
                value={newItemState.thumb}
                onChange={(e) =>
                  setNewItemState({ ...newItemState, thumb: e.target.value })
                }
                className="w-full px-2.5 py-1.5 font-mono text-zinc-300 rounded bg-zinc-950 border border-zinc-700"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className="px-4 py-2 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
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
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 cursor-pointer shadow-lg"
            >
              {L(lang, {
                en: 'Create Item',
                th: 'ยืนยันเพิ่มไอเทมใหม่',
                pt: 'Criar Item',
                ru: 'Создать предмет',
                es: 'Crear Objeto',
                bg: 'Създай предмет',
              })}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

// =========================================================================
// 2. Item Group Manager
// =========================================================================
export const GroupManagerModule: React.FC<{
  groups: ItemGroup[];
  catalog: WebShopItem[];
  lang?: LanguageCode;
  onAddGroup: (group: ItemGroup) => void;
  onUpdateGroup?: (group: ItemGroup) => void;
  onDeleteGroup: (id: number) => void;
}> = ({
  groups,
  catalog,
  lang = 'Thai',
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
}) => {
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const nextGid = useMemo(() => {
    return groups.length > 0 ? Math.max(...groups.map((g) => g.id)) + 1 : 1;
  }, [groups]);

  const [gid, setGid] = useState(nextGid);
  const [grname, setGrname] = useState('');
  const [gcr, setGcr] = useState(500);
  const [basedon, setBasedon] = useState(catalog[0]?.uid || 1);
  const [selectedMembers, setSelectedMembers] = useState<number[]>(
    catalog[0] ? [catalog[0].uid] : []
  );
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (editingGroupId === null) {
      setGid(nextGid);
    }
  }, [nextGid, editingGroupId]);

  const handleEditClick = (grp: ItemGroup) => {
    setEditingGroupId(grp.id);
    setGid(grp.id);
    setGrname(grp.name);
    setGcr(grp.credits);
    setBasedon(grp.basedon);
    setSelectedMembers(grp.memberUids);
  };

  const handleResetForm = () => {
    setEditingGroupId(null);
    setGid(nextGid);
    setGrname('');
    setGcr(500);
    setSelectedMembers(catalog[0] ? [catalog[0].uid] : []);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grname.trim()) return;

    const groupPayload: ItemGroup = {
      id: gid,
      name: grname.trim(),
      credits: gcr,
      basedon: basedon || selectedMembers[0] || 1,
      memberUids: selectedMembers.length > 0 ? selectedMembers : [basedon],
    };

    if (editingGroupId !== null && onUpdateGroup) {
      onUpdateGroup(groupPayload);
      setMsg({
        ok: true,
        text: L(lang, {
          en: `Updated item set #${gid} (${groupPayload.name}).`,
          th: `อัปเดตเซ็ตไอเทม #${gid} (${groupPayload.name}) สำเร็จ!`,
          pt: `Conjunto #${gid} (${groupPayload.name}) atualizado.`,
          ru: `Набор #${gid} («${groupPayload.name}») обновлён.`,
          es: `Set #${gid} (${groupPayload.name}) actualizado.`,
          bg: `Сет #${gid} (${groupPayload.name}) е обновен.`,
        }),
      });
    } else {
      onAddGroup(groupPayload);
      setMsg({
        ok: true,
        text: L(lang, {
          en: `Created new item set #${gid} (${groupPayload.name}).`,
          th: `สร้างเซ็ตไอเทมใหม่ #${gid} (${groupPayload.name}) สำเร็จ!`,
          pt: `Novo conjunto #${gid} (${groupPayload.name}) criado.`,
          ru: `Создан новый набор #${gid} («${groupPayload.name}»).`,
          es: `Nuevo set #${gid} (${groupPayload.name}) creado.`,
          bg: `Създаден е нов сет #${gid} (${groupPayload.name}).`,
        }),
      });
    }
    handleResetForm();
  };

  const toggleMemberItem = (uid: number) => {
    setSelectedMembers((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/90 space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              {editingGroupId !== null
                ? L(lang, {
                    en: `Edit Item Set #${editingGroupId}`,
                    th: `แก้ไขเซ็ตไอเทม #${editingGroupId}`,
                    pt: `Editar Conjunto #${editingGroupId}`,
                    ru: `Редактирование набора #${editingGroupId}`,
                    es: `Editar Set #${editingGroupId}`,
                    bg: `Редакция на сет #${editingGroupId}`,
                  })
                : L(lang, {
                    en: 'Add New Item Set Group',
                    th: 'เพิ่มเซ็ตไอเทมใหม่ (Item Group Manager)',
                    pt: 'Adicionar Novo Conjunto de Itens',
                    ru: 'Добавить новый набор предметов',
                    es: 'Añadir Nuevo Set de Objetos',
                    bg: 'Добави нов сет предмети',
                  })}
            </h3>
          </div>
          {editingGroupId !== null && (
            <button
              type="button"
              onClick={handleResetForm}
              className="text-xs text-amber-400 hover:underline cursor-pointer"
            >
              {L(lang, {
                en: 'Cancel Edit',
                th: 'ยกเลิกการแก้ไข',
                pt: 'Cancelar Edição',
                ru: 'Отменить редактирование',
                es: 'Cancelar Edición',
                bg: 'Отказ на редакцията',
              })}
            </button>
          )}
        </div>

        {msg && (
          <div className="p-3 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-xs flex items-center justify-between">
            <span>{msg.text}</span>
            <button
              type="button"
              onClick={() => setMsg(null)}
              className="cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">Group ID</label>
            <input
              type="number"
              value={gid}
              disabled={editingGroupId !== null}
              onChange={(e) => setGid(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 font-mono-tabular rounded bg-zinc-950 border border-zinc-700 text-zinc-100 disabled:opacity-50"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-zinc-400 mb-1">
              {L(lang, {
                en: 'Set Name',
                th: 'ชื่อเซ็ตไอเทม',
                pt: 'Nome do Conjunto',
                ru: 'Название набора',
                es: 'Nombre del Set',
                bg: 'Име на сета',
              })}
            </label>
            <input
              type="text"
              required
              value={grname}
              onChange={(e) => setGrname(e.target.value)}
              placeholder={L(lang, {
                en: 'Enter item set name',
                th: 'ระบุชื่อเซ็ตไอเทม',
                pt: 'Digite o nome do conjunto',
                ru: 'Введите название набора',
                es: 'Ingresa el nombre del set',
                bg: 'Въведете име на сета',
              })}
              className="w-full px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">
              {L(lang, {
                en: 'Set Credits',
                th: 'ราคาเซ็ต (Credits)',
                pt: 'Créditos do Set',
                ru: 'Кредиты за набор',
                es: 'Créditos del Set',
                bg: 'Кредити за сета',
              })}
            </label>
            <input
              type="number"
              min={0}
              required
              value={gcr}
              onChange={(e) => setGcr(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 font-mono-tabular rounded bg-zinc-950 border border-zinc-700 text-amber-400 font-bold"
            />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-zinc-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-300">
              {L(lang, {
                en: `Select Member Items Included in Set (${selectedMembers.length} selected):`,
                th: `เลือกชิ้นส่วนไอเทมที่รวมในเซ็ตนี้ (เลือกแล้ว ${selectedMembers.length} ชิ้น):`,
                pt: `Selecione os itens incluídos no conjunto (${selectedMembers.length} selecionados):`,
                ru: `Выберите предметы набора (выбрано ${selectedMembers.length}):`,
                es: `Selecciona los objetos del set (${selectedMembers.length} seleccionados):`,
                bg: `Изберете предмети в сета (избрани ${selectedMembers.length}):`,
              })}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 rounded bg-zinc-950 border border-zinc-800">
            {catalog.map((it) => {
              const isSelected = selectedMembers.includes(it.uid);
              return (
                <button
                  key={it.uid}
                  type="button"
                  onClick={() => toggleMemberItem(it.uid)}
                  className={`p-2 rounded border text-left text-[11px] flex items-center gap-2 cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/15 text-white'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-zinc-950 shrink-0 flex items-center justify-center p-0.5">
                    <img
                      src={it.thumb}
                      alt={it.name}
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-full object-contain pixelated"
                    />
                  </div>
                  <div className="truncate flex-1">
                    <div className="truncate font-medium">{it.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono-tabular">
                      #{it.uid}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end pt-2 gap-2">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors cursor-pointer shadow-lg"
          >
            {editingGroupId !== null
              ? L(lang, {
                  en: 'Save Set Changes',
                  th: 'บันทึกการแก้ไขเซ็ต',
                  pt: 'Salvar Conjunto',
                  ru: 'Сохранить набор',
                  es: 'Guardar Set',
                  bg: 'Запази сета',
                })
              : L(lang, {
                  en: '+ Add Item Set',
                  th: '+ บันทึกเซ็ตไอเทมใหม่',
                  pt: '+ Adicionar Conjunto',
                  ru: '+ Добавить набор',
                  es: '+ Añadir Set',
                  bg: '+ Добави сет',
                })}
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between text-xs font-semibold text-zinc-200">
          <span>
            {L(lang, {
              en: 'All Configured Item Sets',
              th: 'รายการเซ็ตไอเทมทั้งหมดในเว็บช็อป',
              pt: 'Todos os Conjuntos Configurados',
              ru: 'Настроенные наборы предметов',
              es: 'Sets de Objetos Configurados',
              bg: 'Конфигурирани сетове предмети',
            })}{' '}
            ({groups.length})
          </span>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-950/60 text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="px-4 py-2.5">ID</th>
              <th className="px-4 py-2.5">
                {L(lang, {
                  en: 'Group Name',
                  th: 'ชื่อเซ็ต',
                  pt: 'Nome do Conjunto',
                  ru: 'Название',
                  es: 'Nombre del Set',
                  bg: 'Име на сет',
                })}
              </th>
              <th className="px-4 py-2.5">
                {L(lang, {
                  en: 'Credits',
                  th: 'ราคาเครดิต',
                  pt: 'Créditos',
                  ru: 'Кредиты',
                  es: 'Créditos',
                  bg: 'Кредити',
                })}
              </th>
              <th className="px-4 py-2.5">
                {L(lang, {
                  en: 'Items in Set',
                  th: 'ชิ้นส่วนในเซ็ต',
                  pt: 'Itens no Conjunto',
                  ru: 'Предметы',
                  es: 'Objetos en Set',
                  bg: 'Предмети в сета',
                })}
              </th>
              <th className="px-4 py-2.5 text-right">
                {L(lang, {
                  en: 'Action',
                  th: 'จัดการ',
                  pt: 'Ação',
                  ru: 'Действие',
                  es: 'Acción',
                  bg: 'Действие',
                })}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {groups.map((grp) => (
              <tr key={grp.id} className="hover:bg-zinc-800/40">
                <td className="px-4 py-2.5 font-mono-tabular text-zinc-400">
                  #{grp.id}
                </td>
                <td className="px-4 py-2.5 font-bold text-white">{grp.name}</td>
                <td className="px-4 py-2.5 font-mono-tabular text-amber-400 font-bold">
                  {grp.credits.toLocaleString()} Cr
                </td>
                <td className="px-4 py-2.5 text-zinc-300">
                  <div className="flex flex-wrap gap-1 max-w-md">
                    {grp.memberUids.map((u) => {
                      const item = catalog.find((c) => c.uid === u);
                      return (
                        <span
                          key={u}
                          className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 font-mono-tabular"
                        >
                          {item?.name || `#${u}`}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEditClick(grp)}
                    className="text-amber-400 hover:underline cursor-pointer"
                  >
                    {L(lang, {
                      en: 'Edit',
                      th: 'แก้ไข',
                      pt: 'Editar',
                      ru: 'Ред.',
                      es: 'Editar',
                      bg: 'Ред.',
                    })}
                  </button>
                  {confirmDeleteId === grp.id ? (
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteGroup(grp.id);
                        setConfirmDeleteId(null);
                      }}
                      className="text-rose-300 font-bold hover:underline cursor-pointer"
                    >
                      {L(lang, {
                        en: 'Confirm?',
                        th: 'ยืนยันลบ?',
                        pt: 'Confirmar?',
                        ru: 'Точно?',
                        es: '¿Confirmar?',
                        bg: 'Потвърди?',
                      })}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(grp.id)}
                      className="text-rose-400 hover:underline cursor-pointer"
                    >
                      {L(lang, {
                        en: 'Delete',
                        th: 'ลบ',
                        pt: 'Excluir',
                        ru: 'Удалить',
                        es: 'Eliminar',
                        bg: 'Изтрий',
                      })}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// =========================================================================
// 3. Account Credit & Zen Manager
// =========================================================================
export const ManageCreditsModule: React.FC<{
  accounts: AccountData[];
  initialUser?: string;
  lang?: LanguageCode;
  onAdjustCredits: (
    username: string,
    delta: number
  ) =>
    | Promise<{ ok: boolean; credits?: number; vaultMoney?: number; message?: string }>
    | number;
  onAdjustVaultZen?: (
    username: string,
    amount: number
  ) =>
    | Promise<{ ok: boolean; credits?: number; vaultMoney?: number; message?: string }>
    | void;
}> = ({
  accounts,
  initialUser,
  lang = 'Thai',
  onAdjustCredits,
  onAdjustVaultZen,
}) => {
  const [uacc, setUacc] = useState(initialUser || accounts[0]?.username || '');
  const [ucr, setUcr] = useState(500);
  const [mode, setMode] = useState<'adjust' | 'zen'>('adjust');
  const [zenAmount, setZenAmount] = useState<number>(100_000_000);
  const [isSaving, setIsSaving] = useState(false);
  const [resultMsg, setResultMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  useEffect(() => {
    if (initialUser) setUacc(initialUser);
    else if (!uacc && accounts.length > 0) setUacc(accounts[0].username);
  }, [initialUser, accounts]);

  const selectedAccountData = useMemo(() => {
    return accounts.find(
      (a) => a.username.toLowerCase() === uacc.trim().toLowerCase()
    );
  }, [accounts, uacc]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = uacc.trim();
    if (!targetUser || isSaving) return;

    setIsSaving(true);
    setResultMsg(null);

    try {
      if (mode === 'adjust') {
        const res = await onAdjustCredits(targetUser, ucr);
        if (typeof res === 'number') {
          setResultMsg({
            ok: true,
            text: L(lang, {
              en: `Updated "${targetUser}" credit balance. Current total: ${res.toLocaleString()} Credits.`,
              th: `อัปเดตเครดิตของ "${targetUser}" สำเร็จ! ยอดปัจจุบันคือ ${res.toLocaleString()} Credits`,
              pt: `Saldo de créditos de "${targetUser}" atualizado: ${res.toLocaleString()} Créditos.`,
              ru: `Баланс кредитов «${targetUser}» обновлён: ${res.toLocaleString()} кредитов.`,
              es: `Saldo de créditos de "${targetUser}" actualizado: ${res.toLocaleString()} Créditos.`,
              bg: `Кредитният баланс на "${targetUser}" е обновен: ${res.toLocaleString()} кредита.`,
            }),
          });
        } else if (res.ok) {
          const newBal = res.credits ?? 0;
          setResultMsg({
            ok: true,
            text:
              res.message ||
              L(lang, {
                en: `Updated "${targetUser}" credit balance in database. Current total: ${newBal.toLocaleString()} Credits.`,
                th: `บันทึกเครดิตของ "${targetUser}" ลงฐานข้อมูลสำเร็จ! ยอดปัจจุบันคือ ${newBal.toLocaleString()} Credits`,
                pt: `Saldo de créditos de "${targetUser}" atualizado: ${newBal.toLocaleString()} Créditos.`,
                ru: `Баланс кредитов «${targetUser}» обновлён: ${newBal.toLocaleString()} кредитов.`,
                es: `Saldo de créditos de "${targetUser}" actualizado: ${newBal.toLocaleString()} Créditos.`,
                bg: `Кредитният баланс на "${targetUser}" е обновен: ${newBal.toLocaleString()} кредита.`,
              }),
          });
        } else {
          setResultMsg({
            ok: false,
            text:
              res.message ||
              L(lang, {
                en: 'Failed to update credits.',
                th: 'ไม่สามารถอัปเดตเครดิตได้ กรุณาตรวจสอบชื่อบัญชี',
              }),
          });
        }
      } else if (mode === 'zen' && onAdjustVaultZen) {
        const res = await onAdjustVaultZen(targetUser, zenAmount);
        if (res && typeof res === 'object') {
          if (res.ok) {
            const newZen = res.vaultMoney ?? 0;
            setResultMsg({
              ok: true,
              text:
                res.message ||
                L(lang, {
                  en: `Updated "${targetUser}" Vault Zen in database. Current total: ${newZen.toLocaleString()} Zen.`,
                  th: `บันทึกยอดเงิน Zen ในคลังของ "${targetUser}" ลงฐานข้อมูลสำเร็จ! ยอดปัจจุบันคือ ${newZen.toLocaleString()} Zen`,
                  pt: `Zen do baú de "${targetUser}" atualizado: ${newZen.toLocaleString()} Zen.`,
                  ru: `Zen сундука «${targetUser}» обновлён: ${newZen.toLocaleString()} Zen.`,
                  es: `Zen del baúl de "${targetUser}" actualizado: ${newZen.toLocaleString()} Zen.`,
                  bg: `Zen в сандъка на "${targetUser}" е обновен: ${newZen.toLocaleString()} Zen.`,
                }),
            });
          } else {
            setResultMsg({
              ok: false,
              text:
                res.message ||
                L(lang, {
                  en: 'Failed to update Vault Zen.',
                  th: 'ไม่สามารถอัปเดตเงิน Zen ได้ กรุณาตรวจสอบชื่อบัญชี',
                }),
            });
          }
        } else {
          setResultMsg({
            ok: true,
            text: L(lang, {
              en: `Adjusted vault Zen for "${targetUser}" by ${(zenAmount / 1_000_000).toLocaleString()}M Zen.`,
              th: `ปรับยอดเงิน Zen ในคลังของ "${targetUser}" (${zenAmount >= 0 ? '+' : ''}${(zenAmount / 1_000_000).toLocaleString()}M Zen) สำเร็จ!`,
            }),
          });
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div className="p-5 rounded-2xl fantasy-panel gold-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-display font-bold text-white tracking-wider">
              {L(lang, {
                en: 'Manage Account Credits & Zen',
                th: 'จัดการเครดิตและเงิน Zen ของผู้เล่น',
                pt: 'Gerenciar Créditos e Zen da Conta',
                ru: 'Управление кредитами и Zen аккаунта',
                es: 'Gestionar Créditos y Zen de Cuenta',
                bg: 'Управление на кредити и Zen на акаунт',
              })}
            </h2>
            <p className="text-xs text-white/60">
              {L(lang, {
                en: 'Grant or deduct player Credits and Warehouse Zen directly in the database.',
                th: 'เพิ่มหรือลดเครดิตและเงิน Zen ในคลังของบัญชีผู้เล่นพร้อมบันทึกลงฐานข้อมูลทันที',
                pt: 'Adicione ou deduza Créditos e Zen do baú do jogador.',
                ru: 'Начисление или списание кредитов и Zen в сундуке игрока.',
                es: 'Añade o deduce Créditos y Zen del baúl del jugador.',
                bg: 'Добавяне или отнемане на кредити и Zen в сандъка.',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#090d16]/90 p-1 rounded-xl border border-white/15 text-xs">
          <button
            type="button"
            onClick={() => setMode('adjust')}
            className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors ${
              mode === 'adjust'
                ? 'bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] text-[#090d16] font-extrabold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Credits
          </button>
          <button
            type="button"
            onClick={() => setMode('zen')}
            className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors ${
              mode === 'zen'
                ? 'bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] text-[#090d16] font-extrabold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Vault Zen
          </button>
        </div>
      </div>

      {resultMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-mono-tabular flex items-center justify-between gap-3 ${
            resultMsg.ok
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
              : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {resultMsg.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{resultMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setResultMsg(null)}
            className="cursor-pointer text-white/60 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {selectedAccountData && (
        <div className="p-4 rounded-2xl fantasy-panel gold-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-white/55 block">
              {L(lang, {
                en: 'Account',
                th: 'บัญชีผู้เล่น',
                pt: 'Conta',
                ru: 'Аккаунт',
                es: 'Cuenta',
                bg: 'Акаунт',
              })}
              :
            </span>
            <span className="font-bold text-white text-sm">
              {selectedAccountData.username}
            </span>
          </div>
          <div>
            <span className="text-white/55 block">Credits:</span>
            <span className="font-bold text-amber-400 font-mono-tabular text-sm">
              {selectedAccountData.credits.toLocaleString()} Cr
            </span>
          </div>
          <div>
            <span className="text-white/55 block">Vault Zen:</span>
            <span className="font-mono-tabular font-bold text-emerald-400 text-sm">
              {selectedAccountData.vaultMoney.toLocaleString()} Zen
            </span>
          </div>
          <div>
            <span className="text-white/55 block">VIP:</span>
            <span className="font-medium text-amber-300">
              {selectedAccountData.vipUntil &&
              new Date(selectedAccountData.vipUntil) > new Date()
                ? 'VIP Active'
                : 'Regular'}
            </span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-2xl fantasy-panel gold-border space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-white/80 font-semibold mb-1.5">
              {L(lang, {
                en: 'Target Account',
                th: 'ชื่อบัญชีเป้าหมาย (Account ID)',
                pt: 'Conta Alvo',
                ru: 'Целевой аккаунт',
                es: 'Cuenta Destino',
                bg: 'Целеви акаунт',
              })}
            </label>
            <input
              type="text"
              list="admin-acc-list"
              required
              value={uacc}
              onChange={(e) => setUacc(e.target.value)}
              placeholder={L(lang, {
                en: 'Enter account username',
                th: 'ระบุชื่อบัญชีผู้เล่น เช่น user01',
                pt: 'Digite o usuário da conta',
                ru: 'Введите логин аккаунта',
                es: 'Ingresa el usuario',
                bg: 'Въведете потребителско име',
              })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d16]/90 border border-white/15 focus:border-[#d4af37] text-white focus:outline-none"
            />
            <datalist id="admin-acc-list">
              {accounts.map((a) => (
                <option key={a.username} value={a.username}>
                  {a.username} ({a.credits.toLocaleString()} Cr · {(a.vaultMoney / 1_000_000).toFixed(0)}M Zen)
                </option>
              ))}
            </datalist>
          </div>

          {mode === 'adjust' ? (
            <div>
              <label className="block text-white/80 font-semibold mb-1.5">
                {L(lang, {
                  en: 'Credits Delta (+ or -)',
                  th: 'จำนวนเครดิต (+ เพิ่ม, - ลด)',
                  pt: 'Variação de Créditos (+ ou -)',
                  ru: 'Изменение кредитов (+ или -)',
                  es: 'Cambio de Créditos (+ o -)',
                  bg: 'Промяна на кредити (+ или -)',
                })}
              </label>
              <input
                type="number"
                value={ucr}
                onChange={(e) => setUcr(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 font-mono-tabular rounded-xl bg-[#090d16]/90 border border-white/15 focus:border-[#d4af37] text-amber-400 font-bold focus:outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="block text-white/80 font-semibold mb-1.5">
                {L(lang, {
                  en: 'Vault Zen Delta (+ or -)',
                  th: 'จำนวนเงิน Zen (+ เพิ่มเข้าคลัง, - หักออก)',
                  pt: 'Quantidade de Zen no Baú (+ ou -)',
                  ru: 'Сумма Zen в сундук (+ или -)',
                  es: 'Cantidad de Zen en Baúl (+ o -)',
                  bg: 'Сума на Zen в сандъка (+ или -)',
                })}
              </label>
              <input
                type="number"
                step={10000000}
                value={zenAmount}
                onChange={(e) => setZenAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 font-mono-tabular rounded-xl bg-[#090d16]/90 border border-white/15 focus:border-[#d4af37] text-emerald-400 font-bold focus:outline-none"
              />
            </div>
          )}
        </div>

        {mode === 'adjust' ? (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-white/60">
              {L(lang, {
                en: 'Quick Credit Presets:',
                th: 'ปุ่มลัดเลือกจำนวนเครดิต:',
                pt: 'Atalhos Rápidos:',
                ru: 'Быстрый выбор:',
                es: 'Ajustes Rápidos:',
                bg: 'Бърз избор:',
              })}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[+100, +500, +1000, +5000, +10000, -500, -1000, -5000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setUcr(val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono-tabular cursor-pointer border transition-colors ${
                    val > 0
                      ? 'bg-[#090d16]/80 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-[#090d16]/80 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {val > 0 ? `+${val.toLocaleString()}` : val.toLocaleString()} Cr
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-white/60">
              {L(lang, {
                en: 'Quick Vault Zen Presets (Max 900M):',
                th: 'ปุ่มลัดเลือกจำนวนเงิน Zen (สูงสุดในคลัง 900M):',
              })}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                +50_000_000,
                +100_000_000,
                +300_000_000,
                +500_000_000,
                +900_000_000,
                -100_000_000,
                -500_000_000,
              ].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setZenAmount(val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono-tabular cursor-pointer border transition-colors ${
                    val > 0
                      ? 'bg-[#090d16]/80 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-[#090d16]/80 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {val > 0
                    ? `+${(val / 1_000_000).toFixed(0)}M Zen`
                    : `${(val / 1_000_000).toFixed(0)}M Zen`}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-white/10">
          <button
            type="submit"
            disabled={isSaving || !uacc.trim()}
            className="btn-shine px-6 py-2.5 text-xs font-extrabold rounded-xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] text-[#090d16] transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {isSaving
              ? L(lang, {
                  en: 'Saving to Database...',
                  th: 'กำลังบันทึกลงฐานข้อมูล...',
                })
              : mode === 'adjust'
              ? L(lang, {
                  en: 'Confirm Credit Update',
                  th: 'ยืนยันปรับยอดเครดิต',
                  pt: 'Confirmar Créditos',
                  ru: 'Обновить кредиты',
                  es: 'Confirmar Créditos',
                  bg: 'Потвърди кредити',
                })
              : L(lang, {
                  en: 'Confirm Zen Update',
                  th: 'ยืนยันปรับยอด Zen',
                  pt: 'Confirmar Zen',
                  ru: 'Обновить Zen',
                  es: 'Confirmar Zen',
                  bg: 'Потвърди Zen',
                })}
          </button>
        </div>
      </form>

      {/* Player Accounts Quick Selection Table */}
      {accounts.length > 0 && (
        <div className="p-5 rounded-2xl fantasy-panel gold-border space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-xs font-display font-bold text-amber-300 tracking-wider">
              {L(lang, {
                en: 'Registered Accounts (Click to Select)',
                th: 'รายชื่อบัญชีผู้เล่นในระบบ (คลิกเพื่อเลือกบัญชี)',
              })}
            </h3>
            <span className="text-[11px] text-white/50 font-mono-tabular">
              {accounts.length} Accounts
            </span>
          </div>
          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-left text-xs">
              <thead className="text-white/55 border-b border-white/10">
                <tr>
                  <th className="py-2 pr-3">Account ID</th>
                  <th className="py-2 px-3 text-right">Credits</th>
                  <th className="py-2 px-3 text-right">Vault Zen</th>
                  <th className="py-2 pl-3 text-right">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {accounts.map((acc) => {
                  const isSelected =
                    acc.username.toLowerCase() === uacc.trim().toLowerCase();
                  return (
                    <tr
                      key={acc.username}
                      onClick={() => setUacc(acc.username)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-amber-500/15 text-white'
                          : 'hover:bg-white/5 text-white/80'
                      }`}
                    >
                      <td className="py-2 pr-3 font-bold text-white">
                        {acc.username}
                      </td>
                      <td className="py-2 px-3 text-right font-mono-tabular text-amber-400 font-bold">
                        {acc.credits.toLocaleString()} Cr
                      </td>
                      <td className="py-2 px-3 text-right font-mono-tabular text-emerald-400">
                        {acc.vaultMoney.toLocaleString()} Zen
                      </td>
                      <td className="py-2 pl-3 text-right font-mono-tabular text-[11px] text-white/60">
                        {acc.isAdmin ? 'ADMIN' : 'PLAYER'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 4. Hawk Eye — Audit & Shop Logs
// =========================================================================
export const HawkEyeLogModule: React.FC<{
  logs: LogEntry[];
  initialAccountFilter?: string;
  lang?: LanguageCode;
  onSelectAccountCredits: (username: string) => void;
  onSelectSerialSearch: (serial: string) => void;
  onClearLogs?: () => void;
}> = ({
  logs,
  initialAccountFilter = '',
  lang = 'Thai',
  onSelectAccountCredits,
  onSelectSerialSearch,
  onClearLogs,
}) => {
  const [sstr, setSstr] = useState('');
  const [sacc, setSacc] = useState(initialAccountFilter);
  const [todayOnly, setTodayOnly] = useState(false);
  const [sortDesc, setSortDesc] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (initialAccountFilter) setSacc(initialAccountFilter);
  }, [initialAccountFilter]);

  const filteredLogs = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todaySec = Math.floor(startOfToday.getTime() / 1000);

    const res = logs.filter((l) => {
      if (
        sstr.trim() &&
        !l.details.toLowerCase().includes(sstr.trim().toLowerCase())
      ) {
        return false;
      }
      if (
        sacc.trim() &&
        l.accountId.toLowerCase() !== sacc.trim().toLowerCase()
      ) {
        return false;
      }
      if (todayOnly && l.dateline < todaySec) {
        return false;
      }
      return true;
    });

    return res.sort((a, b) =>
      sortDesc ? b.dateline - a.dateline : a.dateline - b.dateline
    );
  }, [logs, sstr, sacc, todayOnly, sortDesc]);

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'AccountID',
      'IP_Address',
      'Action',
      'Item_Serial',
      'Item_Hex',
      'Details',
      'Timestamp',
      'ISO_Date',
    ];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.accountId}"`,
      `"${l.ipAddress || '127.0.0.1'}"`,
      `"${l.action || 'SHOP_ACTION'}"`,
      l.itemSerial || '',
      `"${l.itemHex || ''}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      l.dateline,
      `"${new Date(l.dateline * 1000).toISOString()}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join(
      '\n'
    );
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `egis_mu_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/80 flex flex-wrap items-end justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-zinc-400 mb-1">
              {L(lang, {
                en: 'Search Details',
                th: 'ค้นหาข้อความ',
                pt: 'Buscar Detalhes',
                ru: 'Поиск по деталям',
                es: 'Buscar Detalles',
                bg: 'Търсене в детайли',
              })}
            </label>
            <input
              type="text"
              value={sstr}
              onChange={(e) => setSstr(e.target.value)}
              placeholder={L(lang, {
                en: 'Item, serial, action...',
                th: 'ชื่อไอเทม, Serial, รายการ...',
                pt: 'Item, serial, ação...',
                ru: 'Предмет, серийник, действие...',
                es: 'Objeto, serial, acción...',
                bg: 'Предмет, сериен №, действие...',
              })}
              className="px-3 py-1.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">
              {L(lang, {
                en: 'Account',
                th: 'กรองตามบัญชี',
                pt: 'Conta',
                ru: 'Аккаунт',
                es: 'Cuenta',
                bg: 'Акаунт',
              })}
            </label>
            <input
              type="text"
              value={sacc}
              onChange={(e) => setSacc(e.target.value)}
              placeholder={L(lang, {
                en: 'Username...',
                th: 'ชื่อบัญชี...',
                pt: 'Usuário...',
                ru: 'Логин...',
                es: 'Usuario...',
                bg: 'Потребител...',
              })}
              className="px-3 py-1.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            />
          </div>
          <label className="flex items-center gap-2 py-1.5 text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={todayOnly}
              onChange={(e) => setTodayOnly(e.target.checked)}
              className="accent-amber-500"
            />
            <span>
              {L(lang, {
                en: 'Today Only',
                th: 'เฉพาะวันนี้',
                pt: 'Apenas Hoje',
                ru: 'Только сегодня',
                es: 'Solo Hoy',
                bg: 'Само днес',
              })}
            </span>
          </label>
          {(sstr || sacc || todayOnly) && (
            <button
              type="button"
              onClick={() => {
                setSstr('');
                setSacc('');
                setTodayOnly(false);
              }}
              className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
            >
              {L(lang, {
                en: 'Reset',
                th: 'ล้างตัวกรอง',
                pt: 'Limpar',
                ru: 'Сбросить',
                es: 'Limpiar',
                bg: 'Изчисти',
              })}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSortDesc(!sortDesc)}
            className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {sortDesc
                ? L(lang, {
                    en: 'Newest First',
                    th: 'ใหม่สุดก่อน',
                    pt: 'Mais Recentes',
                    ru: 'Сначала новые',
                    es: 'Más Recientes',
                    bg: 'Най-нови',
                  })
                : L(lang, {
                    en: 'Oldest First',
                    th: 'เก่าสุดก่อน',
                    pt: 'Mais Antigos',
                    ru: 'Сначала старые',
                    es: 'Más Antiguos',
                    bg: 'Най-стари',
                  })}
            </span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {L(lang, {
                en: 'Export CSV',
                th: 'ส่งออก CSV',
                pt: 'Exportar CSV',
                ru: 'Экспорт CSV',
                es: 'Exportar CSV',
                bg: 'Експорт CSV',
              })}
            </span>
          </button>
          {onClearLogs &&
            (confirmClear ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    onClearLogs();
                    setConfirmClear(false);
                  }}
                  className="px-3 py-1.5 rounded bg-rose-500 hover:bg-rose-400 text-zinc-950 font-bold cursor-pointer"
                >
                  {L(lang, {
                    en: 'Confirm Clear',
                    th: 'ยืนยันล้าง',
                    pt: 'Confirmar',
                    ru: 'Подтвердить',
                    es: 'Confirmar',
                    bg: 'Потвърди',
                  })}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-2 py-1.5 rounded bg-zinc-800 text-zinc-300 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="px-3 py-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 cursor-pointer"
              >
                {L(lang, {
                  en: 'Clear Logs',
                  th: 'ล้างประวัติ',
                  pt: 'Limpar Logs',
                  ru: 'Очистить логи',
                  es: 'Limpiar Logs',
                  bg: 'Изчисти логове',
                })}
              </button>
            ))}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden shadow-lg">
        <div className="px-4 py-3 border-b border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileSearch className="w-4 h-4 text-amber-400" />
            <span>
              {L(lang, {
                en: 'Hawk Eye Audit & Transaction Logs',
                th: 'ประวัติการทำรายการในร้านค้า (Hawk Eye Logs)',
                pt: 'Registros de Auditoria Hawk Eye',
                ru: 'Журнал транзакций Hawk Eye',
                es: 'Registros de Auditoría Hawk Eye',
                bg: 'Одит дневник Hawk Eye',
              })}
            </span>
          </span>
          <span className="text-zinc-500 font-mono-tabular">
            {filteredLogs.length} entries
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-2.5 w-16">ID</th>
                <th className="px-4 py-2.5 w-32">
                  {L(lang, {
                    en: 'Account / IP',
                    th: 'บัญชี / IP',
                    pt: 'Conta / IP',
                    ru: 'Аккаунт / IP',
                    es: 'Cuenta / IP',
                    bg: 'Акаунт / IP',
                  })}
                </th>
                <th className="px-4 py-2.5 w-40">
                  {L(lang, {
                    en: 'Action',
                    th: 'ประเภทธุรกรรม',
                    pt: 'Ação',
                    ru: 'Действие',
                    es: 'Acción',
                    bg: 'Действие',
                  })}
                </th>
                <th className="px-4 py-2.5">
                  {L(lang, {
                    en: 'Details & Item Hex/Serial',
                    th: 'รายละเอียด & Item Hex/Serial',
                    pt: 'Detalhes & Hex/Serial',
                    ru: 'Детали и Hex/Serial',
                    es: 'Detalles y Hex/Serial',
                    bg: 'Детайли и Hex/Serial',
                  })}
                </th>
                <th className="px-4 py-2.5 text-right w-44">
                  {L(lang, {
                    en: 'Timestamp',
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
              {filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-zinc-500"
                  >
                    {L(lang, {
                      en: 'No transaction logs recorded yet.',
                      th: 'ยังไม่มีประวัติการทำรายการในระบบ',
                      pt: 'Nenhum registro de transação encontrado.',
                      ru: 'Записи о транзакциях отсутствуют.',
                      es: 'Aún no hay registros de transacciones.',
                      bg: 'Все още няма записани транзакции.',
                    })}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-zinc-800/40">
                    <td className="px-4 py-2.5 font-mono-tabular text-zinc-500">
                      #{entry.id}
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        type="button"
                        onClick={() => onSelectAccountCredits(entry.accountId)}
                        className="font-semibold text-amber-400 hover:underline cursor-pointer block"
                      >
                        {entry.accountId}
                      </button>
                      <span className="text-[10px] font-mono-tabular text-zinc-500">
                        {entry.ipAddress || '127.0.0.1'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono-tabular text-[11px] text-zinc-300">
                      {entry.action ||
                        (entry.itemSerial ? 'PURCHASE_ITEM' : 'ACCOUNT_ACTION')}
                    </td>
                    <td className="px-4 py-2.5 text-zinc-200">
                      <div>{entry.details}</div>
                      {(entry.itemSerial || entry.itemHex) && (
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-mono-tabular">
                          {entry.itemSerial && (
                            <button
                              type="button"
                              onClick={() =>
                                onSelectSerialSearch(entry.itemSerial!)
                              }
                              className="text-emerald-400 hover:underline cursor-pointer"
                            >
                              [Serial: {entry.itemSerial}]
                            </button>
                          )}
                          {entry.itemHex && (
                            <span
                              className="text-zinc-400 truncate max-w-xs"
                              title={entry.itemHex}
                            >
                              Hex: {entry.itemHex}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono-tabular text-zinc-400">
                      {new Date(entry.dateline * 1000).toLocaleString(
                        getDateLocale(lang)
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 5. Serial Search & Anti-Dupe Tracker
// =========================================================================
export const SerialSearchModule: React.FC<{
  accounts: AccountData[];
  logs: LogEntry[];
  catalog: WebShopItem[];
  config: WebShopConfig;
  initialSerial?: string;
  lang?: LanguageCode;
  onAdminDeleteVaultItem?: (
    username: string,
    instanceId: string,
    serial: string
  ) => void;
}> = ({
  accounts,
  logs,
  catalog,
  config,
  initialSerial = '',
  lang = 'Thai',
  onAdminDeleteVaultItem,
}) => {
  const [serialInput, setSerialInput] = useState(initialSerial || '');
  const [confirmDeleteInstance, setConfirmDeleteInstance] = useState<
    string | null
  >(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    if (initialSerial) setSerialInput(initialSerial);
  }, [initialSerial]);

  const cleanSerial = serialInput.trim().toUpperCase();

  const matches = useMemo(() => {
    if (cleanSerial.length !== 8) return null;
    const vaultFound: {
      account: string;
      item: AccountData['vaultItems'][0];
    }[] = [];
    for (const acc of accounts) {
      for (const item of acc.vaultItems) {
        if (item.serial.toUpperCase() === cleanSerial) {
          vaultFound.push({ account: acc.username, item });
        }
      }
    }
    const logFound = logs.filter(
      (l) =>
        l.itemSerial?.toUpperCase() === cleanSerial ||
        l.details.toUpperCase().includes(cleanSerial)
    );
    return { vaultFound, logFound };
  }, [accounts, logs, cleanSerial]);

  return (
    <div className="max-w-4xl space-y-5">
      <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/80 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
          <FileSearch className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">
            {L(lang, {
              en: 'Item Serial Search & Anti-Dupe Tracker',
              th: 'ระบบค้นหาและตรวจจับ Serial ไอเทม (Serial Search & Dupe Tracker)',
              pt: 'Busca de Serial e Rastreador Anti-Dupe',
              ru: 'Поиск по серийному номеру и анти-дюп',
              es: 'Búsqueda de Serial y Rastreador Anti-Dupe',
              bg: 'Търсене на сериен номер и анти-дюп',
            })}
          </h3>
        </div>

        {actionNotice && (
          <div className="p-3 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-xs flex items-center justify-between">
            <span>{actionNotice}</span>
            <button
              type="button"
              onClick={() => setActionNotice(null)}
              className="cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs text-zinc-300">
            {L(lang, {
              en: 'Item Serial (8 Hex Digits):',
              th: 'กรอก Serial ไอเทม (เลขฐาน 16 จำนวน 8 หลัก):',
              pt: 'Serial do Item (8 dígitos Hex):',
              ru: 'Серийный номер предмета (8 Hex-символов):',
              es: 'Serial del Objeto (8 dígitos Hex):',
              bg: 'Сериен номер на предмета (8 Hex символа):',
            })}
          </label>
          <input
            type="text"
            maxLength={8}
            value={serialInput}
            onChange={(e) => setSerialInput(e.target.value)}
            placeholder="00A1B2C3"
            className="px-3 py-1.5 text-xs font-mono-tabular uppercase rounded bg-zinc-950 border border-zinc-700 text-amber-400 font-bold"
          />
        </div>

        {cleanSerial.length === 0 ? (
          <div className="text-xs text-zinc-400">
            {L(lang, {
              en: 'Enter an 8-character hexadecimal item serial to inspect vaults and purchase logs.',
              th: 'กรอกรหัส Serial 8 หลักเพื่อค้นหาตำแหน่งไอเทมในคลังและประวัติการสั่งซื้อ',
              pt: 'Digite um serial hexadecimal de 8 caracteres para buscar nos baús e registros.',
              ru: 'Введите 8-значный серийный номер для проверки сундуков и журнала покупок.',
              es: 'Ingresa un serial hexadecimal de 8 caracteres para inspeccionar baúles y registros.',
              bg: 'Въведете 8-символен шестнадесетичен сериен номер за проверка.',
            })}
          </div>
        ) : cleanSerial === '00000000' ? (
          <div className="p-3.5 rounded border border-rose-500/40 bg-rose-500/10 text-xs text-rose-200 leading-relaxed">
            {L(lang, {
              en: 'Warning: Serial 00000000 corresponds to non-serial/NPC items. Query the SQL database directly for full scans.',
              th: 'คำเตือน: การค้นหาไอเทม Serial 00000000 มีปริมาณมากบนเซิร์ฟเวอร์ กรุณาตรวจสอบผ่านฐานข้อมูล SQL โดยตรง',
              pt: 'Aviso: O serial 00000000 corresponde a itens de NPC. Consulte o banco SQL diretamente.',
              ru: 'Внимание: Серийный номер 00000000 относится к NPC-предметам. Проверьте базу SQL напрямую.',
              es: 'Advertencia: El serial 00000000 corresponde a objetos NPC. Consulta la base SQL directamente.',
              bg: 'Предупреждение: Сериен номер 00000000 е за NPC предмети. Проверете SQL базата директно.',
            })}
          </div>
        ) : cleanSerial.length !== 8 ? (
          <div className="text-xs text-rose-400">
            {L(lang, {
              en: 'The item serial must be exactly 8 hexadecimal characters long.',
              th: 'หมายเลข Serial ต้องมีขนาดตรง 8 ตัวอักษรพอดี',
              pt: 'O serial deve ter exatamente 8 caracteres.',
              ru: 'Серийный номер должен состоять ровно из 8 символов.',
              es: 'El serial debe tener exactamente 8 caracteres.',
              bg: 'Серийният номер трябва да е точно 8 символа.',
            })}
          </div>
        ) : (
          matches && (
            <div className="space-y-5 pt-2">
              <div className="space-y-3">
                <div className="text-xs font-bold text-zinc-200 flex items-center justify-between">
                  <span>
                    {L(lang, {
                      en: 'Found in Warehouse Vaults',
                      th: 'พบอยู่ในคลังของผู้เล่น (Warehouse Vaults)',
                      pt: 'Encontrado nos Baús',
                      ru: 'Найдено в сундуках игроков',
                      es: 'Encontrado en Baúles',
                      bg: 'Намерено в сандъци',
                    })}
                    : ({matches.vaultFound.length})
                  </span>
                  {matches.vaultFound.length > 1 && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-[10px] uppercase">
                      {L(lang, {
                        en: 'Dupe Detected!',
                        th: 'ตรวจพบ Serial ซ้ำ!',
                        pt: 'Dupe Detectado!',
                        ru: 'Обнаружен дюп!',
                        es: '¡Dupe Detectado!',
                        bg: 'Открит дубликат!',
                      })}
                    </span>
                  )}
                </div>

                {matches.vaultFound.length > 0 ? (
                  matches.vaultFound.map((vf, idx) => {
                    const catItem = catalog.find(
                      (c) => c.uid === vf.item.itemUid
                    );
                    const tip = formatItemTooltip(
                      vf.item,
                      catItem,
                      config,
                      lang
                    );
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                          <div className="text-xs text-emerald-400 font-medium">
                            {L(lang, {
                              en: 'Account:',
                              th: 'อยู่ในคลังบัญชี:',
                              pt: 'Conta:',
                              ru: 'Аккаунт:',
                              es: 'Cuenta:',
                              bg: 'Акаунт:',
                            })}{' '}
                            <strong className="text-white">{vf.account}</strong>{' '}
                            (Slot #{vf.item.slotIndex})
                          </div>
                          {onAdminDeleteVaultItem &&
                            (confirmDeleteInstance === vf.item.instanceId ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onAdminDeleteVaultItem(
                                      vf.account,
                                      vf.item.instanceId,
                                      vf.item.serial
                                    );
                                    setConfirmDeleteInstance(null);
                                    setActionNotice(
                                      L(lang, {
                                        en: `Deleted serial ${vf.item.serial} from ${vf.account}'s vault.`,
                                        th: `ลบไอเทม Serial ${vf.item.serial} จากคลังของ ${vf.account} สำเร็จ`,
                                        pt: `Serial ${vf.item.serial} removido do baú de ${vf.account}.`,
                                        ru: `Предмет ${vf.item.serial} удалён из сундука ${vf.account}.`,
                                        es: `Serial ${vf.item.serial} eliminado del baúl de ${vf.account}.`,
                                        bg: `Предмет ${vf.item.serial} е изтрит от сандъка на ${vf.account}.`,
                                      })
                                    );
                                  }}
                                  className="px-2.5 py-1 rounded bg-rose-500 text-zinc-950 text-xs font-bold cursor-pointer"
                                >
                                  {L(lang, {
                                    en: 'Confirm Delete',
                                    th: 'ยืนยันลบ',
                                    pt: 'Confirmar',
                                    ru: 'Подтвердить',
                                    es: 'Confirmar',
                                    bg: 'Потвърди',
                                  })}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteInstance(null)}
                                  className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs cursor-pointer"
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
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmDeleteInstance(vf.item.instanceId)
                                }
                                className="px-2.5 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold cursor-pointer"
                              >
                                {L(lang, {
                                  en: 'Delete from Vault',
                                  th: 'ลบออกจากคลังผู้เล่น',
                                  pt: 'Remover do Baú',
                                  ru: 'Удалить из сундука',
                                  es: 'Eliminar del Baúl',
                                  bg: 'Изтрий от сандъка',
                                })}
                              </button>
                            ))}
                        </div>
                        <ItemTooltipCard tooltip={tip} lang={lang} />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-zinc-500 p-3 rounded bg-zinc-950 border border-zinc-800/80">
                    {L(lang, {
                      en: 'Not currently found in any user warehouse.',
                      th: 'ไม่พบไอเทม Serial นี้ในคลังของผู้เล่นคนใดในขณะนี้',
                      pt: 'Não encontrado em nenhum baú de jogador.',
                      ru: 'Не найдено ни в одном сундуке игрока.',
                      es: 'No encontrado en ningún baúl de jugador.',
                      bg: 'Не е намерено в нито един сандък на играч.',
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-200">
                  {L(lang, {
                    en: 'Found in Purchase Logs',
                    th: 'ประวัติการซื้อในร้านค้าที่เกี่ยวข้อง',
                    pt: 'Registros de Compra Relacionados',
                    ru: 'Записи в журнале покупок',
                    es: 'Registros de Compra Relacionados',
                    bg: 'Записи в дневника за покупки',
                  })}
                  : ({matches.logFound.length})
                </div>
                {matches.logFound.length > 0 ? (
                  matches.logFound.map((lf) => (
                    <div
                      key={lf.id}
                      className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between"
                    >
                      <span>
                        <strong className="text-amber-400">
                          {lf.accountId}
                        </strong>
                        : {lf.details}
                      </span>
                      <span className="font-mono-tabular text-zinc-500 text-[11px]">
                        {new Date(lf.dateline * 1000).toLocaleString(
                          getDateLocale(lang)
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-zinc-500 p-3 rounded bg-zinc-950 border border-zinc-800/80">
                    {L(lang, {
                      en: 'No purchase records found for this serial.',
                      th: 'ไม่พบประวัติการซื้อ Serial นี้ในระบบ WebShop',
                      pt: 'Nenhum registro de compra encontrado.',
                      ru: 'Записей о покупке не найдено.',
                      es: 'No se encontraron registros de compra.',
                      bg: 'Няма намерени записи за покупка.',
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

// =========================================================================
// 6. Top Credited Accounts
// =========================================================================
export const TopAccountsModule: React.FC<{
  accounts: AccountData[];
  logs: LogEntry[];
  lang?: LanguageCode;
  onManageUserCredits: (username: string) => void;
  onViewUserLogs: (username: string) => void;
}> = ({
  accounts,
  logs,
  lang = 'Thai',
  onManageUserCredits,
  onViewUserLogs,
}) => {
  const [sortBy, setSortBy] = useState<'credits' | 'zen' | 'online'>('credits');

  const sorted = useMemo(() => {
    return [...accounts].sort((a, b) => {
      if (sortBy === 'credits') return b.credits - a.credits;
      if (sortBy === 'zen') return b.vaultMoney - a.vaultMoney;
      return (b.onlineMinutes || 0) - (a.onlineMinutes || 0);
    });
  }, [accounts, sortBy]);

  return (
    <div className="max-w-4xl space-y-4">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden shadow-xl">
        <div className="px-4 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-zinc-100">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>
              {L(lang, {
                en: 'Account Rankings',
                th: 'อันดับบัญชีผู้เล่นสูงสุดในระบบ',
                pt: 'Ranking de Contas',
                ru: 'Рейтинг аккаунтов',
                es: 'Ranking de Cuentas',
                bg: 'Класация на акаунти',
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400">
              {L(lang, {
                en: 'Sort by:',
                th: 'จัดเรียงตาม:',
                pt: 'Ordenar por:',
                ru: 'Сортировка:',
                es: 'Ordenar por:',
                bg: 'Сортирай по:',
              })}
            </span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'credits' | 'zen' | 'online')
              }
              className="bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1 text-zinc-200 cursor-pointer"
            >
              <option value="credits">
                {L(lang, {
                  en: 'Top Credits',
                  th: 'เครดิตสูงสุด',
                  pt: 'Mais Créditos',
                  ru: 'Топ кредитов',
                  es: 'Más Créditos',
                  bg: 'Топ кредити',
                })}
              </option>
              <option value="zen">
                {L(lang, {
                  en: 'Top Vault Zen',
                  th: 'Zen ในคลังสูงสุด',
                  pt: 'Mais Zen no Baú',
                  ru: 'Топ Zen в сундуке',
                  es: 'Más Zen en Baúl',
                  bg: 'Топ Zen в сандъка',
                })}
              </option>
              <option value="online">
                {L(lang, {
                  en: 'Top Online Time',
                  th: 'เวลาออนไลน์สูงสุด',
                  pt: 'Mais Tempo Online',
                  ru: 'Топ онлайн-времени',
                  es: 'Más Tiempo Online',
                  bg: 'Топ онлайн време',
                })}
              </option>
            </select>
          </div>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-950/60 text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="px-4 py-2.5 w-12">#</th>
              <th className="px-4 py-2.5">
                {L(lang, {
                  en: 'Username',
                  th: 'ชื่อบัญชี',
                  pt: 'Usuário',
                  ru: 'Аккаунт',
                  es: 'Usuario',
                  bg: 'Потребител',
                })}
              </th>
              <th className="px-4 py-2.5 text-right">Credits</th>
              <th className="px-4 py-2.5 text-right">Vault Zen</th>
              <th className="px-4 py-2.5 text-center">
                {L(lang, {
                  en: 'Online Time',
                  th: 'เวลาออนไลน์',
                  pt: 'Tempo Online',
                  ru: 'Онлайн',
                  es: 'Tiempo Online',
                  bg: 'Онлайн време',
                })}
              </th>
              <th className="px-4 py-2.5 text-center">VIP</th>
              <th className="px-4 py-2.5 text-right">
                {L(lang, {
                  en: 'Action',
                  th: 'จัดการ',
                  pt: 'Ação',
                  ru: 'Действие',
                  es: 'Acción',
                  bg: 'Действие',
                })}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  {L(lang, {
                    en: 'No registered accounts yet.',
                    th: 'ยังไม่มีข้อมูลบัญชีผู้เล่นในระบบ',
                    pt: 'Nenhuma conta registrada ainda.',
                    ru: 'Зарегистрированных аккаунтов пока нет.',
                    es: 'Aún no hay cuentas registradas.',
                    bg: 'Все още няма регистрирани акаунти.',
                  })}
                </td>
              </tr>
            ) : (
              sorted.map((acc, idx) => {
                const logCount = logs.filter(
                  (l) =>
                    l.accountId.toLowerCase() === acc.username.toLowerCase()
                ).length;
                const isVip = Boolean(
                  acc.vipUntil && new Date(acc.vipUntil) > new Date()
                );
                return (
                  <tr key={acc.username} className="hover:bg-zinc-800/40">
                    <td className="px-4 py-2.5 font-mono-tabular text-zinc-500 font-bold">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-white">
                      <button
                        type="button"
                        onClick={() => onManageUserCredits(acc.username)}
                        className="text-amber-400 hover:underline cursor-pointer"
                      >
                        {acc.username}
                      </button>
                      {acc.isAdmin && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          Admin
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono-tabular font-bold text-amber-400">
                      {acc.credits.toLocaleString()} Cr
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono-tabular text-zinc-300">
                      {(acc.vaultMoney / 1_000_000).toFixed(0)}M Zen
                    </td>
                    <td className="px-4 py-2.5 text-center font-mono-tabular text-emerald-400">
                      {Math.floor((acc.onlineMinutes || 0) / 60)}h{' '}
                      {(acc.onlineMinutes || 0) % 60}m
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {isVip ? (
                        <span className="inline-flex items-center gap-1 text-amber-300 text-[11px] font-bold">
                          <Crown className="w-3 h-3 fill-amber-400" />
                          VIP
                        </span>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => onManageUserCredits(acc.username)}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-[11px] cursor-pointer"
                      >
                        Credits
                      </button>
                      <button
                        type="button"
                        onClick={() => onViewUserLogs(acc.username)}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] cursor-pointer"
                      >
                        Logs ({logCount})
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// =========================================================================
// 7. User Vaults Viewer
// =========================================================================
export const UserVaultsViewerModule: React.FC<{
  accounts: AccountData[];
  catalog: WebShopItem[];
  config: WebShopConfig;
  lang?: LanguageCode;
  onTrackSerial: (serial: string) => void;
  onAdminDeleteVaultItem?: (
    username: string,
    instanceId: string,
    serial: string
  ) => void;
}> = ({
  accounts,
  catalog,
  config,
  lang = 'Thai',
  onTrackSerial,
  onAdminDeleteVaultItem,
}) => {
  const [selectedUser, setSelectedUser] = useState(
    accounts[0]?.username || ''
  );

  useEffect(() => {
    if (!accounts.some((a) => a.username === selectedUser)) {
      setSelectedUser(accounts[0]?.username || '');
    }
  }, [accounts, selectedUser]);

  const targetAcc = accounts.find(
    (a) => a.username.toLowerCase() === selectedUser.toLowerCase()
  );

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/80 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2.5">
          <Eye className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-bold text-white uppercase tracking-wider">
              {L(lang, {
                en: 'User Vaults Viewer',
                th: 'ตรวจสอบคลังเก็บของของผู้เล่น (User Vaults Viewer)',
                pt: 'Visualizador de Baús de Jogadores',
                ru: 'Просмотр сундуков игроков',
                es: 'Visor de Baúles de Jugadores',
                bg: 'Преглед на сандъци на играчи',
              })}
            </h3>
            <p className="text-zinc-400 text-[11px]">
              {L(lang, {
                en: 'Inspect any player 8×15 warehouse vault and track item serials.',
                th: 'ดูไอเทมในคลังขนาด 8×15 ของผู้เล่น ตรวจสอบ Serial หรือลบไอเทมออกจากคลัง',
                pt: 'Inspecione o baú 8×15 de qualquer jogador e rastreie seriais.',
                ru: 'Просмотр сундука 8×15 любого игрока и проверка серийных номеров.',
                es: 'Inspecciona el baúl 8×15 de cualquier jugador y rastrea seriales.',
                bg: 'Проверете сандъка 8×15 на всеки играч и проследете серийни номера.',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-400">
            {L(lang, {
              en: 'Select Account:',
              th: 'เลือกบัญชีผู้เล่น:',
              pt: 'Selecionar Conta:',
              ru: 'Выберите аккаунт:',
              es: 'Seleccionar Cuenta:',
              bg: 'Изберете акаунт:',
            })}
          </span>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-100 font-medium cursor-pointer"
          >
            {accounts.map((a) => (
              <option key={a.username} value={a.username}>
                {a.username} ({a.vaultItems.length}{' '}
                {L(lang, {
                  en: 'items',
                  th: 'ชิ้น',
                  pt: 'itens',
                  ru: 'предм.',
                  es: 'objetos',
                  bg: 'предм.',
                })}{' '}
                · {(a.vaultMoney / 1_000_000).toFixed(0)}M Zen)
              </option>
            ))}
          </select>
        </div>
      </div>

      {targetAcc ? (
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs">
            <span className="text-zinc-300">
              {L(lang, {
                en: 'Vault of:',
                th: 'คลังของผู้เล่น:',
                pt: 'Baú de:',
                ru: 'Сундук игрока:',
                es: 'Baúl de:',
                bg: 'Сандък на:',
              })}{' '}
              <strong className="text-amber-400">{targetAcc.username}</strong>
              <span className="ml-3 font-mono-tabular text-zinc-400">
                Zen: {targetAcc.vaultMoney.toLocaleString()} / 900,000,000
              </span>
            </span>
            <span className="text-zinc-500 font-mono-tabular">
              {targetAcc.vaultItems.length}{' '}
              {L(lang, {
                en: 'vault items',
                th: 'ชิ้นในคลัง',
                pt: 'itens no baú',
                ru: 'предметов',
                es: 'objetos en baúl',
                bg: 'предмета',
              })}
            </span>
          </div>

          <WarehouseGrid
            vaultItems={targetAcc.vaultItems}
            catalog={catalog}
            config={config}
            lang={lang}
            allowRefund={true}
            onRefundItem={(inst) => {
              if (onAdminDeleteVaultItem) {
                onAdminDeleteVaultItem(
                  targetAcc.username,
                  inst.instanceId,
                  inst.serial
                );
              }
            }}
            onTrackSerial={onTrackSerial}
          />
        </div>
      ) : (
        <div className="text-xs text-zinc-400 p-4 rounded bg-zinc-950 border border-zinc-800">
          {L(lang, {
            en: 'No player account selected.',
            th: 'ยังไม่มีข้อมูลบัญชีผู้เล่น',
            pt: 'Nenhuma conta selecionada.',
            ru: 'Аккаунт не выбран.',
            es: 'Ninguna cuenta seleccionada.',
            bg: 'Няма избран акаунт.',
          })}
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 8. IP Ban Manager
// =========================================================================
export const IpBanManagerModule: React.FC<{
  bans: IpBanEntry[];
  lang?: LanguageCode;
  onAddBan: (name: string, iprange: string, displtxt: string) => void;
  onRemoveBan: (id: number) => void;
}> = ({ bans, lang = 'Thai', onAddBan, onRemoveBan }) => {
  const [bname, setBname] = useState('');
  const [ipStart, setIpStart] = useState('');
  const [ipEnd, setIpEnd] = useState('');
  const [displ, setDispl] = useState('');
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [testIpInput, setTestIpInput] = useState('');
  const [testResult, setTestResult] = useState<{
    matched: boolean;
    text: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bname.trim() || !ipStart.trim() || !ipEnd.trim()) return;

    const messageText =
      displ.trim() ||
      L(lang, {
        en: 'Access denied from this IP range.',
        th: 'ไม่อนุญาตให้เข้าใช้งานจากช่วง IP นี้',
        pt: 'Acesso negado para esta faixa de IP.',
        ru: 'Доступ с этого диапазона IP запрещён.',
        es: 'Acceso denegado desde este rango de IP.',
        bg: 'Достъпът от този IP диапазон е отказан.',
      });

    onAddBan(
      bname.trim(),
      `${ipStart.trim()}-${ipEnd.trim()}`,
      messageText
    );
    setNotice(
      L(lang, {
        en: `Added IP ban rule "${bname.trim()}" (${ipStart.trim()}-${ipEnd.trim()}).`,
        th: `เพิ่มกฎแบน IP "${bname.trim()}" (${ipStart.trim()}-${ipEnd.trim()}) สำเร็จ!`,
        pt: `Regra de bloqueio IP "${bname.trim()}" adicionada.`,
        ru: `Добавлено правило блокировки IP «${bname.trim()}».`,
        es: `Regla de bloqueo IP "${bname.trim()}" añadida.`,
        bg: `Добавено е правило за IP бан "${bname.trim()}".`,
      })
    );
    setBname('');
    setIpStart('');
    setIpEnd('');
    setDispl('');
  };

  const handleTestIp = () => {
    if (!testIpInput.trim()) return;
    const ip = testIpInput.trim();
    const matched = bans.find((b) => {
      const [start, end] = b.iprange.split('-');
      if (!start || !end) return false;
      return ip >= start.trim() && ip <= end.trim();
    });

    if (matched) {
      setTestResult({
        matched: true,
        text: L(lang, {
          en: `IP ${ip} matches ban rule #${matched.id} ("${matched.name}"): "${matched.displtxt}"`,
          th: `IP ${ip} ตรงกับกฎแบน #${matched.id} ("${matched.name}") ข้อความ: "${matched.displtxt}"`,
          pt: `IP ${ip} corresponde à regra #${matched.id} ("${matched.name}"): "${matched.displtxt}"`,
          ru: `IP ${ip} совпадает с правилом #${matched.id} («${matched.name}»): «${matched.displtxt}»`,
          es: `IP ${ip} coincide con la regla #${matched.id} ("${matched.name}"): "${matched.displtxt}"`,
          bg: `IP ${ip} съвпада с правило #${matched.id} ("${matched.name}"): "${matched.displtxt}"`,
        }),
      });
    } else {
      setTestResult({
        matched: false,
        text: L(lang, {
          en: `IP ${ip} is not banned. Access permitted.`,
          th: `IP ${ip} ปลอดภัย ไม่อยู่ในรายชื่อ IP ที่ถูกแบน`,
          pt: `IP ${ip} não está bloqueado. Acesso permitido.`,
          ru: `IP ${ip} не заблокирован. Доступ разрешён.`,
          es: `IP ${ip} no está bloqueada. Acceso permitido.`,
          bg: `IP ${ip} не е блокиран. Достъпът е разрешен.`,
        }),
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {notice && (
        <div className="p-3.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notice}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden shadow-xl">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between text-xs font-semibold text-zinc-100">
          <div className="flex items-center gap-2">
            <ShieldBan className="w-4 h-4 text-amber-400" />
            <span>
              {L(lang, {
                en: 'Configured IP Ban Rules',
                th: 'รายการแบน IP ทั้งหมดในระบบ',
                pt: 'Regras de Bloqueio de IP',
                ru: 'Правила блокировки IP',
                es: 'Reglas de Bloqueo de IP',
                bg: 'Правила за IP блокиране',
              })}{' '}
              ({bans.length})
            </span>
          </div>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-950/60 text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="px-4 py-2.5">#</th>
              <th className="px-4 py-2.5">
                {L(lang, {
                  en: 'Identity / Reason',
                  th: 'ชื่อกฎ / เหตุผล',
                  pt: 'Identificação / Motivo',
                  ru: 'Название / Причина',
                  es: 'Identidad / Motivo',
                  bg: 'Име / Причина',
                })}
              </th>
              <th className="px-4 py-2.5">
                {L(lang, {
                  en: 'IP Range',
                  th: 'ช่วง IP',
                  pt: 'Faixa de IP',
                  ru: 'Диапазон IP',
                  es: 'Rango IP',
                  bg: 'IP диапазон',
                })}
              </th>
              <th className="px-4 py-2.5">
                {L(lang, {
                  en: 'Display Message',
                  th: 'ข้อความแจ้งเตือน',
                  pt: 'Mensagem Exibida',
                  ru: 'Сообщение',
                  es: 'Mensaje Mostrado',
                  bg: 'Съобщение',
                })}
              </th>
              <th className="px-4 py-2.5 text-center">
                {L(lang, {
                  en: 'Attempts',
                  th: 'จำนวนครั้งที่บล็อก',
                  pt: 'Tentativas',
                  ru: 'Попытки',
                  es: 'Intentos',
                  bg: 'Опити',
                })}
              </th>
              <th className="px-4 py-2.5 text-right">
                {L(lang, {
                  en: 'Action',
                  th: 'จัดการ',
                  pt: 'Ação',
                  ru: 'Действие',
                  es: 'Acción',
                  bg: 'Действие',
                })}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {bans.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  {L(lang, {
                    en: 'No active IP ban rules.',
                    th: 'ยังไม่มีรายการแบน IP ในระบบ',
                    pt: 'Nenhuma regra de bloqueio de IP ativa.',
                    ru: 'Активных блокировок IP нет.',
                    es: 'No hay reglas de bloqueo de IP activas.',
                    bg: 'Няма активни правила за IP бан.',
                  })}
                </td>
              </tr>
            ) : (
              bans.map((b, idx) => (
                <tr key={b.id} className="hover:bg-zinc-800/40">
                  <td className="px-4 py-2.5 font-mono-tabular text-zinc-500">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-2.5 font-bold text-white">{b.name}</td>
                  <td className="px-4 py-2.5 font-mono-tabular text-amber-400">
                    {b.iprange}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-300">{b.displtxt}</td>
                  <td className="px-4 py-2.5 font-mono-tabular text-center text-zinc-400">
                    {b.attempts}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {confirmRemoveId === b.id ? (
                      <button
                        type="button"
                        onClick={() => {
                          onRemoveBan(b.id);
                          setConfirmRemoveId(null);
                          setNotice(
                            L(lang, {
                              en: `Removed IP ban #${b.id}.`,
                              th: `ปลดแบน IP #${b.id} เรียบร้อยแล้ว`,
                              pt: `Bloqueio IP #${b.id} removido.`,
                              ru: `Блокировка IP #${b.id} снята.`,
                              es: `Bloqueo IP #${b.id} eliminado.`,
                              bg: `IP бан #${b.id} е премахнат.`,
                            })
                          );
                        }}
                        className="text-rose-300 font-bold hover:underline cursor-pointer"
                      >
                        {L(lang, {
                          en: 'Confirm?',
                          th: 'ยืนยันปลดแบน?',
                          pt: 'Confirmar?',
                          ru: 'Точно?',
                          es: '¿Confirmar?',
                          bg: 'Потвърди?',
                        })}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmRemoveId(b.id)}
                        className="text-rose-400 hover:underline cursor-pointer font-medium"
                      >
                        {L(lang, {
                          en: 'Remove',
                          th: 'ปลดแบน',
                          pt: 'Remover',
                          ru: 'Снять',
                          es: 'Eliminar',
                          bg: 'Премахни',
                        })}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/80 space-y-4 text-xs"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
          <Plus className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-white">
            {L(lang, {
              en: 'Add New IP Ban Rule',
              th: 'เพิ่มกฎแบน IP ใหม่',
              pt: 'Adicionar Regra de Bloqueio de IP',
              ru: 'Добавить правило блокировки IP',
              es: 'Añadir Regla de Bloqueo de IP',
              bg: 'Добави ново правило за IP бан',
            })}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-zinc-400 mb-1">
              {L(lang, {
                en: 'Ban Label / Reason',
                th: 'ชื่อผู้ถูกแบน / เหตุผล',
                pt: 'Identificação / Motivo',
                ru: 'Метка / Причина',
                es: 'Etiqueta / Motivo',
                bg: 'Етикет / Причина',
              })}
            </label>
            <input
              type="text"
              required
              value={bname}
              onChange={(e) => setBname(e.target.value)}
              placeholder={L(lang, {
                en: 'Rule name',
                th: 'ระบุชื่อกฎแบน',
                pt: 'Nome da regra',
                ru: 'Название правила',
                es: 'Nombre de regla',
                bg: 'Име на правило',
              })}
              className="w-full px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">
              {L(lang, {
                en: 'Start IP – End IP',
                th: 'IP เริ่มต้น – IP สิ้นสุด',
                pt: 'IP Inicial – IP Final',
                ru: 'Нач. IP – Кон. IP',
                es: 'IP Inicio – IP Fin',
                bg: 'Начален IP – Краен IP',
              })}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="text"
                required
                value={ipStart}
                onChange={(e) => setIpStart(e.target.value)}
                placeholder="0.0.0.0"
                className="w-full px-2 py-1.5 font-mono-tabular rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
              />
              <span>-</span>
              <input
                type="text"
                required
                value={ipEnd}
                onChange={(e) => setIpEnd(e.target.value)}
                placeholder="0.0.0.0"
                className="w-full px-2 py-1.5 font-mono-tabular rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">
              {L(lang, {
                en: 'Display Message',
                th: 'ข้อความแจ้งเตือนที่แสดง',
                pt: 'Mensagem de Bloqueio',
                ru: 'Текст уведомления',
                es: 'Mensaje de Bloqueo',
                bg: 'Съобщение при бан',
              })}
            </label>
            <input
              type="text"
              value={displ}
              onChange={(e) => setDispl(e.target.value)}
              placeholder={L(lang, {
                en: 'Optional message',
                th: 'ข้อความที่จะแสดงให้ผู้เล่นเห็น',
                pt: 'Mensagem opcional',
                ru: 'Сообщение для игрока',
                es: 'Mensaje opcional',
                bg: 'Съобщение по избор',
              })}
              className="w-full px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors cursor-pointer shadow-lg"
          >
            {L(lang, {
              en: '+ Add IP Ban',
              th: '+ เพิ่มกฎแบน IP',
              pt: '+ Adicionar Ban',
              ru: '+ Добавить бан',
              es: '+ Añadir Ban',
              bg: '+ Добави бан',
            })}
          </button>
        </div>
      </form>

      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-2 text-xs">
        <span className="font-semibold text-zinc-300">
          {L(lang, {
            en: 'Test IP Ban Diagnostic:',
            th: 'เครื่องมือตรวจสอบช่วง IP:',
            pt: 'Verificar Endereço IP:',
            ru: 'Проверка IP-адреса:',
            es: 'Verificar Dirección IP:',
            bg: 'Проверка на IP адрес:',
          })}
        </span>
        <div className="flex items-center gap-2 max-w-md">
          <input
            type="text"
            value={testIpInput}
            onChange={(e) => setTestIpInput(e.target.value)}
            placeholder="0.0.0.0"
            className="flex-1 px-3 py-1.5 font-mono-tabular rounded bg-zinc-900 border border-zinc-700 text-zinc-100"
          />
          <button
            type="button"
            onClick={handleTestIp}
            className="px-3.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
          >
            {L(lang, {
              en: 'Check',
              th: 'ตรวจสอบ',
              pt: 'Verificar',
              ru: 'Проверить',
              es: 'Verificar',
              bg: 'Провери',
            })}
          </button>
        </div>
        {testResult && (
          <div
            className={`p-2.5 rounded text-xs mt-2 border ${
              testResult.matched
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            }`}
          >
            {testResult.text}
          </div>
        )}
      </div>
    </div>
  );
};
