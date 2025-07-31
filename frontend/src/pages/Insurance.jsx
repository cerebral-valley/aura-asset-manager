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
    name: p.name || p.policy_name || 'Policy',
    premium: typeof p.premium === 'number' ? p.premium : 0,
    status: p.status || 'Active',
    expiry: p.expiry_date || '',
  }));

  // Example pie chart data (policy status breakdown)
  const pieData = Object.entries(
    policies.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
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
        name: policy.name || policy.policy_name || '',
        premium: policy.premium || '',
        status: policy.status || 'Active',
        expiry_date: policy.expiry_date || '',
      });
    } else {
      reset({ name: '', premium: '', status: 'Active', expiry_date: '' });
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
  if (error) return <div>{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Insurance Policies</h1>
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
          <h2 className="font-semibold mb-2">Policy Status Breakdown</h2>
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
              <th className="text-left py-2 px-4">Name</th>
              <th className="text-left py-2 px-4">Premium</th>
              <th className="text-left py-2 px-4">Status</th>
              <th className="text-left py-2 px-4">Expiry Date</th>
              <th className="text-left py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p, idx) => (
              <tr key={p.id || idx} className="border-t">
                <td className="py-2 px-4">{p.name || p.policy_name || 'Policy'}</td>
                <td className="py-2 px-4">{typeof p.premium === 'number' ? p.premium : '-'}</td>
                <td className="py-2 px-4">{p.status || '-'}</td>
                <td className="py-2 px-4">{p.expiry_date || '-'}</td>
                <td className="py-2 px-4">
                  <button
                    className="text-blue-600 hover:underline mr-2"
                    onClick={() => openModal(p)}
                    aria-label={`Edit policy ${p.name || p.policy_name || 'Policy'}`}
                  >Edit</button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(p.id)}
                    disabled={actionLoading}
                    aria-label={`Delete policy ${p.name || p.policy_name || 'Policy'}`}
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          tabIndex={-1}
          onKeyDown={e => {
            if (e.key === 'Escape') closeModal();
          }}
        >
          <div
            className="bg-white rounded shadow-lg p-6 w-full max-w-md relative"
            ref={modalRef}
            tabIndex={0}
            aria-label={editPolicy ? 'Edit Policy Modal' : 'Add Policy Modal'}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeModal}
              aria-label="Close"
            >✕</button>
            <h2 className="font-semibold mb-4" id="modal-title">{editPolicy ? 'Edit Policy' : 'Add Policy'}</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3">
                <label className="block mb-1" htmlFor="name">Name</label>
                <input
                  id="name"
                  className="border rounded px-3 py-2 w-full"
                  {...register('name', { required: 'Name is required' })}
                  disabled={actionLoading}
                  aria-required="true"
                />
                {errors.name && <span className="text-red-600 text-xs">{errors.name.message}</span>}
              </div>
              <div className="mb-3">
                <label className="block mb-1" htmlFor="premium">Premium</label>
                <input
                  id="premium"
                  type="number"
                  className="border rounded px-3 py-2 w-full"
                  {...register('premium', { required: 'Premium is required', min: 0 })}
                  disabled={actionLoading}
                  aria-required="true"
                />
                {errors.premium && <span className="text-red-600 text-xs">{errors.premium.message}</span>}
              </div>
              <div className="mb-3">
                <label className="block mb-1" htmlFor="status">Status</label>
                <select
                  id="status"
                  className="border rounded px-3 py-2 w-full"
                  {...register('status', { required: true })}
                  disabled={actionLoading}
                  aria-required="true"
                >
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block mb-1" htmlFor="expiry_date">Expiry Date</label>
                <input
                  id="expiry_date"
                  type="date"
                  className="border rounded px-3 py-2 w-full"
                  {...register('expiry_date', { required: 'Expiry date is required' })}
                  disabled={actionLoading}
                  aria-required="true"
                />
                {errors.expiry_date && <span className="text-red-600 text-xs">{errors.expiry_date.message}</span>}
              </div>
              {actionError && <div className="text-red-600 mb-2">{actionError}</div>}
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                disabled={actionLoading}
                aria-disabled={actionLoading}
              >
                {actionLoading ? 'Saving...' : (editPolicy ? 'Update Policy' : 'Add Policy')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insurance;
