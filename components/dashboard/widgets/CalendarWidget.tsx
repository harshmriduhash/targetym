'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns'

interface SpecialDate {
  date: number
  type: 'payday' | 'holiday' | 'birthday' | 'leave' | 'anniversary'
}

interface CalendarWidgetProps {
  specialDates?: SpecialDate[]
}

const mockSpecialDates: SpecialDate[] = [
  { date: 8, type: 'holiday' },
  { date: 14, type: 'payday' },
  { date: 17, type: 'birthday' },
  { date: 26, type: 'anniversary' },
]

const eventTypes = [
  { type: 'payday', label: 'Pay Days', color: 'bg-red-500' },
  { type: 'holiday', label: 'National Holiday', color: 'bg-blue-500' },
  { type: 'birthday', label: 'Birthdays', color: 'bg-yellow-500' },
  { type: 'leave', label: 'Leaves', color: 'bg-green-500' },
  { type: 'anniversary', label: 'Anniversaries', color: 'bg-cyan-500' },
]

export function CalendarWidget({ specialDates = mockSpecialDates }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = monthStart.getDay()

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getEventColor = (day: number): string | null => {
    const event = specialDates.find((sd) => sd.date === day)
    if (!event) return null

    const colorMap = {
      payday: 'bg-red-500',
      holiday: 'bg-blue-500',
      birthday: 'bg-yellow-500',
      leave: 'bg-green-500',
      anniversary: 'bg-cyan-500',
    }

    return colorMap[event.type]
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Add & View Events</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={previousMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <h3 className="font-semibold text-lg">
            {format(currentDate, 'MMMM yyyy')}
          </h3>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Calendar days */}
          {daysInMonth.map((day) => {
            const dayNumber = day.getDate()
            const eventColor = getEventColor(dayNumber)
            const isCurrentDay = isToday(day)

            return (
              <div
                key={day.toISOString()}
                className={`
                  aspect-square flex items-center justify-center rounded-lg text-sm
                  relative cursor-pointer transition-colors
                  ${isCurrentDay ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-accent'}
                  ${!isSameMonth(day, currentDate) ? 'text-muted-foreground' : ''}
                `}
              >
                <span className="relative z-10">{dayNumber}</span>
                {eventColor && (
                  <div
                    className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${eventColor}`}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="space-y-2 pt-4 border-t">
          {eventTypes.map((event) => (
            <div key={event.type} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${event.color}`} />
              <span className="text-xs text-muted-foreground">{event.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
