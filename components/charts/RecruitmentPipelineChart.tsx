'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface RecruitmentStageData {
  stage: string
  candidates: number
  conversion: number
  fill?: string
}

interface RecruitmentPipelineChartProps {
  data?: RecruitmentStageData[]
}

export function RecruitmentPipelineChart({ data }: RecruitmentPipelineChartProps) {
  // Données par défaut si aucune donnée fournie
  const defaultData: RecruitmentStageData[] = [
    { stage: 'Candidatures', candidates: 120, conversion: 100, fill: '#06b6d4' },
    { stage: 'Présélection', candidates: 45, conversion: 37.5, fill: '#3b82f6' },
    { stage: 'Entretien RH', candidates: 28, conversion: 23.3, fill: '#8b5cf6' },
    { stage: 'Entretien Tech', candidates: 18, conversion: 15, fill: '#a855f7' },
    { stage: 'Offres', candidates: 8, conversion: 6.7, fill: '#ec4899' },
    { stage: 'Embauchés', candidates: 6, conversion: 5, fill: '#10b981' },
  ];

  const chartData = data || defaultData;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          type="number"
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis
          dataKey="stage"
          type="category"
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
        <Bar
          dataKey="candidates"
          name="Candidats"
          radius={[0, 8, 8, 0]}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill || '#06b6d4'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
