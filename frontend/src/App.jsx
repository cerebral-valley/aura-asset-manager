import { AuthProvider, useAuth } from './hooks/useAuth'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import LoginForm from './components/auth/LoginForm'
import Dashboard from './pages/Dashboard'
import AppLayout from './components/layout/AppLayout'
import './App.css'

// Page Components
function AssetsPage() {
  console.log('🎯 AssetsPage: Rendering Assets page')
  return <div className="p-6"><h1 className="text-2xl font-bold">Assets Page</h1><p>Coming Soon</p></div>
}

function InsurancePage() {
  console.log('🎯 InsurancePage: Rendering Insurance page')
  return <div className="p-6"><h1 className="text-2xl font-bold">Insurance Page</h1><p>Coming Soon</p></div>
}

function TransactionsPage() {
  console.log('🎯 TransactionsPage: Rendering Transactions page')
  return <div className="p-6"><h1 className="text-2xl font-bold">Transactions Page</h1><p>Coming Soon</p></div>
}

function AnalyticsPage() {
  console.log('🎯 AnalyticsPage: Rendering Analytics page')
  return <div className="p-6"><h1 className="text-2xl font-bold">Analytics Page</h1><p>Coming Soon</p></div>
}

function DebugLocation() {
  const location = useLocation()
  console.log('🔍 Current location:', location.pathname, location)
  return null
}

function AppContent() {
  const { user, loading } = useAuth()
  
  console.log('🔐 AppContent: Auth state - loading:', loading, 'user:', !!user)

  if (loading) {
    console.log('⏳ AppContent: Showing loading state')
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
    console.log('🚫 AppContent: No user, showing login form')
    return <LoginForm />
  }

  console.log('✅ AppContent: User authenticated, rendering app with routing')
  return (
    <AppLayout>
      <DebugLocation />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/insurance" element={<InsurancePage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}

function App() {
  console.log('🚀 App: Component mounting/rendering')
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
