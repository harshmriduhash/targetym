'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mail, Phone } from 'lucide-react'
import Link from 'next/link'

interface TeamMember {
  id: string
  name: string
  role: string
  department: string
  email: string
  phone?: string
  avatar?: string
}

interface MyTeamCardProps {
  members?: TeamMember[]
  onViewAll?: () => void
}

const mockMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Li Jinquan',
    role: 'Front-end Developer',
    department: 'Development',
    email: 'li.jinquan@targetym.com',
    phone: '+1 234 567 8901',
  },
  {
    id: '2',
    name: 'M Marissa',
    role: 'UI UX Designer',
    department: 'Design',
    email: 'm.marissa@targetym.com',
    phone: '+1 234 567 8902',
  },
  {
    id: '3',
    name: 'Ainara',
    role: 'HR Manager',
    department: 'Human Resources',
    email: 'ainara@targetym.com',
    phone: '+1 234 567 8903',
  },
  {
    id: '4',
    name: 'Aimes',
    role: 'Accountant',
    department: 'Finance',
    email: 'aimes@targetym.com',
    phone: '+1 234 567 8904',
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

export function MyTeamCard({ members = mockMembers, onViewAll }: MyTeamCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">My Team</CardTitle>
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
            <Link href="/dashboard/team">
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
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              {/* Avatar */}
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className={`${getAvatarColor(member.name)} text-white font-semibold text-[10px] sm:text-xs`}>
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-xs sm:text-sm truncate">
                  {member.name}
                </h4>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                  {member.role}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                  {member.department}
                </p>
              </div>

              {/* Contact Actions */}
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 sm:h-7 sm:w-7"
                  asChild
                >
                  <a href={`mailto:${member.email}`} title={`Email ${member.name}`}>
                    <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </a>
                </Button>
                {member.phone && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 sm:h-7 sm:w-7"
                    asChild
                  >
                    <a href={`tel:${member.phone}`} title={`Call ${member.name}`}>
                      <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {members.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No team members found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
