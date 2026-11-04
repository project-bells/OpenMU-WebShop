import React, { useMemo, useState } from 'react';
import {
  AccountData,
  IpBanEntry,
  ItemGroup,
  LanguageCode,
  LogEntry,
  WebShopConfig,
  WebShopItem,
} from '../types/webshop';
import { CATEGORY_NAMES, formatItemTooltip } from '../utils/muItemLogic';
import { WarehouseGrid } from './WarehouseGrid';
import { ItemTooltipCard } from './ItemTooltip';
import {
  AlertTriangle,
  ArrowUpDown,
  Check,
  CheckCircle2,
  Coins,
  Copy,
  Crown,
  Database,
  Download,
  Eye,
  FileSearch,
  Layers,
  Plus,
  RefreshCw,
  Search,
  ShieldBan,
  Trash2,
  Trophy,
  Wrench,
  X,
} from 'lucide-react';

// =========================================================================
// 1. Item Manager (modules/imanager.php)
// =========================================================================
export const ItemManagerModule: React.FC<{
  catalog: WebShopItem[];
  initialEditUid: number | null;
  lang?: LanguageCode;
  onUpdateItem: (updated: WebShopItem) => void;
  onAddItem: (newItem: WebShopItem) => void;
  onRemoveItem: (uid: number) => void;
}> = ({ catalog, initialEditUid, lang = 'Thai', onUpdateItem, onAddItem, onRemoveItem }) => {
  const isTh = lang === 'Thai';
  const [activeTab, setActiveTab] = useState<'edit' | 'create'>('edit');
  const [search, setSearch] = useState('');
  const [selectedUid, setSelectedUid] = useState<number>(
    initialEditUid || catalog[0]?.uid || 1
  );
  const [savedNotice, setSavedNotice] = useState<{ ok: boolean; text: string } | null>(null);

  React.useEffect(() => {
    if (initialEditUid) {
      setSelectedUid(initialEditUid);
      setActiveTab('edit');
    }
  }, [initialEditUid]);

  const activeItem = catalog.find((it) => it.uid === selectedUid) || catalog[0];

  const baseTemplateItem: WebShopItem = catalog[0] || {
    uid: 1,
    id: 0,
    type: 0,
    category: 0,
    name: 'New Item',
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
    thumb: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=120&auto=format&fit=crop&q=80',
    exlThumb: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=120&auto=format&fit=crop&q=80',
  };

  const [formState, setFormState] = useState<WebShopItem>(activeItem || baseTemplateItem);

  // State for new item creation
  const nextUid = useMemo(() => {
    return catalog.length > 0 ? Math.max(...catalog.map((it) => it.uid)) + 1 : 1;
  }, [catalog]);

  const [newItemState, setNewItemState] = useState<WebShopItem>(() => ({
    ...baseTemplateItem,
    uid: nextUid,
    id: 30,
    type: 0,
    category: 0,
    name: 'Dragon Knight Sword',
    credits: 350,
    X: 1,
    Y: 4,
    str: 600,
    agi: 200,
  }));

  React.useEffect(() => {
    if (activeItem && activeTab === 'edit') {
      setFormState(activeItem);
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
      text: isTh
        ? `บันทึกการตั้งค่าไอเทม "${formState.name}" (UID #${formState.uid}) เรียบร้อยแล้ว`
        : `Updated item settings for "${formState.name}" (UID #${formState.uid}).`,
    });
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemState.name.trim()) return;
    onAddItem(newItemState);
    setSavedNotice({
      ok: true,
      text: isTh
        ? `เพิ่มไอเทมใหม่ "${newItemState.name}" (UID #${newItemState.uid}) เข้าสู่ระบบสำเร็จ!`
        : `Added new item "${newItemState.name}" (UID #${newItemState.uid}) to WebShop!`,
    });
    // Switch to editing the newly created item
    setSelectedUid(newItemState.uid);
    setActiveTab('edit');
    // Prepare next UID for subsequent additions
    setNewItemState((prev) => ({
      ...prev,
      uid: prev.uid + 1,
      name: `${prev.name} (Copy)`,
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
      text: isTh
        ? `คัดลอกไอเทมเป็น "${cloned.name}" (UID #${cloned.uid}) สำเร็จ!`
        : `Cloned item as "${cloned.name}" (UID #${cloned.uid})!`,
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Mode Switcher */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/90 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {isTh ? 'ระบบจัดการไอเทมในเว็บช็อป (Item Manager)' : 'WebShop Item Manager'}
            </h2>
            <p className="text-xs text-zinc-400">
              {isTh
                ? `จัดการไอเทมทั้งหมดในระบบ (${catalog.length} รายการ) แก้ไขราคา ออปชัน และเพิ่มไอเทมใหม่`
                : `Manage catalog items (${catalog.length} items), configure prices, sizes, and attributes.`}
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
            {isTh ? 'แก้ไขไอเทมเดิม' : 'Edit Existing'}
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
            <span>{isTh ? '+ เพิ่มไอเทมใหม่' : '+ Add New Item'}</span>
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
          {/* Item Selector Sidebar */}
          <div className="lg:col-span-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-amber-400" />
                {isTh ? 'เลือกไอเทมในระบบ' : 'Select Item'} ({filteredItems.length})
              </span>
              <button
                type="button"
                onClick={handleDuplicateCurrent}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                title="Duplicate this item to a new UID"
              >
                <Copy className="w-3 h-3" />
                <span>{isTh ? 'คัดลอก' : 'Duplicate'}</span>
              </button>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isTh ? 'ค้นหาชื่อไอเทม หรือ UID...' : 'Find item by name or UID...'}
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

          {/* Item Settings Editor Form */}
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
                    {isTh ? 'กำลังแก้ไข:' : 'Editing:'} {formState.name} (UID #{formState.uid})
                  </h3>
                  <div className="text-[11px] font-mono-tabular text-zinc-400 truncate max-w-sm">
                    URL: {formState.thumb}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(isTh ? `ยืนยันการลบไอเทม #${formState.uid} (${formState.name}) ออกจากระบบ?` : `Remove item #${formState.uid} (${formState.name})?`)) {
                      onRemoveItem(formState.uid);
                      setSavedNotice({
                        ok: true,
                        text: isTh ? `ลบไอเทม #${formState.uid} เรียบร้อยแล้ว` : `Removed item #${formState.uid}.`,
                      });
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isTh ? 'ลบไอเทม' : 'Remove Item'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">{isTh ? 'ชื่อไอเทม' : 'Item Name'}</label>
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
                  {isTh ? 'ราคาเครดิต (0 = ห้ามขาย)' : 'Required Credits'}
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
                  {isTh ? 'หมวดหมู่ไอเทม' : 'Display Category'}
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
                  {Object.entries(CATEGORY_NAMES).map(([id, label]) => (
                    <option key={id} value={Number(id)}>
                      {isTh ? label.th : label.en} ({id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  {isTh ? 'ขนาดในคลัง (ช่อง กว้าง × สูง)' : 'Inventory Space (X × Y)'}
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
                  {isTh ? 'สเตตัสที่ต้องการ (STR / AGI)' : 'STR / AGI Req'}
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
                  {isTh ? 'ประเภท Excellent (ex_type)' : 'Exl/Anc Type'}
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
                  <option value={0}>0: Weapon (อาวุธ)</option>
                  <option value={1}>1: Armor / Set (เกราะ)</option>
                  <option value={2}>2: Wings S2 (ปีก 2)</option>
                  <option value={3}>3: Ancient (เซ็ตโบราณ)</option>
                  <option value={4}>4: Wings S3 (ปีก 3)</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-zinc-400 mb-1">
                  {isTh ? 'URL รูปภาพไอเทม (Image Thumbnail)' : 'Image URL'}
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

            {/* Toggle flags */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 text-xs">
              {[
                { key: 'hasLevel', label: isTh ? 'มีระดับ +1..13' : 'Can Have Level' },
                { key: 'hasOption', label: isTh ? 'มีออปชัน +4..28' : 'Can Have Option' },
                { key: 'luck', label: isTh ? 'มี Luck' : 'Can Have Luck' },
                { key: 'skill', label: isTh ? 'มี Skill' : 'Can Have Skill' },
                { key: 'cansellitem', label: isTh ? 'ขายคืนรับ 50%' : 'Can Sell Back' },
              ].map((flag) => (
                <label
                  key={flag.key}
                  className="flex items-center gap-2 p-2 rounded bg-zinc-950 border border-zinc-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={
                      Boolean((formState as unknown as Record<string, number>)[flag.key])
                    }
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
                {isTh ? 'บันทึกการเปลี่ยนแปลงไอเทม' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Create New Item Form */
        <form
          onSubmit={handleCreateNew}
          className="p-6 rounded-xl border border-emerald-500/30 bg-zinc-900/90 space-y-4 max-w-3xl"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <Plus className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              {isTh ? 'เพิ่มไอเทมใหม่เข้าสู่ระบบ WebShop' : 'Add New WebShop Item'}
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
              <label className="block text-zinc-400 mb-1">{isTh ? 'ชื่อไอเทม' : 'Item Name'}</label>
              <input
                type="text"
                required
                value={newItemState.name}
                onChange={(e) =>
                  setNewItemState({ ...newItemState, name: e.target.value })
                }
                className="w-full px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">{isTh ? 'ราคาเครดิต' : 'Credits'}</label>
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
              <label className="block text-zinc-400 mb-1">{isTh ? 'หมวดหมู่' : 'Category'}</label>
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
                {Object.entries(CATEGORY_NAMES).map(([id, label]) => (
                  <option key={id} value={Number(id)}>
                    {isTh ? label.th : label.en} ({id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">
                {isTh ? 'ขนาด (X × Y)' : 'Size (X × Y)'}
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
                {isTh ? 'URL รูปภาพ' : 'Image URL'}
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
              {isTh ? 'ยกเลิก' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 cursor-pointer shadow-lg"
            >
              {isTh ? 'ยืนยันเพิ่มไอเทมใหม่' : 'Create Item'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

// =========================================================================
// 2. Item Group Manager (modules/groupmanager.php)
// =========================================================================
export const GroupManagerModule: React.FC<{
  groups: ItemGroup[];
  catalog: WebShopItem[];
  lang?: LanguageCode;
  onAddGroup: (group: ItemGroup) => void;
  onUpdateGroup?: (group: ItemGroup) => void;
  onDeleteGroup: (id: number) => void;
}> = ({ groups, catalog, lang = 'Thai', onAddGroup, onUpdateGroup, onDeleteGroup }) => {
  const isTh = lang === 'Thai';
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);

  const nextGid = useMemo(() => {
    return groups.length > 0 ? Math.max(...groups.map((g) => g.id)) + 1 : 1;
  }, [groups]);

  const [gid, setGid] = useState(nextGid);
  const [grname, setGrname] = useState('Dark Phoenix Full Set (5 pcs)');
  const [gcr, setGcr] = useState(550);
  const [basedon, setBasedon] = useState(catalog[0]?.uid || 1);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([
    catalog[0]?.uid || 1,
  ]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

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
    setGrname('Grand Soul Full Set (5 pcs)');
    setGcr(480);
    setSelectedMembers([catalog[0]?.uid || 1]);
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
        text: isTh
          ? `อัปเดตเซ็ตไอเทม #${gid} (${grname}) สำเร็จ!`
          : `Updated group #${gid} (${grname})!`,
      });
    } else {
      onAddGroup(groupPayload);
      setMsg({
        ok: true,
        text: isTh
          ? `สร้างเซ็ตไอเทมใหม่ #${gid} (${grname}) สำเร็จ!`
          : `Created new group #${gid} (${grname})!`,
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
      {/* Group Form */}
      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/90 space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              {editingGroupId !== null
                ? isTh
                  ? `แก้ไขเซ็ตไอเทม #${editingGroupId}`
                  : `Edit Item Group #${editingGroupId}`
                : isTh
                ? 'เพิ่มเซ็ตไอเทมใหม่ (WebShop Group Adder)'
                : 'WebShop Admin: Add New Item Group'}
            </h3>
          </div>
          {editingGroupId !== null && (
            <button
              type="button"
              onClick={handleResetForm}
              className="text-xs text-amber-400 hover:underline cursor-pointer"
            >
              {isTh ? 'ยกเลิกการแก้ไข / สลับไปโหมดสร้างใหม่' : 'Cancel Edit'}
            </button>
          )}
        </div>

        {msg && (
          <div className="p-3 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-xs flex items-center justify-between">
            <span>{msg.text}</span>
            <button type="button" onClick={() => setMsg(null)} className="cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">{isTh ? 'Group ID' : 'Group ID'}</label>
            <input
              type="number"
              value={gid}
              disabled={editingGroupId !== null}
              onChange={(e) => setGid(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 font-mono-tabular rounded bg-zinc-950 border border-zinc-700 text-zinc-100 disabled:opacity-50"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-zinc-400 mb-1">{isTh ? 'ชื่อเซ็ตไอเทม' : 'Group Name'}</label>
            <input
              type="text"
              required
              value={grname}
              onChange={(e) => setGrname(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">{isTh ? 'ราคาเซ็ต (Credits)' : 'Set Credits'}</label>
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

        {/* Member Items Multi-Selector */}
        <div className="space-y-2 pt-2 border-t border-zinc-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-300">
              {isTh
                ? `เลือกชิ้นส่วนไอเทมที่รวมในเซ็ตนี้ (เลือกแล้ว ${selectedMembers.length} ชิ้น):`
                : `Select Member Items Included in Set (${selectedMembers.length} selected):`}
            </span>
            <span className="text-zinc-500 text-[11px]">
              {isTh ? 'คลิกที่ไอเทมเพื่อเลือก/ยกเลิก' : 'Click to toggle items'}
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
                    <div className="text-[10px] text-zinc-500 font-mono-tabular">#{it.uid}</div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
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
              ? isTh ? 'บันทึกการแก้ไขเซ็ต' : 'Save Set Changes'
              : isTh ? '+ บันทึกเซ็ตไอเทมใหม่' : '+ Add New Group'}
          </button>
        </div>
      </form>

      {/* Groups List Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between text-xs font-semibold text-zinc-200">
          <span>{isTh ? 'รายการเซ็ตไอเทมทั้งหมดในเว็บช็อป' : 'All Configured Item Sets'} ({groups.length})</span>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-950/60 text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="px-4 py-2.5">ID</th>
              <th className="px-4 py-2.5">{isTh ? 'ชื่อเซ็ต' : 'Group Name'}</th>
              <th className="px-4 py-2.5">{isTh ? 'ราคาเครดิต' : 'Credits'}</th>
              <th className="px-4 py-2.5">{isTh ? 'ชิ้นส่วนในเซ็ต' : 'Items in Set'}</th>
              <th className="px-4 py-2.5 text-right">{isTh ? 'จัดการ' : 'Action'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {groups.map((grp) => (
              <tr key={grp.id} className="hover:bg-zinc-800/40">
                <td className="px-4 py-2.5 font-mono-tabular text-zinc-400">#{grp.id}</td>
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
                    {isTh ? 'แก้ไข' : 'Edit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(isTh ? `ต้องการลบเซ็ต #${grp.id} (${grp.name}) หรือไม่?` : `Delete group #${grp.id}?`)) {
                        onDeleteGroup(grp.id);
                      }
                    }}
                    className="text-rose-400 hover:underline cursor-pointer"
                  >
                    {isTh ? 'ลบ' : 'Delete'}
                  </button>
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
// 3. Account Credit Manager (modules/usercredits.php)
// =========================================================================
export const ManageCreditsModule: React.FC<{
  accounts: AccountData[];
  initialUser?: string;
  lang?: LanguageCode;
  onAdjustCredits: (username: string, delta: number) => number;
  onAdjustVaultZen?: (username: string, amount: number) => void;
}> = ({ accounts, initialUser, lang = 'Thai', onAdjustCredits, onAdjustVaultZen }) => {
  const isTh = lang === 'Thai';
  const [uacc, setUacc] = useState(initialUser || accounts[0]?.username || '');
  const [ucr, setUcr] = useState(500);
  const [mode, setMode] = useState<'adjust' | 'zen'>('adjust');
  const [zenAmount, setZenAmount] = useState<number>(100_000_000);
  const [resultMsg, setResultMsg] = useState<{ ok: boolean; text: string } | null>(null);

  React.useEffect(() => {
    if (initialUser) setUacc(initialUser);
  }, [initialUser]);

  const selectedAccountData = useMemo(() => {
    return accounts.find((a) => a.username.toLowerCase() === uacc.trim().toLowerCase());
  }, [accounts, uacc]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uacc.trim()) return;

    if (mode === 'adjust') {
      const newBal = onAdjustCredits(uacc.trim(), ucr);
      setResultMsg({
        ok: true,
        text: isTh
          ? `อัปเดตเครดิตของ "${uacc.trim()}" สำเร็จ! ยอดปัจจุบันคือ ${newBal.toLocaleString()} Credits (${ucr >= 0 ? `+${ucr.toLocaleString()}` : ucr.toLocaleString()})`
          : `Updated "${uacc.trim()}" credit balance. Current total: ${newBal.toLocaleString()} credits.`,
      });
    } else if (mode === 'zen' && onAdjustVaultZen) {
      onAdjustVaultZen(uacc.trim(), zenAmount);
      setResultMsg({
        ok: true,
        text: isTh
          ? `ปรับยอดเงิน Zen ในคลังของ "${uacc.trim()}" เพิ่ม ${(zenAmount / 1_000_000).toLocaleString()}M Zen สำเร็จ!`
          : `Adjusted vault Zen for "${uacc.trim()}" by +${zenAmount.toLocaleString()} Zen!`,
      });
    }
  };

  const handleQuickAdd = (amount: number) => {
    setUcr(amount);
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {isTh ? 'เสก / ปรับเครดิตและเงิน Zen ของผู้เล่น' : 'Manage Account Credits & Zen'}
            </h2>
            <p className="text-xs text-zinc-400">
              {isTh
                ? 'คำสั่งแอดมินจำลอง `exec XCredits` เติมหรือลดเครดิตและ Zen ของบัญชีผู้เล่น'
                : 'Directly adjust player credits or vault Zen.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setMode('adjust')}
            className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
              mode === 'adjust' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400'
            }`}
          >
            Credits
          </button>
          <button
            type="button"
            onClick={() => setMode('zen')}
            className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
              mode === 'zen' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400'
            }`}
          >
            Vault Zen
          </button>
        </div>
      </div>

      {resultMsg && (
        <div className="p-3.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-xs font-mono-tabular flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{resultMsg.text}</span>
          </div>
          <button type="button" onClick={() => setResultMsg(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Selected Account Info Card */}
      {selectedAccountData && (
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-zinc-400 block">{isTh ? 'บัญชี' : 'Account'}:</span>
            <span className="font-bold text-white text-sm">{selectedAccountData.username}</span>
          </div>
          <div>
            <span className="text-zinc-400 block">{isTh ? 'เครดิตปัจจุบัน' : 'Credits'}:</span>
            <span className="font-bold text-amber-400 font-mono-tabular text-sm">
              {selectedAccountData.credits.toLocaleString()} Cr
            </span>
          </div>
          <div>
            <span className="text-zinc-400 block">{isTh ? 'Zen ในคลัง' : 'Vault Zen'}:</span>
            <span className="font-mono-tabular text-zinc-200">
              {(selectedAccountData.vaultMoney / 1_000_000).toFixed(0)}M Zen
            </span>
          </div>
          <div>
            <span className="text-zinc-400 block">{isTh ? 'สถานะ VIP' : 'VIP Status'}:</span>
            <span className="font-medium text-emerald-400">
              {selectedAccountData.vipUntil && new Date(selectedAccountData.vipUntil) > new Date()
                ? 'VIP Active 👑'
                : 'Regular'}
            </span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/80 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1.5">{isTh ? 'ชื่อบัญชีเป้าหมาย' : 'Target Account'}</label>
            <input
              type="text"
              list="admin-acc-list"
              required
              value={uacc}
              onChange={(e) => setUacc(e.target.value)}
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            />
            <datalist id="admin-acc-list">
              {accounts.map((a) => (
                <option key={a.username} value={a.username}>
                  {a.username} ({a.credits.toLocaleString()} cr)
                </option>
              ))}
            </datalist>
          </div>

          {mode === 'adjust' ? (
            <div>
              <label className="block text-zinc-400 mb-1.5">
                {isTh ? 'จำนวนเครดิต (+ เพิ่ม, - ลด)' : 'Credits Delta (+ or -)'}
              </label>
              <input
                type="number"
                value={ucr}
                onChange={(e) => setUcr(Number(e.target.value))}
                className="w-full px-3 py-2 font-mono-tabular rounded bg-zinc-950 border border-zinc-700 text-amber-400 font-bold"
              />
            </div>
          ) : (
            <div>
              <label className="block text-zinc-400 mb-1.5">
                {isTh ? 'จำนวนเงิน Zen (+ เพิ่มเข้าคลัง)' : 'Vault Zen Amount'}
              </label>
              <input
                type="number"
                step={10000000}
                value={zenAmount}
                onChange={(e) => setZenAmount(Number(e.target.value))}
                className="w-full px-3 py-2 font-mono-tabular rounded bg-zinc-950 border border-zinc-700 text-emerald-400 font-bold"
              />
            </div>
          )}
        </div>

        {mode === 'adjust' && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-zinc-400">{isTh ? 'ปุ่มลัดเลือกจำนวนเครดิต:' : 'Quick Presets:'}</span>
            <div className="flex flex-wrap gap-1.5">
              {[+100, +500, +1000, +5000, -500, -1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAdd(val)}
                  className={`px-2.5 py-1 rounded text-xs font-mono-tabular cursor-pointer border ${
                    val > 0
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border-zinc-700'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-rose-400 border-zinc-700'
                  }`}
                >
                  {val > 0 ? `+${val}` : val}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-zinc-800">
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors cursor-pointer shadow-lg"
          >
            {mode === 'adjust'
              ? isTh ? 'ยืนยันปรับยอดเครดิต' : 'Confirm Credit Update'
              : isTh ? 'ยืนยันปรับยอด Zen' : 'Confirm Zen Update'}
          </button>
        </div>
      </form>
    </div>
  );
};

// =========================================================================
// 4. Hawk Eye — Shop Log (modules/viewlog.php)
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
  const isTh = lang === 'Thai';
  const [sstr, setSstr] = useState('');
  const [sacc, setSacc] = useState(initialAccountFilter);
  const [todayOnly, setTodayOnly] = useState(false);
  const [sortDesc, setSortDesc] = useState(true);

  React.useEffect(() => {
    if (initialAccountFilter) setSacc(initialAccountFilter);
  }, [initialAccountFilter]);

  const filteredLogs = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todaySec = Math.floor(startOfToday.getTime() / 1000);

    const res = logs.filter((l) => {
      if (sstr.trim() && !l.details.toLowerCase().includes(sstr.trim().toLowerCase())) {
        return false;
      }
      if (sacc.trim() && l.accountId.toLowerCase() !== sacc.trim().toLowerCase()) {
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
    const headers = ['ID', 'Account', 'Details', 'Serial', 'Timestamp', 'Date'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.accountId}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      l.itemSerial || '',
      l.dateline,
      `"${new Date(l.dateline * 1000).toISOString()}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `open_webshop_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Header */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/80 flex flex-wrap items-end justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-zinc-400 mb-1">{isTh ? 'ค้นหาข้อความ' : 'Search Details'}</label>
            <input
              type="text"
              value={sstr}
              onChange={(e) => setSstr(e.target.value)}
              placeholder="e.g. Bone Blade, VIP..."
              className="px-3 py-1.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">{isTh ? 'กรองตามบัญชี' : 'Account'}</label>
            <input
              type="text"
              value={sacc}
              onChange={(e) => setSacc(e.target.value)}
              placeholder="e.g. netsplit"
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
            <span>{isTh ? 'เฉพาะวันนี้' : 'Today Only'}</span>
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
              {isTh ? 'ล้างตัวกรอง' : 'Reset'}
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
            <span>{sortDesc ? (isTh ? 'ใหม่สุดก่อน' : 'Newest First') : (isTh ? 'เก่าสุดก่อน' : 'Oldest First')}</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isTh ? 'ส่งออก CSV' : 'Export CSV'}</span>
          </button>
          {onClearLogs && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(isTh ? 'ต้องการล้างประวัติการทำรายการทั้งหมดหรือไม่?' : 'Clear all logs?')) {
                  onClearLogs();
                }
              }}
              className="px-3 py-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 cursor-pointer"
            >
              {isTh ? 'ล้างประวัติ' : 'Clear Logs'}
            </button>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden shadow-lg">
        <div className="px-4 py-3 border-b border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileSearch className="w-4 h-4 text-amber-400" />
            <span>{isTh ? 'ประวัติการทำรายการในร้านค้า (Hawk Eye Logs)' : 'Hawk Eye Shop Log Results'}</span>
          </span>
          <span className="text-zinc-500 font-mono-tabular">{filteredLogs.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-2.5 w-16">ID</th>
                <th className="px-4 py-2.5 w-32">{isTh ? 'บัญชี' : 'Account'}</th>
                <th className="px-4 py-2.5">{isTh ? 'รายละเอียด' : 'Details'}</th>
                <th className="px-4 py-2.5 text-right w-44">{isTh ? 'เวลา' : 'Time'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredLogs.map((entry) => (
                <tr key={entry.id} className="hover:bg-zinc-800/40">
                  <td className="px-4 py-2.5 font-mono-tabular text-zinc-500">#{entry.id}</td>
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => onSelectAccountCredits(entry.accountId)}
                      className="font-semibold text-amber-400 hover:underline cursor-pointer"
                      title="Manage this account credits"
                    >
                      {entry.accountId}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-200">
                    <span>{entry.details}</span>
                    {entry.itemSerial && (
                      <button
                        type="button"
                        onClick={() => onSelectSerialSearch(entry.itemSerial!)}
                        className="ml-2 text-[11px] font-mono-tabular text-emerald-400 hover:underline cursor-pointer"
                      >
                        [Track Serial: {entry.itemSerial}]
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono-tabular text-zinc-400">
                    {new Date(entry.dateline * 1000).toLocaleString(isTh ? 'th-TH' : 'en-US')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 5. Serial Search (modules/serial.php)
// =========================================================================
export const SerialSearchModule: React.FC<{
  accounts: AccountData[];
  logs: LogEntry[];
  catalog: WebShopItem[];
  config: WebShopConfig;
  initialSerial?: string;
  lang?: LanguageCode;
  onAdminDeleteVaultItem?: (username: string, instanceId: string, serial: string) => void;
}> = ({
  accounts,
  logs,
  catalog,
  config,
  initialSerial = '',
  lang = 'Thai',
  onAdminDeleteVaultItem,
}) => {
  const isTh = lang === 'Thai';
  const [serialInput, setSerialInput] = useState(initialSerial || '00A84F21');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialSerial) setSerialInput(initialSerial);
  }, [initialSerial]);

  const cleanSerial = serialInput.trim().toUpperCase();

  const matches = useMemo(() => {
    if (cleanSerial.length !== 8) return null;
    const vaultFound: { account: string; item: AccountData['vaultItems'][0] }[] = [];
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
            {isTh
              ? 'ระบบค้นหาและตรวจจับ Serial ไอเทม (Serial Search & Dupe Tracker)'
              : 'WebShop Admin: Item Serial Search'}
          </h3>
        </div>

        {actionNotice && (
          <div className="p-3 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-xs flex items-center justify-between">
            <span>{actionNotice}</span>
            <button type="button" onClick={() => setActionNotice(null)} className="cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs text-zinc-300">
            {isTh ? 'กรอก Serial ไอเทม (เลขฐาน 16 จำนวน 8 หลัก):' : 'Item Serial (8 Hex Digits):'}
          </label>
          <input
            type="text"
            maxLength={8}
            value={serialInput}
            onChange={(e) => setSerialInput(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono-tabular uppercase rounded bg-zinc-950 border border-zinc-700 text-amber-400 font-bold"
          />
          <span className="text-[11px] text-zinc-400">
            {isTh ? 'ตัวอย่าง:' : 'Try:'} <code className="text-zinc-200">00A84F21</code> ·{' '}
            <code className="text-zinc-200">00B91E04</code> ·{' '}
            <code className="text-zinc-200">00000000</code>
          </span>
        </div>

        {cleanSerial === '00000000' ? (
          <div className="p-3.5 rounded border border-rose-500/40 bg-rose-500/10 text-xs text-rose-200 leading-relaxed">
            {isTh
              ? 'คำเตือน: การค้นหาไอเทม Serial `00000000` (ไอเทมเสก/ปั๊มโกง) มีปริมาณมากบนเซิร์ฟเวอร์ OpenMU กรุณาตรวจสอบผ่านคำสั่ง SQL บนคอนโซลหรือโปรแกรมจัดการเซิร์ฟเวอร์โดยตรง'
              : 'Searching for serial 00000000 exceeds timeout. Please check database directly.'}
          </div>
        ) : cleanSerial.length !== 8 ? (
          <div className="text-xs text-rose-400">
            {isTh ? 'หมายเลข Serial ต้องมีขนาดตรง 8 ตัวอักษรพอดี' : 'The serial must be exactly 8 characters long!'}
          </div>
        ) : (
          matches && (
            <div className="space-y-5 pt-2">
              {/* Vault Matches */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-zinc-200 flex items-center justify-between">
                  <span>
                    {isTh ? 'พบอยู่ในคลังของผู้เล่น (Warehouse Vaults)' : 'Found in Warehouse Vaults'}: ({matches.vaultFound.length})
                  </span>
                  {matches.vaultFound.length > 1 && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-[10px] uppercase">
                      ⚠️ {isTh ? 'ตรวจพบ Serial ซ้ำ (Duplicated Item)!' : 'Dupe Detected!'}
                    </span>
                  )}
                </div>

                {matches.vaultFound.length > 0 ? (
                  matches.vaultFound.map((vf, idx) => {
                    const catItem = catalog.find((c) => c.uid === vf.item.itemUid);
                    const tip = formatItemTooltip(vf.item, catItem, config);
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                          <div className="text-xs text-emerald-400 font-medium">
                            {isTh ? 'อยู่ในคลังบัญชี:' : 'Located in Account:'}{' '}
                            <strong className="text-white">{vf.account}</strong>{' '}
                            (Vault Slot #{vf.item.slotIndex} · แถว {Math.floor(vf.item.slotIndex / 8) + 1}, คอลัมน์ {(vf.item.slotIndex % 8) + 1})
                          </div>
                          {onAdminDeleteVaultItem && (
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    isTh
                                      ? `ยืนยันการลบไอเทม Serial ${vf.item.serial} ออกจากคลังของ ${vf.account}?`
                                      : `Delete item ${vf.item.serial} from ${vf.account}'s vault?`
                                  )
                                ) {
                                  onAdminDeleteVaultItem(vf.account, vf.item.instanceId, vf.item.serial);
                                  setActionNotice(
                                    isTh
                                      ? `ลบไอเทม Serial ${vf.item.serial} จากคลังของ ${vf.account} สำเร็จ`
                                      : `Deleted item from ${vf.account}'s vault.`
                                  );
                                }
                              }}
                              className="px-2.5 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold cursor-pointer"
                            >
                              {isTh ? 'ลบไอเทมนี้ออกจากคลังผู้เล่น' : 'Delete from Vault'}
                            </button>
                          )}
                        </div>
                        <ItemTooltipCard tooltip={tip} />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-zinc-500 p-3 rounded bg-zinc-950 border border-zinc-800/80">
                    {isTh ? 'ไม่พบไอเทม Serial นี้ในคลังของผู้เล่นคนใดในขณะนี้' : 'Not currently found in any user warehouse.'}
                  </div>
                )}
              </div>

              {/* Purchase Log Matches */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-200">
                  {isTh ? 'ประวัติการซื้อในร้านค้าที่เกี่ยวข้อง' : 'Found in Purchase Logs'}: ({matches.logFound.length})
                </div>
                {matches.logFound.length > 0 ? (
                  matches.logFound.map((lf) => (
                    <div
                      key={lf.id}
                      className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between"
                    >
                      <span>
                        <strong className="text-amber-400">{lf.accountId}</strong>: {lf.details}
                      </span>
                      <span className="font-mono-tabular text-zinc-500 text-[11px]">
                        {new Date(lf.dateline * 1000).toLocaleString(isTh ? 'th-TH' : 'en-US')}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-zinc-500 p-3 rounded bg-zinc-950 border border-zinc-800/80">
                    {isTh ? 'ไม่พบประวัติการซื้อ Serial นี้ในระบบ WebShop' : 'No purchase records found.'}
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
// 6. Top Credited Accounts (modules/top.php)
// =========================================================================
export const TopAccountsModule: React.FC<{
  accounts: AccountData[];
  logs: LogEntry[];
  lang?: LanguageCode;
  onManageUserCredits: (username: string) => void;
  onViewUserLogs: (username: string) => void;
}> = ({ accounts, logs, lang = 'Thai', onManageUserCredits, onViewUserLogs }) => {
  const isTh = lang === 'Thai';
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
            <span>{isTh ? 'อันดับบัญชีผู้เล่นสูงสุดในระบบ' : 'Account Rankings'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400">{isTh ? 'จัดเรียงตาม:' : 'Sort by:'}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'credits' | 'zen' | 'online')}
              className="bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1 text-zinc-200 cursor-pointer"
            >
              <option value="credits">{isTh ? 'เครดิตสูงสุด' : 'Top Credits'}</option>
              <option value="zen">{isTh ? 'Zen ในคลังสูงสุด' : 'Top Vault Zen'}</option>
              <option value="online">{isTh ? 'เวลาออนไลน์สูงสุด' : 'Top Online Time'}</option>
            </select>
          </div>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-950/60 text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="px-4 py-2.5 w-12">#</th>
              <th className="px-4 py-2.5">{isTh ? 'ชื่อบัญชี' : 'Username'}</th>
              <th className="px-4 py-2.5 text-right">{isTh ? 'เครดิต' : 'Credits'}</th>
              <th className="px-4 py-2.5 text-right">{isTh ? 'Zen ในคลัง' : 'Vault Zen'}</th>
              <th className="px-4 py-2.5 text-center">{isTh ? 'เวลาออนไลน์' : 'Online Time'}</th>
              <th className="px-4 py-2.5 text-center">{isTh ? 'สถานะ VIP' : 'VIP'}</th>
              <th className="px-4 py-2.5 text-right">{isTh ? 'จัดการ' : 'Action'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {sorted.map((acc, idx) => {
              const logCount = logs.filter((l) => l.accountId.toLowerCase() === acc.username.toLowerCase()).length;
              const isVip = !!(acc.vipUntil && new Date(acc.vipUntil) > new Date());
              return (
                <tr key={acc.username} className="hover:bg-zinc-800/40">
                  <td className="px-4 py-2.5 font-mono-tabular text-zinc-500 font-bold">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
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
                      <span className="ml-1.5 px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
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
                    {Math.floor((acc.onlineMinutes || 0) / 60)}h {(acc.onlineMinutes || 0) % 60}m
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
                      {isTh ? 'ปรับเครดิต' : 'Credits'}
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
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// =========================================================================
// 7. User Vaults Viewer (modules/admwh.php)
// =========================================================================
export const UserVaultsViewerModule: React.FC<{
  accounts: AccountData[];
  catalog: WebShopItem[];
  config: WebShopConfig;
  lang?: LanguageCode;
  onTrackSerial: (serial: string) => void;
  onAdminDeleteVaultItem?: (username: string, instanceId: string, serial: string) => void;
}> = ({ accounts, catalog, config, lang = 'Thai', onTrackSerial, onAdminDeleteVaultItem }) => {
  const isTh = lang === 'Thai';
  const [selectedUser, setSelectedUser] = useState(accounts[0]?.username || 'netsplit');
  const targetAcc = accounts.find((a) => a.username.toLowerCase() === selectedUser.toLowerCase());

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/80 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2.5">
          <Eye className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-bold text-white uppercase tracking-wider">
              {isTh ? 'ส่องคลังเก็บของของผู้เล่น (User Vaults Viewer)' : 'User Vaults Viewer'}
            </h3>
            <p className="text-zinc-400 text-[11px]">
              {isTh
                ? 'ดูไอเทมในคลังขนาด 8×15 ของผู้เล่นทุกคน ตรวจสอบ Serial หรือลบไอเทมผิดกฎหมาย'
                : 'Inspect any player 8×15 warehouse vault and track item serials.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-400">{isTh ? 'เลือกบัญชีผู้เล่น:' : 'Select Account:'}</span>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-100 font-medium cursor-pointer"
          >
            {accounts.map((a) => (
              <option key={a.username} value={a.username}>
                {a.username} ({a.vaultItems.length} {isTh ? 'ไอเทม' : 'items'} · {(a.vaultMoney / 1_000_000).toFixed(0)}M Zen)
              </option>
            ))}
          </select>
        </div>
      </div>

      {targetAcc ? (
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs">
            <span className="text-zinc-300">
              {isTh ? 'คลังของผู้เล่น:' : 'Vault of:'} <strong className="text-amber-400">{targetAcc.username}</strong>
              <span className="ml-3 font-mono-tabular text-zinc-400">
                Zen: {targetAcc.vaultMoney.toLocaleString()} / 900,000,000
              </span>
            </span>
            <span className="text-zinc-500 font-mono-tabular">
              {targetAcc.vaultItems.length} {isTh ? 'ชิ้นในคลัง' : 'vault items'}
            </span>
          </div>

          <WarehouseGrid
            vaultItems={targetAcc.vaultItems}
            catalog={catalog}
            config={config}
            allowRefund={true}
            onRefundItem={(inst) => {
              if (
                onAdminDeleteVaultItem &&
                window.confirm(
                  isTh
                    ? `ยืนยันการลบ ${inst.name} (Serial: ${inst.serial}) ออกจากคลังของ ${targetAcc.username}?`
                    : `Remove ${inst.name} (Serial: ${inst.serial}) from ${targetAcc.username}'s vault?`
                )
              ) {
                onAdminDeleteVaultItem(targetAcc.username, inst.instanceId, inst.serial);
              }
            }}
            onTrackSerial={onTrackSerial}
          />
        </div>
      ) : (
        <div className="text-xs text-rose-400 p-4 rounded bg-zinc-950 border border-zinc-800">
          {isTh ? 'ไม่พบคลังของผู้เล่นนี้' : 'User has no vault.'}
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 8. IP Ban Manager (modules/managebans.php)
// =========================================================================
export const IpBanManagerModule: React.FC<{
  bans: IpBanEntry[];
  lang?: LanguageCode;
  onAddBan: (name: string, iprange: string, displtxt: string) => void;
  onRemoveBan: (id: number) => void;
}> = ({ bans, lang = 'Thai', onAddBan, onRemoveBan }) => {
  const isTh = lang === 'Thai';
  const [bname, setBname] = useState('Undefined Ban');
  const [ipStart, setIpStart] = useState('192.168.1.1');
  const [ipEnd, setIpEnd] = useState('192.168.1.255');
  const [displ, setDispl] = useState(
    'You are not permitted to access this area.'
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [testIpInput, setTestIpInput] = useState('');
  const [testResult, setTestResult] = useState<{ matched: boolean; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bname.trim() || !ipStart.trim() || !ipEnd.trim()) return;

    onAddBan(bname.trim(), `${ipStart.trim()}-${ipEnd.trim()}`, displ.trim());
    setNotice(
      isTh
        ? `เพิ่มกฎแบน IP "${bname.trim()}" (${ipStart.trim()}-${ipEnd.trim()}) สำเร็จ!`
        : `Added IP ban rule for ${ipStart.trim()}-${ipEnd.trim()}!`
    );
    setBname('Botnet Ban');
    setIpStart('10.0.0.1');
    setIpEnd('10.0.0.255');
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
        text: isTh
          ? `⚠️ IP ${ip} ตรงกับกฎแบน #${matched.id} ("${matched.name}") ข้อความ: "${matched.displtxt}"`
          : `⚠️ IP ${ip} matches ban rule #${matched.id} ("${matched.name}"): "${matched.displtxt}"`,
      });
    } else {
      setTestResult({
        matched: false,
        text: isTh
          ? `✅ IP ${ip} ปลอดภัย ไม่อยู่ในรายชื่อ IP ที่ถูกแบน`
          : `✅ IP ${ip} is NOT banned. Access is permitted.`,
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
          <button type="button" onClick={() => setNotice(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* IP Ban List */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden shadow-xl">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between text-xs font-semibold text-zinc-100">
          <div className="flex items-center gap-2">
            <ShieldBan className="w-4 h-4 text-amber-400" />
            <span>{isTh ? 'รายการแบน IP ทั้งหมดในระบบ' : 'Configured IP Ban Rules'} ({bans.length})</span>
          </div>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-950/60 text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="px-4 py-2.5">#</th>
              <th className="px-4 py-2.5">{isTh ? 'ชื่อกฎ / ผู้ถูกแบน' : 'Identity'}</th>
              <th className="px-4 py-2.5">{isTh ? 'ช่วง IP' : 'IP Range'}</th>
              <th className="px-4 py-2.5">{isTh ? 'ข้อความแจ้งเตือน' : 'Text to Display'}</th>
              <th className="px-4 py-2.5 text-center">{isTh ? 'จำนวนครั้งที่บล็อก' : 'Attempts'}</th>
              <th className="px-4 py-2.5 text-right">{isTh ? 'จัดการ' : 'Action'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {bans.map((b, idx) => (
              <tr key={b.id} className="hover:bg-zinc-800/40">
                <td className="px-4 py-2.5 font-mono-tabular text-zinc-500">{idx + 1}</td>
                <td className="px-4 py-2.5 font-bold text-white">{b.name}</td>
                <td className="px-4 py-2.5 font-mono-tabular text-amber-400">{b.iprange}</td>
                <td className="px-4 py-2.5 text-zinc-300">{b.displtxt}</td>
                <td className="px-4 py-2.5 font-mono-tabular text-center text-zinc-400">{b.attempts}</td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(isTh ? `ยืนยันการปลดแบน IP #${b.id} (${b.name})?` : `Remove ban rule #${b.id}?`)) {
                        onRemoveBan(b.id);
                        setNotice(isTh ? `ปลดแบน IP #${b.id} เรียบร้อยแล้ว` : `Removed ban #${b.id}.`);
                      }
                    }}
                    className="text-rose-400 hover:underline cursor-pointer font-medium"
                  >
                    {isTh ? 'ปลดแบน' : 'Remove'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add New Ban Form */}
      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/80 space-y-4 text-xs"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
          <Plus className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-white">
            {isTh ? 'เพิ่มกฎแบน IP ใหม่' : 'Add New IP Ban Rule'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-zinc-400 mb-1">{isTh ? 'ชื่อผู้ถูกแบน / เหตุผล' : 'Ban Identity'}</label>
            <input
              type="text"
              required
              value={bname}
              onChange={(e) => setBname(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">{isTh ? 'IP เริ่มต้น – IP สิ้นสุด' : 'Start IP – End IP'}</label>
            <div className="flex items-center gap-1">
              <input
                type="text"
                required
                value={ipStart}
                onChange={(e) => setIpStart(e.target.value)}
                className="w-full px-2 py-1.5 font-mono-tabular rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
              />
              <span>-</span>
              <input
                type="text"
                required
                value={ipEnd}
                onChange={(e) => setIpEnd(e.target.value)}
                className="w-full px-2 py-1.5 font-mono-tabular rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">{isTh ? 'ข้อความแจ้งเตือนที่แสดง' : 'Display Message'}</label>
            <input
              type="text"
              required
              value={displ}
              onChange={(e) => setDispl(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors cursor-pointer shadow-lg"
          >
            {isTh ? '+ เพิ่มกฎแบน IP' : 'Add New Ban'}
          </button>
        </div>
      </form>

      {/* Diagnostic: Test IP against bans */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-2 text-xs">
        <span className="font-semibold text-zinc-300">
          {isTh ? 'เครื่องมือทดสอบการบล็อก IP (Test IP Diagnostic):' : 'Test IP Ban Diagnostic:'}
        </span>
        <div className="flex items-center gap-2 max-w-md">
          <input
            type="text"
            value={testIpInput}
            onChange={(e) => setTestIpInput(e.target.value)}
            placeholder="e.g. 192.168.1.50"
            className="flex-1 px-3 py-1.5 font-mono-tabular rounded bg-zinc-900 border border-zinc-700 text-zinc-100"
          />
          <button
            type="button"
            onClick={handleTestIp}
            className="px-3.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
          >
            {isTh ? 'ตรวจสอบ' : 'Check'}
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
