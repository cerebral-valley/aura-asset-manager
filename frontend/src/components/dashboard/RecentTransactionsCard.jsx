import { CardContent, CardHeader, CardTitle } from '../ui/card.jsx'
import { useCurrency } from '../../hooks/useCurrency.jsx'
import MagicCard from '../magicui/MagicCard.jsx'
import NumberTicker from '../magicui/NumberTicker.jsx'
import BlurFade from '../magicui/BlurFade.jsx'
import { motion } from 'framer-motion'
import { Clock, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react'
import { format } from 'date-fns'

const RecentTransactionsCard = ({ transactions }) => {
  const { formatCurrency } = useCurrency()

  // Get last 5 transactions sorted by date
  const recentTransactions = transactions
    ?.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
    ?.slice(0, 5) || []

  const getTransactionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'buy':
      case 'deposit':
      case 'create':
        return <ArrowDownRight className="h-4 w-4 text-green-500" />
      case 'sell':
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      default:
        return <Plus className="h-4 w-4 text-blue-500" />
    }
  }

  const getTransactionColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'buy':
      case 'deposit':
      case 'create':
        return 'text-green-500'
      case 'sell':
      case 'withdrawal':
        return 'text-red-500'
      default:
        return 'text-blue-500'
    }
  }

  return (
    <MagicCard 
      gradientColor="#6366f1" 
      gradientSize={300}
      gradientOpacity={0.6}
      className="backdrop-blur-sm"
    >
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentTransactions.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No recent transactions
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction, index) => (
              <BlurFade key={transaction.id} delay={0.05 * index} inView={true}>
                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors border border-white/5"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {getTransactionIcon(transaction.transaction_type)}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {transaction.asset_name || 'Unknown Asset'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.transaction_date 
                          ? format(new Date(transaction.transaction_date), 'MMM dd, yyyy')
                          : 'No date'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold font-mono ${getTransactionColor(transaction.transaction_type)}`}>
                      {transaction.amount !== null && transaction.amount !== undefined ? (
                        <>
                          {formatCurrency(0).replace(/[\d.,]+/, '')}
                          <NumberTicker value={Math.abs(transaction.amount)} decimalPlaces={0} />
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {transaction.transaction_type || 'Other'}
                    </p>
                  </div>
                </motion.div>
              </BlurFade>
            ))}
          </div>
        )}
      </CardContent>
    </MagicCard>
  )
}

export default RecentTransactionsCard
