import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Edit3, Trash2, ArrowRightLeft, Camera, Link, Sparkles, CheckCircle, Calendar, Target, Clock } from 'lucide-react';
import type { Goal } from '../types';
import { formatIDR, calculateGoalPace, formatDateID } from '../utils/format';
import confetti from 'canvas-confetti';

export const GoalsView: React.FC = () => {
  const {
    goals,
    transactions,
    activeSpaceId,
    saveGoal,
    deleteGoal,
    setTxModal,
    setPreviewImageUrl
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const workspaceGoals = goals.filter(
    (g) => g.spaceId === activeSpaceId || g.spaceId === 'all'
  );

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus target goal "${name}"?`)) {
      await deleteGoal(id);
    }
  };

  const handleQuickDeposit = (goalId: string) => {
    // Open transaction modal directly in 'transfer_goal' mode with pre-selected goal
    setTxModal(true, 'transfer_goal', null, goalId);
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      
      {/* Header & New Goal Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Target Tabungan & Sinking Funds
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Adaptive Pace
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Lacak progres tabungan impian dengan estimasi otomatis kecepatan menabung
          </p>
        </div>
        <button
          onClick={() => {
            setEditingGoal(null);
            setIsModalOpen(true);
          }}
          className="self-start sm:self-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-blue-600/30 active:scale-95 transition cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Buat Target Baru</span>
        </button>
      </div>

      {/* Goals List */}
      {workspaceGoals.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl">
            🎯
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">Belum Ada Target Tabungan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Mulai rencanakan Dana Darurat, DP Rumah, Liburan, atau Upgrade Gadget dengan foto impian dan proyeksi pintar.
          </p>
          <button
            onClick={() => {
              setEditingGoal(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md"
          >
            + Tambah Goal Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workspaceGoals.map((goal) => {
            const pace = calculateGoalPace(goal, transactions);
            const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const isCompleted = percentage >= 100;

            return (
              <div
                key={goal.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-blue-400 transition flex flex-col justify-between"
              >
                <div>
                  {/* Goal Image Banner (Personal Photo / Unsplash) */}
                  {goal.image ? (
                    <div className="h-36 w-full relative overflow-hidden group">
                      <img
                        src={goal.image}
                        alt={goal.name}
                        onClick={() => setPreviewImageUrl(goal.image!)}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500 cursor-pointer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                      
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                          <span className="text-xl p-1 bg-white/20 backdrop-blur-md rounded-lg">
                            {goal.icon}
                          </span>
                          <h3 className="font-extrabold text-sm drop-shadow truncate max-w-[200px]">
                            {goal.name}
                          </h3>
                        </div>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shadow-xs ${pace.badgeColor}`}>
                          {pace.badgeLabel}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 pb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl border border-slate-200">
                          {goal.icon}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm">
                            {goal.name}
                          </h3>
                          {goal.targetDate && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                              <Calendar size={11} /> Target: {formatDateID(goal.targetDate)}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${pace.badgeColor}`}>
                        {pace.badgeLabel}
                      </span>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    
                    {/* Adaptive Pace Projection Box */}
                    <div className="p-2.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-blue-700 block uppercase tracking-wider">
                          Proyeksi Kecepatan Menabung
                        </span>
                        <p className="text-xs font-extrabold text-blue-950 truncate">
                          {pace.projectedDateText}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[9px] text-slate-500 font-bold block">Pace Aktual/bln</span>
                        <span className="text-xs font-black text-slate-800 tabular-nums">
                          {formatIDR(pace.paceMonthly)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Numbers */}
                    <div>
                      <div className="flex justify-between items-baseline text-xs tabular-nums mb-1 font-bold">
                        <span className="text-slate-800">
                          Terkumpul: <strong>{formatIDR(goal.currentAmount)}</strong>
                        </span>
                        <span className="text-blue-600 font-black">{percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-sky-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium mt-1">
                        <span>Target: {formatIDR(goal.targetAmount)}</span>
                        <span>Sisa: {formatIDR(remaining)}</span>
                      </div>
                    </div>

                    {goal.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl">
                        "{goal.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Controls: Setor Dana, Edit, Delete */}
                <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleQuickDeposit(goal.id)}
                    className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <ArrowRightLeft size={13} />
                    <span>Setor Dana</span>
                  </button>

                  {isCompleted && (
                    <button
                      onClick={triggerCelebration}
                      title="Rayakan!"
                      className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition cursor-pointer"
                    >
                      <Sparkles size={16} />
                    </button>
                  )}

                  <button
                    onClick={() => handleEdit(goal)}
                    title="Edit Goal"
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    <Edit3 size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(goal.id, goal.name)}
                    title="Hapus Goal"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ADD / EDIT GOAL */}
      {isModalOpen && (
        <GoalModal
          goal={editingGoal}
          onClose={() => {
            setIsModalOpen(false);
            setEditingGoal(null);
          }}
          onSave={saveGoal}
          activeSpaceId={activeSpaceId}
        />
      )}
    </div>
  );
};

interface GoalModalProps {
  goal: Goal | null;
  onClose: () => void;
  onSave: (goal: Partial<Goal> & { name: string; targetAmount: number }) => Promise<void>;
  activeSpaceId: string;
}

const GoalModal: React.FC<GoalModalProps> = ({ goal, onClose, onSave, activeSpaceId }) => {
  const [name, setName] = useState(goal?.name || '');
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount ? String(goal.targetAmount) : '');
  const [currentAmount, setCurrentAmount] = useState(goal?.currentAmount ? String(goal.currentAmount) : '0');
  const [targetDate, setTargetDate] = useState(goal?.targetDate || '');
  const [icon, setIcon] = useState(goal?.icon || '🎯');
  const [image, setImage] = useState(goal?.image || '');
  const [monthlyTargetPace, setMonthlyTargetPace] = useState(
    goal?.monthlyTargetPace ? String(goal.monthlyTargetPace) : '1500000'
  );
  const [notes, setNotes] = useState(goal?.notes || '');

  const emojiList = ['🎯', '🛡️', '🏡', '🚗', '✈️', '💍', '💻', '👶', '🎓', '🏥', '🏍️', '🎁'];

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
    if (!name.trim() || !Number(targetAmount)) return;

    await onSave({
      id: goal?.id,
      name: name.trim(),
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount || 0),
      targetDate: targetDate || undefined,
      icon,
      image,
      spaceId: activeSpaceId,
      monthlyTargetPace: Number(monthlyTargetPace || 1000000),
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3 mb-3">
          <h3 className="font-extrabold text-slate-900 text-sm">
            {goal ? 'Edit Detail Target Goal' : 'Buat Target Tabungan Baru'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-extrabold text-slate-800 block mb-1">Nama Target Tabungan</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: DP Rumah, Dana Darurat, Tabungan Nikah"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">Target Nominal (Rp)</label>
              <input
                type="number"
                required
                min="10000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="25000000"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-bold tabular-nums"
              />
            </div>
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">Saldo Terkumpul Saat Ini</label>
              <input
                type="number"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-bold tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">Target Batas Waktu</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">Ikon Emoji</label>
              <div className="flex gap-1.5 items-center">
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-12 px-2 py-2 border border-slate-300 rounded-xl text-center text-lg font-bold"
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

          {/* Target Photo Banner */}
          <div>
            <label className="font-extrabold text-slate-800 block mb-1">
              Foto Barang Impian / Visual Target (Opsional)
            </label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 font-bold hover:bg-slate-100">
                <Camera size={14} className="text-blue-600" />
                <span>Upload Foto</span>
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
                  placeholder="URL Foto..."
                  className="w-full pl-7 pr-3 py-1.5 border border-slate-300 rounded-xl text-[11px]"
                />
              </div>
            </div>
            {image && (
              <div className="mt-2 flex items-center gap-2">
                <img src={image} alt="Preview" className="w-14 h-14 rounded-lg object-cover border" />
                <button
                  type="button"
                  onClick={() => setImage('')}
                  className="text-rose-600 text-[11px] font-bold hover:underline"
                >
                  Hapus Foto
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="font-extrabold text-slate-800 block mb-1">
              Rencana Setoran Rutin Bulanan (Rp)
            </label>
            <input
              type="number"
              value={monthlyTargetPace}
              onChange={(e) => setMonthlyTargetPace(e.target.value)}
              placeholder="1500000"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-bold tabular-nums"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Digunakan sebagai dasar proyeksi awal sebelum sistem menghitung kecepatan menabung aktual Anda.
            </p>
          </div>

          <div>
            <label className="font-extrabold text-slate-800 block mb-1">Catatan Tambahan (Opsional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Keterangan alokasi instrumen atau strategi menabung..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
            />
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
              Simpan Target
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
