import { AuthProvider, useAuth } from './hooks/useAuth'
import { ThemeProvider } from './contexts/ThemeContext'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { useQuerySync } from './lib/queryUtils'
import LoginForm from './components/auth/LoginForm'
import Dashboard from './pages/Dashboard'
import Assets from './pages/Assets'
import Transactions from './pages/Transactions'
import Insurance from './pages/Insurance'
import Analytics from './pages/Analytics'
import UserSettings from './pages/UserSettings'
import UserGuide from './pages/UserGuide'
import Profile from './pages/Profile'
import AppLayout from './components/layout/AppLayout'
import { Toaster } from './components/ui/toaster'
import Loading from './components/ui/Loading'
import { log, warn } from './lib/debug'
import './App.css'

// Page Components
function AssetsPage() {
  console.log('AssetsPage: Rendering Assets page')
  try {
    return <Assets />
  } catch (error) {
    console.error('AssetsPage: Error rendering Assets:', error)
    return <div className="p-6"><h1 className="text-2xl font-bold text-red-500">Error loading Assets</h1><p>{error.message}</p></div>
  }
}

// Removed InsurancePage placeholder; now using real Insurance component

function TransactionsPage() {
  console.log('TransactionsPage: Rendering Transactions page')
  try {
    return <Transactions />
  } catch (error) {
    console.error('TransactionsPage: Error rendering Transactions:', error)
    return <div className="p-6"><h1 className="text-2xl font-bold text-red-500">Error loading Transactions</h1><p>{error.message}</p></div>
  }
}

function AnalyticsPage() {
  console.log('AnalyticsPage: Rendering Analytics page')
  try {
    return <Analytics />
  } catch (error) {
    console.error('AnalyticsPage: Error rendering Analytics:', error)
    return <div className="p-6"><h1 className="text-2xl font-bold text-red-500">Error loading Analytics</h1><p>{error.message}</p></div>
  }
}

function DebugLocation() {
  const location = useLocation()
  console.log('Current location:', location.pathname, location)
  return null
}

function AppContent() {
  const { user, loading } = useAuth()
  
  log('App', 'AppContent render - loading:', loading, 'user:', !!user)

  if (loading) {
    log('App', 'render:loading')
    return <Loading fullScreen messageOverride="Loading your financial sanctuary..." />
  }

  if (!user) {
    log('App', 'render:unauthenticated')
    return <LoginForm />
  }

  log('App', 'render:authenticated')
  return (
    <AppLayout>
      <DebugLocation />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/portfolio" element={<AssetsPage />} />
        <Route path="/insurance" element={<Insurance />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<UserSettings />} />
        <Route path="/guide" element={<UserGuide />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}

// TanStack Query Configuration
const createQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 30 minutes by default (explicit invalidation strategy)
        staleTime: 30 * 60 * 1000,
        // Keep cached data for 1 hour before garbage collection
        gcTime: 60 * 60 * 1000,
        // Retry failed queries up to 3 times
        retry: 3,
        // Use explicit invalidation approach instead of automatic refetch
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        // Enable request deduplication
        refetchOnMount: true,
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
        // Global mutation error handling
        onError: (error) => {
          console.error('Mutation failed:', error)
          // Toast notifications could be added here
        },
      },
    },
  })

  // Set up session storage persistence
  if (typeof window !== 'undefined') {
    try {
      const persister = createSyncStoragePersister({
        storage: window.sessionStorage,
        key: 'AURA_QUERY_CACHE',
        throttleTime: 1000, // Throttle saves to 1 second
      })

      persistQueryClient({
        queryClient,
        persister,
        maxAge: 30 * 60 * 1000, // 30 minutes (align with staleTime for consistent cache behavior)
        dehydrateOptions: {
          // Don't persist mutations
          shouldDehydrateMutation: () => false,
          // Only persist successful queries
          shouldDehydrateQuery: (query) => {
            return query.state.status === 'success'
          },
        },
      })
    } catch (error) {
      console.warn('Query persistence setup failed:', error)
      // Gracefully degrade if persistence fails
    }
  }

  return queryClient
}

// Create a single QueryClient instance
const queryClient = createQueryClient()

function App() {
  log('App', 'init')
  
  // Enable cross-tab synchronization
  useQuerySync(queryClient)
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppContent />
            <Toaster />
          </Router>
        </AuthProvider>
      </ThemeProvider>
      {/* React Query DevTools - only in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

export default App
