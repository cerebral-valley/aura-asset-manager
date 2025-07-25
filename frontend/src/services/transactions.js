import apiClient from '@/lib/api'

export const transactionsService = {
  async getTransactions() {
    const response = await apiClient.get('/transactions/')
    return response.data
  },

  async getTransaction(id) {
    const response = await apiClient.get(`/transactions/${id}/`)
    return response.data
  },

  async getAssetTransactions(assetId) {
    const response = await apiClient.get(`/transactions/asset/${assetId}/`)
    return response.data
  },

  async createTransaction(transaction) {
    console.log('🔧 TRANSACTIONS_SERVICE_CREATE_START: Creating transaction', {
      transaction,
      fieldsCount: Object.keys(transaction).length,
      requiredFields: {
        asset_id: !!transaction.asset_id,
        transaction_type: !!transaction.transaction_type,
        transaction_date: !!transaction.transaction_date
      },
      code: 'SERVICE_001'
    })
    
    try {
      // Validate required fields
      if (!transaction.asset_id) {
        throw new Error('SERVICE_ERROR_001: asset_id is required')
      }
      if (!transaction.transaction_type) {
        throw new Error('SERVICE_ERROR_002: transaction_type is required')
      }
      if (!transaction.transaction_date) {
        throw new Error('SERVICE_ERROR_003: transaction_date is required')
      }
      
      console.log('📡 TRANSACTIONS_SERVICE_API_CALL: Making API request', {
        url: '/transactions/',
        method: 'POST',
        dataKeys: Object.keys(transaction),
        code: 'SERVICE_002'
      })
      
      const response = await apiClient.post('/transactions/', transaction)
      
      console.log('✅ TRANSACTIONS_SERVICE_SUCCESS: Transaction created successfully', {
        transactionId: response.data.id,
        transactionType: response.data.transaction_type,
        storedFields: {
          asset_name: response.data.asset_name,
          asset_type: response.data.asset_type,
          custom_properties: response.data.custom_properties,
          asset_description: response.data.asset_description,
          unit_of_measure: response.data.unit_of_measure,
          acquisition_value: response.data.acquisition_value,
          current_value: response.data.current_value,
          quantity: response.data.quantity
        },
        code: 'SERVICE_003'
      })
      
      return response.data
    } catch (error) {
      console.error('❌ TRANSACTIONS_SERVICE_ERROR: Failed to create transaction', {
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        requestData: transaction,
        code: 'SERVICE_ERROR'
      })
      
      // Re-throw with more context
      if (error.response?.status === 422) {
        throw new Error(`VALIDATION_ERROR: ${JSON.stringify(error.response.data.detail)}`)
      } else if (error.response?.status === 401) {
        throw new Error('AUTHENTICATION_ERROR: Please log in again')
      } else if (error.response?.status === 403) {
        throw new Error('AUTHORIZATION_ERROR: Insufficient permissions')
      } else if (error.response?.status >= 500) {
        throw new Error('SERVER_ERROR: Internal server error')
      } else {
        throw error
      }
    }
  },

  async updateTransaction(id, transaction) {
    const response = await apiClient.put(`/transactions/${id}/`, transaction)
    return response.data
  },

  async deleteTransaction(id) {
    const response = await apiClient.delete(`/transactions/${id}/`)
    return response.data
  }
}

