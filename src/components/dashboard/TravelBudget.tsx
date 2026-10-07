import { useMemo, useState } from 'react';
import { Plus, Trash2, ArrowRight, Wallet, Users2, Check, UserPlus, HeartHandshake } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import type { ExpenseCategory } from '../../services/db';
import {
  computeBalances,
  simplifyDebts,
  totalSpent,
  spentByCategory,
  formatMoney,
} from '../../services/settlement';

// Category presentation — label + monochrome bar shade
const CATEGORY_META: Record<ExpenseCategory, { label: string; bar: string; dot: string }> = {
  stay: { label: 'Stay', bar: 'bg-neutral-900', dot: 'bg-neutral-900' },
  transport: { label: 'Transport', bar: 'bg-neutral-700', dot: 'bg-neutral-700' },
  flight: { label: 'Flights', bar: 'bg-neutral-600', dot: 'bg-neutral-600' },
  food: { label: 'Food & Dining', bar: 'bg-neutral-500', dot: 'bg-neutral-500' },
  activity: { label: 'Activities', bar: 'bg-neutral-400', dot: 'bg-neutral-400' },
  shopping: { label: 'Shopping', bar: 'bg-neutral-300', dot: 'bg-neutral-300' },
};
const CATEGORY_ORDER: ExpenseCategory[] = [
  'stay',
  'transport',
  'flight',
  'food',
  'activity',
  'shopping',
];

