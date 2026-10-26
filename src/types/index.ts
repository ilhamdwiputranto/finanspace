export interface Workspace {
  id: string;
  name: string;
  type: 'family' | 'personal' | 'business';
  icon: string;
  pin: string; // 4 digit PIN
  color?: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  image?: string;
  spaceId: string; // 'all' or workspace id
  color?: string;
  budgetLimit?: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  icon: string;
  image?: string;
  spaceId: string; // 'all' or workspace id
  monthlyTargetPace?: number;
  notes?: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer_goal' | 'transfer_category';
  amount: number;
  categoryId?: string | null;
  targetCategoryId?: string | null;
  goalId?: string | null;
  spaceId: string;
  date: string;
  note?: string;
  receipt?: string; // image base64 or URL
  createdAt?: number;
}

export interface GoalPaceResult {
  status: 'completed' | 'on-track' | 'warning' | 'stalled';
  paceMonthly: number;
  monthsNeeded: number;
  projectedDateText: string;
  badgeColor: string;
  badgeLabel: string;
}
