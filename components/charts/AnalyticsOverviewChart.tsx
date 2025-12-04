'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsOverviewChartProps {
  data?: Array<{
    month: string;
    recrutement: number;
    performance: number;
    formation: number;
    engagement: number;
  }>;
}

export function AnalyticsOverviewChart({ data }: AnalyticsOverviewChartProps) {
  // Données par défaut si aucune donnée fournie
  const defaultData = [
    { month: 'Jan', recrutement: 24, performance: 42, formation: 18, engagement: 35 },
    { month: 'Fév', recrutement: 28, performance: 45, formation: 22, engagement: 38 },
    { month: 'Mar', recrutement: 32, performance: 48, formation: 25, engagement: 42 },
    { month: 'Avr', recrutement: 35, performance: 52, formation: 28, engagement: 45 },
    { month: 'Mai', recrutement: 38, performance: 55, formation: 32, engagement: 48 },
    { month: 'Juin', recrutement: 42, performance: 58, formation: 35, engagement: 52 },
  ];

  const chartData = data || defaultData;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorRecrutement" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorFormation" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="month"
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px'
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="recrutement"
          stroke="#06b6d4"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorRecrutement)"
          name="Recrutement"
        />
        <Area
          type="monotone"
          dataKey="performance"
          stroke="#14b8a6"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorPerformance)"
          name="Performance"
        />
        <Area
          type="monotone"
          dataKey="formation"
          stroke="#a855f7"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorFormation)"
          name="Formation"
        />
        <Area
          type="monotone"
          dataKey="engagement"
          stroke="#f97316"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorEngagement)"
          name="Engagement"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
