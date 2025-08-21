import { useState, useEffect } from 'react'
import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import ConfirmationDialog from '@/components/ui/confirmation-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  FileText,
  DollarSign,
  AlertTriangle,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { transactionsService } from '@/services/transactions'
import { assetsService } from '@/services/assets'
import { assetTypes } from '@/constants/assetTypes'

// Transaction types
const transactionTypes = [
  { value: 'create', label: 'Create Asset', icon: Plus, color: 'text-green-500', description: 'Add a new asset to your portfolio' },
  { value: 'sale', label: 'Mark as Sold', icon: ArrowDownLeft, color: 'text-red-500', description: 'Mark asset as sold' },
  { value: 'update_acquisition_value', label: 'Update Acquisition Value', icon: DollarSign, color: 'text-blue-500', description: 'Change original purchase value' },
  { value: 'update_market_value', label: 'Update Market Value', icon: RefreshCw, color: 'text-blue-500', description: 'Update current market value' },
  { value: 'update_name', label: 'Update Name', icon: FileText, color: 'text-gray-500', description: 'Change asset name' },
  { value: 'update_type', label: 'Update Type', icon: ArrowUpRight, color: 'text-purple-500', description: 'Change asset category' },
  { value: 'delete', label: 'Delete Asset', icon: Trash2, color: 'text-red-600', description: 'Permanently remove asset (irreversible)' }
]

