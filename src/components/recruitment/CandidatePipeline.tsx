'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Mail, Phone } from 'lucide-react'
import type { Candidate } from '@/src/types/database.types'

interface CandidatePipelineProps {
  candidates: Candidate[]
  onSelectCandidate?: (candidate: Candidate) => void
}

export function CandidatePipeline({ candidates, onSelectCandidate }: CandidatePipelineProps) {
  const statusGroups = {
    applied: candidates.filter((c) => c.status === 'applied'),
    screening: candidates.filter((c) => c.status === 'screening'),
    interview: candidates.filter((c) => c.status === 'interview'),
    offer: candidates.filter((c) => c.status === 'offer'),
    hired: candidates.filter((c) => c.status === 'hired'),
    rejected: candidates.filter((c) => c.status === 'rejected'),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Candidate Pipeline
        </h2>
        <div className="text-sm text-muted-foreground">
          {candidates.length} total candidates
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(statusGroups).map(([status, group]) => (
          <Card key={status} className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium capitalize flex items-center justify-between">
                {status}
                <Badge variant="secondary">{group.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {group.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No candidates</p>
              ) : (
                group.map((candidate) => (
                  <Card
                    key={candidate.id}
                    className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onSelectCandidate?.(candidate)}
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{candidate.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{candidate.email}</span>
                      </div>
                      {candidate.phone && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{candidate.phone}</span>
                        </div>
                      )}
                      {candidate.ai_score && (
                        <Badge variant="outline" className="text-xs">
                          Score: {candidate.ai_score}/100
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
