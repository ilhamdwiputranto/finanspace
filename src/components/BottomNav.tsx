import React from 'react';
import { LayoutDashboard, TrendingUp, Target, FolderKanban, ListOrdered, Plus } from 'lucide-react';
import { useStore, type NavTab } from '../store/useStore';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setTxModal } = useStore();

  const handleCenterPlusClick = () => {
    // Open transaction modal immediately in default expense mode
    setTxModal(true, 'expense');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-2xl safe-area-bottom">
      <div className="max-w-xl mx-auto px-2 md:px-6 h-17 flex items-center justify-between relative">
        
        {/* Left Side: Ringkasan & Analisis */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'dashboard'
                ? 'text-blue-600 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutDashboard size={20} strokeWidth={activeTab === 'dashboard' ? 2.5 : 1.8} />
            <span className="text-[10px] mt-1 tracking-tight">Ringkasan</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'analytics'
                ? 'text-blue-600 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <TrendingUp size={20} strokeWidth={activeTab === 'analytics' ? 2.5 : 1.8} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Analisis</span>
          </button>
        </div>

        {/* Central Floating Action Button '+' (Always accessible from any screen) */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-5">
          <button
            onClick={handleCenterPlusClick}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 text-white shadow-xl shadow-blue-600/40 hover:shadow-blue-600/60 active:scale-95 transition-all duration-200 flex items-center justify-center border-4 border-slate-50 cursor-pointer group"
            title="Catat Transaksi Baru Cepat (+)"
            aria-label="Catat Transaksi Baru"
          >
            <Plus size={28} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Right Side: Goals, Kategori, Histori */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          <button
            onClick={() => setActiveTab('goals')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              activeTab === 'goals'
                ? 'text-blue-600 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Target size={20} strokeWidth={activeTab === 'goals' ? 2.5 : 1.8} />
            <span className="text-[10px] mt-1 tracking-tight">Goals</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              activeTab === 'categories'
                ? 'text-blue-600 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <FolderKanban size={20} strokeWidth={activeTab === 'categories' ? 2.5 : 1.8} />
            <span className="text-[10px] mt-1 tracking-tight">Kategori</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              activeTab === 'history'
                ? 'text-blue-600 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ListOrdered size={20} strokeWidth={activeTab === 'history' ? 2.5 : 1.8} />
            <span className="text-[10px] mt-1 tracking-tight">Histori</span>
          </button>
        </div>

      </div>
    </nav>
  );
};
