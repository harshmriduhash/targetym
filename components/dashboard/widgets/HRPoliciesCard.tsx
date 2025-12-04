'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, ExternalLink } from 'lucide-react'

interface PolicyDocument {
  id: string
  title: string
  date: string
  url?: string
}

interface HRPoliciesCardProps {
  documents?: PolicyDocument[]
  onDownload?: (id: string) => void
  onOpenBrowser?: () => void
}

const mockDocuments: PolicyDocument[] = [
  {
    id: '1',
    title: 'Attendance policy',
    date: '15-Oct-23',
    url: '/policies/attendance-policy.pdf'
  },
  {
    id: '2',
    title: 'IHRM policy',
    date: '15-Oct-23',
    url: '/policies/ihrm-policy.pdf'
  },
]

export function HRPoliciesCard({
  documents = mockDocuments,
  onDownload,
  onOpenBrowser
}: HRPoliciesCardProps) {
  const handleDownload = (id: string) => {
    if (onDownload) {
      onDownload(id)
    } else {
      // Default behavior: simulate download
      const doc = documents.find(d => d.id === id)
      console.log(`Downloading policy: ${doc?.title}`)
    }
  }

  const handleOpenBrowser = () => {
    if (onOpenBrowser) {
      onOpenBrowser()
    } else {
      // Default behavior: open policies page
      window.open('/policies', '_blank')
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <CardTitle className="text-base sm:text-lg">HR Policies</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenBrowser}
            className="text-primary hover:text-primary text-xs sm:text-sm"
          >
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">Open in Browser</span>
            <span className="sm:hidden">Browser</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5 sm:space-y-2">
          {documents.map((document) => (
            <div
              key={document.id}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              {/* PDF Icon */}
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-[8px] sm:text-[9px] font-bold text-white">PDF</span>
                </div>
              </div>

              {/* Document Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">
                  {document.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {document.date}
                </p>
              </div>

              {/* Download Button */}
              <Button
                size="sm"
                onClick={() => handleDownload(document.id)}
                className="flex-shrink-0 w-full sm:w-auto"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Download
              </Button>
            </div>
          ))}
        </div>

        {documents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No policy documents available</p>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-muted/50">
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            All employees are required to read and acknowledge these policies.
            Contact HR if you have any questions.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
