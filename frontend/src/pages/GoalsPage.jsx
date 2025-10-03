import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useCurrency } from '../hooks/useCurrency';
import { assetsService } from '../services/assets';
import { goalsService } from '../services/goals';
import { queryKeys } from '../lib/queryKeys';
import { toast } from 'sonner';
import Loading from '../components/ui/Loading';
import SafeSection from '../components/util/SafeSection';

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

      {/* Placeholder for Net Worth Goal Section (Phase 5) */}
      <SafeSection title="Net Worth Goal">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Net Worth Goal section coming in Phase 5
          </p>
        </div>
      </SafeSection>

      {/* Placeholder for Custom Goals Section (Phase 6) */}
      <SafeSection title="Custom Goals">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Custom Goals section coming in Phase 6
          </p>
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
