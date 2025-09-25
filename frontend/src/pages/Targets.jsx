import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useCurrency } from '../hooks/useCurrency';
import { targetsService } from '../services/targets';
import { assetsService } from '../services/assets';
import { queryKeys } from '../lib/queryKeys';
import { toast } from 'sonner';
import { 
  Plus, Target, TrendingUp, Calendar, DollarSign, Settings, 
  Trash2, CheckCircle, AlertCircle, RefreshCw, Eye, Edit, Edit3,
  RotateCcw
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import Loading from '../components/ui/Loading';
import SafeSection from '../components/util/SafeSection';
import CreateTargetModal from '../components/targets/CreateTargetModal';
import EditTargetModal from '../components/targets/EditTargetModal';
import DeleteConfirmModal from '../components/targets/DeleteConfirmModal';
import ViewTargetDetailsModal from '../components/targets/ViewTargetDetailsModal';
import { log, warn, error } from '../lib/debug';

const Targets = () => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showNetWorthModal, setShowNetWorthModal] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [allocations, setAllocations] = useState({});
  const [viewingTarget, setViewingTarget] = useState(null);
  const [viewingAsset, setViewingAsset] = useState(null);

  // TanStack Query for targets data
  const {
    data: targets = [],
    isLoading: targetsLoading,
    error: targetsError
  } = useQuery({
    queryKey: queryKeys.targets.list(),
    queryFn: ({ signal }) => targetsService.getTargets({ signal }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });

  // TanStack Query for assets data
  const {
    data: assets = [],
    isLoading: assetsLoading,
    error: assetsError
  } = useQuery({
    queryKey: queryKeys.assets.list(),
    queryFn: ({ signal }) => assetsService.getAssets({ signal }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });

  // TanStack Query for liquid assets with selection status
  const {
    data: liquidAssets = [],
    isLoading: liquidAssetsLoading,
    error: liquidAssetsError
  } = useQuery({
    queryKey: queryKeys.targets.liquidAssets(),
    queryFn: ({ signal }) => targetsService.getLiquidAssets({ signal }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });

  // TanStack Query for completed targets
  const {
    data: completedTargets = [],
    isLoading: completedTargetsLoading,
    error: completedTargetsError
  } = useQuery({
    queryKey: queryKeys.targets.completed(),
    queryFn: ({ signal }) => targetsService.getCompletedTargets({ signal }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });

  // Mutation for updating asset selections
  const updateAssetSelectionsMutation = useMutation({
    mutationFn: (selections) => {
      console.log('🔧 DEBUG: Frontend sending asset selections:', selections);
      return targetsService.updateAssetSelections(selections);
    },
    onSuccess: (data, updatedSelections) => {
      console.log('🔧 DEBUG: Asset selection update succeeded:', data);
      toast.success('Asset selection updated successfully');
    },
    onError: (error) => {
      console.error('🔧 DEBUG: Asset selection update failed:', error);
      toast.error('Failed to update asset selections: ' + (error.response?.data?.detail || 'Unknown error'));
    }
  });

  // Mutation for updating target
  const updateTargetMutation = useMutation({
    mutationFn: ({ id, data }) => targetsService.updateTarget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.targets.list() });
      toast.success('Target updated successfully');
      setEditingTarget(null);
    },
    onError: (error) => {
      toast.error('Failed to update target: ' + (error.response?.data?.detail || 'Unknown error'));
    }
  });

  // Mutation for deleting target
  const deleteTargetMutation = useMutation({
    mutationFn: targetsService.deleteTarget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.targets.list() });
      toast.success('Target deleted successfully');
      setShowDeleteConfirm(null);
    },
    onError: (error) => {
      toast.error('Failed to delete target: ' + (error.response?.data?.detail || 'Unknown error'));
    }
  });

  // Mutation for completing target
  const completeTargetMutation = useMutation({
    mutationFn: targetsService.completeTarget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.targets.list() });
      toast.success('Target completed! 🎉');
    },
    onError: (error) => {
      toast.error('Failed to complete target: ' + (error.response?.data?.detail || 'Unknown error'));
    }
  });

  // Mutation for updating target allocations
  const updateAllocationsMutation = useMutation({
    mutationFn: ({ targetId, allocations }) => targetsService.updateTargetAllocations(targetId, allocations),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.targets.list() });
      toast.success('Allocation updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update allocation: ' + (error.response?.data?.detail || 'Unknown error'));
    }
  });

  // Mutation for restoring target
  const restoreTargetMutation = useMutation({
    mutationFn: targetsService.restoreTarget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.targets.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.targets.completed() });
      toast.success('Target restored successfully');
    },
    onError: (error) => {
      toast.error('Failed to restore target: ' + (error.response?.data?.detail || 'Unknown error'));
    }
  });

  // Helper functions
  const getThemeLabels = (theme) => {
    switch (theme) {
      case 'empire_builder':
        return {
          pageTitle: 'Conquest Goals',
          subtitle: 'Chart your path to empire expansion',
          sectionTitle: 'Empire Assets',
          netWorthTitle: 'EMPIRE MILESTONE',
          customTitle: 'YOUR CONQUESTS'
        };
      case 'growth_chaser':
        return {
          pageTitle: 'Growth Targets',
          subtitle: 'Accelerate your financial growth',
          sectionTitle: 'Growth Assets',
          netWorthTitle: 'GROWTH MILESTONE',
          customTitle: 'YOUR TARGETS'
        };
      case 'sanctuary_builder':
      default:
        return {
          pageTitle: 'Sanctuary Goals',
          subtitle: 'Build your financial foundation with peace of mind',
          sectionTitle: 'Foundation Stones',
          netWorthTitle: 'NET WORTH MILESTONE',
          customTitle: 'YOUR ASPIRATIONS'
        };
    }
  };

  // Calculate totals and progress
  const selectedAssetsList = liquidAssets.filter(asset => asset.is_selected);
  const selectedAssetsTotal = selectedAssetsList.reduce((sum, asset) => {
    const value = parseFloat(asset.current_value) || 0;
    return sum + value;
  }, 0);
  
  const netWorthTarget = targets.find(t => t.target_type === 'net_worth');
  const customTargets = targets.filter(t => t.target_type === 'custom' && t.status === 'active');

  const totalNetWorth = assets.reduce((sum, asset) => {
    const value = parseFloat(asset.current_value) || 0;
    return sum + value;
  }, 0);

  // Calculate progress for net worth target
  const netWorthProgress = netWorthTarget ? 
    Math.min((totalNetWorth / netWorthTarget.target_amount) * 100, 100) : 0;

  // Calculate monthly growth needed for net worth target
  const calculateMonthlyGrowthNeeded = (target) => {
    if (!target || !target.target_date) return 0;
    const targetDate = new Date(target.target_date);
    const now = new Date();
    const monthsRemaining = Math.max(1, Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24 * 30)));
    const remainingAmount = target.target_amount - totalNetWorth;
    return Math.max(0, remainingAmount / monthsRemaining);
  };

  // Calculate progress for custom targets
  const calculateTargetProgress = (target) => {
    const allocatedAmount = target.total_allocated_amount || 0;
    return Math.min((allocatedAmount / target.target_amount) * 100, 100);
  };

  // Status indicator for targets
  const getTargetStatus = (target) => {
    if (!target.target_date) return { status: 'on-track', icon: CheckCircle, text: 'No deadline' };
    
    const targetDate = new Date(target.target_date);
    const now = new Date();
    const progress = calculateTargetProgress(target);
    
    if (progress >= 100) {
      return { status: 'completed', icon: CheckCircle, text: 'Completed' };
    }
    
    const daysRemaining = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
    const expectedProgress = 100 - (daysRemaining / 365) * 100;
    
    if (daysRemaining < 0) {
      return { status: 'overdue', icon: AlertCircle, text: 'Past due' };
    } else if (progress < expectedProgress - 10) {
      return { status: 'behind', icon: AlertCircle, text: 'Behind schedule' };
    } else {
      return { status: 'on-track', icon: CheckCircle, text: 'On track' };
    }
  };

  const handleAssetToggle = async (assetId, currentlySelected) => {
    console.log('🔧 DEBUG: handleAssetToggle called with:', { assetId, currentlySelected });
    
    // Send just this single asset selection change to backend
    const selections = {
      [assetId]: !currentlySelected
    };
    
    console.log('🔧 DEBUG: Sending selections:', selections);
    
    try {
      await updateAssetSelectionsMutation.mutateAsync(selections);
    } catch (error) {
      // Error already handled by mutation
      console.error('🔧 DEBUG: handleAssetToggle error:', error);
    }
  };

  // Handle allocation change
  const handleAllocationChange = (targetId, percentage) => {
    setAllocations(prev => ({
      ...prev,
      [targetId]: percentage
    }));
  };

  // Handle save allocation
  const handleSaveAllocation = async (targetId) => {
    const percentage = allocations[targetId];
    if (percentage === undefined || percentage < 0 || percentage > 100) {
      toast.error('Please enter a valid allocation percentage (0-100)');
      return;
    }

    const allocationAmount = (selectedAssetsTotal * percentage) / 100;
    
    try {
      await updateAllocationsMutation.mutateAsync({
        targetId,
        allocations: [{
          allocation_amount: allocationAmount,
          allocation_percentage: percentage
        }]
      });
    } catch (error) {
      // Error already handled by mutation
    }
  };

  // Calculate allocation details for a target
  const calculateAllocationDetails = (target) => {
    const allocationPercentage = allocations[target.id] || target.allocation_percentage || 35; // Default 35%
    const allocatedAmount = (selectedAssetsTotal * allocationPercentage) / 100;
    
    // Calculate monthly savings needed based on target date
    let monthlySavings = 0;
    if (target.target_date) {
      const targetDate = new Date(target.target_date);
      const now = new Date();
      const monthsRemaining = Math.max(1, Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24 * 30)));
      const remainingAmount = Math.max(0, target.target_amount - allocatedAmount);
      monthlySavings = remainingAmount / monthsRemaining;
    }

    return {
      percentage: allocationPercentage,
      amount: allocatedAmount,
      monthlySavings
    };
  };

  // Calculate total allocation overview
  const calculateAllocationOverview = () => {
    const totalAllocatedPercentage = customTargets.reduce((sum, target) => {
      const details = calculateAllocationDetails(target);
      return sum + details.percentage;
    }, 0);

    const totalAllocatedAmount = (selectedAssetsTotal * totalAllocatedPercentage) / 100;
    const availableForAllocation = selectedAssetsTotal - totalAllocatedAmount;

    return {
      totalAllocatedPercentage,
      totalAllocatedAmount,
      availableForAllocation,
      isOverAllocated: totalAllocatedPercentage > 100
    };
  };

  // Handle refresh assets
  const handleRefreshAssets = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.targets.liquidAssets() });
    queryClient.invalidateQueries({ queryKey: queryKeys.assets.list() });
    toast.success('Assets refreshed successfully');
  };

  if (targetsLoading || liquidAssetsLoading || completedTargetsLoading) {
    return <Loading pageName="Targets" />;
  }

  if (targetsError || liquidAssetsError || completedTargetsError) {
    const errorMessage = targetsError?.response?.data?.detail || 
                         liquidAssetsError?.response?.data?.detail || 
                         completedTargetsError?.response?.data?.detail ||
                         'Failed to load data';
    return (
      <Alert variant="destructive">
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  }

  const theme = user?.theme || 'sanctuary_builder';
  const themeLabels = getThemeLabels(theme);

  return (
    <SafeSection pageName="Targets">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{themeLabels.pageTitle}</h1>
          <p className="text-muted-foreground mt-2">{themeLabels.subtitle}</p>
        </div>

        {/* Section 1: Liquid Assets Selection */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                💰 Available {themeLabels.sectionTitle}
              </CardTitle>
              <CardDescription>
                Select assets to include in your allocation pool
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefreshAssets}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Assets
            </Button>
          </CardHeader>
          <CardContent>
            {liquidAssets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No liquid assets found. Add some assets first to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {liquidAssets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/30 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={asset.is_selected}
                        onCheckedChange={() => handleAssetToggle(asset.id, asset.is_selected)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{asset.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{asset.asset_type}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-semibold text-sm">{formatCurrency(parseFloat(asset.current_value) || 0)}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 text-xs"
                        onClick={() => setViewingAsset(asset)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Selected Total:</span>
                    <span className="text-lg font-bold">{formatCurrency(selectedAssetsTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-muted-foreground">Available for Allocation:</span>
                    <span className="font-medium">{formatCurrency(selectedAssetsTotal * 0.85)} (unallocated)</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Net Worth Milestone (Hero Card) */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">🏆 {themeLabels.netWorthTitle}</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditingTarget(netWorthTarget)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {netWorthTarget ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Net Worth:</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalNetWorth)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Net Worth:</p>
                    <p className="text-2xl font-bold">{formatCurrency(netWorthTarget.target_amount)}</p>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Progress</span>
                    <span className="font-semibold">{netWorthProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={netWorthProgress} className="h-3" />
                </div>

                {netWorthTarget.target_date && (
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Target Date:</p>
                      <p className="font-semibold">{new Date(netWorthTarget.target_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time Remaining:</p>
                      <p className="font-semibold">{Math.ceil((new Date(netWorthTarget.target_date) - new Date()) / (1000 * 60 * 60 * 24 * 30))} months</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Growth Needed:</p>
                      <p className="font-semibold">{formatCurrency(calculateMonthlyGrowthNeeded(netWorthTarget))}/month</p>
                    </div>
                  </div>
                )}

                <div className="text-center mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm italic">"Your sanctuary foundation grows stronger each month"</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No net worth milestone set</p>
                <Button onClick={() => setShowNetWorthModal(true)}>Set Net Worth Target</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 3: Custom Target Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">🎯 {themeLabels.customTitle}</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {customTargets.map((target) => {
              const progress = calculateTargetProgress(target);
              const status = getTargetStatus(target);
              const StatusIcon = status.icon;
              const allocationDetails = calculateAllocationDetails(target);
              
              return (
                <Card key={target.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{target.name}</CardTitle>
                      <Badge variant={status.status === 'on-track' ? 'default' : status.status === 'behind' ? 'destructive' : 'secondary'}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.text}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Target: {formatCurrency(target.target_amount)}</span>
                          <span className="text-sm font-semibold">{progress.toFixed(1)}% ({formatCurrency(allocationDetails.amount)})</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      {/* Allocation Controls */}
                      <div className="bg-muted/30 p-3 rounded-md space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`allocation-${target.id}`} className="text-sm font-medium">
                            Allocation %:
                          </Label>
                          <Input
                            id={`allocation-${target.id}`}
                            type="number"
                            min="0"
                            max="100"
                            value={allocations[target.id] || allocationDetails.percentage}
                            onChange={(e) => handleAllocationChange(target.id, parseFloat(e.target.value) || 0)}
                            className="w-20 h-8"
                          />
                          <Button 
                            size="sm"
                            onClick={() => handleSaveAllocation(target.id)}
                            disabled={updateAllocationsMutation.isPending}
                          >
                            Save
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Allocated Amount:</p>
                            <p className="font-medium">{formatCurrency(allocationDetails.amount)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Monthly Needed:</p>
                            <p className="font-medium">{formatCurrency(allocationDetails.monthlySavings)}</p>
                          </div>
                          {target.target_date && (
                            <>
                              <div>
                                <p className="text-muted-foreground">Due:</p>
                                <p className="font-medium">{new Date(target.target_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEditingTarget(target)}
                          className="flex-1"
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowDeleteConfirm(target)}
                          className="flex-1"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => completeTargetMutation.mutate(target.id)}
                          disabled={completeTargetMutation.isPending}
                          className="flex-1"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {completeTargetMutation.isPending ? 'Completing...' : 'Mark Complete'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Add New Target Card */}
            {customTargets.length < 4 && (
              <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer" 
                    onClick={() => setShowTargetModal(true)}>
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">+ Add Foundation Goal</h3>
                  <p className="text-sm text-muted-foreground mb-4">Create your next financial milestone</p>
                  <Button onClick={() => setShowTargetModal(true)}>+ Create Your First Target</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Section 4: Allocation Overview & Warnings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              📊 ALLOCATION OVERVIEW
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Selected Assets:</p>
                  <p className="text-xl font-bold">{formatCurrency(selectedAssetsTotal)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Allocated:</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(calculateAllocationOverview().totalAllocatedAmount)} 
                    ({calculateAllocationOverview().totalAllocatedPercentage.toFixed(1)}%)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available for Allocation:</p>
                  <p className="text-xl font-bold">{formatCurrency(calculateAllocationOverview().availableForAllocation)}</p>
                </div>
              </div>

              <div className="space-y-2">
                {calculateAllocationOverview().isOverAllocated && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      ⚠️ Over-allocated by {(calculateAllocationOverview().totalAllocatedPercentage - 100).toFixed(1)}% - please reduce some allocations
                    </AlertDescription>
                  </Alert>
                )}
                
                {customTargets.some(target => getTargetStatus(target).status === 'behind') ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      ⚠️ Some targets behind schedule - consider increasing allocation or extending deadlines
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      ✅ All targets on track for completion
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Target Logs (Completed/Archived) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              📜 TARGET LOGS
            </CardTitle>
          </CardHeader>
          <CardContent>
            {completedTargets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No completed targets yet. Keep working towards your goals!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="font-medium">Completed Targets:</p>
                {completedTargets.map((target) => (
                  <div key={target.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">{target.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(target.target_amount)} • Completed {new Date(target.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setViewingTarget(target)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => restoreTargetMutation.mutate(target.id)}
                        disabled={restoreTargetMutation.isPending}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        {restoreTargetMutation.isPending ? 'Restoring...' : 'Restore Target'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CreateTargetModal 
        isOpen={showTargetModal} 
        onClose={() => setShowTargetModal(false)} 
        targetType="custom"
      />
      <CreateTargetModal 
        isOpen={showNetWorthModal} 
        onClose={() => setShowNetWorthModal(false)} 
        targetType="net_worth"
      />
      <EditTargetModal
        isOpen={!!editingTarget}
        onClose={() => setEditingTarget(null)}
        target={editingTarget}
      />
      <DeleteConfirmModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        target={showDeleteConfirm}
      />
      <ViewTargetDetailsModal
        isOpen={!!viewingTarget}
        onClose={() => setViewingTarget(null)}
        target={viewingTarget}
        formatCurrency={formatCurrency}
      />
      
      {/* Asset Details Modal */}
      {viewingAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Asset Details</h3>
              <button
                onClick={() => setViewingAsset(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-base">{viewingAsset.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <p className="text-base capitalize">{viewingAsset.asset_type}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Value</label>
                <p className="text-lg font-semibold">{formatCurrency(parseFloat(viewingAsset.current_value) || 0)}</p>
              </div>
              
              {viewingAsset.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-base">{viewingAsset.description}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Selection Status</label>
                <p className="text-base">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    viewingAsset.is_selected 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
                  }`}>
                    {viewingAsset.is_selected ? 'Selected for Allocation' : 'Not Selected'}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button onClick={() => setViewingAsset(null)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </SafeSection>
  );
};

export default Targets;