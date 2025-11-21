/**
 * Logo Showcase Page
 * Display five Cosmic Constellation variations for comparison
 */
import { CosmicConstellation } from './logos/CosmicConstellation'
import { CosmicHexagon } from './logos/CosmicHexagon'
import { WealthMandala } from './logos/WealthMandala'
import { HexagonMandala } from './logos/HexagonMandala'
import { MinimalistMandala } from './logos/MinimalistMandala'

export const LogoShowcase = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a1628] to-[#162447] p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent mb-4">
            Cosmic Constellation Logo Variations
          </h1>
          <p className="text-xl text-slate-300">
            Five sacred geometry designs for Aura Asset Manager
          </p>
        </div>

        {/* Logo Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Variation 1: Original 5-Point */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-amber-300/20 hover:border-amber-300/40 transition-all duration-300">
            <div className="flex flex-col items-center space-y-6">
              {/* Large display */}
              <div className="bg-black/40 rounded-xl p-8 w-full flex items-center justify-center">
                <CosmicConstellation size={120} />
              </div>

              {/* Title */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-amber-300 mb-2">
                  Pentagon (5 Points)
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  Original design with 5 constellation points in pentagonal pattern
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
                <p>⭐ 5 constellation points</p>
                <p>🌟 Pentagonal symmetry</p>
                <p>💫 Aurora connections</p>
                <p>✨ Central wealth orb</p>
              </div>
            </div>
          </div>

          {/* Variation 2: Hexagonal 6-Point */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-cyan-300/20 hover:border-cyan-300/40 transition-all duration-300">
            <div className="flex flex-col items-center space-y-6">
              {/* Large display */}
              <div className="bg-black/40 rounded-xl p-8 w-full flex items-center justify-center">
                <CosmicHexagon size={120} />
              </div>

              {/* Title */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-cyan-300 mb-2">
                  Hexagon (6 Points)
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  Perfect symmetry with 6 points - vertical & horizontal balance
                </p>
              </div>

              {/* Size variations */}
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Large (64px)</span>
                  <CosmicHexagon size={64} />
                </div>
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Medium (48px)</span>
                  <CosmicHexagon size={48} />
                </div>
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Small (32px)</span>
                  <CosmicHexagon size={32} />
                </div>
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Favicon (24px)</span>
                  <CosmicHexagon size={24} />
                </div>
              </div>

              {/* Features */}
              <div className="w-full space-y-2 text-xs text-slate-300">
                <p>⬡ 6 constellation points</p>
                <p>⚖️ Perfect symmetry</p>
                <p>🔷 Hexagonal sacred geometry</p>
                <p>✨ No glow artifacts</p>
              </div>
            </div>
          </div>

          {/* Variation 3: Wealth Mandala 8-Point */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-300/20 hover:border-purple-300/40 transition-all duration-300">
            <div className="flex flex-col items-center space-y-6">
              {/* Large display */}
              <div className="bg-black/40 rounded-xl p-8 w-full flex items-center justify-center">
                <WealthMandala size={120} />
              </div>

              {/* Title */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-purple-300 mb-2">
                  Wealth Mandala (8+4 Points)
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  Dual-layer octagonal mandala representing 8 pillars of wealth
                </p>
              </div>

              {/* Size variations */}
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Large (64px)</span>
                  <WealthMandala size={64} />
                </div>
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Medium (48px)</span>
                  <WealthMandala size={48} />
                </div>
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Small (32px)</span>
                  <WealthMandala size={32} />
                </div>
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Favicon (24px)</span>
                  <WealthMandala size={24} />
                </div>
              </div>

              {/* Features */}
              <div className="w-full space-y-2 text-xs text-slate-300">
                <p>🌟 8 outer + 4 inner points</p>
                <p>🔮 Dual-layer mandala</p>
                <p>💎 Octagonal symmetry</p>
                <p>✨ Intricate sacred geometry</p>
              </div>
            </div>
          </div>

          {/* Variation 4: Hexagon Mandala 6+3 */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-emerald-300/20 hover:border-emerald-300/40 transition-all duration-300">
            <div className="flex flex-col items-center space-y-6">
              {/* Large display */}
              <div className="bg-black/40 rounded-xl p-8 w-full flex items-center justify-center">
                <HexagonMandala size={120} />
              </div>

              {/* Title */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-emerald-300 mb-2">
                  Hexagon Mandala (6+3 Points)
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  Killer combo - hexagonal balance with inner triangle mysticism
                </p>
              </div>

              {/* Size variations */}
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Large (64px)</span>
                  <HexagonMandala size={64} />
                </div>
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Medium (48px)</span>
                  <HexagonMandala size={48} />
                </div>
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Small (32px)</span>
                  <HexagonMandala size={32} />
                </div>
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Favicon (24px)</span>
                  <HexagonMandala size={24} />
                </div>
              </div>

              {/* Features */}
              <div className="w-full space-y-2 text-xs text-slate-300">
                <p>⬡ 6 outer + 3 inner points</p>
                <p>🔺 Triangle-hexagon fusion</p>
                <p>✨ Balanced mandala design</p>
                <p>💎 Best of both worlds</p>
              </div>
            </div>
          </div>

          {/* Variation 5: Minimalist Mandala 6+3 */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-rose-300/20 hover:border-rose-300/40 transition-all duration-300">
            <div className="flex flex-col items-center space-y-6">
              {/* Large display */}
              <div className="bg-black/40 rounded-xl p-8 w-full flex items-center justify-center">
                <MinimalistMandala size={120} />
              </div>

              {/* Title */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-rose-300 mb-2">
                  Minimalist (6+3 Points)
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  Clean, refined version - pure geometric elegance
                </p>
              </div>

              {/* Size variations */}
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Large (64px)</span>
                  <MinimalistMandala size={64} />
                </div>
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Medium (48px)</span>
                  <MinimalistMandala size={48} />
                </div>
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Small (32px)</span>
                  <MinimalistMandala size={32} />
                </div>
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <span className="text-xs text-slate-400">Favicon (24px)</span>
                  <MinimalistMandala size={24} />
                </div>
              </div>

              {/* Features */}
              <div className="w-full space-y-2 text-xs text-slate-300">
                <p>⬡ 6 outer + 3 inner points</p>
                <p>🎯 Zero glows or gradients</p>
                <p>✨ Clean sacred geometry</p>
                <p>💎 Negative space mastery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Section */}
        <div className="mt-16 bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Side-by-Side Comparison
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-gradient-to-br from-amber-500/10 to-transparent rounded-xl p-6">
                <CosmicConstellation size={96} />
              </div>
              <p className="text-sm text-amber-300 font-semibold">Pentagon (5)</p>
              <p className="text-xs text-slate-400 text-center">Original pentagonal design</p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="bg-gradient-to-br from-cyan-500/10 to-transparent rounded-xl p-6">
                <CosmicHexagon size={96} />
              </div>
              <p className="text-sm text-cyan-300 font-semibold">Hexagon (6)</p>
              <p className="text-xs text-slate-400 text-center">Perfect symmetry, balanced</p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl p-6">
                <WealthMandala size={96} />
              </div>
              <p className="text-sm text-purple-300 font-semibold">Mandala (8+4)</p>
              <p className="text-xs text-slate-400 text-center">Intricate, multi-layered</p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl p-6">
                <HexagonMandala size={96} />
              </div>
              <p className="text-sm text-emerald-300 font-semibold">Hex Mandala (6+3)</p>
              <p className="text-xs text-slate-400 text-center">Killer combo design</p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="bg-gradient-to-br from-rose-500/10 to-transparent rounded-xl p-6">
                <MinimalistMandala size={96} />
              </div>
              <p className="text-sm text-rose-300 font-semibold">Minimalist (6+3)</p>
              <p className="text-xs text-slate-400 text-center">Pure geometric elegance</p>
            </div>
          </div>
        </div>

        {/* Mock-up Section */}
        <div className="mt-16 bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            In Context: Login Page Preview
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Pentagon Mock */}
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

            {/* Hexagon Mock */}
            <div className="bg-black/60 rounded-lg p-6 border border-cyan-300/20">
              <div className="flex items-center space-x-3 mb-4">
                <CosmicHexagon size={40} />
                <div>
                  <h4 className="text-lg font-bold bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">
                    Aura Asset Manager
                  </h4>
                  <p className="text-xs text-slate-400">Your Command Center For Wealth</p>
                </div>
              </div>
            </div>

            {/* Mandala Mock */}
            <div className="bg-black/60 rounded-lg p-6 border border-purple-300/20">
              <div className="flex items-center space-x-3 mb-4">
                <WealthMandala size={40} />
                <div>
                  <h4 className="text-lg font-bold bg-gradient-to-r from-purple-300 to-pink-200 bg-clip-text text-transparent">
                    Aura Asset Manager
                  </h4>
                  <p className="text-xs text-slate-400">Your Command Center For Wealth</p>
                </div>
              </div>
            </div>

            {/* Hexagon Mandala Mock */}
            <div className="bg-black/60 rounded-lg p-6 border border-emerald-300/20">
              <div className="flex items-center space-x-3 mb-4">
                <HexagonMandala size={40} />
                <div>
                  <h4 className="text-lg font-bold bg-gradient-to-r from-emerald-300 to-cyan-200 bg-clip-text text-transparent">
                    Aura Asset Manager
                  </h4>
                  <p className="text-xs text-slate-400">Your Command Center For Wealth</p>
                </div>
              </div>
            </div>

            {/* Minimalist Mock */}
            <div className="bg-black/60 rounded-lg p-6 border border-rose-300/20">
              <div className="flex items-center space-x-3 mb-4">
                <MinimalistMandala size={40} />
                <div>
                  <h4 className="text-lg font-bold bg-gradient-to-r from-rose-300 to-orange-200 bg-clip-text text-transparent">
                    Aura Asset Manager
                  </h4>
                  <p className="text-xs text-slate-400">Your Command Center For Wealth</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Notes */}
        <div className="mt-16 bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
          <h3 className="text-2xl font-bold text-white mb-4 text-center">
            ✨ Technical Improvements
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-300">
            <div>
              <h4 className="font-semibold text-amber-300 mb-2">🔧 Issues Fixed:</h4>
              <ul className="space-y-1 pl-4">
                <li>✅ Removed square glow artifacts around constellation points</li>
                <li>✅ Points now perfectly centered on circumferential line</li>
                <li>✅ Clean circular gradients (no box shadows)</li>
                <li>✅ Mathematically precise positioning using trigonometry</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-cyan-300 mb-2">🎨 Design Features:</h4>
              <ul className="space-y-1 pl-4">
                <li>🌟 Sacred geometry patterns (pentagon, hexagon, octagon)</li>
                <li>💫 Aurora glow connections between points</li>
                <li>✨ Radial gradients for smooth, cosmic aesthetic</li>
                <li>🎯 Fully scalable from 24px to 120px+</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
