import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card.jsx';

const AssetValueOverTimeChart = ({ data, title = 'Asset Value Over Time' }) => {
  // Get global currency preference for formatting
  const savedCurrency = localStorage.getItem('globalCurrency') || 'USD';
  
  const formatChartCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: savedCurrency, 
      maximumFractionDigits: 0 
    }).format(value);
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No asset value data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <XAxis dataKey="year" />
            <YAxis tickFormatter={formatChartCurrency} />
            <Tooltip formatter={(value) => formatChartCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="acquisitionValue" stroke="#8884d8" name="Acquisition Value" />
            <Line type="monotone" dataKey="presentValue" stroke="#82ca9d" name="Present Value" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AssetValueOverTimeChart;
