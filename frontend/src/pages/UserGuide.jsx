import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const UserGuide = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
    { id: 'dashboard', title: 'Dashboard', icon: '📊' },
    { id: 'assets', title: 'Managing Assets', icon: '💎' },
    { id: 'exports', title: 'Export & Analysis', icon: '📄' },
    { id: 'insurance', title: 'Insurance', icon: '🛡️' },
    { id: 'annuity', title: 'Annuity Planning', icon: '💰' },
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

            {/* Annuity Planning Section */}
            <section id="annuity" className="mb-16">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="text-2xl">💰</span>
                Annuity Planning
              </h2>
              
              <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 mb-8 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4">Advanced Annuity Management</h3>
                <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-4`}>
                  Aura's annuity management system is designed to handle the complexity of annuity products while maintaining the application's core philosophy of clarity and peace of mind. Whether you have fixed annuities providing guaranteed income or variable annuities with growth potential, Aura helps you understand and track these important retirement planning vehicles.
                </p>
                <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                  The system tracks not just the current value of your annuities, but also manages payment schedules, projects future income streams, and helps you understand how these products fit into your overall financial picture.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
                  <h3 className="text-xl font-semibold mb-4 text-purple-600">Annuity Types Supported</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-green-500">📈</span>
                      <div>
                        <h4 className="font-semibold">Fixed Annuities</h4>
                        <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>Guaranteed rates and predictable income</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-blue-500">📊</span>
                      <div>
                        <h4 className="font-semibold">Variable Annuities</h4>
                        <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>Market-based growth potential</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-purple-500">🔄</span>
                      <div>
                        <h4 className="font-semibold">Indexed Annuities</h4>
                        <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>Market participation with downside protection</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-orange-500">⚡</span>
                      <div>
                        <h4 className="font-semibold">Immediate Annuities</h4>
                        <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>Start income payments right away</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-red-500">⏳</span>
                      <div>
                        <h4 className="font-semibold">Deferred Annuities</h4>
                        <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>Accumulation phase before payments begin</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
                  <h3 className="text-xl font-semibold mb-4 text-green-600">Payment Schedule Management</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">📅</span>
                      <div>
                        <strong>Flexible Frequencies:</strong> Monthly, quarterly, semi-annual, or annual payments
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">🔄</span>
                      <div>
                        <strong>Automatic Calculations:</strong> Next payment dates and projections
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">📊</span>
                      <div>
                        <strong>Payment Tracking:</strong> Complete history of payments received
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">💡</span>
                      <div>
                        <strong>Income Projections:</strong> Future value calculations for planning
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className={`${isDark ? 'bg-gradient-to-br from-green-900 to-green-800' : 'bg-gradient-to-br from-green-50 to-green-100'} rounded-xl p-6 shadow-sm`}>
                  <h4 className="font-semibold mb-3 text-green-600">Financial Calculations</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Present value calculations
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Future value projections
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Net value calculations
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Payment stream analysis
                    </li>
                  </ul>
                </div>
                
                <div className={`${isDark ? 'bg-gradient-to-br from-blue-900 to-blue-800' : 'bg-gradient-to-br from-blue-50 to-blue-100'} rounded-xl p-6 shadow-sm`}>
                  <h4 className="font-semibold mb-3 text-blue-600">User Interface Features</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">✓</span>
                      Intuitive annuity dashboard
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">✓</span>
                      Payment schedule wizard
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">✓</span>
                      One-click payment recording
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">✓</span>
                      Visual status indicators
                    </li>
                  </ul>
                </div>
                
                <div className={`${isDark ? 'bg-gradient-to-br from-purple-900 to-purple-800' : 'bg-gradient-to-br from-purple-50 to-purple-100'} rounded-xl p-6 shadow-sm`}>
                  <h4 className="font-semibold mb-3 text-purple-600">Planning Benefits</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-purple-500">✓</span>
                      Retirement income planning
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-500">✓</span>
                      Cash flow projections
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-500">✓</span>
                      Tax planning considerations
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-500">✓</span>
                      Legacy planning integration
                    </li>
                  </ul>
                </div>
              </div>

              <div className={`${isDark ? 'bg-gradient-to-br from-orange-900 to-red-900' : 'bg-gradient-to-br from-orange-50 to-red-50'} rounded-xl p-6 shadow-sm`}>
                <h3 className="text-xl font-semibold mb-4">Comprehensive Annuity Management</h3>
                <p className={`${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-4`}>
                  The annuity support implementation moves beyond simple single-value assets to handle complex financial instruments with ongoing payment streams. Users can create annuity assets with specific types and characteristics, configure payment schedules with flexible frequencies and terms, track payments and maintain complete history, and project future payments for financial planning.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Key Capabilities:</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Calculate net values incorporating payment streams</li>
                      <li>• Manage multiple schedules per asset</li>
                      <li>• Support for both lifetime and fixed-term annuities</li>
                      <li>• Integration with existing asset management</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Advanced Features:</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Surrender value tracking</li>
                      <li>• Rider and benefit management</li>
                      <li>• Tax qualification status</li>
                      <li>• Beneficiary information tracking</li>
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
