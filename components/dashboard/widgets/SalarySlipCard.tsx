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
import { FileText, Download } from 'lucide-react'
import { useState } from 'react'

interface SalarySlipCardProps {
  onDownload?: (month: string) => void
}

export function SalarySlipCard({ onDownload }: SalarySlipCardProps) {
  const [selectedMonth, setSelectedMonth] = useState('october-2023')

  const months = [
    { value: 'october-2023', label: 'October 2023', display: 'Oct-2023' },
    { value: 'september-2023', label: 'September 2023', display: 'Sep-2023' },
    { value: 'august-2023', label: 'August 2023', display: 'Aug-2023' },
    { value: 'july-2023', label: 'July 2023', display: 'Jul-2023' },
  ]

  const currentMonth = months.find(m => m.value === selectedMonth)

  const handleDownload = () => {
    if (onDownload) {
      onDownload(selectedMonth)
    } else {
      // Default behavior: simulate download
      console.log(`Downloading salary slip for ${selectedMonth}`)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Salary Slip</CardTitle>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-6 py-8">
          {/* PDF Icon */}
          <div className="relative">
            <div className="w-24 h-24 rounded-lg bg-red-50 flex items-center justify-center">
              <FileText className="w-12 h-12 text-red-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">PDF</span>
            </div>
          </div>

          {/* Slip Info */}
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Salary-Slip of {currentMonth?.display}
            </p>
          </div>

          {/* Download Button */}
          <Button onClick={handleDownload} className="w-full max-w-xs">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
