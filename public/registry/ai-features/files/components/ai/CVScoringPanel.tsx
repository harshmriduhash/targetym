'use client'

/**
 * CV Scoring Panel Component
 *
 * Display AI-powered CV scoring results with detailed analysis
 *
 * Features:
 * - Visual score display (0-100)
 * - Detailed breakdown (skills, experience, education, cultural fit)
 * - Strengths and concerns
 * - Actionable recommendations
 * - Loading states
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Brain,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import type { CVScoringResult } from '@/src/types/ai.types'

interface CVScoringPanelProps {
  candidateId: string
  candidateName: string
  onScoreComplete?: (result: CVScoringResult) => void
}

export function CVScoringPanel({
  candidateId,
  candidateName,
  onScoreComplete,
}: CVScoringPanelProps) {
  const [isScoring, setIsScoring] = useState(false)
  const [result, setResult] = useState<CVScoringResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleScore = async () => {
    setIsScoring(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/score-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to score CV')
      }

      const { data } = await response.json()
      setResult(data)
      onScoreComplete?.(data)

      toast.success('CV Scored Successfully', {
        description: `Score: ${data.score}/100 - ${data.recommendation}`,
      })

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to score CV'
      setError(errorMessage)
      toast.error('Scoring Failed', {
        description: errorMessage,
      })
    } finally {
      setIsScoring(false)
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_yes':
        return 'bg-green-500'
      case 'yes':
        return 'bg-blue-500'
      case 'maybe':
        return 'bg-yellow-500'
      case 'no':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI CV Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Automated scoring and insights for {candidateName}
          </p>
        </div>
        <Button
          onClick={handleScore}
          disabled={isScoring}
          className="gap-2"
        >
          {isScoring ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4" />
              Score CV with AI
            </>
          )}
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <div>
              <p className="font-medium text-destructive">Scoring Failed</p>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Overall Score */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                  {result.score}/100
                </p>
              </div>
              <Badge
                className={`${getRecommendationColor(result.recommendation)} text-white`}
              >
                {result.recommendation.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            <Progress value={result.score} className="h-3" />

            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {result.processingTime}ms
              </div>
              <div className="flex items-center gap-1">
                <Brain className="h-4 w-4" />
                {result.aiModel}
              </div>
            </div>
          </Card>

          {/* Summary */}
          <Card className="p-6">
            <h4 className="font-semibold mb-2">Summary</h4>
            <p className="text-sm text-muted-foreground">{result.summary}</p>
          </Card>

          {/* Detailed Analysis */}
          <Card className="p-6">
            <h4 className="font-semibold mb-4">Detailed Breakdown</h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(result.detailedAnalysis).map(([key, value]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <span className={`text-sm font-bold ${getScoreColor(value)}`}>
                      {value}%
                    </span>
                  </div>
                  <Progress value={value} className="h-2" />
                </div>
              ))}
            </div>
          </Card>

          {/* Strengths */}
          {result.strengths.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">Strengths</h4>
              </div>
              <ul className="space-y-2">
                {result.strengths.map((strength, index) => (
                  <li key={index} className="text-sm flex gap-2">
                    <span className="text-green-600">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Concerns */}
          {result.concerns.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <h4 className="font-semibold">Areas of Concern</h4>
              </div>
              <ul className="space-y-2">
                {result.concerns.map((concern, index) => (
                  <li key={index} className="text-sm flex gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>{concern}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Improvement Suggestions */}
          {result.improvementSuggestions && result.improvementSuggestions.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold">Recommendations</h4>
              </div>
              <ul className="space-y-2">
                {result.improvementSuggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm flex gap-2">
                    <span className="text-blue-600">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Match Percentage */}
          <Card className="p-6 bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Job Match</p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {result.matchPercentage}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  How well this candidate matches the role
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
