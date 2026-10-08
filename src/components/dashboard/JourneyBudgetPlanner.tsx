import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Wallet, Users, Calendar, AlertTriangle, CheckCircle, PieChart } from 'lucide-react';
import { StoredJourney, JourneyExpense, ExpenseCategory, travelStorage } from '../../services/travelStorage';

interface JourneyBudgetPlannerProps {
  journey: StoredJourney;
  onUpdateJourney?: (updated: StoredJourney) => void;
  userRole?: 'owner' | 'editor' | 'viewer';
}

const CATEGORY_META: Record<ExpenseCategory, { label: string; color: string; bg: string }> = {
  transport: { label: 'Transport & Flights', color: 'bg-blue-600', bg: 'bg-blue-50 text-blue-700' },
  accommodation: { label: 'Accommodation', color: 'bg-purple-600', bg: 'bg-purple-50 text-purple-700' },
  food: { label: 'Food & Dining', color: 'bg-amber-500', bg: 'bg-amber-50 text-amber-700' },
  activities: { label: 'Activities & Tours', color: 'bg-emerald-600', bg: 'bg-emerald-50 text-emerald-700' },
  shopping: { label: 'Shopping & Gifts', color: 'bg-pink-500', bg: 'bg-pink-50 text-pink-700' },
  rentals: { label: 'Bike / Cab Rentals', color: 'bg-indigo-500', bg: 'bg-indigo-50 text-indigo-700' },
  emergency: { label: 'Emergency Fund', color: 'bg-rose-600', bg: 'bg-rose-50 text-rose-700' },
  other: { label: 'Other Expenses', color: 'bg-neutral-600', bg: 'bg-neutral-100 text-neutral-700' },
};

