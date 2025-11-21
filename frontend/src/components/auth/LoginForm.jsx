import { useState, useEffect } from 'react'
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
    title: 'High-Level Security',
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
    name: 'Nijat Garayev',
    location: 'United States',
    avatar: 'NG',
    quote: 'Finally, a wealth management tool that feels personal. The interface is gorgeous and the insights are spot-on.',
    role: 'Professor'
  },
  {
    name: 'Pete Siriwanransug',
    location: 'Thailand',
    avatar: 'PS',
    quote: 'The goal tracking feature helped me achieve my first million. Aura makes complex finance feel simple.',
    role: 'Entrepreneur'
  }
]

// Constellation points for background - reduced for better visibility
const constellationPoints = [
  { x: '15%', y: '20%' }, { x: '30%', y: '15%' }, { x: '45%', y: '25%' },
  { x: '60%', y: '18%' }, { x: '75%', y: '22%' }, { x: '85%', y: '28%' },
  { x: '20%', y: '45%' }, { x: '40%', y: '50%' }, { x: '55%', y: '48%' },
  { x: '70%', y: '55%' }, { x: '82%', y: '50%' }, { x: '25%', y: '75%' },
  { x: '50%', y: '80%' }, { x: '72%', y: '78%' }, { x: '88%', y: '85%' }
]

