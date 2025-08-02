import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { assetsService } from '../services/assets';
import { transactionsService } from '../services/transactions';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import { assetTypes, getAggregationCategories, getCategoryForAssetType } from '../constants/assetTypes';

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

  // Helper functions for display formatting
  const formatCurrency = (amount) => {
    if (!amount || amount === 0 || amount === '0' || amount === '') return '-';

    // Convert string to number if needed
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount) || numAmount === 0) return '-';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(numAmount);
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

  // Helper function to match asset types to categories
  const matchesAssetCategory = (assetType, categoryConfig) => {
    if (!assetType) return false;
    return categoryConfig.assetTypes.includes(assetType.toLowerCase().trim());
  };

  // Aggregate by asset category for assets to process
  const aggregateByType = AGGREGATION_CATEGORIES.map(({ key, label, assetTypes: categoryAssetTypes }) => {
    let totalLatestValue = 0;
    let totalPresentValue = 0;
    let count = 0;
    let totalQuantity = 0;
    let unit = '-';

    assetsToProcess.forEach(asset => {
      const assetType = (asset.asset_type || '').trim();
      const assetTypeMatch = matchesAssetCategory(assetType, { assetTypes: categoryAssetTypes });
      
      if (assetTypeMatch) {
        const latestValue = getLatestValue(asset);
        const presentValue = getPresentValue(asset);
        const quantity = Number(asset.quantity) || 0;
        
        totalLatestValue += latestValue;
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
      displayValue = count > 0 ? `${count} properties` : '-';
    } else if (key === 'crypto' && unit && unit.toLowerCase().includes('btc')) {
      displayValue = totalQuantity > 0 ? `${totalQuantity.toFixed(8)} BTC` : '-';
    } else if (key === 'gold' && unit && unit.toLowerCase().includes('gram')) {
      displayValue = totalQuantity > 0 ? `${totalQuantity.toFixed(2)} grams` : '-';
    } else if ((key === 'stock' || key === 'bond') && totalPresentValue > 0) {
      displayValue = formatCurrency(totalPresentValue);
    } else if (count === 0) {
      displayValue = '-';
    } else {
      displayValue = `${count} assets`;
    }

    return { 
      type: label, 
      latestValue: totalLatestValue, 
      presentValue: totalPresentValue,
      count,
      displayValue
    };
  });

  // Total values
  const totalLatestValue = aggregateByType.reduce((sum, t) => sum + t.latestValue, 0);
  const totalPresentValue = aggregateByType.reduce((sum, t) => sum + t.presentValue, 0);

  // Asset type counts
  const assetTypeCounts = AGGREGATION_CATEGORIES.map(({ key, label, assetTypes: categoryAssetTypes }) => {
    const count = assetsToProcess.filter(asset => matchesAssetCategory(asset.asset_type, { assetTypes: categoryAssetTypes })).length;
    return { type: label, count };
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
    .filter(asset => asset.purchase_date && (getLatestValue(asset) > 0 || getPresentValue(asset) > 0))
    .map(asset => ({
      date: asset.purchase_date,
      year: new Date(asset.purchase_date).getFullYear(),
      latestValue: getLatestValue(asset),
      presentValue: getPresentValue(asset),
      name: asset.name
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Group by year for chart
  const yearlyData = valueOverTimeData.reduce((acc, asset) => {
    const year = asset.year;
    if (!acc[year]) {
      acc[year] = { year, latestValue: 0, presentValue: 0 };
    }
    acc[year].latestValue += asset.latestValue;
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

  // Delete asset
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await assetsService.deleteAsset(id);
      fetchAssets();
      toast.success('Asset deleted successfully');
    } catch (err) {
      setActionError('Failed to delete asset');
      toast.error('Failed to delete asset');
    }
    setActionLoading(false);
  };

  if (loading) return <div>Loading assets...</div>;

  return (
    <div className="p-6">
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
        <div className="bg-white rounded shadow p-6 flex flex-col items-center justify-center">
          <h2 className="font-semibold mb-2">No assets found</h2>
          <p className="mb-4 text-gray-500">You have not added any assets yet. Click "New Transaction" above to create your first asset.</p>
        </div>
      )}

      {/* If assets exist, show charts and table */}
      {activeAssets.length > 0 && (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded shadow p-4">
              <h2 className="font-semibold mb-2">Asset Value Over Time</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="latestValue" stroke="#8884d8" name="Acquisition Value" />
                  <Line type="monotone" dataKey="presentValue" stroke="#82ca9d" name="Present Value" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded shadow p-4">
              <h2 className="font-semibold mb-2">Asset Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Asset Aggregates */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Asset Aggregates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded shadow p-4 overflow-x-auto">
                <h3 className="font-semibold mb-2">Aggregate by Asset Type</h3>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-4">Asset Type</th>
                      <th className="text-left py-2 px-4">Latest Acquisition Value</th>
                      <th className="text-left py-2 px-4">Present Value</th>
                      <th className="text-left py-2 px-4">Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aggregateByType.map((row, idx) => (
                      <tr key={row.type} className="border-t">
                        <td className="py-2 px-4">{row.type}</td>
                        <td className="py-2 px-4">{formatCurrency(row.latestValue)}</td>
                        <td className="py-2 px-4">{formatCurrency(row.presentValue)}</td>
                        <td className="py-2 px-4">{row.displayValue}</td>
                      </tr>
                    ))}
                    <tr className="border-t font-bold">
                      <td className="py-2 px-4">Total</td>
                      <td className="py-2 px-4">{formatCurrency(totalLatestValue)}</td>
                      <td className="py-2 px-4">{formatCurrency(totalPresentValue)}</td>
                      <td className="py-2 px-4">{activeAssets.length} assets</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-white rounded shadow p-4 overflow-x-auto">
                <h3 className="font-semibold mb-2">Asset Type Counts</h3>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-4">Asset Type</th>
                      <th className="text-left py-2 px-4">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetTypeCounts.map(row => (
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

          {/* Assets Table */}
          <div className="bg-white rounded shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">All Assets</h2>
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
            {actionError && <div className="text-red-600 mb-2">{actionError}</div>}
            <table className="min-w-full text-sm" aria-label="Assets Table">
              <thead>
                <tr>
                  <th className="text-left py-2 px-4">Name</th>
                  <th className="text-left py-2 px-4">Type</th>
                  <th className="text-left py-2 px-4">Acquisition Value</th>
                  <th className="text-left py-2 px-4">Present Value</th>
                  <th className="text-left py-2 px-4">Quantity</th>
                  <th className="text-left py-2 px-4">Unit</th>
                  <th className="text-left py-2 px-4">Purchase Date</th>
                  <th className="text-left py-2 px-4">Notes</th>
                  <th className="text-left py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeAssets.map((asset, idx) => (
                  <tr key={asset.id || idx} className="border-t">
                    <td className="py-2 px-4">{asset.name || 'Asset'}</td>
                    <td className="py-2 px-4 capitalize">{asset.asset_type || '-'}</td>
                    <td className="py-2 px-4">{formatCurrency(getAcquisitionValue(asset))}</td>
                    <td className="py-2 px-4">{formatCurrency(getPresentValue(asset))}</td>
                    <td className="py-2 px-4">{asset.quantity || '-'}</td>
                    <td className="py-2 px-4">{asset.unit_of_measure || '-'}</td>
                    <td className="py-2 px-4">{formatDate(asset.purchase_date)}</td>
                    <td className="py-2 px-4">{asset.description || '-'}</td>
                    <td className="py-2 px-4">
                      <button
                        className="text-blue-600 hover:underline mr-2"
                        onClick={() => openModal(asset)}
                        aria-label={`Edit asset ${asset.name || 'Asset'}`}
                      >Edit</button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => handleDelete(asset.id)}
                        disabled={actionLoading}
                        aria-label={`Delete asset ${asset.name || 'Asset'}`}
                      >Delete</button>
                    </td>
                  </tr>
                ))}
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
                      <option value="real_estate">Real Estate</option>
                      <option value="stock">Stock</option>
                      <option value="bond">Bond</option>
                      <option value="crypto">Cryptocurrency</option>
                      <option value="gold">Gold</option>
                      <option value="cash">Cash</option>
                      <option value="other">Other</option>
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
                    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    </div>
  );
};

export default Assets;
