import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
import { useCurrency } from '@/hooks/useCurrency'
import { useToast } from '@/hooks/use-toast'
import ConfirmationDialog from '@/components/ui/confirmation-dialog'
import Loading from '@/components/ui/Loading'
import SafeSection from '@/components/util/SafeSection'
import { log, warn, error } from '@/lib/debug'
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
  ChevronDown,
  Droplets,
  Clock,
  Info,
  Calculator,
  Pencil,
  Target
} from 'lucide-react'
import { transactionsService } from '@/services/transactions'
import { assetsService } from '@/services/assets'
import { queryKeys } from '@/lib/queryKeys'
import { mutationHelpers } from '@/lib/queryUtils'
import { assetTypes } from '@/constants/assetTypes'

// Asset liquidity defaults based on asset type
const assetLiquidityDefaults = {
  // Highly liquid assets (can be sold within days)
  'stocks': true,
  'bonds': true,
  'mutual_funds': true,
  'etf': true,
  'crypto': true,
  'bank': true,
  'cash_in_hand': true,
  'fd': true, // Fixed deposits are typically liquid with some notice
  
  // Medium liquidity (may take weeks to months)
  'retirement_account': false, // Restricted access
  'aif': false,
  'private_equity': false,
  'esops': false,
  
  // Low liquidity (takes months to years)
  'real_estate_residential': false,
  'real_estate_commercial': false,
  'real_estate_agricultural': false,
  'real_estate_industrial': false,
  
  // Variable liquidity (depends on market conditions)
  'precious_metal_gold': true, // Generally liquid but may vary
  'precious_metal_silver': true,
  'precious_metal_platinum': true,
  'jewellery_simple': false, // Requires appraisal and finding buyers
  'jewellery_precious_stones': false,
  'cars': false,
  'antiques': false,
  
  // Insurance - typically illiquid
  'life_insurance_term': false,
  'life_insurance_whole': false,
  'life_insurance_universal': false,
  'life_insurance_variable': false,
  
  // Other
  'royalties': false,
  'misc': false
}

// Time horizon options
const timeHorizonOptions = [
  { value: 'short_term', label: 'Short Term (< 1 year)' },
  { value: 'medium_term', label: 'Medium Term (1-3 years)' },
  { value: 'long_term', label: 'Long Term (> 3 years)' }
]

// Asset Purpose options
const assetPurposeOptions = [
  { value: 'hyper_growth', label: 'Hyper Growth' },
  { value: 'growth', label: 'Growth' },
  { value: 'financial_security', label: 'Financial Security' },
  { value: 'emergency_fund', label: 'Emergency Fund' },
  { value: 'childrens_education', label: "Children's Education" },
  { value: 'retirement_fund', label: 'Retirement Fund' },
  { value: 'speculation', label: 'Speculation' }
]

// Transaction types
const transactionTypes = [
  { value: 'create', label: 'Create Asset', icon: Plus, color: 'text-green-500', description: 'Add a new asset to your portfolio' },
  { value: 'sale', label: 'Mark as Sold', icon: ArrowDownLeft, color: 'text-red-500', description: 'Mark asset as sold' },
  { value: 'update_acquisition_value', label: 'Update Acquisition Value', icon: DollarSign, color: 'text-blue-500', description: 'Change original purchase value' },
  { value: 'update_market_value', label: 'Update Market Value', icon: RefreshCw, color: 'text-blue-500', description: 'Update current market value' },
  { value: 'update_name', label: 'Update Name', icon: FileText, color: 'text-gray-500', description: 'Change asset name' },
  { value: 'update_type', label: 'Update Type', icon: ArrowUpRight, color: 'text-purple-500', description: 'Change asset category' },
  { value: 'update_liquid_status', label: 'Update Liquid Status', icon: Droplets, color: 'text-cyan-500', description: 'Change asset liquidity status' },
  { value: 'update_time_horizon', label: 'Update Time Horizon', icon: Clock, color: 'text-amber-500', description: 'Change investment time horizon' },
  { value: 'update_asset_purpose', label: 'Update Asset Purpose', icon: Target, color: 'text-teal-500', description: 'Change asset investment purpose' },
  { value: 'update_quantity_units', label: 'Update Quantity & Units', icon: Calculator, color: 'text-indigo-500', description: 'Change asset quantity and unit of measure' },
  { value: 'update_description_properties', label: 'Update Description & Properties', icon: Pencil, color: 'text-orange-500', description: 'Update asset description, notes, and custom properties' },
  { value: 'delete', label: 'Delete Asset', icon: Trash2, color: 'text-red-600', description: 'Permanently remove asset (irreversible)' }
]

