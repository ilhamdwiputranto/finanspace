import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { X, Camera, Link, PlusCircle, Check, ArrowRightLeft, Image as ImageIcon } from 'lucide-react';
import { formatIDR } from '../utils/format';

export const TransactionModal: React.FC = () => {
  const {
    isTxModalOpen,
    txModalMode,
    editingTx,
    prefilledGoalId,
    setTxModal,
    categories,
    goals,
    activeSpaceId,
    saveTransaction,
    saveCategory,
    setPreviewImageUrl
  } = useStore();

  const [type, setType] = useState<'expense' | 'income' | 'transfer_goal'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [goalId, setGoalId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [receipt, setReceipt] = useState('');

  // Inline Category Creator inside the dropdown
  const [isInlineAddingCat, setIsInlineAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🏷️');

  // Quick Amount presets
  const quickExpensePresets = [50000, 100000, 250000, 500000, 1000000];

  useEffect(() => {
    if (isTxModalOpen) {
      if (editingTx) {
        setType(editingTx.type === 'transfer_goal' ? 'transfer_goal' : (editingTx.type as 'expense' | 'income'));
        setAmount(String(editingTx.amount));
        setCategoryId(editingTx.categoryId || '');
        setGoalId(editingTx.goalId || '');
        setDate(editingTx.date || new Date().toISOString().slice(0, 10));
        setNote(editingTx.note || '');
        setReceipt(editingTx.receipt || '');
      } else {
        setType(txModalMode);
        setAmount('');
        setDate(new Date().toISOString().slice(0, 10));
        setNote('');
        setReceipt('');

        if (txModalMode === 'transfer_goal') {
          setGoalId(prefilledGoalId || goals[0]?.id || '');
        } else {
          setGoalId('');
        }
      }
      setIsInlineAddingCat(false);
      setNewCatName('');
    }
  }, [isTxModalOpen, txModalMode, editingTx, prefilledGoalId, goals]);

  // Filter categories by type and workspace
  const relevantCategories = categories.filter((c) => {
    const spaceMatch = c.spaceId === activeSpaceId || c.spaceId === 'all';
    if (type === 'income') return spaceMatch && c.type === 'income';
    if (type === 'expense') return spaceMatch && c.type === 'expense';
    return spaceMatch;
  });

  // Ensure default categoryId is set if not already selected
  useEffect(() => {
    if (type !== 'transfer_goal' && !categoryId && relevantCategories.length > 0) {
      setCategoryId(relevantCategories[0].id);
    }
  }, [type, relevantCategories, categoryId]);

  if (!isTxModalOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceipt(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveInlineCategory = async () => {
    if (!newCatName.trim()) return;
    const cat = await saveCategory({
      name: newCatName.trim(),
      type: type === 'income' ? 'income' : 'expense',
      icon: newCatIcon || '🏷️',
      spaceId: activeSpaceId
    });
    setCategoryId(cat.id);
    setIsInlineAddingCat(false);
    setNewCatName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;

    await saveTransaction({
      id: editingTx?.id,
      type,
      amount: numAmount,
      categoryId: type === 'transfer_goal' ? null : categoryId || relevantCategories[0]?.id || null,
      goalId: type === 'transfer_goal' ? goalId || goals[0]?.id || null : null,
      date,
      note,
      receipt
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-5 shadow-2xl max-h-[92vh] overflow-y-auto border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${
              type === 'expense' ? 'bg-rose-600' : type === 'income' ? 'bg-emerald-600' : 'bg-blue-600'
            }`}>
              {type === 'expense' ? '💸' : type === 'income' ? '💵' : '🎯'}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingTx ? 'Koreksi Transaksi' : 'Catat Transaksi Baru'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {editingTx ? 'Perbarui data mutasi kas' : 'Pencatatan langsung & alokasi instan'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setTxModal(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-2xl my-4 text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => { setType('expense'); setIsInlineAddingCat(false); }}
            className={`py-2 rounded-xl transition ${
              type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => { setType('income'); setIsInlineAddingCat(false); }}
            className={`py-2 rounded-xl transition ${
              type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Pemasukan
          </button>
          <button
            type="button"
            onClick={() => { setType('transfer_goal'); setIsInlineAddingCat(false); }}
            className={`py-2 rounded-xl transition ${
              type === 'transfer_goal' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Alokasi Goal
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Amount Input */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="font-extrabold text-slate-800">Nominal Transaksi (Rp)</label>
              {Number(amount) > 0 && (
                <span className="text-slate-500 font-bold tabular-nums">
                  {formatIDR(Number(amount))}
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-lg">
                Rp
              </span>
              <input
                type="number"
                required
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-12 pr-4 py-2.5 text-xl font-black text-slate-900 tabular-nums border-2 border-slate-200 rounded-2xl focus:border-blue-600 focus:outline-none bg-slate-50/50"
              />
            </div>

            {/* Quick Amount Pills */}
            <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
              {quickExpensePresets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(String(val))}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] whitespace-nowrap transition cursor-pointer"
                >
                  +{val >= 1000000 ? `${val / 1000000} jt` : `${val / 1000} rb`}
                </button>
              ))}
            </div>
          </div>

          {/* Transfer to Goal OR Category Selection with Inline Creator */}
          {type === 'transfer_goal' ? (
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3.5 space-y-2">
              <label className="font-extrabold text-blue-900 flex items-center gap-1.5">
                <ArrowRightLeft size={14} className="text-blue-600" />
                Pilih Target Tabungan (Goal) Penerima
              </label>

              {goals.length === 0 ? (
                <p className="text-slate-500 text-xs">Belum ada goal tabungan aktif. Buat goal terlebih dahulu!</p>
              ) : (
                <select
                  value={goalId || goals[0]?.id}
                  onChange={(e) => setGoalId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-blue-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.icon} {g.name} — Terkumpul: {formatIDR(g.currentAmount)} / {formatIDR(g.targetAmount)}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-[11px] text-blue-700 font-medium">
                Dana yang disetorkan akan langsung menambahkan progres target tabungan ini secara otomatis.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-extrabold text-slate-800">Pos Kategori</label>
                <button
                  type="button"
                  onClick={() => setIsInlineAddingCat(!isInlineAddingCat)}
                  className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 text-[11px]"
                >
                  <PlusCircle size={13} />
                  {isInlineAddingCat ? 'Tutup Input Kategori' : '+ Tambah Kategori Baru'}
                </button>
              </div>

              {/* INLINE CATEGORY CREATOR IN DROPDOWN */}
              {isInlineAddingCat ? (
                <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded-2xl space-y-2.5 animate-in fade-in">
                  <span className="font-bold text-blue-900 text-[11px] block">
                    Tambah Pos Kategori Baru Cepat:
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nama Kategori (misal: Salon, Buku)"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-xl font-semibold text-slate-800"
                    />
                    <select
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      className="px-2 py-2 bg-white border border-blue-300 rounded-xl text-base"
                    >
                      <option value="🏷️">🏷️</option>
                      <option value="🛒">🛒</option>
                      <option value="🍔">🍔</option>
                      <option value="⚡">⚡</option>
                      <option value="🏥">🏥</option>
                      <option value="🎮">🎮</option>
                      <option value="⛽">⛽</option>
                      <option value="📚">📚</option>
                      <option value="✈️">✈️</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleSaveInlineCategory}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm text-xs"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              ) : (
                <select
                  value={categoryId}
                  onChange={(e) => {
                    if (e.target.value === '__inline_add__') {
                      setIsInlineAddingCat(true);
                    } else {
                      setCategoryId(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {relevantCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name} {c.spaceId === 'all' ? '(Global)' : ''}
                    </option>
                  ))}
                  <option value="__inline_add__" className="text-blue-600 font-black">
                    ➕ + Tambah Kategori Baru di Sini...
                  </option>
                </select>
              )}
            </div>
          )}

          {/* Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">Tanggal</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">Catatan Keterangan</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: Belanja mingguan sayur"
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Attach Receipt / Image (Camera file upload or direct URL) */}
          <div>
            <label className="font-extrabold text-slate-800 block mb-1">
              Foto Struk / Nota / Gambar Personal (Opsional)
            </label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold transition">
                <Camera size={16} className="text-blue-600" />
                <span>Upload Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Link size={13} />
                </span>
                <input
                  type="url"
                  value={receipt}
                  onChange={(e) => setReceipt(e.target.value)}
                  placeholder="Atau tempel Link URL gambar..."
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Receipt Preview Thumbnail */}
            {receipt && (
              <div className="mt-2.5 flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <div
                  onClick={() => setPreviewImageUrl(receipt)}
                  className="w-14 h-14 rounded-lg overflow-hidden border border-slate-300 cursor-pointer relative group shrink-0"
                >
                  <img src={receipt} alt="Struk nota" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition">
                    Lihat
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-xs truncate">Gambar Bukti Terlampir</p>
                  <p className="text-[10px] text-slate-500">Klik thumbnail untuk melihat ukuran penuh</p>
                </div>
                <button
                  type="button"
                  onClick={() => setReceipt('')}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Hapus foto nota"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-800 hover:to-sky-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-600/30 active:scale-98 transition text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check size={18} strokeWidth={3} />
            <span>{editingTx ? 'Perbarui Transaksi' : 'Simpan Transaksi'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
