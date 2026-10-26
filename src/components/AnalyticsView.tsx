import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  Lightbulb,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  PieChart,
  Sliders,
  Flame,
  Award
} from 'lucide-react';
import { formatIDR } from '../utils/format';

export const AnalyticsView: React.FC = () => {
  const { transactions, goals, categories, activeSpaceId, workspaces } = useStore();
  const [simulatorBoost, setSimulatorBoost] = useState(500000);

  const currentSpace = workspaces.find((w) => w.id === activeSpaceId) || workspaces[0];
  const spaceTransactions = transactions.filter((t) => t.spaceId === activeSpaceId);
  const spaceGoals = goals.filter((g) => g.spaceId === activeSpaceId || g.spaceId === 'all');

  // Compute Cashflow Totals
  let totalIncome = 0;
  let totalExpense = 0;
  let totalGoalSavings = 0;
  const categoryExpenseMap: Record<string, number> = {};

  spaceTransactions.forEach((t) => {
    const amt = Number(t.amount);
    if (t.type === 'income') totalIncome += amt;
    if (t.type === 'expense') {
      totalExpense += amt;
      const catKey = t.categoryId || 'unknown';
      categoryExpenseMap[catKey] = (categoryExpenseMap[catKey] || 0) + amt;
    }
    if (t.type === 'transfer_goal') totalGoalSavings += amt;
  });

  const netBalance = totalIncome - totalExpense - totalGoalSavings;

  // Key Ratios
  const effectiveSavings = totalGoalSavings + Math.max(0, netBalance);
  const savingsRate = totalIncome > 0 ? Math.round((effectiveSavings / totalIncome) * 100) : 0;
  const expenseRatio = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;

  // Emergency Fund Runway (Months of survival based on current monthly expense)
  const emergencyGoal = spaceGoals.find((g) => g.name.toLowerCase().includes('darurat'));
  const emergencyFundAmount = emergencyGoal ? emergencyGoal.currentAmount : 0;
  const monthlyBurn = totalExpense > 0 ? totalExpense : 3000000;
  const runwayMonths = (emergencyFundAmount / monthlyBurn).toFixed(1);

  // Financial Health Score (0 - 100)
  let healthScore = 50;
  if (savingsRate >= 20) healthScore += 25;
  else if (savingsRate >= 10) healthScore += 15;

  if (expenseRatio <= 50) healthScore += 25;
  else if (expenseRatio <= 70) healthScore += 10;
  else healthScore -= 15;

  if (Number(runwayMonths) >= 6) healthScore += 15;
  else if (Number(runwayMonths) >= 3) healthScore += 10;

  healthScore = Math.min(100, Math.max(10, healthScore));

  // Find top spending category
  let topCatId = '';
  let topCatAmount = 0;
  Object.entries(categoryExpenseMap).forEach(([catId, amt]) => {
    if (amt > topCatAmount) {
      topCatAmount = amt;
      topCatId = catId;
    }
  });
  const topCategory = categories.find((c) => c.id === topCatId);

  // Dynamic Rule-Based Financial Advisor & Motivations
  const generateInsights = () => {
    const insights = [];

    // 1. Savings Rate Analysis
    if (savingsRate >= 20) {
      insights.push({
        type: 'success',
        icon: CheckCircle2,
        title: 'Tingkat Tabungan Sangat Sehat (Elite)',
        message: `Rasio simpanan Anda mencapai ${savingsRate}% dari total pemasukan. Angka ini melampaui standar emas perencana keuangan (20%). Konsistensi ini mempercepat kebebasan finansial keluarga!`,
        actionText: 'Pertahankan pos tabungan otomatis saat gajian tiba.'
      });
    } else {
      insights.push({
        type: 'warning',
        icon: Lightbulb,
        title: 'Potensi Optimalisasi Savings Rate',
        message: `Tingkat tabungan aktif Anda saat ini ${savingsRate}%. Mengalokasikan tambahan 5% - 10% pendapatan sebelum belanja konsumtif dapat melipatgandakan kecepatan pencapaian goals Anda.`,
        actionText: 'Terapkan prinsip "Pay Yourself First" di awal bulan.'
      });
    }

    // 2. Spending Control & Top Category Alert
    if (topCategory && topCatAmount > 0) {
      const topCatPct = totalIncome > 0 ? Math.round((topCatAmount / totalIncome) * 100) : 0;
      insights.push({
        type: topCatPct > 35 ? 'danger' : 'info',
        icon: topCatPct > 35 ? ShieldAlert : TrendingUp,
        title: `Sorotan Pos Pengeluaran: ${topCategory.name}`,
        message: `Pos "${topCategory.name}" menyerap ${formatIDR(topCatAmount)} (${topCatPct}% pemasukan). ${
          topCatPct > 35
            ? 'Beban pada pos ini cukup dominan. Pertimbangkan membuat batas plapon belanja mingguan.'
            : 'Pengeluaran pada pos ini masih dalam ambang wajar terkendali.'
        }`,
        actionText: `Tetapkan batas anggaran kategori "${topCategory.name}" di menu Kategori.`
      });
    }

    // 3. Emergency Fund Runway Recommendation
    if (Number(runwayMonths) < 3) {
      insights.push({
        type: 'danger',
        icon: ShieldAlert,
        title: 'Bantalan Dana Darurat Rentan (< 3 Bulan)',
        message: `Cadangan dana darurat saat ini diperkirakan bertahan ${runwayMonths} bulan pengeluaran. Idealnya sebuah keluarga memiliki 3 hingga 6 bulan pengeluaran aman sebagai perisai dari risiko tak terduga.`,
        actionText: 'Prioritaskan setor ke Goal Dana Darurat sebelum pos tersier.'
      });
    } else {
      insights.push({
        type: 'success',
        icon: ShieldCheck,
        title: `Ketahanan Dana Darurat Kuat (${runwayMonths} Bulan)`,
        message: `Fondasi kas keluarga Anda aman menopang pengeluaran selama ${runwayMonths} bulan. Anda siap mengakselerasi target investasi jangka panjang seperti DP Rumah atau Umroh.`,
        actionText: 'Lanjutkan diversifikasi ke aset produktif.'
      });
    }

    // 4. Motivational Financial Mindset
    insights.push({
      type: 'motivation',
      icon: Flame,
      title: 'Mindset Finansial Hari Ini',
      message: 'Kekayaan sejati bukanlah tentang seberapa besar uang yang lewat di rekening, melainkan seberapa tenang Anda dan keluarga menjalani hari esok tanpa rasa cemas finansial.',
      actionText: 'Setiap rupiah yang dialokasikan ke Goal adalah langkah menuju ketenangan.'
    });

    return insights;
  };

  const insightsList = generateInsights();

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      
      {/* Page Title */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Ringkasan & Analisis Finansial
            </h2>
            <p className="text-xs text-slate-500">
              Evaluasi mendalam kesehatan kas {currentSpace.name} & rekomendasi percepatan
            </p>
          </div>
        </div>
      </div>

      {/* HEALTH SCORE HERO CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-blue-300 font-bold flex items-center gap-1.5">
              <Award size={14} className="text-amber-400" />
              Skor Kesehatan Finansial
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl sm:text-5xl font-black text-amber-400 tabular-nums">
                {healthScore}
              </span>
              <span className="text-sm text-slate-300 font-bold">/ 100</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white ml-2">
                {healthScore >= 80 ? 'Sangat Sehat 🌟' : healthScore >= 60 ? 'Cukup Baik 👍' : 'Perlu Penyesuaian ⚠️'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-2 max-w-md leading-relaxed">
              Dihitung secara adaptif berdasarkan rasio simpanan ({savingsRate}%), kontrol pengeluaran, dan ketahanan bantalan kas.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 text-center min-w-[130px]">
            <span className="text-[10px] text-blue-200 font-semibold block uppercase">Ketahanan Kas</span>
            <span className="text-2xl font-black text-white tabular-nums">{runwayMonths}</span>
            <span className="text-[11px] text-blue-200 block font-medium">Bulan Pengeluaran</span>
          </div>
        </div>
      </div>

      {/* 4 KEY METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Metric 1: Savings Rate */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            Savings Rate
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-blue-600 tabular-nums">{savingsRate}%</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 block mt-0.5">
            Target Ideal &gt; 20%
          </span>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(100, savingsRate)}%` }} />
          </div>
        </div>

        {/* Metric 2: Expense Ratio */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            Rasio Beban
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl font-black tabular-nums ${expenseRatio > 70 ? 'text-rose-600' : 'text-slate-800'}`}>
              {expenseRatio}%
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
            Batas Aman &lt; 60%
          </span>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${expenseRatio > 70 ? 'bg-rose-500' : 'bg-slate-700'}`}
              style={{ width: `${Math.min(100, expenseRatio)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Total Pemasukan */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            Total Masuk
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black text-emerald-600 tabular-nums truncate">
              {formatIDR(totalIncome)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
            Arus kas tercatat
          </span>
        </div>

        {/* Metric 4: Total Alokasi Goal */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            Disimpan ke Goal
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black text-blue-600 tabular-nums truncate">
              {formatIDR(totalGoalSavings)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
            Investasi masa depan
          </span>
        </div>

      </div>

      {/* 50 / 30 / 20 BUDGETING RULE GAUGE */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Analisis Pola Anggaran (50 / 30 / 20 Rule)
            </h3>
            <p className="text-[11px] text-slate-500">
              Perbandingan distribusi pengeluaran pokok vs tabungan Anda
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl">
            Formula Klasik
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold block">Kebutuhan Pokok</span>
            <span className="text-sm font-black text-slate-800 tabular-nums block mt-0.5">
              {expenseRatio}%
            </span>
            <span className="text-[10px] text-slate-400">Patokan: ~50%</span>
          </div>
          <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200">
            <span className="text-[10px] text-blue-700 font-bold block">Tabungan & Goals</span>
            <span className="text-sm font-black text-blue-800 tabular-nums block mt-0.5">
              {savingsRate}%
            </span>
            <span className="text-[10px] text-blue-500">Patokan: ~20%</span>
          </div>
          <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
            <span className="text-[10px] text-emerald-700 font-bold block">Sisa Cadangan Kas</span>
            <span className="text-sm font-black text-emerald-800 tabular-nums block mt-0.5 truncate">
              {formatIDR(netBalance)}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">Likuiditas Aman</span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE GOAL ACCELERATION SIMULATOR */}
      <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Sliders size={15} />
          </div>
          <div>
            <h3 className="font-extrabold text-blue-950 text-sm">
              Simulator Akselerasi Kecepatan Goals
            </h3>
            <p className="text-[11px] text-blue-800">
              Lihat dampak penghematan kecil terhadap kecepatan target tercapai
            </p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-blue-200/80 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700">
              Jika Anda menambah tabungan rutin bulanan:
            </span>
            <span className="font-black text-blue-600 tabular-nums text-sm">
              +{formatIDR(simulatorBoost)} / bln
            </span>
          </div>

          <input
            type="range"
            min="100000"
            max="2000000"
            step="100000"
            value={simulatorBoost}
            onChange={(e) => setSimulatorBoost(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />

          <div className="text-[11px] text-slate-600 leading-relaxed bg-blue-50/60 p-2.5 rounded-xl border border-blue-100 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500 shrink-0" />
            <span>
              Dengan tambahan <strong>{formatIDR(simulatorBoost)}/bulan</strong>, target besar Anda seperti <strong>DP Rumah</strong> atau <strong>Dana Darurat</strong> diproyeksikan selesai <strong>{Math.ceil(simulatorBoost / 250000)} hingga {Math.ceil(simulatorBoost / 150000)} bulan lebih awal</strong>!
            </span>
          </div>
        </div>
      </div>

      {/* SMART FINANCIAL ADVISOR FEED */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Lightbulb size={16} className="text-amber-500" />
            Saran & Solusi Finansial FinanSpace
          </h3>
          <span className="text-[10px] font-bold text-slate-400">
            {insightsList.length} Rekomendasi
          </span>
        </div>

        <div className="space-y-2.5">
          {insightsList.map((item, idx) => {
            const Icon = item.icon;
            const styleConfigs = {
              success: 'bg-emerald-50/80 border-emerald-200 text-emerald-950',
              warning: 'bg-amber-50/80 border-amber-200 text-amber-950',
              danger: 'bg-rose-50/80 border-rose-200 text-rose-950',
              info: 'bg-blue-50/80 border-blue-200 text-blue-950',
              motivation: 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
            }[item.type] || 'bg-slate-50 border-slate-200 text-slate-900';

            return (
              <div
                key={idx}
                className={`p-4 rounded-3xl border ${styleConfigs} shadow-xs transition hover:scale-[1.01]`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white/80 shadow-xs shrink-0 mt-0.5">
                    <Icon size={18} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-xs">{item.title}</h4>
                    <p className="text-xs leading-relaxed opacity-90">{item.message}</p>
                    {item.actionText && (
                      <p className="text-[11px] font-bold pt-1.5 opacity-80 flex items-center gap-1">
                        <span>💡 Rekomendasi:</span> {item.actionText}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
