import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Button } from '@/components/ui/button.jsx'
import { ShieldCheck } from 'lucide-react'

const ReferralGate = ({ onEnterCode, compact = false }) => {
  return (
    <div className={`w-full ${compact ? '' : 'max-w-3xl mx-auto'}`}>
      <Alert className="border-primary/40 bg-primary/5">
        <AlertDescription className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-semibold">Referral code required</span>
          </div>
          <p className="text-sm text-muted-foreground">
            To keep Aura’s financial sanctuary curated, we require a referral code before you can add assets or insurance data.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>• Each code can be used once</span>
            <span>• Sharing codes publicly is disabled</span>
            <span>• Reach out to the team if you need help</span>
          </div>
          <Button size="sm" onClick={onEnterCode}>
            Enter referral code
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default ReferralGate
