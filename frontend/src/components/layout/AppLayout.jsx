import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { userSettingsService } from '../../services/user-settings.js'
import { Button } from '../ui/button.jsx'
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar
} from '../ui/sidebar.jsx'
import { 
  Home, 
  Briefcase, 
  Shield, 
  ArrowRightLeft, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  Coins,
  Settings,
  BookOpen,
  User,
  Target
} from 'lucide-react'
import './AppLayout.css'

const ProfileAvatar = ({ user, userSettings, getUserInitials }) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  
  // Get profile image URL from Google OAuth metadata
  const profileImageUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  
  // Show initials if no image URL, image failed to load, or still loading
  const showInitials = !profileImageUrl || imageError || imageLoading
  
  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }
  
  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }
  
  return (
    <div className="relative w-8 h-8">
      {profileImageUrl && !imageError && (
        <img
          src={profileImageUrl}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ display: showInitials ? 'none' : 'block' }}
        />
      )}
      {showInitials && (
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <span className="text-primary-foreground text-sm font-medium">
            {getUserInitials()}
          </span>
        </div>
      )}
    </div>
  )
}

const AppLayout = ({ children, currentPage = 'dashboard' }) => {
  const { user, signOut } = useAuth()
  const [userSettings, setUserSettings] = useState(null)
  const location = useLocation()
  const { state } = useSidebar()
  
  console.log('🏗️ AppLayout: Rendering with location:', location.pathname)
  console.log('🏗️ AppLayout: User:', user?.email || 'No user')
  console.log('🏗️ AppLayout: Children:', !!children)
  console.log('🏗️ AppLayout: Sidebar state:', state)

  // Fetch user settings for display name
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (user) {
        try {
          const settings = await userSettingsService.getSettings()
          setUserSettings(settings)
        } catch (error) {
          console.log('Could not fetch user settings:', error.message)
          // This is OK - we'll fall back to email
        }
      }
    }

    fetchUserSettings()
  }, [user])

  // Get display name - prioritize first/last name, fallback to email
  const getUserDisplayName = () => {
    if (userSettings?.first_name && userSettings?.last_name) {
      return `${userSettings.first_name} ${userSettings.last_name}`
    } else if (userSettings?.first_name) {
      return userSettings.first_name
    } else if (userSettings?.last_name) {
      return userSettings.last_name
    }
    return user?.email || 'User'
  }

  // Get initials for avatar - prioritize name initials, fallback to email
  const getUserInitials = () => {
    if (userSettings?.first_name && userSettings?.last_name) {
      return `${userSettings.first_name.charAt(0)}${userSettings.last_name.charAt(0)}`.toUpperCase()
    } else if (userSettings?.first_name) {
      return userSettings.first_name.charAt(0).toUpperCase()
    } else if (userSettings?.last_name) {
      return userSettings.last_name.charAt(0).toUpperCase()
    }
    return user?.email?.charAt(0).toUpperCase() || 'U'
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, id: 'dashboard' },
    { name: 'Assets', href: '/portfolio', icon: Briefcase, id: 'assets' },
    { name: 'Goals', href: '/goals', icon: Target, id: 'goals' },
    { name: 'Insurance', href: '/insurance', icon: Shield, id: 'insurance' },
    { name: 'Transactions', href: '/transactions', icon: ArrowRightLeft, id: 'transactions' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, id: 'analytics' },
  ]

  const accountNavigation = [
    { name: 'Your Profile', href: '/profile', icon: User, id: 'profile' },
    { name: 'User Guide', href: '/guide', icon: BookOpen, id: 'guide' },
    { name: 'Settings and Subscription', href: '/settings', icon: Settings, id: 'settings' },
  ]

  const handleSignOut = async () => {
    console.log('🚪 AppLayout: User signing out')
    await signOut()
  }

  return (
    <>
      <Sidebar collapsible="icon" className="overflow-x-hidden">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-2">
            <h1 className="text-2xl font-bold text-primary">Aura</h1>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  console.log(`🔗 Navigation: ${item.name} - current: ${location.pathname}, href: ${item.href}, active: ${isActive}`)
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        tooltip={item.name}
                      >
                        <Link
                          to={item.href}
                          onClick={() => {
                            console.log(`🔗 Navigation CLICK: ${item.name} -> ${item.href}`)
                          }}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          <SidebarSeparator />
          
          <SidebarGroup>
            <SidebarGroupLabel>Account & App</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {accountNavigation.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  console.log(`🔗 Account Navigation: ${item.name} - current: ${location.pathname}, href: ${item.href}, active: ${isActive}`)
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        tooltip={item.name}
                      >
                        <Link
                          to={item.href}
                          onClick={() => {
                            console.log(`🔗 Account Navigation CLICK: ${item.name} -> ${item.href}`)
                          }}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              {state === "collapsed" ? (
                // Collapsed state: Stack vertically with icons only
                <div className="flex flex-col items-center gap-2 p-2">
                  <ProfileAvatar 
                    user={user} 
                    userSettings={userSettings} 
                    getUserInitials={getUserInitials} 
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-muted-foreground hover:text-foreground p-1"
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                // Expanded state: Horizontal layout with text
                <div className="flex items-center gap-2 p-2 overflow-hidden">
                  <ProfileAvatar 
                    user={user} 
                    userSettings={userSettings} 
                    getUserInitials={getUserInitials} 
                  />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-sm font-medium text-foreground truncate">
                      {getUserDisplayName()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-muted-foreground hover:text-foreground shrink-0"
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      
      <SidebarInset>
        {/* Top bar with trigger */}
        <header className="sticky top-0 z-40 bg-background border-b">
          <div className="flex items-center gap-2 px-4 py-3 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </>
  )
}

export default AppLayout

