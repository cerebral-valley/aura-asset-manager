import { supabase } from '@/lib/supabase'

// Service for managing payment schedules for annuities and insurance
export const paymentScheduleService = {
  // Get all payment schedules for a user
  async getPaymentSchedules(userId) {
    try {
      const { data, error } = await supabase
        .from('payment_schedules')
        .select('*')
        .eq('user_id', userId)
        .order('next_payment_date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching payment schedules:', error);
      throw error;
    }
  },

  // Get payment schedules for a specific asset or insurance policy
  async getSchedulesForItem(itemId, itemType) {
    try {
      const { data, error } = await supabase
        .from('payment_schedules')
        .select('*')
        .eq('related_id', itemId)
        .eq('related_type', itemType)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching schedules for item:', error);
      throw error;
    }
  },

  // Get upcoming payments (next 90 days)
  async getUpcomingPayments(userId, daysAhead = 90) {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + daysAhead);

      const { data, error } = await supabase
        .from('payment_schedules')
        .select(`
          *,
          assets:related_id (name, type),
          insurance_policies:related_id (policy_name, policy_type)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .not('next_payment_date', 'is', null)
        .lte('next_payment_date', endDate.toISOString().split('T')[0])
        .order('next_payment_date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching upcoming payments:', error);
      throw error;
    }
  },

  // Create a new payment schedule
  async createPaymentSchedule(scheduleData) {
    try {
      const { data, error } = await supabase
        .from('payment_schedules')
        .insert([scheduleData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating payment schedule:', error);
      throw error;
    }
  },

  // Update a payment schedule
  async updatePaymentSchedule(scheduleId, updates) {
    try {
      const { data, error } = await supabase
        .from('payment_schedules')
        .update(updates)
        .eq('id', scheduleId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating payment schedule:', error);
      throw error;
    }
  },

  // Record a payment and update the schedule
  async recordPayment(scheduleId, paymentAmount, paymentDate = new Date()) {
    try {
      const { data, error } = await supabase
        .rpc('record_payment', {
          schedule_id: scheduleId,
          payment_amount: paymentAmount,
          payment_date: paymentDate.toISOString().split('T')[0]
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  },

  // Calculate total payments made for an asset/policy
  async getTotalPaymentsMade(itemId, itemType) {
    try {
      const { data, error } = await supabase
        .from('payment_schedules')
        .select('total_amount_paid')
        .eq('related_id', itemId)
        .eq('related_type', itemType);

      if (error) throw error;
      
      return data.reduce((total, schedule) => total + (parseFloat(schedule.total_amount_paid) || 0), 0);
    } catch (error) {
      console.error('Error calculating total payments:', error);
      throw error;
    }
  },

  // Get payment projection for next N periods
  async getPaymentProjection(scheduleId, periods = 12) {
    try {
      const { data: schedule, error } = await supabase
        .from('payment_schedules')
        .select('*')
        .eq('id', scheduleId)
        .single();

      if (error) throw error;

      const projection = [];
      let currentDate = new Date(schedule.next_payment_date);
      
      for (let i = 0; i < periods; i++) {
        // Check if we've reached the end date
        if (schedule.end_date && currentDate > new Date(schedule.end_date)) {
          break;
        }

        projection.push({
          date: new Date(currentDate),
          amount: parseFloat(schedule.amount),
          period: i + 1
        });

        // Calculate next payment date
        switch (schedule.frequency) {
          case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
          case 'quarterly':
            currentDate.setMonth(currentDate.getMonth() + 3);
            break;
          case 'semi-annually':
            currentDate.setMonth(currentDate.getMonth() + 6);
            break;
          case 'annually':
            currentDate.setFullYear(currentDate.getFullYear() + 1);
            break;
        }
      }

      return projection;
    } catch (error) {
      console.error('Error generating payment projection:', error);
      throw error;
    }
  },

  // Delete a payment schedule
  async deletePaymentSchedule(scheduleId) {
    try {
      const { error } = await supabase
        .from('payment_schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting payment schedule:', error);
      throw error;
    }
  }
};

// Helper functions for payment calculations
export const paymentHelpers = {
  // Calculate present value of annuity payments
  calculatePresentValue(paymentAmount, interestRate, periods, frequency = 'monthly') {
    const periodsPerYear = {
      'monthly': 12,
      'quarterly': 4,
      'semi-annually': 2,
      'annually': 1
    };
    
    const periodicRate = interestRate / periodsPerYear[frequency];
    const totalPeriods = periods * periodsPerYear[frequency];
    
    if (periodicRate === 0) {
      return paymentAmount * totalPeriods;
    }
    
    return paymentAmount * ((1 - Math.pow(1 + periodicRate, -totalPeriods)) / periodicRate);
  },

  // Calculate future value of annuity payments
  calculateFutureValue(paymentAmount, interestRate, periods, frequency = 'monthly') {
    const periodsPerYear = {
      'monthly': 12,
      'quarterly': 4,
      'semi-annually': 2,
      'annually': 1
    };
    
    const periodicRate = interestRate / periodsPerYear[frequency];
    const totalPeriods = periods * periodsPerYear[frequency];
    
    if (periodicRate === 0) {
      return paymentAmount * totalPeriods;
    }
    
    return paymentAmount * ((Math.pow(1 + periodicRate, totalPeriods) - 1) / periodicRate);
  },

  // Format payment frequency for display
  formatFrequency(frequency) {
    const frequencies = {
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'semi-annually': 'Semi-Annually',
      'annually': 'Annually'
    };
    return frequencies[frequency] || frequency;
  },

  // Get next payment date based on frequency
  getNextPaymentDate(lastDate, frequency) {
    const date = new Date(lastDate);
    switch (frequency) {
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'semi-annually':
        date.setMonth(date.getMonth() + 6);
        break;
      case 'annually':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date;
  }
};