export default function Transactions() {
  log('Transactions: Component initializing');
  
  // Verify critical service availability
  if (!transactionsService) {
    warn('Transactions: transactionsService not available, transaction operations may fail');
  }
  if (!assetsService) {
    warn('Transactions: assetsService not available, asset operations may fail');
  }
  if (!assetTypes) {
    warn('Transactions: assetTypes constants not available, asset type options may fail');
  }
  
  const { user } = useAuth()
  const { formatCurrency } = useCurrency()
  const queryClient = useQueryClient()
  
  // TanStack Query data fetching
  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    error: transactionsError
  } = useQuery({
    queryKey: queryKeys.transactions.list(),
    queryFn: ({ signal }) => transactionsService.getTransactions({ signal }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  const {
    data: assets = [],
    isLoading: assetsLoading,
    error: assetsError
  } = useQuery({
    queryKey: queryKeys.assets.list(),
    queryFn: ({ signal }) => assetsService.getAssets({ signal }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Create Transaction Mutation
  const createTransactionMutation = useMutation({
    mutationFn: (transactionData) => transactionsService.createTransaction(transactionData),
    onMutate: async (newTransaction) => {
      // Cancel outgoing fetches for transactions
      await queryClient.cancelQueries({ queryKey: queryKeys.transactions.list() })
      
      // Snapshot previous
      const previousTransactions = queryClient.getQueryData(queryKeys.transactions.list())
      
      // Optimistically update to show the transaction immediately
      queryClient.setQueryData(queryKeys.transactions.list(), (old = []) => [
        { ...newTransaction, id: `temp-${Date.now()}` }, // Temporary ID
        ...old
      ])
      
      return { previousTransactions }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousTransactions) {
        queryClient.setQueryData(queryKeys.transactions.list(), context.previousTransactions)
      }
      console.error('Transaction creation failed:', error)
    },
    onSuccess: (result, variables) => {
      console.log('✅ Transaction created:', result)
      
      // Use mutation helpers for proper invalidation and broadcasting
      mutationHelpers.onTransactionSuccess(queryClient, 'create', { 
        transactionId: result.id,
        transactionData: result 
      })
      
      // Close dialog and reset form
      setShowTransactionDialog(false)
      resetForm()
    },
  })

  // Update Transaction Mutation
  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, transactionData }) => transactionsService.updateTransaction(id, transactionData),
    onMutate: async ({ id, transactionData }) => {
      // Cancel outgoing fetches
      await queryClient.cancelQueries({ queryKey: queryKeys.transactions.list() })
      
      // Snapshot previous
      const previousTransactions = queryClient.getQueryData(queryKeys.transactions.list())
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.transactions.list(), (old = []) =>
        old.map(transaction => transaction.id === id ? { ...transaction, ...transactionData } : transaction)
      )
      
      return { previousTransactions }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousTransactions) {
        queryClient.setQueryData(queryKeys.transactions.list(), context.previousTransactions)
      }
      console.error('Transaction update failed:', error)
    },
    onSuccess: (result, { id }) => {
      console.log('✅ Transaction updated:', result)
      
      // Use mutation helpers for proper invalidation and broadcasting
      mutationHelpers.onTransactionSuccess(queryClient, 'update', { 
        transactionId: id,
        transactionData: result 
      })
      
      // Close dialog and reset form
      setShowTransactionDialog(false)
      resetForm()
    },
  })

  // Delete Transaction Mutation
  const deleteTransactionMutation = useMutation({
    mutationFn: (transactionId) => transactionsService.deleteTransaction(transactionId),
    onMutate: async (transactionId) => {
      // Cancel outgoing fetches
      await queryClient.cancelQueries({ queryKey: queryKeys.transactions.list() })
      
      // Snapshot previous
      const previousTransactions = queryClient.getQueryData(queryKeys.transactions.list())
      
      // Optimistically remove from list
      queryClient.setQueryData(queryKeys.transactions.list(), (old = []) =>
        old.filter(transaction => transaction.id !== transactionId)
      )
      
      return { previousTransactions }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousTransactions) {
        queryClient.setQueryData(queryKeys.transactions.list(), context.previousTransactions)
      }
      console.error('Transaction deletion failed:', error)
    },
    onSuccess: (result, transactionId) => {
      console.log('✅ Transaction deleted:', result)
      
      // Use mutation helpers for proper invalidation and broadcasting
      mutationHelpers.onTransactionSuccess(queryClient, 'delete', { transactionId })
      
      // Close confirmation dialog
      setConfirmationDialog({ isOpen: false, transaction: null, type: null })
    },
  })

  // Compute combined loading state
  const loading = transactionsLoading || assetsLoading

  // Local state for form management  
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
    // Liquidity and time horizon fields
    liquid_assets: false, // Will be set based on asset type selection
    time_horizon: '',
    asset_purpose: '', // Asset Purpose field
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

  log('Transactions:init', 'Component initialization complete, TanStack Query handling data fetching');

  // Handle query errors
  if (transactionsError) {
    error('Transactions:transactionsQuery', 'Failed to fetch transactions:', transactionsError);
    toast({
      title: "Error",
      description: "Failed to fetch transactions",
      variant: "destructive"
    });
  }

  if (assetsError) {
    error('Transactions:assetsQuery', 'Failed to fetch assets:', assetsError);
  }

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

  // Helper function to handle transaction creation using mutations
  const createTransactionViaMutation = async (transactionData) => {
    return new Promise((resolve, reject) => {
      createTransactionMutation.mutate(transactionData, {
        onSuccess: (result) => {
          console.log('✅ MUTATION_CREATE_SUCCESS: Transaction created via mutation', result)
          resolve(result)
        },
        onError: (error) => {
          console.error('❌ MUTATION_CREATE_ERROR: Transaction creation failed', error)
          reject(error)
        }
      })
    })
  }

  // Helper function to handle transaction updates using mutations
  const updateTransactionViaMutation = async (id, transactionData) => {
    return new Promise((resolve, reject) => {
      updateTransactionMutation.mutate({ id, transactionData }, {
        onSuccess: (result) => {
          console.log('✅ MUTATION_UPDATE_SUCCESS: Transaction updated via mutation', result)
          resolve(result)
        },
        onError: (error) => {
          console.error('❌ MUTATION_UPDATE_ERROR: Transaction update failed', error)
          reject(error)
        }
      })
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const currentTime = Date.now()
    
    // Prevent duplicate submissions with both state and timing checks
    if (createTransactionMutation.isPending || updateTransactionMutation.isPending) {
      console.log('🚫 SUBMIT_BLOCKED: Form submission already in progress')
      return
    }
    
    // Prevent rapid successive submissions (within 2 seconds)
    if (currentTime - lastSubmissionTime < 2000) {
      console.log('🚫 SUBMIT_BLOCKED: Too soon after last submission')
      return
    }
    
    setLastSubmissionTime(currentTime)
    console.log('🚀 TRANSACTION_SUBMIT_START: Form submission initiated', {
      transactionType: transactionForm.transaction_type,
      formData: transactionForm,
      timestamp: new Date().toISOString(),
      submissionId: currentTime
    })
    
    try {
      if (editingTransaction) {
        // Update existing transaction using mutation
        await updateTransactionViaMutation(editingTransaction.id, transactionForm)
        
        toast({
          title: "Success",
          description: "Transaction updated successfully"
        })
      } else {
        // Create new transaction - handle different transaction types
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
          
          console.log('🎯 CREATE_TRANSACTION_DIRECT: Creating transaction with all asset data', {
            formData: transactionForm,
            code: 'CREATE_002'
          })
          
          // Prepare transaction data for asset creation
          const transactionData = {
            transaction_type: 'create',
            transaction_date: transactionForm.purchase_date,
            amount: parseFloat(transactionForm.initial_value) || 0,
            quantity_change: parseFloat(transactionForm.quantity) || 1,
            notes: transactionForm.notes?.trim() || '',
            // 🎯 ALL FRONTEND FIELDS SENT TO TRANSACTIONS (INCLUDING NEW LIQUID & HORIZON):
            asset_name: transactionForm.asset_name.trim(),
            asset_type: transactionForm.asset_type,
            acquisition_value: parseFloat(transactionForm.initial_value) || 0,
            current_value: parseFloat(transactionForm.current_value) || parseFloat(transactionForm.initial_value) || 0,
            quantity: parseFloat(transactionForm.quantity) || 1,
            unit_of_measure: transactionForm.unit_of_measure?.trim() || '',
            custom_properties: transactionForm.custom_properties?.trim() || '',
            asset_description: transactionForm.description?.trim() || '',
            // New liquidity and time horizon fields
            liquid_assets: transactionForm.liquid_assets,
            time_horizon: transactionForm.time_horizon?.trim() || null
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
          
          // Use the mutation helper instead of direct service call
          const newTransaction = await createTransactionViaMutation(transactionData)
          
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
            await createTransactionViaMutation(saleTransaction)
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
            await createTransactionViaMutation(cashTransaction)
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

            // Add liquid_assets for update_liquid_status transactions
            if (transactionForm.transaction_type === 'update_liquid_status' && transactionForm.liquid_assets) {
              transactionData.liquid_assets = transactionForm.liquid_assets
            }

            // Add time_horizon for update_time_horizon transactions
            if (transactionForm.transaction_type === 'update_time_horizon' && transactionForm.time_horizon) {
              transactionData.time_horizon = transactionForm.time_horizon
            }

            // Add asset_purpose for update_asset_purpose transactions
            if (transactionForm.transaction_type === 'update_asset_purpose' && transactionForm.asset_purpose) {
              transactionData.asset_purpose = transactionForm.asset_purpose
            }

            // Add update_quantity_units for update_quantity_units transactions
            if (transactionForm.transaction_type === 'update_quantity_units' && transactionForm.quantity && transactionForm.unit_of_measure) {
              transactionData.update_quantity_units = `${transactionForm.quantity}:${transactionForm.unit_of_measure}`
            }

            // Add update_description_properties for update_description_properties transactions
            if (transactionForm.transaction_type === 'update_description_properties') {
              const updates = {}
              if (transactionForm.asset_description) {
                updates.description = transactionForm.asset_description
              }
              if (transactionForm.custom_properties) {
                updates.custom_properties = transactionForm.custom_properties
              }
              if (Object.keys(updates).length > 0) {
                transactionData.update_description_properties = JSON.stringify(updates)
              }
            }

            console.log('📋 UPDATE_TRANSACTION_DATA: Update transaction data', {
              transactionData,
              code: 'UPDATE_002'
            })

            await createTransactionViaMutation(transactionData)

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
      
      // Close dialog and reset form - mutations handle invalidation automatically
      console.log('🔄 FORM_RESET: Closing dialog and resetting form', {
        code: 'RESET_001'
      })
      
      setShowTransactionDialog(false)
      resetForm()
      
      console.log('✅ FORM_RESET_SUCCESS: Dialog closed successfully', {
        code: 'RESET_002'
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

  // Actions column and edit/delete functionality removed - transactions are managed through asset lifecycle

  const confirmDelete = async () => {
    try {
      // Use delete mutation instead of manual service call
      deleteTransactionMutation.mutate(confirmationDialog.transaction.id)
      
      // Close dialog first
      setConfirmationDialog({ isOpen: false, transaction: null, type: null })
      
      toast({
        title: "Success",
        description: "Transaction deleted successfully"
      })
      
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

  const filteredTransactions = (transactions || []).filter(transaction => {
    // Ensure transaction object exists
    if (!transaction || typeof transaction !== 'object') {
      return false
    }

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
    // Ensure both objects exist
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') {
      return 0
    }

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

  // Get unique asset types for filter dropdown - with null safety
  const uniqueAssetTypes = [...new Set((transactions || []).map(t => t?.asset_type).filter(Boolean))]

  if (loading) {
    log('Transactions:loading', 'Still loading transactions data...');
    return <Loading pageName="Transactions" />;
  }

  // Add render state logging
  log('Transactions component rendering:', {
    totalTransactions: transactions.length,
    filteredCount: filteredTransactions.length,
    searchTerm,
    selectedType,
    showTransactionDialog,
    hasEditingTransaction: !!editingTransaction,
    filtersActive: Object.values(filters).some(value => value && value !== 'all')
  });
  
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
      <SafeSection debugId="Transactions:TransactionDialog">
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
                      {transactionTypes.filter(t => ['update_acquisition_value', 'update_market_value', 'update_name', 'update_type', 'update_liquid_status', 'update_time_horizon', 'update_asset_purpose', 'update_quantity_units', 'update_description_properties'].includes(t.value)).map((type) => {
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
                
                <div className="grid grid-cols-3 gap-4">
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
                      onValueChange={(value) => {
                        const isLiquidByDefault = assetLiquidityDefaults[value] || false
                        setTransactionForm({
                          ...transactionForm, 
                          asset_type: value,
                          liquid_assets: isLiquidByDefault
                        })
                      }}
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
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="liquid_assets">Mark as Liquid Asset</Label>
                      <Info className="w-4 h-4 text-muted-foreground cursor-help" 
                        title="Liquid assets are those that can be sold in very short span of time usually less than a day" />
                    </div>
                    <Select 
                      value={transactionForm.liquid_assets ? 'true' : 'false'} 
                      onValueChange={(value) => setTransactionForm({
                        ...transactionForm, 
                        liquid_assets: value === 'true'
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">YES</SelectItem>
                        <SelectItem value="false">NO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time_horizon">Horizon</Label>
                    <Select 
                      value={transactionForm.time_horizon} 
                      onValueChange={(value) => setTransactionForm({
                        ...transactionForm, 
                        time_horizon: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time horizon" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeHorizonOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="asset_purpose">Asset Purpose</Label>
                    <Select 
                      value={transactionForm.asset_purpose} 
                      onValueChange={(value) => setTransactionForm({
                        ...transactionForm, 
                        asset_purpose: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        {assetPurposeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
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

            {/* Liquid Status Select for Update Liquid Status */}
            {selectedTransactionType === 'update_liquid_status' && (
              <div className="space-y-2">
                <Label htmlFor="liquid_assets">New Liquid Status *</Label>
                <Select 
                  value={transactionForm.liquid_assets || ''} 
                  onValueChange={(value) => setTransactionForm({...transactionForm, liquid_assets: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new liquid status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YES">YES - Liquid Asset</SelectItem>
                    <SelectItem value="NO">NO - Illiquid Asset</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Liquid assets can be easily converted to cash within a short period.
                </p>
              </div>
            )}

            {/* Time Horizon Select for Update Time Horizon */}
            {selectedTransactionType === 'update_time_horizon' && (
              <div className="space-y-2">
                <Label htmlFor="time_horizon">New Time Horizon *</Label>
                <Select 
                  value={transactionForm.time_horizon || ''} 
                  onValueChange={(value) => setTransactionForm({...transactionForm, time_horizon: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new time horizon" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeHorizonOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Investment time horizon affects risk tolerance and strategy.
                </p>
              </div>
            )}

            {/* Asset Purpose Select for Update Asset Purpose */}
            {selectedTransactionType === 'update_asset_purpose' && (
              <div className="space-y-2">
                <Label htmlFor="asset_purpose">New Asset Purpose *</Label>
                <Select 
                  value={transactionForm.asset_purpose || ''} 
                  onValueChange={(value) => setTransactionForm({...transactionForm, asset_purpose: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new asset purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetPurposeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Asset purpose helps categorize investments by their intended goal.
                </p>
              </div>
            )}

            {/* Quantity and Units for Update Quantity & Units */}
            {selectedTransactionType === 'update_quantity_units' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">New Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.0001"
                      value={transactionForm.quantity || ''}
                      onChange={(e) => setTransactionForm({...transactionForm, quantity: e.target.value})}
                      placeholder="0.0000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit_of_measure">New Unit of Measure *</Label>
                    <Input
                      id="unit_of_measure"
                      value={transactionForm.unit_of_measure || ''}
                      onChange={(e) => setTransactionForm({...transactionForm, unit_of_measure: e.target.value})}
                      placeholder="shares, units, oz, sqft, etc."
                      required
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Update the quantity and unit of measure for this asset.
                </p>
              </div>
            )}

            {/* Description and Properties for Update Description & Properties */}
            {selectedTransactionType === 'update_description_properties' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="asset_description">New Description</Label>
                  <Textarea
                    id="asset_description"
                    value={transactionForm.asset_description || ''}
                    onChange={(e) => setTransactionForm({...transactionForm, asset_description: e.target.value})}
                    placeholder="Enter new asset description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom_properties">Custom Properties</Label>
                  <Textarea
                    id="custom_properties"
                    value={transactionForm.custom_properties || ''}
                    onChange={(e) => setTransactionForm({...transactionForm, custom_properties: e.target.value})}
                    placeholder="Enter custom properties (e.g., Ticker: AAPL, Exchange: NASDAQ)"
                    rows={2}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Update the description and custom properties for this asset.
                </p>
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
      </SafeSection>

      {/* Enhanced Filters */}
      <SafeSection debugId="Transactions:FiltersCard">
        <Card>
          <CardContent className="p-6">
          <div className="space-y-4">
            {/* First row - Search and Type */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
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
              <div className="w-full sm:w-48 space-y-2">
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
              <div className="flex-1 space-y-2">
                <Label htmlFor="asset-name">Asset Name</Label>
                <Input
                  id="asset-name"
                  placeholder="Filter by asset name..."
                  value={filters.assetName}
                  onChange={(e) => updateFilter('assetName', e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48 space-y-2">
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
              <div className="flex-1 space-y-2">
                <Label htmlFor="date-from">From Date</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                />
              </div>
              <div className="flex-1 space-y-2">
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
              <div className="flex-1 space-y-2">
                <Label htmlFor="amount-min">Min Amount ($)</Label>
                <Input
                  id="amount-min"
                  type="number"
                  placeholder="0"
                  value={filters.amountMin}
                  onChange={(e) => updateFilter('amountMin', e.target.value)}
                />
              </div>
              <div className="flex-1 space-y-2">
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
              <div className="flex-1 space-y-2">
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
      </SafeSection>

      {/* Transactions Table */}
      <SafeSection debugId="Transactions:TransactionHistoryCard">
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
                <TableHead>Liquid</TableHead>
                <TableHead>Time Horizon</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead>Notes</TableHead>
                 <TableHead>Last Modified</TableHead>
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
                          {/* Show amount only for monetary transactions, otherwise show "No Change" */}
                          {(() => {
                            const nonMonetaryTypes = ['update_name', 'update_type', 'update_liquid_status', 'update_time_horizon', 'update_asset_purpose', 'update_quantity_units', 'update_description_properties'];
                            const isNonMonetary = nonMonetaryTypes.includes(transaction.transaction_type);
                            
                            if (isNonMonetary) {
                              return (
                                <div className="text-sm font-medium text-muted-foreground">
                                  <span className="text-muted-foreground">Status:</span> No Change
                                </div>
                              );
                            } else if (transaction.amount && transaction.amount !== 0) {
                              return (
                                <div className={`text-sm font-medium ${typeInfo.color}`}>
                                  <span className="text-muted-foreground">Amount:</span> {formatCurrency(transaction.amount)}
                                </div>
                              );
                            }
                            return null;
                          })()}
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
                        <div>
                          {transaction.liquid_assets ? (
                            <Badge variant={transaction.liquid_assets === 'YES' ? 'default' : 'secondary'} className="text-xs">
                              {transaction.liquid_assets === 'YES' ? '💧 Liquid' : '🔒 Illiquid'}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {transaction.time_horizon ? (
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                {transaction.time_horizon === 'short_term' && '⏱️ Short'}
                                {transaction.time_horizon === 'medium_term' && '⏰ Medium'}
                                {transaction.time_horizon === 'long_term' && '⏳ Long'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {transaction.custom_properties ? (
                            <div className="text-xs text-muted-foreground break-words whitespace-normal leading-relaxed">
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
                       <TableCell>
                         {transaction.modified_at ? new Date(transaction.modified_at).toLocaleDateString() : '-'}
                       </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8">
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
      </SafeSection>

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