export default function Transactions() {
  console.log('Transactions: Component initializing')
  
  const [transactions, setTransactions] = useState([])
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [selectedTransactionType, setSelectedTransactionType] = useState('create')
  
  // Enhanced filtering state
  const [filters, setFilters] = useState({
    assetName: '',
    assetType: 'all',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
    sortBy: 'transaction_date',
    sortOrder: 'desc'
  })
  
  // Global preferences trigger for re-renders
  const [globalPreferencesVersion, setGlobalPreferencesVersion] = useState(0);
  
  // Confirmation dialog state
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    transaction: null,
    type: null // 'create' or 'other'
  })
  
  console.log('Transactions: State initialized, loading:', loading)
  
  // Form state
  const [transactionForm, setTransactionForm] = useState({
    transaction_type: 'create',
    asset_id: '',
    // Asset creation fields
    asset_name: '',
    asset_type: '',
    purchase_date: new Date().toISOString().split('T')[0], // Default to today's date
    initial_value: '',
    current_value: '',
    quantity: '1',
    unit_of_measure: 'units',
    description: '',
    // Custom properties
    custom_properties: '',
    // Transaction fields
    amount: '',
    notes: '',
    // Bank/Cash selection for sales
    bank_cash_id: ''
  })
  
  const { toast } = useToast()
  // Note: useAuth provides user info, but authentication is handled by apiClient

  console.log('Transactions: About to set up useEffect')

  useEffect(() => {
    console.log('Transactions: useEffect triggered, calling fetchTransactions and fetchAssets')
    fetchTransactions()
    fetchAssets()
  }, [])

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

  const fetchTransactions = async () => {
    console.log('Transactions: fetchTransactions called')
    try {
      console.log('Transactions: Calling transactionsService.getTransactions()')
      const data = await transactionsService.getTransactions()
      console.log('Transactions: Received data:', data)
      setTransactions(data || [])
      console.log('Transactions: Set transactions state')
    } catch (error) {
      console.error('Transactions: Failed to fetch transactions:', error)
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive"
      })
    } finally {
      console.log('Transactions: Setting loading to false')
      setLoading(false)
    }
  }

  const fetchAssets = async () => {
    try {
      const data = await assetsService.getAssets()
      setAssets(data || [])
    } catch (error) {
      console.error('Failed to fetch assets:', error)
    }
  }

  const resetForm = () => {
    setTransactionForm({
      transaction_type: 'create',
      asset_id: '',
      asset_name: '',
      asset_type: '',
      purchase_date: new Date().toISOString().split('T')[0], // Default to today's date
      initial_value: '',
      current_value: '',
      quantity: '1',
      unit_of_measure: 'units',
      description: '',
      custom_properties: '',
      amount: '',
      notes: '',
      bank_cash_id: ''
    })
    setSelectedTransactionType('create')
    setEditingTransaction(null)
  }

  const handleTransactionTypeChange = (type) => {
    setSelectedTransactionType(type)
    setTransactionForm(prev => ({ ...prev, transaction_type: type }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const currentTime = Date.now()
    
    // Prevent duplicate submissions with both state and timing checks
    if (submitting) {
      console.log('🚫 SUBMIT_BLOCKED: Form submission already in progress')
      return
    }
    
    // Prevent rapid successive submissions (within 2 seconds)
    if (currentTime - lastSubmissionTime < 2000) {
      console.log('🚫 SUBMIT_BLOCKED: Too soon after last submission')
      return
    }
    
    setSubmitting(true)
    setLastSubmissionTime(currentTime)
    console.log('🚀 TRANSACTION_SUBMIT_START: Form submission initiated', {
      transactionType: transactionForm.transaction_type,
      formData: transactionForm,
      timestamp: new Date().toISOString(),
      submissionId: currentTime
    })
    
    try {
      if (editingTransaction) {
        // Update existing transaction
        await transactionsService.updateTransaction(editingTransaction.id, transactionForm)
        toast({
          title: "Success",
          description: "Transaction updated successfully"
        })
      } else {
        // Create new transaction
        if (transactionForm.transaction_type === 'create') {
          console.log('📝 CREATE_ASSET_START: Creating new asset via transaction', {
            assetName: transactionForm.asset_name,
            assetType: transactionForm.asset_type,
            code: 'CREATE_001'
          })
          
          // Validate required fields before API call
          if (!transactionForm.asset_name?.trim()) {
            throw new Error('VALIDATION_ERROR_001: Asset name is required')
          }
          if (!transactionForm.asset_type?.trim()) {
            throw new Error('VALIDATION_ERROR_002: Asset type is required')
          }
          if (!transactionForm.purchase_date) {
            throw new Error('VALIDATION_ERROR_003: Purchase date is required')
          }
          
          // 🎯 PURE TRANSACTION-CENTRIC: Send everything directly to transactions endpoint
          console.log('� CREATE_TRANSACTION_DIRECT: Creating transaction with all asset data', {
            formData: transactionForm,
            code: 'CREATE_002'
          })
          
          // 🎯 ALL DATA GOES TO TRANSACTIONS ENDPOINT (no asset creation needed)
          const transactionData = {
            // Asset will be created automatically by backend based on transaction data
            transaction_type: 'create',
            transaction_date: transactionForm.purchase_date,
            amount: parseFloat(transactionForm.initial_value) || 0,
            quantity_change: parseFloat(transactionForm.quantity) || 1,
            notes: transactionForm.notes?.trim() || '',
            // 🎯 ALL 10 FRONTEND FIELDS SENT TO TRANSACTIONS:
            asset_name: transactionForm.asset_name.trim(),
            asset_type: transactionForm.asset_type,
            acquisition_value: parseFloat(transactionForm.initial_value) || 0,
            current_value: parseFloat(transactionForm.current_value) || parseFloat(transactionForm.initial_value) || 0,
            quantity: parseFloat(transactionForm.quantity) || 1,
            unit_of_measure: transactionForm.unit_of_measure?.trim() || '',
            custom_properties: transactionForm.custom_properties?.trim() || '',
            asset_description: transactionForm.description?.trim() || ''
          }
          
          console.log('📋 CREATE_TRANSACTION_DATA: Transaction data prepared', {
            transactionData,
            fieldsCount: Object.keys(transactionData).length,
            code: 'CREATE_004'
          })
          
          console.log('🔍 PURE_TRANSACTION_MAPPING: All data routed to transactions', {
            mapping: {
              'asset_name (UI)': `${transactionForm.asset_name?.trim()} → ${transactionData.asset_name}`,
              'asset_type (UI)': `${transactionForm.asset_type} → ${transactionData.asset_type}`,
              'purchase_date (UI)': `${transactionForm.purchase_date} → ${transactionData.transaction_date}`,
              'initial_value (UI)': `${transactionForm.initial_value} → ${transactionData.acquisition_value}`,
              'current_value (UI)': `${transactionForm.current_value} → ${transactionData.current_value}`,
              'quantity (UI)': `${transactionForm.quantity} → ${transactionData.quantity}`,
              'unit_of_measure (UI)': `${transactionForm.unit_of_measure} → ${transactionData.unit_of_measure}`,
              'custom_properties (UI)': `${transactionForm.custom_properties} → ${transactionData.custom_properties}`,
              'description (UI)': `${transactionForm.description} → ${transactionData.asset_description}`,
              'notes (UI)': `${transactionForm.notes} → ${transactionData.notes}`
            },
            routedTo: '/transactions/ (EXISTING ENDPOINT - FALLBACK)',
            code: 'CREATE_003'
          })
          
          // Use the existing transactions service (avoid connection reset)
          const newTransaction = await transactionsService.createTransaction(transactionData)
          
          console.log('✅ PURE_TRANSACTION_SUCCESS: Transaction created with all asset data', {
            transactionId: newTransaction.id,
            transactionType: newTransaction.transaction_type,
            amount: newTransaction.amount,
            assetFieldsStored: {
              asset_name: newTransaction.asset_name,
              asset_type: newTransaction.asset_type,
              custom_properties: newTransaction.custom_properties,
              asset_description: newTransaction.asset_description,
              unit_of_measure: newTransaction.unit_of_measure
            },
            code: 'CREATE_004'
          })
          
          toast({
            title: "Asset created successfully!",
            description: `${transactionForm.asset_name} has been added to your portfolio.`,
          })
          
        } else {
          console.log('🔄 UPDATE_TRANSACTION_START: Processing update transaction', {
            transactionType: transactionForm.transaction_type,
            assetId: transactionForm.asset_id,
            code: 'UPDATE_001'
          })

          if (!transactionForm.asset_id) {
            throw new Error('VALIDATION_ERROR_004: Asset selection is required for updates')
          }

          // Sale logic: create two transactions
          if (transactionForm.transaction_type === 'sale') {
            if (!transactionForm.bank_cash_id) {
              throw new Error('VALIDATION_ERROR_005: Please select a bank or cash account to deposit sale amount')
            }

            console.log('🔥 SALE_START: Beginning dual transaction process', {
              soldAssetId: transactionForm.asset_id,
              saleAmount: transactionForm.amount,
              bankAccountId: transactionForm.bank_cash_id,
              submissionId: currentTime
            })

            // 1. Record asset sale transaction
            const saleTransaction = {
              asset_id: transactionForm.asset_id,
              transaction_type: 'sale',
              transaction_date: new Date().toISOString().split('T')[0],
              amount: parseFloat(transactionForm.amount) || 0,
              notes: transactionForm.notes?.trim() || ''
            }
            
            console.log('🔥 SALE_STEP_1: Creating sale transaction', saleTransaction)
            await transactionsService.createTransaction(saleTransaction)
            console.log('✅ SALE_STEP_1_COMPLETE: Sale transaction created successfully')

            // 2. Record cash/bank increase transaction
            const cashTransaction = {
              asset_id: transactionForm.bank_cash_id,
              transaction_type: 'cash_deposit',
              transaction_date: new Date().toISOString().split('T')[0],
              amount: parseFloat(transactionForm.amount) || 0,
              notes: `Asset sale proceeds from asset ID ${transactionForm.asset_id}`
            }
            
            console.log('🔥 SALE_STEP_2: Creating cash deposit transaction', cashTransaction)
            await transactionsService.createTransaction(cashTransaction)
            console.log('✅ SALE_STEP_2_COMPLETE: Cash deposit transaction created successfully')

            console.log('🎉 SALE_COMPLETE: Dual transaction process completed successfully', {
              submissionId: currentTime
            })

            toast({
              title: "Sale recorded!",
              description: "Asset marked as sold and sale amount deposited to selected account.",
            })
          } else {
            // For other transaction types, just create the transaction
            const transactionData = {
              asset_id: transactionForm.asset_id,
              transaction_type: transactionForm.transaction_type,
              transaction_date: new Date().toISOString().split('T')[0],
              amount: parseFloat(transactionForm.amount) || 0,
              notes: transactionForm.notes?.trim() || ''
            }

            // Add asset_name for update_name transactions
            if (transactionForm.transaction_type === 'update_name' && transactionForm.asset_name) {
              transactionData.asset_name = transactionForm.asset_name.trim()
            }

            // Add asset_type for update_type transactions  
            if (transactionForm.transaction_type === 'update_type' && transactionForm.asset_type) {
              transactionData.asset_type = transactionForm.asset_type
            }

            console.log('📋 UPDATE_TRANSACTION_DATA: Update transaction data', {
              transactionData,
              code: 'UPDATE_002'
            })

            await transactionsService.createTransaction(transactionData)

            console.log('✅ UPDATE_SUCCESS: Transaction updated', {
              transactionType: transactionForm.transaction_type,
              code: 'UPDATE_003'
            })

            toast({
              title: "Transaction recorded successfully!",
              description: "The transaction has been processed.",
            })
          }
        }
      }
      
      // Refresh data and close dialog
      console.log('🔄 REFRESH_START: Refreshing transaction and asset lists', {
        code: 'REFRESH_001'
      })
      
      setShowTransactionDialog(false)
      resetForm()
      await Promise.all([fetchTransactions(), fetchAssets()])
      
      console.log('✅ REFRESH_SUCCESS: Data refreshed successfully', {
        code: 'REFRESH_002'
      })
      
      console.log('🎉 TRANSACTION_SUBMIT_COMPLETE: Form submission completed successfully', {
        transactionType: transactionForm.transaction_type,
        timestamp: new Date().toISOString(),
        code: 'COMPLETE_001'
      })
      
    } catch (error) {
      console.error('❌ TRANSACTION_SUBMIT_ERROR: Form submission failed', {
        error: error.message,
        stack: error.stack,
        formData: transactionForm,
        errorCode: error.message.includes('_ERROR_') ? error.message.split(':')[0] : 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString(),
        code: 'ERROR_001'
      })
      
      let errorMessage = "Failed to process transaction. Please try again."
      
      // Provide specific error messages based on error codes
      if (error.message.includes('VALIDATION_ERROR_001')) {
        errorMessage = "Asset name is required."
      } else if (error.message.includes('VALIDATION_ERROR_002')) {
        errorMessage = "Please select an asset type."
      } else if (error.message.includes('VALIDATION_ERROR_003')) {
        errorMessage = "Purchase date is required."
      } else if (error.message.includes('VALIDATION_ERROR_004')) {
        errorMessage = "Please select an asset to update."
      } else if (error.message.includes('Network Error') || error.message.includes('fetch')) {
        errorMessage = "Network error. Please check your connection and try again."
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage = "Authentication error. Please refresh the page and try again."
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        errorMessage = "Permission denied. Please check your access rights."
      } else if (error.message.includes('500')) {
        errorMessage = "Server error. Please try again in a few moments."
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setTransactionForm({
      ...transactionForm,
      transaction_type: transaction.transaction_type,
      asset_id: transaction.asset_id,
      amount: transaction.amount?.toString() || '',
      notes: transaction.notes || ''
    })
    setSelectedTransactionType(transaction.transaction_type)
    setShowTransactionDialog(true)
  }

  const handleDelete = async (transactionId) => {
    // Find the transaction to understand its type
    const transaction = transactions.find(t => t.id === transactionId)
    if (!transaction) {
      toast({
        title: "Error",
        description: "Transaction not found",
        variant: "destructive"
      })
      return
    }

    // Open confirmation dialog with appropriate message
    setConfirmationDialog({
      isOpen: true,
      transaction,
      type: transaction.transaction_type === 'create' ? 'create' : 'other'
    })
  }

  const confirmDelete = async () => {
    try {
      const result = await transactionsService.deleteTransaction(confirmationDialog.transaction.id)
      
      // Close dialog first
      setConfirmationDialog({ isOpen: false, transaction: null, type: null })
      
      // Show appropriate success message
      toast({
        title: "Success",
        description: result.message || "Transaction deleted successfully"
      })
      
      // Refresh data
      fetchTransactions()
      fetchAssets() // Also refresh assets if an asset was deleted
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      
      // Close dialog
      setConfirmationDialog({ isOpen: false, transaction: null, type: null })
      
      toast({
        title: "Error",
        description: error.message || "Failed to delete transaction",
        variant: "destructive"
      })
    }
  }

  const cancelDelete = () => {
    setConfirmationDialog({ isOpen: false, transaction: null, type: null })
  }

  // Sorting function
  const handleSort = (sortBy) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc'
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: newSortOrder
    }))
  }

  // Sortable header component
  const SortableHeader = ({ label, sortKey, className = "" }) => {
    const isActive = filters.sortBy === sortKey
    const isAsc = filters.sortOrder === 'asc'
    
    return (
      <TableHead 
        className={`cursor-pointer hover:bg-gray-50 select-none ${className}`}
        onClick={() => handleSort(sortKey)}
      >
        <div className="flex items-center gap-1">
          <span>{label}</span>
          <div className="flex flex-col">
            <ChevronUp 
              className={`h-3 w-3 ${isActive && !isAsc ? 'text-blue-600' : 'text-gray-400'}`} 
            />
            <ChevronDown 
              className={`h-3 w-3 -mt-1 ${isActive && isAsc ? 'text-blue-600' : 'text-gray-400'}`} 
            />
          </div>
        </div>
      </TableHead>
    )
  }

  const formatCurrency = (amount) => {
    // Get global currency preference
    const globalCurrency = localStorage.getItem('globalCurrency') || 'USD';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: globalCurrency
    }).format(amount || 0)
  }

  const getTransactionTypeInfo = (type) => {
    return transactionTypes.find(t => t.value === type) || transactionTypes[0]
  }

  // Format asset type for display
  const formatAssetType = (assetTypeValue) => {
    if (!assetTypeValue) return 'N/A'
    
    // Find the asset type in our configuration
    for (const [category, types] of Object.entries(assetTypes)) {
      const foundType = types.find(type => type.value === assetTypeValue)
      if (foundType) {
        return `${category} - ${foundType.label}`
      }
    }
    
    // Fallback: format the raw value if not found in config
    return assetTypeValue
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const filteredTransactions = transactions.filter(transaction => {
    // Search term matching
    const matchesSearch = searchTerm === '' || 
      transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.asset_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Transaction type matching
    const matchesType = selectedType === 'all' || transaction.transaction_type === selectedType
    
    // Asset name filter
    const matchesAssetName = filters.assetName === '' || 
      transaction.asset_name?.toLowerCase().includes(filters.assetName.toLowerCase())
    
    // Asset type filter  
    const matchesAssetType = filters.assetType === 'all' || 
      transaction.asset_type === filters.assetType
    
    // Date range filter
    const transactionDate = new Date(transaction.transaction_date)
    const matchesDateFrom = filters.dateFrom === '' || 
      transactionDate >= new Date(filters.dateFrom)
    const matchesDateTo = filters.dateTo === '' || 
      transactionDate <= new Date(filters.dateTo + 'T23:59:59')
    
    // Amount range filter
    const amount = parseFloat(transaction.amount || 0)
    const matchesAmountMin = filters.amountMin === '' || 
      amount >= parseFloat(filters.amountMin)
    const matchesAmountMax = filters.amountMax === '' || 
      amount <= parseFloat(filters.amountMax)
    
    return matchesSearch && matchesType && matchesAssetName && 
           matchesAssetType && matchesDateFrom && matchesDateTo && 
           matchesAmountMin && matchesAmountMax
  }).sort((a, b) => {
    // Sorting logic
    let aVal, bVal
    
    switch (filters.sortBy) {
      case 'transaction_date':
        aVal = new Date(a.transaction_date)
        bVal = new Date(b.transaction_date)
        break
      case 'asset_name':
        aVal = a.asset_name?.toLowerCase() || ''
        bVal = b.asset_name?.toLowerCase() || ''
        break
      case 'amount':
        aVal = parseFloat(a.amount || 0)
        bVal = parseFloat(b.amount || 0)
        break
      case 'transaction_type':
        aVal = a.transaction_type || ''
        bVal = b.transaction_type || ''
        break
      default:
        return 0
    }
    
    if (filters.sortOrder === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
    }
  })

  const openNewTransactionDialog = () => {
    resetForm()
    setShowTransactionDialog(true)
  }

  // Filter management functions
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedType('all')
    setFilters({
      assetName: '',
      assetType: 'all',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
      sortBy: 'transaction_date',
      sortOrder: 'desc'
    })
  }

  // Get unique asset types for filter dropdown
  const uniqueAssetTypes = [...new Set(transactions.map(t => t.asset_type).filter(Boolean))]

  if (loading) {
    console.log('Transactions: Rendering loading state')
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  console.log('Transactions: Rendering main component')
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">
            Manage all your asset transactions - create, update, and track your portfolio changes.
          </p>
        </div>
        <Button onClick={openNewTransactionDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Transaction
        </Button>
      </div>

      {/* Transaction Dialog */}
      <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
            </DialogTitle>
            <DialogDescription>
              {editingTransaction ? 'Modify existing transaction details' : 'Choose a transaction type and fill in the details'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Type Selection */}
            {!editingTransaction && (
              <div className="space-y-3">
                <Label>Transaction Type</Label>
                <Tabs value={selectedTransactionType} onValueChange={handleTransactionTypeChange}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="create">Create</TabsTrigger>
                    <TabsTrigger value="update_acquisition_value">Update</TabsTrigger>
                    <TabsTrigger value="sale">Other</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="create" className="space-y-2">
                    <div className="grid grid-cols-1 gap-2">
                      {transactionTypes.filter(t => t.value === 'create').map((type) => {
                        const Icon = type.icon
                        return (
                          <div
                            key={type.value}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedTransactionType === type.value ? 'border-primary bg-primary/10' : 'hover:bg-muted'
                            }`}
                            onClick={() => handleTransactionTypeChange(type.value)}
                          >
                            <div className="flex items-center space-x-2">
                              <Icon className={`h-4 w-4 ${type.color}`} />
                              <span className="font-medium">{type.label}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                          </div>
                        )
                      })}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="update_acquisition_value" className="space-y-2">
                    <div className="grid grid-cols-1 gap-2">
                      {transactionTypes.filter(t => ['update_acquisition_value', 'update_market_value', 'update_name', 'update_type'].includes(t.value)).map((type) => {
                        const Icon = type.icon
                        return (
                          <div
                            key={type.value}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedTransactionType === type.value ? 'border-primary bg-primary/10' : 'hover:bg-muted'
                            }`}
                            onClick={() => handleTransactionTypeChange(type.value)}
                          >
                            <div className="flex items-center space-x-2">
                              <Icon className={`h-4 w-4 ${type.color}`} />
                              <span className="font-medium">{type.label}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                          </div>
                        )
                      })}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sale" className="space-y-2">
                    <div className="grid grid-cols-1 gap-2">
                      {transactionTypes.filter(t => ['sale', 'delete'].includes(t.value)).map((type) => {
                        const Icon = type.icon
                        return (
                          <div
                            key={type.value}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedTransactionType === type.value ? 'border-primary bg-primary/10' : 'hover:bg-muted'
                            }`}
                            onClick={() => handleTransactionTypeChange(type.value)}
                          >
                            <div className="flex items-center space-x-2">
                              <Icon className={`h-4 w-4 ${type.color}`} />
                              <span className="font-medium">{type.label}</span>
                              {type.value === 'delete' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                          </div>
                        )
                      })}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Asset Creation Form */}
            {selectedTransactionType === 'create' && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium text-lg">Asset Details</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="asset_name">Asset Name *</Label>
                    <Input
                      id="asset_name"
                      value={transactionForm.asset_name}
                      onChange={(e) => setTransactionForm({...transactionForm, asset_name: e.target.value})}
                      placeholder="e.g., Apple Stock, Gold Coins"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="asset_type">Asset Type *</Label>
                    <Select 
                      value={transactionForm.asset_type} 
                      onValueChange={(value) => setTransactionForm({...transactionForm, asset_type: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(assetTypes).map(([category, types]) => (
                          // Exclude annuities from dropdown
                          category.includes('Annuities')
                            ? null
                            : types.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {category} - {type.label}
                                </SelectItem>
                              ))
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchase_date">Purchase Date *</Label>
                    <Input
                      id="purchase_date"
                      type="date"
                      value={transactionForm.purchase_date}
                      onChange={(e) => setTransactionForm({...transactionForm, purchase_date: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="initial_value">Acquisition Value *</Label>
                    <Input
                      id="initial_value"
                      type="number"
                      step="0.01"
                      value={transactionForm.initial_value}
                      onChange={(e) => setTransactionForm({...transactionForm, initial_value: e.target.value})}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="current_value">Current Value</Label>
                    <Input
                      id="current_value"
                      type="number"
                      step="0.01"
                      value={transactionForm.current_value}
                      onChange={(e) => setTransactionForm({...transactionForm, current_value: e.target.value})}
                      placeholder="Same as acquisition value"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.0001"
                      value={transactionForm.quantity}
                      onChange={(e) => setTransactionForm({...transactionForm, quantity: e.target.value})}
                      placeholder="1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="unit_of_measure">Unit</Label>
                    <Input
                      id="unit_of_measure"
                      value={transactionForm.unit_of_measure}
                      onChange={(e) => setTransactionForm({...transactionForm, unit_of_measure: e.target.value})}
                      placeholder="e.g., shares, oz, sqft"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom_properties">Custom Properties</Label>
                  <Textarea
                    id="custom_properties"
                    value={transactionForm.custom_properties}
                    onChange={(e) => setTransactionForm({...transactionForm, custom_properties: e.target.value})}
                    placeholder="e.g., Weight: 2.5 oz, Purity: 24k, Location: Bank Safe"
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    Add custom properties specific to this asset type (free-form text)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                    placeholder="Additional details about this asset"
                    rows={2}
                  />
                </div>
              </div>
            )}

            {/* Asset Selection for Updates */}
            {selectedTransactionType !== 'create' && (
              <div className="space-y-2">
                <Label htmlFor="asset_select">Select Asset *</Label>
                <Select 
                  value={transactionForm.asset_id} 
                  onValueChange={(value) => setTransactionForm({...transactionForm, asset_id: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an asset to modify" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name} ({asset.asset_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Amount field for value updates */}
            {['update_acquisition_value', 'update_market_value'].includes(selectedTransactionType) && (
              <div className="space-y-2">
                <Label htmlFor="amount">New Value *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>
            )}

            {/* Sale flow: Sale Amount and Bank/Cash selection */}
            {selectedTransactionType === 'sale' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="amount">Sale Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_cash_select">Deposit To *</Label>
                  <Select
                    value={transactionForm.bank_cash_id || ''}
                    onValueChange={(value) => setTransactionForm({...transactionForm, bank_cash_id: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Bank or Cash" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* List all assets of type 'bank' or 'cash_in_hand' */}
                      {assets
                        .filter(asset => ['bank', 'cash_in_hand'].includes(asset.asset_type))
                        .map(asset => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.name} ({asset.asset_type === 'bank' ? 'Bank Account' : 'Cash in Hand'})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Asset Name Input for Update Name */}
            {selectedTransactionType === 'update_name' && (
              <div className="space-y-2">
                <Label htmlFor="asset_name">New Asset Name *</Label>
                <Input
                  id="asset_name"
                  type="text"
                  placeholder="Enter new asset name"
                  value={transactionForm.asset_name || ''}
                  onChange={(e) => setTransactionForm({...transactionForm, asset_name: e.target.value})}
                  required
                />
              </div>
            )}

            {/* Asset Type Select for Update Type */}
            {selectedTransactionType === 'update_type' && (
              <div className="space-y-2">
                <Label htmlFor="asset_type">New Asset Type *</Label>
                <Select 
                  value={transactionForm.asset_type || ''} 
                  onValueChange={(value) => setTransactionForm({...transactionForm, asset_type: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(assetTypes).map(([category, types]) => (
                      // Exclude annuities from dropdown for transactions
                      category.includes('Annuities')
                        ? null
                        : (
                          <SelectGroup key={category}>
                            <SelectLabel>{category.charAt(0).toUpperCase() + category.slice(1)}</SelectLabel>
                            {types.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        )
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={transactionForm.notes}
                onChange={(e) => setTransactionForm({...transactionForm, notes: e.target.value})}
                placeholder="Additional notes about this transaction"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowTransactionDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Processing...' : (editingTransaction ? 'Update Transaction' : 'Record Transaction')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Enhanced Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* First row - Search and Type */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Transactions</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by asset name, notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Label htmlFor="type-filter">Transaction Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {transactionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Second row - Asset filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="asset-name">Asset Name</Label>
                <Input
                  id="asset-name"
                  placeholder="Filter by asset name..."
                  value={filters.assetName}
                  onChange={(e) => updateFilter('assetName', e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <Label htmlFor="asset-type">Asset Type</Label>
                <Select value={filters.assetType} onValueChange={(value) => updateFilter('assetType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All asset types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All asset types</SelectItem>
                    {uniqueAssetTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Third row - Date range */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="date-from">From Date</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="date-to">To Date</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                />
              </div>
            </div>

            {/* Fourth row - Amount range */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="amount-min">Min Amount ($)</Label>
                <Input
                  id="amount-min"
                  type="number"
                  placeholder="0"
                  value={filters.amountMin}
                  onChange={(e) => updateFilter('amountMin', e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="amount-max">Max Amount ($)</Label>
                <Input
                  id="amount-max"
                  type="number"
                  placeholder="No limit"
                  value={filters.amountMax}
                  onChange={(e) => updateFilter('amountMax', e.target.value)}
                />
              </div>
            </div>

            {/* Fifth row - Sorting and actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="sort-by">Sort By</Label>
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transaction_date">Date</SelectItem>
                    <SelectItem value="asset_name">Asset Name</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="transaction_type">Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-32">
                <Label htmlFor="sort-order">Order</Label>
                <Select value={filters.sortOrder} onValueChange={(value) => updateFilter('sortOrder', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                variant="outline" 
                onClick={clearAllFilters}
                className="w-full sm:w-auto"
              >
                Clear All Filters
              </Button>
            </div>

            {/* Filter summary */}
            {(searchTerm || selectedType !== 'all' || Object.values(filters).some(v => v !== '' && v !== 'all' && v !== 'transaction_date' && v !== 'desc')) && (
              <div className="pt-2 border-t">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {searchTerm && (
                    <Badge variant="secondary" className="text-xs">
                      Search: "{searchTerm}"
                    </Badge>
                  )}
                  {selectedType !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Type: {transactionTypes.find(t => t.value === selectedType)?.label}
                    </Badge>
                  )}
                  {filters.assetName && (
                    <Badge variant="secondary" className="text-xs">
                      Asset: "{filters.assetName}"
                    </Badge>
                  )}
                  {filters.assetType !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Asset Type: {filters.assetType}
                    </Badge>
                  )}
                  {filters.dateFrom && (
                    <Badge variant="secondary" className="text-xs">
                      From: {filters.dateFrom}
                    </Badge>
                  )}
                  {filters.dateTo && (
                    <Badge variant="secondary" className="text-xs">
                      To: {filters.dateTo}
                    </Badge>
                  )}
                  {filters.amountMin && (
                    <Badge variant="secondary" className="text-xs">
                      Min: ${filters.amountMin}
                    </Badge>
                  )}
                  {filters.amountMax && (
                    <Badge variant="secondary" className="text-xs">
                      Max: ${filters.amountMax}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History ({filteredTransactions.length})</CardTitle>
          <CardDescription>
            Complete record of all asset transactions and modifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader label="TXN ID" sortKey="id" className="w-24" />
                <SortableHeader label="Asset ID" sortKey="asset_id" className="w-24" />
                <SortableHeader label="Date" sortKey="transaction_date" />
                <SortableHeader label="Type" sortKey="transaction_type" />
                <SortableHeader label="Asset Details" sortKey="asset_name" />
                <SortableHeader label="Values" sortKey="amount" />
                <TableHead>Quantity & Unit</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => {
                  const typeInfo = getTransactionTypeInfo(transaction.transaction_type)
                  const Icon = typeInfo.icon
                  
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-xs">
                        {transaction.id ? transaction.id.substring(0, 8) : 'N/A'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {transaction.asset_id ? transaction.asset_id.substring(0, 8) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.transaction_date || transaction.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Icon className={`mr-2 h-4 w-4 ${typeInfo.color}`} />
                          <Badge variant="outline">{typeInfo.label}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{transaction.asset_name || 'Unknown Asset'}</div>
                          <div className="text-sm text-muted-foreground">
                            Type: {formatAssetType(transaction.asset_type)}
                          </div>
                          {transaction.asset_description && (
                            <div className="text-xs text-muted-foreground max-w-xs truncate">
                              {transaction.asset_description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {transaction.acquisition_value && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Acquired:</span> {formatCurrency(transaction.acquisition_value)}
                            </div>
                          )}
                          {transaction.current_value && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Current:</span> {formatCurrency(transaction.current_value)}
                            </div>
                          )}
                          {transaction.amount && (
                            <div className={`text-sm font-medium ${typeInfo.color}`}>
                              <span className="text-muted-foreground">Amount:</span> {formatCurrency(transaction.amount)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {transaction.quantity && (
                            <div className="text-sm">
                              <span className="font-medium">{transaction.quantity}</span>
                              {transaction.unit_of_measure && (
                                <span className="text-muted-foreground"> {transaction.unit_of_measure}</span>
                              )}
                            </div>
                          )}
                          {!transaction.quantity && (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {transaction.custom_properties ? (
                            <div className="text-xs text-muted-foreground truncate" title={transaction.custom_properties}>
                              {transaction.custom_properties}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {transaction.notes ? (
                            <div className="text-sm truncate" title={transaction.notes}>
                              {transaction.notes}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(transaction)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(transaction.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchTerm || selectedType ? 'No transactions match your filters' : 'No transactions found. Record your first transaction to get started.'}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Enhanced Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={confirmationDialog.type === 'create' ? "Delete Asset & All Transactions" : "Delete Transaction"}
        message={
          confirmationDialog.type === 'create' 
            ? "You are about to delete a 'Create Asset' transaction. This will permanently remove the entire asset and ALL related transactions from your portfolio."
            : "You are about to delete this individual transaction. The asset will remain in your portfolio, but this transaction record will be permanently removed."
        }
        confirmText={confirmationDialog.type === 'create' ? "Delete Asset & All Transactions" : "Delete Transaction"}
        cancelText="Cancel"
        variant={confirmationDialog.type === 'create' ? "danger" : "warning"}
        asset={confirmationDialog.transaction ? {
          name: confirmationDialog.transaction.asset_name,
          asset_type: confirmationDialog.transaction.asset_type,
          current_value: confirmationDialog.transaction.current_value || confirmationDialog.transaction.amount
        } : null}
      />
    </div>
  )
}
