import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useChartColors } from '../hooks/useChartColors';
import { useCurrency } from '../hooks/useCurrency';
import { Button } from '../components/ui/button';
import { assetsService } from '../services/assets';
import { goalsService } from '../services/goals';
import { queryKeys, invalidationHelpers } from '../lib/queryKeys';
import { toast } from 'sonner';
import Loading from '../components/ui/Loading';
import { Edit, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';

const GoalsPage = () => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const { isDark } = useChartColors();

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

  // Mutation for completing net worth goal
  const completeNetWorthGoal = useMutation({
    mutationFn: async () => {
      if (netWorthGoal) {
        return await goalsService.updateGoal(netWorthGoal.id, { 
          goal_completed: true
          // Backend automatically sets completed_date to current date
        });
      }
    },
    onSuccess: () => {
      invalidationHelpers.invalidateGoals(queryClient);
      toast.success('Net worth goal marked as complete!');
    },
    onError: (error) => {
      console.error('Failed to complete net worth goal:', error);
      toast.error('Failed to complete net worth goal');
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

  // Handle complete net worth goal
  const handleCompleteNetWorthGoal = () => {
    if (confirm('Mark this net worth goal as complete? This will move it to Goal Logs.')) {
      completeNetWorthGoal.mutate();
    }
  };

  // Handle complete custom goal
  const handleCompleteCustomGoal = (goalId, goalTitle) => {
    if (confirm(`Mark "${goalTitle}" as complete? This will move it to Goal Logs.`)) {
      completeCustomGoal.mutate(goalId);
    }
  };

  // Handle delete completed goal from Goal Logs
  const handleDeleteCompletedGoal = (goalId, goalTitle) => {
    if (confirm(`Permanently delete "${goalTitle}" from Goal Logs? This action cannot be undone.`)) {
      deleteCompletedGoal.mutate(goalId);
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

  // Filter completed goals for Goal Logs
  const completedGoals = useMemo(() => {
    return goals.filter(goal => goal.goal_completed === true);
  }, [goals]);

  // Calculate total allocated amount from incomplete goals
  const totalAllocatedAmount = useMemo(() => {
    return customGoals.reduce((sum, goal) => {
      return sum + (parseFloat(goal.allocate_amount) || 0);
    }, 0);
  }, [customGoals]);

  // Calculate available allocation (Amount Allocated - Sum of allocate_amount for incomplete goals)
  const availableForAllocation = useMemo(() => {
    return selectedTotalPresent - totalAllocatedAmount;
  }, [selectedTotalPresent, totalAllocatedAmount]);

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

  // Mutation for completing custom goal
  const completeCustomGoal = useMutation({
    mutationFn: async (goalId) => {
      return await goalsService.updateGoal(goalId, { 
        goal_completed: true
        // Backend automatically sets completed_date to current date
      });
    },
    onSuccess: () => {
      invalidationHelpers.invalidateGoals(queryClient);
      toast.success('Goal marked as complete!');
    },
    onError: (error) => {
      console.error('Failed to complete custom goal:', error);
      toast.error('Failed to complete custom goal');
    }
  });

  // Mutation for deleting completed goals from Goal Logs
  const deleteCompletedGoal = useMutation({
    mutationFn: async (goalId) => {
      return await goalsService.deleteGoal(goalId);
    },
    onSuccess: () => {
      invalidationHelpers.invalidateGoals(queryClient);
      toast.success('Completed goal removed from logs');
    },
    onError: (error) => {
      console.error('Failed to delete completed goal:', error);
      toast.error('Failed to delete completed goal');
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
      <div className={`p-6 min-h-screen ${isDark ? 'bg-black text-neutral-100' : 'bg-gray-50'}`}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading data. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen ${isDark ? 'bg-black text-neutral-100' : 'bg-gray-50'}`}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-neutral-100' : 'text-gray-900'}`}>
          Financial Goals
        </h1>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
          Track your financial goals and allocate selected assets towards achieving them
        </p>
      </div>

      {/* Selected Assets Section */}
      <div className="mb-6">
        <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-neutral-100' : 'text-gray-900'}`}>
          Selected Assets for Goals Allocation
        </h2>
        <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded shadow p-4 overflow-x-auto`}>
          {selectedAssets.length === 0 ? (
            <div className="p-8 text-center">
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                No assets selected for goals allocation
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Go to Assets page and select assets you want to allocate towards your goals
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className={`${isDark ? 'border-gray-600' : 'border-gray-200'} border-b`}>
                    <th className={`py-3 px-4 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                      Asset Name
                    </th>
                    <th className={`py-3 px-4 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                      Type
                    </th>
                    <th className={`py-3 px-4 text-right text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                      Present Value
                    </th>
                    <th className={`py-3 px-4 text-right text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAssets.map((asset) => {
                    const presentValue = getPresentValue(asset);
                    const percentage = selectedTotalPresent > 0 
                      ? ((presentValue / selectedTotalPresent) * 100).toFixed(1) 
                      : 0;
                    
                    return (
                      <tr key={asset.id} className={`border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                        <td className={`py-2 px-4 text-sm ${isDark ? 'text-neutral-100' : 'text-gray-900'}`}>
                          {asset.name}
                        </td>
                        <td className={`py-2 px-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {asset.asset_type}
                        </td>
                        <td className={`py-2 px-4 text-sm text-right font-medium ${isDark ? 'text-neutral-100' : 'text-gray-900'}`}>
                          {formatCurrency(presentValue)}
                        </td>
                        <td className={`py-2 px-4 text-sm text-right ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {percentage}%
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Total Row */}
                  <tr className={`border-t-2 font-bold ${isDark ? 'border-neutral-700 bg-neutral-950' : 'border-gray-300 bg-gray-50'}`}>
                    <td className={`py-3 px-4 text-sm ${isDark ? 'text-neutral-100' : 'text-gray-900'}`}>
                      Total Selected Assets
                    </td>
                    <td className={`py-3 px-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedAssets.length} asset{selectedAssets.length !== 1 ? 's' : ''}
                    </td>
                    <td className={`py-3 px-4 text-sm text-right font-bold ${isDark ? 'text-neutral-100' : 'text-gray-900'}`}>
                      {formatCurrency(selectedTotalPresent)}
                    </td>
                    <td className={`py-3 px-4 text-sm text-right ${isDark ? 'text-neutral-100' : 'text-gray-900'}`}>
                      100%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Net Worth Goal Section */}
      <div className="mb-6">
        <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-neutral-100' : 'text-gray-900'}`}>
          Net Worth Goal
        </h2>
        <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded shadow p-6`}>
          {/* Display current net worth */}
          <div className={`flex justify-between items-center pb-4 border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Present Net Worth (Selected Assets)</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-neutral-100' : 'text-gray-900'}`}>
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
            <div className={`space-y-4 p-4 ${isDark ? 'bg-neutral-800/50' : 'bg-gray-50'} rounded-lg mt-4`}>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Target Net Worth Amount *
                </label>
                <input
                  type="number"
                  value={netWorthTargetAmount}
                  onChange={(e) => setNetWorthTargetAmount(e.target.value)}
                  placeholder="e.g., 1000000"
                  className={`w-full px-3 py-2 rounded border text-sm ${isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-100' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={netWorthTargetDate}
                  onChange={(e) => setNetWorthTargetDate(e.target.value)}
                  className={`w-full px-3 py-2 rounded border text-sm ${isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-100' : 'bg-white border-gray-300 text-gray-900'}`}
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
              <div className="flex justify-between items-start mt-4">
                <div className="flex-1">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Target Net Worth</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-neutral-100' : 'text-gray-900'}`}>
                    {formatCurrency(parseFloat(netWorthGoal.target_amount))}
                  </p>
                  {netWorthGoal.target_date && (
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
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
                    onClick={handleCompleteNetWorthGoal}
                    className="border-green-500 text-green-600 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Complete
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
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
                  <span className={`font-medium ${isDark ? 'text-neutral-100' : 'text-gray-900'}`}>
                    {netWorthProgress.toFixed(1)}%
                  </span>
                </div>
                <div className={`w-full ${isDark ? 'bg-neutral-700' : 'bg-gray-200'} rounded-full h-4 overflow-hidden`}>
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${netWorthProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Current: {formatCurrency(selectedTotalPresent)}
                  </span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Remaining: {formatCurrency(Math.max(0, parseFloat(netWorthGoal.target_amount) - selectedTotalPresent))}
                  </span>
                </div>
              </div>

              {/* Monthly Growth Calculation */}
              {monthlyGrowthNeeded !== null && netWorthGoal.target_date && (
                <div className={`${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'} p-4 rounded-lg`}>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    To reach your target by {new Date(netWorthGoal.target_date).toLocaleDateString()}, 
                    you need to grow your net worth by approximately:
                  </p>
                  <p className={`text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'} mt-2`}>
                    {formatCurrency(monthlyGrowthNeeded)} / month
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom Goals Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-semibold ${isDark ? 'text-neutral-100' : 'text-gray-900'}`}>
            Custom Goals ({formatCurrency(selectedTotalPresent)} | {formatCurrency(availableForAllocation)})
          </h2>
          {!showCustomGoalForm && customGoals.length < 3 && (
            <Button 
              onClick={() => setShowCustomGoalForm(true)} 
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              + Add New Goal
            </Button>
          )}
        </div>

        {/* Maximum goals notice */}
        {customGoals.length >= 3 && !showCustomGoalForm && (
          <div className={`${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-3 mb-4`}>
            <p className={`text-sm ${isDark ? 'text-yellow-200' : 'text-yellow-800'}`}>
              Maximum of 3 custom goals reached. Delete a goal to add another.
            </p>
          </div>
        )}

        {/* Custom Goal Form */}
        {showCustomGoalForm && (
          <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded shadow p-6 mb-4`}>
            <h3 className={`font-semibold text-lg mb-4 ${isDark ? 'text-neutral-100' : 'text-gray-900'}`}>
              {editingGoalId ? 'Edit Goal' : 'Add New Goal'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Goal Type *
                </label>
                <select
                  value={customGoalType}
                  onChange={(e) => setCustomGoalType(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}
                >
                  <option value="asset">Asset Goal</option>
                  <option value="expense">Expense Goal</option>
                  <option value="income">Income Goal</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={customGoalTitle}
                  onChange={(e) => setCustomGoalTitle(e.target.value)}
                  placeholder="e.g., Buy a new car, Vacation fund"
                  className={`w-full px-3 py-2 border rounded-md ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Target Amount *
                </label>
                <input
                  type="number"
                  value={customGoalTargetAmount}
                  onChange={(e) => setCustomGoalTargetAmount(e.target.value)}
                  placeholder="e.g., 50000"
                  className={`w-full px-3 py-2 border rounded-md ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={customGoalTargetDate}
                  onChange={(e) => setCustomGoalTargetDate(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Allocate from Selected Assets
                </label>
                <input
                  type="number"
                  value={customGoalAllocateAmount}
                  onChange={(e) => setCustomGoalAllocateAmount(e.target.value)}
                  placeholder="e.g., 10000"
                  className={`w-full px-3 py-2 border rounded-md ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}
                />
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
          </div>
        )}

          {/* Display Custom Goals */}
          {customGoals.length === 0 && !showCustomGoalForm && (
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-8 text-center`}>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                No custom goals yet
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
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
                    className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-4 space-y-3`}
                  >
                    {/* Goal Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${isDark ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-100 text-blue-800'} mb-2`}>
                          {goal.goal_type === 'asset' ? '🎯 Asset' : goal.goal_type === 'expense' ? '💰 Expense' : '📈 Income'}
                        </span>
                        <h4 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                          {goal.title}
                        </h4>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditCustomGoal(goal)}
                          className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Edit className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                        </button>
                        <button
                          onClick={() => handleCompleteCustomGoal(goal.id, goal.title)}
                          className={`p-1 rounded ${isDark ? 'hover:bg-green-800/20' : 'hover:bg-green-100'}`}
                          title="Mark as complete"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${goal.title}"?`)) {
                              deleteCustomGoal.mutate(goal.id);
                            }
                          }}
                          className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Trash2 className={`h-4 w-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                        </button>
                      </div>
                    </div>

                    {/* Goal Details */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Target:</span>
                        <span className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                          {formatCurrency(parseFloat(goal.target_amount))}
                        </span>
                      </div>
                      {goal.target_date && (
                        <div className="flex justify-between text-sm">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Date:</span>
                          <span className={isDark ? 'text-gray-100' : 'text-gray-900'}>
                            {new Date(goal.target_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Allocated:</span>
                        <span className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                          {formatCurrency(parseFloat(goal.allocate_amount) || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
                        <span className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 overflow-hidden`}>
                        <div
                          className={`${isDark ? 'bg-green-500' : 'bg-green-600'} h-full transition-all duration-300`}
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

      {/* Allocation Validation Warning */}
      {(() => {
        const totalAllocated = customGoals.reduce((sum, goal) => sum + (parseFloat(goal.allocate_amount) || 0), 0);
        return totalAllocated > selectedTotalPresent && (
          <div className={`rounded p-4 mb-6 ${isDark ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center">
              <AlertTriangle className={`h-5 w-5 mr-2 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
              <p className={`font-medium ${isDark ? 'text-red-200' : 'text-red-800'}`}>
                Allocation Exceeds Available Funds
              </p>
            </div>
            <p className={`text-sm mt-2 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
              Total allocated: {formatCurrency(totalAllocated)} exceeds selected assets: {formatCurrency(selectedTotalPresent)}
            </p>
          </div>
        );
      })()}

      {/* Goal Logs Section */}
      <div className="mb-6">
        <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-neutral-100' : 'text-gray-900'}`}>
          Goal Logs
        </h2>
        <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded shadow p-6`}>
          {completedGoals.length === 0 ? (
            <div className="text-center py-8">
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                No completed goals yet
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Completed goals will appear here for tracking your achievements
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                {completedGoals.length} completed goal{completedGoals.length !== 1 ? 's' : ''}
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                {completedGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4 space-y-3`}
                  >
                    {/* Completed Goal Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${isDark ? 'bg-green-900/50 text-green-200' : 'bg-green-100 text-green-800'}`}>
                            {goal.goal_type === 'net_worth' ? '📊 Net Worth' : 
                             goal.goal_type === 'asset' ? '🎯 Asset' : 
                             goal.goal_type === 'expense' ? '💰 Expense' : '📈 Income'} - Completed
                          </span>
                        </div>
                        <h4 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-1`}>
                          {goal.goal_type === 'net_worth' ? 'Net Worth Goal' : goal.title}
                        </h4>
                        {goal.completed_date && (
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Completed: {new Date(goal.completed_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteCompletedGoal(goal.id, goal.goal_type === 'net_worth' ? 'Net Worth Goal' : goal.title)}
                        className={`p-2 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                        title="Remove from logs"
                      >
                        <Trash2 className={`h-4 w-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                      </button>
                    </div>

                    {/* Completed Goal Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className={`block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Target Amount:</span>
                        <span className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                          {formatCurrency(parseFloat(goal.target_amount))}
                        </span>
                      </div>
                      {goal.goal_type !== 'net_worth' && (
                        <div>
                          <span className={`block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Allocated:</span>
                          <span className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                            {formatCurrency(parseFloat(goal.allocate_amount) || 0)}
                          </span>
                        </div>
                      )}
                      {goal.target_date && (
                        <div>
                          <span className={`block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Target Date:</span>
                          <span className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                            {new Date(goal.target_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className={`block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Achievement:</span>
                        <span className="font-medium text-green-600">
                          ✓ Completed
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;
