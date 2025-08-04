import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Calendar, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { paymentScheduleService, paymentHelpers } from '../../services/paymentSchedules';
import { format } from 'date-fns';

const AnnuityManager = ({ asset, onUpdate }) => {
  const [paymentSchedules, setPaymentSchedules] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    schedule_type: 'payment_out',
    amount: '',
    frequency: 'monthly',
    start_date: '',
    end_date: '',
    metadata: {}
  });

  useEffect(() => {
    loadPaymentSchedules();
  }, [asset.id]);

  const loadPaymentSchedules = async () => {
    try {
      setLoading(true);
      const schedules = await paymentScheduleService.getSchedulesForItem(asset.id, 'asset');
      setPaymentSchedules(schedules);
    } catch (error) {
      console.error('Error loading payment schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const scheduleData = {
        ...newSchedule,
        related_id: asset.id,
        related_type: 'asset',
        amount: parseFloat(newSchedule.amount),
        start_date: newSchedule.start_date,
        end_date: newSchedule.end_date || null,
        next_payment_date: newSchedule.start_date
      };

      await paymentScheduleService.createPaymentSchedule(scheduleData);
      await loadPaymentSchedules();
      setShowCreateForm(false);
      setNewSchedule({
        schedule_type: 'payment_out',
        amount: '',
        frequency: 'monthly',
        start_date: '',
        end_date: '',
        metadata: {}
      });
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error creating payment schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (scheduleId, amount) => {
    try {
      await paymentScheduleService.recordPayment(scheduleId, amount);
      await loadPaymentSchedules();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  const calculateTotalValue = () => {
    const currentValue = parseFloat(asset.current_value) || 0;
    const totalPaid = paymentSchedules.reduce((sum, schedule) => 
      sum + (parseFloat(schedule.total_amount_paid) || 0), 0
    );
    return currentValue + totalPaid;
  };

  const getScheduleTypeColor = (type) => {
    switch (type) {
      case 'payment_out': return 'bg-red-100 text-red-800';
      case 'payment_in': return 'bg-green-100 text-green-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Annuity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Annuity Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-600">Asset Value</Label>
              <div className="text-2xl font-bold">
                ${parseFloat(asset.current_value || 0).toLocaleString()}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-600">Total Paid</Label>
              <div className="text-2xl font-bold text-red-600">
                ${paymentSchedules.reduce((sum, s) => sum + parseFloat(s.total_amount_paid || 0), 0).toLocaleString()}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-600">Net Value</Label>
              <div className="text-2xl font-bold text-green-600">
                ${calculateTotalValue().toLocaleString()}
              </div>
            </div>
          </div>
          
          {asset.annuity_type && (
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="outline">{asset.annuity_type} Annuity</Badge>
              {asset.guaranteed_rate && (
                <Badge variant="outline">
                  {(parseFloat(asset.guaranteed_rate) * 100).toFixed(2)}% Rate
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Schedules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Payment Schedules
            </CardTitle>
            <Button
              onClick={() => setShowCreateForm(true)}
              disabled={loading}
              size="sm"
            >
              Add Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {paymentSchedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No payment schedules configured for this annuity
            </div>
          ) : (
            <div className="space-y-4">
              {paymentSchedules.map((schedule) => (
                <div key={schedule.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getScheduleTypeColor(schedule.schedule_type)}>
                        {schedule.schedule_type.replace('_', ' ')}
                      </Badge>
                      <span className="font-medium">
                        ${parseFloat(schedule.amount).toLocaleString()} {paymentHelpers.formatFrequency(schedule.frequency)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {schedule.is_active ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-600">Start Date</Label>
                      <div>{format(new Date(schedule.start_date), 'MMM dd, yyyy')}</div>
                    </div>
                    <div>
                      <Label className="text-gray-600">Next Payment</Label>
                      <div>
                        {schedule.next_payment_date 
                          ? format(new Date(schedule.next_payment_date), 'MMM dd, yyyy')
                          : 'N/A'
                        }
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-600">Payments Made</Label>
                      <div>{schedule.total_payments_made}</div>
                    </div>
                    <div>
                      <Label className="text-gray-600">Total Paid</Label>
                      <div>${parseFloat(schedule.total_amount_paid || 0).toLocaleString()}</div>
                    </div>
                  </div>
                  
                  {schedule.is_active && schedule.next_payment_date && (
                    <div className="mt-3 pt-3 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRecordPayment(schedule.id, parseFloat(schedule.amount))}
                        className="flex items-center gap-1"
                      >
                        <DollarSign className="h-4 w-4" />
                        Record Payment
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Schedule Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Payment Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="schedule_type">Schedule Type</Label>
                  <Select
                    value={newSchedule.schedule_type}
                    onValueChange={(value) => setNewSchedule({...newSchedule, schedule_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment_out">Payment Out (Annuity Payments)</SelectItem>
                      <SelectItem value="payment_in">Payment In (Contributions)</SelectItem>
                      <SelectItem value="premium">Premium Payments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={newSchedule.frequency}
                    onValueChange={(value) => setNewSchedule({...newSchedule, frequency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="semi-annually">Semi-Annually</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="amount">Payment Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newSchedule.amount}
                    onChange={(e) => setNewSchedule({...newSchedule, amount: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={newSchedule.start_date}
                    onChange={(e) => setNewSchedule({...newSchedule, start_date: e.target.value})}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="end_date">End Date (Optional - leave blank for lifetime)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={newSchedule.end_date}
                    onChange={(e) => setNewSchedule({...newSchedule, end_date: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Schedule'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnnuityManager;
