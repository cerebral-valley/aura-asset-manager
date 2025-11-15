import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { Label } from '../ui/label.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx'
import { Alert, AlertDescription } from '../ui/alert.jsx'

const featureHighlights = [
  {
    title: 'Unified balance sheet',
    description: 'Track every asset, policy, and transaction in one intuitive view for instant clarity.'
  },
  {
    title: 'Human + AI intelligence',
    description: 'Bring together Aura’s AI copilots and your advisor to stress-test every wealth decision.'
  },
  {
    title: 'Secure by default',
    description: 'SOC2-ready controls, Supabase Auth, and role-aware access keep your sanctuary private.'
  }
]

const stats = [
  { label: 'Client loyalty', value: '98%' },
  { label: 'Assets tracked', value: '$4.1B+' },
  { label: 'Playbooks shipped', value: '350+' }
]

const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const { signIn, signUp, signInWithGoogle } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      if (isSignUp) {
        const { data, error } = await signUp(email, password)
        
        if (error) {
          setError(error.message)
        } else {
          setSuccessMessage(
            "We've sent a verification link to your email. Please check your inbox and click the link to verify your account."
          )
          // Reset the form after successful signup
          setEmail('')
          setPassword('')
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const { error } = await signInWithGoogle()
      if (error) {
        setError(error.message)
      }
      // Note: With OAuth, the redirect happens automatically
      // so we don't need to handle success here
    } catch (err) {
      setError('An unexpected error occurred during Google sign-in')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_rgba(15,23,42,0.4))]" />
      <div className="absolute -top-20 -right-10 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12 lg:flex-row lg:items-center lg:py-20">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/70">
            Aura Asset Manager
            <span className="rounded-full bg-lime-400/80 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-900">New</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
              Your Window to Personalised Wealth Management
            </h1>
            <p className="text-base text-white/80 md:text-lg">
              Aura blends calm, cinematic design with institutional-grade infrastructure so you can steward family wealth with confidence. Every login opens a living dossier of your assets, liabilities, insurance, and aspirations.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <div className="text-3xl font-semibold text-white">{stat.value}</div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {featureHighlights.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">{feature.title}</p>
                <p className="mt-2 text-xs text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <Card className="w-full border-white/10 bg-slate-900/80 backdrop-blur">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-semibold text-white">Enter your sanctuary</CardTitle>
              <CardDescription className="text-sm text-white/70">
                Sign in to resume your personalised wealth playbook
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="bg-red-500/10 text-red-200">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {successMessage && (
                  <Alert className="border-emerald-300/30 bg-emerald-500/10 text-emerald-100">
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="family.office@aura"
                    className="bg-slate-950/40 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="bg-slate-950/40 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Protected by Supabase Auth</span>
                  <button type="button" className="text-white/80 underline-offset-4 hover:underline">
                    Need help?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-sky-400 text-slate-950 hover:from-emerald-300 hover:to-sky-300"
                  disabled={loading || googleLoading}
                >
                  {loading ? 'Please wait…' : (isSignUp ? 'Create account' : 'Sign in')}
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] text-white/60">
                    <span className="bg-slate-900/80 px-3">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-white/20 bg-slate-950/50 text-white hover:bg-slate-900"
                  disabled={loading || googleLoading}
                  onClick={handleGoogleSignIn}
                >
                  {googleLoading ? (
                    'Connecting…'
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Continue with Google
                    </div>
                  )}
                </Button>

                <div className="text-center text-sm text-white/80">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm text-emerald-300 hover:text-emerald-200"
                  >
                    {isSignUp ? 'Already have an account? Sign in' : "Don’t have an account? Sign up"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
