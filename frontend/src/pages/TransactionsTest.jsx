import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function TransactionsTest() {
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    console.log('TransactionsTest: Component mounted, user:', !!user)
    setLoading(false)
  }, [user])

  console.log('TransactionsTest: Rendering, loading:', loading, 'user:', !!user)

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Loading Transactions...</h1>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Transactions Test Page</h1>
      <p>This is a test version to debug the blank page issue.</p>
      <p>User authenticated: {user ? 'Yes' : 'No'}</p>
      <p>User email: {user?.email || 'Not available'}</p>
    </div>
  )
}
