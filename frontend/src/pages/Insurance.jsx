import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { insuranceService } from '../services/insurance';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#888888'];

const Insurance = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPolicy, setEditPolicy] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const modalRef = useRef(null);

  // Global preferences trigger for re-renders
  const [globalPreferencesVersion, setGlobalPreferencesVersion] = useState(0);

  const fetchPolicies = () => {
    setLoading(true);
    insuranceService.getPolicies()
      .then(data => {
        setPolicies(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Error fetching policies:', err);
        setError('Failed to fetch insurance policies');
        setLoading(false);
        toast.error('Failed to fetch insurance policies');
      });
  };

  useEffect(() => {
    fetchPolicies();
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

  // Only show non-sensitive, necessary fields in charts and table
  // Annualize premium values for the chart
  const chartData = policies
    .map(p => {
      let premium = Number(p.premium_amount) || 0;
      let freq = (p.premium_frequency || '').toLowerCase();
      if (freq === 'monthly') premium = premium * 12;
      else if (freq === 'quarterly') premium = premium * 4;
      // Annually or unknown: leave as is
      return {
        name: p.policy_name || 'Policy',
        premium,
        coverage: typeof p.coverage_amount === 'number' ? p.coverage_amount : 0,
        type: p.policy_type || 'Unknown',
        status: p.status || 'active',
      };
    })
    .filter(p => p.premium > 0);

  // --- NEW: Aggregate KPIs for each active policy type ---
  const POLICY_TYPES = [
    { key: 'life', label: 'Life Insurance' },
    { key: 'health', label: 'Health Insurance' },
    { key: 'auto', label: 'Auto Insurance' },
    { key: 'home', label: 'Home Insurance' },
    { key: 'loan', label: 'Loan Insurance' },
    { key: 'travel', label: 'Travel Insurance' },
    { key: 'asset', label: 'Asset Insurance' },
    { key: 'factory', label: 'Factory Insurance' },
    { key: 'fire', label: 'Fire Insurance' },
  ];

  // Aggregate by type for active policies
  const aggregateByType = POLICY_TYPES.map(({ key, label }) => {
    let annualPremium = 0;
    let totalCoverage = 0;
    policies.forEach(p => {
      if ((p.policy_type || '').toLowerCase() === key && (p.status || 'active') === 'active') {
        let premium = Number(p.premium_amount) || 0;
        let freq = (p.premium_frequency || '').toLowerCase();
        if (freq === 'monthly') premium = premium * 12;
        else if (freq === 'quarterly') premium = premium * 4;
        // Annually or unknown: leave as is
        annualPremium += premium;
        totalCoverage += Number(p.coverage_amount) || 0;
      }
    });
    return { type: label, annualPremium, totalCoverage };
  });

  // Total row
  const totalAnnualPremium = aggregateByType.reduce((sum, t) => sum + t.annualPremium, 0);
  const totalCoverage = aggregateByType.reduce((sum, t) => sum + t.totalCoverage, 0);

  // --- NEW: Policy type counts (show 0 for missing types) ---
  const policyTypeCounts = POLICY_TYPES.map(({ key, label }) => {
    const count = policies.filter(p => (p.policy_type || '').toLowerCase() === key).length;
    return { type: label, count };
  });

  // Example pie chart data (policy type breakdown)
  const pieData = Object.entries(
    policies.reduce((acc, p) => {
      acc[p.policy_type] = (acc[p.policy_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

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

  // Add or update policy
  const onSubmit = async (data) => {
    setActionLoading(true);
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

      // API call
      let result;
      if (editPolicy) {
        result = await insuranceService.updatePolicy(editPolicy.id, processedData);
        console.log('✅ Update result:', result);
        toast.success('Policy updated successfully');
      } else {
        result = await insuranceService.createPolicy(processedData);
        console.log('✅ Create result:', result);
        toast.success('Policy added successfully');
      }
      
      closeModal();
      fetchPolicies();
      
    } catch (err) {
      console.error('❌ Form submission error:', err);
      console.error('❌ Error response:', err.response?.data);
      const errorMessage = err.message || 'Failed to save policy';
      setActionError(errorMessage);
      toast.error(errorMessage);
    }
    
    setActionLoading(false);
  };

  // Delete policy
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await insuranceService.deletePolicy(id);
      fetchPolicies();
      toast.success('Policy deleted successfully');
    } catch (err) {
      setActionError('Failed to delete policy');
      toast.error('Failed to delete policy');
    }
    setActionLoading(false);
  };

  if (loading) return <div>Loading insurance policies...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Insurance Policies</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => openModal()}
        >
          Add Policy
        </button>
      </div>

      {/* Error message if fetch fails */}
      {error && (
        <div className="text-red-600 mb-4">{error}</div>
      )}

      {/* If no error and no policies, show empty state */}
      {!error && policies.length === 0 && (
        <div className="bg-white rounded shadow p-6 flex flex-col items-center justify-center">
          <h2 className="font-semibold mb-2">No policies found</h2>
          <p className="mb-4 text-gray-500">You have not added any insurance policies yet. Click "Add Policy" above to get started.</p>
        </div>
      )}

      {/* If policies exist, show charts and table */}
      {policies.length > 0 && (
        <>
          {/* KPIs & Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded shadow p-4">
              <h2 className="font-semibold mb-2">Annual Premiums Overview</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="premium" fill="#8884d8" name="Annual Premium" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded shadow p-4">
              <h2 className="font-semibold mb-2">Policy Type Breakdown</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* --- Aggregate KPIs by policy type: moved up for visibility --- */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Policy Aggregates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded shadow p-4 overflow-x-auto">
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
                    {aggregateByType.map((row, idx) => (
                      <tr key={row.type} className="border-t">
                        <td className="py-2 px-4">{row.type}</td>
                        <td className="py-2 px-4">{formatCurrency(row.annualPremium)}</td>
                        <td className="py-2 px-4">{formatCurrency(row.totalCoverage)}</td>
                      </tr>
                    ))}
                    <tr className="border-t font-bold">
                      <td className="py-2 px-4">Total</td>
                      <td className="py-2 px-4">{formatCurrency(totalAnnualPremium)}</td>
                      <td className="py-2 px-4">{formatCurrency(totalCoverage)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-white rounded shadow p-4 overflow-x-auto">
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
          <div className="bg-white rounded shadow p-4">
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
            className="bg-white rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
            ref={modalRef}
            tabIndex={0}
            aria-label={editPolicy ? 'Edit Policy Modal' : 'Add Policy Modal'}
          >
            <div className="sticky top-0 bg-white border-b p-6 pb-4">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
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