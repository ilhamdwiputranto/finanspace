import Dexie, { type Table } from 'dexie';
import type { Workspace, Category, Goal, Transaction } from '../types';

export class FinanSpaceDatabase extends Dexie {
  workspaces!: Table<Workspace, string>;
  categories!: Table<Category, string>;
  goals!: Table<Goal, string>;
  transactions!: Table<Transaction, string>;

  constructor() {
    super('FinanSpaceDB');
    this.version(1).stores({
      workspaces: 'id, name, type, pin',
      categories: 'id, name, type, spaceId',
      goals: 'id, name, spaceId, targetDate',
      transactions: 'id, type, spaceId, categoryId, goalId, date, createdAt'
    });
  }
}

export const db = new FinanSpaceDatabase();

// Initial Seeder if DB is empty
export async function initDatabaseSeeder(): Promise<void> {
  const workspaceCount = await db.workspaces.count();
  if (workspaceCount > 0) return;

  // 1. Initial Workspaces with PIN '1234'
  await db.workspaces.bulkAdd([
    {
      id: 'sp-1',
      name: 'Rumah Tangga (Bersama)',
      type: 'family',
      icon: '🏠',
      pin: '1234',
      color: '#1d4ed8',
      description: 'Kas operasional belanja dapur, utilitas, dan pos tabungan masa depan keluarga.'
    },
    {
      id: 'sp-2',
      name: 'Pribadi (Suami)',
      type: 'personal',
      icon: '💼',
      pin: '1234',
      color: '#0284c7',
      description: 'Kas pribadi suami, hobi, transportasi kerja, dan pengembangan diri.'
    },
    {
      id: 'sp-3',
      name: 'Pribadi (Istri)',
      type: 'personal',
      icon: '🌸',
      pin: '1234',
      color: '#0ea5e9',
      description: 'Kas tabungan mandiri istri, perawatan diri, dan hobi.'
    }
  ]);

  // 2. Initial Categories (Both Income and Expense)
  await db.categories.bulkAdd([
    // Income Categories
    {
      id: 'cat-inc-1',
      name: 'Gaji Bulanan',
      type: 'income',
      icon: '💰',
      spaceId: 'all',
      color: '#10b981',
      image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=300&q=80'
    },
    {
      id: 'cat-inc-2',
      name: 'Freelance & Bisnis',
      type: 'income',
      icon: '💻',
      spaceId: 'all',
      color: '#0284c7',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&q=80'
    },
    {
      id: 'cat-inc-3',
      name: 'Dividen & Investasi',
      type: 'income',
      icon: '📈',
      spaceId: 'all',
      color: '#6366f1',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300&q=80'
    },
    {
      id: 'cat-inc-4',
      name: 'Bonus & THR',
      type: 'income',
      icon: '🎁',
      spaceId: 'sp-1',
      color: '#f59e0b',
      image: ''
    },

    // Expense Categories
    {
      id: 'cat-exp-1',
      name: 'Belanja Dapur & Pokok',
      type: 'expense',
      icon: '🛒',
      spaceId: 'all',
      color: '#ef4444',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80',
      budgetLimit: 3500000
    },
    {
      id: 'cat-exp-2',
      name: 'Listrik, Air & Wi-Fi',
      type: 'expense',
      icon: '⚡',
      spaceId: 'sp-1',
      color: '#f97316',
      image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=300&q=80',
      budgetLimit: 1200000
    },
    {
      id: 'cat-exp-3',
      name: 'Pendidikan & Kursus',
      type: 'expense',
      icon: '📚',
      spaceId: 'sp-1',
      color: '#8b5cf6',
      image: '',
      budgetLimit: 1500000
    },
    {
      id: 'cat-exp-4',
      name: 'Makan di Luar & Kopi',
      type: 'expense',
      icon: '☕',
      spaceId: 'all',
      color: '#ec4899',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&q=80',
      budgetLimit: 1000000
    },
    {
      id: 'cat-exp-5',
      name: 'Bensin & Transportasi',
      type: 'expense',
      icon: '🚗',
      spaceId: 'all',
      color: '#64748b',
      image: '',
      budgetLimit: 800000
    },
    {
      id: 'cat-exp-6',
      name: 'Kesehatan & Asuransi',
      type: 'expense',
      icon: '🏥',
      spaceId: 'sp-1',
      color: '#06b6d4',
      image: '',
      budgetLimit: 1000000
    }
  ]);

  // 3. Initial Goals with personal photos and realistic targets
  await db.goals.bulkAdd([
    {
      id: 'goal-1',
      name: 'Dana Darurat 6 Bulan',
      targetAmount: 30000000,
      currentAmount: 18500000,
      targetDate: '2027-04-30',
      icon: '🛡️',
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80',
      spaceId: 'sp-1',
      monthlyTargetPace: 2000000,
      notes: 'Disimpan di instrumen Reksadana Pasar Uang & Deposito Likuid.'
    },
    {
      id: 'goal-2',
      name: 'DP Rumah Impian',
      targetAmount: 85000000,
      currentAmount: 34000000,
      targetDate: '2028-06-30',
      icon: '🏡',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
      spaceId: 'sp-1',
      monthlyTargetPace: 3000000,
      notes: 'Untuk uang muka rumah klaster subsidi/komersil dekat stasiun.'
    },
    {
      id: 'goal-3',
      name: 'Liburan & Umroh Keluarga',
      targetAmount: 40000000,
      currentAmount: 12000000,
      targetDate: '2027-11-30',
      icon: '✈️',
      image: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=600&q=80',
      spaceId: 'sp-1',
      monthlyTargetPace: 1500000,
      notes: 'Tabungan khusus keberangkatan bersama orang tua.'
    },
    {
      id: 'goal-4',
      name: 'Upgrade Laptop Kerja',
      targetAmount: 16000000,
      currentAmount: 12500000,
      targetDate: '2026-12-15',
      icon: '💻',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
      spaceId: 'sp-2',
      monthlyTargetPace: 1000000,
      notes: 'Laptop Macbook M-Series untuk freelance programming & desain.'
    }
  ]);

  // 4. Initial Transactions
  const now = new Date();
  const formatD = (daysAgo: number) => {
    const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  };

  await db.transactions.bulkAdd([
    {
      id: 'tx-1',
      type: 'income',
      amount: 14500000,
      categoryId: 'cat-inc-1',
      spaceId: 'sp-1',
      date: formatD(24),
      note: 'Gaji Pokok Awal Bulan',
      createdAt: Date.now() - 24 * 86400000
    },
    {
      id: 'tx-2',
      type: 'income',
      amount: 3200000,
      categoryId: 'cat-inc-2',
      spaceId: 'sp-1',
      date: formatD(20),
      note: 'Pembayaran project web freelance',
      createdAt: Date.now() - 20 * 86400000
    },
    {
      id: 'tx-3',
      type: 'expense',
      amount: 2150000,
      categoryId: 'cat-exp-1',
      spaceId: 'sp-1',
      date: formatD(18),
      note: 'Belanja bulanan Superindo & sayur organik',
      receipt: 'https://images.unsplash.com/photo-1554415707-9e4966a6e483?w=400&q=80',
      createdAt: Date.now() - 18 * 86400000
    },
    {
      id: 'tx-4',
      type: 'expense',
      amount: 850000,
      categoryId: 'cat-exp-2',
      spaceId: 'sp-1',
      date: formatD(15),
      note: 'Token Listrik PLN & Tagihan Biznet',
      createdAt: Date.now() - 15 * 86400000
    },
    {
      id: 'tx-5',
      type: 'transfer_goal',
      amount: 2000000,
      categoryId: 'cat-exp-1',
      goalId: 'goal-1',
      spaceId: 'sp-1',
      date: formatD(12),
      note: 'Alokasi sisa pos belanja ke Dana Darurat',
      createdAt: Date.now() - 12 * 86400000
    },
    {
      id: 'tx-6',
      type: 'transfer_goal',
      amount: 3000000,
      categoryId: 'cat-inc-1',
      goalId: 'goal-2',
      spaceId: 'sp-1',
      date: formatD(8),
      note: 'Setoran rutin tabungan DP Rumah Impian',
      createdAt: Date.now() - 8 * 86400000
    },
    {
      id: 'tx-7',
      type: 'expense',
      amount: 320000,
      categoryId: 'cat-exp-4',
      spaceId: 'sp-1',
      date: formatD(4),
      note: 'Makan malam akhir pekan keluarga',
      createdAt: Date.now() - 4 * 86400000
    },
    {
      id: 'tx-8',
      type: 'expense',
      amount: 250000,
      categoryId: 'cat-exp-5',
      spaceId: 'sp-1',
      date: formatD(2),
      note: 'Isi Pertamax & saldo e-toll',
      createdAt: Date.now() - 2 * 86400000
    }
  ]);
}

// Export database backup to JSON string
export async function exportDatabaseBackup(): Promise<string> {
  const [workspaces, categories, goals, transactions] = await Promise.all([
    db.workspaces.toArray(),
    db.categories.toArray(),
    db.goals.toArray(),
    db.transactions.toArray()
  ]);

  return JSON.stringify(
    {
      app: 'FinanSpace',
      version: 1,
      exportedAt: new Date().toISOString(),
      workspaces,
      categories,
      goals,
      transactions
    },
    null,
    2
  );
}

// Import database from JSON string
export async function importDatabaseBackup(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);
    if (!data.workspaces || !data.categories || !data.goals || !data.transactions) {
      throw new Error('Format file backup tidak valid.');
    }

    await db.transaction('rw', [db.workspaces, db.categories, db.goals, db.transactions], async () => {
      await db.workspaces.clear();
      await db.categories.clear();
      await db.goals.clear();
      await db.transactions.clear();

      await db.workspaces.bulkAdd(data.workspaces);
      await db.categories.bulkAdd(data.categories);
      await db.goals.bulkAdd(data.goals);
      await db.transactions.bulkAdd(data.transactions);
    });

    return true;
  } catch (err) {
    console.error('Import database failed:', err);
    return false;
  }
}
