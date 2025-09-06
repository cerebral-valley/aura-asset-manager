import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button.jsx'
import { Input } from '../components/ui/input.jsx'
import { Label } from '../components/ui/label.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.jsx'
import { Switch } from '../components/ui/switch.jsx'
import { Alert, AlertDescription } from '../components/ui/alert.jsx'
import { ThemeSelector } from '../components/ui/ThemeSelector.jsx'
import { CheckCircle, AlertCircle, User, Globe, Palette } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { userSettingsService } from '../services/user-settings.js'
import { feedbackService } from '../services/feedback.js'

const UserSettings = () => {
  const { user } = useAuth()
  const { darkMode, setDarkMode } = useTheme()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [settings, setSettings] = useState({
    first_name: '',
    last_name: '',
    recovery_email: '',
    country: '',
    currency: 'USD',
    date_format: 'MM/DD/YYYY',
    dark_mode: false
  })

  // Feedback state and handlers
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState('')
  const [feedbackError, setFeedbackError] = useState('')

  const handleFeedbackChange = (e) => {
    setFeedbackText(e.target.value)
  }

  const handleFeedbackSubmit = async () => {
    setFeedbackSubmitting(true)
    setFeedbackSuccess('')
    setFeedbackError('')
    try {
      await feedbackService.submitFeedback(user.id, feedbackText)
      setFeedbackSuccess('Thank you for your feedback!')
      setFeedbackText('')
    } catch (err) {
      setFeedbackError('Failed to submit feedback. Please try again.')
    } finally {
      setFeedbackSubmitting(false)
    }
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
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await userSettingsService.getSettings()
      setSettings(data)
      // Sync dark mode with theme context
      if (data && typeof data.dark_mode === 'boolean') {
        setDarkMode(data.dark_mode)
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
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

      await userSettingsService.saveSettings(settings)
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

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
          </CardContent>
        </Card>

        {/* Preferences */}
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

    {/* Feedback Section */}
    <div className="mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Send Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="feedback">Your feedback (max 500 words)</Label>
          <textarea
            id="feedback"
            className="w-full border rounded p-2 mt-2"
            rows={6}
            maxLength={2500}
            value={feedbackText}
            onChange={handleFeedbackChange}
            placeholder="Share your thoughts, suggestions, or issues..."
          />
          <div className="flex justify-end mt-2">
            <Button onClick={handleFeedbackSubmit} disabled={feedbackSubmitting || feedbackText.trim().length === 0}>
              {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
          {feedbackSuccess && (
            <Alert className="mt-2" variant="success">
              <CheckCircle className="mr-2 h-4 w-4" />
              <AlertDescription>{feedbackSuccess}</AlertDescription>
            </Alert>
          )}
          {feedbackError && (
            <Alert className="mt-2" variant="destructive">
              <AlertCircle className="mr-2 h-4 w-4" />
              <AlertDescription>{feedbackError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
 )
}

export default UserSettings
