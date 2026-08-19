import { useState, useEffect } from 'react';
import { Target, Plus, Calendar, Trash2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoals, useCreateGoal, useIncrementGoalProgress, useDeleteGoal } from '@/hooks/useGoals';
import { DEFAULT_GOAL_CATEGORIES } from '@/types/goal';
import { useNotificationStore } from '@/store/notification.store';

const CATEGORIES_STORAGE_KEY = 'mindsprint_goal_categories';

function getStoredCategories(): string[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [...DEFAULT_GOAL_CATEGORIES];
}

function saveStoredCategories(categories: string[]) {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch {}
}

export function GoalsPage() {
  const { data: goals = [], isLoading } = useGoals();
  const createGoal = useCreateGoal();
  const incrementProgress = useIncrementGoalProgress();
  const deleteGoal = useDeleteGoal();
  const notify = useNotificationStore((s) => s.notify);

  const [categories, setCategories] = useState<string[]>(getStoredCategories);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Adding new category state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // New goal form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<string>(categories[0] || 'Exam Prep');
  const [customModalCategory, setCustomModalCategory] = useState('');
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);
  const [newTargetDate, setNewTargetDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  );
  const [newTargetUnits, setNewTargetUnits] = useState('20');
  const [newUnitName, setNewUnitName] = useState('Hours');

  // Sync any unique categories from server goals into local categories list
  useEffect(() => {
    if (goals.length > 0) {
      setCategories((prev) => {
        const set = new Set([...prev]);
        goals.forEach((g) => {
          if (g.category) set.add(g.category);
        });
        const combined = Array.from(set);
        saveStoredCategories(combined);
        return combined;
      });
    }
  }, [goals]);

  // Handle adding a new category
  const handleAddCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setIsAddingCategory(false);
      return;
    }
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      notify({ title: 'Category already exists', tone: 'warning' });
      setNewCategoryName('');
      setIsAddingCategory(false);
      return;
    }
    const updated = [...categories, trimmed];
    setCategories(updated);
    saveStoredCategories(updated);
    setFilterCategory(trimmed);
    setNewCategoryName('');
    setIsAddingCategory(false);
    notify({ title: `Category "${trimmed}" added`, tone: 'success' });
  };

  // Handle deleting a category
  const handleDeleteCategory = (catToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = categories.filter((c) => c !== catToDelete);
    setCategories(updated);
    saveStoredCategories(updated);
    if (filterCategory === catToDelete) {
      setFilterCategory('All');
    }
    notify({ title: `Category "${catToDelete}" removed`, tone: 'info' });
  };

  const filteredGoals = goals.filter((g) =>
    filterCategory === 'All' || g.category === filterCategory,
  );

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const finalCategory = isCustomCategoryMode
      ? customModalCategory.trim() || 'General'
      : newCategory;

    // If new custom category, add to list
    if (isCustomCategoryMode && customModalCategory.trim()) {
      if (!categories.includes(customModalCategory.trim())) {
        const updated = [...categories, customModalCategory.trim()];
        setCategories(updated);
        saveStoredCategories(updated);
      }
    }

    createGoal.mutate(
      {
        title: newTitle.trim(),
        category: finalCategory,
        targetDate: newTargetDate,
        totalUnits: parseInt(newTargetUnits, 10) || 10,
        unitName: newUnitName.trim() || 'Units',
      },
      {
        onSuccess: () => {
          setNewTitle('');
          setNewTargetUnits('20');
          setNewUnitName('Hours');
          setIsCustomCategoryMode(false);
          setCustomModalCategory('');
          setIsModalOpen(false);
        },
      },
    );
  };

  return (
    <div className="space-y-8 pb-8 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
            Productivity Goals & Milestones
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Set ambitious targets, track milestone progress, and achieve academic success
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (categories.length > 0) {
              setNewCategory(categories[0]);
            }
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create New Goal
        </button>
      </div>

      {/* Dynamic Categories Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {/* All Pill */}
        <button
          type="button"
          onClick={() => setFilterCategory('All')}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            filterCategory === 'All'
              ? 'bg-[var(--color-primary)] text-white shadow-sm'
              : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] border border-[var(--color-border)]'
          }`}
        >
          All
        </button>

        {/* Dynamic Category Pills */}
        {categories.map((cat) => (
          <div
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`group inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
              filterCategory === cat
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] border-[var(--color-border)]'
            }`}
          >
            <span>{cat}</span>
            <button
              type="button"
              onClick={(e) => handleDeleteCategory(cat, e)}
              className={`h-3.5 w-3.5 rounded-full flex items-center justify-center transition-colors ${
                filterCategory === cat
                  ? 'hover:bg-white/20 text-white'
                  : 'hover:bg-rose-100 hover:text-rose-600 text-[var(--color-text-tertiary)]'
              }`}
              title={`Delete "${cat}" category`}
            >
              <X className="h-2.5 w-2.5 stroke-[3]" />
            </button>
          </div>
        ))}

        {/* Add New Category Pill / Form */}
        {isAddingCategory ? (
          <form onSubmit={handleAddCategory} className="inline-flex items-center gap-1">
            <input
              type="text"
              autoFocus
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name..."
              className="h-7 w-32 rounded-full border border-[var(--color-primary)] bg-[var(--color-surface)] px-3 text-xs text-[var(--color-text-primary)] focus:outline-none"
            />
            <button
              type="submit"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
              title="Add Category"
            >
              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => {
                setNewCategoryName('');
                setIsAddingCategory(false);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]"
              title="Cancel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingCategory(true)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-[var(--color-border-strong)] bg-transparent px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
        </div>
      )}

      {/* Goals Grid */}
      {!isLoading && filteredGoals.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center shadow-sm">
          <Target className="mx-auto h-8 w-8 text-[var(--color-text-tertiary)]" />
          <h3 className="mt-3 text-sm font-semibold text-[var(--color-text-primary)]">
            {filterCategory === 'All'
              ? 'No work goals set'
              : `No goals in "${filterCategory}"`}
          </h3>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            Create your first milestone to track your work progress.
          </p>
          <button
            onClick={() => {
              if (filterCategory !== 'All') {
                setNewCategory(filterCategory);
              }
              setIsModalOpen(true);
            }}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create First Goal
          </button>
        </div>
      ) : (
        !isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGoals.map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[var(--color-surface-secondary)] px-3 py-1 text-[11px] font-bold text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                      {goal.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Due {goal.targetDate}</span>
                    </div>
                  </div>

                  <h2 className="mt-4 text-base font-bold text-[var(--color-text-primary)]">
                    {goal.title}
                  </h2>

                  {/* Progress Bar */}
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[var(--color-text-secondary)]">
                        {goal.currentUnits} / {goal.totalUnits} {goal.unitName}
                      </span>
                      <span className="text-[var(--color-primary)]">{goal.progressPercentage}%</span>
                    </div>

                    <div className="h-2.5 w-full rounded-full bg-[var(--color-surface-secondary)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
                        style={{ width: `${goal.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                  <span className="text-xs font-semibold text-[var(--color-text-tertiary)]">
                    {goal.completed ? '🎉 Goal Achieved!' : 'In Progress'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => deleteGoal.mutate(goal.id)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[var(--color-text-tertiary)] hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => incrementProgress.mutate({ goalId: goal.id })}
                      disabled={goal.completed}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-1.5 text-xs font-bold text-[var(--color-text-primary)] shadow-sm transition-all hover:bg-[var(--color-surface-secondary)] disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Log Progress
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}

      {/* Create Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl"
          >
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
              Create New Goal
            </h2>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              Define your target and track your achievements
            </p>

            <form onSubmit={handleCreateGoal} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-secondary)]">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Calculus & Derivatives"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)]">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomCategoryMode(!isCustomCategoryMode)}
                    className="text-2xs font-semibold text-[var(--color-primary)] hover:underline"
                  >
                    {isCustomCategoryMode ? 'Select Existing' : '+ Custom Category'}
                  </button>
                </div>

                {isCustomCategoryMode ? (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom category name..."
                    value={customModalCategory}
                    onChange={(e) => setCustomModalCategory(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                ) : (
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-secondary)]">
                  Target Date
                </label>
                <input
                  type="date"
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)]">
                    Target Amount
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newTargetUnits}
                    onChange={(e) => setNewTargetUnits(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)]">
                    Unit Name
                  </label>
                  <input
                    type="text"
                    value={newUnitName}
                    onChange={(e) => setNewUnitName(e.target.value)}
                    placeholder="Hours, Chapters, etc."
                    className="mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createGoal.isPending}
                  className="rounded-lg px-5 py-2 text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm disabled:opacity-50"
                >
                  {createGoal.isPending ? 'Creating…' : 'Create Goal'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
