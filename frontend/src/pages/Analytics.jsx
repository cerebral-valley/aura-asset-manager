import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../hooks/useTheme';
import { assetsService } from '../services/assets';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/components/ui/global-preferences';
import { Calculator, TrendingUp, Info } from 'lucide-react';
import { Tooltip as InfoTooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const Analytics = () => {
  const { isDark } = useTheme();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  
  // Analytics settings
  const [endYear, setEndYear] = useState(currentYear + 10);
  const [inflationRate, setInflationRate] = useState(1.0);
  const [assetGrowthRates, setAssetGrowthRates] = useState({});

  // Load assets
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        const assetsData = await assetsService.getAssets();
        
        // Filter active assets (exclude cash and bank, only assets with quantity > 0)
        const activeAssets = assetsData.filter(asset => 
          asset.quantity > 0 && 
          !['cash', 'bank', 'cash_in_hand'].includes(asset.asset_type?.toLowerCase())
        );
        
        setAssets(activeAssets);
        
        // Initialize default growth rates (5% for all assets)
        const defaultRates = {};
        activeAssets.forEach(asset => {
          defaultRates[asset.id] = 5.0;
        });
        setAssetGrowthRates(defaultRates);
        
      } catch (error) {
        console.error('Error fetching assets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  // Calculate current portfolio value
  const currentPortfolioValue = useMemo(() => {
    return assets.reduce((total, asset) => {
      const currentValue = asset.current_value || asset.initial_value || 0;
      return total + currentValue;
    }, 0);
  }, [assets]);

  // Generate projection data
  const projectionData = useMemo(() => {
    if (!assets.length) return [];

    const data = [];
    const years = endYear - currentYear;

    for (let year = 0; year <= years; year++) {
      const targetYear = currentYear + year;
      
      // Calculate portfolio value without inflation adjustment
      let portfolioValueNominal = 0;
      
      assets.forEach(asset => {
        const currentValue = asset.current_value || asset.initial_value || 0;
        const growthRate = assetGrowthRates[asset.id] || 5.0;
        const futureValue = currentValue * Math.pow(1 + (growthRate / 100), year);
        portfolioValueNominal += futureValue;
      });

      // Calculate inflation-adjusted value (PPP)
      const inflationAdjustmentFactor = Math.pow(1 + (inflationRate / 100), year);
      const portfolioValueReal = portfolioValueNominal / inflationAdjustmentFactor;

      data.push({
        year: targetYear,
        nominal: portfolioValueNominal,
        real: portfolioValueReal
      });
    }

    return data;
  }, [assets, assetGrowthRates, endYear, currentYear, inflationRate]);

  const handleGrowthRateChange = (assetId, rate) => {
    setAssetGrowthRates(prev => ({
      ...prev,
      [assetId]: parseFloat(rate) || 0
    }));
  };

  const resetToDefaults = () => {
    setEndYear(currentYear + 10);
    setInflationRate(1.0);
    const defaultRates = {};
    assets.forEach(asset => {
      defaultRates[asset.id] = 5.0;
    });
    setAssetGrowthRates(defaultRates);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Analytics</h1>
          <p className="text-muted-foreground">Advanced portfolio growth projections and analysis</p>
        </div>
        <Button onClick={resetToDefaults} variant="outline">
          Reset to Defaults
        </Button>
      </div>

      {/* Input Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Projection Settings
          </CardTitle>
          <CardDescription>
            Configure projection parameters to analyze your portfolio's future growth potential
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Global Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="endYear" className="flex items-center gap-2">
                End Year
                <InfoTooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Final year for projection analysis (max: {currentYear + 30})</p>
                  </TooltipContent>
                </InfoTooltip>
              </Label>
              <Input
                id="endYear"
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(Math.min(parseInt(e.target.value) || currentYear + 10, currentYear + 30))}
                min={currentYear + 1}
                max={currentYear + 30}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="inflationRate" className="flex items-center gap-2">
                Inflation Rate (% per annum)
                <InfoTooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Expected annual inflation rate for purchasing power calculations</p>
                  </TooltipContent>
                </InfoTooltip>
              </Label>
              <Input
                id="inflationRate"
                type="number"
                step="0.1"
                value={inflationRate}
                onChange={(e) => setInflationRate(parseFloat(e.target.value) || 1.0)}
                min="0"
                max="20"
                className="mt-1"
              />
            </div>
          </div>

          {/* Asset Growth Rates */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              Asset Growth Rates
              <InfoTooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Expected annual growth rate for each asset in your portfolio</p>
                </TooltipContent>
              </InfoTooltip>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map(asset => {
                const currentValue = asset.current_value || asset.initial_value || 0;
                return (
                  <div key={asset.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">
                        {asset.name}
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(currentValue)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.1"
                        value={assetGrowthRates[asset.id] || 5.0}
                        onChange={(e) => handleGrowthRateChange(asset.id, e.target.value)}
                        min="0"
                        max="50"
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(currentPortfolioValue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projected Value ({endYear})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(projectionData[projectionData.length - 1]?.nominal || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Nominal value
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Real Value ({endYear})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(projectionData[projectionData.length - 1]?.real || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Inflation-adjusted (PPP)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projection Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Portfolio Growth Projection
          </CardTitle>
          <CardDescription>
            Portfolio value growth from {currentYear} to {endYear} with and without inflation adjustment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData}>
                <XAxis 
                  dataKey="year" 
                  tick={{ fontSize: 12 }}
                  stroke={isDark ? '#64748b' : '#475569'}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke={isDark ? '#64748b' : '#475569'}
                  tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className={`rounded-lg border p-3 shadow-lg ${
                          isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'
                        }`}>
                          <p className="font-medium mb-2">{label}</p>
                          {payload.map((item, index) => (
                            <p key={index} style={{ color: item.color }}>
                              {item.name}: {formatCurrency(item.value)}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="nominal"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  name="Nominal Value (0% inflation)"
                />
                <Line
                  type="monotone"
                  dataKey="real"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  name="Real Value (inflation-adjusted PPP)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
