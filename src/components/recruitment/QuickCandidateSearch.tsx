'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Filter, User } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCandidates } from '@/src/lib/react-query/hooks/use-recruitment'
import { cn } from '@/lib/utils'

interface Candidate {
  id: string
  name: string
  email: string
  phone?: string
  status: string
  job_posting?: {
    id: string
    title: string
  }
}

interface QuickCandidateSearchProps {
  onSelect: (candidate: Candidate) => void
  onCreateNew: () => void
  placeholder?: string
  className?: string
}

export function QuickCandidateSearch({
  onSelect,
  onCreateNew,
  placeholder = 'Rechercher ou créer un candidat...',
  className,
}: QuickCandidateSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  // Fetch candidates avec debounce sur la recherche
  const { data: candidatesResponse, isLoading } = useCandidates({}, { page: 1, pageSize: 50 })
  const candidates = candidatesResponse?.data || []

  // Filtrer localement pour une recherche instantanée
  const filteredCandidates = candidates.filter((candidate) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      candidate.name.toLowerCase().includes(term) ||
      candidate.email.toLowerCase().includes(term) ||
      candidate.phone?.toLowerCase().includes(term) ||
      candidate.job_posting?.title.toLowerCase().includes(term)
    )
  })

  // Grouper par statut
  const groupedCandidates = filteredCandidates.reduce((acc, candidate) => {
    const status = candidate.status
    if (!acc[status]) {
      acc[status] = []
    }
    acc[status].push(candidate)
    return acc
  }, {} as Record<string, Candidate[]>)

  const statusLabels: Record<string, string> = {
    new: 'Nouveaux',
    screening: 'En sélection',
    interviewing: 'En entretien',
    offer: 'Offre envoyée',
    hired: 'Embauchés',
    rejected: 'Refusés',
  }

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    onSelect(candidate)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          {selectedCandidate ? (
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {selectedCandidate.name}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[500px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Rechercher par nom, email, téléphone..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />

          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
              </div>
            ) : (
              <>
                <CommandEmpty>
                  <div className="py-6 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Aucun candidat trouvé pour "{searchTerm}"
                    </p>
                    <Button size="sm" onClick={onCreateNew}>
                      <Plus className="mr-2 h-4 w-4" />
                      Créer un nouveau candidat
                    </Button>
                  </div>
                </CommandEmpty>

                {/* Bouton créer en haut */}
                <CommandGroup>
                  <CommandItem onSelect={onCreateNew} className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4 text-primary" />
                    <span className="font-medium text-primary">
                      Créer un nouveau candidat
                    </span>
                  </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                {/* Candidats groupés par statut */}
                {Object.entries(groupedCandidates).map(([status, statusCandidates]) => (
                  <CommandGroup key={status} heading={statusLabels[status] || status}>
                    {statusCandidates.map((candidate) => (
                      <CommandItem
                        key={candidate.id}
                        onSelect={() => handleSelectCandidate(candidate)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{candidate.name}</span>
                            </div>
                            <div className="text-xs text-gray-500 ml-6">
                              {candidate.email}
                              {candidate.job_posting && (
                                <>
                                  {' • '}
                                  <span className="text-blue-600">
                                    {candidate.job_posting.title}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {status}
                          </Badge>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
