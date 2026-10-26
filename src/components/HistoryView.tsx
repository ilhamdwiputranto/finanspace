import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Search, Filter, Edit3, Trash2, Receipt, ArrowRightLeft, Calendar, FileText } from 'lucide-react';
import { formatIDR, formatDateID } from '../utils/format';
import type { Transaction } from '../types';

export const HistoryView: React.FC = () => {
  const {
    transactions,
    categories,
    goals,
    activeSpaceId,
    deleteTransaction,
    setTxModal,
    setPreviewImageUrl
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income' | 'transfer_goal'>('all');
  const [filterCategoryId, setFilterCategoryId] = useState('all');

  // Filter transactions for active workspace
  const spaceTransactions = transactions.filter((t) => t.spaceId === activeSpaceId);

  // Filter by search, type, category
  const filteredList = spaceTransactions.filter((tx) => {
    // Type match
    if (filterType !== 'all' && tx.type !== filterType) return false;

    // Category match
    if (filterCategoryId !== 'all' && tx.categoryId !== filterCategoryId) return false;

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const cat = categories.find((c) => c.id === tx.categoryId);
      const goal = goals.find((g) => g.id === tx.goalId);
      const catName = cat?.name.toLowerCase() || '';
      const goalName = goal?.name.toLowerCase() || '';
      const note = tx.note?.toLowerCase() || '';
      const amountStr = String(tx.amount);

      return catName.includes(q) || goalName.includes(q) || note.includes(q) || amountStr.includes(q);
    }

    return true;
  });

  const handleDelete = async (tx: Transaction) => {
    const isGoalTx = tx.type === 'transfer_goal';
    const confirmMsg = isGoalTx
      ? `Hapus mutasi transfer sebesar ${formatIDR(tx.amount)}? Saldo goal terkait akan otomatis disesuaikan kembali.`
      : `Hapus transaksi ${formatIDR(tx.amount)} ini dari riwayat?`;

    if (window.confirm(confirmMsg)) {
      await deleteTransaction(tx.id);
    }
  };

  const handleEdit = (tx: Transaction) => {
    setTxModal(true, tx.type === 'transfer_goal' ? 'transfer_goal' : (tx.type as 'expense' | 'income'), tx);
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Riwayat & Mutasi Kas
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Koreksi detail atau hapus transaksi bila terjadi kesalahan pencatatan
        </p>

        {/* Search Bar */}
        <div className="mt-3 relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={15} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari transaksi, catatan, atau nominal..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 mt-3 overflow-x-auto no-scrollbar py-0.5 text-xs font-bold">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({spaceTransactions.length})
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterType === 'expense'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Pengeluaran
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterType === 'income'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Pemasukan
          </button>
          <button
            onClick={() => setFilterType('transfer_goal')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterType === 'transfer_goal'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            Setoran Goal
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
              📝
            </div>
            <p className="font-bold text-slate-700 text-xs">Tidak ada mutasi yang cocok.</p>
            <p className="text-[11px] text-slate-400">
              Coba reset filter atau catat transaksi baru lewat tombol (+) di bawah.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredList.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              const goal = goals.find((g) => g.id === tx.goalId);
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer_goal';

              return (
                <div
                  key={tx.id}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition"
                >
                  {/* Left: Icon & Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0 border ${
                        isIncome
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : isTransfer
                          ? 'bg-blue-50 text-blue-600 border-blue-200'
                          : 'bg-rose-50 text-rose-600 border-rose-200'
                      }`}
                    >
                      {isTransfer ? '🎯' : cat?.icon || '📝'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                          {isTransfer ? `Alokasi: ${goal?.name || 'Target Goal'}` : cat?.name || 'Pos Umum'}
                        </h4>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                            isIncome
                              ? 'bg-emerald-100 text-emerald-800'
                              : isTransfer
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isTransfer ? 'Goal' : isIncome ? 'Masuk' : 'Keluar'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        {tx.note ? `${tx.note} • ` : ''}
                        <span>{formatDateID(tx.date)}</span>
                      </p>

                      {/* Attached Receipt Thumbnail */}
                      {tx.receipt && (
                        <div
                          onClick={() => setPreviewImageUrl(tx.receipt!)}
                          className="inline-flex items-center gap-1.5 mt-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/80 cursor-pointer hover:bg-blue-100 transition"
                        >
                          <Receipt size={11} />
                          <span>Lihat Bukti Struk</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Nominal & Actions */}
                  <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
                    <div className="text-right">
                      <p
                        className={`text-xs sm:text-sm font-black tabular-nums ${
                          isIncome
                            ? 'text-emerald-600'
                            : isTransfer
                            ? 'text-blue-600'
                            : 'text-slate-900'
                        }`}
                      >
                        {isIncome ? '+' : isTransfer ? '' : '-'}
                        {formatIDR(tx.amount)}
                      </p>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {tx.date}
                      </span>
                    </div>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(tx)}
                        title="Edit / Koreksi Transaksi"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(tx)}
                        title="Hapus Transaksi"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
