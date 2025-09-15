import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Loading from '@/components/ui/Loading'
import SafeSection from '@/components/util/SafeSection'
import { log, warn, error } from '@/lib/debug'

export default function TransactionsSimple() {
  log('TransactionsSimple: Component initializing');
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    log('TransactionsSimple:useEffect', 'Simulating data load without API calls');
    // Simulate loading without API calls
    setTimeout(() => {
      log('TransactionsSimple:useEffect', 'Simulated loading complete');
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    log('TransactionsSimple:loading', 'Still loading simulated data...');
    return <Loading pageName="TransactionsSimple" />;
  }

  // Add render state logging
  log('TransactionsSimple component rendering:', {
    message: 'Simplified transactions page with no API dependencies'
  });

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
      <SafeSection debugId="TransactionsSimple:TestCard">
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
      </SafeSection>
    </div>
  )
}
