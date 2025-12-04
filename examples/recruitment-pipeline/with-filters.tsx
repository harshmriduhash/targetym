/**
 * Example: Advanced Candidate Filtering
 *
 * Shows how to implement comprehensive candidate filtering
 * with multiple criteria and saved filter presets.
 *
 * @package recruitment-pipeline
 */

'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCandidates } from '@/src/actions/recruitment'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { CandidatesList } from '@/public/registry/recruitment-pipeline/files/components/recruitment'
import { Filter, Save, X, Star } from 'lucide-react'

interface FilterPreset {
  name: string
  filters: {
    status?: string
    current_stage?: string
    min_rating?: number
    ai_cv_score_min?: number
  }
}

export default function AdvancedCandidateFiltersExample() {
  const [filters, setFilters] = useState<any>({})
  const [minAiScore, setMinAiScore] = useState<number[]>([0])
  const [minRating, setMinRating] = useState<number[]>([0])

  // Predefined filter presets
  const filterPresets: FilterPreset[] = [
    {
      name: 'Top Candidates',
      filters: {
        ai_cv_score_min: 80,
        status: 'interviewing',
      }
    },
    {
      name: 'Needs Review',
      filters: {
        status: 'screening',
        current_stage: 'application_review',
      }
    },
    {
      name: 'High Priority',
      filters: {
        min_rating: 4,
        status: 'interviewing',
      }
    },
    {
      name: 'Final Stage',
      filters: {
        current_stage: 'final_interview',
        status: 'interviewing',
      }
    },
  ]

  const applyPreset = (preset: FilterPreset) => {
    setFilters(preset.filters)
    if (preset.filters.ai_cv_score_min) {
      setMinAiScore([preset.filters.ai_cv_score_min])
    }
    if (preset.filters.min_rating) {
      setMinRating([preset.filters.min_rating])
    }
  }

  const clearAllFilters = () => {
    setFilters({})
    setMinAiScore([0])
    setMinRating([0])
  }

  const activeFilterCount = Object.keys(filters).length

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Advanced Candidate Filtering</h1>
        <p className="text-muted-foreground mt-2">
          Filter candidates using multiple criteria and saved presets
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary">{activeFilterCount}</Badge>
                  )}
                </CardTitle>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filter Presets */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Quick Filters
                </Label>
                <div className="space-y-1">
                  {filterPresets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-sm"
                      onClick={() => applyPreset(preset)}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) =>
                    setFilters((prev: any) => ({
                      ...prev,
                      status: value === 'all' ? undefined : value,
                    }))
                  }
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="interviewing">Interviewing</SelectItem>
                    <SelectItem value="offered">Offered</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stage Filter */}
              <div className="space-y-2">
                <Label htmlFor="stage-filter">Current Stage</Label>
                <Select
                  value={filters.current_stage || 'all'}
                  onValueChange={(value) =>
                    setFilters((prev: any) => ({
                      ...prev,
                      current_stage: value === 'all' ? undefined : value,
                    }))
                  }
                >
                  <SelectTrigger id="stage-filter">
                    <SelectValue placeholder="All stages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value="application_review">Application Review</SelectItem>
                    <SelectItem value="phone_screen">Phone Screen</SelectItem>
                    <SelectItem value="technical_interview">Technical Interview</SelectItem>
                    <SelectItem value="final_interview">Final Interview</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rating Filter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Minimum Rating</Label>
                  <Badge variant="outline" className="gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {minRating[0]}/5
                  </Badge>
                </div>
                <Slider
                  value={minRating}
                  onValueChange={(value) => {
                    setMinRating(value)
                    setFilters((prev: any) => ({
                      ...prev,
                      min_rating: value[0] > 0 ? value[0] : undefined,
                    }))
                  }}
                  max={5}
                  step={0.5}
                  className="w-full"
                />
              </div>

              {/* AI Score Filter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Minimum AI Score</Label>
                  <Badge variant="secondary">{minAiScore[0]}/100</Badge>
                </div>
                <Slider
                  value={minAiScore}
                  onValueChange={(value) => {
                    setMinAiScore(value)
                    setFilters((prev: any) => ({
                      ...prev,
                      ai_cv_score_min: value[0] > 0 ? value[0] : undefined,
                    }))
                  }}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Search by Name/Email */}
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Name or email..."
                  onChange={(e) =>
                    setFilters((prev: any) => ({
                      ...prev,
                      search: e.target.value || undefined,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Candidates List */}
        <div className="lg:col-span-3">
          <CandidatesList initialFilters={filters} />
        </div>
      </div>
    </div>
  )
}

/**
 * Advanced Filtering Features:
 *
 * 1. Filter Presets:
 *    - Predefined filter combinations for common scenarios
 *    - One-click application
 *    - Easily extendable for custom presets
 *
 * 2. Multi-Criteria Filtering:
 *    - Status (applied, screening, interviewing, etc.)
 *    - Current stage in pipeline
 *    - Rating threshold (manual ratings)
 *    - AI CV score threshold
 *    - Text search (name/email)
 *
 * 3. Interactive Controls:
 *    - Sliders for numeric ranges
 *    - Dropdowns for categorical filters
 *    - Search input for text queries
 *    - Visual filter count indicator
 *
 * 4. State Management:
 *    - React state for filter values
 *    - Filters passed to CandidatesList component
 *    - Clear all filters functionality
 *    - Preset synchronization
 *
 * 5. Use Cases:
 *    - Identify top candidates quickly
 *    - Find candidates needing review
 *    - Filter by interview stage
 *    - Combine multiple criteria for precise results
 *
 * 6. Performance Considerations:
 *    - Filters applied server-side via Server Actions
 *    - Debounce text search to reduce queries
 *    - React Query caching for repeated filters
 *    - Pagination built into CandidatesList
 */
