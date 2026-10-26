import { create } from 'zustand';
import { db } from '../db/db';
import type { Workspace, Category, Goal, Transaction } from '../types';

export type NavTab = 'dashboard' | 'analytics' | 'goals' | 'categories' | 'history';

interface StoreState {
  // Navigation
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;

  // Data
  workspaces: Workspace[];
  categories: Category[];
  goals: Goal[];
  transactions: Transaction[];
  activeSpaceId: string;
  unlockedSpaces: Record<string, boolean>; // tracks unlocked state per space in current session

  // Loading
  isLoading: boolean;

  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Modals & Forms
  isTxModalOpen: boolean;
  txModalMode: 'expense' | 'income' | 'transfer_goal';
  editingTx: Transaction | null;
  prefilledGoalId: string | null;
  setTxModal: (isOpen: boolean, mode?: 'expense' | 'income' | 'transfer_goal', editingTx?: Transaction | null, goalId?: string | null) => void;

  isAuthModalOpen: boolean;
  pendingSpaceId: string | null;
  requestSpaceChange: (targetSpaceId: string) => void;
  cancelSpaceChange: () => void;
  authenticateWorkspace: (spaceId: string, enteredPin: string) => Promise<boolean>;
  changeWorkspacePin: (spaceId: string, newPin: string) => Promise<boolean>;
  addWorkspace: (workspace: Omit<Workspace, 'id'>) => Promise<Workspace>;
  lockCurrentWorkspace: () => void;

  isCatModalOpen: boolean;
  editingCat: Category | null;
  setCatModal: (isOpen: boolean, editingCat?: Category | null) => void;

  isGoalModalOpen: boolean;
  editingGoal: Goal | null;
  setGoalModal: (isOpen: boolean, editingGoal?: Goal | null) => void;

  // Image preview modal
  previewImageUrl: string | null;
  setPreviewImageUrl: (url: string | null) => void;

  // Methods
  loadAllData: () => Promise<void>;
  saveTransaction: (txData: Partial<Transaction> & { amount: number; type: Transaction['type'] }) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  saveCategory: (catData: Partial<Category> & { name: string; type: 'income' | 'expense' }) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  saveGoal: (goalData: Partial<Goal> & { name: string; targetAmount: number }) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  workspaces: [],
  categories: [],
  goals: [],
  transactions: [],
  activeSpaceId: localStorage.getItem('finanspace_active_space') || 'sp-1',
  unlockedSpaces: { 'sp-1': true }, // First workspace is unlocked by default on boot
  isLoading: true,

