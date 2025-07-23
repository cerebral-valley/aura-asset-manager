import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import LoginForm from './components/auth/LoginForm.jsx'
import Dashboard from './pages/Dashboard.jsx'
import './App.css'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
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
    return <LoginForm />
  }

  return <Dashboard />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
