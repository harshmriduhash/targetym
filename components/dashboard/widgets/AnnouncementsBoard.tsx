'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Megaphone, Newspaper, Calendar } from 'lucide-react'
import { format } from 'date-fns'

type AnnouncementType = 'internal' | 'industry' | 'calendar'

interface Announcement {
  id: string
  type: AnnouncementType
  title: string
  date: Date
  description?: string
}

interface AnnouncementsBoardProps {
  announcements?: Announcement[]
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    type: 'internal',
    title: 'Q4 Company Meeting - All Hands',
    date: new Date('2023-10-09'),
    description: 'Join us for quarterly review and planning session'
  },
  {
    id: '2',
    type: 'industry',
    title: 'New HR Compliance Regulations 2024',
    date: new Date('2023-10-12'),
    description: 'Important updates on employment law changes'
  },
  {
    id: '3',
    type: 'calendar',
    title: 'Team Building Event - November',
    date: new Date('2023-10-15'),
    description: 'Save the date for our annual team building activity'
  },
  {
    id: '4',
    type: 'internal',
    title: 'New Office Hours Policy',
    date: new Date('2023-10-18'),
    description: 'Updated flexible working hours guidelines'
  },
  {
    id: '5',
    type: 'industry',
    title: 'Tech Industry Salary Trends Report',
    date: new Date('2023-10-20'),
    description: 'Latest market insights and compensation analysis'
  },
]

function getAnnouncementIcon(type: AnnouncementType) {
  const icons = {
    internal: <Megaphone className="w-4 h-4 text-blue-500" />,
    industry: <Newspaper className="w-4 h-4 text-purple-500" />,
    calendar: <Calendar className="w-4 h-4 text-green-500" />,
  }
  return icons[type]
}

function getAnnouncementLabel(type: AnnouncementType) {
  const labels = {
    internal: 'Internal News',
    industry: 'Industry News',
    calendar: 'Calendar Event',
  }
  return labels[type]
}

export function AnnouncementsBoard({
  announcements = mockAnnouncements,
  onView,
  onEdit,
  onDelete
}: AnnouncementsBoardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base sm:text-lg truncate">Announcements & Notice Board</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Add New Announcement</DropdownMenuItem>
              <DropdownMenuItem>Manage Categories</DropdownMenuItem>
              <DropdownMenuItem>View Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5 sm:space-y-2">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="group relative rounded-lg border bg-card p-2 sm:p-3 hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-1.5 sm:gap-2">
                {/* Icon */}
                <div className="mt-0.5 flex-shrink-0">
                  {getAnnouncementIcon(announcement.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-0.5 sm:gap-1">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs sm:text-sm line-clamp-2">
                        {announcement.title}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                        {getAnnouncementLabel(announcement.type)}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                      {format(announcement.date, 'dd-MMM-yyyy')}
                    </span>
                  </div>

                  {announcement.description && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-1.5 line-clamp-2">
                      {announcement.description}
                    </p>
                  )}
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                      <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onView?.(announcement.id)}
                    >
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onEdit?.(announcement.id)}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(announcement.id)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>

        {announcements.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No announcements yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
