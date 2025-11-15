import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, User, Settings, ShieldCheck, Wallet2, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react'
import ShimmerButton from '../magicui/ShimmerButton.jsx'
import { Button } from '../ui/button.jsx'

const statusClasses = (complete) => complete
  ? 'text-emerald-300 bg-emerald-500/10 border border-emerald-400/30'
  : 'text-amber-200 bg-amber-500/10 border border-amber-300/20'

const stepPill = (label) => (
  <span className="text-[11px] uppercase tracking-[0.3em] text-white/60">
    {label}
  </span>
)

const HighlightStat = ({ label, value, description }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
    <p className="text-xs uppercase tracking-[0.35em] text-white/60">{label}</p>
    <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    <p className="mt-1 text-sm text-white/70">{description}</p>
  </div>
)

const NewUserWelcome = ({
  profileName,
  profileComplete,
  settingsComplete,
  hasAssets,
  hasInsurance,
  versionLabel,
  settingsError,
  settingsLoading,
  needsReferralCode = false,
  onReferralClick = () => {},
}) => {
  const navigate = useNavigate()

  const tasks = useMemo(() => [
    {
      id: 'profile',
      title: 'Complete your profile',
      description: 'Add your name, location, and basic income info so insights feel personal.',
      icon: User,
      path: '/profile',
      complete: profileComplete,
      step: 'Step 1',
    },
    {
      id: 'settings',
      title: 'Review preferences',
      description: 'Choose currency, date format, and your preferred Aura theme.',
      icon: Settings,
      path: '/settings',
      complete: settingsComplete,
      step: 'Step 2',
    },
    {
      id: 'insurance',
      title: 'Add insurance protection',
      description: 'Log at least one policy so Aura can calculate coverage strength.',
      icon: ShieldCheck,
      path: '/insurance',
      complete: hasInsurance,
      step: 'Step 3',
    },
    {
      id: 'asset',
      title: 'Add your first asset',
      description: 'Track property, investments, or savings to unlock the dashboard.',
      icon: Wallet2,
      path: '/portfolio',
      complete: hasAssets,
      step: 'Step 4',
    },
  ], [profileComplete, settingsComplete, hasAssets, hasInsurance])

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950 text-white shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_60%)]" />
      <div className="relative p-8 lg:p-12 space-y-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            {stepPill('Welcome to Aura')}
            <div className="mt-3 flex items-center gap-3 text-white/80">
              <Sparkles className="h-5 w-5 text-cyan-300" />
              <p className="text-sm">
                {profileName ? `Hello ${profileName},` : 'Hello,'} let’s build your financial sanctuary
              </p>
            </div>
            <h1 className="mt-3 text-4xl font-semibold leading-tight">
              Start with your foundation before unlocking the full dashboard
            </h1>
            <p className="mt-3 text-base text-white/75 max-w-2xl">
              Update your profile and preferences, then add your first insurance policy and asset. Once Aura detects at least one of each, your personalized dashboard, charts, and recommendations will appear automatically.
            </p>
          </div>
          <div className="self-end text-right">
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">Version</p>
            <p className="text-2xl font-semibold">{versionLabel}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <HighlightStat
            label="Profile"
            value={profileComplete ? 'Complete' : 'Action Needed'}
            description={profileComplete ? 'Personal details saved' : 'Add at least your name or location'}
          />
          <HighlightStat
            label="Preferences"
            value={settingsLoading ? 'Checking…' : settingsComplete ? 'Personalized' : 'Default Settings'}
            description={
              settingsLoading
                ? 'Loading your saved preferences'
                : settingsComplete
                  ? 'Custom currency/theme selected'
                  : 'Choose currency, date format, or theme'
            }
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <HighlightStat
            label="Insurance"
            value={hasInsurance ? 'In Progress' : 'Not Added'}
            description={hasInsurance ? 'First policy saved' : 'Add at least one policy'}
          />
          <HighlightStat
            label="Assets"
            value={hasAssets ? 'In Progress' : 'Not Added'}
            description={hasAssets ? 'Tracking has started' : 'Add your first asset'}
          />
        </div>

        {settingsError && (
          <div className="rounded-2xl border border-amber-300/30 bg-amber-500/10 p-4 text-amber-100">
            <p className="text-sm font-medium">We couldn't load your saved settings.</p>
            <p className="text-sm text-amber-200/80">You can still continue onboarding—your data will be saved once the connection stabilizes.</p>
          </div>
        )}

        {needsReferralCode && (
          <div className="rounded-2xl border border-cyan-300/30 bg-cyan-500/10 p-4 text-cyan-50 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-cyan-200" />
              <div>
                <p className="text-sm font-semibold text-cyan-50">Referral code required</p>
                <p className="text-xs text-cyan-100/80">
                  Paste the referral code you received to unlock asset and insurance data entry.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="self-start lg:self-auto"
              onClick={onReferralClick}
            >
              Paste referral code
            </Button>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {tasks.map((task) => {
            const Icon = task.icon
            return (
              <button
                key={task.id}
                onClick={() => navigate(task.path)}
                className="group rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-cyan-300/60 hover:bg-white/10"
              >
                <div className="flex items-start gap-4">
                  <div className={`rounded-2xl p-3 ${task.complete ? 'bg-emerald-500/15 text-emerald-300' : 'bg-cyan-500/10 text-cyan-200'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
                      {task.step}
                      {!task.complete && <ChevronRight className="h-3 w-3" />}
                    </div>
                    <p className="mt-2 text-xl font-semibold text-white">{task.title}</p>
                    <p className="mt-2 text-sm text-white/70">{task.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className={`rounded-full px-3 py-1 text-xs ${statusClasses(task.complete)}`}>
                    {task.complete ? 'Completed' : 'Start here'}
                  </span>
                  {task.complete ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-white/60 group-hover:text-white" />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-cyan-300" />
            <span>Need more help? Review the beginner’s guide for a narrated walkthrough.</span>
          </div>
          <ShimmerButton onClick={() => navigate('/guide')} className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4" />
            New to Aura - Beginner's Guide
          </ShimmerButton>
        </div>
      </div>
    </div>
  )
}

export default NewUserWelcome
