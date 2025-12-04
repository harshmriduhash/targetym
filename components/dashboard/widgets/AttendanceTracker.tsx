'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'

interface AttendanceData {
  operatingHours: number
  totalHours: number
  remainingHours: number
  notSpent: number
}

interface AttendanceTrackerProps {
  data?: AttendanceData
}

export function AttendanceTracker({
  data = {
    operatingHours: 50,
    totalHours: 130,
    remainingHours: 60,
    notSpent: 20
  }
}: AttendanceTrackerProps) {
  const total = data.operatingHours + data.totalHours + data.remainingHours + data.notSpent
  const operatingPercentage = (data.operatingHours / total) * 100
  const totalPercentage = (data.totalHours / total) * 100
  const remainingPercentage = (data.remainingHours / total) * 100
  const notSpentPercentage = (data.notSpent / total) * 100

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-primary" />
          Attendance Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-6">
          {/* Circular Gauge */}
          <div className="relative w-48 h-48">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="20"
              />

              {/* Operating Hours (Blue) */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#4F46E5"
                strokeWidth="20"
                strokeDasharray={`${(operatingPercentage * 502) / 100} 502`}
                strokeLinecap="round"
              />

              {/* Total Hours (Green) */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#10B981"
                strokeWidth="20"
                strokeDasharray={`${(totalPercentage * 502) / 100} 502`}
                strokeDashoffset={-((operatingPercentage * 502) / 100)}
                strokeLinecap="round"
              />

              {/* Remaining Hours (Orange) */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="20"
                strokeDasharray={`${(remainingPercentage * 502) / 100} 502`}
                strokeDashoffset={-(((operatingPercentage + totalPercentage) * 502) / 100)}
                strokeLinecap="round"
              />

              {/* Not Spent (Red) */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#EF4444"
                strokeWidth="20"
                strokeDasharray={`${(notSpentPercentage * 502) / 100} 502`}
                strokeDashoffset={-(((operatingPercentage + totalPercentage + remainingPercentage) * 502) / 100)}
                strokeLinecap="round"
              />
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold">{data.totalHours}</div>
              <div className="text-sm text-muted-foreground">hrs out of {total}</div>
            </div>
          </div>

          {/* Legend */}
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#4F46E5]" />
                <span className="text-sm">Operating Hours</span>
              </div>
              <span className="text-sm font-medium">{data.operatingHours} hrs</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                <span className="text-sm">Total Hours</span>
              </div>
              <span className="text-sm font-medium">{data.totalHours} hrs</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <span className="text-sm">Remaining Hours</span>
              </div>
              <span className="text-sm font-medium">{data.remainingHours} hrs</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <span className="text-sm">Less than not spent</span>
              </div>
              <span className="text-sm font-medium">{data.notSpent} hrs</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
