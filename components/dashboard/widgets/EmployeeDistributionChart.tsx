'use client';

import { Users } from 'lucide-react';

interface EmployeeDistributionChartProps {
  totalEmployees: number;
}

export function EmployeeDistributionChart({ totalEmployees }: EmployeeDistributionChartProps) {
  const distribution = {
    Seniors: 23,
    Juniors: 77,
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Distribution</h3>
        <button className="text-muted-foreground hover:text-foreground">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rotate-90">
            <circle cx="8" cy="3" r="1.5" fill="currentColor"/>
            <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
            <circle cx="8" cy="13" r="1.5" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-center mb-4">
        <div className="relative w-32 h-32">
          {/* Donut Chart SVG */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            {/* Background circle */}
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-slate-200 dark:text-slate-700"
            />
            {/* Juniors segment (77%) */}
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${77 * 0.97} 100`}
              className="text-orange-500"
            />
            {/* Seniors segment (23%) */}
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${23 * 0.97} 100`}
              strokeDashoffset={`-${77 * 0.97}`}
              className="text-blue-500"
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-foreground">{totalEmployees}</div>
            <div className="text-xs text-muted-foreground">Employés</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-muted-foreground">{distribution.Seniors}%</span>
          </div>
          <span className="text-foreground font-medium">Seniors</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-muted-foreground">{distribution.Juniors}%</span>
          </div>
          <span className="text-foreground font-medium">Juniors</span>
        </div>
      </div>
    </div>
  );
}
