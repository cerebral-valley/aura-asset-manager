import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button.jsx'
import { Input } from '../components/ui/input.jsx'
import { Label } from '../components/ui/label.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.jsx'
import { Switch } from '../components/ui/switch.jsx'
import { Alert, AlertDescription } from '../components/ui/alert.jsx'
import { ThemeSelector } from '../components/ui/ThemeSelector.jsx'
import { CheckCircle, AlertCircle, User, Globe, Palette, Trash2, AlertTriangle, Eye, EyeOff, Copy, Crown, Sparkles as SparklesIcon, Zap, Shield, TrendingUp, Target, FileText, Brain, ChevronRight } from 'lucide-react'
import MagicCard from '../components/magicui/MagicCard.jsx'
import ShimmerButton from '../components/magicui/ShimmerButton.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { userSettingsService } from '../services/user-settings.js'
import apiClient from '../lib/api.js'
import Loading from '../components/ui/Loading'
import SafeSection from '@/components/util/SafeSection'
import { log, warn, error } from '@/lib/debug'

const UserSettings = () => {
  log('UserSettings:init', 'Component initializing');
  
  // Import verification
  if (!userSettingsService) warn('UserSettings:import', 'userSettingsService not available');
  if (!apiClient) warn('UserSettings:import', 'apiClient not available');
  
  const { user } = useAuth()
  const { darkMode, setDarkMode, theme, changeTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Subscription billing toggle
  const [billingPeriod, setBillingPeriod] = useState('monthly') // 'monthly' or 'annual'

  const [settings, setSettings] = useState({
    first_name: '',
    last_name: '',
    recovery_email: '',
    country: '',
    currency: 'USD',
    date_format: 'MM/DD/YYYY',
    dark_mode: false,
    theme: 'default'
  })

  // Data reset state and handlers
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetConfirmText, setResetConfirmText] = useState('')
  const [resetCountdown, setResetCountdown] = useState(0)
  const [resetInProgress, setResetInProgress] = useState(false)

  // User Code state and handlers
  const [userCode, setUserCode] = useState('')
  const [userCodeVisible, setUserCodeVisible] = useState(false)
  const [userCodeLoading, setUserCodeLoading] = useState(false)

  // Data reset handlers
  const handleResetDataClick = () => {
    setShowResetModal(true)
    setResetConfirmText('')
    setError('')
    setSuccess('')
  }

  const handleResetCancel = () => {
    setShowResetModal(false)
    setResetConfirmText('')
    setResetCountdown(0)
  }

  const handleResetConfirm = () => {
    if (resetConfirmText === "I want to delete my data") {
      setResetCountdown(10)
      // Start countdown
      const interval = setInterval(() => {
        setResetCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            executeDataReset()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }

  const executeDataReset = async () => {
    setResetInProgress(true)
    try {
      // Call the data reset service (we'll create this)
      await resetAllUserData()
      setSuccess('All your data has been permanently deleted and your account has been reset.')
      setShowResetModal(false)
      setResetConfirmText('')
      
      // Optionally redirect to dashboard or refresh page
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } catch (err) {
      console.error('Error resetting data:', err)
      setError('Failed to reset data. Please try again or contact support.')
      setShowResetModal(false)
    } finally {
      setResetInProgress(false)
    }
  }

  // Service to reset all user data
  const resetAllUserData = async () => {
    const { assetsService } = await import('../services/assets.js')
    const { transactionsService } = await import('../services/transactions.js')
    const { insuranceService } = await import('../services/insurance.js')
    const { profileService } = await import('../services/profile.js')

    // Delete all data in sequence
    try {
      // Delete assets
      const assets = await assetsService.getAssets()
      for (const asset of assets) {
        await assetsService.deleteAsset(asset.id)
      }

      // Delete transactions
      const transactions = await transactionsService.getTransactions()
      for (const transaction of transactions) {
        await transactionsService.deleteTransaction(transaction.id)
      }

      // Delete insurance
      const insurancePolicies = await insuranceService.getInsurancePolicies()
      for (const policy of insurancePolicies) {
        await insuranceService.deleteInsurance(policy.id)
      }

      // Reset profile to default values
      const defaultProfile = {
        first_name: '',
        last_name: '',
        marital_status: '',
        gender: '',
        date_of_birth: '',
        children: '',
        dependents: '',
        city: '',
        pin_code: '',
        state: '',
        country: '',
        nationality: '',
        phone_number: '',
        annual_income: '',
        occupation: '',
        risk_appetite: '',
        elderly_dependents: false,
        children_age_groups: []
      }
      await profileService.updateProfile(defaultProfile)
    } catch (error) {
      throw new Error('Failed to reset all data: ' + error.message)
    }
  }

  // User Code functions
  const fetchUserCode = async () => {
    setUserCodeLoading(true)
    try {
      const response = await apiClient.get('/user-settings/user-code')
      setUserCode(response.data.user_code)
    } catch (err) {
      console.error('Error fetching user code:', err)
      setError('Failed to fetch user code. Please try again.')
    } finally {
      setUserCodeLoading(false)
    }
  }

  const copyUserCode = async () => {
    if (userCode) {
      try {
        await navigator.clipboard.writeText(userCode)
        setSuccess('User code copied to clipboard!')
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
      } catch (err) {
        console.error('Error copying to clipboard:', err)
        setError('Failed to copy user code to clipboard.')
      }
    }
  }

  const toggleUserCodeVisibility = () => {
    if (!userCode && !userCodeLoading) {
      fetchUserCode()
    }
    setUserCodeVisible(!userCodeVisible)
  }

  const currencies = [
    { value: 'USD', label: '$ US Dollar' },
    { value: 'GBP', label: '£ British Pound' },
    { value: 'EUR', label: '€ Euro' },
    { value: 'JPY', label: '¥ Japanese Yen' },
    { value: 'CNY', label: '¥ Chinese Yuan (CNY)' },
    { value: 'RUB', label: '₽ Russian Ruble' },
    { value: 'INR', label: '₹ Indian Rupee' }
  ]

  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US Format)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (European Format)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO Format)' },
    { value: 'DD MMM YYYY', label: 'DD MMM YYYY (e.g., 04 Aug 2025)' }
  ]

  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 
    'Japan', 'China', 'India', 'Brazil', 'Russia', 'South Korea', 'Italy', 'Spain',
    'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Switzerland', 'Austria', 'Other'
  ]

  useEffect(() => {
    log('UserSettings:useEffect:init', 'Component mounted, fetching settings');
    fetchSettings()
  }, [])

  // Sync theme changes from ThemeSelector to settings state
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      theme: theme
    }))
  }, [theme])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError('')
      log('UserSettings:fetchSettings', 'Starting to fetch user settings...');
      const data = await userSettingsService.getSettings()
      log('UserSettings:fetchSettings:success', 'Successfully fetched settings', { hasData: !!data });
      setSettings(data)
      // Sync dark mode with theme context
      if (data && typeof data.dark_mode === 'boolean') {
        setDarkMode(data.dark_mode)
      }
      // Sync theme with theme context - make sure settings state reflects current theme
      setSettings(prev => ({
        ...prev,
        theme: theme
      }))
    } catch (err) {
      error('UserSettings:fetchSettings:error', 'Error fetching settings', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      if (err.message.includes('authentication') || err.message.includes('Invalid')) {
        setError('Please log in to access your settings')
      } else if (err.message.includes('Please log in')) {
        setError(err.message)
      } else if (err.message.includes('500') || err.message.includes('Failed to load resource')) {
        setError('Settings feature is currently unavailable. Database may need to be updated.')
      } else {
        setError('Failed to load settings. Please try refreshing the page.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      // Save settings to database
      await userSettingsService.saveSettings(settings)
      
      // If theme changed, also call the ThemeContext changeTheme function
      // to ensure database consistency
      if (settings.theme && settings.theme !== theme) {
        await changeTheme(settings.theme)
      }
      
      setSuccess('Settings saved successfully!')
      
      // Update localStorage to apply changes immediately
      localStorage.setItem('globalCurrency', settings.currency)
      localStorage.setItem('globalDateFormat', settings.date_format)
      localStorage.setItem('globalDarkMode', settings.dark_mode.toString())
      
      // Broadcast changes to other components
      window.dispatchEvent(new CustomEvent('globalPreferencesChanged', {
        detail: {
          currency: settings.currency,
          dateFormat: settings.date_format,
          darkMode: settings.dark_mode
        }
      }))
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error saving settings:', err)
      if (err.message.includes('authentication') || err.message.includes('Invalid')) {
        setError('Your session has expired. Please log in again.')
      } else if (err.message.includes('Please log in')) {
        setError(err.message)
      } else if (err.message.includes('500') || err.message.includes('Failed to create') || err.message.includes('Failed to save')) {
        setError('Unable to save settings. The database may need to be updated. Please contact support.')
      } else {
        setError(err.message || 'Failed to save settings. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    if (field === 'dark_mode') {
      // Update the global theme context immediately
      setDarkMode(value)
    }
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    log('UserSettings:loading', 'Still loading user settings...');
    return <Loading pageName="UserSettings" />;
  }

  log('UserSettings:render', { 
    loading,
    saving,
    error: error || null,
    success: success || null,
    userCodeVisible,
    showResetModal
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information and application preferences
        </p>
      </div>

      {/* Alerts */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <SafeSection debugId="UserSettings:PersonalInformation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={settings.first_name || ''}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={settings.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="current_email">Current Email</Label>
              <Input
                id="current_email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="recovery_email">Recovery Email</Label>
              <Input
                id="recovery_email"
                type="email"
                value={settings.recovery_email || ''}
                onChange={(e) => handleInputChange('recovery_email', e.target.value)}
                placeholder="Enter your recovery email"
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Select value={settings.country || ''} onValueChange={(value) => handleInputChange('country', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* User Code Section */}
            <div>
              <Label htmlFor="user_code" className="flex items-center gap-2">
                User Code
                <span className="text-sm text-muted-foreground font-normal">
                  (Your unique 8-character identifier)
                </span>
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="user_code"
                    value={userCodeVisible ? userCode : '********'}
                    disabled
                    className="bg-muted pr-20"
                    placeholder={userCodeLoading ? 'Loading...' : '********'}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-background/10"
                      onClick={toggleUserCodeVisibility}
                      disabled={userCodeLoading}
                      title={userCodeVisible ? 'Hide user code' : 'Show user code'}
                    >
                      {userCodeVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-background/10"
                      onClick={copyUserCode}
                      disabled={!userCode || userCodeLoading}
                      title="Copy user code"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This unique code identifies your account and can be used for sharing or support purposes.
              </p>
            </div>
          </CardContent>
        </Card>
        </SafeSection>

        {/* Preferences */}
        <SafeSection debugId="UserSettings:Preferences">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Preferences
              </CardTitle>
            </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={settings.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date_format">Date Format</Label>
              <Select value={settings.date_format} onValueChange={(value) => handleInputChange('date_format', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Theme Selector */}
            <ThemeSelector />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark_mode" className="text-base">Dark Mode</Label>
                <div className="text-[0.8rem] text-muted-foreground">
                  Enable dark theme across the application
                </div>
              </div>
              <Switch
                id="dark_mode"
                checked={darkMode}
                onCheckedChange={(checked) => handleInputChange('dark_mode', checked)}
              />
            </div>
          </CardContent>
        </Card>
        </SafeSection>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>

      {/* Subscription Plans Section */}
      <div className="mt-10 relative">
        <div className="relative z-10 space-y-6">
          {/* Section Header */}
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground text-lg">
              Unlock powerful features to manage your wealth
            </p>
          </div>

          {/* Billing Period Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium transition-colors ${billingPeriod === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={billingPeriod === 'annual'}
              onCheckedChange={(checked) => setBillingPeriod(checked ? 'annual' : 'monthly')}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-600"
            />
            <span className={`text-sm font-medium transition-colors ${billingPeriod === 'annual' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </span>
            {billingPeriod === 'annual' && (
              <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                Save 15%
              </span>
            )}
          </div>

          {/* Subscription Cards Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Basic Plan */}
            <MagicCard
              className="relative bg-gradient-to-b from-background/80 to-background/60 border-2 border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300"
              gradientColor="#3b82f6"
              gradientOpacity={0.6}
            >
              <div className="space-y-6">
                {/* Plan Header */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-500" />
                    <h3 className="text-2xl font-bold">Basic</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                      {billingPeriod === 'monthly' ? '$4.99' : '$50.99'}
                    </span>
                    <span className="text-muted-foreground">/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                    <Crown className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-500">Free for Limited Time</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    All Core Features
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Unlimited Assets Tracking',
                      'Transaction Management',
                      'Portfolio Overview',
                      'Real-time Net Worth',
                      'Multi-Currency Support',
                      'Target Setting & Tracking',
                      '10 Financial Tools Set'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <ShimmerButton
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  shimmerColor="#ffffff"
                  shimmerDuration="2s"
                >
                  Get Started Free
                </ShimmerButton>
              </div>
            </MagicCard>

            {/* Premium Plan */}
            <MagicCard
              className="relative bg-gradient-to-b from-background/80 to-background/60 border-2 border-purple-500/50 backdrop-blur-sm hover:border-purple-500 transition-all duration-300 transform md:scale-105"
              gradientColor="#a855f7"
              gradientOpacity={0.7}
            >
              <div className="space-y-6">
                {/* Plan Header */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-purple-500" />
                    <h3 className="text-2xl font-bold">Premium</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                      {billingPeriod === 'monthly' ? '$9.99' : '$101.99'}
                    </span>
                    <span className="text-muted-foreground">/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                    <SparklesIcon className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-semibold text-purple-500">Coming Soon</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-purple-500 uppercase tracking-wide">
                    Everything in Basic, Plus
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Document Storage (100MB)',
                      'Upload Property documents',
                      'Upload Insurance documents',
                      'Priority Email Support'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <ShimmerButton
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 opacity-60 cursor-not-allowed"
                  shimmerColor="#ffffff"
                  shimmerDuration="2s"
                  disabled
                >
                  Coming Soon
                </ShimmerButton>
              </div>
            </MagicCard>

            {/* Premium AI Plan */}
            <MagicCard
              className="relative bg-gradient-to-b from-background/80 to-background/60 border-2 border-border/50 backdrop-blur-sm hover:border-amber-500/50 transition-all duration-300"
              gradientColor="#f59e0b"
              gradientOpacity={0.6}
            >
              <div className="space-y-6">
                {/* Plan Header */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-amber-500" />
                    <h3 className="text-2xl font-bold">Premium AI</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                      {billingPeriod === 'monthly' ? '$14.99' : '$152.99'}
                    </span>
                    <span className="text-muted-foreground">/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                    <SparklesIcon className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-semibold text-amber-500">Coming Soon</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-amber-500 uppercase tracking-wide">
                    Everything in Premium, Plus
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Family Profile Management',
                      '24/7 AI Wealth Advisor',
                      'Intelligent Portfolio Analysis'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <ShimmerButton
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 opacity-60 cursor-not-allowed"
                  shimmerColor="#ffffff"
                  shimmerDuration="2s"
                  disabled
                >
                  Coming Soon
                </ShimmerButton>
              </div>
            </MagicCard>
          </div>
        </div>
      </div>

    {/* Feedback Section */}
    <div className="mt-10">
      <SafeSection debugId="UserSettings:FeedbackSection">
        <Card>
          <CardHeader>
            <CardTitle>Send Feedback</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              We'd love to hear your thoughts, suggestions, and ideas to improve Aura Asset Manager
            </p>
          </CardHeader>
        <CardContent>
          <a 
            href="https://forms.gle/3xQ9ehskW1XYQVVcA" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            <div className="relative overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 p-8 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:scale-[1.02] group">
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10 flex flex-col items-center justify-center space-y-4 text-center">
                {/* Icon */}
                <div className="p-4 rounded-full bg-gradient-to-br from-primary to-purple-500 shadow-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Share Your Feedback
                </h3>
                
                {/* Description */}
                <p className="text-muted-foreground max-w-md">
                  Click here to open our feedback form and help us make Aura Asset Manager even better
                </p>
                
                {/* CTA */}
                <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                  <span>Open Feedback Form</span>
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </a>
        </CardContent>
      </Card>
      </SafeSection>
    </div>

    {/* Data Management Section */}
    <div className="mt-10">
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Data Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Permanently delete all your data and reset your account
          </p>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This action cannot be undone. All your assets, transactions, 
              insurance policies, and family data will be permanently deleted.
            </AlertDescription>
          </Alert>
          
          <Button 
            variant="destructive"
            onClick={handleResetDataClick}
            disabled={resetInProgress}
            className="w-full"
          >
            {resetInProgress ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Resetting Data...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Reset All Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>

    {/* Reset Data Modal */}
    {showResetModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-600">Confirm Data Reset</h3>
          </div>
          
          {resetCountdown === 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                This will permanently delete all your data including:
              </p>
              <ul className="text-sm text-muted-foreground mb-4 list-disc list-inside space-y-1">
                <li>All assets and their details</li>
                <li>All transaction records</li>
                <li>All insurance policies</li>
                <li>All family information</li>
                <li>Profile data (except login credentials)</li>
              </ul>
              
              <p className="text-sm font-medium mb-4">
                To confirm, please type: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">I want to delete my data</code>
              </p>
              
              <Input
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder="Type the confirmation text..."
                className="mb-4"
              />
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleResetCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleResetConfirm}
                  disabled={resetConfirmText !== "I want to delete my data"}
                  className="flex-1"
                >
                  Delete Permanently
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="text-6xl font-bold text-red-600 mb-4">
                {resetCountdown}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Your data will be permanently deleted in {resetCountdown} seconds...
              </p>
              <p className="text-xs text-muted-foreground">
                This action cannot be undone
              </p>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
 )
}

export default UserSettings
