'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, FileText, AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface Discrepancy {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  date: string
  status: 'open' | 'resolved' | 'pending'
}

interface DiscrepanciesCardProps {
  discrepancies?: Discrepancy[]
}

const mockDiscrepancies: Discrepancy[] = [
  {
    id: '1',
    title: 'Attendance Mismatch',
    description: 'Time log discrepancy detected for 3 employees',
    severity: 'high',
    date: '2023-11-15',
    status: 'open',
  },
  {
    id: '2',
    title: 'Leave Balance Error',
    description: 'Incorrect leave balance calculation',
    severity: 'medium',
    date: '2023-11-14',
    status: 'pending',
  },
  {
    id: '3',
    title: 'Payroll Variance',
    description: 'Minor variance in overtime calculation',
    severity: 'low',
    date: '2023-11-13',
    status: 'resolved',
  },
]

const severityColors = {
  low: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30',
  medium: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30',
  high: 'text-red-600 bg-red-50 dark:bg-red-950/30',
}

const statusColors = {
  open: 'text-red-600 bg-red-50 dark:bg-red-950/30',
  pending: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30',
  resolved: 'text-green-600 bg-green-50 dark:bg-green-950/30',
}

export function DiscrepanciesCard({ discrepancies = mockDiscrepancies }: DiscrepanciesCardProps) {
  const [format, setFormat] = useState('pdf')

  const handleDownload = () => {
    // Simulate download
    console.log(`Downloading discrepancies report in ${format} format`)
    // In real implementation, trigger actual file download
  }

  const openCount = discrepancies.filter(d => d.status === 'open').length

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Discrepancies
          </CardTitle>
          {openCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/30">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span className="text-xs font-medium text-red-700 dark:text-red-400">
                {openCount} Open
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Document Preview */}
        <div className="mb-4 p-4 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <FileText className="h-16 w-16 text-muted-foreground/50" />
            <div>
              <h4 className="font-semibold text-sm">Discrepancies Report</h4>
              <p className="text-xs text-muted-foreground mt-1">
                November 2023
              </p>
            </div>
          </div>
        </div>

        {/* Format Selector */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">Format:</span>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF Format</SelectItem>
              <SelectItem value="word">Word Format</SelectItem>
              <SelectItem value="excel">Excel Format</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Download Button */}
        <Button
          onClick={handleDownload}
          className="w-full mb-4"
          variant="default"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>

        {/* Discrepancies List */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
            Recent Issues
          </h4>
          {discrepancies.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-1.5">
                <h5 className="font-medium text-sm line-clamp-1">{item.title}</h5>
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-medium capitalize
                  ${statusColors[item.status]}
                `}>
                  {item.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {item.description}
              </p>
              <div className="flex items-center justify-between">
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-medium capitalize
                  ${severityColors[item.severity]}
                `}>
                  {item.severity}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        {discrepancies.length > 3 && (
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" className="text-xs">
              View All ({discrepancies.length} total)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
