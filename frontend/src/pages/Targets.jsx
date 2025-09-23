import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useCurrency } from '../hooks/useCurrency';
import { targetsService } from '../services/targets';
import { queryKeys } from '../lib/queryKeys';
import { toast } from 'sonner';
import { Plus, Target, TrendingUp, Calendar, DollarSign, Settings, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import Loading from '../components/ui/Loading';
import SafeSection from '../components/util/SafeSection';
import { log, warn, error } from '../lib/debug';

const Targets = () => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();
  const [selectedTarget, setSelectedTarget] = useState(null);

  // TanStack Query for targets data
  const {
    data: targets = [],
    isLoading: targetsLoading,
    error: targetsError
  } = useQuery({
    queryKey: queryKeys.targets.list(),
    queryFn: ({ signal }) => targetsService.getTargets({ signal }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    onError: (err) => {
      error('Targets', 'targets:fetch:error', err);
    },
  });

  // Helper functions
  const getThemeLabels = (theme) => {
    switch (theme) {
      case 'empire_builder':
        return {
          pageTitle: 'Conquest Goals',
          subtitle: 'Chart your path to empire expansion',
          targetLabel: 'Empire Milestone',
          createNew: 'Set New Conquest'
        };
      case 'growth_chaser':
        return {
          pageTitle: 'Adventure Goals',
          subtitle: 'Map your journey to new heights',
          targetLabel: 'Journey Checkpoint',
          createNew: 'Plan New Adventure'
        };
      default: // sanctuary_builder
        return {
          pageTitle: 'Sanctuary Goals',
          subtitle: 'Build your foundation step by step',
          targetLabel: 'Foundation Stone',
          createNew: 'Add Foundation Goal'
        };
    }
  };

  const calculateProgress = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Delete target mutation
  const deleteTargetMutation = useMutation({
    mutationFn: (targetId) => targetsService.deleteTarget(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.targets.baseKey });
      toast.success('Target deleted successfully');
    },
    onError: (err) => {
      error('Targets', 'target:delete:error', err);
      toast.error('Failed to delete target');
    },
  });

  const handleDeleteTarget = (targetId) => {
    if (window.confirm('Are you sure you want to delete this target?')) {
      deleteTargetMutation.mutate(targetId);
    }
  };

  if (targetsLoading) {
    return <Loading pageName="Targets" />;
  }

  if (targetsError) {
    const errorMessage = targetsError?.response?.data?.detail || targetsError.message || 'Failed to load targets';
    return (
      <Alert variant="destructive">
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  }

  const theme = user?.theme || 'sanctuary_builder';
  const themeLabels = getThemeLabels(theme);

  // Separate net worth target from custom targets
  const netWorthTarget = targets.find(t => t.target_type === 'net_worth');
  const customTargets = targets.filter(t => t.target_type === 'custom');

  return (
    <SafeSection>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{themeLabels.pageTitle}</h1>
            <p className="text-muted-foreground mt-1">{themeLabels.subtitle}</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {themeLabels.createNew}
          </Button>
        </div>

        {/* Net Worth Target Section */}
        {netWorthTarget && (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle>Net Worth Milestone</CardTitle>
                </div>
                <Badge variant="secondary" className={getStatusColor(netWorthTarget.status)}>
                  {netWorthTarget.status}
                </Badge>
              </div>
              <CardDescription>{netWorthTarget.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(netWorthTarget.current_progress || 0)} / {formatCurrency(netWorthTarget.target_amount)}
                  </span>
                </div>
                <Progress 
                  value={calculateProgress(netWorthTarget.current_progress || 0, netWorthTarget.target_amount)} 
                  className="h-3"
                />
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Target: {netWorthTarget.target_date ? new Date(netWorthTarget.target_date).toLocaleDateString() : 'No deadline'}</span>
                  </div>
                  <span className="font-medium">
                    {calculateProgress(netWorthTarget.current_progress || 0, netWorthTarget.target_amount).toFixed(1)}% Complete
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Custom Targets Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Custom {themeLabels.targetLabel}s</h2>
            <span className="text-sm text-muted-foreground">
              {customTargets.length} / 4 targets
            </span>
          </div>

          {customTargets.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No custom targets yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first financial target to start tracking your progress
                </p>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Target
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {customTargets.map((target) => (
                <Card key={target.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <CardTitle className="text-lg">{target.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className={getStatusColor(target.status)}>
                          {target.status}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteTarget(target.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {target.description && (
                      <CardDescription>{target.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Progress</span>
                        <span className="text-muted-foreground">
                          {formatCurrency(target.current_progress || 0)} / {formatCurrency(target.target_amount)}
                        </span>
                      </div>
                      <Progress 
                        value={calculateProgress(target.current_progress || 0, target.target_amount)} 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{target.target_date ? new Date(target.target_date).toLocaleDateString() : 'No deadline'}</span>
                        </div>
                        <span className="font-medium">
                          {calculateProgress(target.current_progress || 0, target.target_amount).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Target Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold">{targets.length}</div>
                <div className="text-sm text-muted-foreground">Total Targets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{targets.filter(t => t.status === 'active').length}</div>
                <div className="text-sm text-muted-foreground">Active Targets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{targets.filter(t => t.status === 'completed').length}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SafeSection>
  );
};

export default Targets;