import React from 'react';
import { useStore } from '../store/useStore';
import {
  Wallet,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Sparkles,
  Shield,
  ChevronRight,
  Target
} from 'lucide-react';
import { formatIDR, calculateGoalPace } from '../utils/format';

export const DashboardView: React.FC = () => {
  const {
    transactions,
    goals,
    categories,
    workspaces,
    activeSpaceId,
    setTxModal,
    setActiveTab,
    requestSpaceChange
  } = useStore();

  const currentSpace = workspaces.find((w) => w.id === activeSpaceId) || workspaces[0];
  const spaceTransactions = transactions.filter((t) => t.spaceId === activeSpaceId);
  const spaceGoals = goals.filter((g) => g.spaceId === activeSpaceId || g.spaceId === 'all');

  // Compute metrics
  let totalIncome = 0;
  let totalExpense = 0;
  let totalGoalSavings = 0;

  spaceTransactions.forEach((t) => {
    const amt = Number(t.amount);
    if (t.type === 'income') totalIncome += amt;
    if (t.type === 'expense') totalExpense += amt;
    if (t.type === 'transfer_goal') totalGoalSavings += amt;
  });

  const netBalance = totalIncome - totalExpense - totalGoalSavings;

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      
      {/* WORKSPACE WELCOME BADGE */}
      <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl p-1.5 bg-blue-50 border border-blue-100 rounded-xl">
            {currentSpace.icon}
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-black text-slate-900 leading-tight">
                {currentSpace.name}
              </h2>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                <Shield size={9} /> PIN Aktif
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
              {currentSpace.description || 'Ruang pengelolaan kas terproteksi'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const nextWs = workspaces.find((w) => w.id !== activeSpaceId);
            if (nextWs) requestSpaceChange(nextWs.id);
          }}
          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-xl transition cursor-pointer"
        >
          Ganti Space &rarr;
        </button>
      </div>

      {/* SISA KAS AKTIF HERO CARD */}
      <div className="bg-gradient-to-tr from-blue-800 via-blue-700 to-sky-600 rounded-3xl p-5 text-white shadow-xl shadow-blue-700/25 relative overflow-hidden">
        <div className="flex justify-between items-start relative z-10">
          <div>
            <span className="text-xs uppercase font-extrabold text-blue-200 tracking-wider">
              Sisa Kas Anggaran Aktif
            </span>
            <h3 className="text-3xl sm:text-4xl font-black mt-1 tabular-nums tracking-tight">
              {formatIDR(netBalance)}
            </h3>
            <p className="text-[11px] text-blue-100 mt-1 font-medium">
              Tersedia untuk kebutuhan operasional berjalan
            </p>
          </div>
          <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl text-2xl border border-white/20">
            {currentSpace.icon}
          </div>
        </div>

        {/* 3 Metrics Mini Breakdown */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/20 text-center relative z-10">
          <div className="bg-white/10 rounded-xl py-2 px-1 backdrop-blur-xs">
            <span className="text-[10px] text-blue-100 font-semibold block">Pemasukan</span>
            <span className="text-xs sm:text-sm font-black text-emerald-300 tabular-nums truncate block mt-0.5">
              +{formatIDR(totalIncome)}
            </span>
          </div>
          <div className="bg-white/10 rounded-xl py-2 px-1 backdrop-blur-xs">
            <span className="text-[10px] text-blue-100 font-semibold block">Pengeluaran</span>
            <span className="text-xs sm:text-sm font-black text-rose-200 tabular-nums truncate block mt-0.5">
              -{formatIDR(totalExpense)}
            </span>
          </div>
          <div className="bg-white/10 rounded-xl py-2 px-1 backdrop-blur-xs">
            <span className="text-[10px] text-blue-100 font-semibold block">Ke Goals</span>
            <span className="text-xs sm:text-sm font-black text-sky-200 tabular-nums truncate block mt-0.5">
              {formatIDR(totalGoalSavings)}
            </span>
          </div>
        </div>
      </div>

      {/* QUICK ACTION BUTTONS */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => setTxModal(true, 'expense')}
          className="flex flex-col items-center justify-center p-3 bg-white hover:bg-rose-50/50 rounded-2xl border border-slate-200 hover:border-rose-300 shadow-xs active:scale-95 transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg mb-1 group-hover:scale-110 transition">
            💸
          </div>
          <span className="text-xs font-bold text-slate-800">Catat Beban</span>
          <span className="text-[10px] text-slate-400">Pengeluaran</span>
        </button>

        <button
          onClick={() => setTxModal(true, 'income')}
          className="flex flex-col items-center justify-center p-3 bg-white hover:bg-emerald-50/50 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs active:scale-95 transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg mb-1 group-hover:scale-110 transition">
            💵
          </div>
          <span className="text-xs font-bold text-slate-800">Pemasukan</span>
          <span className="text-[10px] text-slate-400">Gaji & Bisnis</span>
        </button>

        <button
          onClick={() => setTxModal(true, 'transfer_goal')}
          className="flex flex-col items-center justify-center p-3 bg-white hover:bg-blue-50/50 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-xs active:scale-95 transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg mb-1 group-hover:scale-110 transition">
            🎯
          </div>
          <span className="text-xs font-bold text-slate-800">Alokasi Goal</span>
          <span className="text-[10px] text-slate-400">Setor Tabungan</span>
        </button>
      </div>

      {/* SMART ADVISOR CALLOUT BANNER */}
      <div
        onClick={() => setActiveTab('analytics')}
        className="cursor-pointer bg-gradient-to-r from-amber-500/15 via-blue-50 to-sky-50 border border-amber-300/80 rounded-3xl p-4 flex items-center justify-between hover:border-amber-400 transition shadow-xs group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm shadow-amber-500/40 group-hover:scale-105 transition">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-xs text-slate-900">
                Analisis Finansial Cerdas & Solusi
              </h4>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                Pembaruan
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Evaluasi savings rate, 50/30/20 rule, dan rekomendasi percepatan target
            </p>
          </div>
        </div>
        <div className="p-2 rounded-xl bg-white/80 text-blue-600 group-hover:translate-x-1 transition">
          <ChevronRight size={16} />
        </div>
      </div>

      {/* SMART GOALS MINI PREVIEW WITH ADAPTIVE PACE */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Target Tabungan & Sinking Funds
            </h3>
            <p className="text-[11px] text-slate-500">
              Proyeksi adaptif berdasarkan kecepatan menabung riil
            </p>
          </div>
          <button
            onClick={() => setActiveTab('goals')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            Semua Goals &rarr;
          </button>
        </div>

        {spaceGoals.length === 0 ? (
          <p className="text-center py-6 text-slate-400 text-xs">Belum ada target tabungan aktif.</p>
        ) : (
          <div className="space-y-2.5">
            {spaceGoals.slice(0, 2).map((goal) => {
              const pace = calculateGoalPace(goal, transactions);
              const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

              return (
                <div key={goal.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl p-1.5 bg-white rounded-xl border border-slate-200">
                        {goal.icon}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900">{goal.name}</h4>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-0.5 ${pace.badgeColor}`}>
                          {pace.projectedDateText}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setTxModal(true, 'transfer_goal', null, goal.id)}
                      className="text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
                    >
                      + Setor
                    </button>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] font-bold tabular-nums text-slate-600 mb-1">
                      <span>Terkumpul: {formatIDR(goal.currentAmount)}</span>
                      <span className="text-blue-600">{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RECENT TRANSACTIONS PREVIEW */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-extrabold text-slate-900 text-sm">
            Riwayat Transaksi Terbaru
          </h3>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            Buka Histori Lengkap &rarr;
          </button>
        </div>

        {spaceTransactions.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            Belum ada transaksi di workspace ini. Catat transaksi sekarang!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {spaceTransactions.slice(0, 4).map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              const goal = goals.find((g) => g.id === tx.goalId);
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer_goal';

              return (
                <div key={tx.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-base shrink-0">
                      {isTransfer ? '🎯' : cat?.icon || '📝'}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">
                        {isTransfer ? `Alokasi: ${goal?.name || 'Goal'}` : cat?.name || 'Pos Umum'}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {tx.note ? `${tx.note} • ` : ''}{tx.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`font-black tabular-nums ${
                        isIncome ? 'text-emerald-600' : isTransfer ? 'text-blue-600' : 'text-slate-900'
                      }`}
                    >
                      {isIncome ? '+' : isTransfer ? '' : '-'}
                      {formatIDR(tx.amount)}
                    </p>
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
