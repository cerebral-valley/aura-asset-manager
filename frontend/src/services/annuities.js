import api from '../lib/api';

const annuityService = {
  // Get all annuities
  getAnnuities: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/annuities${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching annuities:', error);
      throw error;
    }
  },

  // Get portfolio summary
  getPortfolioSummary: async () => {
    try {
      const response = await api.get('/annuities/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolio summary:', error);
      throw error;
    }
  },

  // Get single annuity
  getAnnuity: async (annuityId) => {
    try {
      const response = await api.get(`/annuities/${annuityId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching annuity:', error);
      throw error;
    }
  },

  // Create new annuity
  createAnnuity: async (annuityData) => {
    try {
      const response = await api.post('/annuities/', annuityData);
      return response.data;
    } catch (error) {
      console.error('Error creating annuity:', error);
      throw error;
    }
  },

  // Update annuity
  updateAnnuity: async (annuityId, updateData) => {
    try {
      const response = await api.put(`/annuities/${annuityId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating annuity:', error);
      throw error;
    }
  },

  // Delete annuity
  deleteAnnuity: async (annuityId) => {
    try {
      const response = await api.delete(`/annuities/${annuityId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting annuity:', error);
      throw error;
    }
  },

  // Contribution management
  addContribution: async (annuityId, contributionData) => {
    try {
      const response = await api.post(`/annuities/${annuityId}/contributions`, contributionData);
      return response.data;
    } catch (error) {
      console.error('Error adding contribution:', error);
      throw error;
    }
  },

  getContributions: async (annuityId) => {
    try {
      const response = await api.get(`/annuities/${annuityId}/contributions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contributions:', error);
      throw error;
    }
  },

  // Valuation management
  addValuation: async (annuityId, valuationData) => {
    try {
      const response = await api.post(`/annuities/${annuityId}/valuations`, valuationData);
      return response.data;
    } catch (error) {
      console.error('Error adding valuation:', error);
      throw error;
    }
  },

  getValuations: async (annuityId, limit = 50) => {
    try {
      const response = await api.get(`/annuities/${annuityId}/valuations?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching valuations:', error);
      throw error;
    }
  },

  // Performance metrics
  getPerformance: async (annuityId) => {
    try {
      const response = await api.get(`/annuities/${annuityId}/performance`);
      return response.data;
    } catch (error) {
      console.error('Error fetching performance:', error);
      throw error;
    }
  }
};

export default annuityService;
