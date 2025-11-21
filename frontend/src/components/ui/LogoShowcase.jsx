/**
 * Logo Showcase Page
 * Display all three logo concepts for comparison
 */
import { CosmicConstellation } from './logos/CosmicConstellation'
import { WealthPrism } from './logos/WealthPrism'
import { OrbitalSystem } from './logos/OrbitalSystem'

export const LogoShowcase = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a1628] to-[#162447] p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent mb-4">
            Aura Asset Manager Logo Concepts
          </h1>
          <p className="text-xl text-slate-300">
            Three cosmic logo designs for your wealth command center
          </p>
        </div>

        {/* Logo Grid */}
        <div className="grid md:grid-cols-3 gap-12">
          {/* Concept 1: Cosmic Constellation */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-amber-300/20 hover:border-amber-300/40 transition-all duration-300">
            <div className="flex flex-col items-center space-y-6">
              {/* Large display */}
              <div className="bg-black/40 rounded-xl p-8 w-full flex items-center justify-center">
                <CosmicConstellation size={120} />
              </div>

              {/* Title */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-amber-300 mb-2">
                  Cosmic Constellation
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  Sacred geometry with 5 constellation points around central wealth orb
                </p>
              </div>

              {/* Size variations */}
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Large (64px)</span>
                  <CosmicConstellation size={64} />
                </div>
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Medium (48px)</span>
                  <CosmicConstellation size={48} />
                </div>
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Small (32px)</span>
                  <CosmicConstellation size={32} />
                </div>
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Favicon (24px)</span>
                  <CosmicConstellation size={24} />
                </div>
              </div>

              {/* Features */}
              <div className="w-full space-y-2 text-xs text-slate-300">
                <p>✨ Sacred geometry pattern</p>
                <p>🌟 Aurora glow connections</p>
                <p>💫 Central wealth orb</p>
                <p>⭐ 5 constellation points</p>
              </div>
            </div>
          </div>

          {/* Concept 2: Wealth Prism */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-cyan-300/20 hover:border-cyan-300/40 transition-all duration-300">
            <div className="flex flex-col items-center space-y-6">
              {/* Large display */}
              <div className="bg-black/40 rounded-xl p-8 w-full flex items-center justify-center">
                <WealthPrism size={120} />
              </div>

              {/* Title */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-cyan-300 mb-2">
                  Wealth Prism
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  Geometric crystal with light refraction for clarity and multi-dimensional wealth
                </p>
              </div>

              {/* Size variations */}
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Large (64px)</span>
                  <WealthPrism size={64} />
                </div>
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Medium (48px)</span>
                  <WealthPrism size={48} />
                </div>
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Small (32px)</span>
                  <WealthPrism size={32} />
                </div>
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Favicon (24px)</span>
                  <WealthPrism size={24} />
                </div>
              </div>

              {/* Features */}
              <div className="w-full space-y-2 text-xs text-slate-300">
                <p>💎 Geometric crystal facets</p>
                <p>🌈 Light refraction effect</p>
                <p>✨ Multi-color gradients</p>
                <p>🔮 Transparency symbolism</p>
              </div>
            </div>
          </div>

          {/* Concept 3: Orbital System */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-300/20 hover:border-purple-300/40 transition-all duration-300">
            <div className="flex flex-col items-center space-y-6">
              {/* Large display */}
              <div className="bg-black/40 rounded-xl p-8 w-full flex items-center justify-center">
                <OrbitalSystem size={120} />
              </div>

              {/* Title */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-purple-300 mb-2">
                  Orbital System
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  Planetary rings representing portfolio balance and asset orbits
                </p>
              </div>

              {/* Size variations */}
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Large (64px)</span>
                  <OrbitalSystem size={64} />
                </div>
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Medium (48px)</span>
                  <OrbitalSystem size={48} />
                </div>
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Small (32px)</span>
                  <OrbitalSystem size={32} />
                </div>
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Favicon (24px)</span>
                  <OrbitalSystem size={24} />
                </div>
              </div>

              {/* Features */}
              <div className="w-full space-y-2 text-xs text-slate-300">
                <p>🪐 3 orbital rings</p>
                <p>⚡ Asset satellites</p>
                <p>💫 Central wealth core</p>
                <p>🌀 Dynamic movement</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Section */}
        <div className="mt-16 bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Side-by-Side Comparison
          </h3>
          
          <div className="grid grid-cols-3 gap-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-gradient-to-br from-amber-500/10 to-transparent rounded-xl p-6">
                <CosmicConstellation size={96} />
              </div>
              <p className="text-sm text-amber-300 font-semibold">Cosmic Constellation</p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="bg-gradient-to-br from-cyan-500/10 to-transparent rounded-xl p-6">
                <WealthPrism size={96} />
              </div>
              <p className="text-sm text-cyan-300 font-semibold">Wealth Prism</p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl p-6">
                <OrbitalSystem size={96} />
              </div>
              <p className="text-sm text-purple-300 font-semibold">Orbital System</p>
            </div>
          </div>
        </div>

        {/* Mock-up Section */}
        <div className="mt-16 bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            In Context: Login Page Preview
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Cosmic Constellation Mock */}
            <div className="bg-black/60 rounded-lg p-6 border border-amber-300/20">
              <div className="flex items-center space-x-3 mb-4">
                <CosmicConstellation size={40} />
                <div>
                  <h4 className="text-lg font-bold bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">
                    Aura Asset Manager
                  </h4>
                  <p className="text-xs text-slate-400">Your Command Center For Wealth</p>
                </div>
              </div>
            </div>

            {/* Wealth Prism Mock */}
            <div className="bg-black/60 rounded-lg p-6 border border-cyan-300/20">
              <div className="flex items-center space-x-3 mb-4">
                <WealthPrism size={40} />
                <div>
                  <h4 className="text-lg font-bold bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">
                    Aura Asset Manager
                  </h4>
                  <p className="text-xs text-slate-400">Your Command Center For Wealth</p>
                </div>
              </div>
            </div>

            {/* Orbital System Mock */}
            <div className="bg-black/60 rounded-lg p-6 border border-purple-300/20">
              <div className="flex items-center space-x-3 mb-4">
                <OrbitalSystem size={40} />
                <div>
                  <h4 className="text-lg font-bold bg-gradient-to-r from-purple-300 to-pink-200 bg-clip-text text-transparent">
                    Aura Asset Manager
                  </h4>
                  <p className="text-xs text-slate-400">Your Command Center For Wealth</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
