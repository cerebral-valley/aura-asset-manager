import { AuthProvider, useAuth } from './hooks/useAuth'
import { ThemeProvider } from './hooks/useTheme'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import LoginForm from './components/auth/LoginForm'
import Dashboard from './pages/Dashboard'
import Assets from './pages/Assets'
import Transactions from './pages/Transactions'
import Insurance from './pages/Insurance'
import Annuities from './pages/Annuities'
import Analytics from './pages/Analytics'
import UserSettings from './pages/UserSettings'
import UserGuide from './pages/UserGuide'
import Profile from \'./pages/Profile\'
import AppLayout from './components/layout/AppLayout'
import { Toaster } from './components/ui/toaster'
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
  
  console.log('AppContent: Auth state - loading:', loading, 'user:', !!user)

  if (loading) {
    console.log('AppContent: Showing loading state')
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading Aura...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('AppContent: No user, showing login form')
    return <LoginForm />
  }

  console.log('AppContent: User authenticated, rendering app with routing')
  return (
    <AppLayout>
      <DebugLocation />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/insurance" element={<Insurance />} />
        <Route path="/annuities" element={<Annuities />} />
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

function App() {
  console.log('App: Component mounting/rendering')
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
