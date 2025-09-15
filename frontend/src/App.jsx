import { AuthProvider, useAuth } from './hooks/useAuth'
import { ThemeProvider } from './contexts/ThemeContext'
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
  log('App', 'init')
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
