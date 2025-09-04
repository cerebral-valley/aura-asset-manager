import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { User } from 'lucide-react'

const Profile = () => {
  const { user } = useAuth()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="h-8 w-8" />
          Your Profile
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your personal information and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Your basic profile details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground">{user?.email || 'Not available'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Full profile management features coming soon...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Profile
