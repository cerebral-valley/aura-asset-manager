/**
 * Logo Showcase Page
 * Display five Cosmic Constellation variations for comparison
 * Fully responsive with light/dark mode support
 */
import { CosmicConstellation } from './logos/CosmicConstellation'
import { CosmicHexagon } from './logos/CosmicHexagon'
import { WealthMandala } from './logos/WealthMandala'
import { HexagonMandala } from './logos/HexagonMandala'
import { MinimalistMandala } from './logos/MinimalistMandala'

export const LogoShowcase = () => {
  const logos = [
    {
      component: CosmicConstellation,
      name: 'Pentagon',
      subtitle: '5 Points',
      description: 'Original design with 5 constellation points in pentagonal pattern',
      color: 'amber',
      features: [
        '⭐ 5 constellation points',
        '🌟 Pentagonal symmetry',
        '💫 Aurora connections',
        '✨ Central wealth orb'
      ]
    },
    {
      component: CosmicHexagon,
      name: 'Hexagon',
      subtitle: '6 Points',
      description: 'Perfect symmetry with 6 points - vertical & horizontal balance',
      color: 'cyan',
      features: [
        '⬡ 6 constellation points',
        '⚖️ Perfect symmetry',
        '🔷 Hexagonal sacred geometry',
        '✨ No glow artifacts'
      ]
    },
    {
      component: WealthMandala,
      name: 'Wealth Mandala',
      subtitle: '8+4 Points',
      description: 'Dual-layer octagonal mandala representing 8 pillars of wealth',
      color: 'purple',
      features: [
        '🌟 8 outer + 4 inner points',
        '🔮 Dual-layer mandala',
        '💎 Octagonal symmetry',
        '✨ Intricate sacred geometry'
      ]
    },
    {
      component: HexagonMandala,
      name: 'Hexagon Mandala',
      subtitle: '6+3 Points',
      description: 'Killer combo - hexagonal balance with inner triangle mysticism',
      color: 'emerald',
      features: [
        '⬡ 6 outer + 3 inner points',
        '🔺 Triangle-hexagon fusion',
        '✨ Balanced mandala design',
        '💎 Best of both worlds'
      ]
    },
    {
      component: MinimalistMandala,
      name: 'Minimalist',
      subtitle: '6+3 Points',
      description: 'Clean, refined version - pure geometric elegance',
      color: 'rose',
      features: [
        '⬡ 6 outer + 3 inner points',
        '🎯 Zero glows or gradients',
        '✨ Clean sacred geometry',
        '💎 Negative space mastery'
      ]
    }
  ]

  const colorClasses = {
    amber: {
      border: 'border-amber-400/40 dark:border-amber-300/20 hover:border-amber-500/60 dark:hover:border-amber-300/40',
      title: 'text-amber-600 dark:text-amber-300',
      gradient: 'from-amber-500/20 dark:from-amber-500/10'
    },
    cyan: {
      border: 'border-cyan-400/40 dark:border-cyan-300/20 hover:border-cyan-500/60 dark:hover:border-cyan-300/40',
      title: 'text-cyan-600 dark:text-cyan-300',
      gradient: 'from-cyan-500/20 dark:from-cyan-500/10'
    },
    purple: {
      border: 'border-purple-400/40 dark:border-purple-300/20 hover:border-purple-500/60 dark:hover:border-purple-300/40',
      title: 'text-purple-600 dark:text-purple-300',
      gradient: 'from-purple-500/20 dark:from-purple-500/10'
    },
    emerald: {
      border: 'border-emerald-400/40 dark:border-emerald-300/20 hover:border-emerald-500/60 dark:hover:border-emerald-300/40',
      title: 'text-emerald-600 dark:text-emerald-300',
      gradient: 'from-emerald-500/20 dark:from-emerald-500/10'
    },
    rose: {
      border: 'border-rose-400/40 dark:border-rose-300/20 hover:border-rose-500/60 dark:hover:border-rose-300/40',
      title: 'text-rose-600 dark:text-rose-300',
      gradient: 'from-rose-500/20 dark:from-rose-500/10'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-black dark:via-[#0a1628] dark:to-[#162447] p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 dark:from-amber-300 dark:via-yellow-200 dark:to-amber-400 bg-clip-text text-transparent mb-4">
            Cosmic Constellation Logo Variations
          </h1>
          <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300">
            Five sacred geometry designs for Aura Asset Manager
          </p>
        </div>

        {/* Logo Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          {logos.map((logo, index) => {
            const Logo = logo.component
            const colors = colorClasses[logo.color]
            
            return (
              <div 
                key={index}
                className={`bg-white/90 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 md:p-8 border ${colors.border} transition-all duration-300 shadow-lg dark:shadow-none`}
              >
                <div className="flex flex-col items-center space-y-4 md:space-y-6">
                  {/* Large display */}
                  <div className="bg-slate-100 dark:bg-black/40 rounded-xl p-6 md:p-8 w-full flex items-center justify-center">
                    <Logo size={120} />
                  </div>

                  {/* Title */}
                  <div className="text-center">
                    <h2 className={`text-xl md:text-2xl font-bold ${colors.title} mb-2`}>
                      {logo.name} ({logo.subtitle})
                    </h2>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {logo.description}
                    </p>
                  </div>

                  {/* Size variations */}
                  <div className="space-y-3 md:space-y-4 w-full">
                    {[
                      { label: 'Large (64px)', size: 64 },
                      { label: 'Medium (48px)', size: 48 },
                      { label: 'Small (32px)', size: 32 },
                      { label: 'Favicon (24px)', size: 24 }
                    ].map((variant, i) => (
                      <div 
                        key={i}
                        className="flex items-center justify-between bg-slate-200/50 dark:bg-black/30 rounded-lg p-3 md:p-4"
                      >
                        <span className="text-xs text-slate-600 dark:text-slate-400">{variant.label}</span>
                        <Logo size={variant.size} />
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="w-full space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {logo.features.map((feature, i) => (
                      <p key={i}>{feature}</p>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Comparison Section */}
        <div className="mt-12 md:mt-16 bg-white/90 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-slate-300 dark:border-slate-700 shadow-lg dark:shadow-none">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            Side-by-Side Comparison
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
            {logos.map((logo, index) => {
              const Logo = logo.component
              const colors = colorClasses[logo.color]
              
              return (
                <div key={index} className="flex flex-col items-center space-y-4">
                  <div className={`bg-gradient-to-br ${colors.gradient} to-transparent rounded-xl p-4 md:p-6`}>
                    <Logo size={96} />
                  </div>
                  <p className={`text-sm font-semibold ${colors.title}`}>{logo.name} ({logo.subtitle.split(' ')[0]})</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 text-center">{logo.description.split(' - ')[0]}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mock-up Section */}
        <div className="mt-12 md:mt-16 bg-white/90 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-slate-300 dark:border-slate-700 shadow-lg dark:shadow-none">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            In Context: Login Page Preview
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {logos.map((logo, index) => {
              const Logo = logo.component
              const colors = colorClasses[logo.color]
              
              return (
                <div 
                  key={index}
                  className={`bg-slate-100 dark:bg-black/60 rounded-lg p-4 md:p-6 border ${colors.border}`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Logo size={40} />
                    <div>
                      <h4 className={`text-base md:text-lg font-bold bg-gradient-to-r ${logo.color === 'amber' ? 'from-amber-600 to-yellow-500 dark:from-amber-300 dark:to-yellow-200' : logo.color === 'cyan' ? 'from-cyan-600 to-blue-500 dark:from-cyan-300 dark:to-blue-200' : logo.color === 'purple' ? 'from-purple-600 to-pink-500 dark:from-purple-300 dark:to-pink-200' : logo.color === 'emerald' ? 'from-emerald-600 to-cyan-500 dark:from-emerald-300 dark:to-cyan-200' : 'from-rose-600 to-orange-500 dark:from-rose-300 dark:to-orange-200'} bg-clip-text text-transparent`}>
                        Aura Asset Manager
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Your Command Center For Wealth</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Technical Notes */}
        <div className="mt-12 md:mt-16 bg-white/90 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-slate-300 dark:border-slate-700 shadow-lg dark:shadow-none">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 text-center">
            ✨ Technical Improvements
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-700 dark:text-slate-300">
            <div>
              <h4 className="font-semibold text-amber-600 dark:text-amber-300 mb-2">🔧 Issues Fixed:</h4>
              <ul className="space-y-1 pl-4">
                <li>✅ Removed square glow artifacts around constellation points</li>
                <li>✅ Points now perfectly centered on circumferential line</li>
                <li>✅ Clean circular gradients (no box shadows)</li>
                <li>✅ Mathematically precise positioning using trigonometry</li>
                <li>✅ Enhanced visibility of connection lines when zoomed out</li>
                <li>✅ Full light/dark mode support across entire page</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-cyan-600 dark:text-cyan-300 mb-2">🎨 Design Features:</h4>
              <ul className="space-y-1 pl-4">
                <li>🌟 Sacred geometry patterns (pentagon, hexagon, octagon)</li>
                <li>💫 Aurora glow connections between points</li>
                <li>✨ Radial gradients for smooth, cosmic aesthetic</li>
                <li>🎯 Fully scalable from 24px to 120px+</li>
                <li>🌓 Adaptive color schemes for light and dark modes</li>
                <li>📱 Responsive design for mobile and desktop</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
