import type { Goal, Transaction, GoalPaceResult } from '../types';

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount || 0);
}

export function formatCompactIDR(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)} jt`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)} rb`;
  }
  return formatIDR(amount);
}

export function formatDateID(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Adaptive Goal Pace Projection Algorithm:
 * Evaluates real historical monthly saving rate targeting the goal,
 * calculates months to completion, compares against deadline, and returns adaptive advice.
 */
export function calculateGoalPace(goal: Goal, transactions: Transaction[]): GoalPaceResult {
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  if (remaining === 0) {
    return {
      status: 'completed',
      paceMonthly: 0,
      monthsNeeded: 0,
      projectedDateText: 'Target Telah Tercapai! 🎉',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      badgeLabel: 'Tercapai 100%'
    };
  }

  // Filter transfer transactions specifically targeting this goal
  const goalTxs = transactions.filter((t) => t.goalId === goal.id);

  let paceMonthly = 0;
  if (goalTxs.length > 0) {
    const totalHistorical = goalTxs.reduce((sum, t) => sum + Number(t.amount), 0);
    // Smooth using sample window (minimum 1, max 4 transactions)
    const divisor = Math.max(1, Math.min(4, goalTxs.length));
    paceMonthly = totalHistorical / divisor;
  } else {
    paceMonthly = goal.monthlyTargetPace || 1000000;
  }

  if (paceMonthly <= 0) {
    return {
      status: 'stalled',
      paceMonthly: 0,
      monthsNeeded: 999,
      projectedDateText: 'Pace belum aktif / tertahan',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      badgeLabel: 'Pace Tertahan'
    };
  }

  const monthsNeeded = Math.ceil(remaining / paceMonthly);
  const projectedDate = new Date();
  projectedDate.setMonth(projectedDate.getMonth() + monthsNeeded);

  const projectedDateText = projectedDate.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric'
  });

  // Evaluate against target date if provided
  let isOnTrack = true;
  if (goal.targetDate) {
    const deadline = new Date(goal.targetDate);
    if (projectedDate > deadline) {
      isOnTrack = false;
    }
  }

  return {
    status: isOnTrack ? 'on-track' : 'warning',
    paceMonthly,
    monthsNeeded,
    projectedDateText: `Est. tercapai ${projectedDateText} (${monthsNeeded} bln lagi)`,
    badgeColor: isOnTrack
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-amber-50 text-amber-700 border-amber-200',
    badgeLabel: isOnTrack ? 'Sesuai Pace' : 'Pace Melambat'
  };
}