export const JourneyBudgetPlanner: React.FC<JourneyBudgetPlannerProps> = ({
  journey,
  onUpdateJourney,
  userRole = 'owner',
}) => {
  const isReadOnly = userRole === 'viewer';

  // Budget settings state
  const currency = journey.budgetPlanner?.currency || '₹';
  const totalBudget = journey.budgetPlanner?.totalBudget ?? (typeof journey.budget === 'number' ? journey.budget : 50000);
  const travelersCount = journey.budgetPlanner?.travelersCount ?? (journey.travelers || 2);

  const [editTotalBudget, setEditTotalBudget] = useState(totalBudget);
  const [editCurrency, setEditCurrency] = useState(currency);
  const [editTravelers, setEditTravelers] = useState(travelersCount);
  const [isEditingSettings, setIsEditingSettings] = useState(false);

  // New expense form state
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('food');
  const [expensePaidBy, setExpensePaidBy] = useState('You');
  const [expenseNotes, setExpenseNotes] = useState('');

  // Calculate days
  const daysCount = useMemo(() => {
    if (journey.itinerary && journey.itinerary.length > 0) return journey.itinerary.length;
    if (journey.startDate && journey.endDate) {
      const diff = new Date(journey.endDate).getTime() - new Date(journey.startDate).getTime();
      return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    return 5;
  }, [journey]);

  const expenses = journey.budgetPlanner?.expenses || journey.expenses || [];

  // Aggregated calculations
  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  }, [expenses]);

  const remainingBudget = editTotalBudget - totalSpent;
  const percentSpent = editTotalBudget > 0 ? Math.min(100, Math.round((totalSpent / editTotalBudget) * 100)) : 0;
  const costPerPerson = travelersCount > 0 ? Math.round(totalSpent / travelersCount) : totalSpent;
  const costPerDay = daysCount > 0 ? Math.round(totalSpent / daysCount) : totalSpent;

  // Category-wise totals
  const categoryTotals = useMemo(() => {
    const map: Record<ExpenseCategory, number> = {
      transport: 0,
      accommodation: 0,
      food: 0,
      activities: 0,
      shopping: 0,
      rentals: 0,
      emergency: 0,
      other: 0,
    };
    expenses.forEach((exp) => {
      const cat = (exp.category || 'other') as ExpenseCategory;
      if (map[cat] !== undefined) {
        map[cat] = (map[cat] || 0) + exp.amount;
      } else {
        map.other = (map.other || 0) + exp.amount;
      }
    });
    return map;
  }, [expenses]);

  // Save budget settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StoredJourney = {
      ...journey,
      budget: editTotalBudget,
      travelers: editTravelers,
      budgetPlanner: {
        totalBudget: editTotalBudget,
        currency: editCurrency,
        travelersCount: editTravelers,
        categories: journey.budgetPlanner?.categories || {
          transport: Math.round(editTotalBudget * 0.25),
          accommodation: Math.round(editTotalBudget * 0.35),
          food: Math.round(editTotalBudget * 0.18),
          activities: Math.round(editTotalBudget * 0.12),
          shopping: Math.round(editTotalBudget * 0.05),
          rentals: 0,
          emergency: Math.round(editTotalBudget * 0.05),
          other: 0,
        },
        expenses: expenses,
      },
    };
    travelStorage.saveJourney(updated);
    if (onUpdateJourney) onUpdateJourney(updated);
    setIsEditingSettings(false);
  };

  // Add new expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(expenseAmount);
    if (!expenseTitle.trim() || isNaN(num) || num <= 0) return;

    const newExp: JourneyExpense = {
      id: crypto.randomUUID ? crypto.randomUUID() : `exp_${Date.now()}`,
      title: expenseTitle.trim(),
      amount: num,
      category: expenseCategory,
      date: new Date().toISOString().split('T')[0],
      paidBy: expensePaidBy,
      notes: expenseNotes.trim(),
    };

    const updatedExpenses = [newExp, ...expenses];
    const updated: StoredJourney = {
      ...journey,
      expenses: updatedExpenses,
      budgetPlanner: {
        ...(journey.budgetPlanner || {
          totalBudget: editTotalBudget,
          currency: editCurrency,
          travelersCount: editTravelers,
          categories: {} as any,
        }),
        totalBudget: editTotalBudget,
        currency: editCurrency,
        travelersCount: editTravelers,
        expenses: updatedExpenses,
      },
    };

    travelStorage.saveJourney(updated);
    if (onUpdateJourney) onUpdateJourney(updated);

    // Check budget alert notification
    if (totalSpent + num >= editTotalBudget * 0.85) {
      travelStorage.addNotification({
        id: `notif_budget_${Date.now()}`,
        journeyId: journey.id,
        title: 'Budget Threshold Notice',
        message: `Your journey "${journey.destination}" has reached ${Math.round(((totalSpent + num) / editTotalBudget) * 100)}% of the allocated budget.`,
        type: 'budget',
        createdAt: new Date().toISOString(),
        read: false,
      });
    }

    setExpenseTitle('');
    setExpenseAmount('');
    setExpenseNotes('');
    setIsAddingExpense(false);
  };

  // Delete expense
  const handleDeleteExpense = (id: string) => {
    const updatedExpenses = expenses.filter((e) => e.id !== id);
    const updated: StoredJourney = {
      ...journey,
      expenses: updatedExpenses,
      budgetPlanner: {
        ...(journey.budgetPlanner || {
          totalBudget: editTotalBudget,
          currency: editCurrency,
          travelersCount: editTravelers,
          categories: {} as any,
        }),
        totalBudget: editTotalBudget,
        currency: editCurrency,
        travelersCount: editTravelers,
        expenses: updatedExpenses,
      },
    };
    travelStorage.saveJourney(updated);
    if (onUpdateJourney) onUpdateJourney(updated);
  };

  return (
    <div className="space-y-8 animate-fade-rise">
      {/* 1. Header Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget */}
        <div className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl p-6 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">
              Total Budget
            </span>
            <Wallet className="w-4 h-4 text-neutral-600" />
          </div>
          <span className="font-instrument text-3xl sm:text-4xl text-black block">
            {currency}{editTotalBudget.toLocaleString()}
          </span>
          {!isReadOnly && (
            <button
              type="button"
              onClick={() => setIsEditingSettings(true)}
              className="mt-2 text-[11px] font-mono text-neutral-500 hover:text-black underline underline-offset-2 cursor-pointer"
            >
              Adjust Settings
            </button>
          )}
        </div>

        {/* Spent / Remaining */}
        <div className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">
              Remaining Funds
            </span>
            {remainingBudget < 0 ? (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <span
            className={`font-instrument text-3xl sm:text-4xl block ${
              remainingBudget < 0 ? 'text-rose-600' : 'text-black'
            }`}
          >
            {currency}{remainingBudget.toLocaleString()}
          </span>
          <span className="text-[11px] font-mono text-neutral-500 mt-2 block">
            {percentSpent}% Spent ({currency}{totalSpent.toLocaleString()})
          </span>
        </div>

        {/* Cost Per Person */}
        <div className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">
              Cost Per Person
            </span>
            <Users className="w-4 h-4 text-neutral-600" />
          </div>
          <span className="font-instrument text-3xl sm:text-4xl text-black block">
            {currency}{costPerPerson.toLocaleString()}
          </span>
          <span className="text-[11px] font-mono text-neutral-500 mt-2 block">
            Across {travelersCount} Traveler{travelersCount > 1 ? 's' : ''}
          </span>
        </div>

        {/* Cost Per Day */}
        <div className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">
              Daily Burn Rate
            </span>
            <Calendar className="w-4 h-4 text-neutral-600" />
          </div>
          <span className="font-instrument text-3xl sm:text-4xl text-black block">
            {currency}{costPerDay.toLocaleString()}
          </span>
          <span className="text-[11px] font-mono text-neutral-500 mt-2 block">
            {daysCount} Trip Days
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border border-[#E7E5E2] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-2 font-mono text-xs">
          <span>Budget Utilization</span>
          <span className="font-bold">{percentSpent}%</span>
        </div>
        <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden flex">
          {Object.entries(categoryTotals).map(([cat, amt]) => {
            if (amt <= 0 || editTotalBudget <= 0) return null;
            const w = Math.max(1, (amt / editTotalBudget) * 100);
            const meta = CATEGORY_META[cat as ExpenseCategory];
            return (
              <div
                key={cat}
                style={{ width: `${w}%` }}
                className={`${meta.color} transition-all`}
                title={`${meta.label}: ${currency}${amt.toLocaleString()}`}
              />
            );
          })}
        </div>
      </div>

      {/* 2. Visual Category Breakdown */}
      <div className="bg-white border border-[#E7E5E2] rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-instrument text-2xl text-black">Category Spending Breakdown</h3>
            <span className="text-xs font-mono text-neutral-500">Track expenditures across major trip pillars</span>
          </div>
          <PieChart className="w-5 h-5 text-neutral-400" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(CATEGORY_META).map(([cat, meta]) => {
            const amt = categoryTotals[cat as ExpenseCategory] || 0;
            const catPercent = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;

            return (
              <div key={cat} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E5E2]/80">
                <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded mb-2 ${meta.bg}`}>
                  {meta.label}
                </span>
                <span className="font-instrument text-2xl text-black block">
                  {currency}{amt.toLocaleString()}
                </span>
                <span className="text-[10px] font-mono text-neutral-400 block mt-1">
                  {catPercent}% of spent
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Expense Ledger */}
      <div className="bg-white border border-[#E7E5E2] rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-100 gap-4">
          <div>
            <h3 className="font-instrument text-2xl text-black">Expense Ledger</h3>
            <span className="text-xs font-mono text-neutral-500">
              {expenses.length} Logged Transactions
            </span>
          </div>

          {!isReadOnly && (
            <button
              type="button"
              onClick={() => setIsAddingExpense(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Expense</span>
            </button>
          )}
        </div>

        {/* Add Expense Form */}
        {isAddingExpense && (
          <form onSubmit={handleAddExpense} className="p-6 bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl my-6 space-y-4">
            <h4 className="font-instrument text-xl text-black">Log New Expenditure</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                  Description / Vendor
                </label>
                <input
                  type="text"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  placeholder="e.g. Heritage Walk Tickets"
                  required
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-black font-inter focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                  Amount ({currency})
                </label>
                <input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  required
                  min="1"
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-black font-mono focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                  Category
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as any)}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-black font-inter focus:outline-none focus:border-black"
                >
                  {Object.entries(CATEGORY_META).map(([cat, meta]) => (
                    <option key={cat} value={cat}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={expensePaidBy}
                onChange={(e) => setExpensePaidBy(e.target.value)}
                placeholder="Paid by (e.g. You / Friend name)"
                className="bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-black font-inter focus:outline-none focus:border-black"
              />
              <input
                type="text"
                value={expenseNotes}
                onChange={(e) => setExpenseNotes(e.target.value)}
                placeholder="Optional notes or receipt reference"
                className="bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-black font-inter focus:outline-none focus:border-black"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingExpense(false)}
                className="px-4 py-2 rounded-full border border-neutral-300 text-xs font-mono text-black hover:border-black cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all cursor-pointer shadow-xs"
              >
                Save Expense
              </button>
            </div>
          </form>
        )}

        {/* Expense List */}
        <div className="mt-6 divide-y divide-neutral-100">
          {expenses.length === 0 && (
            <div className="text-center py-10 text-neutral-400 font-inter text-xs">
              No expenses recorded yet. Click "Log Expense" to track your trip spending.
            </div>
          )}

          {expenses.map((exp) => {
            const meta = CATEGORY_META[exp.category as ExpenseCategory] || CATEGORY_META.other;

            return (
              <div key={exp.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${meta.color} shrink-0`} />
                  <div>
                    <span className="font-semibold text-xs text-black block">{exp.title}</span>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
                      <span>{meta.label}</span>
                      <span>·</span>
                      <span>Paid by {exp.paidBy || 'You'}</span>
                      {exp.date && (
                        <>
                          <span>·</span>
                          <span>{exp.date}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-instrument text-xl text-black">
                    {currency}{exp.amount.toLocaleString()}
                  </span>

                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="text-neutral-400 hover:text-rose-600 p-1.5 transition-colors cursor-pointer"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Adjust Budget Settings Modal */}
      {isEditingSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-rise">
          <div className="bg-white border border-[#E7E5E2] rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <h3 className="font-instrument text-3xl text-black">Trip Budget Settings</h3>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="text-xs font-mono uppercase text-neutral-500 block mb-1">
                  Total Allocated Budget
                </label>
                <input
                  type="number"
                  value={editTotalBudget}
                  onChange={(e) => setEditTotalBudget(Number(e.target.value) || 0)}
                  required
                  className="w-full bg-[#FAF8F5] border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-black font-mono focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-neutral-500 block mb-1">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={editCurrency}
                    onChange={(e) => setEditCurrency(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-black font-mono focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-neutral-500 block mb-1">
                    Travelers Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editTravelers}
                    onChange={(e) => setEditTravelers(Number(e.target.value) || 1)}
                    className="w-full bg-[#FAF8F5] border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-black font-mono focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsEditingSettings(false)}
                  className="px-5 py-2.5 rounded-full border border-neutral-300 text-xs font-mono text-black hover:border-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all cursor-pointer shadow-xs"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
