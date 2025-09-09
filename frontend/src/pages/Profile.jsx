import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useProfileValidation } from '../hooks/useProfileValidation.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Button } from '../components/ui/button.jsx'
import { Input } from '../components/ui/input.jsx'
import { Label } from '../components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.jsx'
import { Alert, AlertDescription } from '../components/ui/alert.jsx'
import { User, MapPin, Users, Briefcase, CheckCircle, AlertCircle, Calendar, Target } from 'lucide-react'
import SensitiveInput from '../components/ui/SensitiveInput.jsx'
import ProfileProgressIndicator from '../components/profile/ProfileProgressIndicator.jsx'
import { formatPhoneNumber } from '../utils/profileUtils.js'
import { profileService } from '../services/profile.js'

const Profile = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  const [profile, setProfile] = useState({
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
    // Family Information fields
    elderly_dependents: false,
    children_age_groups: []
  })

  const [options, setOptions] = useState({
    marital_status_options: [],
    gender_options: [],
    occupation_options: [],
    risk_appetite_options: []
  })

  const [countries, setCountries] = useState([])
  
  // Initialize validation hook
  const {
    handleFieldBlur,
    handleFieldChange,
    getFieldError,
    hasFieldError,
    isFormValid
  } = useProfileValidation(profile)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch profile data, options, and countries in parallel
      const [profileData, optionsData, countriesData] = await Promise.all([
        profileService.getProfile(),
        profileService.getProfileOptions(),
        profileService.getCountries()
      ])

      setProfile({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        marital_status: profileData.marital_status || '',
        gender: profileData.gender || '',
        date_of_birth: profileData.date_of_birth || '',
        children: profileData.children?.toString() || '',
        dependents: profileData.dependents?.toString() || '',
        city: profileData.city || '',
        pin_code: profileData.pin_code || '',
        state: profileData.state || '',
        country: profileData.country || '',
        nationality: profileData.nationality || '',
        phone_number: profileData.phone_number || '',
        annual_income: profileData.annual_income || '',
        occupation: profileData.occupation || '',
        risk_appetite: profileData.risk_appetite || '',
        // Family Information fields
        elderly_dependents: profileData.elderly_dependents || false,
        children_age_groups: profileData.children_age_groups || []
      })

      setOptions(optionsData)
      setCountries(countriesData)
    } catch (err) {
      console.error('Error fetching profile data:', err)
      setError(err.message || 'Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      // Convert string fields back to appropriate types for API
      const profileData = {
        ...profile,
        children: profile.children ? parseInt(profile.children) : null,
        dependents: profile.dependents ? parseInt(profile.dependents) : null,
        annual_income: profile.annual_income ? parseFloat(profile.annual_income) : null,
        date_of_birth: profile.date_of_birth || null
      }

      await profileService.updateProfile(profileData)
      setSuccess('Profile updated successfully!')
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error saving profile:', err)
      setError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    // Handle phone number formatting
    if (field === 'phone_number') {
      value = formatPhoneNumber(value)
    }
    
    // Handle children_age_groups toggle
    if (field === 'children_age_groups' && Array.isArray(profile.children_age_groups)) {
      const currentGroups = profile.children_age_groups
      const updatedGroups = currentGroups.includes(value) 
        ? currentGroups.filter(g => g !== value)
        : [...currentGroups, value]
      value = updatedGroups
    }
    
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Trigger validation on change
    handleFieldChange(field, value)
  }

  const handleInputBlur = (field, value) => {
    handleFieldBlur(field, value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto pb-20 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="h-8 w-8" />
          Your Profile
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your personal information and preferences
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6 max-w-3xl mx-auto">
        <ProfileProgressIndicator profile={profile} className="w-full" />
      </div>

      {/* Alerts */}
      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Your basic personal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="first_name"
                  value={profile.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  onBlur={(e) => handleInputBlur('first_name', e.target.value)}
                  placeholder="Enter your first name"
                  className={hasFieldError('first_name') ? 'border-red-500' : ''}
                />
                {getFieldError('first_name') && (
                  <p className="text-sm text-red-600 mt-1">{getFieldError('first_name')}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="last_name"
                  value={profile.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  onBlur={(e) => handleInputBlur('last_name', e.target.value)}
                  placeholder="Enter your last name"
                  className={hasFieldError('last_name') ? 'border-red-500' : ''}
                />
                {getFieldError('last_name') && (
                  <p className="text-sm text-red-600 mt-1">{getFieldError('last_name')}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marital_status">Marital Status</Label>
                <Select value={profile.marital_status} onValueChange={(value) => handleInputChange('marital_status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.marital_status_options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={profile.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.gender_options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">
                  Date of Birth <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={profile.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  onBlur={(e) => handleInputBlur('date_of_birth', e.target.value)}
                  max={new Date().toISOString().split('T')[0]} // Prevent future dates
                  className={hasFieldError('date_of_birth') ? 'border-red-500' : ''}
                />
                {getFieldError('date_of_birth') && (
                  <p className="text-sm text-red-600 mt-1">{getFieldError('date_of_birth')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <SensitiveInput
                  id="phone_number"
                  type="phone"
                  value={profile.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  onBlur={(e) => handleInputBlur('phone_number', e.target.value)}
                  placeholder="Enter your phone number"
                  error={getFieldError('phone_number')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_email">Email (Account)</Label>
              <SensitiveInput
                id="current_email"
                type="email"
                value={user?.email || ''}
                disabled={true}
                placeholder="Your account email"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This is your account email and cannot be changed here
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Family Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Family Information
            </CardTitle>
            <CardDescription>
              Details about your family and dependents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="children">Number of Children</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  value={profile.children}
                  onChange={(e) => handleInputChange('children', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dependents">Number of Dependents</Label>
                <Input
                  id="dependents"
                  type="number"
                  min="0"
                  value={profile.dependents}
                  onChange={(e) => handleInputChange('dependents', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Compact row: Elderly + Children Age Groups */}
            <div className="grid grid-cols-2 gap-4 items-start">
              {/* Elderly Dependents */}
              <div className="space-y-2">
                <Label>Elderly Dependents</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={profile.elderly_dependents ? "default" : "outline"}
                    size="sm"
                    className="px-4"
                    onClick={() => handleInputChange('elderly_dependents', true)}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={!profile.elderly_dependents ? "default" : "outline"}
                    size="sm"
                    className="px-4"
                    onClick={() => handleInputChange('elderly_dependents', false)}
                  >
                    No
                  </Button>
                </div>
              </div>

              {/* Children Age Groups */}
              <div className="space-y-2">
                <Label>Children Age Groups</Label>
                <div className="flex flex-wrap gap-2">
                  {['0–5', '6–12', '13–18', '18+'].map((ageGroup) => (
                    <Button
                      key={ageGroup}
                      type="button"
                      variant={profile.children_age_groups.includes(ageGroup) ? "default" : "outline"}
                      size="sm"
                      className="px-3 py-1 text-xs rounded-full"
                      onClick={() => handleInputChange('children_age_groups', ageGroup)}
                    >
                      {ageGroup}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Used for education planning & insurance suggestions</p>
              </div>
            </div>

            {/* Household Size Summary */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center bg-muted/50 rounded-lg p-3">
                <div>
                  <span className="font-medium">Household Size:</span>
                  <span className="ml-2 text-lg font-semibold">
                    {1 + (parseInt(profile.children) || 0) + (parseInt(profile.dependents) || 0)} people
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">Auto-calculated</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Information
            </CardTitle>
            <CardDescription>
              Your residential and nationality details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  value={profile.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  onBlur={(e) => handleInputBlur('city', e.target.value)}
                  placeholder="Enter your city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={profile.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  onBlur={(e) => handleInputBlur('state', e.target.value)}
                  placeholder="Enter your state/province"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pin_code">PIN/Zip Code</Label>
                <Input
                  id="pin_code"
                  value={profile.pin_code}
                  onChange={(e) => handleInputChange('pin_code', e.target.value)}
                  onBlur={(e) => handleInputBlur('pin_code', e.target.value)}
                  placeholder="Enter your PIN/zip code"
                  className={hasFieldError('pin_code') ? 'border-red-500' : ''}
                />
                {getFieldError('pin_code') && (
                  <p className="text-sm text-red-600 mt-1">{getFieldError('pin_code')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">
                  Country <span className="text-red-500">*</span>
                </Label>
                <Select value={profile.country} onValueChange={(value) => handleInputChange('country', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={profile.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                placeholder="Enter your nationality"
              />
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Financial Information
            </CardTitle>
            <CardDescription>
              Your professional and financial details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="space-y-2">
              <Label htmlFor="occupation">
                Occupation <span className="text-red-500">*</span>
              </Label>
              <Select value={profile.occupation} onValueChange={(value) => handleInputChange('occupation', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your occupation" />
                </SelectTrigger>
                <SelectContent>
                  {options.occupation_options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="annual_income">Annual Income</Label>
              <Input
                id="annual_income"
                value={profile.annual_income}
                onChange={(e) => handleInputChange('annual_income', e.target.value)}
                onBlur={(e) => handleInputBlur('annual_income', e.target.value)}
                placeholder="Enter your annual income"
                type="number"
                min="0"
                className={hasFieldError('annual_income') ? 'border-red-500' : ''}
              />
              {getFieldError('annual_income') && (
                <p className="text-sm text-red-600 mt-1">{getFieldError('annual_income')}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Optional: This helps us provide better financial insights
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Risk Appetite */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Investment Risk Appetite
            </CardTitle>
            <CardDescription>
              Help us understand your investment preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="risk_appetite">
                  Risk Appetite <span className="text-red-500">*</span>
                </Label>
                <Select value={profile.risk_appetite} onValueChange={(value) => handleInputChange('risk_appetite', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your risk appetite" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.risk_appetite_options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {profile.risk_appetite && (
                  <div className="mt-3 p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      {options.risk_appetite_options.find(o => o.value === profile.risk_appetite)?.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex flex-col gap-4 mt-6">
        {!isFormValid && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Please fix the validation errors above before saving.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saving || !isFormValid} 
            size="lg"
            className="min-w-[120px]"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Profile
