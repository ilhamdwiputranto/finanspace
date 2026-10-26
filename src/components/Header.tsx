import React, { useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { Lock, Unlock, Download, Upload, Plus, Shield, Settings2, Wallet } from 'lucide-react';
import { exportDatabaseBackup, importDatabaseBackup } from '../db/db';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const {
    workspaces,
    activeSpaceId,
    requestSpaceChange,
    lockCurrentWorkspace,
    showToast,
    loadAllData
  } = useStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const currentSpace = workspaces.find((w) => w.id === activeSpaceId) || workspaces[0];

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const jsonStr = await exportDatabaseBackup();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finanspace_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Cadangan data berhasil diunduh! 💾');
    } catch {
      showToast('Gagal mengekspor data.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      const success = await importDatabaseBackup(content);
      if (success) {
        await loadAllData();
        showToast('Data berhasil dipulihkan dari file backup! 🎉');
      } else {
        showToast('File backup rusak atau tidak kompatibel.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-600/20">
            F
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-slate-900 text-base leading-none tracking-tight">FinanSpace</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
              Personal & Family Budget
            </p>
          </div>
        </div>

        {/* Workspace Switcher & Security Controls */}
        <div className="flex items-center gap-1.5">
          
          {/* Workspace Selector Dropdown with PIN Lock prompt */}
          <div className="relative flex items-center bg-slate-100 hover:bg-slate-200/90 border border-slate-300 rounded-xl px-2.5 py-1.5 transition">
            <span className="text-sm mr-1.5 select-none">{currentSpace?.icon || '🏠'}</span>
            <select
              value={activeSpaceId}
              onChange={(e) => requestSpaceChange(e.target.value)}
              className="bg-transparent text-slate-900 text-xs font-bold pr-1 focus:outline-none cursor-pointer"
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id} className="text-slate-900">
                  {ws.name}
                </option>
              ))}
            </select>
            <span title="Dilindungi PIN Workspace" className="inline-flex items-center">
              <Shield size={12} className="text-emerald-600 ml-1 shrink-0" />
            </span>
          </div>

          {/* Quick Lock Current Space */}
          <button
            onClick={lockCurrentWorkspace}
            title="Kunci Workspace ini sekarang"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition"
          >
            <Lock size={15} />
          </button>

          {/* Settings & Workspace Manager */}
          <button
            onClick={onOpenSettings}
            title="Pengaturan & Kelola Workspace"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition"
          >
            <Settings2 size={15} />
          </button>

          {/* Backup / Export */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            title="Unduh Cadangan JSON (Backup)"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition"
          >
            <Download size={15} />
          </button>

          {/* Hidden File Input for Restore */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json,application/json"
            className="hidden"
          />
        </div>
      </div>
    </header>
  );
};
