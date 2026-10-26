import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Lock, KeyRound, Plus, Shield, Check, Database, RefreshCw } from 'lucide-react';
import { exportDatabaseBackup } from '../db/db';

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkspaceSettingsModal: React.FC<WorkspaceSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    workspaces,
    activeSpaceId,
    changeWorkspacePin,
    addWorkspace,
    showToast
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'pin' | 'new_space'>('pin');

  // Change PIN state
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Add Workspace state
  const [wsName, setWsName] = useState('');
  const [wsIcon, setWsIcon] = useState('💼');
  const [wsType, setWsType] = useState<'family' | 'personal' | 'business'>('personal');
  const [wsPin, setWsPin] = useState('1234');
  const [wsDesc, setWsDesc] = useState('');

  if (!isOpen) return null;

  const currentSpace = workspaces.find((w) => w.id === activeSpaceId) || workspaces[0];

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError('PIN harus tepat 4 digit angka.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('Konfirmasi PIN tidak cocok.');
      return;
    }

    const ok = await changeWorkspacePin(activeSpaceId, newPin);
    if (ok) {
      setNewPin('');
      setConfirmPin('');
      setPinError('');
      onClose();
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsName.trim()) return;

    await addWorkspace({
      name: wsName.trim(),
      icon: wsIcon || '📁',
      type: wsType,
      pin: wsPin || '1234',
      description: wsDesc.trim() || undefined,
      color: '#1d4ed8'
    });

    setWsName('');
    setWsDesc('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Keamanan & Kelola Workspace
              </h3>
              <p className="text-[11px] text-slate-500">
                Workspace Aktif: <strong>{currentSpace.name}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl my-4 text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => setActiveSubTab('pin')}
            className={`py-1.5 rounded-lg transition ${
              activeSubTab === 'pin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            Ubah PIN Space Ini
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('new_space')}
            className={`py-1.5 rounded-lg transition ${
              activeSubTab === 'new_space' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            + Buat Space Baru
          </button>
        </div>

        {/* SUBTAB 1: CHANGE PIN */}
        {activeSubTab === 'pin' && (
          <form onSubmit={handleChangePin} className="space-y-3.5 text-xs">
            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200">
              <p className="text-blue-900 font-semibold leading-relaxed">
                PIN aktif untuk <strong>{currentSpace.name}</strong> adalah <strong>{currentSpace.pin}</strong>.
                Anda dapat menggantinya dengan kombinasi 4 digit angka rahasia Anda sendiri.
              </p>
            </div>

            <div>
              <label className="font-extrabold text-slate-800 block mb-1">PIN Baru (4 Digit)</label>
              <input
                type="password"
                maxLength={4}
                required
                value={newPin}
                onChange={(e) => {
                  setPinError('');
                  setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                }}
                placeholder="••••"
                className="w-full text-center tracking-widest text-lg font-black px-3.5 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-extrabold text-slate-800 block mb-1">Konfirmasi PIN Baru</label>
              <input
                type="password"
                maxLength={4}
                required
                value={confirmPin}
                onChange={(e) => {
                  setPinError('');
                  setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                }}
                placeholder="••••"
                className="w-full text-center tracking-widest text-lg font-black px-3.5 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            {pinError && (
              <p className="text-[11px] font-bold text-rose-600">{pinError}</p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md transition"
            >
              Simpan PIN Baru
            </button>
          </form>
        )}

        {/* SUBTAB 2: ADD NEW WORKSPACE */}
        {activeSubTab === 'new_space' && (
          <form onSubmit={handleCreateWorkspace} className="space-y-3.5 text-xs">
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">Nama Workspace</label>
              <input
                type="text"
                required
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
                placeholder="Contoh: Bisnis Katering, Tabungan Haji"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-semibold text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-extrabold text-slate-800 block mb-1">Tipe Ruang</label>
                <select
                  value={wsType}
                  onChange={(e) => setWsType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                >
                  <option value="personal">Pribadi</option>
                  <option value="family">Keluarga</option>
                  <option value="business">Bisnis / Usaha</option>
                </select>
              </div>
              <div>
                <label className="font-extrabold text-slate-800 block mb-1">Ikon Emoji</label>
                <select
                  value={wsIcon}
                  onChange={(e) => setWsIcon(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-base"
                >
                  <option value="💼">💼 Bisnis</option>
                  <option value="🏠">🏠 Rumah</option>
                  <option value="🌸">🌸 Istri</option>
                  <option value="🚗">🚗 Mobil</option>
                  <option value="🌴">🌴 Liburan</option>
                  <option value="💍">💍 Nikah</option>
                  <option value="👶">👶 Anak</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-extrabold text-slate-800 block mb-1">PIN Akses Ruang Ini (4 Digit)</label>
              <input
                type="password"
                maxLength={4}
                required
                value={wsPin}
                onChange={(e) => setWsPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="1234"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-bold tracking-widest text-center"
              />
            </div>

            <div>
              <label className="font-extrabold text-slate-800 block mb-1">Deskripsi Ruang (Opsional)</label>
              <input
                type="text"
                value={wsDesc}
                onChange={(e) => setWsDesc(e.target.value)}
                placeholder="Keterangan singkat ruang kerja ini..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md transition"
            >
              Buat Workspace Baru
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
