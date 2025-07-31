import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { insuranceService } from '../services/insurance';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
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

  const fetchPolicies = () => {
    setLoading(true);
    insuranceService.getPolicies()
      .then(data => {
        setPolicies(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch insurance policies');
        setLoading(false);
        toast.error('Failed to fetch insurance policies');
      });
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  // Example chart data (replace with real KPIs from policies)
  // Only show non-sensitive, necessary fields in charts and table
  const chartData = policies.map(p => ({
    name: p.policy_name || 'Policy',
    premium: typeof p.premium_amount === 'number' ? p.premium_amount : 0,
    coverage: typeof p.coverage_amount === 'number' ? p.coverage_amount : 0,
    type: p.policy_type || 'Unknown',
  }));

  // Example pie chart data (policy type breakdown)
  const pieData = Object.entries(
    policies.reduce((acc, p) => {
      acc[p.policy_type] = (acc[p.policy_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));


  // Form setup
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

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
      reset({
        policy_name: policy.policy_name || '',
        policy_type: policy.policy_type || '',
        provider: policy.provider || '',
        coverage_amount: policy.coverage_amount || '',
        premium_amount: policy.premium_amount || '',
        premium_frequency: policy.premium_frequency || 'monthly',
        start_date: policy.start_date || '',
        end_date: policy.end_date || '',
        renewal_date: policy.renewal_date || '',
        notes: policy.notes || '',
      });
    } else {
      reset({ 
        policy_name: '', 
        policy_type: '', 
        provider: '', 
        coverage_amount: '', 
        premium_amount: '', 
        premium_frequency: 'monthly',
        start_date: '', 
        end_date: '', 
        renewal_date: '', 
        notes: '' 
      });
    }
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditPolicy(null);
    reset();
  };

  // Add or update policy
  const onSubmit = async (data) => {
    setActionLoading(true);
    setActionError(null);
    try {
      if (editPolicy) {
        await insuranceService.updatePolicy(editPolicy.id, data);
        toast.success('Policy updated successfully');
      } else {
        await insuranceService.createPolicy(data);
        toast.success('Policy added successfully');
      }
      closeModal();
      fetchPolicies();
    } catch (err) {
      setActionError('Failed to save policy');
      toast.error('Failed to save policy');
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
              <h2 className="font-semibold mb-2">Premiums Overview</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="premium" fill="#8884d8" />
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
                  <th className="text-left py-2 px-4">Type</th>
                  <th className="text-left py-2 px-4">Premium</th>
                  <th className="text-left py-2 px-4">Coverage</th>
                  <th className="text-left py-2 px-4">End Date</th>
                  <th className="text-left py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((p, idx) => (
                  <tr key={p.id || idx} className="border-t">
                    <td className="py-2 px-4">{p.policy_name || 'Policy'}</td>
                    <td className="py-2 px-4">{p.policy_type || '-'}</td>
                    <td className="py-2 px-4">{typeof p.premium_amount === 'number' ? `$${p.premium_amount}` : '-'}</td>
                    <td className="py-2 px-4">{typeof p.coverage_amount === 'number' ? `$${p.coverage_amount}` : '-'}</td>
                    <td className="py-2 px-4">{p.end_date || '-'}</td>
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4"
              >
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
                      type="date"
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('start_date')}
                      disabled={actionLoading}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium" htmlFor="end_date">End Date</label>
                    <input
                      id="end_date"
                      type="date"
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('end_date')}
                      disabled={actionLoading}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium" htmlFor="renewal_date">Renewal Date</label>
                    <input
                      id="renewal_date"
                      type="date"
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('renewal_date')}
                      disabled={actionLoading}
                    />
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
