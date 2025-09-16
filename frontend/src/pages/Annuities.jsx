import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { Plus, Filter, Search, TrendingUp, DollarSign, Calendar, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useTheme } from '../contexts/ThemeContext';
import annuityService from '../services/annuities';
import AnnuityForm from '../components/annuities/AnnuityForm';
import AnnuityDetails from '../components/annuities/AnnuityDetails';
import { 
  ANNUITY_TYPES, 
  CONTRACT_STATUSES, 
  formatAnnuityValue, 
  formatPercentage,
  getAnnuityTypeInfo,
  calculateAnnualizedReturn
} from '../constants/annuityTypes';
import Loading from '../components/ui/Loading';
import SafeSection from '@/components/util/SafeSection'
import { log, warn, error } from '@/lib/debug';
import { queryKeys } from '@/lib/queryKeys';
import { mutationHelpers } from '@/lib/queryUtils';

const AnnuitiesPage = () => {
  log('Annuities:init', 'Component initializing');
  
  // Import verification
  if (!annuityService) warn('Annuities:import', 'annuityService not available');
  if (!AnnuityForm) warn('Annuities:import', 'AnnuityForm not available');
  if (!AnnuityDetails) warn('Annuities:import', 'AnnuityDetails not available');
  
  const { user } = useAuth();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  
  // Local state for UI management
  const [showForm, setShowForm] = useState(false);
  const [selectedAnnuity, setSelectedAnnuity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Create filters object for query key
  const filters = {};
  if (statusFilter) filters.status = statusFilter;
  if (typeFilter) filters.annuity_type = typeFilter;

  // TanStack Query data fetching with guarded retry for 4xx responses
  const {
    data: annuities = [],
    isLoading: annuitiesLoading,
    error: annuitiesError
  } = useQuery({
    queryKey: queryKeys.annuities.list(filters),
    queryFn: ({ signal }) => annuityService.getAnnuities(filters, { signal }),
    enabled: !!user,
    staleTime: 30 * 60 * 1000, // 30 minutes (align with global default)
    gcTime: 60 * 60 * 1000, // 1 hour (align with global default)
    // Smart retry: don't retry on 4xx client errors (like empty data), only on 5xx/network
    retry: (failureCount, error) => {
      // Don't retry client errors (4xx) - these are likely empty data responses
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false
      }
      // Retry server errors (5xx) and network errors up to 2 times
      return failureCount < 2
    },
  })

  const {
    data: portfolioSummary = null,
    isLoading: summaryLoading,
    error: summaryError
  } = useQuery({
    queryKey: queryKeys.annuities.summary(),
    queryFn: ({ signal }) => annuityService.getPortfolioSummary({ signal }),
    enabled: !!user,
    staleTime: 30 * 60 * 1000, // 30 minutes (align with global default)
    gcTime: 60 * 60 * 1000, // 1 hour (align with global default)
    // Smart retry: don't retry on 4xx client errors (like empty data), only on 5xx/network
    retry: (failureCount, error) => {
      // Don't retry client errors (4xx) - these are likely empty data responses
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false
      }
      // Retry server errors (5xx) and network errors up to 2 times
      return failureCount < 2
    },
  })

  // Compute combined loading state
  const loading = annuitiesLoading || summaryLoading

  // Handle query errors
  if (annuitiesError) {
    error('Annuities:annuitiesQuery', 'Error fetching annuities', {
      message: annuitiesError.message,
      response: annuitiesError.response?.data,
      status: annuitiesError.response?.status
    });
  }

  if (summaryError) {
    error('Annuities:summaryQuery', 'Error fetching portfolio summary', {
      message: summaryError.message,
      response: summaryError.response?.data,
      status: summaryError.response?.status
    });
  }

  const handleCreateAnnuity = async (annuityData) => {
    try {
      await annuityService.createAnnuity(annuityData);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.annuities.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.annuities.summary() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
    } catch (error) {
      console.error('Error creating annuity:', error);
    }
  };

  const handleUpdateAnnuity = async (annuityId, updateData) => {
    try {
      await annuityService.updateAnnuity(annuityId, updateData);
      setSelectedAnnuity(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.annuities.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.annuities.summary() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
    } catch (error) {
      console.error('Error updating annuity:', error);
    }
  };

  const handleDeleteAnnuity = async (annuityId) => {
    if (window.confirm('Are you sure you want to delete this annuity?')) {
      try {
        await annuityService.deleteAnnuity(annuityId);
        setSelectedAnnuity(null);
        queryClient.invalidateQueries({ queryKey: queryKeys.annuities.list() });
        queryClient.invalidateQueries({ queryKey: queryKeys.annuities.summary() });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
      } catch (error) {
        console.error('Error deleting annuity:', error);
      }
    }
  };

  const filteredAnnuities = annuities.filter(annuity => {
    const matchesSearch = annuity.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         annuity.provider_company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (annuity.contract_number && annuity.contract_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const getStatusBadgeColor = (status) => {
    const statusInfo = CONTRACT_STATUSES[status];
    if (!statusInfo) return 'secondary';
    
    switch (status) {
      case 'active': return 'default';
      case 'annuitized': return 'secondary';
      case 'surrendered': return 'destructive';
      case 'death_claim': return 'outline';
      case 'matured': return 'secondary';
      default: return 'secondary';
    }
  };

  if (loading) {
    log('Annuities:loading', 'Still loading annuities data...');
    return <Loading pageName="Annuities" />;
  }

  // Add render state logging
  log(`Annuities component rendering:`, {
    totalAnnuities: annuities.length,
    filteredCount: filteredAnnuities.length,
    searchTerm,
    showForm,
    hasSelectedAnnuity: !!selectedAnnuity,
    selectedAnnuityId: selectedAnnuity?.id
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Annuities Portfolio</h1>
          <p className="text-muted-foreground">Manage your annuity contracts and track performance</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Annuity
        </Button>
      </div>

      {/* Portfolio Summary Cards */}
      {portfolioSummary && (
        <SafeSection debugId="Annuities:PortfolioSummaryCards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Annuities</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{portfolioSummary.total_annuities}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Premiums Paid</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAnnuityValue(portfolioSummary.total_premiums_paid)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAnnuityValue(portfolioSummary.total_current_value)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${portfolioSummary.total_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatAnnuityValue(portfolioSummary.total_gain_loss)}
                </div>
              </CardContent>
            </Card>
          </div>
        </SafeSection>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search annuities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
        >
          <option value="">All Statuses</option>
          {Object.entries(CONTRACT_STATUSES).map(([value, info]) => (
            <option key={value} value={value}>{info.label}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
        >
          <option value="">All Types</option>
          {Object.entries(ANNUITY_TYPES).map(([value, info]) => (
            <option key={value} value={value}>{info.label}</option>
          ))}
        </select>
      </div>

      {/* Annuities Grid */}
      {filteredAnnuities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Annuities Found</h3>
            <p className="text-gray-500 text-center mb-6">
              {annuities.length === 0 
                ? "You haven't added any annuities yet. Click 'Add Annuity' to get started."
                : "No annuities match your current filters. Try adjusting your search criteria."
              }
            </p>
            {annuities.length === 0 && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Annuity
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAnnuities.map((annuity) => {
            const typeInfo = getAnnuityTypeInfo(annuity.annuity_type);
            const currentValue = annuity.accumulation_value || annuity.initial_premium;
            const gainLoss = currentValue - annuity.initial_premium;
            const gainLossPercentage = (gainLoss / annuity.initial_premium) * 100;
            
            return (
              <Card 
                key={annuity.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedAnnuity(annuity)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{annuity.product_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{annuity.provider_company}</p>
                      {annuity.contract_number && (
                        <p className="text-xs text-muted-foreground">Contract: {annuity.contract_number}</p>
                      )}
                    </div>
                    <div className="text-2xl">{typeInfo.icon}</div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={getStatusBadgeColor(annuity.contract_status)}>
                      {CONTRACT_STATUSES[annuity.contract_status]?.label || annuity.contract_status}
                    </Badge>
                    <Badge variant="outline">
                      {typeInfo.label}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Initial Premium:</span>
                      <span className="font-medium">{formatAnnuityValue(annuity.initial_premium)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Current Value:</span>
                      <span className="font-medium">{formatAnnuityValue(currentValue)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Gain/Loss:</span>
                      <span className={`font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatAnnuityValue(gainLoss)} ({gainLossPercentage >= 0 ? '+' : ''}{gainLossPercentage.toFixed(2)}%)
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Purchase Date:</span>
                      <span className="text-sm">{new Date(annuity.purchase_date).toLocaleDateString()}</span>
                    </div>
                    
                    {annuity.guaranteed_rate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Guaranteed Rate:</span>
                        <span className="text-sm">{formatPercentage(annuity.guaranteed_rate)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <SafeSection debugId="Annuities:AnnuityForm">
          <AnnuityForm
            onSubmit={handleCreateAnnuity}
            onCancel={() => setShowForm(false)}
          />
        </SafeSection>
      )}

      {selectedAnnuity && (
        <SafeSection debugId="Annuities:AnnuityDetails">
          <AnnuityDetails
            annuity={selectedAnnuity}
            onUpdate={handleUpdateAnnuity}
            onDelete={handleDeleteAnnuity}
            onClose={() => setSelectedAnnuity(null)}
          />
        </SafeSection>
      )}
    </div>
  );
};

export default AnnuitiesPage;