const formatStamp = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const TravelBudget = () => {
  const { activeTrip, currentUser, addExpense, removeExpense, upsertCollaborator } = useTrip();

  const [showForm, setShowForm] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  // Form states
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [paidBy, setPaidBy] = useState('');
  const [splitBetween, setSplitBetween] = useState<string[]>([]);
  const [splitMode, setSplitMode] = useState<'equal' | 'custom'>('equal');
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const travelType = activeTrip?.travelType || 'friends';
  const currency = activeTrip?.currency ?? 'INR';
  const expenses = activeTrip?.expenses ?? [];
  const collaborators = activeTrip?.collaborators ?? [];

  const nameFor = (userId: string): string => {
    if (currentUser && userId === currentUser.id) return 'You';
    const found = collaborators.find((c) => c.userId === userId);
    return found?.name ?? 'Someone';
  };

  const spent = useMemo(() => totalSpent(expenses), [expenses]);
  const byCategory = useMemo(() => spentByCategory(expenses), [expenses]);
  const balances = useMemo(() => computeBalances(expenses), [expenses]);
  const settlements = useMemo(() => simplifyDebts(balances), [balances]);

  const target = activeTrip?.budgetTarget ?? 0;
  const remaining = target - spent;
  const pctUsed = target > 0 ? Math.round((spent / target) * 100) : 0;
  const overBudget = target > 0 && remaining < 0;

  const orderedCategories = CATEGORY_ORDER.filter((c) => (byCategory[c] ?? 0) > 0);

  // ── open add-expense form ──
  const openForm = () => {
    const defaultPayer = currentUser?.id ?? collaborators[0]?.userId ?? 'user_you';
    setPaidBy(defaultPayer);
    setSplitBetween(collaborators.map((c) => c.userId));
    setAmount('');
    setNote('');
    setCategory('food');
    setSplitMode('equal');
    setCustomSplits({});
    setShowForm(true);
  };

  const toggleSplit = (userId: string) => {
    setSplitBetween((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const handleCustomSplitChange = (userId: string, val: string) => {
    setCustomSplits((prev) => ({ ...prev, [userId]: val }));
  };

  const canSubmit = Number(amount) > 0 && (!travelType || travelType === 'solo' || (paidBy && splitBetween.length > 0)) && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const parsedCustom: Record<string, number> = {};
      if (splitMode === 'custom') {
        splitBetween.forEach((id) => {
          parsedCustom[id] = Number(customSplits[id]) || 0;
        });
      }

      await addExpense({
        addedByUserId: currentUser?.id ?? paidBy ?? 'user_you',
        paidByUserId: travelType === 'solo' ? (currentUser?.id ?? 'user_you') : paidBy,
        category,
        amount: Number(amount),
        currency,
        splitBetweenUserIds: travelType === 'solo' ? [currentUser?.id ?? 'user_you'] : splitBetween,
        customSplit: splitMode === 'custom' ? parsedCustom : undefined,
        note: note.trim() || undefined,
      });
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  // ── add companion/member ──
  const handleAddMember = async () => {
    if (!newMemberName.trim()) return;
    const newId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await upsertCollaborator({
      userId: newId,
      name: newMemberName.trim(),
      role: 'editor',
      status: 'active',
      invitedAt: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
    });
    setNewMemberName('');
    setShowAddMember(false);
  };

  if (!activeTrip) {
    return (
      <section
        id="budget"
        className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-20 border-t border-[#E7E5E2]"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block mb-2">
              02 / EXPENSE TRACKER
            </span>
            <h2 className="font-instrument text-4xl sm:text-5xl md:text-6xl text-[#000000] tracking-headline leading-none">
              Trip Budget & Expenses
            </h2>
            <p className="font-inter text-sm sm:text-base text-[#6F6F6F] mt-4 max-w-lg">
              Keep track of spending, split costs, and maintain financial clarity.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-dashed border-[#E7E5E2] bg-[#FAF8F5]/50 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white border border-[#E7E5E2] flex items-center justify-center mb-4 text-[#6F6F6F]">
            <Wallet className="w-5 h-5" />
          </div>
          <h3 className="font-instrument text-2xl text-[#000000] mb-2">No active budget yet</h3>
          <p className="font-inter text-sm text-[#6F6F6F] max-w-md">
            Plan a journey to start tracking expenses and splitting costs with your travel companions.
          </p>
        </div>
      </section>
    );
  }

  // Header dynamic labels based on travelType
  const badgeText =
    travelType === 'family'
      ? '02 / FAMILY EXPENSES · FAMILY'
      : travelType === 'solo'
      ? '02 / PERSONAL BUDGET · SOLO'
      : '02 / WHO PAID, WHO OWES · FRIENDS';

  const headingText =
    travelType === 'family'
      ? 'Family budget & contributions.'
      : travelType === 'solo'
      ? 'Your journey expenses.'
      : 'Who paid, who owes.';

  const subtitleText =
    travelType === 'family'
      ? 'Plan family expenses and keep track of who paid and shared costs.'
      : travelType === 'solo'
      ? 'Track your personal travel spending, category breakdowns, and stay on budget.'
      : 'Every expense split across the group, settled with the fewest possible transfers.';

  return (
    <section
      id="budget"
      className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-20 border-t border-[#E7E5E2]"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block mb-2">
            {badgeText}
          </span>
          <h2 className="font-instrument text-4xl sm:text-5xl md:text-6xl text-[#000000] tracking-headline leading-none">
            {headingText}
          </h2>
          <p className="font-inter text-sm sm:text-base text-[#6F6F6F] mt-4 max-w-lg">
            {subtitleText}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-auto flex-wrap">
          {travelType !== 'solo' && (
            <button
              type="button"
              onClick={() => setShowAddMember(!showAddMember)}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-medium border border-[#E7E5E2] bg-white hover:bg-neutral-50 text-black transition-all cursor-pointer shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{travelType === 'family' ? '+ Add family member' : '+ Add friend'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={showForm ? () => setShowForm(false) : openForm}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium bg-[#000000] hover:bg-neutral-800 text-white transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Plus className={`w-3.5 h-3.5 transition-transform ${showForm ? 'rotate-45' : ''}`} />
            <span>{showForm ? 'Close' : 'Add expense'}</span>
          </button>
        </div>
      </div>

      {/* Add Member inline drawer */}
      {showAddMember && travelType !== 'solo' && (
        <div className="mb-8 p-5 rounded-2xl bg-[#FAF8F5] border border-[#E7E5E2] flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-rise">
          <div className="flex items-center gap-3">
            <span className="text-xl">{travelType === 'family' ? '👨‍👩‍👧‍👦' : '👥'}</span>
            <div>
              <h4 className="text-sm font-medium text-black">
                {travelType === 'family' ? 'Add Family Member' : 'Add Travel Friend'}
              </h4>
              <p className="text-xs text-[#6F6F6F]">
                {travelType === 'family'
                  ? 'Enter name (e.g. Father, Mother, Priya, etc.)'
                  : 'Enter friend name (e.g. Rahul, Shyam, Amit, etc.)'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Member name..."
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleAddMember();
              }}
              className="px-4 py-2 rounded-xl border border-[#E7E5E2] bg-white text-sm text-black focus:outline-none focus:border-black flex-1 sm:w-56"
            />
            <button
              type="button"
              onClick={handleAddMember}
              className="px-4 py-2 bg-black text-white text-xs font-medium rounded-xl hover:bg-neutral-800 cursor-pointer"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddMember(false)}
              className="px-3 py-2 text-xs text-[#6F6F6F] hover:text-black cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add-expense form */}
      {showForm && (
        <div className="mb-10 bg-white border-2 border-black rounded-3xl p-6 sm:p-8 shadow-xl animate-fade-rise">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#6F6F6F]">
                {travelType === 'family'
                  ? 'FAMILY EXPENDITURE'
                  : travelType === 'solo'
                  ? 'PERSONAL EXPENDITURE'
                  : 'GROUP EXPENDITURE'}
              </span>
              <h3 className="font-instrument text-2xl sm:text-3xl text-black">
                {travelType === 'solo' ? 'Record Expense' : 'Record Shared Expense'}
              </h3>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="p-2 rounded-full text-[#6F6F6F] hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer text-sm font-mono"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <label className="text-[11px] font-mono text-[#6F6F6F] uppercase sm:col-span-1">
              Amount ({currency})
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="mt-2 w-full rounded-xl border border-[#E7E5E2] bg-[#FAF8F5] px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black font-mono"
              />
            </label>

            <label className="text-[11px] font-mono text-[#6F6F6F] uppercase">
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="mt-2 w-full rounded-xl border border-[#E7E5E2] bg-[#FAF8F5] px-3 py-2.5 text-sm text-black focus:outline-none focus:border-black cursor-pointer"
              >
                {CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_META[c].label}
                  </option>
                ))}
              </select>
            </label>

            {travelType !== 'solo' && (
              <label className="text-[11px] font-mono text-[#6F6F6F] uppercase">
                Paid by
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#E7E5E2] bg-[#FAF8F5] px-3 py-2.5 text-sm text-black focus:outline-none focus:border-black cursor-pointer"
                >
                  {collaborators.map((c) => (
                    <option key={c.userId} value={c.userId}>
                      {nameFor(c.userId)}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className={`text-[11px] font-mono text-[#6F6F6F] uppercase ${travelType === 'solo' ? 'sm:col-span-2' : ''}`}>
              Note
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Hotel stay, cafe, tickets"
                className="mt-2 w-full rounded-xl border border-[#E7E5E2] bg-[#FAF8F5] px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black"
              />
            </label>
          </div>

          {/* Split between (Friends / Family) */}
          {travelType !== 'solo' && (
            <div className="mt-6 pt-4 border-t border-neutral-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono text-[#6F6F6F] uppercase">
                  {travelType === 'family' ? 'Shared by / Benefited (' : 'Split between ('}
                  {splitBetween.length})
                </span>

                <div className="flex items-center gap-2 text-xs font-inter">
                  <button
                    type="button"
                    onClick={() => setSplitMode('equal')}
                    className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                      splitMode === 'equal'
                        ? 'bg-black text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    Equal Split
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitMode('custom')}
                    className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                      splitMode === 'custom'
                        ? 'bg-black text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    Custom Amounts
                  </button>
                </div>
              </div>

              {splitMode === 'equal' ? (
                <div className="flex flex-wrap gap-2.5">
                  {collaborators.map((c) => {
                    const on = splitBetween.includes(c.userId);
                    return (
                      <button
                        key={c.userId}
                        type="button"
                        onClick={() => toggleSplit(c.userId)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium border transition-all cursor-pointer ${
                          on
                            ? 'bg-[#000000] text-white border-black shadow-xs'
                            : 'bg-[#FAF8F5] text-[#6F6F6F] border-[#E7E5E2] hover:border-neutral-400'
                        }`}
                      >
                        {on && <Check className="w-3.5 h-3.5" />}
                        {nameFor(c.userId)}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {collaborators.map((c) => {
                    const on = splitBetween.includes(c.userId);
                    return (
                      <div
                        key={c.userId}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                          on ? 'border-black bg-neutral-50' : 'border-[#E7E5E2] bg-white opacity-60'
                        }`}
                      >
                        <label className="flex items-center gap-2 text-xs font-medium text-black cursor-pointer">
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => toggleSplit(c.userId)}
                            className="rounded text-black"
                          />
                          {nameFor(c.userId)}
                        </label>
                        {on && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-mono text-[#6F6F6F]">₹</span>
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={customSplits[c.userId] || ''}
                              onChange={(e) => handleCustomSplitChange(c.userId, e.target.value)}
                              className="w-20 px-2 py-1 bg-white border border-[#E7E5E2] rounded text-xs font-mono text-black"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-4">
              <button
                type="button"
                disabled={!canSubmit}
                onClick={submit}
                className="rounded-full px-8 py-3 bg-[#000000] text-white text-xs font-mono hover:bg-neutral-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
              >
                {submitting ? 'Saving…' : '✓ Save Expense'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-xs font-mono text-[#6F6F6F] hover:text-black cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {travelType !== 'solo' && Number(amount) > 0 && splitBetween.length > 0 && splitMode === 'equal' && (
              <span className="font-mono text-xs text-[#000000] bg-neutral-100 px-3 py-1.5 rounded-full">
                {formatMoney(Number(amount) / splitBetween.length, currency)} / person
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="bg-white border border-[#E7E5E2] rounded-3xl p-8 sm:p-10 shadow-sm">
        {/* Summary metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-8 border-b border-[#E7E5E2]">
          <div>
            <span className="block text-xs font-mono text-[#6F6F6F] uppercase tracking-wider">
              {travelType === 'solo' ? 'BUDGET CEILING' : 'GROUP CEILING'}
            </span>
            <span className="font-instrument text-4xl sm:text-5xl text-[#000000] tracking-tight mt-1 block">
              {target > 0 ? formatMoney(target, currency) : '—'}
            </span>
            <span className="text-xs text-[#6F6F6F] font-inter">
              {target > 0 ? 'Allocated trip budget' : 'No budget set'}
            </span>
          </div>
          <div>
            <span className="block text-xs font-mono text-[#6F6F6F] uppercase tracking-wider">
              TOTAL SPENT
            </span>
            <span className="font-instrument text-4xl sm:text-5xl text-[#000000] tracking-tight mt-1 block">
              {formatMoney(spent, currency)}
            </span>
            <span className="text-xs text-neutral-500 font-inter">
              {target > 0 ? `${pctUsed}% of target` : `${expenses.length} expenses recorded`}
            </span>
          </div>
          <div>
            <span className="block text-xs font-mono text-[#6F6F6F] uppercase tracking-wider">
              {overBudget ? 'OVER BUDGET' : 'REMAINING'}
            </span>
            <span
              className={`font-instrument text-4xl sm:text-5xl tracking-tight mt-1 block ${
                overBudget ? 'text-red-700' : 'text-emerald-800'
              }`}
            >
              {target > 0 ? formatMoney(Math.abs(remaining), currency) : '—'}
            </span>
            <span
              className={`text-xs font-inter ${overBudget ? 'text-red-600' : 'text-emerald-700'}`}
            >
              {target > 0
                ? overBudget
                  ? 'Trim to stay on track'
                  : 'Within your budget target'
                : 'Set a target in planner'}
            </span>
          </div>
        </div>

        {/* Allocation bar */}
        {spent > 0 && (
          <div className="py-8 border-b border-[#E7E5E2]">
            <div className="flex items-center justify-between text-xs font-mono text-[#6F6F6F] mb-3">
              <span>CATEGORY BREAKDOWN</span>
              <span>{formatMoney(spent, currency)} TOTAL</span>
            </div>
            <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden flex p-0.5 gap-1 border border-[#E7E5E2]">
              {orderedCategories.map((c) => (
                <div
                  key={c}
                  style={{ width: `${((byCategory[c] ?? 0) / spent) * 100}%` }}
                  className={`h-full rounded-sm ${CATEGORY_META[c].bar}`}
                  title={`${CATEGORY_META[c].label}: ${formatMoney(byCategory[c] ?? 0, currency)}`}
                />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {orderedCategories.map((c) => (
                <div key={c} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${CATEGORY_META[c].dot}`} />
                  <span className="font-inter text-xs text-[#000000]">
                    {CATEGORY_META[c].label}
                  </span>
                  <span className="font-mono text-xs text-[#6F6F6F]">
                    {formatMoney(byCategory[c] ?? 0, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settlement section for FRIENDS */}
        {travelType === 'friends' && (
          <div className="py-8 border-b border-[#E7E5E2]">
            <div className="flex items-center gap-2 text-xs font-mono text-[#6F6F6F] uppercase tracking-wider mb-5">
              <Users2 className="w-4 h-4" />
              <span>WHO OWES WHOM (MINIMUM TRANSFERS)</span>
            </div>

            {settlements.length === 0 ? (
              <p className="font-inter text-sm text-[#6F6F6F]">
                {expenses.length === 0
                  ? 'No expenses yet — add one to see who owes whom.'
                  : 'All square. Nobody owes anybody.'}
              </p>
            ) : (
              <div className="space-y-3">
                {settlements.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 px-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E5E2]"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-inter text-sm font-medium text-[#000000]">
                        {nameFor(s.fromUserId)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#6F6F6F]" />
                      <span className="font-inter text-sm font-medium text-[#000000]">
                        {nameFor(s.toUserId)}
                      </span>
                    </div>
                    <span
                      className="font-mono text-sm font-semibold px-3 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(245,152,242,0.16)', color: '#000' }}
                    >
                      {formatMoney(s.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Per-friend net balances */}
            {Object.keys(balances).length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {collaborators.map((c) => {
                  const net = balances[c.userId] ?? 0;
                  if (net === 0) return null;
                  const positive = net > 0;
                  return (
                    <span
                      key={c.userId}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono border ${
                        positive
                          ? 'text-emerald-800 border-emerald-200 bg-emerald-50'
                          : 'text-red-700 border-red-200 bg-red-50'
                      }`}
                    >
                      {nameFor(c.userId)}
                      {positive
                        ? ` receives ${formatMoney(net, currency)}`
                        : ` owes ${formatMoney(-net, currency)}`}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Contributions section for FAMILY */}
        {travelType === 'family' && (
          <div className="py-8 border-b border-[#E7E5E2]">
            <div className="flex items-center gap-2 text-xs font-mono text-[#6F6F6F] uppercase tracking-wider mb-5">
              <HeartHandshake className="w-4 h-4" />
              <span>FAMILY CONTRIBUTIONS & BALANCES</span>
            </div>

            {collaborators.length === 0 || expenses.length === 0 ? (
              <p className="font-inter text-sm text-[#6F6F6F]">
                No family expenses recorded yet. Add an expense above to track each family member's contributions.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {collaborators.map((c) => {
                  const paid = expenses
                    .filter((e) => e.paidByUserId === c.userId)
                    .reduce((sum, e) => sum + e.amount, 0);
                  const net = balances[c.userId] ?? 0;

                  return (
                    <div
                      key={c.userId}
                      className="p-4 rounded-2xl border border-[#E7E5E2] bg-[#FAF8F5] flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-sm text-black">{nameFor(c.userId)}</span>
                        <span className="text-xs text-mutedGray font-mono">Member</span>
                      </div>
                      <div className="space-y-1 text-xs font-inter">
                        <div className="flex items-center justify-between text-mutedGray">
                          <span>Total Paid:</span>
                          <span className="font-mono font-medium text-black">
                            {formatMoney(paid, currency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-mutedGray">
                          <span>Net Balance:</span>
                          <span
                            className={`font-mono font-medium ${
                              net > 0 ? 'text-emerald-700' : net < 0 ? 'text-red-600' : 'text-neutral-600'
                            }`}
                          >
                            {net > 0
                              ? `+${formatMoney(net, currency)}`
                              : net < 0
                              ? `-${formatMoney(-net, currency)}`
                              : 'Settled'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Expense ledger (Friends, Family, Solo) */}
        <div className="pt-8">
          <div className="flex items-center gap-2 text-xs font-mono text-[#6F6F6F] uppercase tracking-wider mb-4">
            <Wallet className="w-4 h-4" />
            <span>LEDGER · {expenses.length}</span>
          </div>

          {expenses.length === 0 ? (
            <p className="font-inter text-sm text-[#6F6F6F]">No expenses recorded yet.</p>
          ) : (
            <div className="space-y-1">
              {expenses.map((e) => (
                <div
                  key={e.id}
                  className="group flex items-center justify-between py-3 border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${CATEGORY_META[e.category].dot}`} />
                    <div className="min-w-0">
                      <span className="font-inter text-sm font-medium text-[#000000] block truncate">
                        {e.note || CATEGORY_META[e.category].label}
                      </span>
                      <span className="text-xs text-[#6F6F6F]">
                        {travelType === 'solo'
                          ? e.date || 'Personal expense'
                          : `${nameFor(e.paidByUserId)} paid · ${
                              e.splitBetweenUserIds.length <= 1
                                ? 'for themselves'
                                : `shared among ${e.splitBetweenUserIds.length} members`
                            }`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-sm font-medium text-[#000000]">
                      {formatMoney(e.amount, currency)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExpense(e.id)}
                      aria-label="Delete expense"
                      className="opacity-0 group-hover:opacity-100 text-[#6F6F6F] hover:text-red-600 transition-all p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer stats */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#6F6F6F]">
          {travelType !== 'solo' && (
            <span>
              PER PERSON AVERAGE:{' '}
              {formatMoney(spent / Math.max(1, collaborators.length), currency)}
            </span>
          )}
          {activeTrip.updatedAt && <span>LAST UPDATED {formatStamp(activeTrip.updatedAt)}</span>}
        </div>
      </div>
    </section>
  );
};
