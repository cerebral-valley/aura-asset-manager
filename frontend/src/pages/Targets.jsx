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
  Trash2, CheckCircle, AlertCircle, RefreshCw, Eye, Edit, 
  RotateCcw
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Checkbox } from '../components/ui/checkbox';
import Loading from '../components/ui/Loading';
import SafeSection from '../components/util/SafeSection';
import CreateTargetModal from '../components/targets/CreateTargetModal';
import { log, warn, error } from '../lib/debug';

const Targets = () => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();
  const [selectedAssets, setSelectedAssets] = useState(new Set());
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showNetWorthModal, setShowNetWorthModal] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);

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
  const liquidAssets = assets.filter(asset => 
    ['stocks', 'crypto', 'cash', 'savings', 'bonds', 'etf'].includes(asset.asset_type)
  );

  const selectedAssetsList = liquidAssets.filter(asset => selectedAssets.has(asset.id));
  const selectedAssetsTotal = selectedAssetsList.reduce((sum, asset) => {
    const value = parseFloat(asset.current_value) || 0;
    return sum + value;
  }, 0);
  
  const netWorthTarget = targets.find(t => t.target_type === 'net_worth');
  const customTargets = targets.filter(t => t.target_type === 'custom' && t.status === 'active');
  const completedTargets = targets.filter(t => t.status === 'completed' || t.status === 'archived');

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

  const toggleAssetSelection = (assetId) => {
    const newSelected = new Set(selectedAssets);
    if (newSelected.has(assetId)) {
      newSelected.delete(assetId);
    } else {
      newSelected.add(assetId);
    }
    setSelectedAssets(newSelected);
  };

  if (targetsLoading || assetsLoading) {
    return <Loading pageName="Targets" />;
  }

  if (targetsError || assetsError) {
    const errorMessage = targetsError?.response?.data?.detail || 
                         assetsError?.response?.data?.detail || 
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
            <Button variant="outline" size="sm">
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
                        checked={selectedAssets.has(asset.id)}
                        onCheckedChange={() => toggleAssetSelection(asset.id)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{asset.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{asset.asset_type}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-semibold text-sm">{formatCurrency(parseFloat(asset.current_value) || 0)}</p>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
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
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm">Save</Button>
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
                          <span className="text-sm font-semibold">{progress.toFixed(1)}% ({formatCurrency(target.total_allocated_amount || 0)})</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Allocation:</p>
                          <p className="font-medium">35%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Monthly:</p>
                          <p className="font-medium">{formatCurrency(625)}</p>
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

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">Save</Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remove
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
                  <p className="text-xl font-bold">{formatCurrency(selectedAssetsTotal * 0.85)} (85%)</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available for Allocation:</p>
                  <p className="text-xl font-bold">{formatCurrency(selectedAssetsTotal * 0.15)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    ⚠️ Vacation target behind schedule - consider increasing allocation or extending deadline
                  </AlertDescription>
                </Alert>
                
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ✅ All other targets on track for completion
                  </AlertDescription>
                </Alert>
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
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button variant="ghost" size="sm">
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Restore Target
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
    </SafeSection>
  );
};

export default Targets;