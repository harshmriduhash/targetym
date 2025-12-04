'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GoalsProgressChartProps {
  data?: Array<{
    date: string;
    completed: number;
    inProgress: number;
    total: number;
  }>;
}

export function GoalsProgressChart({ data }: GoalsProgressChartProps) {
  // Données par défaut si aucune donnée fournie
  const defaultData = [
    { date: 'Jan', completed: 12, inProgress: 8, total: 25 },
    { date: 'Fév', completed: 18, inProgress: 10, total: 32 },
    { date: 'Mar', completed: 22, inProgress: 12, total: 38 },
    { date: 'Avr', completed: 28, inProgress: 15, total: 45 },
    { date: 'Mai', completed: 35, inProgress: 18, total: 55 },
    { date: 'Juin', completed: 42, inProgress: 20, total: 65 },
  ];

  const chartData = data || defaultData;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
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
        <Line
          type="monotone"
          dataKey="completed"
          stroke="#10b981"
          strokeWidth={3}
          name="Complétés"
          dot={{ fill: '#10b981', r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="inProgress"
          stroke="#f59e0b"
          strokeWidth={3}
          name="En cours"
          dot={{ fill: '#f59e0b', r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#6366f1"
          strokeWidth={2}
          strokeDasharray="5 5"
          name="Total"
          dot={{ fill: '#6366f1', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
