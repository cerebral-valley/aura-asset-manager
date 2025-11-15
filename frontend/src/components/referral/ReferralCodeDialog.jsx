import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { userSettingsService } from '@/services/user-settings.js'
import { queryKeys } from '@/lib/queryKeys'
import { toast } from 'sonner'

const normalizeCode = (value) => value?.toUpperCase().replace(/[^A-Z0-9]/g, '') ?? ''

const ReferralCodeDialog = ({ open, onOpenChange, onSuccess }) => {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!open) {
      setCode('')
      setError('')
    }
  }, [open])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const normalized = normalizeCode(code)
    if (!normalized || normalized.length !== 10) {
      setError('Enter the 10 character code you received.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await userSettingsService.updateSettings({ referral_code: normalized })
      toast.success('Referral code applied successfully')
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.settings() })
      onSuccess?.(normalized)
      onOpenChange(false)
    } catch (err) {
      const message = err?.response?.data?.detail || err?.message || 'Failed to verify referral code'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter referral code</DialogTitle>
          <DialogDescription>
            Paste the 10 character alphanumeric code you received from the Aura team. Each code can only be used once.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABC12345XY"
              maxLength={10}
              inputMode="text"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              • Codes are case-insensitive &nbsp;• Only letters and numbers are allowed &nbsp;• Exactly 10 characters &nbsp;• Each code activates a single account
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Validating…' : 'Apply code'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ReferralCodeDialog
