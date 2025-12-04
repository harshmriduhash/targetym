'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Cake, Gift } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'

type EventType = 'birthday' | 'anniversary'

interface BirthdayEvent {
  id: string
  name: string
  role: string
  date: Date
  type: EventType
  avatar?: string
  yearsOfService?: number // For anniversaries
}

interface BirthdaysCardProps {
  events?: BirthdayEvent[]
}

const mockEvents: BirthdayEvent[] = [
  {
    id: '1',
    name: 'Umair Ali',
    role: 'Sr. Accountant & Finance',
    date: new Date('2023-11-17'),
    type: 'birthday',
  },
  {
    id: '2',
    name: 'Hassan Hussain',
    role: 'UX Designer',
    date: new Date('2023-11-17'),
    type: 'birthday',
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    role: 'Product Manager',
    date: new Date('2023-11-20'),
    type: 'anniversary',
    yearsOfService: 3,
  },
  {
    id: '4',
    name: 'Mike Chen',
    role: 'Software Engineer',
    date: new Date('2023-11-22'),
    type: 'birthday',
  },
  {
    id: '5',
    name: 'Emily Davis',
    role: 'Marketing Director',
    date: new Date('2023-11-25'),
    type: 'anniversary',
    yearsOfService: 5,
  },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-cyan-500',
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

export function BirthdaysCard({ events = mockEvents }: BirthdaysCardProps) {
  const [period, setPeriod] = useState('weekly')

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Birthdays & Anniversaries</CardTitle>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              {/* Avatar with Icon Overlay */}
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={event.avatar} alt={event.name} />
                  <AvatarFallback className={`${getAvatarColor(event.name)} text-white font-semibold`}>
                    {getInitials(event.name)}
                  </AvatarFallback>
                </Avatar>
                {/* Event Type Icon */}
                <div className={`
                  absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center
                  ${event.type === 'birthday' ? 'bg-pink-500' : 'bg-purple-500'}
                `}>
                  {event.type === 'birthday' ? (
                    <Cake className="w-3 h-3 text-white" />
                  ) : (
                    <Gift className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-1">
                  {event.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {event.role}
                </p>
                {event.type === 'anniversary' && event.yearsOfService && (
                  <p className="text-xs text-muted-foreground">
                    {event.yearsOfService} {event.yearsOfService === 1 ? 'year' : 'years'} with us
                  </p>
                )}
              </div>

              {/* Date */}
              <div className="text-right">
                <p className="text-sm font-medium">
                  {format(event.date, 'd MMM')}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {event.type}
                </p>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Cake className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No upcoming events this {period}</p>
          </div>
        )}

        {/* Summary */}
        {events.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground text-center">
              {events.filter(e => e.type === 'birthday').length} birthdays and{' '}
              {events.filter(e => e.type === 'anniversary').length} anniversaries this {period}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
