'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, TrendingUp } from 'lucide-react'

interface CareerLevel {
  id: string
  title: string
  description: string
  progress: number // 0-100
  color: string
}

interface CareerLadderChartProps {
  levels?: CareerLevel[]
  onViewDetails?: (id: string) => void
}

const mockLevels: CareerLevel[] = [
  {
    id: '1',
    title: 'Junior Developer',
    description: 'Entry-level position focusing on learning and basic tasks',
    progress: 100,
    color: 'bg-blue-500',
  },
  {
    id: '2',
    title: 'Mid-level Developer',
    description: 'Intermediate role with independent project ownership',
    progress: 75,
    color: 'bg-green-500',
  },
  {
    id: '3',
    title: 'Senior Developer',
    description: 'Advanced technical skills with mentorship responsibilities',
    progress: 45,
    color: 'bg-pink-500',
  },
  {
    id: '4',
    title: 'Lead Developer',
    description: 'Team leadership and architectural decision making',
    progress: 20,
    color: 'bg-orange-500',
  },
  {
    id: '5',
    title: 'Principal Engineer',
    description: 'Strategic technical direction and cross-team influence',
    progress: 10,
    color: 'bg-purple-500',
  },
]

export function CareerLadderChart({
  levels = mockLevels,
  onViewDetails
}: CareerLadderChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Career Ladder
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Career Path</DropdownMenuItem>
              <DropdownMenuItem>Set Goals</DropdownMenuItem>
              <DropdownMenuItem>Request Feedback</DropdownMenuItem>
              <DropdownMenuItem>Export Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {levels.map((level, index) => (
            <div
              key={level.id}
              className="group cursor-pointer"
              onClick={() => onViewDetails?.(level.id)}
            >
              {/* Level Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${level.color}`} />
                  <h4 className="font-semibold text-sm">{level.title}</h4>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {level.progress}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative h-8 bg-muted rounded-lg overflow-hidden mb-2">
                <div
                  className={`h-full ${level.color} transition-all duration-500 ease-out`}
                  style={{ width: `${level.progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                </div>

                {/* Progress Label */}
                <div className="absolute inset-0 flex items-center px-3">
                  <span className="text-xs font-medium text-foreground/80">
                    Level {index + 1}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground pl-4">
                {level.description}
              </p>

              {/* Divider (except for last item) */}
              {index < levels.length - 1 && (
                <div className="mt-4 border-b" />
              )}
            </div>
          ))}
        </div>

        {/* Career Progress Summary */}
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-sm">Career Progress</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            You're currently at{' '}
            <span className="font-medium text-foreground">
              {levels.find(l => l.progress >= 50)?.title || levels[0].title}
            </span>
            . Keep up the great work to advance to the next level!
          </p>
        </div>

        {/* Next Steps */}
        <div className="mt-4 space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase">
            Next Steps
          </h4>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Complete 2 more projects as technical lead</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Mentor 1-2 junior team members</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Achieve 90%+ in next performance review</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