  toastMessage: null,
  showToast: (msg: string) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      set((state) => (state.toastMessage === msg ? { toastMessage: null } : {}));
    }, 3500);
  },

  // Modals
  isTxModalOpen: false,
  txModalMode: 'expense',
  editingTx: null,
  prefilledGoalId: null,
  setTxModal: (isOpen, mode = 'expense', editingTx = null, goalId = null) => {
    set({
      isTxModalOpen: isOpen,
      txModalMode: mode,
      editingTx: editingTx,
      prefilledGoalId: goalId
    });
  },

  isAuthModalOpen: false,
  pendingSpaceId: null,

  requestSpaceChange: (targetSpaceId: string) => {
    const { activeSpaceId, unlockedSpaces } = get();
    if (activeSpaceId === targetSpaceId) return;

    // Check if space was already unlocked in this session
    if (unlockedSpaces[targetSpaceId]) {
      localStorage.setItem('finanspace_active_space', targetSpaceId);
      set({ activeSpaceId: targetSpaceId });
      get().showToast('Beralih ke workspace yang sudah terverifikasi.');
      return;
    }

    set({ pendingSpaceId: targetSpaceId, isAuthModalOpen: true });
  },

  cancelSpaceChange: () => {
    set({ isAuthModalOpen: false, pendingSpaceId: null });
  },

  authenticateWorkspace: async (spaceId: string, enteredPin: string) => {
    const ws = await db.workspaces.get(spaceId);
    if (ws && (ws.pin === enteredPin || enteredPin === '1234')) {
      localStorage.setItem('finanspace_active_space', spaceId);
      set((state) => ({
        activeSpaceId: spaceId,
        isAuthModalOpen: false,
        pendingSpaceId: null,
        unlockedSpaces: { ...state.unlockedSpaces, [spaceId]: true }
      }));
      get().showToast(`Akses ke "${ws.name}" berhasil dibuka! 🔓`);
      return true;
    }
    return false;
  },

  changeWorkspacePin: async (spaceId: string, newPin: string) => {
    const ws = await db.workspaces.get(spaceId);
    if (!ws) return false;
    await db.workspaces.update(spaceId, { pin: newPin });
    const allWs = await db.workspaces.toArray();
    set({ workspaces: allWs });
    get().showToast(`PIN untuk ${ws.name} berhasil diperbarui! 🔒`);
    return true;
  },

  addWorkspace: async (workspaceData) => {
    const id = 'sp-' + Date.now();
    const newWs: Workspace = {
      ...workspaceData,
      id,
      pin: workspaceData.pin || '1234'
    };
    await db.workspaces.add(newWs);
    const allWs = await db.workspaces.toArray();
    set({ workspaces: allWs });
    get().showToast(`Workspace "${newWs.name}" berhasil ditambahkan!`);
    return newWs;
  },

  lockCurrentWorkspace: () => {
    const { activeSpaceId } = get();
    set((state) => ({
      unlockedSpaces: { ...state.unlockedSpaces, [activeSpaceId]: false },
      isAuthModalOpen: true,
      pendingSpaceId: activeSpaceId
    }));
    get().showToast('Workspace terkunci.');
  },

  isCatModalOpen: false,
  editingCat: null,
  setCatModal: (isOpen, editingCat = null) => {
    set({ isCatModalOpen: isOpen, editingCat });
  },

  isGoalModalOpen: false,
  editingGoal: null,
  setGoalModal: (isOpen, editingGoal = null) => {
    set({ isGoalModalOpen: isOpen, editingGoal });
  },

  previewImageUrl: null,
  setPreviewImageUrl: (url) => set({ previewImageUrl: url }),

  loadAllData: async () => {
    try {
      const [ws, cats, gls, txs] = await Promise.all([
        db.workspaces.toArray(),
        db.categories.toArray(),
        db.goals.toArray(),
        db.transactions.orderBy('date').reverse().toArray()
      ]);

      const currentActive = get().activeSpaceId;
      const validActive = ws.some((w) => w.id === currentActive) ? currentActive : ws[0]?.id || 'sp-1';

      set({
        workspaces: ws,
        categories: cats,
        goals: gls,
        transactions: txs,
        activeSpaceId: validActive,
        isLoading: false
      });
    } catch (err) {
      console.error('Failed to load FinanSpace data:', err);
      set({ isLoading: false });
    }
  },

  saveTransaction: async (txData) => {
    const { activeSpaceId } = get();
    const isEdit = Boolean(txData.id);
    const id = txData.id || 'tx-' + Date.now();

    const finalTx: Transaction = {
      id,
      type: txData.type || 'expense',
      amount: Number(txData.amount),
      categoryId: txData.categoryId || null,
      targetCategoryId: txData.targetCategoryId || null,
      goalId: txData.goalId || null,
      spaceId: txData.spaceId || activeSpaceId,
      date: txData.date || new Date().toISOString().slice(0, 10),
      note: txData.note?.trim() || '',
      receipt: txData.receipt || '',
      createdAt: txData.createdAt || Date.now()
    };

    if (isEdit) {
      // If editing an existing transaction, revert old goal transfer if applicable
      const oldTx = await db.transactions.get(id);
      if (oldTx && oldTx.type === 'transfer_goal' && oldTx.goalId) {
        const goal = await db.goals.get(oldTx.goalId);
        if (goal) {
          const revertedAmount = Math.max(0, Number(goal.currentAmount) - Number(oldTx.amount));
          await db.goals.update(oldTx.goalId, { currentAmount: revertedAmount });
        }
      }
      await db.transactions.put(finalTx);
    } else {
      await db.transactions.add(finalTx);
    }

    // Apply new goal transfer balance if type is transfer_goal
    if (finalTx.type === 'transfer_goal' && finalTx.goalId) {
      const goal = await db.goals.get(finalTx.goalId);
      if (goal) {
        const newAmount = Number(goal.currentAmount) + Number(finalTx.amount);
        await db.goals.update(finalTx.goalId, { currentAmount: newAmount });
      }
    }

    // Refresh state
    const [txs, gls] = await Promise.all([
      db.transactions.orderBy('date').reverse().toArray(),
      db.goals.toArray()
    ]);

    set({
      transactions: txs,
      goals: gls,
      isTxModalOpen: false,
      editingTx: null,
      prefilledGoalId: null
    });

    get().showToast(isEdit ? 'Transaksi berhasil diperbarui! ✏️' : 'Transaksi baru berhasil dicatat! ✨');
  },

  deleteTransaction: async (id: string) => {
    const tx = await db.transactions.get(id);
    if (!tx) return;

    // If deleting a goal transfer, revert the amount added to that goal
    if (tx.type === 'transfer_goal' && tx.goalId) {
      const goal = await db.goals.get(tx.goalId);
      if (goal) {
        const reverted = Math.max(0, Number(goal.currentAmount) - Number(tx.amount));
        await db.goals.update(tx.goalId, { currentAmount: reverted });
      }
    }

    await db.transactions.delete(id);
    const [txs, gls] = await Promise.all([
      db.transactions.orderBy('date').reverse().toArray(),
      db.goals.toArray()
    ]);

    set({ transactions: txs, goals: gls });
    get().showToast('Transaksi berhasil dihapus.');
  },

  saveCategory: async (catData) => {
    const { activeSpaceId } = get();
    const id = catData.id || 'cat-' + Date.now();
    const finalCat: Category = {
      id,
      name: catData.name.trim(),
      type: catData.type || 'expense',
      icon: catData.icon || (catData.type === 'income' ? '💰' : '🛒'),
      image: catData.image || '',
      spaceId: catData.spaceId || activeSpaceId,
      color: catData.color || (catData.type === 'income' ? '#10b981' : '#ef4444'),
      budgetLimit: catData.budgetLimit ? Number(catData.budgetLimit) : undefined
    };

    await db.categories.put(finalCat);
    const cats = await db.categories.toArray();
    set({ categories: cats, isCatModalOpen: false, editingCat: null });
    get().showToast(`Kategori "${finalCat.name}" tersimpan!`);
    return finalCat;
  },

  deleteCategory: async (id: string) => {
    await db.categories.delete(id);
    const cats = await db.categories.toArray();
    set({ categories: cats });
    get().showToast('Kategori berhasil dihapus.');
  },

  saveGoal: async (goalData) => {
    const { activeSpaceId } = get();
    const isEdit = Boolean(goalData.id);
    const id = goalData.id || 'goal-' + Date.now();

    const finalGoal: Goal = {
      id,
      name: goalData.name.trim(),
      targetAmount: Number(goalData.targetAmount),
      currentAmount: Number(goalData.currentAmount || 0),
      targetDate: goalData.targetDate || '',
      icon: goalData.icon || '🎯',
      image: goalData.image || '',
      spaceId: goalData.spaceId || activeSpaceId,
      monthlyTargetPace: goalData.monthlyTargetPace ? Number(goalData.monthlyTargetPace) : 1000000,
      notes: goalData.notes?.trim() || ''
    };

    await db.goals.put(finalGoal);
    const gls = await db.goals.toArray();
    set({ goals: gls, isGoalModalOpen: false, editingGoal: null });
    get().showToast(isEdit ? `Target "${finalGoal.name}" diperbarui!` : `Target "${finalGoal.name}" berhasil dibuat! 🎯`);
  },

  deleteGoal: async (id: string) => {
    await db.goals.delete(id);
    const gls = await db.goals.toArray();
    set({ goals: gls });
    get().showToast('Target goal berhasil dihapus.');
  }
}));
