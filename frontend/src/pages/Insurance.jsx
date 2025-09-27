import React, { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { useChartColors } from '../hooks/useChartColors';
import { Button } from '../components/ui/button';
import { insuranceService } from '../services/insurance';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import { exportInsuranceToPDF } from '../utils/pdfExportTerminalInsurance';
import { exportInsuranceToExcel } from '../utils/excelExportInsurance';
import { 
  aggregateInsuranceByType, 
  calculateInsuranceTotals, 
  createDetailedInsuranceBreakdown,
  calculateProtectionMetrics,
  prepareInsuranceChartData
} from '../utils/insuranceAggregation';
import Loading from '../components/ui/Loading';
import SafeSection from '@/components/util/SafeSection'
import { log, warn, error } from '@/lib/debug';
import { queryKeys } from '@/lib/queryKeys';
import { mutationHelpers } from '@/lib/queryUtils';
import { Download, FileSpreadsheet, Plus } from 'lucide-react';

const Insurance = () => {
  log('Insurance:init', 'Component initializing');
  
  // Import verification
  if (!insuranceService) warn('Insurance:import', 'insuranceService not available');
  if (!ResponsiveContainer) warn('Insurance:import', 'ResponsiveContainer not available');
  if (!exportInsuranceToPDF) warn('Insurance:import', 'exportInsuranceToPDF not available');
  
  const { user } = useAuth();
  const { colors, getColor } = useChartColors();
  const queryClient = useQueryClient();
  
  // TanStack Query data fetching
  const {
    data: policies = [],
    isLoading: loading,
    error: queryError
  } = useQuery({
    queryKey: queryKeys.insurance.list(),
    queryFn: ({ signal }) => insuranceService.getPolicies({ signal }),
    enabled: !!user,
    staleTime: 30 * 60 * 1000, // 30 minutes (align with global default)
    gcTime: 60 * 60 * 1000, // 1 hour (align with global default)
    // Smart retry: don't retry on 4xx client errors (like empty data), only on 5xx/network
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false
      }
      return failureCount < 2
    },
  })

  // TanStack Query mutations with broadcasting
  const createPolicyMutation = useMutation({
    mutationFn: (policyData) => insuranceService.createPolicy(policyData),
    onMutate: async (newPolicy) => {
      // Cancel outgoing queries to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.insurance.list() })
      
      // Snapshot previous data
      const previousPolicies = queryClient.getQueryData(queryKeys.insurance.list())
      
      // Optimistically update cache
      queryClient.setQueryData(queryKeys.insurance.list(), (old = []) => [
        { ...newPolicy, id: 'temp-' + Date.now() },
        ...old
      ])
      
      return { previousPolicies }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousPolicies) {
        queryClient.setQueryData(queryKeys.insurance.list(), context.previousPolicies)
      }
      console.error('Insurance create failed:', error)
      toast.error(error.message || 'Failed to create policy')
    },
    onSuccess: (result, variables) => {
      console.log('✅ Insurance policy created:', result)
      toast.success('Policy added successfully')
      
      // Use mutation helpers for proper invalidation and broadcasting
      mutationHelpers.onInsuranceSuccess(queryClient, 'create', { 
        insuranceId: result.id, 
        policyType: variables.policy_type 
      })
      
      closeModal()
    },
  })

  const updatePolicyMutation = useMutation({
    mutationFn: ({ id, data }) => insuranceService.updatePolicy(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.insurance.list() })
      
      const previousPolicies = queryClient.getQueryData(queryKeys.insurance.list())
      
      // Optimistic update
      queryClient.setQueryData(queryKeys.insurance.list(), (old = []) =>
        old.map(policy => policy.id === id ? { ...policy, ...data } : policy)
      )
      
      return { previousPolicies }
    },
    onError: (error, variables, context) => {
      if (context?.previousPolicies) {
        queryClient.setQueryData(queryKeys.insurance.list(), context.previousPolicies)
      }
      console.error('Insurance update failed:', error)
      toast.error(error.message || 'Failed to update policy')
    },
    onSuccess: (result, { id, data }) => {
      console.log('✅ Insurance policy updated:', result)
      toast.success('Policy updated successfully')
      
      mutationHelpers.onInsuranceSuccess(queryClient, 'update', { 
        insuranceId: id, 
        policyType: data.policy_type 
      })
      
      closeModal()
    },
  })

  const deletePolicyMutation = useMutation({
    mutationFn: (id) => insuranceService.deletePolicy(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.insurance.list() })
      
      const previousPolicies = queryClient.getQueryData(queryKeys.insurance.list())
      
      // Optimistic removal
      queryClient.setQueryData(queryKeys.insurance.list(), (old = []) =>
        old.filter(policy => policy.id !== id)
      )
      
      return { previousPolicies }
    },
    onError: (error, variables, context) => {
      if (context?.previousPolicies) {
        queryClient.setQueryData(queryKeys.insurance.list(), context.previousPolicies)
      }
      console.error('Insurance delete failed:', error)
      toast.error('Failed to delete policy')
    },
    onSuccess: (result, id) => {
      console.log('✅ Insurance policy deleted:', result)
      toast.success('Policy deleted successfully')
      
      mutationHelpers.onInsuranceSuccess(queryClient, 'delete', { insuranceId: id })
    },
  })

  // Local state for UI management
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPolicy, setEditPolicy] = useState(null);
  const [actionError, setActionError] = useState(null);
  const modalRef = useRef(null);

  // Compute mutation loading state
  const actionLoading = createPolicyMutation.isPending || updatePolicyMutation.isPending || deletePolicyMutation.isPending;

  // Export loading states
  const [pdfExporting, setPdfExporting] = useState(false);
  const [excelExporting, setExcelExporting] = useState(false);

  // Global preferences trigger for re-renders
  const [globalPreferencesVersion, setGlobalPreferencesVersion] = useState(0);

  // Handle query error
  if (queryError) {
    error('Insurance:query', 'Error fetching policies', {
      message: queryError.message,
      response: queryError.response?.data,
      status: queryError.response?.status
    });
  }

  // Listen for global preferences changes
  useEffect(() => {
    const handlePreferencesChanged = () => {
      setGlobalPreferencesVersion(prev => prev + 1);
    };

    window.addEventListener('globalPreferencesChanged', handlePreferencesChanged);
    
    return () => {
      window.removeEventListener('globalPreferencesChanged', handlePreferencesChanged);
    };
  }, []);

  // Helper functions for display formatting
  const formatCurrency = (amount) => {
    if (!amount || amount === 0 || amount === '0' || amount === '') return '-';

    // Convert string to number if needed
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount) || numAmount === 0) return '-';

    // Get global currency preference
    const globalCurrency = localStorage.getItem('globalCurrency') || 'USD';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: globalCurrency,
      minimumFractionDigits: 2
    }).format(numAmount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      // Handle both YYYY-MM-DD format from DB and Date objects
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.warn('Date formatting error:', error, dateString);
      return '-';
    }
  };

  const getNextRenewalDate = (renewalDate) => {
    if (!renewalDate) return '-';
    try {
      const date = new Date(renewalDate);
      if (isNaN(date.getTime())) return '-';

      const currentYear = new Date().getFullYear();

      // If renewal date is in the past, show next year's renewal
      if (date.getFullYear() < currentYear) {
        date.setFullYear(currentYear);
        if (date < new Date()) {
          date.setFullYear(currentYear + 1);
        }
      }

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.warn('Renewal date formatting error:', error, renewalDate);
      return '-';
    }
  };

  const getCoverageDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return '-';
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) return '-';

      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);

      if (years > 0 && months > 0) {
        return `${years}y ${months}m`;
      } else if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''}`;
      } else if (months > 0) {
        return `${months} month${months > 1 ? 's' : ''}`;
      } else {
        return `${diffDays} days`;
      }
    } catch (error) {
      console.warn('Duration calculation error:', error, startDate, endDate);
      return '-';
    }
  };

  // Helper function to safely format date for HTML date input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    try {
      // If already in YYYY-MM-DD format, validate and return
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
        if (!isNaN(date.getTime())) {
          return dateString;
        }
      }
      
      // Handle DD/MM/YYYY format (European format)
      if (typeof dateString === 'string' && dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = dateString.split('/');
        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        
        // Validate the constructed date
        const date = new Date(formattedDate + 'T00:00:00');
        if (!isNaN(date.getTime())) {
          return formattedDate;
        }
      }
      
      // Handle MM/DD/YYYY format (American format)
      if (typeof dateString === 'string' && dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        const [month, day, year] = dateString.split('/');
        // Check if day > 12, then it's likely DD/MM format
        if (parseInt(day, 10) > 12) {
          const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          const date = new Date(formattedDate + 'T00:00:00');
          if (!isNaN(date.getTime())) {
            return formattedDate;
          }
        } else {
          const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          const date = new Date(formattedDate + 'T00:00:00');
          if (!isNaN(date.getTime())) {
            return formattedDate;
          }
        }
      }
      
      // Try to parse as a regular Date
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      
      console.warn('Unable to parse date:', dateString);
      return '';
    } catch (error) {
      console.error('Date parsing error:', error, dateString);
      return '';
    }
  };

  // Form setup
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();

  // Open modal for add/edit
  const openModal = (policy = null) => {
    setEditPolicy(policy);
    setActionError(null);
    setModalOpen(true);
    
    setTimeout(() => {
      if (modalRef.current) {
        modalRef.current.focus();
      }
    }, 100);
    
    if (policy) {
      console.log('📅 [DEBUG] Opening modal with policy dates:', {
        start_date: policy.start_date,
        end_date: policy.end_date,
        renewal_date: policy.renewal_date
      });

      const startDateFormatted = formatDateForInput(policy.start_date);
      const endDateFormatted = formatDateForInput(policy.end_date);
      const renewalDateFormatted = formatDateForInput(policy.renewal_date);

      console.log('📅 [DEBUG] Formatted dates for form:', {
        start_date: startDateFormatted,
        end_date: endDateFormatted,
        renewal_date: renewalDateFormatted
      });

      reset({
        policy_name: policy.policy_name || '',
        policy_type: policy.policy_type || '',
        provider: policy.provider || '',
        policy_number: policy.policy_number || '',
        coverage_amount: policy.coverage_amount || '',
        premium_amount: policy.premium_amount || '',
        premium_frequency: policy.premium_frequency || 'monthly',
        notes: policy.notes || '',
        status: policy.status || 'active',
        start_date: startDateFormatted,
        end_date: endDateFormatted,
        renewal_date: renewalDateFormatted,
      });
    } else {
      reset({
        policy_name: '',
        policy_type: '',
        provider: '',
        policy_number: '',
        coverage_amount: '',
        premium_amount: '',
        premium_frequency: 'monthly',
        notes: '',
        status: 'active',
        start_date: '',
        end_date: '',
        renewal_date: '',
      });
    }
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditPolicy(null);
    setActionError(null);
    reset();
  };

  // Add or update policy using TanStack Query mutations
  const onSubmit = async (data) => {
    setActionError(null);

    console.log('🔍 [DEBUG] Form submission - raw data:', data);

    try {
      // Clean up date fields
      const processedData = {
        ...data,
        start_date: data.start_date && data.start_date.trim() !== '' ? data.start_date : null,
        end_date: data.end_date && data.end_date.trim() !== '' ? data.end_date : null,
        renewal_date: data.renewal_date && data.renewal_date.trim() !== '' ? data.renewal_date : null,
      };

      console.log('✅ [DEBUG] Processed data for API:', processedData);

      // Date validation
      if (processedData.start_date && processedData.end_date) {
        const startDate = new Date(processedData.start_date + 'T00:00:00');
        const endDate = new Date(processedData.end_date + 'T00:00:00');
        
        if (startDate > endDate) {
          throw new Error('End date must be after start date');
        }
      }

      if (processedData.start_date && processedData.renewal_date) {
        const startDate = new Date(processedData.start_date + 'T00:00:00');
        const renewalDate = new Date(processedData.renewal_date + 'T00:00:00');
        
        if (startDate > renewalDate) {
          throw new Error('Renewal date must be after start date');
        }
      }

      // Use TanStack Query mutations instead of manual API calls
      if (editPolicy) {
        updatePolicyMutation.mutate({ id: editPolicy.id, data: processedData });
      } else {
        createPolicyMutation.mutate(processedData);
      }
      
    } catch (err) {
      console.error('❌ Form submission error:', err);
      const errorMessage = err.message || 'Failed to save policy';
      setActionError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Delete policy using TanStack Query mutation
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;
    
    deletePolicyMutation.mutate(id);
  };

  // Data aggregation using new utility functions with error handling
  let aggregateByType = {};
  let totals = { totalCoverage: 0, totalAnnualPremium: 0, totalMonthlyPremium: 0 };
  let detailedInsuranceBreakdown = [];
  let protectionMetrics = {};
  let newChartData = [];
  let newPieData = [];
  
  // Legacy format for existing UI compatibility
  let aggregateByTypeArray = [];
  let policyTypeCounts = [];
  let totalAnnualPremium = 0;
  let totalCoverage = 0;
  
  try {
    console.log('Insurance: Processing policies data...', policies);
    
    // Ensure policies is an array
    const validPolicies = Array.isArray(policies) ? policies : [];
    console.log('Insurance: Valid policies array length:', validPolicies.length);
    
    if (validPolicies.length > 0) {
      aggregateByType = aggregateInsuranceByType(validPolicies);
      console.log('Insurance: aggregateByType completed');
      
      totals = calculateInsuranceTotals(validPolicies);
      console.log('Insurance: totals completed');
      
      detailedInsuranceBreakdown = createDetailedInsuranceBreakdown(aggregateByType);
      console.log('Insurance: detailedBreakdown completed');
      
      protectionMetrics = calculateProtectionMetrics(validPolicies);
      console.log('Insurance: protectionMetrics completed');
      
      const chartResult = prepareInsuranceChartData(aggregateByType);
      newChartData = chartResult.chartData;
      newPieData = chartResult.pieData;
      console.log('Insurance: chart data completed');
      
      // Convert new format to legacy format for existing UI
      aggregateByTypeArray = Object.entries(aggregateByType)
        .filter(([category, data]) => data.count > 0)
        .map(([category, data]) => ({
          type: category,
          annualPremium: data.totalAnnualPremium,
          totalCoverage: data.totalCoverage
        }));
      
      // Create policy type counts for summary table
      policyTypeCounts = Object.entries(aggregateByType)
        .filter(([category, data]) => data.count > 0)
        .map(([category, data]) => ({
          type: category,
          count: data.count
        }));
      
      totalAnnualPremium = totals.totalAnnualPremium;
      totalCoverage = totals.totalCoverage;
      
    } else {
      // Create simple fallback chart data if no policies
      newChartData = [];
      newPieData = [];
      aggregateByTypeArray = [];
      policyTypeCounts = [];
      console.log('Insurance: No policies, using empty chart data');
    }
    
  } catch (error) {
    console.error('Insurance: Error in data processing:', error);
    console.error('Insurance: Error stack:', error.stack);
    // Fallback to empty data to prevent page crash
    aggregateByType = {};
    totals = { totalCoverage: 0, totalAnnualPremium: 0, totalMonthlyPremium: 0 };
    detailedInsuranceBreakdown = [];
    protectionMetrics = {};
    newChartData = [];
    newPieData = [];
    aggregateByTypeArray = [];
    policyTypeCounts = [];
    totalAnnualPremium = 0;
    totalCoverage = 0;
  }

  // Export handlers
  const handleExportToPDF = async () => {
    if (pdfExporting) return;

    try {
      console.log('Insurance: Starting PDF export...');
      setPdfExporting(true);

      // Get user settings
      const userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      const firstName = userSettings?.first_name || '';
      const lastName = userSettings?.last_name || '';
      const userName = firstName && lastName ? `${firstName} ${lastName}` : 
                     firstName || lastName || 'Insurance Portfolio Holder';

      // Get current currency
      const currency = localStorage.getItem('globalCurrency') || 'USD';

      // Prepare data for PDF export
      const pdfData = {
        userName,
        policies,
        aggregateByType,
        totals,
        detailedInsuranceBreakdown,
        protectionMetrics,
        currency,
        formatCurrency,
        formatDate,
        pieData: newPieData,
        chartData: newChartData
      };

      console.log('Insurance: PDF data prepared, calling export function...');
      await exportInsuranceToPDF(pdfData);
      toast.success('Insurance PDF report generated successfully!');
      
    } catch (error) {
      console.error('Error exporting insurance to PDF:', error);
      toast.error(error.message || 'Failed to generate PDF report. Please try again.');
    } finally {
      setPdfExporting(false);
    }
  };

  const handleExportToExcel = async () => {
    if (excelExporting) return;

    try {
      console.log('Insurance: Starting Excel export...');
      setExcelExporting(true);

      // Get user settings
      const userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      const firstName = userSettings?.first_name || '';
      const lastName = userSettings?.last_name || '';
      const userName = firstName && lastName ? `${firstName} ${lastName}` : 
                     firstName || lastName || 'Insurance Portfolio Holder';

      // Get current currency
      const currency = localStorage.getItem('globalCurrency') || 'USD';

      // Prepare data for Excel export
      const excelData = {
        userName,
        policies,
        aggregateByType: aggregateByTypeArray, // Use array format for Excel export
        totals,
        detailedInsuranceBreakdown,
        protectionMetrics,
        currency,
        formatCurrency,
        formatDate,
        pieData: newPieData,
        chartData: newChartData
      };

      console.log('Insurance: Excel data prepared, calling export function...');
      await exportInsuranceToExcel(excelData);
      toast.success('Insurance Excel report generated successfully!');
      
    } catch (error) {
      console.error('Error exporting insurance to Excel:', error);
      toast.error(error.message || 'Failed to generate Excel report. Please try again.');
    } finally {
      setExcelExporting(false);
    }
  };

  if (loading) {
    log('Insurance:loading', 'Still loading policies...');
    return <Loading pageName="Insurance" />;
  }

  log('Insurance:render', { 
    policiesCount: policies.length,
    loading,
    error: error?.message || null,
    pdfExporting,
    excelExporting
  });

  console.log('Insurance: About to render main component...', {
    policies: policies?.length || 0,
    error,
    loading
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Insurance Policies</h1>
        <div className="flex items-center gap-3">
          {/* PDF Download Button */}
          {policies.length > 0 && (
            <Button
              variant="secondary"
              onClick={handleExportToPDF}
              disabled={pdfExporting}
              title="Download complete insurance report as PDF"
            >
              {pdfExporting ? (
                <>
                  <svg className="w-4 h-4 animate-spin mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          )}

          {/* Excel Download Button */}
          {policies.length > 0 && (
            <Button
              variant="secondary"
              onClick={handleExportToExcel}
              disabled={excelExporting}
              title="Download complete insurance report as Excel spreadsheet"
            >
              {excelExporting ? (
                <>
                  <svg className="w-4 h-4 animate-spin mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Download Excel
                </>
              )}
            </Button>
          )}

          {/* Add Policy Button */}
          <Button
            onClick={() => openModal()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Policy
          </Button>
        </div>
      </div>

      {/* Error message if fetch fails */}
      {error && (
        <div className="text-red-600 mb-4">{error}</div>
      )}

      {/* If no error and no policies, show empty state */}
      {!error && policies.length === 0 && (
                <div className="bg-card rounded shadow p-6 flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold text-foreground mb-4">No Insurance Policies Found</h2>
          <p className="text-muted-foreground mb-4">Start by adding your first insurance policy.</p>
        </div>
      )}

      {/* If policies exist, show charts and table */}
      {policies.length > 0 && (
        <>
          {/* KPIs & Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <SafeSection debugId="Insurance:AnnualPremiumsChart">
              <div className="bg-card text-card-foreground rounded shadow p-4">
                <h2 className="font-semibold mb-2">Annual Premiums Overview</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={newChartData}>
                    <XAxis dataKey="name" stroke="currentColor" />
                    <YAxis stroke="currentColor" />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        color: 'hsl(var(--card-foreground))'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="premium" fill={getColor(0)} name="Annual Premium" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SafeSection>
            <SafeSection debugId="Insurance:PolicyTypeBreakdownChart">
              <div className="bg-card text-card-foreground rounded shadow p-4">
                <h2 className="font-semibold mb-2">Policy Type Breakdown</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={newPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {newPieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getColor(index)} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        color: 'hsl(var(--card-foreground))'
                      }} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </SafeSection>
          </div>

          {/* --- Aggregate KPIs by policy type: moved up for visibility --- */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Policy Aggregates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card text-card-foreground rounded shadow p-4 overflow-x-auto">
                <h3 className="font-semibold mb-2">Aggregate by Active Policy Type</h3>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-4">Policy Type</th>
                      <th className="text-left py-2 px-4">Annualized Premiums</th>
                      <th className="text-left py-2 px-4">Total Coverage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aggregateByTypeArray.map((row, idx) => (
                      <tr key={row.type} className="border-t border-border">
                        <td className="py-2 px-4">{row.type}</td>
                        <td className="py-2 px-4">{formatCurrency(row.annualPremium)}</td>
                        <td className="py-2 px-4">{formatCurrency(row.totalCoverage)}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-border font-bold">
                      <td className="py-2 px-4">Total</td>
                      <td className="py-2 px-4">{formatCurrency(totalAnnualPremium)}</td>
                      <td className="py-2 px-4">{formatCurrency(totalCoverage)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-card text-card-foreground rounded shadow p-4 overflow-x-auto">
                <h3 className="font-semibold mb-2">Policy Type Counts</h3>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-4">Policy Type</th>
                      <th className="text-left py-2 px-4">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policyTypeCounts.map(row => (
                      <tr key={row.type} className="border-t">
                        <td className="py-2 px-4">{row.type}</td>
                        <td className="py-2 px-4">{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Policies Table & Actions */}
          <div className="bg-card text-card-foreground rounded shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">All Policies</h2>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => openModal()}
              >
                Add Policy
              </button>
            </div>
            {actionError && <div className="text-red-600 mb-2">{actionError}</div>}
            <table className="min-w-full text-sm" aria-label="Insurance Policies Table">
              <thead>
                <tr>
                  <th className="text-left py-2 px-4">Policy Name</th>
                  <th className="text-left py-2 px-4">Policy Number</th>
                  <th className="text-left py-2 px-4">Type</th>
                  <th className="text-left py-2 px-4">Premium</th>
                  <th className="text-left py-2 px-4">Frequency</th>
                  <th className="text-left py-2 px-4">Coverage</th>
                  <th className="text-left py-2 px-4">Duration</th>
                  <th className="text-left py-2 px-4">Status</th>
                  <th className="text-left py-2 px-4">Start Date</th>
                  <th className="text-left py-2 px-4">End Date</th>
                  <th className="text-left py-2 px-4">Next Renewal</th>
                   <th className="text-left py-2 px-4">Last Modified</th>
                  <th className="text-left py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((p, idx) => {
                  // Responsive policy number: show only last 5 chars prefixed by *** on small screens
                  let displayPolicyNumber = p.policy_number || '-';
                  if (typeof window !== 'undefined' && window.innerWidth < 900 && displayPolicyNumber.length > 5) {
                    displayPolicyNumber = '***' + displayPolicyNumber.slice(-5);
                  }
                  return (
                    <tr key={p.id || idx} className="border-t">
                      <td className="py-2 px-4">{p.policy_name || 'Policy'}</td>
                      <td className="py-2 px-4">{displayPolicyNumber}</td>
                      <td className="py-2 px-4 capitalize">{p.policy_type || '-'}</td>
                      <td className="py-2 px-4">{formatCurrency(p.premium_amount)}</td>
                      <td className="py-2 px-4 capitalize">{p.premium_frequency || '-'}</td>
                      <td className="py-2 px-4">{formatCurrency(p.coverage_amount)}</td>
                      <td className="py-2 px-4">{getCoverageDuration(p.start_date, p.end_date)}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          p.status === 'active' ? 'bg-green-100 text-green-800' :
                          p.status === 'expired' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {p.status || 'active'}
                        </span>
                      </td>
                      <td className="py-2 px-4">{formatDate(p.start_date)}</td>
                      <td className="py-2 px-4">{formatDate(p.end_date)}</td>
                      <td className="py-2 px-4">{getNextRenewalDate(p.renewal_date)}</td>
                       <td className="py-2 px-4">{p.modified_at ? formatDate(p.modified_at) : '-'}</td>
                      <td className="py-2 px-4">
                        <button
                          className="text-blue-600 hover:underline mr-2"
                          onClick={() => openModal(p)}
                          aria-label={`Edit policy ${p.policy_name || 'Policy'}`}
                        >Edit</button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => handleDelete(p.id)}
                          disabled={actionLoading}
                          aria-label={`Delete policy ${p.policy_name || 'Policy'}`}
                        >Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          tabIndex={-1}
          onKeyDown={e => {
            if (e.key === 'Escape') closeModal();
          }}
        >
          <div
            className="bg-card text-card-foreground rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
            ref={modalRef}
            tabIndex={0}
            aria-label={editPolicy ? 'Edit Policy Modal' : 'Add Policy Modal'}
          >
            <div className="sticky top-0 bg-card text-card-foreground border-b border-border p-6 pb-4">
              <button
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                onClick={closeModal}
                aria-label="Close"
              >✕</button>
              <h2 className="font-semibold text-lg" id="modal-title">{editPolicy ? 'Edit Policy' : 'Add Policy'}</h2>
            </div>
            <div className="p-6 pt-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium" htmlFor="policy_name">Policy Name</label>
                    <input
                      id="policy_name"
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('policy_name', { required: 'Policy name is required' })}
                      disabled={actionLoading}
                      aria-required="true"
                    />
                    {errors.policy_name && <span className="text-red-600 text-xs">{errors.policy_name.message}</span>}
                  </div>
                  <div>
                    <label className="block mb-1 font-medium" htmlFor="policy_type">Policy Type</label>
                    <select
                      id="policy_type"
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('policy_type', { required: 'Policy type is required' })}
                      disabled={actionLoading}
                      aria-required="true"
                    >
                      <option value="">Select Type</option>
                      <option value="life">Life Insurance</option>
                      <option value="health">Health Insurance</option>
                      <option value="auto">Auto Insurance</option>
                      <option value="home">Home Insurance</option>
                      <option value="loan">Loan Insurance</option>
                      <option value="travel">Travel Insurance</option>
                      <option value="asset">Asset Insurance</option>
                      <option value="factory">Factory Insurance</option>
                      <option value="fire">Fire Insurance</option>
                    </select>
                    {errors.policy_type && <span className="text-red-600 text-xs">{errors.policy_type.message}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium" htmlFor="provider">Provider</label>
                    <input
                      id="provider"
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('provider')}
                      disabled={actionLoading}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium" htmlFor="policy_number">Policy Number</label>
                    <input
                      id="policy_number"
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('policy_number')}
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium" htmlFor="status">Status</label>
                    <select
                      id="status"
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('status')}
                      disabled={actionLoading}
                    >
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium" htmlFor="premium_frequency">Premium Frequency</label>
                    <select
                      id="premium_frequency"
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('premium_frequency')}
                      disabled={actionLoading}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium" htmlFor="coverage_amount">Coverage Amount ($)</label>
                    <input
                      id="coverage_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('coverage_amount', {
                        required: 'Coverage amount is required',
                        min: { value: 0, message: 'Amount must be positive' },
                        valueAsNumber: true
                      })}
                      disabled={actionLoading}
                      aria-required="true"
                    />
                    {errors.coverage_amount && <span className="text-red-600 text-xs">{errors.coverage_amount.message}</span>}
                  </div>
                  <div>
                    <label className="block mb-1 font-medium" htmlFor="premium_amount">Premium Amount ($)</label>
                    <input
                      id="premium_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('premium_amount', {
                        min: { value: 0, message: 'Amount must be positive' },
                        valueAsNumber: true
                      })}
                      disabled={actionLoading}
                    />
                    {errors.premium_amount && <span className="text-red-600 text-xs">{errors.premium_amount.message}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium" htmlFor="start_date">Start Date</label>
                    <input
                      id="start_date"
                      type="text"
                      placeholder="YYYY-MM-DD"
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('start_date', {
                        validate: value => {
                          if (!value) return true;
                          return /^\d{4}-\d{2}-\d{2}$/.test(value) || 'Date must be in YYYY-MM-DD format';
                        }
                      })}
                      disabled={actionLoading}
                      autoComplete="off"
                    />
                    {errors.start_date && <span className="text-red-600 text-xs">{errors.start_date.message}</span>}
                  </div>
                  <div>
                    <label className="block mb-1 font-medium" htmlFor="end_date">End Date</label>
                    <input
                      id="end_date"
                      type="text"
                      placeholder="YYYY-MM-DD"
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('end_date', {
                        validate: value => {
                          if (!value) return true;
                          return /^\d{4}-\d{2}-\d{2}$/.test(value) || 'Date must be in YYYY-MM-DD format';
                        }
                      })}
                      disabled={actionLoading}
                      autoComplete="off"
                    />
                    {errors.end_date && <span className="text-red-600 text-xs">{errors.end_date.message}</span>}
                  </div>
                  <div>
                    <label className="block mb-1 font-medium" htmlFor="renewal_date">Renewal Date</label>
                    <input
                      id="renewal_date"
                      type="text"
                      placeholder="YYYY-MM-DD"
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('renewal_date', {
                        validate: value => {
                          if (!value) return true;
                          return /^\d{4}-\d{2}-\d{2}$/.test(value) || 'Date must be in YYYY-MM-DD format';
                        }
                      })}
                      disabled={actionLoading}
                      autoComplete="off"
                    />
                    {errors.renewal_date && <span className="text-red-600 text-xs">{errors.renewal_date.message}</span>}
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium" htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    rows="3"
                    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('notes')}
                    disabled={actionLoading}
                  />
                </div>

                {actionError && <div className="text-destructive bg-destructive/10 p-3 rounded">{actionError}</div>}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="border border-input text-foreground px-4 py-2 rounded hover:bg-accent hover:text-accent-foreground"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={actionLoading}
                    aria-disabled={actionLoading}
                  >
                    {actionLoading ? 'Saving...' : (editPolicy ? 'Update Policy' : 'Add Policy')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insurance;