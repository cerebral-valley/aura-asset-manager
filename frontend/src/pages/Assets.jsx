import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { assetsService } from '../services/assets';
import { transactionsService } from '../services/transactions';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import { assetTypes, getAggregationCategories, getCategoryForAssetType, getAssetTypeLabel, getAllAssetTypes } from '../constants/assetTypes';
import AnnuityManager from '../components/assets/AnnuityManager';
import ConfirmationDialog from '../components/ui/confirmation-dialog';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#888888'];

const Assets = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const modalRef = useRef(null);

  // Sorting and filtering states
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [nameFilter, setNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');

  // Projection and visualization states
  const [projectionTimeframe, setProjectionTimeframe] = useState(5); // Default 5 years
  const [projectionGrowthRate, setProjectionGrowthRate] = useState(7); // Default 7% annual growth
  const [showProjections, setShowProjections] = useState(false);
  const { isDark } = useTheme();
  const [showTimeline, setShowTimeline] = useState(true);
  const [expandedAsset, setExpandedAsset] = useState(null); // For showing annuity manager
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    asset: null,
    onConfirm: null
  });

  // Global preferences trigger for re-renders
  const [globalPreferencesVersion, setGlobalPreferencesVersion] = useState(0);

  const fetchAssets = () => {
    setLoading(true);
    
    // Fetch both assets and transactions
    Promise.all([
      assetsService.getAssets(),
      transactionsService.getTransactions()
    ])
      .then(([assetsData, transactionsData]) => {
        setAssets(assetsData);
        setTransactions(transactionsData);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Error fetching assets or transactions:', err);
        setError('Failed to fetch data');
        setLoading(false);
        toast.error('Failed to fetch data');
      });
  };

  useEffect(() => {
    fetchAssets();
  }, []);

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

  // Currency formatter for charts (no decimals)
  const formatChartCurrency = (amount) => {
    if (!amount || amount === 0 || amount === '0' || amount === '') return '$0';

    // Convert string to number if needed
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount) || numAmount === 0) return '$0';

    // Get global currency preference
    const globalCurrency = localStorage.getItem('globalCurrency') || 'USD';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: globalCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  };

  // Projection calculation functions
  const calculateProjectedValue = (currentValue, years, annualGrowthRate) => {
    return currentValue * Math.pow(1 + (annualGrowthRate / 100), years);
  };

  const generateProjectionData = () => {
    if (!chartData || chartData.length === 0) return [];
    
    const projectionData = [];
    const currentYear = new Date().getFullYear();
    const currentValue = totalPresentValue;
    
    // Add current year as the starting point for projections
    projectionData.push({
      year: currentYear,
      projectedValue: currentValue // Starting point for projection line
    });
    
    // Generate future projections
    for (let i = 1; i <= projectionTimeframe; i++) {
      projectionData.push({
        year: currentYear + i,
        projectedValue: calculateProjectedValue(currentValue, i, projectionGrowthRate)
      });
    }
    return projectionData;
  };

  // Enhanced chart data with projections
  const getEnhancedChartData = () => {
    if (!showProjections) return chartData;
    
    const baseData = [...chartData];
    const projections = generateProjectionData();
    
    // Merge projection data with existing chart data
    projections.forEach(projection => {
      const existingIndex = baseData.findIndex(item => item.year === projection.year);
      if (existingIndex >= 0) {
        baseData[existingIndex] = { ...baseData[existingIndex], ...projection };
      } else {
        baseData.push(projection);
      }
    });
    
    return baseData.sort((a, b) => a.year - b.year);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
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

  // Filter out sold assets (but be permissive with null/undefined quantities)
  const activeAssets = assets.filter(asset => {
    const quantity = asset.quantity;
    const status = asset.asset_metadata?.status || 'active';
    
    // Consider asset active if:
    // 1. Status is not 'sold'
    // 2. AND (quantity is null/undefined OR quantity > 0)
    const isActive = status !== 'sold' && (quantity === null || quantity === undefined || Number(quantity) > 0);
    
    return isActive;
  });

  console.log('🔍 Active assets count:', activeAssets.length);

  // Asset category definitions using shared classification
  const AGGREGATION_CATEGORIES = getAggregationCategories();

  // Helper function to get the latest value from transactions
  const getLatestTransactionValue = (asset, valueType = 'current_value') => {
    // Get all transactions for this asset
    const assetTransactions = transactions.filter(t => t.asset_id === asset.id);
    
    if (assetTransactions.length === 0) {
      // Fallback to asset's static values
      return valueType === 'current_value' 
        ? (Number(asset.current_value) || Number(asset.initial_value) || 0)
        : (Number(asset.initial_value) || 0);
    }
    
    // Sort transactions by date (most recent first)
    const sortedTransactions = assetTransactions.sort((a, b) => 
      new Date(b.transaction_date) - new Date(a.transaction_date)
    );
    
    if (valueType === 'current_value') {
      // Look for the latest market value update transaction
      const marketValueTransaction = sortedTransactions.find(t => 
        t.transaction_type === 'update_market_value' && t.amount != null
      );
      
      if (marketValueTransaction) {
        return Number(marketValueTransaction.amount) || 0;
      }
      
      // If no market value update, look for transactions with current_value
      const currentValueTransaction = sortedTransactions.find(t => 
        t.current_value != null && t.current_value > 0
      );
      
      if (currentValueTransaction) {
        return Number(currentValueTransaction.current_value) || 0;
      }
    } else if (valueType === 'acquisition_value') {
      // Look for the latest acquisition value update transaction
      const acquisitionTransaction = sortedTransactions.find(t => 
        t.transaction_type === 'update_acquisition_value' && t.amount != null
      );
      
      if (acquisitionTransaction) {
        return Number(acquisitionTransaction.amount) || 0;
      }
      
      // If no acquisition value update, look for transactions with acquisition_value
      const acquisitionValueTransaction = sortedTransactions.find(t => 
        t.acquisition_value != null && t.acquisition_value > 0
      );
      
      if (acquisitionValueTransaction) {
        return Number(acquisitionValueTransaction.acquisition_value) || 0;
      }
    }
    
    // Final fallback to asset's static values
    return valueType === 'current_value' 
      ? (Number(asset.current_value) || Number(asset.initial_value) || 0)
      : (Number(asset.initial_value) || 0);
  };

  // Get latest acquisition value (current_value if available, else initial_value)
  const getLatestValue = (asset) => {
    return getLatestTransactionValue(asset, 'current_value');
  };

  const getPresentValue = (asset) => {
    return getLatestTransactionValue(asset, 'current_value');
  };

  const getAcquisitionValue = (asset) => {
    return getLatestTransactionValue(asset, 'acquisition_value');
  };

  // Use all assets for debugging if no active assets found
  const assetsToProcess = activeAssets.length > 0 ? activeAssets : assets;

  // Helper function to format percentage
  const formatPercentage = (value, total) => {
    if (!total || total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  // Sorting function
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort assets for the table
  const filteredAndSortedAssets = useMemo(() => {
    let filtered = [...assetsToProcess];

    // Apply filters
    if (nameFilter) {
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (typeFilter) {
      filtered = filtered.filter(asset => 
        asset.asset_type.toLowerCase().includes(typeFilter.toLowerCase())
      );
    }

    if (dateFromFilter) {
      filtered = filtered.filter(asset => 
        new Date(asset.purchase_date) >= new Date(dateFromFilter)
      );
    }

    if (dateToFilter) {
      filtered = filtered.filter(asset => 
        new Date(asset.purchase_date) <= new Date(dateToFilter)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'type':
          aValue = a.asset_type || '';
          bValue = b.asset_type || '';
          break;
        case 'acquisition_value':
          aValue = getAcquisitionValue(a);
          bValue = getAcquisitionValue(b);
          break;
        case 'present_value':
          aValue = getPresentValue(a);
          bValue = getPresentValue(b);
          break;
        case 'quantity':
          aValue = Number(a.quantity) || 0;
          bValue = Number(b.quantity) || 0;
          break;
        case 'purchase_date':
          aValue = new Date(a.purchase_date || 0);
          bValue = new Date(b.purchase_date || 0);
          break;
        case 'share_percentage':
          aValue = getPresentValue(a);
          bValue = getPresentValue(b);
          break;
        default:
          aValue = a.name || '';
          bValue = b.name || '';
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [assetsToProcess, nameFilter, typeFilter, dateFromFilter, dateToFilter, sortField, sortDirection]);

  // Calculate totals for the filtered assets
  const filteredTotalAcquisition = filteredAndSortedAssets.reduce((sum, asset) => sum + getAcquisitionValue(asset), 0);
  const filteredTotalPresent = filteredAndSortedAssets.reduce((sum, asset) => sum + getPresentValue(asset), 0);

  // Helper function to match asset types to categories
  const matchesAssetCategory = (assetType, categoryConfig) => {
    if (!assetType) return false;
    return categoryConfig.assetTypes.includes(assetType.toLowerCase().trim());
  };

  // Aggregate by asset category for assets to process
  const aggregateByType = AGGREGATION_CATEGORIES.map(({ key, label, assetTypes: categoryAssetTypes }) => {
    let totalAcquisitionValue = 0;
    let totalPresentValue = 0;
    let count = 0;
    let totalQuantity = 0;
    let unit = '-';

    assetsToProcess.forEach(asset => {
      const assetType = (asset.asset_type || '').trim();
      const assetTypeMatch = matchesAssetCategory(assetType, { assetTypes: categoryAssetTypes });
      
      if (assetTypeMatch) {
        const acquisitionValue = getAcquisitionValue(asset);
        const presentValue = getPresentValue(asset);
        const quantity = Number(asset.quantity) || 0;
        
        totalAcquisitionValue += acquisitionValue;
        totalPresentValue += presentValue;
        count += 1;
        totalQuantity += quantity;
        
        if (asset.unit_of_measure && unit === '-') {
          unit = asset.unit_of_measure;
        }
      }
    });

    // Special formatting for different asset types
    let displayValue = '-';
    if (key === 'real_estate') {
      displayValue = count > 0 ? `${count}` : '-';
    } else if (key === 'crypto' && unit && unit.toLowerCase().includes('btc')) {
      displayValue = totalQuantity > 0 ? `${totalQuantity.toFixed(8)}` : '-';
    } else if (key === 'gold' && unit && unit.toLowerCase().includes('gram')) {
      displayValue = totalQuantity > 0 ? `${totalQuantity.toFixed(2)}` : '-';
    } else if ((key === 'stock' || key === 'bond') && totalPresentValue > 0) {
      displayValue = formatCurrency(totalPresentValue);
    } else if (count === 0) {
      displayValue = '-';
    } else {
      displayValue = `${count}`;
    }

    return { 
      type: label, 
      acquisitionValue: totalAcquisitionValue,
      presentValue: totalPresentValue,
      count,
      displayValue
    };
  });

  // Total values
  const totalAcquisitionValue = aggregateByType.reduce((sum, t) => sum + t.acquisitionValue, 0);
  const totalPresentValue = aggregateByType.reduce((sum, t) => sum + t.presentValue, 0);

  // Asset type counts
  const assetTypeCounts = AGGREGATION_CATEGORIES.map(({ key, label, assetTypes: categoryAssetTypes }) => {
    const count = assetsToProcess.filter(asset => matchesAssetCategory(asset.asset_type, { assetTypes: categoryAssetTypes })).length;
    return { type: label, count };
  });

  // Detailed asset breakdown by specific asset types
  const detailedAssetBreakdown = getAllAssetTypes().map(assetType => {
    const matchingAssets = assetsToProcess.filter(asset => asset.asset_type === assetType.value);
    
    if (matchingAssets.length === 0) return null;

    const totalAcquisitionValue = matchingAssets.reduce((sum, asset) => sum + getAcquisitionValue(asset), 0);
    const totalPresentValue = matchingAssets.reduce((sum, asset) => sum + getPresentValue(asset), 0);
    const totalQuantity = matchingAssets.reduce((sum, asset) => sum + (parseFloat(asset.quantity) || 0), 0);

    return {
      assetType: assetType.label,
      category: assetType.category,
      acquisitionValue: totalAcquisitionValue,
      presentValue: totalPresentValue,
      quantity: totalQuantity,
      count: matchingAssets.length,
      acquisitionPercentage: totalAcquisitionValue,
      presentPercentage: totalPresentValue
    };
  }).filter(Boolean); // Remove null entries

  // Calculate percentages for detailed breakdown
  const detailedTotalAcquisition = detailedAssetBreakdown.reduce((sum, item) => sum + item.acquisitionValue, 0);
  const detailedTotalPresent = detailedAssetBreakdown.reduce((sum, item) => sum + item.presentValue, 0);
  
  detailedAssetBreakdown.forEach(item => {
    item.acquisitionPercentage = detailedTotalAcquisition > 0 ? (item.acquisitionValue / detailedTotalAcquisition * 100) : 0;
    item.presentPercentage = detailedTotalPresent > 0 ? (item.presentValue / detailedTotalPresent * 100) : 0;
  });

  // Pie chart data for asset distribution (by current value)
  const pieData = aggregateByType
    .filter(item => item.presentValue > 0)
    .map(item => ({
      name: item.type,
      value: item.presentValue
    }));

  // Value over time chart data (simplified - using purchase dates)
  const valueOverTimeData = activeAssets
    .filter(asset => asset.purchase_date && (getAcquisitionValue(asset) > 0 || getPresentValue(asset) > 0))
    .map(asset => ({
      date: asset.purchase_date,
      year: new Date(asset.purchase_date).getFullYear(),
      acquisitionValue: getAcquisitionValue(asset),
      presentValue: getPresentValue(asset),
      name: asset.name
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Group by year for chart
  const yearlyData = valueOverTimeData.reduce((acc, asset) => {
    const year = asset.year;
    if (!acc[year]) {
      acc[year] = { year, acquisitionValue: 0, presentValue: 0 };
    }
    acc[year].acquisitionValue += asset.acquisitionValue;
    acc[year].presentValue += asset.presentValue;
    return acc;
  }, {});

  const chartData = Object.values(yearlyData).sort((a, b) => a.year - b.year);

  // Form setup
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Open modal for add/edit
  const openModal = (asset = null) => {
    setEditAsset(asset);
    setActionError(null);
    setModalOpen(true);
    
    setTimeout(() => {
      if (modalRef.current) {
        modalRef.current.focus();
      }
    }, 100);
    
    if (asset) {
      reset({
        name: asset.name || '',
        asset_type: asset.asset_type || '',
        description: asset.description || '',
        purchase_date: asset.purchase_date || '',
        initial_value: asset.initial_value || '',
        current_value: asset.current_value || '',
        quantity: asset.quantity || '',
        unit_of_measure: asset.unit_of_measure || '',
      });
    } else {
      reset({
        name: '',
        asset_type: '',
        description: '',
        purchase_date: '',
        initial_value: '',
        current_value: '',
        quantity: '',
        unit_of_measure: '',
      });
    }
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditAsset(null);
    setActionError(null);
    reset();
  };

  // Add or update asset
  const onSubmit = async (data) => {
    setActionLoading(true);
    setActionError(null);

    try {
      let result;
      if (editAsset) {
        result = await assetsService.updateAsset(editAsset.id, data);
        toast.success('Asset updated successfully');
      } else {
        result = await assetsService.createAsset(data);
        toast.success('Asset added successfully');
      }
      
      closeModal();
      fetchAssets();
      
    } catch (err) {
      console.error('❌ Form submission error:', err);
      const errorMessage = err.message || 'Failed to save asset';
      setActionError(errorMessage);
      toast.error(errorMessage);
    }
    
    setActionLoading(false);
  };

  // Delete asset with confirmation
  const handleDelete = async (asset) => {
    setConfirmDialog({
      isOpen: true,
      asset: asset,
      onConfirm: () => confirmDeleteAsset(asset.id)
    });
  };

  const confirmDeleteAsset = async (id) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const response = await assetsService.deleteAsset(id);
      fetchAssets();
      
      // Show detailed success message
      const message = response.transactions_deleted > 0 
        ? `Asset "${response.asset_name}" and ${response.transactions_deleted} related transactions deleted successfully`
        : `Asset "${response.asset_name}" deleted successfully`;
      
      toast.success(message);
      setConfirmDialog({ isOpen: false, asset: null, onConfirm: null });
    } catch (err) {
      setActionError('Failed to delete asset');
      toast.error('Failed to delete asset: ' + (err.response?.data?.detail || err.message));
    }
    setActionLoading(false);
  };

  if (loading) return <div>Loading assets...</div>;

  return (
    <div className={`p-6 min-h-screen ${isDark ? 'bg-black text-neutral-100' : 'bg-gray-50'}`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Assets</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
          onClick={() => navigate('/transactions')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Transaction
        </button>
      </div>

      {/* Error message if fetch fails */}
      {error && (
        <div className="text-red-600 mb-4">{error}</div>
      )}

      {/* If no error and no assets, show empty state */}
      {!error && activeAssets.length === 0 && (
        <div className={`${isDark ? 'bg-neutral-900 text-neutral-100' : 'bg-white'} rounded shadow p-6 flex flex-col items-center justify-center`}>
          <h2 className="font-semibold mb-2">No assets found</h2>
          <p className="mb-4 text-neutral-400">You have not added any assets yet. Click "New Transaction" above to create your first asset.</p>
        </div>
      )}

      {/* If assets exist, show charts and table */}
      {activeAssets.length > 0 && (
        <>
          {/* Control Panel */}
          <div className={`${isDark ? 'bg-neutral-900 text-neutral-100' : 'bg-white'} rounded shadow p-4 mb-6`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold">Dashboard Controls</h3>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Projection Controls */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Projections:</label>
                  <button
                    onClick={() => setShowProjections(!showProjections)}
                    className={`px-3 py-1 rounded text-sm ${showProjections 
                      ? 'bg-blue-500 text-white' 
                      : isDark ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {showProjections ? 'Hide' : 'Show'}
                  </button>
                </div>

                {showProjections && (
                  <>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Years:</label>
                      <select
                        value={projectionTimeframe}
                        onChange={(e) => setProjectionTimeframe(Number(e.target.value))}
                        className={`px-2 py-1 rounded border text-sm ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-300'}`}
                      >
                        <option value={1}>1 Year</option>
                        <option value={3}>3 Years</option>
                        <option value={5}>5 Years</option>
                        <option value={10}>10 Years</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Growth %:</label>
                      <input
                        type="number"
                        value={projectionGrowthRate}
                        onChange={(e) => setProjectionGrowthRate(Number(e.target.value))}
                        className={`w-16 px-2 py-1 rounded border text-sm ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-300'}`}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8`}>
            {/* Asset Value Over Time */}
            <div className={`${isDark ? 'bg-neutral-900 text-neutral-100' : 'bg-white'} rounded shadow p-4`}>
              <h2 className="font-semibold mb-2">Asset Value Over Time</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={getEnhancedChartData()}>
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={formatChartCurrency} />
                  <Tooltip formatter={(value) => formatChartCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="acquisitionValue" stroke="#8884d8" name="Acquisition Value" />
                  <Line type="monotone" dataKey="presentValue" stroke="#82ca9d" name="Present Value" />
                  {showProjections && (
                    <Line 
                      type="monotone" 
                      dataKey="projectedValue" 
                      stroke="#ff7300" 
                      strokeDasharray="5 5"
                      name="Projected Value" 
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Asset Distribution */}
            <div className={`${isDark ? 'bg-neutral-900 text-neutral-100' : 'bg-white'} rounded shadow p-4`}>
              <h2 className="font-semibold mb-2">Asset Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie 
                    data={pieData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    label={({ value, percent }) => `${formatChartCurrency(value)} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatChartCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Asset Timeline */}
            <div className={`${isDark ? 'bg-neutral-900 text-neutral-100' : 'bg-white'} rounded shadow p-4`}>
              <h2 className="font-semibold mb-2">Asset Timeline</h2>
              <div className="h-64 overflow-y-auto pr-2">
                {activeAssets
                  .filter(asset => asset.purchase_date)
                  .sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date))
                  .map((asset, index) => (
                    <div key={asset.id || index} className="relative flex items-start mb-4 last:mb-0">
                      {/* Timeline line */}
                      <div className="flex flex-col items-center mr-4">
                        <div className={`w-3 h-3 rounded-full ${
                          index % 4 === 0 ? 'bg-blue-500' :
                          index % 4 === 1 ? 'bg-green-500' :
                          index % 4 === 2 ? 'bg-purple-500' : 'bg-orange-500'
                        }`}></div>
                        {index < activeAssets.filter(a => a.purchase_date).length - 1 && (
                          <div className={`w-0.5 h-8 ${isDark ? 'bg-gray-600' : 'bg-gray-300'} mt-1`}></div>
                        )}
                      </div>
                      
                      {/* Timeline content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{asset.name}</p>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {formatDate(asset.purchase_date)}
                          </span>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} capitalize`}>
                          {getAssetTypeLabel(asset.asset_type)}
                        </p>
                        <p className="text-sm font-semibold text-green-600">
                          {formatChartCurrency(getPresentValue(asset))}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Asset Aggregates */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Asset Aggregates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded shadow p-4 overflow-x-auto`}>
                <h3 className="font-semibold mb-2">Aggregate by Asset Type</h3>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className={isDark ? 'border-gray-600' : ''}>
                      <th className="text-left py-2 px-4">Asset Type</th>
                      <th className="text-left py-2 px-4">Latest Acquisition Value</th>
                      <th className="text-left py-2 px-4">% Share (Acq)</th>
                      <th className="text-left py-2 px-4">Latest Market Value</th>
                      <th className="text-left py-2 px-4">% Share (Market)</th>
                      <th className="text-left py-2 px-4">Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aggregateByType.map((row, idx) => (
                      <tr key={row.type} className={`border-t ${isDark ? 'border-gray-600' : ''}`}>
                        <td className="py-2 px-4">{row.type}</td>
                        <td className="py-2 px-4">{formatCurrency(row.acquisitionValue)}</td>
                        <td className="py-2 px-4">{formatPercentage(row.acquisitionValue, totalAcquisitionValue)}</td>
                        <td className="py-2 px-4">{formatCurrency(row.presentValue)}</td>
                        <td className="py-2 px-4">{formatPercentage(row.presentValue, totalPresentValue)}</td>
                        <td className="py-2 px-4">{row.displayValue}</td>
                      </tr>
                    ))}
                    <tr className={`border-t font-bold ${isDark ? 'border-gray-600' : ''}`}>
                      <td className="py-2 px-4">Total</td>
                      <td className="py-2 px-4">{formatCurrency(totalAcquisitionValue)}</td>
                      <td className="py-2 px-4">100%</td>
                      <td className="py-2 px-4">{formatCurrency(totalPresentValue)}</td>
                      <td className="py-2 px-4">100%</td>
                      <td className="py-2 px-4">{activeAssets.length}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded shadow p-4 overflow-x-auto`}>
                <h3 className="font-semibold mb-2">Detailed Asset Breakdown</h3>
                <div className="max-h-80 overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 bg-inherit">
                      <tr className={`${isDark ? 'border-gray-600' : 'border-gray-200'} border-b`}>
                        <th className="text-left py-2 px-4 font-medium">Asset Type</th>
                        <th className="text-left py-2 px-4 font-medium">Invested Value</th>
                        <th className="text-left py-2 px-4 font-medium">Present Value</th>
                        <th className="text-left py-2 px-4 font-medium">Count</th>
                        <th className="text-left py-2 px-4 font-medium">% Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailedAssetBreakdown.map((item, idx) => (
                        <tr key={item.assetType} className={`border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                          <td className="py-2 px-4">
                            <div>
                              <div className="font-medium">{item.assetType}</div>
                              <div className={`text-xs ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>{item.category}</div>
                            </div>
                          </td>
                          <td className="py-2 px-4">{formatCurrency(item.acquisitionValue)}</td>
                          <td className="py-2 px-4">{formatCurrency(item.presentValue)}</td>
                          <td className="py-2 px-4">{item.count}</td>
                          <td className="py-2 px-4">{item.presentPercentage.toFixed(1)}%</td>
                        </tr>
                      ))}
                      <tr className={`border-t-2 font-bold ${isDark ? 'border-neutral-700 bg-neutral-950' : 'border-gray-300 bg-gray-50'}`}>
                        <td className="py-2 px-4">Total</td>
                        <td className="py-2 px-4">{formatCurrency(detailedTotalAcquisition)}</td>
                        <td className="py-2 px-4">{formatCurrency(detailedTotalPresent)}</td>
                        <td className="py-2 px-4">{detailedAssetBreakdown.reduce((sum, item) => sum + item.count, 0)}</td>
                        <td className="py-2 px-4">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Assets Table */}
          <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded shadow p-4`}>
            <div className="mb-4">
              <h2 className="font-semibold mb-3">All Assets</h2>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Filter by Name</label>
                  <input
                    type="text"
                    placeholder="Search asset name..."
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-100 placeholder-neutral-400' : 'bg-white border-gray-300'
                    }`}
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Filter by Type</label>
                  <input
                    type="text"
                    placeholder="Search asset type..."
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-100 placeholder-neutral-400' : 'bg-white border-gray-300'
                    }`}
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date From</label>
                  <input
                    type="date"
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-100' : 'bg-white border-gray-300'
                    }`}
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date To</label>
                  <input
                    type="date"
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-100' : 'bg-white border-gray-300'
                    }`}
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {actionError && <div className="text-red-600 mb-2">{actionError}</div>}
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm" aria-label="Assets Table">
                <thead>
                  <tr>
                    <th className={`text-left py-2 px-4 cursor-pointer ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`} onClick={() => handleSort('name')}>
                      Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className={`text-left py-2 px-4 cursor-pointer ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`} onClick={() => handleSort('type')}>
                      Type {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className={`text-left py-2 px-4 cursor-pointer ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`} onClick={() => handleSort('acquisition_value')}>
                      Acquisition Value {sortField === 'acquisition_value' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className={`text-left py-2 px-4 cursor-pointer ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`} onClick={() => handleSort('present_value')}>
                      Present Value {sortField === 'present_value' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className={`text-left py-2 px-4 cursor-pointer ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`} onClick={() => handleSort('quantity')}>
                      Quantity {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left py-2 px-4">Unit</th>
                    <th className={`text-left py-2 px-4 cursor-pointer ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`} onClick={() => handleSort('purchase_date')}>
                      Purchase Date {sortField === 'purchase_date' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left py-2 px-4">Notes</th>
                    <th className={`text-left py-2 px-4 cursor-pointer ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`} onClick={() => handleSort('share_percentage')}>
                      % Share {sortField === 'share_percentage' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedAssets.map((asset, idx) => (
                    <React.Fragment key={asset.id || idx}>
                      <tr className={`border-t ${isDark ? 'border-gray-600' : ''}`}>
                        <td className="py-2 px-4">{asset.name || 'Asset'}</td>
                        <td className="py-2 px-4">{getAssetTypeLabel(asset.asset_type)}</td>
                        <td className="py-2 px-4">{formatCurrency(getAcquisitionValue(asset))}</td>
                        <td className="py-2 px-4">{formatCurrency(getPresentValue(asset))}</td>
                        <td className="py-2 px-4">{asset.quantity || '-'}</td>
                        <td className="py-2 px-4">{asset.unit_of_measure || '-'}</td>
                        <td className="py-2 px-4">{formatDate(asset.purchase_date)}</td>
                        <td className="py-2 px-4">{asset.description || '-'}</td>
                        <td className="py-2 px-4">{formatPercentage(getPresentValue(asset), filteredTotalPresent)}</td>
                      </tr>
                      {expandedAsset === asset.id && (asset.asset_type?.includes('annuity') || asset.has_payment_schedule) && (
                        <tr>
                          <td colSpan="9" className="py-4 px-4 bg-gray-50">
                            <AnnuityManager 
                              asset={asset} 
                              onUpdate={fetchAssets}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  <tr className={`border-t-2 font-bold ${isDark ? 'bg-neutral-950 text-neutral-100' : 'bg-gray-50'}`}>
                    <td className="py-2 px-4">Total</td>
                    <td className="py-2 px-4">-</td>
                    <td className="py-2 px-4">{formatCurrency(filteredTotalAcquisition)}</td>
                    <td className="py-2 px-4">{formatCurrency(filteredTotalPresent)}</td>
                    <td className="py-2 px-4">-</td>
                    <td className="py-2 px-4">-</td>
                    <td className="py-2 px-4">-</td>
                    <td className="py-2 px-4">{filteredAndSortedAssets.length} assets</td>
                    <td className="py-2 px-4">100%</td>
                    <td className="py-2 px-4">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
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
            className="bg-white rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
            ref={modalRef}
            tabIndex={0}
            aria-label={editAsset ? 'Edit Asset Modal' : 'Add Asset Modal'}
          >
            <div className="sticky top-0 bg-white border-b p-6 pb-4">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={closeModal}
                aria-label="Close"
              >✕</button>
              <h2 className="font-semibold text-lg" id="modal-title">{editAsset ? 'Edit Asset' : 'Add Asset'}</h2>
            </div>
            <div className="p-6 pt-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium" htmlFor="name">Asset Name</label>
                    <input
                      id="name"
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('name', { required: 'Asset name is required' })}
                      disabled={actionLoading}
                      aria-required="true"
                    />
                    {errors.name && <span className="text-red-600 text-xs">{errors.name.message}</span>}
                  </div>
                  <div>
                    <label className="block mb-1 font-medium" htmlFor="asset_type">Asset Type</label>
                    <select
                      id="asset_type"
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('asset_type', { required: 'Asset type is required' })}
                      disabled={actionLoading}
                      aria-required="true"
                    >
                      <option value="">Select Type</option>
                      {Object.keys(assetTypes).map(category => (
                        <optgroup key={category} label={category}>
                          {assetTypes[category].map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    {errors.asset_type && <span className="text-red-600 text-xs">{errors.asset_type.message}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium" htmlFor="initial_value">Acquisition Value ($)</label>
                    <input
                      id="initial_value"
                      type="number"
                      step="0.01"
                      min="0"
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('initial_value', {
                        min: { value: 0, message: 'Value must be positive' },
                        valueAsNumber: true
                      })}
                      disabled={actionLoading}
                    />
                    {errors.initial_value && <span className="text-red-600 text-xs">{errors.initial_value.message}</span>}
                  </div>
                  <div>
                    <label className="block mb-1 font-medium" htmlFor="current_value">Present Value ($)</label>
                    <input
                      id="current_value"
                      type="number"
                      step="0.01"
                      min="0"
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('current_value', {
                        min: { value: 0, message: 'Value must be positive' },
                        valueAsNumber: true
                      })}
                      disabled={actionLoading}
                    />
                    {errors.current_value && <span className="text-red-600 text-xs">{errors.current_value.message}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium" htmlFor="quantity">Quantity</label>
                    <input
                      id="quantity"
                      type="number"
                      step="0.0001"
                      min="0"
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('quantity', {
                        min: { value: 0, message: 'Quantity must be positive' },
                        valueAsNumber: true
                      })}
                      disabled={actionLoading}
                    />
                    {errors.quantity && <span className="text-red-600 text-xs">{errors.quantity.message}</span>}
                  </div>
                  <div>
                    <label className="block mb-1 font-medium" htmlFor="unit_of_measure">Unit</label>
                    <input
                      id="unit_of_measure"
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., shares, grams, sqft, BTC"
                      {...register('unit_of_measure')}
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium" htmlFor="purchase_date">Purchase Date</label>
                  <input
                    id="purchase_date"
                    type="date"
                    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('purchase_date')}
                    disabled={actionLoading}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium" htmlFor="description">Notes</label>
                  <textarea
                    id="description"
                    rows="3"
                    className={`border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-100 placeholder-neutral-400' : ''}`}
                    {...register('description')}
                    disabled={actionLoading}
                  />
                </div>

                {actionError && <div className="text-red-600 bg-red-50 p-3 rounded">{actionError}</div>}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
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
                    {actionLoading ? 'Saving...' : (editAsset ? 'Update Asset' : 'Add Asset')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, asset: null, onConfirm: null })}
        onConfirm={confirmDialog.onConfirm}
        title="Delete Asset"
        message="Are you sure you want to permanently delete this asset? This action cannot be undone and will remove all associated transaction history."
        confirmText="Delete Asset"
        cancelText="Cancel"
        variant="danger"
        asset={confirmDialog.asset}
        className={isDark ? 'bg-neutral-900 text-neutral-100' : ''}
      />
    </div>
  );
}

export default Assets;
