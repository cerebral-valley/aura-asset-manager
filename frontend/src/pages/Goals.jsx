import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useCurrency } from '../hooks/useCurrency';
import { Button } from '../components/ui/button';
import { assetsService } from '../services/assets';
import { goalsService } from '../services/goals';
import { queryKeys } from '../lib/queryKeys';
import { toast } from 'sonner';
import Loading from '../components/ui/Loading';
import SafeSection from '../components/util/SafeSection';
import GoalModal from '../components/ui/GoalModal';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import { Calculator, Target, Plus } from 'lucide-react';

const Goals = () => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();

  // Modal state management
  const [modalState, setModalState] = useState({
    isOpen: false,
    goalType: 'custom', // 'net_worth' or 'custom'
    editingGoal: null
  });

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    goal: null,
    action: 'delete' // 'delete' or 'complete'
  });

  // Fetch assets for available amount calculation
  const {
    data: assets = [],
    isLoading: assetsLoading,
    error: assetsError
  } = useQuery({
    queryKey: queryKeys.assets.list(),
    queryFn: ({ signal }) => assetsService.getAssets({ signal }),
    enabled: !!user,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Fetch active goals
  const {
    data: goals = [],
    isLoading: goalsLoading,
    error: goalsError
  } = useQuery({
    queryKey: queryKeys.goals.list(false), // Only active goals
    queryFn: ({ signal }) => goalsService.getGoals(false, { signal }),
    enabled: !!user,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Fetch completed goals for logs
  const {
    data: completedGoals = [],
    isLoading: completedGoalsLoading,
    error: completedGoalsError
  } = useQuery({
    queryKey: queryKeys.goals.list(true), // Only completed goals
    queryFn: ({ signal }) => goalsService.getGoals(true, { signal }),
    enabled: !!user,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Goal mutations
  const createGoalMutation = useMutation({
    mutationFn: (goalData) => goalsService.createGoal(goalData),
    onMutate: async (goalData) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.list(false) });
      
      // Snapshot previous data
      const previousGoals = queryClient.getQueryData(queryKeys.goals.list(false));
      
      // Optimistically add the new goal
      queryClient.setQueryData(queryKeys.goals.list(false), (old = []) => [
        { ...goalData, id: `temp-${Date.now()}`, created_at: new Date().toISOString() },
        ...old
      ]);
      
      return { previousGoals };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousGoals) {
        queryClient.setQueryData(queryKeys.goals.list(false), context.previousGoals);
      }
      console.error('❌ Goal creation failed:', error);
      toast.error(`Failed to create goal: ${error.response?.data?.detail || error.message}`);
    },
    onSuccess: (result, variables) => {
      console.log('✅ Goal created successfully:', result);
      toast.success(`${variables.goal_type === 'net_worth' ? 'Net Worth Goal' : 'Custom Goal'} created successfully!`);
      
      // Invalidate and refetch goals
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.list(false) });
      
      // Close modal
      closeModal();
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, goalData }) => goalsService.updateGoal(id, goalData),
    onMutate: async ({ id, goalData }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.list(false) });
      
      // Snapshot previous data
      const previousGoals = queryClient.getQueryData(queryKeys.goals.list(false));
      
      // Optimistically update the goal
      queryClient.setQueryData(queryKeys.goals.list(false), (old = []) =>
        old.map(goal => goal.id === id ? { ...goal, ...goalData } : goal)
      );
      
      return { previousGoals };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousGoals) {
        queryClient.setQueryData(queryKeys.goals.list(false), context.previousGoals);
      }
      console.error('❌ Goal update failed:', error);
      toast.error(`Failed to update goal: ${error.response?.data?.detail || error.message}`);
    },
    onSuccess: (result, { goalData }) => {
      console.log('✅ Goal updated successfully:', result);
      toast.success(`${goalData.goal_type === 'net_worth' ? 'Net Worth Goal' : 'Custom Goal'} updated successfully!`);
      
      // Invalidate and refetch goals
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.list(false) });
      
      // Close modal
      closeModal();
    }
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id) => goalsService.deleteGoal(id),
    onMutate: async (id) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.list(false) });
      
      // Snapshot previous data
      const previousGoals = queryClient.getQueryData(queryKeys.goals.list(false));
      
      // Optimistically remove the goal
      queryClient.setQueryData(queryKeys.goals.list(false), (old = []) =>
        old.filter(goal => goal.id !== id)
      );
      
      return { previousGoals };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousGoals) {
        queryClient.setQueryData(queryKeys.goals.list(false), context.previousGoals);
      }
      console.error('❌ Goal deletion failed:', error);
      toast.error(`Failed to delete goal: ${error.response?.data?.detail || error.message}`);
    },
    onSuccess: (result, goalId) => {
      console.log('✅ Goal deleted successfully:', goalId);
      toast.success('Goal deleted successfully!');
      
      // Invalidate and refetch goals
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.list(false) });
      
      // Close confirmation dialog
      closeConfirmDialog();
    }
  });

  const completeGoalMutation = useMutation({
    mutationFn: (id) => goalsService.completeGoal(id),
    onMutate: async (id) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.list(false) });
      
      // Snapshot previous data
      const previousGoals = queryClient.getQueryData(queryKeys.goals.list(false));
      
      // Optimistically update the goal with completion
      queryClient.setQueryData(queryKeys.goals.list(false), (old = []) =>
        old.map(goal => goal.id === id ? { 
          ...goal, 
          is_completed: true, 
          completion_date: new Date().toISOString() 
        } : goal)
      );
      
      return { previousGoals };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousGoals) {
        queryClient.setQueryData(queryKeys.goals.list(false), context.previousGoals);
      }
      console.error('❌ Goal completion failed:', error);
      toast.error(`Failed to complete goal: ${error.response?.data?.detail || error.message}`);
    },
    onSuccess: (result, goalId) => {
      console.log('✅ Goal completed successfully:', goalId);
      toast.success('🎉 Congratulations! Goal completed successfully!');
      
      // Invalidate and refetch both active and completed goals
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.list(false) });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.list(true) });
      
      // Close confirmation dialog
      closeConfirmDialog();
    }
  });

  // Modal handlers
  const openModal = (goalType, editingGoal = null) => {
    setModalState({
      isOpen: true,
      goalType,
      editingGoal
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      goalType: 'custom',
      editingGoal: null
    });
  };

  const openConfirmDialog = (goal, action = 'delete') => {
    setConfirmDialog({
      isOpen: true,
      goal,
      action
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      goal: null,
      action: 'delete'
    });
  };

  const handleEditGoal = (goal) => {
    openModal(goal.goal_type, goal);
  };

  const handleDeleteGoal = () => {
    if (confirmDialog.goal) {
      deleteGoalMutation.mutate(confirmDialog.goal.id);
    }
  };

  const handleCompleteGoal = () => {
    if (confirmDialog.goal) {
      completeGoalMutation.mutate(confirmDialog.goal.id);
    }
  };

  const handleConfirmAction = () => {
    if (confirmDialog.action === 'complete') {
      handleCompleteGoal();
    } else {
      handleDeleteGoal();
    }
  };

  const handleGoalSubmit = (goalData) => {
    if (modalState.editingGoal) {
      // Update existing goal
      updateGoalMutation.mutate({
        id: modalState.editingGoal.id,
        goalData
      });
    } else {
      // Create new goal
      createGoalMutation.mutate(goalData);
    }
  };

  // Calculate Available Amount from selected assets
  const availableAmount = useMemo(() => {
    return assets
      .filter(asset => asset.is_selected_for_goal)
      .reduce((total, asset) => total + (parseFloat(asset.current_value) || 0), 0);
  }, [assets]);

  // Calculate current net worth (total of all assets)
  const currentNetWorth = useMemo(() => {
    return assets.reduce((total, asset) => total + (parseFloat(asset.current_value) || 0), 0);
  }, [assets]);

  // Separate net worth goal from custom goals
  const netWorthGoal = goals.find(goal => goal.goal_type === 'net_worth');
  const customGoals = goals.filter(goal => goal.goal_type === 'custom');

  // Calculate total goal amounts
  const totalGoalAmount = useMemo(() => {
    return customGoals.reduce((total, goal) => total + (parseFloat(goal.target_amount) || 0), 0);
  }, [customGoals]);

  // Calculate surplus/deficit
  const surplusDeficit = availableAmount - totalGoalAmount;

  const isLoading = assetsLoading || goalsLoading;
  const hasError = assetsError || goalsError;

  if (isLoading) {
    return <Loading pageName="Goals" />;
  }

  if (hasError) {
    return (
      <div className="p-6">
        <div className="text-red-600">
          Error loading goals data: {assetsError?.message || goalsError?.message}
        </div>
      </div>
    );
  }

  return (
    <SafeSection>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Goals</h1>
            <p className="text-gray-600 mt-2">
              Track your financial goals and allocate assets towards achieving them
            </p>
          </div>
          
          {/* Goal Achievement Badge */}
          {(goals.length > 0 || completedGoals.length > 0) && (
            <div className="text-right">
              <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 min-w-[200px]">
                <p className="text-sm text-gray-600 dark:text-gray-400">Goal Achievement</p>
                <p className="text-2xl font-bold text-green-600">
                  {completedGoals.filter(g => g.is_completed).length}
                  <span className="text-lg text-gray-500">/{(goals.length + completedGoals.filter(g => g.is_completed).length)}</span>
                </p>
                <p className="text-xs text-gray-500">
                  {completedGoals.filter(g => g.is_completed).length > 0 
                    ? `${completedGoals.filter(g => g.is_completed).length} goals completed`
                    : 'No goals completed yet'
                  }
                </p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${
                          (goals.length + completedGoals.filter(g => g.is_completed).length) > 0
                            ? (completedGoals.filter(g => g.is_completed).length / (goals.length + completedGoals.filter(g => g.is_completed).length)) * 100
                            : 0
                        }%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Available Amount Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Available Amount for Goals</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Selected Assets Value</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(availableAmount)}</p>
              <p className="text-xs text-gray-500">
                {assets.filter(asset => asset.is_selected_for_goal).length} of {assets.length} assets selected
              </p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${assets.length > 0 ? (assets.filter(asset => asset.is_selected_for_goal).length / assets.length) * 100 : 0}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {assets.length > 0 ? ((assets.filter(asset => asset.is_selected_for_goal).length / assets.length) * 100).toFixed(1) : 0}% of assets assigned
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Goal Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(totalGoalAmount)}</p>
              <p className="text-xs text-gray-500">
                {netWorthGoal ? `${customGoals.length + 1} goals (1 net worth + ${customGoals.length} custom)` : `${customGoals.length} custom goals`}
              </p>
              {netWorthGoal && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Net Worth: {formatCurrency(netWorthGoal.target_amount)}
                  </p>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {surplusDeficit >= 0 ? 'Surplus' : 'Deficit'}
              </p>
              <p className={`text-2xl font-bold ${surplusDeficit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(surplusDeficit))}
              </p>
              <p className="text-xs text-gray-500">
                {surplusDeficit >= 0 ? 'Available for additional goals' : 'Amount needed to meet goals'}
              </p>
              <div className="mt-2">
                <div className={`w-full ${surplusDeficit >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'} rounded-full h-2`}>
                  <div 
                    className={`${surplusDeficit >= 0 ? 'bg-green-600' : 'bg-red-600'} h-2 rounded-full transition-all duration-300`}
                    style={{ 
                      width: totalGoalAmount > 0 ? `${Math.min(100, Math.max(10, (availableAmount / totalGoalAmount) * 100))}%` : '0%'
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {totalGoalAmount > 0 ? `${((availableAmount / totalGoalAmount) * 100).toFixed(1)}% funded` : 'No goals set'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Net Worth Goal Section */}
        <div className="bg-white dark:bg-gray-800 border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">Net Worth Goal</h2>
          </div>
          
          {netWorthGoal ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Net Worth</p>
                  <p className="text-xl font-bold">{formatCurrency(currentNetWorth)}</p>
                  <p className="text-xs text-gray-500">
                    {assets.length} total assets
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Target Net Worth</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(netWorthGoal.target_amount)}</p>
                  <p className="text-xs text-gray-500">
                    {netWorthGoal.target_date ? `Target: ${new Date(netWorthGoal.target_date).toLocaleDateString()}` : 'No target date'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
                  <p className="text-xl font-bold">
                    {((currentNetWorth / parseFloat(netWorthGoal.target_amount)) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {currentNetWorth >= parseFloat(netWorthGoal.target_amount) ? 'Goal achieved! 🎉' : 'In progress'}
                  </p>
                </div>
              </div>
              
              {/* Enhanced Progress Bar */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Progress to Net Worth Goal</span>
                  <span>{((currentNetWorth / parseFloat(netWorthGoal.target_amount)) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      currentNetWorth >= parseFloat(netWorthGoal.target_amount) 
                        ? 'bg-gradient-to-r from-green-500 to-green-600' 
                        : 'bg-gradient-to-r from-green-500 to-green-600'
                    }`}
                    style={{ 
                      width: `${Math.min(100, (currentNetWorth / parseFloat(netWorthGoal.target_amount)) * 100)}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Current: {formatCurrency(currentNetWorth)}</span>
                  <span>Target: {formatCurrency(netWorthGoal.target_amount)}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="text-gray-600 dark:text-gray-400">
                  <span>Remaining: </span>
                  <span className={currentNetWorth >= parseFloat(netWorthGoal.target_amount) ? 'text-green-600 font-semibold' : ''}>
                    {formatCurrency(Math.max(0, parseFloat(netWorthGoal.target_amount) - currentNetWorth))}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditGoal(netWorthGoal)}>
                    Edit Goal
                  </Button>
                  {currentNetWorth >= parseFloat(netWorthGoal.target_amount) && (
                    <Button 
                      size="sm" 
                      onClick={() => openConfirmDialog(netWorthGoal, 'complete')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>

              {netWorthGoal.description && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                  <p className="text-sm text-green-700 dark:text-green-300">{netWorthGoal.description}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You haven't set a net worth goal yet
              </p>
              <Button onClick={() => openModal('net_worth')}>
                <Plus className="w-4 h-4 mr-2" />
                Set Net Worth Goal
              </Button>
            </div>
          )}
        </div>

        {/* Custom Goals Section */}
        <div className="bg-white dark:bg-gray-800 border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold">Custom Goals</h2>
            </div>
            <Button onClick={() => openModal('custom')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </div>
          
          {customGoals.length > 0 ? (
            <div className="space-y-4">
              {customGoals.map((goal) => (
                <div key={goal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{goal.title}</h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openConfirmDialog(goal, 'complete')}
                        className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                      >
                        Complete
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditGoal(goal)}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openConfirmDialog(goal, 'delete')}>
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Target Amount</p>
                      <p className="text-lg font-bold text-purple-600">{formatCurrency(goal.target_amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Target Date</p>
                      <p className="text-lg">{goal.target_date || 'Not set'}</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar for Goal */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>Progress to Goal</span>
                      <span>
                        {((availableAmount / parseFloat(goal.target_amount)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(100, (availableAmount / parseFloat(goal.target_amount)) * 100)}%` 
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Available: {formatCurrency(availableAmount)}</span>
                      <span>
                        Remaining: {formatCurrency(Math.max(0, parseFloat(goal.target_amount) - availableAmount))}
                      </span>
                    </div>
                  </div>
                  
                  {goal.description && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{goal.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No custom goals created yet. Add your first financial goal!
              </p>
              <p className="text-sm text-gray-500">
                Create goals like "Buy a house", "Vacation fund", or "Emergency savings"
              </p>
            </div>
          )}
        </div>

        {/* Goal Logs Section */}
        {completedGoals.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold">Goal Completion History</h2>
            </div>
            
            <div className="space-y-3">
              {completedGoals
                .filter(goal => goal.is_completed && goal.completion_date)
                .sort((a, b) => new Date(b.completion_date) - new Date(a.completion_date))
                .slice(0, 10) // Show last 10 completed goals
                .map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-green-800 dark:text-green-200">{goal.title}</h4>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {goal.goal_type === 'net_worth' ? 'Net Worth Goal' : 'Custom Goal'} • 
                          Completed on {new Date(goal.completion_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-700 dark:text-green-300">
                        {formatCurrency(goal.target_amount)}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">Target Amount</p>
                    </div>
                  </div>
                ))
              }
            </div>
            
            {completedGoals.filter(goal => goal.is_completed).length > 10 && (
              <div className="text-center mt-4">
                <p className="text-sm text-gray-500">
                  Showing 10 most recent completions • {completedGoals.filter(goal => goal.is_completed).length} total completed goals
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick Tip */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Tip:</strong> Go to the Assets page → All Assets table to select which assets should count towards your goals using the toggle buttons in the "Assign to Goals" column.
          </p>
        </div>
      </div>

      {/* Goal Modal */}
      <GoalModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSubmit={handleGoalSubmit}
        goal={modalState.editingGoal}
        goalType={modalState.goalType}
        isLoading={createGoalMutation.isPending || updateGoalMutation.isPending}
      />

      {/* Delete/Complete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirmAction}
        title={confirmDialog.action === 'complete' ? 'Complete Goal' : 'Delete Goal'}
        message={
          confirmDialog.action === 'complete' 
            ? `Are you sure you want to mark "${confirmDialog.goal?.title}" as completed? This will move it to your goal completion history.`
            : `Are you sure you want to delete "${confirmDialog.goal?.title}"? This action cannot be undone.`
        }
        confirmText={confirmDialog.action === 'complete' ? 'Complete Goal' : 'Delete Goal'}
        cancelText="Cancel"
        variant={confirmDialog.action === 'complete' ? 'warning' : 'danger'}
        isLoading={deleteGoalMutation.isPending || completeGoalMutation.isPending}
      />
    </SafeSection>
  );
};

export default Goals;