import React, { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { initDatabaseSeeder } from './db/db';

// Components
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { AnalyticsView } from './components/AnalyticsView';
import { GoalsView } from './components/GoalsView';
import { CategoriesView } from './components/CategoriesView';
import { HistoryView } from './components/HistoryView';
import { TransactionModal } from './components/TransactionModal';
import { AuthModal } from './components/AuthModal';
import { ImageViewerModal } from './components/ImageViewerModal';
import { WorkspaceSettingsModal } from './components/WorkspaceSettingsModal';

export default function App() {
  const { activeTab, loadAllData, isLoading, toastMessage } = useStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    async function boot() {
      await initDatabaseSeeder();
      await loadAllData();
    }
    boot();
  }, [loadAllData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-blue-600/30 animate-pulse mb-3">
          F
        </div>
        <p className="text-xs font-bold text-slate-600">Memuat FinanSpace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased flex flex-col">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 pt-4">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'goals' && <GoalsView />}
        {activeTab === 'categories' && <CategoriesView />}
        {activeTab === 'history' && <HistoryView />}
      </main>

      {/* Sticky Bottom Navigation with Center Floating '+' Button */}
      <BottomNav />

      {/* Universal Modals */}
      <TransactionModal />
      <AuthModal />
      <ImageViewerModal />
      <WorkspaceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

    </div>
  );
}
