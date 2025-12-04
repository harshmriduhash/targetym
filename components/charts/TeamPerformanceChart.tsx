'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TeamPerformanceChartProps {
  data?: Array<{
    name: string;
    performance: number;
    objectifs: number;
    engagement: number;
  }>;
}

export function TeamPerformanceChart({ data }: TeamPerformanceChartProps) {
  // Données par défaut si aucune donnée fournie
  const defaultData = [
    { name: 'Équipe A', performance: 85, objectifs: 90, engagement: 88 },
    { name: 'Équipe B', performance: 78, objectifs: 85, engagement: 82 },
    { name: 'Équipe C', performance: 92, objectifs: 88, engagement: 90 },
    { name: 'Équipe D', performance: 88, objectifs: 92, engagement: 85 },
    { name: 'Équipe E', performance: 75, objectifs: 80, engagement: 78 },
  ];

  const chartData = data || defaultData;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="name"
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px'
          }}
        />
        <Legend />
        <Bar dataKey="performance" fill="#3b82f6" name="Performance" radius={[8, 8, 0, 0]} />
        <Bar dataKey="objectifs" fill="#8b5cf6" name="Objectifs" radius={[8, 8, 0, 0]} />
        <Bar dataKey="engagement" fill="#ec4899" name="Engagement" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
