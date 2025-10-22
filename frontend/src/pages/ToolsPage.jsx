import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import AssetMapTab from '../components/tools/AssetMapTab'
import InsuranceMappingTab from '../components/tools/InsuranceMappingTab'
import LoanCalculatorTab from '../components/tools/LoanCalculatorTab'
import BuyRentAnalyzerTab from '../components/tools/BuyRentAnalyzerTab'
import DownPaymentTrackerTab from '../components/tools/DownPaymentTrackerTab'
import VarLiteStressTestTab from '../components/tools/VarLiteStressTestTab'
import AssetMatrixTab from '../components/tools/AssetMatrixTab'
import TimeValueTab from '../components/tools/TimeValueTab'
import Loading from '../components/ui/Loading'

const ToolsPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('asset-mapping')

  if (!user) {
    return <Loading pageName="Tools" />
  }

  const tabs = [
    { id: 'asset-mapping', label: 'Asset Mapping', component: AssetMapTab },
    { id: 'insurance-mapping', label: 'Insurance Mapping', component: InsuranceMappingTab },
    { id: 'loan-calculator', label: 'Loan Calculator', component: LoanCalculatorTab },
    { id: 'buy-vs-rent', label: 'Buy vs Rent', component: BuyRentAnalyzerTab },
    { id: 'down-payment-tracker', label: 'Down-Payment Tracker', component: DownPaymentTrackerTab },
    { id: 'var-lite', label: 'Portfolio Modelling', component: VarLiteStressTestTab },
    { id: 'asset-matrix', label: 'Asset Matrix', component: AssetMatrixTab },
    { id: 'time-value', label: 'Time Value', component: TimeValueTab },
  ]

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold">Tools</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Advanced visualization and analysis tools for your assets
        </p>
      </div>

      {/* Horizontal Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  )
}

export default ToolsPage
