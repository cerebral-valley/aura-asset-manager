import apiClient from '../lib/api'

export const transactionsService = {
  async getTransactions() {
    const response = await apiClient.get('/transactions')
    return response.data
  },

  async getTransaction(id) {
    const response = await apiClient.get(`/transactions/${id}`)
    return response.data
  },

  async getAssetTransactions(assetId) {
    const response = await apiClient.get(`/transactions/asset/${assetId}`)
    return response.data
  },

  async createTransaction(transaction) {
    const response = await apiClient.post('/transactions', transaction)
    return response.data
  },

  async updateTransaction(id, transaction) {
    const response = await apiClient.put(`/transactions/${id}`, transaction)
    return response.data
  },

  async deleteTransaction(id) {
    const response = await apiClient.delete(`/transactions/${id}`)
    return response.data
  }
}

