import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { Button } from '../ui/button.jsx'
import { 
  Home, 
  Briefcase, 
  Shield, 
  ArrowRightLeft, 
  BarChart3, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import './AppLayout.css'

const AppLayout = ({ children, currentPage = 'dashboard' }) => {
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  
  console.log('🏗️ AppLayout: Rendering with location:', location.pathname)
  console.log('🏗️ AppLayout: User:', user?.email || 'No user')
  console.log('🏗️ AppLayout: Children:', !!children)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, id: 'dashboard' },
    { name: 'Assets', href: '/assets', icon: Briefcase, id: 'assets' },
    { name: 'Insurance', href: '/insurance', icon: Shield, id: 'insurance' },
    { name: 'Transactions', href: '/transactions', icon: ArrowRightLeft, id: 'transactions' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, id: 'analytics' },
  ]

  const handleSignOut = async () => {
    console.log('🚪 AppLayout: User signing out')
    await signOut()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h1 className="text-2xl font-bold text-primary">Aura</h1>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              console.log(`🔗 Navigation: ${item.name} - current: ${location.pathname}, href: ${item.href}, active: ${isActive}`)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    console.log(`🔗 Navigation CLICK: ${item.name} -> ${item.href}`)
                    setSidebarOpen(false)
                  }}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-background border-b px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1" />
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout

