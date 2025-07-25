import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TransactionsSimple() {
  const [loading, setLoading] = useState(true)

  console.log('TransactionsSimple: Component initializing')

  useEffect(() => {
    console.log('TransactionsSimple: useEffect - simulating data load')
    // Simulate loading without API calls
    setTimeout(() => {
      console.log('TransactionsSimple: Setting loading to false')
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    console.log('TransactionsSimple: Rendering loading state')
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  console.log('TransactionsSimple: Rendering main component')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">
            This is a simplified version to test rendering without API calls.
          </p>
        </div>
        <Button>
          Test Button
        </Button>
      </div>

      {/* Test Card */}
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
          <CardDescription>
            If you can see this, the basic UI components are working.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is a test to isolate the rendering issue.</p>
        </CardContent>
      </Card>
    </div>
  )
}
