import { useState, useEffect } from 'react'
import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
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
  AlertTriangle
} from 'lucide-react'
import { transactionsService } from '@/services/transactions'
import { assetsService } from '@/services/assets'

// Asset types with categorization
const assetTypes = {
  'Real Estate': [
    { value: 'real_estate_residential', label: 'Residential' },
    { value: 'real_estate_commercial', label: 'Commercial' },
    { value: 'real_estate_agricultural', label: 'Agricultural' },
    { value: 'real_estate_industrial', label: 'Industrial' }
  ],
  'Financial Instruments': [
    { value: 'stocks', label: 'Stocks' },
    { value: 'bonds', label: 'Bonds' },
    { value: 'mutual_funds', label: 'Mutual Funds' },
    { value: 'etf', label: 'ETF' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'fd', label: 'Fixed Deposit' },
    { value: 'bank', label: 'Bank Account' },
    { value: 'cash_in_hand', label: 'Cash in Hand' }
  ],
  'Physical Assets': [
    { value: 'precious_metal_gold', label: 'Gold' },
    { value: 'precious_metal_silver', label: 'Silver' },
    { value: 'precious_metal_platinum', label: 'Platinum' },
    { value: 'jewellery_simple', label: 'Jewellery (without stones)' },
    { value: 'jewellery_precious_stones', label: 'Jewellery (with precious stones)' },
    { value: 'cars', label: 'Cars' },
    { value: 'antiques', label: 'Antiques & Collections' }
  ],
  'Other': [
    { value: 'royalties', label: 'Royalties' },
    { value: 'misc', label: 'Miscellaneous' }
  ]
}

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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [selectedTransactionType, setSelectedTransactionType] = useState('create')
  
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
    notes: ''
  })
  
  const { toast } = useToast()

  console.log('Transactions: About to set up useEffect')

  useEffect(() => {
    console.log('Transactions: useEffect triggered, calling fetchTransactions and fetchAssets')
    fetchTransactions()
    fetchAssets()
  }, [])

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
      notes: ''
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
    console.log('🚀 TRANSACTION_SUBMIT_START: Form submission initiated', {
      transactionType: transactionForm.transaction_type,
      formData: transactionForm,
      timestamp: new Date().toISOString()
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
            routedTo: '/transactions/ (NOT /assets/)',
            code: 'CREATE_003'
          })
          
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
          
          // For other transaction types, just create the transaction
          const transactionData = {
            asset_id: transactionForm.asset_id,
            transaction_type: transactionForm.transaction_type,
            transaction_date: new Date().toISOString().split('T')[0],
            amount: parseFloat(transactionForm.amount) || 0,
            notes: transactionForm.notes?.trim() || ''
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
    if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      try {
        await transactionsService.deleteTransaction(transactionId)
        toast({
          title: "Success",
          description: "Transaction deleted successfully"
        })
        fetchTransactions()
      } catch (error) {
        console.error('Failed to delete transaction:', error)
        toast({
          title: "Error",
          description: "Failed to delete transaction",
          variant: "destructive"
        })
      }
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const getTransactionTypeInfo = (type) => {
    return transactionTypes.find(t => t.value === type) || transactionTypes[0]
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.asset_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !selectedType || selectedType === 'all' || transaction.transaction_type === selectedType
    return matchesSearch && matchesType
  })

  const openNewTransactionDialog = () => {
    resetForm()
    setShowTransactionDialog(true)
  }

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
                          <React.Fragment key={category}>
                            {types.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {category} - {type.label}
                              </SelectItem>
                            ))}
                          </React.Fragment>
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
            {['update_acquisition_value', 'update_market_value', 'sale'].includes(selectedTransactionType) && (
              <div className="space-y-2">
                <Label htmlFor="amount">
                  {selectedTransactionType === 'sale' ? 'Sale Amount' : 'New Value'} *
                </Label>
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
              <Button type="submit">
                {editingTransaction ? 'Update Transaction' : 'Record Transaction'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
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
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Amount</TableHead>
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
                        <div className="font-medium">{transaction.asset_name || 'Unknown Asset'}</div>
                      </TableCell>
                      <TableCell>
                        <span className={typeInfo.color}>
                          {transaction.amount ? formatCurrency(transaction.amount) : '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {transaction.notes || '-'}
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
                  <TableCell colSpan={6} className="text-center py-8">
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
    </div>
  )
}
