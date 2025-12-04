'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Briefcase, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface JobPosting {
  id: string
  title: string
  positions: number
  department: string
  location?: string
  type?: 'full-time' | 'part-time' | 'contract'
  postedDate?: Date
}

interface NewJobsTableProps {
  jobs?: JobPosting[]
  onViewAll?: () => void
}

const mockJobs: JobPosting[] = [
  {
    id: '1',
    title: 'UI UX Designer',
    positions: 2,
    department: 'Creative Department',
    location: 'Remote',
    type: 'full-time',
    postedDate: new Date('2023-10-20'),
  },
  {
    id: '2',
    title: 'Sr. Software Architect',
    positions: 1,
    department: 'Development Department',
    location: 'San Francisco, CA',
    type: 'full-time',
    postedDate: new Date('2023-10-18'),
  },
  {
    id: '3',
    title: 'Product Manager',
    positions: 1,
    department: 'Product Department',
    location: 'New York, NY',
    type: 'full-time',
    postedDate: new Date('2023-10-15'),
  },
  {
    id: '4',
    title: 'Marketing Specialist',
    positions: 3,
    department: 'Marketing Department',
    location: 'Hybrid',
    type: 'full-time',
    postedDate: new Date('2023-10-22'),
  },
]

function getJobTypeBadge(type?: string) {
  if (!type) return null

  const variants = {
    'full-time': 'bg-green-100 text-green-800 hover:bg-green-100',
    'part-time': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    'contract': 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  }

  const labels = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    'contract': 'Contract',
  }

  return (
    <Badge variant="secondary" className={variants[type as keyof typeof variants]}>
      {labels[type as keyof typeof labels]}
    </Badge>
  )
}

export function NewJobsTable({ jobs = mockJobs, onViewAll }: NewJobsTableProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5 text-primary" />
            New Jobs
          </CardTitle>
          {onViewAll ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="text-primary hover:text-primary"
            >
              View All
            </Button>
          ) : (
            <Link href="/dashboard/recruitment">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary"
              >
                View All
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5 sm:space-y-2">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/dashboard/recruitment/jobs/${job.id}`}
              className="block"
            >
              <div className="group p-2 sm:p-3 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/50 transition-all cursor-pointer">
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-1.5 mb-1 sm:mb-1.5">
                      <h4 className="font-semibold text-xs sm:text-sm truncate group-hover:text-primary transition-colors">
                        {job.title}
                      </h4>
                      <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                    </div>

                    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                        <span className="font-medium text-primary">
                          {job.positions}
                        </span>
                        {job.positions === 1 ? 'Position' : 'Positions'}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="truncate">{job.department}</span>
                      {job.location && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="truncate">{job.location}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Job Type Badge */}
                  {job.type && (
                    <div className="flex-shrink-0 self-start">
                      {getJobTypeBadge(job.type)}
                    </div>
                  )}
                </div>

                {/* Posted Date */}
                {job.postedDate && (
                  <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Posted {Math.floor((new Date().getTime() - job.postedDate.getTime()) / (1000 * 60 * 60 * 24))} days ago
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No job openings at the moment</p>
          </div>
        )}

        {/* Summary */}
        {jobs.length > 0 && (
          <div className="mt-2 sm:mt-3 p-2 sm:p-3 rounded-lg bg-muted/50">
            <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
              <span className="font-medium text-foreground">
                {jobs.reduce((sum, job) => sum + job.positions, 0)}
              </span>{' '}
              total positions available across{' '}
              <span className="font-medium text-foreground">
                {jobs.length}
              </span>{' '}
              {jobs.length === 1 ? 'role' : 'roles'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
