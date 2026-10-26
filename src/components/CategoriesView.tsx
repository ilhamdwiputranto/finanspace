import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Edit3, Trash2, Globe, Lock, Image as ImageIcon, Camera, Link, DollarSign, ShoppingCart } from 'lucide-react';
import type { Category } from '../types';
import { formatIDR } from '../utils/format';

export const CategoriesView: React.FC = () => {
  const { categories, activeSpaceId, saveCategory, deleteCategory, setPreviewImageUrl } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Filter categories for the current workspace and global ones
  const workspaceCategories = categories.filter(
    (c) => c.spaceId === activeSpaceId || c.spaceId === 'all'
  );

  const incomeCategories = workspaceCategories.filter((c) => c.type === 'income');
  const expenseCategories = workspaceCategories.filter((c) => c.type === 'expense');

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus pos kategori "${name}"?`)) {
      await deleteCategory(id);
    }
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Pos Kategori (Dua Kolom)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pemisahan kolom teratur antara pos pemasukan dan pos pengeluaran
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="self-start sm:self-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-blue-600/30 active:scale-95 transition cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Kategori Baru</span>
        </button>
      </div>

      {/* TWO SEPARATE COLUMNS: PEMASUKAN vs PENGELUARAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* KOLOM 1: POS PEMASUKAN (INCOME) */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-200/80">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                <DollarSign size={15} />
              </div>
              <h3 className="font-extrabold text-emerald-950 text-sm">
                Kolom Pos Pemasukan
              </h3>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              {incomeCategories.length} Pos
            </span>
          </div>

          {incomeCategories.length === 0 ? (
            <p className="text-center py-6 text-emerald-700/60 text-xs">
              Belum ada pos pemasukan. Tambahkan sekarang!
            </p>
          ) : (
            <div className="space-y-2.5">
              {incomeCategories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  onEdit={() => handleEdit(cat)}
                  onDelete={() => handleDelete(cat.id, cat.name)}
                  onPreviewImage={(url) => setPreviewImageUrl(url)}
                />
              ))}
            </div>
          )}
        </div>

        {/* KOLOM 2: POS PENGELUARAN (EXPENSE) */}
        <div className="bg-rose-50/50 border border-rose-200 rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-rose-200/80">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-bold">
                <ShoppingCart size={15} />
              </div>
              <h3 className="font-extrabold text-rose-950 text-sm">
                Kolom Pos Pengeluaran
              </h3>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
              {expenseCategories.length} Pos
            </span>
          </div>

          {expenseCategories.length === 0 ? (
            <p className="text-center py-6 text-rose-700/60 text-xs">
              Belum ada pos pengeluaran.
            </p>
          ) : (
            <div className="space-y-2.5">
              {expenseCategories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  onEdit={() => handleEdit(cat)}
                  onDelete={() => handleDelete(cat.id, cat.name)}
                  onPreviewImage={(url) => setPreviewImageUrl(url)}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* MODAL: ADD / EDIT CATEGORY */}
      {isModalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCategory(null);
          }}
          onSave={saveCategory}
          activeSpaceId={activeSpaceId}
        />
      )}
    </div>
  );
};

interface CategoryCardProps {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
  onPreviewImage: (url: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  onPreviewImage
}) => {
  return (
    <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs hover:border-blue-400 transition flex items-center justify-between gap-3 group">
      
      {/* Icon / Image */}
      <div className="flex items-center gap-3 min-w-0">
        {category.image ? (
          <div
            onClick={() => onPreviewImage(category.image!)}
            className="w-11 h-11 rounded-xl overflow-hidden border border-slate-200 cursor-pointer shrink-0 relative group/img"
          >
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover group-hover/img:scale-110 transition duration-300"
            />
          </div>
        ) : (
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0 border border-slate-200/70">
            {category.icon || '🏷️'}
          </div>
        )}

        <div className="min-w-0">
          <h4 className="font-extrabold text-slate-900 text-xs truncate">
            {category.name}
          </h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            {category.spaceId === 'all' ? (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md">
                <Globe size={9} /> Pos Bersama
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                <Lock size={9} /> Eksklusif
              </span>
            )}
            {category.budgetLimit && (
              <span className="text-[10px] text-slate-500 font-semibold tabular-nums">
                Plapon: {formatIDR(category.budgetLimit)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons: Edit & Delete */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onEdit}
          title="Edit Kategori"
          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
        >
          <Edit3 size={15} />
        </button>
        <button
          onClick={onDelete}
          title="Hapus Kategori"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
        >
          <Trash2 size={15} />
        </button>
      </div>

    </div>
  );
};

interface CategoryModalProps {
  category: Category | null;
  onClose: () => void;
  onSave: (cat: Partial<Category> & { name: string; type: 'income' | 'expense' }) => Promise<Category>;
  activeSpaceId: string;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  category,
  onClose,
  onSave,
  activeSpaceId
}) => {
  const [name, setName] = useState(category?.name || '');
  const [type, setType] = useState<'income' | 'expense'>(category?.type || 'expense');
  const [icon, setIcon] = useState(category?.icon || '🏷️');
  const [image, setImage] = useState(category?.image || '');
  const [isShared, setIsShared] = useState(category?.spaceId === 'all');
  const [budgetLimit, setBudgetLimit] = useState(category?.budgetLimit ? String(category.budgetLimit) : '');

  const emojiList = ['🏷️', '🛒', '🍔', '⚡', '🏥', '🚗', '📚', '☕', '💰', '💻', '📈', '🎁', '🏖️', '🐾', '💄', '🎮'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onSave({
      id: category?.id,
      name: name.trim(),
      type,
      icon,
      image,
      spaceId: isShared ? 'all' : activeSpaceId,
      budgetLimit: budgetLimit ? Number(budgetLimit) : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3 mb-3">
          <h3 className="font-extrabold text-slate-900 text-sm">
            {category ? 'Edit Detail Kategori' : 'Buat Pos Kategori Baru'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-extrabold text-slate-800 block mb-1">Nama Kategori</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Belanja Sayur, Internet Rumah"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">Kolom Jenis</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </select>
            </div>
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">Ikon Emoji</label>
              <div className="flex gap-1.5 items-center">
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-14 px-2 py-2 border border-slate-300 rounded-xl text-center text-lg font-bold"
                />
                <select
                  onChange={(e) => setIcon(e.target.value)}
                  className="flex-1 px-2 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                >
                  <option value="">Pilih...</option>
                  {emojiList.map((em) => (
                    <option key={em} value={em}>{em}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Image Upload or URL */}
          <div>
            <label className="font-extrabold text-slate-800 block mb-1">
              Foto Ikon Khusus / Visual Kategori (Opsional)
            </label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 font-bold hover:bg-slate-100">
                <Camera size={14} className="text-blue-600" />
                <span>Upload</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <div className="flex-1 relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Link size={12} />
                </span>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="URL Foto gambar..."
                  className="w-full pl-7 pr-3 py-1.5 border border-slate-300 rounded-xl text-[11px]"
                />
              </div>
            </div>
            {image && (
              <div className="mt-2 flex items-center gap-2">
                <img src={image} alt="Preview" className="w-10 h-10 rounded-lg object-cover border" />
                <button
                  type="button"
                  onClick={() => setImage('')}
                  className="text-rose-600 text-[11px] font-bold hover:underline"
                >
                  Hapus Gambar
                </button>
              </div>
            )}
          </div>

          {/* Budget Limit (Plapon) */}
          {type === 'expense' && (
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">
                Batas Anggaran / Plapon Bulanan (Rp) (Opsional)
              </label>
              <input
                type="number"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                placeholder="Misal: 2500000"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold tabular-nums"
              />
            </div>
          )}

          {/* Shared Across Workspaces */}
          <div className="flex items-center gap-2 pt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="isSharedCheck"
              checked={isShared}
              onChange={(e) => setIsShared(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300"
            />
            <label htmlFor="isSharedCheck" className="text-slate-700 font-semibold cursor-pointer">
              Tampilkan di seluruh Workspace (Pos Global)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md transition"
            >
              Simpan Kategori
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
