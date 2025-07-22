import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react'

const RecentTransactions = ({ transactions = [], title = "Recent Activity" }) => {
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'purchase':
        return <ArrowUpCircle className="h-4 w-4 text-green-600" />
      case 'sale':
        return <ArrowDownCircle className="h-4 w-4 text-red-600" />
      case 'value_update':
        return <RefreshCw className="h-4 w-4 text-blue-600" />
      default:
        return <RefreshCw className="h-4 w-4 text-gray-600" />
    }
  }

  const getTransactionLabel = (type) => {
    switch (type) {
      case 'purchase':
        return 'Acquired'
      case 'sale':
        return 'Sold'
      case 'value_update':
        return 'Updated'
      default:
        return type
    }
  }

  const formatAmount = (amount) => {
    if (!amount) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No recent transactions
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction, index) => (
            <div key={transaction.id || index} className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {getTransactionIcon(transaction.transaction_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground truncate">
                    {transaction.asset_name}
                  </p>
                  {transaction.amount && (
                    <p className="text-sm font-medium text-foreground">
                      {formatAmount(transaction.amount)}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {getTransactionLabel(transaction.transaction_type)}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(transaction.date), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default RecentTransactions

