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
import { Calculator, Target, Plus } from 'lucide-react';

const Goals = () => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();

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
                {assets.filter(asset => asset.is_selected_for_goal).length} assets selected
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Goal Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(totalGoalAmount)}</p>
              <p className="text-xs text-gray-500">{customGoals.length} active goals</p>
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
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Target Net Worth</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(netWorthGoal.target_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
                  <p className="text-xl font-bold">
                    {((currentNetWorth / parseFloat(netWorthGoal.target_amount)) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (currentNetWorth / parseFloat(netWorthGoal.target_amount)) * 100)}%` 
                  }}
                />
              </div>
              
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Target Date: {netWorthGoal.target_date || 'Not set'}</span>
                <span>
                  Remaining: {formatCurrency(Math.max(0, parseFloat(netWorthGoal.target_amount) - currentNetWorth))}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You haven't set a net worth goal yet
              </p>
              <Button>
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
            <Button>
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
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Delete</Button>
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

        {/* Quick Actions */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Tip: Go to the Assets page to select which assets should count towards your goals
          </p>
          <Button variant="outline" onClick={() => window.location.href = '/assets'}>
            Manage Asset Selection
          </Button>
        </div>
      </div>
    </SafeSection>
  );
};

export default Goals;