const LoginForm = () => {
  // Animation state: 'logo-enter', 'logo-move', 'tagline-enter', 'tagline-move', 'complete'
  const [animationPhase, setAnimationPhase] = useState('logo-enter')
  const [showSkip, setShowSkip] = useState(false)
  
  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const { signIn, signUp, signInWithGoogle } = useAuth()

  useEffect(() => {
    // Check if user has seen intro before
    const hasSeenIntro = sessionStorage.getItem('aura_intro_seen')
    
    if (hasSeenIntro) {
      setAnimationPhase('complete')
      return
    }
    
    // Animation sequence
    const t1 = setTimeout(() => setAnimationPhase('logo-move'), 1500)
    const t2 = setTimeout(() => setAnimationPhase('tagline-enter'), 2500)
    const t3 = setTimeout(() => setAnimationPhase('tagline-move'), 3500)
    const t4 = setTimeout(() => {
      setAnimationPhase('complete')
      sessionStorage.setItem('aura_intro_seen', 'true')
    }, 4500)
    
    // Show skip button after 1s
    const t5 = setTimeout(() => setShowSkip(true), 1000)
    
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
    }
  }, [])

  const skipIntro = () => {
    setAnimationPhase('complete')
    sessionStorage.setItem('aura_intro_seen', 'true')
  }

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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#162447] to-[#1b1b2f]">
      {/* Constellation + Mountain Background */}
      <div className="absolute inset-0">
        {/* Mountain Silhouette */}
        <svg className="absolute bottom-0 w-full h-2/3 opacity-70" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMax slice">
          <defs>
            <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3d5a80" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#1a2942" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <path d="M0,800 L300,500 L500,650 L700,350 L900,550 L1100,400 L1400,600 L1600,450 L1920,700 L1920,1080 L0,1080 Z" 
                fill="url(#mountainGrad)"
                stroke="#4a6fa5"
                strokeWidth="2"
                opacity="0.85" />
        </svg>

        {/* Constellation Points */}
        <div className="absolute inset-0">
          {constellationPoints.map((point, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: point.x,
                top: point.y,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${3 + (i % 3)}s`
              }}
            >
              <div className="h-3 w-3 rounded-full bg-white shadow-[0_0_20px_5px_rgba(255,255,255,0.7)]" />
            </div>
          ))}
        </div>

        {/* Aurora Streams */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500/30 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-bl from-blue-500/30 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-tr from-purple-500/30 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
        </div>

        {/* Noise Texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-40" />
      </div>

      {/* Animated Logo Intro */}
      {animationPhase !== 'complete' && (
        <div className="relative z-50">
          {/* Skip Button */}
          {showSkip && (
            <button
              onClick={skipIntro}
              className="fixed top-6 right-6 px-4 py-2 text-sm text-amber-300 border border-amber-300/30 rounded-full hover:bg-amber-300/10 transition-all duration-300 backdrop-blur-sm z-50"
            >
              Skip Intro →
            </button>
          )}

          {/* Logo Animation */}
          <div
            className="fixed font-bold bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent"
            style={{
              top: animationPhase === 'logo-enter' ? '50%' : '2rem',
              left: animationPhase === 'logo-enter' ? '50%' : '2rem',
              transform: animationPhase === 'logo-enter' ? 'translate(-50%, -50%)' : 'translate(0, 0)',
              fontSize: animationPhase === 'logo-enter' ? 'clamp(4rem, 10vw, 7rem)' : '1.75rem',
              opacity: animationPhase === 'logo-enter' ? 0 : 1,
              whiteSpace: 'nowrap',
              textAlign: 'center',
              transition: 'all 1.5s cubic-bezier(0.65, 0, 0.35, 1)',
              animation: animationPhase === 'logo-enter' ? 'fadeIn 1.5s ease-out forwards' : 'none'
            }}
          >
            <h1>Aura Asset Manager</h1>
          </div>

          {/* Tagline Animation */}
          {(animationPhase === 'tagline-enter' || animationPhase === 'tagline-move') && (
            <div
              className="fixed text-slate-300 font-light tracking-wide"
              style={{
                top: animationPhase === 'tagline-enter' ? '50%' : '5rem',
                left: animationPhase === 'tagline-enter' ? '50%' : '2rem',
                transform: animationPhase === 'tagline-enter' ? 'translate(-50%, -50%)' : 'translate(0, 0)',
                fontSize: animationPhase === 'tagline-enter' ? 'clamp(1.5rem, 5vw, 2.5rem)' : '0.95rem',
                opacity: animationPhase === 'tagline-enter' ? 0 : 1,
                whiteSpace: 'nowrap',
                textAlign: 'center',
                transition: 'all 1.5s cubic-bezier(0.65, 0, 0.35, 1)',
                animation: animationPhase === 'tagline-enter' ? 'fadeIn 1s ease-out forwards' : 'none'
              }}
            >
              <p>Your Command Center For Wealth</p>
            </div>
          )}
        </div>
      )}

      {/* Main Content (shown after animation complete) */}
      <div
        className={`relative z-10 transition-opacity duration-1000 ${
          animationPhase === 'complete' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Fixed Logo in Corner (after animation) */}
        <div className="fixed top-8 left-8 z-40">
          <h1 className="text-[1.75rem] font-bold bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
            Aura Asset Manager
          </h1>
          <p className="text-[0.95rem] text-slate-300 font-light tracking-wide">
            Your Command Center For Wealth
          </p>
        </div>

        {/* Hero Section */}
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 pt-32">
          <div className="text-center">
            {/* Hero Headline */}
            <h2 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Where Vision Meets
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-400 bg-clip-text text-transparent"> Altitude</span>
            </h2>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Orchestrate your empire with intelligence. Built for those who shape markets, not follow them.
            </p>
          </div>

          {/* Auth Card - Centered */}
          <div className="mt-16 flex justify-center">
            <Card className="w-full max-w-md border-amber-300/20 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-amber-500/10">
              <CardHeader className="space-y-1">
                <CardTitle className="text-center text-2xl font-bold text-white">
                  {isSignUp ? 'Join The Command Center' : 'Access Your Empire'}
                </CardTitle>
                <CardDescription className="text-center text-slate-400">
                  {isSignUp ? 'Begin your strategic wealth orchestration' : 'Sign in to your command center'}
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
                      className="border-slate-700 bg-slate-950/50 text-white placeholder:text-slate-500 focus:border-amber-300/50 focus:ring-amber-300/20"
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
                      className="border-slate-700 bg-slate-950/50 text-white placeholder:text-slate-500 focus:border-amber-300/50 focus:ring-amber-300/20"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-900 font-semibold hover:from-amber-300 hover:to-yellow-400 shadow-lg shadow-amber-500/30"
                    disabled={loading || googleLoading}
                  >
                    {loading ? 'Connecting...' : (isSignUp ? 'Initialize Command Center' : 'Access Now')}
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
                    className="w-full border-slate-700 bg-slate-950/50 text-white hover:bg-slate-800 hover:border-amber-300/30"
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
                      className="text-amber-300 hover:text-amber-200 hover:underline"
                    >
                      {isSignUp ? 'Already have command access? Sign in' : "New to the command center? Sign up"}
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
            <h2 className="text-base font-semibold uppercase tracking-wider text-amber-300">
              Strategic Capabilities
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Built for command-level oversight
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
              Intelligence-first infrastructure for orchestrating complex wealth portfolios across global markets.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-amber-300/10 bg-gradient-to-b from-white/5 to-white/0 p-8 backdrop-blur-sm transition-all hover:border-amber-300/30 hover:shadow-lg hover:shadow-amber-500/10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 inline-flex rounded-lg bg-gradient-to-br from-amber-400/20 to-yellow-300/20 p-3 text-amber-300 ring-1 ring-amber-400/30">
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
            <h2 className="text-base font-semibold uppercase tracking-wider text-amber-300">
              Summit Members
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Join those who've reached the altitude
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="group relative rounded-2xl border border-amber-300/10 bg-gradient-to-b from-white/5 to-white/0 p-8 backdrop-blur-sm transition-all hover:border-amber-300/30 hover:shadow-lg hover:shadow-amber-500/10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Quote Icon */}
                <div className="mb-4 text-amber-300/20">
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                  </svg>
                </div>

                <p className="text-sm leading-relaxed text-slate-300">
                  "{testimonial.quote}"
                </p>

                <div className="mt-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-300 text-sm font-bold text-slate-900">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-xs text-slate-400">{testimonial.role}</div>
                    <div className="text-xs text-amber-300">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-amber-300/10 bg-slate-950/50 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            <div className="text-center text-sm text-slate-400">
              <p>© 2025 Aura Asset Manager. Command-level wealth orchestration.</p>
              <p className="mt-2">
                <span className="text-amber-300">🔒 Encrypted</span> · 
                <span className="text-yellow-300"> Private</span> · 
                <span className="text-emerald-300"> Secure</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default LoginForm
