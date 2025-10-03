import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useCurrency } from '../hooks/useCurrency';
import { Button } from '../components/ui/button';
import { assetsService } from '../services/assets';
import { goalsService } from '../services/goals';
import { queryKeys, invalidationHelpers } from '../lib/queryKeys';
import { toast } from 'sonner';
import Loading from '../components/ui/Loading';
import SafeSection from '../components/util/SafeSection';
import { Edit, Trash2 } from 'lucide-react';

const GoalsPage = () => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();

  // Fetch assets for selected assets display
  const {
    data: assets = [],
    isLoading: assetsLoading,
    error: assetsError
  } = useQuery({
    queryKey: queryKeys.assets.list(),
    queryFn: ({ signal }) => assetsService.getAssets({ signal }),
    enabled: !!user,
    staleTime: 30 * 60 * 1000, // 30 minutes
    onError: (err) => {
      console.error('Failed to fetch assets:', err);
      toast.error('Failed to fetch assets');
    },
  });

  // Fetch goals for the user
  const {
    data: goals = [],
    isLoading: goalsLoading,
    error: goalsError
  } = useQuery({
    queryKey: queryKeys.goals.list(),
    queryFn: ({ signal }) => goalsService.getGoals({ signal }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes for goals
    onError: (err) => {
      console.error('Failed to fetch goals:', err);
      toast.error('Failed to fetch goals');
    },
  });

  // Filter selected assets (is_selected = true)
  const selectedAssets = useMemo(() => {
    return assets.filter(asset => asset.is_selected === true);
  }, [assets]);

  // Calculate present value using latest transaction or asset current_value/initial_value
  const getPresentValue = (asset) => {
    return Number(asset.current_value) || Number(asset.initial_value) || 0;
  };

  // Calculate total present value of selected assets
  const selectedTotalPresent = useMemo(() => {
    return selectedAssets.reduce((sum, asset) => sum + getPresentValue(asset), 0);
  }, [selectedAssets]);

  // Find net worth goal (goal_type = 'net_worth')
  const netWorthGoal = useMemo(() => {
    return goals.find(goal => goal.goal_type === 'net_worth' && !goal.goal_completed);
  }, [goals]);

  // State for net worth goal form
  const [showNetWorthForm, setShowNetWorthForm] = useState(false);
  const [netWorthTargetAmount, setNetWorthTargetAmount] = useState('');
  const [netWorthTargetDate, setNetWorthTargetDate] = useState('');

  const queryClient = useQueryClient();

  // Mutation for creating/updating net worth goal
  const createOrUpdateNetWorthGoal = useMutation({
    mutationFn: async (goalData) => {
      if (netWorthGoal) {
        return await goalsService.updateGoal(netWorthGoal.id, goalData);
      } else {
        return await goalsService.createGoal({ ...goalData, goal_type: 'net_worth', title: 'Net Worth Goal' });
      }
    },
    onSuccess: () => {
      invalidationHelpers.invalidateGoals(queryClient);
      toast.success(netWorthGoal ? 'Net worth goal updated' : 'Net worth goal created');
      setShowNetWorthForm(false);
      setNetWorthTargetAmount('');
      setNetWorthTargetDate('');
    },
    onError: (error) => {
      console.error('Failed to save net worth goal:', error);
      toast.error('Failed to save net worth goal');
    }
  });

  // Mutation for deleting net worth goal
  const deleteNetWorthGoal = useMutation({
    mutationFn: async () => {
      if (netWorthGoal) {
        return await goalsService.deleteGoal(netWorthGoal.id);
      }
    },
    onSuccess: () => {
      invalidationHelpers.invalidateGoals(queryClient);
      toast.success('Net worth goal deleted');
    },
    onError: (error) => {
      console.error('Failed to delete net worth goal:', error);
      toast.error('Failed to delete net worth goal');
    }
  });

  // Handle save net worth goal
  const handleSaveNetWorthGoal = () => {
    const targetAmount = parseFloat(netWorthTargetAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      toast.error('Please enter a valid target amount');
      return;
    }

    const goalData = {
      target_amount: targetAmount,
      target_date: netWorthTargetDate || null,
      allocate_amount: 0 // Net worth goal doesn't allocate from selected assets
    };

    createOrUpdateNetWorthGoal.mutate(goalData);
  };

  // Handle edit net worth goal
  const handleEditNetWorthGoal = () => {
    if (netWorthGoal) {
      setNetWorthTargetAmount(netWorthGoal.target_amount.toString());
      setNetWorthTargetDate(netWorthGoal.target_date || '');
      setShowNetWorthForm(true);
    }
  };

  // Calculate progress for net worth goal
  const netWorthProgress = useMemo(() => {
    if (!netWorthGoal || !netWorthGoal.target_amount) return 0;
    const progress = (selectedTotalPresent / parseFloat(netWorthGoal.target_amount)) * 100;
    return Math.min(progress, 100); // Cap at 100%
  }, [netWorthGoal, selectedTotalPresent]);

  // Calculate monthly growth needed to reach target
  const monthlyGrowthNeeded = useMemo(() => {
    if (!netWorthGoal || !netWorthGoal.target_date) return null;
    
    const targetDate = new Date(netWorthGoal.target_date);
    const today = new Date();
    const monthsRemaining = Math.max(1, Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24 * 30)));
    
    const amountNeeded = parseFloat(netWorthGoal.target_amount) - selectedTotalPresent;
    if (amountNeeded <= 0) return 0; // Goal already reached
    
    return amountNeeded / monthsRemaining;
  }, [netWorthGoal, selectedTotalPresent]);

  // Filter custom goals (not net_worth, not completed)
  const customGoals = useMemo(() => {
    return goals.filter(goal => goal.goal_type !== 'net_worth' && !goal.goal_completed);
  }, [goals]);

  // State for custom goals form
  const [showCustomGoalForm, setShowCustomGoalForm] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [customGoalType, setCustomGoalType] = useState('asset');
  const [customGoalTitle, setCustomGoalTitle] = useState('');
  const [customGoalTargetAmount, setCustomGoalTargetAmount] = useState('');
  const [customGoalTargetDate, setCustomGoalTargetDate] = useState('');
  const [customGoalAllocateAmount, setCustomGoalAllocateAmount] = useState('');

  // Mutation for creating/updating custom goal
  const createOrUpdateCustomGoal = useMutation({
    mutationFn: async (goalData) => {
      if (editingGoalId) {
        return await goalsService.updateGoal(editingGoalId, goalData);
      } else {
        return await goalsService.createGoal(goalData);
      }
    },
    onSuccess: () => {
      invalidationHelpers.invalidateGoals(queryClient);
      toast.success(editingGoalId ? 'Goal updated' : 'Goal created');
      resetCustomGoalForm();
    },
    onError: (error) => {
      console.error('Failed to save custom goal:', error);
      toast.error('Failed to save custom goal');
    }
  });

  // Mutation for deleting custom goal
  const deleteCustomGoal = useMutation({
    mutationFn: async (goalId) => {
      return await goalsService.deleteGoal(goalId);
    },
    onSuccess: () => {
      invalidationHelpers.invalidateGoals(queryClient);
      toast.success('Goal deleted');
    },
    onError: (error) => {
      console.error('Failed to delete custom goal:', error);
      toast.error('Failed to delete custom goal');
    }
  });

  // Reset custom goal form
  const resetCustomGoalForm = () => {
    setShowCustomGoalForm(false);
    setEditingGoalId(null);
    setCustomGoalType('asset');
    setCustomGoalTitle('');
    setCustomGoalTargetAmount('');
    setCustomGoalTargetDate('');
    setCustomGoalAllocateAmount('');
  };

  // Handle save custom goal
  const handleSaveCustomGoal = () => {
    if (!customGoalTitle.trim()) {
      toast.error('Please enter a goal title');
      return;
    }

    const targetAmount = parseFloat(customGoalTargetAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      toast.error('Please enter a valid target amount');
      return;
    }

    const allocateAmount = parseFloat(customGoalAllocateAmount) || 0;
    if (allocateAmount < 0) {
      toast.error('Allocate amount cannot be negative');
      return;
    }

    const goalData = {
      goal_type: customGoalType,
      title: customGoalTitle.trim(),
      target_amount: targetAmount,
      target_date: customGoalTargetDate || null,
      allocate_amount: allocateAmount
    };

    createOrUpdateCustomGoal.mutate(goalData);
  };

  // Handle edit custom goal
  const handleEditCustomGoal = (goal) => {
    setEditingGoalId(goal.id);
    setCustomGoalType(goal.goal_type);
    setCustomGoalTitle(goal.title);
    setCustomGoalTargetAmount(goal.target_amount.toString());
    setCustomGoalTargetDate(goal.target_date || '');
    setCustomGoalAllocateAmount(goal.allocate_amount.toString());
    setShowCustomGoalForm(true);
  };

  // Calculate progress for custom goal
  const calculateCustomGoalProgress = (goal) => {
    if (!goal || !goal.target_amount) return 0;
    const allocateAmount = parseFloat(goal.allocate_amount) || 0;
    const progress = (allocateAmount / parseFloat(goal.target_amount)) * 100;
    return Math.min(progress, 100);
  };

  // Loading state
  if (assetsLoading || goalsLoading) {
    return <Loading pageName="Goals" />;
  }

  // Error state
  if (assetsError || goalsError) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-red-800 dark:text-red-200">
            Error loading data. Please refresh the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Financial Goals
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track your financial goals and allocate selected assets towards achieving them
          </p>
        </div>
      </div>

      {/* Selected Assets Section */}
      <SafeSection title="Selected Assets for Goals Allocation">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {selectedAssets.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                No assets selected for goals allocation
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Go to Assets page and select assets you want to allocate towards your goals
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Asset Name
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Present Value
                    </th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedAssets.map((asset) => {
                    const presentValue = getPresentValue(asset);
                    const percentage = selectedTotalPresent > 0 
                      ? ((presentValue / selectedTotalPresent) * 100).toFixed(1) 
                      : 0;
                    
                    return (
                      <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-2 px-4 text-sm text-gray-900 dark:text-gray-100">
                          {asset.name}
                        </td>
                        <td className="py-2 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {asset.asset_type}
                        </td>
                        <td className="py-2 px-4 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(presentValue)}
                        </td>
                        <td className="py-2 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                          {percentage}%
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Total Row */}
                  <tr className="bg-gray-100 dark:bg-gray-900/70 font-semibold">
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                      Total Selected Assets
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {selectedAssets.length} asset{selectedAssets.length !== 1 ? 's' : ''}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(selectedTotalPresent)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-gray-100">
                      100%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SafeSection>

      {/* Net Worth Goal Section */}
      <SafeSection title="Net Worth Goal">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          {/* Display current net worth */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Present Net Worth (Selected Assets)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(selectedTotalPresent)}
              </p>
            </div>
            {!showNetWorthForm && !netWorthGoal && (
              <Button onClick={() => setShowNetWorthForm(true)} size="sm">
                Set Target
              </Button>
            )}
          </div>

          {/* Net Worth Goal Form */}
          {showNetWorthForm && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Net Worth Amount *
                </label>
                <input
                  type="number"
                  value={netWorthTargetAmount}
                  onChange={(e) => setNetWorthTargetAmount(e.target.value)}
                  placeholder="e.g., 1000000"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={netWorthTargetDate}
                  onChange={(e) => setNetWorthTargetDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveNetWorthGoal} disabled={createOrUpdateNetWorthGoal.isPending}>
                  {createOrUpdateNetWorthGoal.isPending ? 'Saving...' : 'Save Goal'}
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowNetWorthForm(false);
                  setNetWorthTargetAmount('');
                  setNetWorthTargetDate('');
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Display existing net worth goal */}
          {!showNetWorthForm && netWorthGoal && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Target Net Worth</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(parseFloat(netWorthGoal.target_amount))}
                  </p>
                  {netWorthGoal.target_date && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Target Date: {new Date(netWorthGoal.target_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditNetWorthGoal}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this net worth goal?')) {
                        deleteNetWorthGoal.mutate();
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {netWorthProgress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-full transition-all duration-300"
                    style={{ width: `${netWorthProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Current: {formatCurrency(selectedTotalPresent)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    Remaining: {formatCurrency(Math.max(0, parseFloat(netWorthGoal.target_amount) - selectedTotalPresent))}
                  </span>
                </div>
              </div>

              {/* Monthly Growth Calculation */}
              {monthlyGrowthNeeded !== null && netWorthGoal.target_date && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    To reach your target by {new Date(netWorthGoal.target_date).toLocaleDateString()}, 
                    you need to grow your net worth by approximately:
                  </p>
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-2">
                    {formatCurrency(monthlyGrowthNeeded)} / month
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </SafeSection>

      {/* Custom Goals Section */}
      <SafeSection title="Custom Goals">
        <div className="space-y-4">
          {/* Add New Goal Button */}
          {!showCustomGoalForm && customGoals.length < 3 && (
            <div className="flex justify-end">
              <Button onClick={() => setShowCustomGoalForm(true)} size="sm">
                + Add New Goal
              </Button>
            </div>
          )}

          {/* Maximum goals notice */}
          {customGoals.length >= 3 && !showCustomGoalForm && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Maximum of 3 custom goals reached. Delete a goal to add another.
              </p>
            </div>
          )}

          {/* Custom Goal Form */}
          {showCustomGoalForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                {editingGoalId ? 'Edit Goal' : 'Add New Goal'}
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Goal Type *
                </label>
                <select
                  value={customGoalType}
                  onChange={(e) => setCustomGoalType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="asset">Asset Goal</option>
                  <option value="expense">Expense Goal</option>
                  <option value="income">Income Goal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={customGoalTitle}
                  onChange={(e) => setCustomGoalTitle(e.target.value)}
                  placeholder="e.g., Buy a new car, Vacation fund"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Amount *
                </label>
                <input
                  type="number"
                  value={customGoalTargetAmount}
                  onChange={(e) => setCustomGoalTargetAmount(e.target.value)}
                  placeholder="e.g., 50000"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={customGoalTargetDate}
                  onChange={(e) => setCustomGoalTargetDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Allocate from Selected Assets
                </label>
                <input
                  type="number"
                  value={customGoalAllocateAmount}
                  onChange={(e) => setCustomGoalAllocateAmount(e.target.value)}
                  placeholder="e.g., 10000"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Selected assets total: {formatCurrency(selectedTotalPresent)}
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveCustomGoal} disabled={createOrUpdateCustomGoal.isPending}>
                  {createOrUpdateCustomGoal.isPending ? 'Saving...' : 'Save Goal'}
                </Button>
                <Button variant="outline" onClick={resetCustomGoalForm}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Display Custom Goals */}
          {customGoals.length === 0 && !showCustomGoalForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                No custom goals yet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Create up to 3 custom goals for assets, expenses, or income targets
              </p>
            </div>
          )}

          {customGoals.length > 0 && !showCustomGoalForm && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customGoals.map((goal) => {
                const progress = calculateCustomGoalProgress(goal);
                return (
                  <div
                    key={goal.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-3"
                  >
                    {/* Goal Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 mb-2">
                          {goal.goal_type === 'asset' ? '🎯 Asset' : goal.goal_type === 'expense' ? '💰 Expense' : '📈 Income'}
                        </span>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {goal.title}
                        </h4>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditCustomGoal(goal)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <Edit className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${goal.title}"?`)) {
                              deleteCustomGoal.mutate(goal.id);
                            }
                          }}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>

                    {/* Goal Details */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Target:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(parseFloat(goal.target_amount))}
                        </span>
                      </div>
                      {goal.target_date && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Date:</span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {new Date(goal.target_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Allocated:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(parseFloat(goal.allocate_amount) || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-green-600 dark:bg-green-500 h-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SafeSection>

      {/* Placeholder for Goal Logs Section (Phase 8) */}
      <SafeSection title="Goal Logs">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Goal Logs section coming in Phase 8
          </p>
        </div>
      </SafeSection>
    </div>
  );
};

export default GoalsPage;
