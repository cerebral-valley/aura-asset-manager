import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { Label } from '../ui/label.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx'
import { Alert, AlertDescription } from '../ui/alert.jsx'

const features = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Complete Financial Picture',
    description: 'Track all your assets, from real estate and stocks to crypto and insurance, in one beautiful dashboard.'
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    title: 'Goal-Oriented Planning',
    description: 'Set meaningful financial targets and watch your progress in real-time with intelligent forecasting.'
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Bank-Level Security',
    description: 'Enterprise-grade encryption, secure authentication, and complete data privacy built into every layer.'
  }
]

const testimonials = [
  {
    name: 'Kunal Jadhav',
    location: 'India',
    avatar: 'KJ',
    quote: 'Aura transformed how I track my investments. The clarity and peace of mind it brings is invaluable.',
    role: 'Angel Investor'
  },
  {
    name: 'Nijat Garavey',
    location: 'United States',
    avatar: 'NG',
    quote: 'Finally, a wealth management tool that feels personal. The interface is gorgeous and the insights are spot-on.',
    role: 'Portfolio Manager'
  },
  {
    name: 'Pete Siriwanransug',
    location: 'Thailand',
    avatar: 'PS',
    quote: 'The goal tracking feature helped me achieve my first million. Aura makes complex finance feel simple.',
    role: 'Entrepreneur'
  }
]

const stats = [
  { 
    value: '10,000+', 
    label: 'Active Users',
    description: 'Trust Aura with their wealth'
  },
  { 
    value: '£500M+', 
    label: 'Assets Tracked',
    description: 'Across all asset classes'
  },
  { 
    value: '99.9%', 
    label: 'Uptime',
    description: 'Always available when you need it'
  }
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
    } catch (err) {
      setError('An unexpected error occurred during Google sign-in')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 -left-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-30" />

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
          <div className="text-center">
            {/* Logo/Brand */}
            <div className="mb-8 flex justify-center">
              <div className="inline-flex items-center gap-3 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-6 py-2 backdrop-blur-sm">
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  Aura
                </span>
                <span className="rounded-full bg-emerald-400/90 px-2.5 py-0.5 text-xs font-semibold text-slate-900">
                  v2.0
                </span>
              </div>
            </div>

            {/* Hero Headline */}
            <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Your Personal
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"> Financial Sanctuary</span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Track your wealth, achieve your goals, and find peace of mind. 
              Aura brings clarity to your complete financial picture.
            </p>
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid gap-8 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-white/10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl font-bold text-white sm:text-5xl">{stat.value}</div>
                <div className="mt-2 text-sm font-semibold uppercase tracking-wider text-emerald-400">
                  {stat.label}
                </div>
                <p className="mt-1 text-xs text-slate-400">{stat.description}</p>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            ))}
          </div>

          {/* Auth Card - Centered */}
          <div className="mt-16 flex justify-center">
            <Card className="w-full max-w-md border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl">
              <CardHeader className="space-y-1">
                <CardTitle className="text-center text-2xl font-bold text-white">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </CardTitle>
                <CardDescription className="text-center text-slate-400">
                  {isSignUp ? 'Start your journey to financial clarity' : 'Sign in to access your sanctuary'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive" className="border-red-500/50 bg-red-500/10 text-red-200">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {successMessage && (
                    <Alert className="border-emerald-500/50 bg-emerald-500/10 text-emerald-100">
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
                      placeholder="you@example.com"
                      className="border-slate-700 bg-slate-950/50 text-white placeholder:text-slate-500"
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
                      className="border-slate-700 bg-slate-950/50 text-white placeholder:text-slate-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600"
                    disabled={loading || googleLoading}
                  >
                    {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
                  </Button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-slate-900 px-2 text-slate-400">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-slate-700 bg-slate-950/50 text-white hover:bg-slate-800"
                    disabled={loading || googleLoading}
                    onClick={handleGoogleSignIn}
                  >
                    {googleLoading ? (
                      'Connecting...'
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                      </div>
                    )}
                  </Button>

                  <div className="text-center text-sm">
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-emerald-400 hover:text-emerald-300 hover:underline"
                    >
                      {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold uppercase tracking-wider text-emerald-400">
              Everything You Need
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Built for modern wealth management
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
              Aura combines powerful features with beautiful design to give you complete control over your financial future.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-8 backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 inline-flex rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-500/20 p-3 text-emerald-400 ring-1 ring-emerald-500/30">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold uppercase tracking-wider text-emerald-400">
              Testimonials
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Trusted by thousands worldwide
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-8 backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Quote Icon */}
                <div className="mb-4 text-emerald-400/20">
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                  </svg>
                </div>

                <p className="text-sm leading-relaxed text-slate-300">
                  "{testimonial.quote}"
                </p>

                <div className="mt-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 text-sm font-bold text-white">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-xs text-slate-400">{testimonial.role}</div>
                    <div className="text-xs text-emerald-400">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 bg-slate-950/50 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            <div className="text-center text-sm text-slate-400">
              <p>© 2025 Aura Asset Manager. Built with care for your financial future.</p>
              <p className="mt-2">
                <span className="text-emerald-400">🔒 Secure</span> · 
                <span className="text-blue-400"> Private</span> · 
                <span className="text-purple-400"> Encrypted</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
