import type { Expense, ExpenseCategory } from './db';

// ============================================================================
// Expense settlement — the math behind feature A (budget + "who owes whom").
//
// Pure functions, no React, fully unit-testable. Everything works in integer
// minor units internally to avoid floating-point drift, then rounds to whole
// currency units for display (INR has no practical sub-rupee splitting here).
// ============================================================================

export interface Settlement {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

const round = (n: number): number => Math.round(n);

/**
 * Net balance per user across all expenses.
 *  +ve  → the group owes this person (they paid more than their share)
 *  -ve  → this person owes the group
 * A user with no involvement is omitted.
 */
export function computeBalances(expenses: Expense[]): Record<string, number> {
  const bal: Record<string, number> = {};
  const bump = (id: string, delta: number) => {
    bal[id] = (bal[id] ?? 0) + delta;
  };

  for (const e of expenses) {
    // "Just me" (empty split) is a personal cost — nets to zero, skip.
    const members = e.splitBetweenUserIds.length > 0 ? e.splitBetweenUserIds : [e.paidByUserId];
    if (members.length === 0) continue;
    const share = e.amount / members.length;
    bump(e.paidByUserId, e.amount); // payer fronted the whole cost
    members.forEach((m) => bump(m, -share)); // each member owes their share
  }

  // Round and drop dust so tiny residuals don't create phantom debts.
  const out: Record<string, number> = {};
  for (const [id, v] of Object.entries(bal)) {
    const r = round(v);
    if (r !== 0) out[id] = r;
  }
  return out;
}

/**
 * Greedy debt simplification (min cash-flow): repeatedly settle the largest
 * debtor against the largest creditor. Produces at most (n-1) transfers.
 */
export function simplifyDebts(balances: Record<string, number>): Settlement[] {
  const creditors = Object.entries(balances)
    .filter(([, v]) => v > 0)
    .map(([id, v]) => ({ id, amt: v }))
    .sort((a, b) => b.amt - a.amt);
  const debtors = Object.entries(balances)
    .filter(([, v]) => v < 0)
    .map(([id, v]) => ({ id, amt: -v })) // store as positive "owes" amount
    .sort((a, b) => b.amt - a.amt);

  const settlements: Settlement[] = [];
  let ci = 0;
  let di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const c = creditors[ci];
    const d = debtors[di];
    const x = Math.min(c.amt, d.amt);
    if (x > 0) {
      settlements.push({ fromUserId: d.id, toUserId: c.id, amount: round(x) });
    }
    c.amt -= x;
    d.amt -= x;
    if (c.amt <= 0.5) ci++;
    if (d.amt <= 0.5) di++;
  }
  return settlements;
}

export function totalSpent(expenses: Expense[]): number {
  return round(expenses.reduce((sum, e) => sum + e.amount, 0));
}

export function spentByCategory(expenses: Expense[]): Record<ExpenseCategory, number> {
  const out = {} as Record<ExpenseCategory, number>;
  for (const e of expenses) {
    out[e.category] = (out[e.category] ?? 0) + e.amount;
  }
  (Object.keys(out) as ExpenseCategory[]).forEach((k) => (out[k] = round(out[k])));
  return out;
}

/** What one user has actually paid out of pocket (sum of expenses they paid). */
export function paidByUser(expenses: Expense[], userId: string): number {
  return round(
    expenses.filter((e) => e.paidByUserId === userId).reduce((s, e) => s + e.amount, 0),
  );
}

/** One user's fair share across all expenses they're party to. */
export function shareOfUser(expenses: Expense[], userId: string): number {
  let total = 0;
  for (const e of expenses) {
    const members = e.splitBetweenUserIds.length > 0 ? e.splitBetweenUserIds : [e.paidByUserId];
    if (members.includes(userId)) total += e.amount / members.length;
  }
  return round(total);
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AED: 'د.إ',
};

export function formatMoney(amount: number, currency = 'INR'): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? '';
  const abs = Math.abs(Math.round(amount));
  // Indian grouping for INR, western grouping otherwise.
  const grouped =
    currency === 'INR'
      ? abs.toLocaleString('en-IN')
      : abs.toLocaleString('en-US');
  return `${amount < 0 ? '-' : ''}${symbol}${grouped}`;
}
