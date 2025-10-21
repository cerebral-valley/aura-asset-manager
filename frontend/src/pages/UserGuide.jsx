import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import MagicCard from '../components/magicui/MagicCard';
import NumberTicker from '../components/magicui/NumberTicker';
import BlurFade from '../components/magicui/BlurFade';

const UserGuide = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
    { id: 'dashboard', title: 'Dashboard', icon: '📊' },
    { id: 'assets', title: 'Managing Assets', icon: '💎' },
    { id: 'asset-types', title: 'Asset Types Guide', icon: '📚' },
    { id: 'goals', title: 'Financial Goals', icon: '🎯' },
    { id: 'exports', title: 'Export & Analysis', icon: '📄' },
    { id: 'insurance', title: 'Insurance', icon: '🛡️' },
    { id: 'insurance-types', title: 'Insurance Types Guide', icon: '🔍' },
    { id: 'tools', title: 'Tools & Features', icon: '🛠️' },
    { id: 'ai-analysis', title: 'AI Analysis', icon: '🤖' },
    { id: 'tips', title: 'Tips & Best Practices', icon: '💡' },
    { id: 'release-notes', title: 'Release Notes', icon: '📋' }
  ];

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-neutral-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className={`fixed left-0 top-0 h-full w-64 ${isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-gray-200'} border-r overflow-y-auto z-50`}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Aura Guide</h1>
                <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>User Manual</p>
              </div>
            </div>
            
            {/* Back to Dashboard Button */}
            <button
              onClick={() => navigate('/')}
              className={`w-full mb-6 px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                isDark
                  ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg">←</span>
              <span className="font-medium">Back to Dashboard</span>
            </button>
            
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                    activeSection === section.id
                      ? isDark 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 text-blue-700'
                      : isDark
                        ? 'text-neutral-300 hover:bg-neutral-800'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span className="font-medium">{section.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1">
          <div className="max-w-4xl mx-auto p-8">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Aura Asset Manager
              </h1>
              <p className={`text-xl ${isDark ? 'text-neutral-300' : 'text-gray-600'}`}>
                Complete User Guide & Documentation
              </p>
            </div>

            {/* Getting Started Section */}
            <section id="getting-started" className="mb-16">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                Getting Started with Aura
              </h2>
              
              <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 mb-8 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4">Understanding Aura's Philosophy</h3>
                <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-4`}>
                  Aura is fundamentally different from traditional financial management applications. Rather than focusing on complex metrics or day-to-day expense tracking, Aura is designed to help you visualize your financial standing and feel secure about the assets you've accumulated over time.
                </p>
                <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                  The application serves as your personal financial sanctuary—a place where you can reflect on your achievements and feel proud of the foundation you're building for yourself and your loved ones.
                </p>
              </div>

              <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4">Core Principles</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-blue-600' : 'bg-blue-100'} flex items-center justify-center flex-shrink-0`}>
                      <span className={isDark ? 'text-white' : 'text-blue-600'}>1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Every Asset Tells a Story</h4>
                      <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                        Every asset you own represents an accomplishment in your life journey, from your first home to a growing stock portfolio.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-blue-600' : 'bg-blue-100'} flex items-center justify-center flex-shrink-0`}>
                      <span className={isDark ? 'text-white' : 'text-blue-600'}>2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Insurance as Protection</h4>
                      <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                        Insurance isn't just an expense—it's a protective shield that guards your assets and provides peace of mind.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-blue-600' : 'bg-blue-100'} flex items-center justify-center flex-shrink-0`}>
                      <span className={isDark ? 'text-white' : 'text-blue-600'}>3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Personal Financial Journey</h4>
                      <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                        Your financial journey is personal and unique. Aura adapts its language to match your aspirations and comfort level.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Dashboard Section */}
            <section id="dashboard" className="mb-16">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="text-2xl">📊</span>
                Navigating the Dashboard
              </h2>
              
              <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 mb-8 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4">Core Metrics</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-neutral-800' : 'bg-gray-50'}`}>
                    <h4 className="font-semibold mb-2 text-green-600">💰 Net Worth</h4>
                    <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                      Combined current value of all your assets, presented in a calm, reassuring manner.
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-neutral-800' : 'bg-gray-50'}`}>
                    <h4 className="font-semibold mb-2 text-blue-600">🛡️ Insurance Coverage</h4>
                    <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                      Total protection value of all insurance policies in your safety net.
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-neutral-800' : 'bg-gray-50'}`}>
                    <h4 className="font-semibold mb-2 text-purple-600">📈 Growth Potential</h4>
                    <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                      Progress indicator showing your journey toward financial milestones.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Assets Section */}
            <section id="assets" className="mb-16">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="text-2xl">💎</span>
                Managing Your Assets
              </h2>
              
              <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 mb-8 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4">Comprehensive Asset Management</h3>
                <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-6`}>
                  The Assets section serves as your comprehensive inventory of everything you own. This is where you can view, add, edit, and organize all your holdings, from real estate and investments to precious metals and cash reserves. Think of it as your financial museum—a place where each asset tells the story of your journey and accomplishments.
                </p>
              </div>

              {/* Asset Categories */}
              <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 mb-8 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4">Asset Categories & Types</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-blue-600' : 'bg-blue-100'} flex items-center justify-center flex-shrink-0 mt-1`}>
                        <span className="text-lg">🏠</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Real Estate Assets</h4>
                        <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                          Residential, Commercial, Agricultural, Industrial properties and raw land
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-green-600' : 'bg-green-100'} flex items-center justify-center flex-shrink-0 mt-1`}>
                        <span className="text-lg">📈</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Investment Assets</h4>
                        <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                          Stocks, Bonds, Mutual Funds, ETFs, Cryptocurrency, Retirement Accounts
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-yellow-600' : 'bg-yellow-100'} flex items-center justify-center flex-shrink-0 mt-1`}>
                        <span className="text-lg">🥇</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Precious Metals & Tangibles</h4>
                        <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                          Gold, Silver, Platinum, Jewelry, Collectibles, Vehicles
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-cyan-600' : 'bg-cyan-100'} flex items-center justify-center flex-shrink-0 mt-1`}>
                        <span className="text-lg">💰</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Cash & Equivalents</h4>
                        <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                          Bank Accounts, Certificates of Deposit, Money Market, Cash Holdings
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-purple-600' : 'bg-purple-100'} flex items-center justify-center flex-shrink-0 mt-1`}>
                        <span className="text-lg">🏢</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Business & Professional</h4>
                        <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                          Business Ownership, Equipment, Intellectual Property, Royalty Streams
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategic Classification */}
              <div className={`${isDark ? 'bg-gradient-to-br from-blue-900 to-blue-800' : 'bg-gradient-to-br from-blue-50 to-blue-100'} rounded-xl p-6 mb-8 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Strategic Asset Classification
                </h3>
                <p className={`${isDark ? 'text-blue-100' : 'text-blue-800'} mb-6`}>
                  Aura's advanced classification system helps you understand the strategic role each asset plays in your portfolio and aligns your holdings with your financial goals.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className={`${isDark ? 'bg-blue-800/50' : 'bg-white/70'} rounded-lg p-4`}>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="text-lg">💡</span>
                      Asset Purpose
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span>Hyper Growth - Maximum appreciation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span>Growth - Long-term appreciation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span>Financial Security - Stability focus</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        <span>Emergency Fund - Liquidity priority</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        <span>Children's Education - Future needs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        <span>Retirement Fund - Long-term security</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                        <span>Speculation - High risk/reward</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`${isDark ? 'bg-blue-800/50' : 'bg-white/70'} rounded-lg p-4`}>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="text-lg">⏰</span>
                      Time Horizon
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="font-medium">Short Term (&lt; 1 year)</div>
                        <div className={`${isDark ? 'text-blue-200' : 'text-blue-700'}`}>Near-term goals and liquidity needs</div>
                      </div>
                      <div>
                        <div className="font-medium">Medium Term (1-3 years)</div>
                        <div className={`${isDark ? 'text-blue-200' : 'text-blue-700'}`}>Medium-range objectives and purchases</div>
                      </div>
                      <div>
                        <div className="font-medium">Long Term (&gt; 3 years)</div>
                        <div className={`${isDark ? 'text-blue-200' : 'text-blue-700'}`}>Retirement and generational wealth</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`${isDark ? 'bg-blue-800/50' : 'bg-white/70'} rounded-lg p-4`}>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="text-lg">💧</span>
                      Liquidity Status
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="font-medium text-green-600">Liquid Assets</div>
                        <div className={`${isDark ? 'text-blue-200' : 'text-blue-700'}`}>Can be converted to cash within days</div>
                      </div>
                      <div>
                        <div className="font-medium text-orange-600">Illiquid Assets</div>
                        <div className={`${isDark ? 'text-blue-200' : 'text-blue-700'}`}>Take months or years to convert</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Features */}
              <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 mb-8 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4">Interactive Charts & Analysis</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${isDark ? 'bg-blue-600' : 'bg-blue-100'} flex items-center justify-center`}>
                      <span className="text-xl">📈</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Asset Value Over Time</h4>
                      <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                        Line chart showing acquisition value vs current portfolio value with optional projections
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${isDark ? 'bg-green-600' : 'bg-green-100'} flex items-center justify-center`}>
                      <span className="text-xl">🥧</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Strategic Distribution</h4>
                      <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                        Pie chart displaying wealth allocation by Asset Purpose, Time Horizon, and Liquidity
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${isDark ? 'bg-purple-600' : 'bg-purple-100'} flex items-center justify-center`}>
                      <span className="text-xl">�</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Portfolio Analytics</h4>
                      <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                        Advanced filtering by strategic parameters and comprehensive performance tracking
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Types */}
              <div className={`${isDark ? 'bg-gradient-to-br from-green-900 to-green-800' : 'bg-gradient-to-br from-green-50 to-green-100'} rounded-xl p-6 mb-8 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🔄</span>
                  Advanced Transaction Management
                </h3>
                <p className={`${isDark ? 'text-green-100' : 'text-green-800'} mb-6`}>
                  Aura supports comprehensive transaction types to handle every aspect of asset ownership and management throughout the entire lifecycle.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className={`${isDark ? 'bg-green-800/50' : 'bg-white/70'} rounded-lg p-3`}>
                      <h4 className="font-semibold text-sm mb-1">Create Asset</h4>
                      <p className="text-xs">Add new assets with full strategic classification</p>
                    </div>
                    <div className={`${isDark ? 'bg-green-800/50' : 'bg-white/70'} rounded-lg p-3`}>
                      <h4 className="font-semibold text-sm mb-1">Update Market Value</h4>
                      <p className="text-xs">Keep asset valuations current with market changes</p>
                    </div>
                    <div className={`${isDark ? 'bg-green-800/50' : 'bg-white/70'} rounded-lg p-3`}>
                      <h4 className="font-semibold text-sm mb-1">Update Asset Purpose</h4>
                      <p className="text-xs">Modify strategic classification as goals evolve</p>
                    </div>
                    <div className={`${isDark ? 'bg-green-800/50' : 'bg-white/70'} rounded-lg p-3`}>
                      <h4 className="font-semibold text-sm mb-1">Update Time Horizon</h4>
                      <p className="text-xs">Adjust investment timeline as circumstances change</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className={`${isDark ? 'bg-green-800/50' : 'bg-white/70'} rounded-lg p-3`}>
                      <h4 className="font-semibold text-sm mb-1">Mark as Sold</h4>
                      <p className="text-xs">Record asset dispositions and calculate returns</p>
                    </div>
                    <div className={`${isDark ? 'bg-green-800/50' : 'bg-white/70'} rounded-lg p-3`}>
                      <h4 className="font-semibold text-sm mb-1">Update Acquisition Value</h4>
                      <p className="text-xs">Correct historical purchase information</p>
                    </div>
                    <div className={`${isDark ? 'bg-green-800/50' : 'bg-white/70'} rounded-lg p-3`}>
                      <h4 className="font-semibold text-sm mb-1">Update Liquid Status</h4>
                      <p className="text-xs">Adjust liquidity classification for better planning</p>
                    </div>
                    <div className={`${isDark ? 'bg-green-800/50' : 'bg-white/70'} rounded-lg p-3`}>
                      <h4 className="font-semibold text-sm mb-1">Update Name & Type</h4>
                      <p className="text-xs">Modify asset identification and categorization</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Best Practices */}
              <div className={`${isDark ? 'bg-gradient-to-br from-purple-900 to-purple-800' : 'bg-gradient-to-br from-purple-50 to-purple-100'} rounded-xl p-6 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  Best Practices for Asset Management
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Strategic Portfolio Construction</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Balance Asset Purposes across your investment goals</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Maintain appropriate Time Horizon distribution</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Keep adequate Liquid Assets for emergencies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Diversify across asset categories and types</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Regular Maintenance</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">📅</span>
                        <span>Monthly: Update liquid asset values</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">📅</span>
                        <span>Quarterly: Review real estate valuations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">📅</span>
                        <span>Semi-annually: Strategic classification review</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">📅</span>
                        <span>Annually: Full portfolio strategic assessment</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Asset Types Guide Section */}
            <section id="asset-types" className="mb-16">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="text-2xl">📚</span>
                Comprehensive Asset Types Guide
              </h2>
              
              <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 mb-8 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4">Understanding Asset Classifications</h3>
                <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-4`}>
                  Aura supports a comprehensive range of asset types, each with specific characteristics regarding risk, liquidity, and investment time horizon. This guide helps you understand how to classify and manage different types of investments effectively.
                </p>
              </div>

              {/* Real Estate Assets */}
              <BlurFade delay={0.1}>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-blue-600">🏠</span>
                    Real Estate Assets
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <span className="text-blue-500">🏘️</span>
                        Residential Property
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold">Risk Nature:</span>
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded">Medium</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Liquidity:</span>
                          <span className="px-2 py-1 bg-red-500/20 text-red-600 rounded">Low</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Time Horizon:</span>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-600 rounded">Long Term (5+ years)</span>
                        </div>
                        <p className={`mt-3 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                          Single-family homes, apartments, condos. Provides stable returns through rental income and appreciation. Requires significant capital and ongoing maintenance.
                        </p>
                      </div>
                    </MagicCard>

                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <span className="text-blue-500">🏢</span>
                        Commercial Property
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold">Risk Nature:</span>
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-600 rounded">Medium-High</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Liquidity:</span>
                          <span className="px-2 py-1 bg-red-500/20 text-red-600 rounded">Very Low</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Time Horizon:</span>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-600 rounded">Long Term (7+ years)</span>
                        </div>
                        <p className={`mt-3 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                          Office buildings, retail spaces, warehouses. Higher returns but market-dependent. Requires professional management and larger capital investment.
                        </p>
                      </div>
                    </MagicCard>

                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <span className="text-green-500">🌾</span>
                        Agricultural Land
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold">Risk Nature:</span>
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded">Medium</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Liquidity:</span>
                          <span className="px-2 py-1 bg-red-500/20 text-red-600 rounded">Low</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Time Horizon:</span>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-600 rounded">Long Term (10+ years)</span>
                        </div>
                        <p className={`mt-3 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                          Farmland and agricultural property. Provides income through crops/leasing. Influenced by commodity prices and weather patterns.
                        </p>
                      </div>
                    </MagicCard>

                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <span className="text-gray-500">🏭</span>
                        Industrial Property
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold">Risk Nature:</span>
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-600 rounded">Medium-High</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Liquidity:</span>
                          <span className="px-2 py-1 bg-red-500/20 text-red-600 rounded">Very Low</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Time Horizon:</span>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-600 rounded">Long Term (7+ years)</span>
                        </div>
                        <p className={`mt-3 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                          Manufacturing facilities, distribution centers. Requires specialized knowledge. Tied to industrial economic cycles.
                        </p>
                      </div>
                    </MagicCard>
                  </div>
                </div>
              </BlurFade>

              {/* Financial Instruments */}
              <BlurFade delay={0.2}>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-green-600">💹</span>
                    Financial Instruments
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3">📈 Stocks</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold">Risk:</span>
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-600 rounded">High</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Liquidity:</span>
                          <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded">High</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Horizon:</span>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-600 rounded">Medium-Long</span>
                        </div>
                        <p className={`mt-3 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                          Ownership shares in companies. High growth potential with market volatility.
                        </p>
                      </div>
                    </MagicCard>

                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3">📊 Bonds</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold">Risk:</span>
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded">Low-Medium</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Liquidity:</span>
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded">Medium</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Horizon:</span>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-600 rounded">Medium</span>
                        </div>
                        <p className={`mt-3 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                          Fixed-income securities. Predictable returns, lower than stocks but more stable.
                        </p>
                      </div>
                    </MagicCard>

                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3">🌐 Cryptocurrency</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold">Risk:</span>
                          <span className="px-2 py-1 bg-red-500/20 text-red-600 rounded">Very High</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Liquidity:</span>
                          <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded">High</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Horizon:</span>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-600 rounded">Short-Long</span>
                        </div>
                        <p className={`mt-3 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                          Digital assets. Extreme volatility, 24/7 trading. Speculative investment.
                        </p>
                      </div>
                    </MagicCard>

                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3">💼 Mutual Funds</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold">Risk:</span>
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded">Medium</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Liquidity:</span>
                          <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded">High</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Horizon:</span>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-600 rounded">Medium-Long</span>
                        </div>
                        <p className={`mt-3 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                          Professionally managed diversified portfolios. Built-in diversification.
                        </p>
                      </div>
                    </MagicCard>

                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3">📉 ETFs</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold">Risk:</span>
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded">Medium</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Liquidity:</span>
                          <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded">Very High</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Horizon:</span>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-600 rounded">All Horizons</span>
                        </div>
                        <p className={`mt-3 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                          Exchange-traded funds. Lower fees than mutual funds, trades like stock.
                        </p>
                      </div>
                    </MagicCard>

                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3">🏦 Fixed Deposits</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold">Risk:</span>
                          <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded">Very Low</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Liquidity:</span>
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded">Medium</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Horizon:</span>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-600 rounded">Short-Medium</span>
                        </div>
                        <p className={`mt-3 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                          Guaranteed returns. Principal protected, predictable interest income.
                        </p>
                      </div>
                    </MagicCard>

                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3">🏦 Bank Accounts</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold">Risk:</span>
                          <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded">Minimal</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Liquidity:</span>
                          <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded">Very High</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Horizon:</span>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-600 rounded">Short</span>
                        </div>
                        <p className={`mt-3 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                          Checking and savings accounts. Instant access, FDIC/DICGC insured.
                        </p>
                      </div>
                    </MagicCard>

                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3">💵 Cash</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold">Risk:</span>
                          <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded">None</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Liquidity:</span>
                          <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded">Perfect</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Horizon:</span>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-600 rounded">Immediate</span>
                        </div>
                        <p className={`mt-3 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                          Physical currency. Immediate access but loses value to inflation.
                        </p>
                      </div>
                    </MagicCard>

                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3">👔 Private Equity</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold">Risk:</span>
                          <span className="px-2 py-1 bg-red-500/20 text-red-600 rounded">Very High</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Liquidity:</span>
                          <span className="px-2 py-1 bg-red-500/20 text-red-600 rounded">Very Low</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Horizon:</span>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-600 rounded">Very Long (10+ years)</span>
                        </div>
                        <p className={`mt-3 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                          Direct investment in private companies. High minimum, long lockup periods.
                        </p>
                      </div>
                    </MagicCard>
                  </div>
                </div>
              </BlurFade>

              {/* Physical Assets */}
              <BlurFade delay={0.3}>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-yellow-600">✨</span>
                    Physical Assets & Collectibles
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3">🥇 Gold</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold">Risk:</span>
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded">Medium</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Liquidity:</span>
                          <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded">High</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Horizon:</span>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-600 rounded">Long</span>
                        </div>
                        <p className={`mt-3 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                          Traditional hedge against inflation. Physical or digital gold. No income generation.
                        </p>
                      </div>
                    </MagicCard>

                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3">💎 Jewellery</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold">Risk:</span>
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded">Medium</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Liquidity:</span>
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded">Medium</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Horizon:</span>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-600 rounded">Long</span>
                        </div>
                        <p className={`mt-3 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                          Cultural and financial value. Making charges reduce resale value. Storage costs.
                        </p>
                      </div>
                    </MagicCard>

                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3">🚗 Vehicles</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold">Risk:</span>
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-600 rounded">Medium-High</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Liquidity:</span>
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded">Medium</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Horizon:</span>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-600 rounded">Short-Medium</span>
                        </div>
                        <p className={`mt-3 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                          Depreciating assets unless collectible. Maintenance costs, insurance required.
                        </p>
                      </div>
                    </MagicCard>
                  </div>
                </div>
              </BlurFade>

              {/* Quick Reference Table */}
              <div className={`${isDark ? 'bg-gradient-to-br from-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'} rounded-xl p-6 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4">Quick Reference: Asset Characteristics</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={isDark ? 'bg-neutral-800' : 'bg-white/70'}>
                      <tr>
                        <th className="text-left p-3">Category</th>
                        <th className="text-left p-3">Typical Risk</th>
                        <th className="text-left p-3">Liquidity</th>
                        <th className="text-left p-3">Best Time Horizon</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={isDark ? 'border-t border-neutral-700' : 'border-t border-gray-200'}>
                        <td className="p-3 font-semibold">Real Estate</td>
                        <td className="p-3">Medium to High</td>
                        <td className="p-3">Low to Very Low</td>
                        <td className="p-3">5-10+ years</td>
                      </tr>
                      <tr className={isDark ? 'border-t border-neutral-700' : 'border-t border-gray-200'}>
                        <td className="p-3 font-semibold">Stocks & Equity</td>
                        <td className="p-3">High</td>
                        <td className="p-3">High</td>
                        <td className="p-3">3-7+ years</td>
                      </tr>
                      <tr className={isDark ? 'border-t border-neutral-700' : 'border-t border-gray-200'}>
                        <td className="p-3 font-semibold">Bonds & Fixed Income</td>
                        <td className="p-3">Low to Medium</td>
                        <td className="p-3">Medium to High</td>
                        <td className="p-3">1-5 years</td>
                      </tr>
                      <tr className={isDark ? 'border-t border-neutral-700' : 'border-t border-gray-200'}>
                        <td className="p-3 font-semibold">Cryptocurrency</td>
                        <td className="p-3">Very High</td>
                        <td className="p-3">Very High</td>
                        <td className="p-3">Speculative (any)</td>
                      </tr>
                      <tr className={isDark ? 'border-t border-neutral-700' : 'border-t border-gray-200'}>
                        <td className="p-3 font-semibold">Cash & Equivalents</td>
                        <td className="p-3">Minimal</td>
                        <td className="p-3">Perfect</td>
                        <td className="p-3">Immediate to 1 year</td>
                      </tr>
                      <tr className={isDark ? 'border-t border-neutral-700' : 'border-t border-gray-200'}>
                        <td className="p-3 font-semibold">Physical Assets (Gold, etc.)</td>
                        <td className="p-3">Medium</td>
                        <td className="p-3">Medium to High</td>
                        <td className="p-3">3+ years</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Goals Section */}
            <section id="goals" className="mb-16">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                Financial Goals Management
              </h2>
              
              <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 mb-8 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4">Overview</h3>
                <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-4`}>
                  The Goals page helps you track financial objectives and allocate your selected assets towards achieving them. It's designed to provide clarity on your progress and help you visualize how your current holdings contribute to your financial aspirations.
                </p>
                <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                  Goals work with your selected assets - those marked as "selected" on the Assets page are automatically included in your goal calculations, giving you real-time progress tracking.
                </p>
              </div>

              {/* Key Features */}
              <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 mb-8 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4">Key Features</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-blue-600' : 'bg-blue-100'} flex items-center justify-center flex-shrink-0 mt-1`}>
                        <span className="text-lg">🎯</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Net Worth Goals</h4>
                        <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                          Set and track your overall net worth target with visual progress indicators and timeline projections.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-green-600' : 'bg-green-100'} flex items-center justify-center flex-shrink-0 mt-1`}>
                        <span className="text-lg">📊</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Custom Goals</h4>
                        <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                          Create specific goals like vacation funds, emergency funds, or major purchases with allocation tracking.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-purple-600' : 'bg-purple-100'} flex items-center justify-center flex-shrink-0 mt-1`}>
                        <span className="text-lg">💰</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Asset Allocation</h4>
                        <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                          View which assets are selected for goal allocation and their contribution percentages.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-orange-600' : 'bg-orange-100'} flex items-center justify-center flex-shrink-0 mt-1`}>
                        <span className="text-lg">📈</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Progress Tracking</h4>
                        <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                          Real-time progress bars and monthly growth calculations to reach your targets.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* How to Use Goals */}
              <div className={`${isDark ? 'bg-gradient-to-br from-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'} rounded-xl p-6 mb-8 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4">How to Use Goals</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { step: 1, title: 'Select Assets', desc: 'Choose assets for goals on Assets page' },
                    { step: 2, title: 'Set Net Worth Goal', desc: 'Create your primary net worth target' },
                    { step: 3, title: 'Add Custom Goals', desc: 'Create specific savings objectives' },
                    { step: 4, title: 'Track Progress', desc: 'Monitor your journey to each goal' }
                  ].map((item) => (
                    <div key={item.step} className={`text-center p-4 rounded-lg ${isDark ? 'bg-neutral-800' : 'bg-white'}`}>
                      <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-blue-600' : 'bg-blue-100'} flex items-center justify-center mx-auto mb-2`}>
                        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-blue-600'}`}>{item.step}</span>
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                      <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Goal Types */}
              <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 mb-8 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4">Goal Types</h3>
                <div className="space-y-6">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-800/50' : 'bg-blue-50'}`}>
                    <h4 className="font-semibold mb-2 text-blue-600">Net Worth Goal</h4>
                    <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-3`}>
                      Your primary financial target representing the total value you want to achieve across all selected assets.
                    </p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Set target amount and optional target date</li>
                      <li>Progress calculated from total selected asset value</li>
                      <li>Shows monthly growth needed to reach target</li>
                      <li>Can be edited, completed, or deleted</li>
                    </ul>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-green-800/50' : 'bg-green-50'}`}>
                    <h4 className="font-semibold mb-2 text-green-600">Custom Goals</h4>
                    <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-3`}>
                      Specific savings objectives with dedicated allocation from your selected assets.
                    </p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li><strong>Asset Goals:</strong> Buy a new property, investment, or tangible item</li>
                      <li><strong>Experience Goals:</strong> Vacation, education, or life experiences</li>
                      <li><strong>Security Goals:</strong> Emergency fund or insurance coverage</li>
                      <li><strong>Allocate Amount:</strong> Portion of selected assets dedicated to this goal</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Best Practices */}
              <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4 text-green-600">Best Practices</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Asset Selection Strategy</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Select liquid assets for shorter-term goals</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Include growth assets for long-term net worth goals</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Regularly review and update asset selections</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Goal Management</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Set realistic and achievable targets</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Review progress monthly or quarterly</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Celebrate completed goals and set new ones</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Export & Analysis Section */}
            <section id="exports" className="mb-16">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="text-2xl">📄</span>
                Export & Analysis Features
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className={`${isDark ? 'bg-gradient-to-br from-green-900 to-green-800' : 'bg-gradient-to-br from-green-50 to-green-100'} rounded-xl p-6 shadow-sm`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">📄</span>
                    <h3 className="text-xl font-semibold">Terminal-Style PDF Reports</h3>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      ASCII art tables for LLM readability
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Executive summary with key metrics
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Portfolio distribution charts
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Risk analysis matrix
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Ready-to-use AI prompts
                    </li>
                  </ul>
                </div>

                <div className={`${isDark ? 'bg-gradient-to-br from-emerald-900 to-emerald-800' : 'bg-gradient-to-br from-emerald-50 to-emerald-100'} rounded-xl p-6 shadow-sm`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">📊</span>
                    <h3 className="text-xl font-semibold">Excel Spreadsheet Export</h3>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      Multi-sheet comprehensive workbook
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      Pre-formatted tables and calculations
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      Performance analysis sheets
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      Risk assessment data
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      AI analysis prompts included
                    </li>
                  </ul>
                </div>
              </div>

              <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4">Export Sheet Contents</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-blue-600">Excel Workbook Sheets:</h4>
                    <ol className="space-y-1 text-sm list-decimal list-inside">
                      <li>Executive Summary</li>
                      <li>Portfolio Distribution</li>
                      <li>Individual Assets</li>
                      <li>Performance Analysis</li>
                      <li>Risk Analysis</li>
                      <li>AI Analysis Prompts</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-green-600">PDF Report Sections:</h4>
                    <ol className="space-y-1 text-sm list-decimal list-inside">
                      <li>Document Metadata</li>
                      <li>Executive Summary</li>
                      <li>ASCII Portfolio Charts</li>
                      <li>Asset Performance Table</li>
                      <li>Risk Analysis Matrix</li>
                      <li>AI Analysis Prompts</li>
                    </ol>
                  </div>
                </div>
              </div>
            </section>

            {/* Insurance Section */}
            <section id="insurance" className="mb-16">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="text-2xl">🛡️</span>
                Insurance Management
              </h2>
              
              <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 mb-8 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4">Understanding Your Protection Portfolio</h3>
                <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-4`}>
                  The Insurance section of Aura represents a fundamental shift in how you think about insurance coverage. Rather than viewing insurance as an expense or necessary evil, Aura helps you appreciate insurance as a powerful protective shield that guards your assets and provides peace of mind.
                </p>
                <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                  Just as you have a portfolio of assets, you also have a portfolio of insurance protection. Aura helps you visualize this protection portfolio and understand how different types of coverage work together to create a comprehensive safety net.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
                  <h3 className="text-xl font-semibold mb-4 text-blue-600">Insurance Types Supported</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-red-500">❤️</span>
                      <div>
                        <h4 className="font-semibold">Life Insurance</h4>
                        <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>Term, Whole, Universal coverage</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-green-500">🏥</span>
                      <div>
                        <h4 className="font-semibold">Health Insurance</h4>
                        <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>Medical expense protection</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-blue-500">🚗</span>
                      <div>
                        <h4 className="font-semibold">Auto Insurance</h4>
                        <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>Vehicle and liability coverage</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-purple-500">🏠</span>
                      <div>
                        <h4 className="font-semibold">Property Insurance</h4>
                        <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>Home, renters, valuables</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-orange-500">☂️</span>
                      <div>
                        <h4 className="font-semibold">Umbrella & Specialty</h4>
                        <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>Disability, umbrella policies</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
                  <h3 className="text-xl font-semibold mb-4 text-green-600">Key Features</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">🛡️</span>
                      <div>
                        <strong>Protection Value Focus:</strong> Emphasis on coverage amounts rather than premiums
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">📊</span>
                      <div>
                        <strong>Total Coverage Visualization:</strong> See your complete protection portfolio
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">📅</span>
                      <div>
                        <strong>Renewal Tracking:</strong> Never miss important policy renewals
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">💰</span>
                      <div>
                        <strong>Coverage vs Assets:</strong> Understand protection relative to your wealth
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className={`${isDark ? 'bg-gradient-to-br from-blue-900 to-blue-800' : 'bg-gradient-to-br from-blue-50 to-blue-100'} rounded-xl p-6 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4">Visualizing Your Safety Net</h3>
                <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-4`}>
                  One of Aura's most powerful features is its ability to help you visualize the total value of your insurance protection. The dashboard shows your total coverage amount across all policies, often revealing a surprisingly large number that represents the financial security you've built through insurance.
                </p>
                <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                  This total protection value is presented alongside your asset value, helping you see both sides of your financial security equation. You have assets that represent what you've built, and you have insurance that protects both those assets and your ability to continue building in the future.
                </p>
              </div>
            </section>

            {/* Insurance Types Guide Section */}
            <section id="insurance-types" className="mb-16">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="text-2xl">🔍</span>
                Insurance Types Comprehensive Guide
              </h2>
              
              <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 mb-8 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4">Understanding Your Protection Portfolio</h3>
                <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-4`}>
                  Insurance forms the protective foundation of your financial plan. Each type of insurance serves a specific purpose in safeguarding different aspects of your life and assets. This guide helps you understand what each type covers and why it matters.
                </p>
              </div>

              {/* Life Insurance */}
              <BlurFade delay={0.1}>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-red-600">❤️</span>
                    Life Insurance
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <span>📄</span>
                        Term Life Insurance
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className={`p-3 rounded ${isDark ? 'bg-blue-800/30' : 'bg-blue-50'}`}>
                          <p className="font-semibold mb-1">Coverage Type:</p>
                          <p>Pure death benefit protection for a specified term (10, 20, 30 years)</p>
                        </div>
                        <div className={`p-3 rounded ${isDark ? 'bg-green-800/30' : 'bg-green-50'}`}>
                          <p className="font-semibold mb-1">Best For:</p>
                          <p>Young families, mortgage protection, income replacement during earning years</p>
                        </div>
                        <div className={`p-3 rounded ${isDark ? 'bg-purple-800/30' : 'bg-purple-50'}`}>
                          <p className="font-semibold mb-1">Key Features:</p>
                          <ul className="list-disc list-inside">
                            <li>Lowest premiums per coverage amount</li>
                            <li>No cash value component</li>
                            <li>Coverage expires at end of term</li>
                            <li>Can be renewed or converted</li>
                          </ul>
                        </div>
                      </div>
                    </MagicCard>

                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <span>💼</span>
                        Whole Life Insurance
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className={`p-3 rounded ${isDark ? 'bg-blue-800/30' : 'bg-blue-50'}`}>
                          <p className="font-semibold mb-1">Coverage Type:</p>
                          <p>Permanent coverage with cash value accumulation component</p>
                        </div>
                        <div className={`p-3 rounded ${isDark ? 'bg-green-800/30' : 'bg-green-50'}`}>
                          <p className="font-semibold mb-1">Best For:</p>
                          <p>Estate planning, wealth transfer, forced savings, permanent protection needs</p>
                        </div>
                        <div className={`p-3 rounded ${isDark ? 'bg-purple-800/30' : 'bg-purple-50'}`}>
                          <p className="font-semibold mb-1">Key Features:</p>
                          <ul className="list-disc list-inside">
                            <li>Lifetime coverage guarantee</li>
                            <li>Cash value grows tax-deferred</li>
                            <li>Can borrow against cash value</li>
                            <li>Higher premiums than term</li>
                          </ul>
                        </div>
                      </div>
                    </MagicCard>

                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <span>🔄</span>
                        Universal Life Insurance
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className={`p-3 rounded ${isDark ? 'bg-blue-800/30' : 'bg-blue-50'}`}>
                          <p className="font-semibold mb-1">Coverage Type:</p>
                          <p>Flexible permanent coverage with adjustable premiums and death benefit</p>
                        </div>
                        <div className={`p-3 rounded ${isDark ? 'bg-green-800/30' : 'bg-green-50'}`}>
                          <p className="font-semibold mb-1">Best For:</p>
                          <p>Those wanting flexibility in premiums and coverage amounts, variable income earners</p>
                        </div>
                        <div className={`p-3 rounded ${isDark ? 'bg-purple-800/30' : 'bg-purple-50'}`}>
                          <p className="font-semibold mb-1">Key Features:</p>
                          <ul className="list-disc list-inside">
                            <li>Adjust premiums and coverage</li>
                            <li>Cash value earns interest</li>
                            <li>Transparency in costs</li>
                            <li>More complexity than whole life</li>
                          </ul>
                        </div>
                      </div>
                    </MagicCard>

                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <span>📈</span>
                        Variable Life Insurance
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className={`p-3 rounded ${isDark ? 'bg-blue-800/30' : 'bg-blue-50'}`}>
                          <p className="font-semibold mb-1">Coverage Type:</p>
                          <p>Permanent coverage with cash value invested in sub-accounts (stocks/bonds)</p>
                        </div>
                        <div className={`p-3 rounded ${isDark ? 'bg-green-800/30' : 'bg-green-50'}`}>
                          <p className="font-semibold mb-1">Best For:</p>
                          <p>Sophisticated investors wanting growth potential, comfortable with market risk</p>
                        </div>
                        <div className={`p-3 rounded ${isDark ? 'bg-purple-800/30' : 'bg-purple-50'}`}>
                          <p className="font-semibold mb-1">Key Features:</p>
                          <ul className="list-disc list-inside">
                            <li>Market-based cash value growth</li>
                            <li>Higher risk and potential return</li>
                            <li>Requires active management</li>
                            <li>Death benefit can fluctuate</li>
                          </ul>
                        </div>
                      </div>
                    </MagicCard>
                  </div>
                </div>
              </BlurFade>

              {/* Health Insurance */}
              <BlurFade delay={0.2}>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-green-600">🏥</span>
                    Health & Medical Insurance
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3">🩺 Health Insurance</h4>
                      <div className="space-y-2 text-sm">
                        <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-3`}>
                          Covers medical expenses including hospitalization, surgery, medications, and preventive care.
                        </p>
                        <div className={`p-2 rounded ${isDark ? 'bg-green-800/30' : 'bg-green-50'}`}>
                          <p className="font-semibold">Coverage Includes:</p>
                          <ul className="list-disc list-inside ml-2 mt-1">
                            <li>Hospital stays and surgery</li>
                            <li>Doctor visits and specialists</li>
                            <li>Prescription medications</li>
                            <li>Preventive care and screenings</li>
                            <li>Emergency services</li>
                          </ul>
                        </div>
                        <div className={`p-2 rounded ${isDark ? 'bg-blue-800/30' : 'bg-blue-50'}`}>
                          <p className="font-semibold">Key Considerations:</p>
                          <ul className="list-disc list-inside ml-2 mt-1">
                            <li>Deductibles and copays</li>
                            <li>Network restrictions</li>
                            <li>Annual maximums</li>
                            <li>Pre-existing conditions</li>
                          </ul>
                        </div>
                      </div>
                    </MagicCard>

                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3">🦷 Dental & Vision</h4>
                      <div className="space-y-2 text-sm">
                        <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-3`}>
                          Specialized coverage for dental and vision care, often separate from health insurance.
                        </p>
                        <div className={`p-2 rounded ${isDark ? 'bg-green-800/30' : 'bg-green-50'}`}>
                          <p className="font-semibold">Dental Coverage:</p>
                          <ul className="list-disc list-inside ml-2 mt-1">
                            <li>Preventive cleanings (usually 100%)</li>
                            <li>Basic procedures (fillings, extractions)</li>
                            <li>Major work (crowns, bridges)</li>
                            <li>Orthodontics (sometimes limited)</li>
                          </ul>
                        </div>
                        <div className={`p-2 rounded ${isDark ? 'bg-blue-800/30' : 'bg-blue-50'}`}>
                          <p className="font-semibold">Vision Coverage:</p>
                          <ul className="list-disc list-inside ml-2 mt-1">
                            <li>Annual eye exams</li>
                            <li>Prescription glasses/contacts</li>
                            <li>Frames allowance</li>
                            <li>Lens upgrades</li>
                          </ul>
                        </div>
                      </div>
                    </MagicCard>
                  </div>
                </div>
              </BlurFade>

              {/* Property & Casualty */}
              <BlurFade delay={0.3}>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-blue-600">🏠</span>
                    Property & Casualty Insurance
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3">🏡 Home Insurance</h4>
                      <div className="space-y-2 text-sm">
                        <div className={`p-2 rounded ${isDark ? 'bg-blue-800/30' : 'bg-blue-50'}`}>
                          <p className="font-semibold mb-1">Dwelling Coverage:</p>
                          <p>Structure of your home, attached structures</p>
                        </div>
                        <div className={`p-2 rounded ${isDark ? 'bg-green-800/30' : 'bg-green-50'}`}>
                          <p className="font-semibold mb-1">Personal Property:</p>
                          <p>Contents of home, furniture, electronics, clothing</p>
                        </div>
                        <div className={`p-2 rounded ${isDark ? 'bg-purple-800/30' : 'bg-purple-50'}`}>
                          <p className="font-semibold mb-1">Liability Protection:</p>
                          <p>Injuries on your property, damage you cause to others</p>
                        </div>
                        <div className={`p-2 rounded ${isDark ? 'bg-yellow-800/30' : 'bg-yellow-50'}`}>
                          <p className="font-semibold mb-1">Additional Living:</p>
                          <p>Temporary housing if home is uninhabitable</p>
                        </div>
                      </div>
                    </MagicCard>

                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3">🚗 Auto Insurance</h4>
                      <div className="space-y-2 text-sm">
                        <div className={`p-2 rounded ${isDark ? 'bg-blue-800/30' : 'bg-blue-50'}`}>
                          <p className="font-semibold mb-1">Liability Coverage:</p>
                          <p>Injuries/damage you cause to others (legally required)</p>
                        </div>
                        <div className={`p-2 rounded ${isDark ? 'bg-green-800/30' : 'bg-green-50'}`}>
                          <p className="font-semibold mb-1">Collision:</p>
                          <p>Damage to your vehicle from accidents</p>
                        </div>
                        <div className={`p-2 rounded ${isDark ? 'bg-purple-800/30' : 'bg-purple-50'}`}>
                          <p className="font-semibold mb-1">Comprehensive:</p>
                          <p>Theft, vandalism, weather, animal strikes</p>
                        </div>
                        <div className={`p-2 rounded ${isDark ? 'bg-yellow-800/30' : 'bg-yellow-50'}`}>
                          <p className="font-semibold mb-1">Uninsured/Underinsured:</p>
                          <p>Protection when other driver has insufficient coverage</p>
                        </div>
                      </div>
                    </MagicCard>
                  </div>
                </div>
              </BlurFade>

              {/* Specialty Insurance */}
              <BlurFade delay={0.4}>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-purple-600">☂️</span>
                    Specialty & Business Insurance
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3">☂️ Umbrella</h4>
                      <div className="space-y-2 text-sm">
                        <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-2`}>
                          Extra liability protection beyond home/auto limits
                        </p>
                        <div className={`p-2 rounded ${isDark ? 'bg-purple-800/30' : 'bg-purple-50'}`}>
                          <p className="font-semibold">Covers:</p>
                          <ul className="list-disc list-inside text-xs">
                            <li>Large lawsuits</li>
                            <li>Personal injury claims</li>
                            <li>Property damage</li>
                            <li>Legal defense costs</li>
                          </ul>
                        </div>
                      </div>
                    </MagicCard>

                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3">🚫 Disability</h4>
                      <div className="space-y-2 text-sm">
                        <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-2`}>
                          Income replacement if unable to work due to injury/illness
                        </p>
                        <div className={`p-2 rounded ${isDark ? 'bg-green-800/30' : 'bg-green-50'}`}>
                          <p className="font-semibold">Types:</p>
                          <ul className="list-disc list-inside text-xs">
                            <li>Short-term disability</li>
                            <li>Long-term disability</li>
                            <li>Own occupation vs any occupation</li>
                            <li>Elimination period</li>
                          </ul>
                        </div>
                      </div>
                    </MagicCard>

                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3">💼 Business</h4>
                      <div className="space-y-2 text-sm">
                        <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-2`}>
                          Protection for business owners and professionals
                        </p>
                        <div className={`p-2 rounded ${isDark ? 'bg-blue-800/30' : 'bg-blue-50'}`}>
                          <p className="font-semibold">Types:</p>
                          <ul className="list-disc list-inside text-xs">
                            <li>General liability</li>
                            <li>Professional liability (E&O)</li>
                            <li>Workers compensation</li>
                            <li>Business property</li>
                          </ul>
                        </div>
                      </div>
                    </MagicCard>
                  </div>
                </div>
              </BlurFade>

              {/* Coverage Amount Guidelines */}
              <div className={`${isDark ? 'bg-gradient-to-br from-green-900 to-green-800' : 'bg-gradient-to-br from-green-50 to-green-100'} rounded-xl p-6 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4">Coverage Amount Guidelines</h3>
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-semibold mb-3 text-green-600">Life Insurance:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span><strong>10-15x annual income</strong> for young families with dependents</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span><strong>Mortgage balance + 5 years expenses</strong> as minimum</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span><strong>Education costs + debt elimination</strong> for comprehensive coverage</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-blue-600">Liability Insurance:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span><strong>$1-2M umbrella minimum</strong> for high net worth individuals</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span><strong>Match or exceed net worth</strong> to protect assets</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span><strong>Higher for professionals</strong> (doctors, lawyers, etc.)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Tools & Features Section */}
            <section id="tools" className="mb-16">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="text-2xl">🛠️</span>
                Advanced Tools & Features
              </h2>
              
              <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 mb-8 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4">Powerful Analysis Tools at Your Fingertips</h3>
                <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-4`}>
                  Aura provides sophisticated tools to help you visualize, analyze, and optimize your financial portfolio. These tools transform raw data into actionable insights.
                </p>
              </div>

              {/* Asset Hierarchy Mind Map */}
              <BlurFade delay={0.1}>
                <div className="mb-8">
                  <MagicCard className={`p-8 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-3xl">🗺️</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">Asset Hierarchy Mind Map</h3>
                        <p className={`${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                          Interactive visualization of your asset organization
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-blue-600">What It Does:</h4>
                        <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-3`}>
                          Creates an interactive mind map showing your assets organized by customizable hierarchies like liquidity → time horizon → purpose → type.
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className={`p-3 rounded ${isDark ? 'bg-blue-800/30' : 'bg-blue-50'}`}>
                            <p className="font-semibold mb-1">✨ Interactive Nodes:</p>
                            <p>Click nodes to expand/collapse, drag to rearrange, zoom for details</p>
                          </div>
                          <div className={`p-3 rounded ${isDark ? 'bg-green-800/30' : 'bg-green-50'}`}>
                            <p className="font-semibold mb-1">📊 Visual Insights:</p>
                            <p>Node sizes reflect asset values, colors indicate categories</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-purple-600">How to Use:</h4>
                        <ol className="space-y-2 text-sm list-decimal list-inside">
                          <li>Navigate to Dashboard → Tools → Asset Mind Map</li>
                          <li>Choose your hierarchy levels (up to 5 deep)</li>
                          <li>Select order: Liquidity, Time Horizon, Purpose, Type</li>
                          <li>Interact with the map: click, drag, zoom</li>
                          <li>Export visualization as image</li>
                        </ol>
                        <div className={`mt-4 p-3 rounded ${isDark ? 'bg-yellow-800/30' : 'bg-yellow-50'}`}>
                          <p className="font-semibold mb-1">💡 Pro Tip:</p>
                          <p className="text-sm">Use different hierarchies for different purposes: liquidity-first for cash flow planning, purpose-first for goal alignment</p>
                        </div>
                      </div>
                    </div>
                  </MagicCard>
                </div>
              </BlurFade>

              {/* Insurance Hierarchy */}
              <BlurFade delay={0.2}>
                <div className="mb-8">
                  <MagicCard className={`p-8 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <span className="text-3xl">🛡️</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">Insurance Protection Map</h3>
                        <p className={`${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                          Visualize your complete protection portfolio
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-green-600">What It Shows:</h4>
                        <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-3`}>
                          Interactive map of your insurance policies organized by type (Life, Health, Auto, Home, etc.) with coverage amounts and premium breakdowns.
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className={`p-3 rounded ${isDark ? 'bg-green-800/30' : 'bg-green-50'}`}>
                            <p className="font-semibold mb-1">🎯 Coverage Overview:</p>
                            <p>See total protection value across all policy types</p>
                          </div>
                          <div className={`p-3 rounded ${isDark ? 'bg-blue-800/30' : 'bg-blue-50'}`}>
                            <p className="font-semibold mb-1">💰 Cost Analysis:</p>
                            <p>Annual premium totals by category and policy</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-emerald-600">Features:</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-1">✓</span>
                            <span>Group policies by type, carrier, or coverage level</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-1">✓</span>
                            <span>Identify coverage gaps and overlaps</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-1">✓</span>
                            <span>Compare premiums to coverage ratios</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-1">✓</span>
                            <span>Track renewal dates visually</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </MagicCard>
                </div>
              </BlurFade>

              {/* Volatility Analysis Tool */}
              <BlurFade delay={0.3}>
                <div className="mb-8">
                  <MagicCard className={`p-8 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                        <span className="text-3xl">📊</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">Portfolio Volatility Analysis</h3>
                        <p className={`${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                          Understand your portfolio's risk profile
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-orange-600">Default Volatility Metrics:</h4>
                        <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-3`}>
                          Aura includes industry-standard volatility measures (σ - sigma) for different asset classes:
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between items-center p-2 rounded ${isDark ? 'bg-neutral-800' : 'bg-gray-50'}">
                            <span>Cryptocurrency</span>
                            <span className="font-mono text-red-600">σ = 0.540 (54%)</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded ${isDark ? 'bg-neutral-800' : 'bg-gray-50'}">
                            <span>Gold</span>
                            <span className="font-mono text-yellow-600">σ = 0.151 (15.1%)</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded ${isDark ? 'bg-neutral-800' : 'bg-gray-50'}">
                            <span>Global Equities</span>
                            <span className="font-mono text-orange-600">σ = 0.105 (10.5%)</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded ${isDark ? 'bg-neutral-800' : 'bg-gray-50'}">
                            <span>Real Estate (Residential)</span>
                            <span className="font-mono text-blue-600">σ = 0.120 (12%)</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded ${isDark ? 'bg-neutral-800' : 'bg-gray-50'}">
                            <span>Bank FD / Cash</span>
                            <span className="font-mono text-green-600">σ = 0.005 (0.5%)</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-red-600">What It Calculates:</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-orange-500 mt-1">📈</span>
                            <span><strong>Portfolio-Weighted Volatility:</strong> Overall risk based on your asset allocation</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-orange-500 mt-1">⚖️</span>
                            <span><strong>Risk Distribution:</strong> Which assets contribute most to portfolio volatility</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-orange-500 mt-1">💎</span>
                            <span><strong>Diversification Score:</strong> How well your portfolio reduces risk through diversification</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-orange-500 mt-1">🎯</span>
                            <span><strong>Risk Recommendations:</strong> Suggestions for rebalancing to target risk levels</span>
                          </li>
                        </ul>
                        <div className={`mt-4 p-3 rounded ${isDark ? 'bg-orange-800/30' : 'bg-orange-50'}`}>
                          <p className="font-semibold mb-1">⚠️ Important:</p>
                          <p className="text-sm">These are historical volatility estimates. Past volatility doesn't predict future performance.</p>
                        </div>
                      </div>
                    </div>
                  </MagicCard>
                </div>
              </BlurFade>

              {/* Export Tools */}
              <BlurFade delay={0.4}>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-purple-600">📤</span>
                    Export & Reporting Tools
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <span>📄</span>
                        Terminal-Style PDF Export
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-3`}>
                          Professional reports optimized for AI analysis with ASCII art visualizations and comprehensive data tables.
                        </p>
                        <div className={`p-3 rounded ${isDark ? 'bg-purple-800/30' : 'bg-purple-50'}`}>
                          <p className="font-semibold mb-2">Includes:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Executive summary with KPIs</li>
                            <li>ASCII portfolio distribution charts</li>
                            <li>Asset performance tables</li>
                            <li>Risk analysis matrix</li>
                            <li>Pre-written AI analysis prompts</li>
                          </ul>
                        </div>
                      </div>
                    </MagicCard>

                    <MagicCard className={`p-6 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <span>📊</span>
                        Excel Spreadsheet Export
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-3`}>
                          Multi-sheet workbook with all your data ready for custom analysis, pivot tables, and further manipulation.
                        </p>
                        <div className={`p-3 rounded ${isDark ? 'bg-green-800/30' : 'bg-green-50'}`}>
                          <p className="font-semibold mb-2">6 Sheets Included:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Executive summary</li>
                            <li>Portfolio distribution</li>
                            <li>Individual assets</li>
                            <li>Performance analysis</li>
                            <li>Risk assessment</li>
                            <li>AI analysis prompts</li>
                          </ul>
                        </div>
                      </div>
                    </MagicCard>
                  </div>
                </div>
              </BlurFade>

              {/* Best Practices */}
              <div className={`${isDark ? 'bg-gradient-to-br from-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'} rounded-xl p-6 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4">Tool Usage Best Practices</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-blue-600">Visualization Tools:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">✓</span>
                        <span>Use asset mind maps for portfolio rebalancing decisions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">✓</span>
                        <span>Review insurance maps quarterly to identify gaps</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">✓</span>
                        <span>Compare different hierarchy views for different goals</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-purple-600">Analysis & Export:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500 mt-1">✓</span>
                        <span>Generate monthly reports to track progress over time</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500 mt-1">✓</span>
                        <span>Use PDF exports for AI-powered portfolio analysis</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500 mt-1">✓</span>
                        <span>Excel exports for custom scenarios and what-if analysis</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Analysis Section */}
            <section id="ai-analysis" className="mb-16">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                AI-Powered Portfolio Analysis
              </h2>
              
              <div className={`${isDark ? 'bg-gradient-to-br from-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'} rounded-xl p-6 mb-8 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4">How to Use AI Analysis</h3>
                <div className="grid md:grid-cols-5 gap-4">
                  {[
                    { step: 1, title: 'Export', desc: 'Download PDF or Excel' },
                    { step: 2, title: 'Choose AI', desc: 'ChatGPT, Claude, etc.' },
                    { step: 3, title: 'Upload', desc: 'Upload your report' },
                    { step: 4, title: 'Prompt', desc: 'Use provided prompts' },
                    { step: 5, title: 'Analyze', desc: 'Get professional insights' }
                  ].map((item) => (
                    <div key={item.step} className={`text-center p-4 rounded-lg ${isDark ? 'bg-neutral-800' : 'bg-white'}`}>
                      <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-blue-600' : 'bg-blue-100'} flex items-center justify-center mx-auto mb-2`}>
                        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-blue-600'}`}>{item.step}</span>
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                      <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4">AI Analysis Capabilities</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-purple-600">What AI Can Analyze:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="text-purple-500">•</span>
                        Portfolio diversification effectiveness
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-purple-500">•</span>
                        Risk assessment and mitigation strategies
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-purple-500">•</span>
                        Performance optimization opportunities
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-purple-500">•</span>
                        Rebalancing recommendations
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-purple-500">•</span>
                        Tax optimization suggestions
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-blue-600">Sample AI Prompts:</h4>
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-neutral-800' : 'bg-gray-50'} text-sm`}>
                      <p className="italic mb-2">"Analyze my investment portfolio for diversification effectiveness..."</p>
                      <p className="italic mb-2">"Review my asset performance and suggest optimization strategies..."</p>
                      <p className="italic">"Evaluate my portfolio risk profile and suggest mitigation strategies..."</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Tips Section */}
            <section id="tips" className="mb-16">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="text-2xl">💡</span>
                Tips & Best Practices
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
                  <h3 className="text-xl font-semibold mb-4 text-green-600">Best Practices</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">📅</span>
                      <div>
                        <strong>Regular Updates:</strong> Keep your asset values current for accurate analysis
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">📝</span>
                      <div>
                        <strong>Detailed Records:</strong> Add notes and context to make assets meaningful
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">🔄</span>
                      <div>
                        <strong>Regular Analysis:</strong> Use export features monthly or quarterly
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">🤖</span>
                      <div>
                        <strong>AI Assistance:</strong> Leverage AI analysis for professional insights
                      </div>
                    </li>
                  </ul>
                </div>

                <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
                  <h3 className="text-xl font-semibold mb-4 text-blue-600">Personalization Tips</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">Asset Naming</h4>
                      <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-2`}>
                        Instead of "2019 Honda Civic," try "My First New Car" with a note about your pride in the purchase.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Investment Stories</h4>
                      <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                        Call stock holdings "Tech Growth Fund" with notes about your belief in the sector's potential.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Release Notes Section */}
            <section id="release-notes" className="mb-16">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="text-2xl">📋</span>
                Release Notes
              </h2>
              
              <div className="space-y-6">
                {/* v0.126 */}
                <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 shadow-sm border-2 ${isDark ? 'border-blue-600' : 'border-blue-300'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-blue-600 flex items-center gap-2">
                      <span className="text-2xl">🌟</span>
                      Version v0.126
                    </h3>
                    <span className={`text-sm px-3 py-1 rounded-full ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'} font-medium`}>
                      Latest • 2024-12-19
                    </span>
                  </div>
                  <h4 className="font-semibold mb-3">Strategic Asset Classification System & Comprehensive User Guide Enhancement</h4>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">🎯</span>
                      <span><strong>Strategic Asset Classification:</strong> Advanced Asset Purpose system with 7 strategic categories including Hyper Growth, Financial Security, Emergency Fund, Children's Education, Retirement Fund, and Speculation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">⏰</span>
                      <span><strong>Time Horizon Planning:</strong> Comprehensive temporal classification system with Short Term (&lt;1 year), Medium Term (1-3 years), and Long Term (&gt;3 years) strategic framework</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">💧</span>
                      <span><strong>Liquidity Management:</strong> Enhanced liquidity status classification for better cash flow planning and emergency preparedness</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">📚</span>
                      <span><strong>Comprehensive User Guide:</strong> Complete overhaul of Managing Assets section with detailed explanations of all strategic parameters, transaction types, and portfolio construction best practices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">🔄</span>
                      <span><strong>Enhanced Transaction System:</strong> 8 advanced transaction types including Create Asset, Update Market Value, Strategic Reclassification, and comprehensive lifecycle management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">🎨</span>
                      <span><strong>Theme Consistency:</strong> Unified button styling across all pages with proper theme-aware color schemes and consistent user experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">🗄️</span>
                      <span><strong>Database Schema Updates:</strong> Complete alignment of asset classification data with frontend options, ensuring consistent strategic planning capabilities</span>
                    </li>
                  </ul>
                  <div className={`text-sm p-4 rounded-lg ${isDark ? 'bg-gradient-to-r from-blue-900/40 to-purple-900/40 text-blue-200' : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-800'} border ${isDark ? 'border-blue-800' : 'border-blue-200'}`}>
                    <strong>Strategic Innovation:</strong> This release transforms Aura from a simple asset tracker into a comprehensive financial planning platform. The new strategic classification system enables users to understand not just what they own, but how each asset contributes to their overall financial goals and timeline. Enhanced documentation empowers users to make informed decisions about portfolio construction and asset allocation strategies.
                  </div>
                </div>
                
                {/* v0.125 */}
                <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-blue-600">Version v0.125</h3>
                    <span className={`text-sm px-3 py-1 rounded-full ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                      2024-12-19
                    </span>
                  </div>
                  <h4 className="font-semibold mb-3">Complete transaction system overhaul with enhanced Assets table</h4>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">🔄</span>
                      <span>Transaction system enhancement with Asset Purpose strategic classification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">📊</span>
                      <span>New transaction types for comprehensive asset lifecycle management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">💰</span>
                      <span>Values column fix for accurate financial reporting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">🗂️</span>
                      <span>Enhanced Assets table with improved data presentation</span>
                    </li>
                  </ul>
                </div>

                {/* v0.107 */}
                <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-blue-600">Version v0.107</h3>
                    <span className={`text-sm px-3 py-1 rounded-full ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                      2025-09-16
                    </span>
                  </div>
                  <h4 className="font-semibold mb-3">Complete TanStack Query mutations with cross-tab broadcasting</h4>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✅</span>
                      <span>Insurance.jsx: Implement useMutation with optimistic updates and mutationHelpers broadcasting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✅</span>
                      <span>Assets.jsx: Add deleteAssetMutation with optimistic updates and proper broadcasting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">🚀</span>
                      <span>Fix Annuities 12s loading issue with guarded retry logic for 4xx responses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">⚡</span>
                      <span>Align persistence (30min) with staleness (30min) for consistent cache behavior</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">🔧</span>
                      <span>Standardize retry strategies: don't retry 4xx client errors, only 5xx/network</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">🔗</span>
                      <span>Normalize annuity service URLs with consistent trailing slashes</span>
                    </li>
                  </ul>
                  <div className={`text-sm p-3 rounded-lg ${isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-800'}`}>
                    <strong>Performance improvements:</strong> Eliminates 12s delays on empty data responses, enables instant cross-tab synchronization, optimistic updates for immediate UI feedback, smart retry prevents unnecessary API calls
                  </div>
                </div>

                {/* v0.106 */}
                <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-blue-600">Version v0.106</h3>
                    <span className={`text-sm px-3 py-1 rounded-full ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                      2025-09-16
                    </span>
                  </div>
                  <h4 className="font-semibold mb-3">Complete TanStack Query performance optimization</h4>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">⚡</span>
                      <span>Optimized axios interceptor with token caching system</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">🕒</span>
                      <span>Increased staleTime to 30min for better cache efficiency</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">🔧</span>
                      <span>Fixed dashboard service call in prefetch (getSummary method)</span>
                    </li>
                  </ul>
                  <div className={`text-sm p-3 rounded-lg ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-800'}`}>
                    <strong>Target achieved:</strong> 70% database load reduction through comprehensive caching strategy
                  </div>
                </div>

                {/* v0.105 */}
                <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-blue-600">Version v0.105</h3>
                    <span className={`text-sm px-3 py-1 rounded-full ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                      2025-09-16
                    </span>
                  </div>
                  <h4 className="font-semibold mb-3">TanStack Query foundation implementation</h4>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">🏗️</span>
                      <span>Complete TanStack Query v5 setup with persistence</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">🔄</span>
                      <span>Cross-tab synchronization with BroadcastChannel API</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">🚀</span>
                      <span>Prefetch system on authentication for instant data hydration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">⚙️</span>
                      <span>Query keys architecture for hierarchical caching</span>
                    </li>
                  </ul>
                </div>

                {/* v0.104 */}
                <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-blue-600">Version v0.104</h3>
                    <span className={`text-sm px-3 py-1 rounded-full ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                      2025-09-15
                    </span>
                  </div>
                  <h4 className="font-semibold mb-3">Enhanced theme system and UI improvements</h4>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">🎨</span>
                      <span>Dynamic theme system with OKLCH color support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">📊</span>
                      <span>Enhanced chart visualizations with theme-aware colors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">🔧</span>
                      <span>Unified loading spinner across all pages</span>
                    </li>
                  </ul>
                </div>

                {/* v0.103 */}
                <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-blue-600">Version v0.103</h3>
                    <span className={`text-sm px-3 py-1 rounded-full ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                      2025-09-15
                    </span>
                  </div>
                  <h4 className="font-semibold mb-3">PDF export enhancements and transaction optimizations</h4>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">📄</span>
                      <span>Enhanced PDF export with detailed asset breakdowns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">💰</span>
                      <span>Improved transaction processing and validation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">🔍</span>
                      <span>Advanced filtering and search capabilities</span>
                    </li>
                  </ul>
                </div>

                {/* v0.102 */}
                <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-blue-600">Version v0.102</h3>
                    <span className={`text-sm px-3 py-1 rounded-full ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                      2025-09-14
                    </span>
                  </div>
                  <h4 className="font-semibold mb-3">Insurance management system and analytics</h4>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">🛡️</span>
                      <span>Complete insurance policy management system</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">📈</span>
                      <span>Advanced analytics and protection metrics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">📊</span>
                      <span>Interactive charts and visualizations</span>
                    </li>
                  </ul>
                </div>

                {/* v0.101 */}
                <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-blue-600">Version v0.101</h3>
                    <span className={`text-sm px-3 py-1 rounded-full ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                      2025-09-13
                    </span>
                  </div>
                  <h4 className="font-semibold mb-3">Annuity management and portfolio tracking</h4>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">💰</span>
                      <span>Complete annuity portfolio management system</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">📅</span>
                      <span>Payment schedule tracking and projections</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">📊</span>
                      <span>Performance analytics and growth tracking</span>
                    </li>
                  </ul>
                </div>

                {/* v0.100 */}
                <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-blue-600">Version v0.100</h3>
                    <span className={`text-sm px-3 py-1 rounded-full ${isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'}`}>
                      Foundation Release
                    </span>
                  </div>
                  <h4 className="font-semibold mb-3">Core platform foundation</h4>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">🏗️</span>
                      <span>Core asset management system</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">🔐</span>
                      <span>Supabase authentication integration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">💳</span>
                      <span>Transaction management and tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">🎨</span>
                      <span>Modern UI with theme support</span>
                    </li>
                  </ul>
                  <div className={`text-sm p-3 rounded-lg ${isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-800'}`}>
                    <strong>Foundation established:</strong> Personal financial sanctuary platform for visualizing and managing financial assets with peace of mind
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className={`text-center py-8 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">A</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Aura Asset Manager</h3>
                <p className="text-sm">Your Personal Financial Sanctuary</p>
              </div>
              <p className="text-xs">
                Remember that Aura is designed to be your financial sanctuary—a place where you can feel proud of your achievements and confident about your future.
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;
