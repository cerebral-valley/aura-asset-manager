import api from '../lib/api';

const annuityService = {
  // Get all annuities
  getAnnuities: async (params = {}, config = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/annuities${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      console.error('Error fetching annuities:', error);
      throw error;
    }
  },

  // Get portfolio summary
  getPortfolioSummary: async (config = {}) => {
    try {
      const response = await api.get('/annuities/summary', config);
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolio summary:', error);
      throw error;
    }
  },

  // Get single annuity
  getAnnuity: async (annuityId, config = {}) => {
    try {
      const response = await api.get(`/annuities/${annuityId}`, config);
      return response.data;
    } catch (error) {
      console.error('Error fetching annuity:', error);
      throw error;
    }
  },

  // Create new annuity
  createAnnuity: async (annuityData, config = {}) => {
    try {
      const response = await api.post('/annuities/', annuityData, config);
      return response.data;
    } catch (error) {
      console.error('Error creating annuity:', error);
      throw error;
    }
  },

  // Update annuity
  updateAnnuity: async (annuityId, updateData, config = {}) => {
    try {
      const response = await api.put(`/annuities/${annuityId}`, updateData, config);
      return response.data;
    } catch (error) {
      console.error('Error updating annuity:', error);
      throw error;
    }
  },

  // Delete annuity
  deleteAnnuity: async (annuityId, config = {}) => {
    try {
      const response = await api.delete(`/annuities/${annuityId}`, config);
      return response.data;
    } catch (error) {
      console.error('Error deleting annuity:', error);
      throw error;
    }
  },

  // Contribution management
  addContribution: async (annuityId, contributionData, config = {}) => {
    try {
      const response = await api.post(`/annuities/${annuityId}/contributions`, contributionData, config);
      return response.data;
    } catch (error) {
      console.error('Error adding contribution:', error);
      throw error;
    }
  },

  getContributions: async (annuityId, config = {}) => {
    try {
      const response = await api.get(`/annuities/${annuityId}/contributions`, config);
      return response.data;
    } catch (error) {
      console.error('Error fetching contributions:', error);
      throw error;
    }
  },

  // Valuation management
  addValuation: async (annuityId, valuationData, config = {}) => {
    try {
      const response = await api.post(`/annuities/${annuityId}/valuations`, valuationData, config);
      return response.data;
    } catch (error) {
      console.error('Error adding valuation:', error);
      throw error;
    }
  },

  getValuations: async (annuityId, limit = 50, config = {}) => {
    try {
      const response = await api.get(`/annuities/${annuityId}/valuations?limit=${limit}`, config);
      return response.data;
    } catch (error) {
      console.error('Error fetching valuations:', error);
      throw error;
    }
  },

  // Performance metrics
  getPerformance: async (annuityId, config = {}) => {
    try {
      const response = await api.get(`/annuities/${annuityId}/performance`, config);
      return response.data;
    } catch (error) {
      console.error('Error fetching performance:', error);
      throw error;
    }
  }
};

export default annuityService;
