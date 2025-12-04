/**
 * AI Service Types
 *
 * Types for Vercel AI SDK integration with Anthropic Claude and OpenAI
 */

// ============================================================================
// CV Scoring Types
// ============================================================================

export interface CVScoringResult {
  score: number // 0-100
  summary: string
  strengths: string[]
  concerns: string[]
  recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no'
  matchPercentage: number
  detailedAnalysis: {
    skillsMatch: number
    experienceMatch: number
    educationMatch: number
    culturalFit: number
  }
  improvementSuggestions?: string[]
  aiModel: 'claude-3-5-sonnet' | 'gpt-4o'
  processingTime: number // milliseconds
}

export interface CVScoringInput {
  cvText: string
  jobDescription: string
  requirements: string[]
  candidateId: string
  jobPostingId: string
}

// ============================================================================
// Performance Synthesis Types
// ============================================================================

export interface PerformanceReviewData {
  rating: number
  strengths: string[]
  improvements: string[]
  date: string
}

export interface PerformanceSynthesisResult {
  overallTrend: 'improving' | 'stable' | 'declining'
  averageRating: number
  keyStrengths: string[]
  criticalImprovementAreas: string[]
  recommendations: string[]
  careerTrajectory: string
  nextSteps: string[]
  aiInsights: string
  aiModel: 'claude-3-5-sonnet' | 'gpt-4o'
  processingTime: number
}

export interface PerformanceSynthesisInput {
  employeeId: string
  reviews: PerformanceReviewData[]
  employeeName: string
  currentRole: string
}

// ============================================================================
// Career Recommendation Types
// ============================================================================

export interface CareerRecommendation {
  suggestedRoles: Array<{
    title: string
    match: number // 0-100
    reasoning: string
    requiredSkills: string[]
    timeline: string // e.g., "6-12 months"
  }>
  skillGaps: Array<{
    skill: string
    currentLevel: string
    targetLevel: string
    learningResources: string[]
  }>
  developmentPlan: {
    shortTerm: string[] // 0-6 months
    mediumTerm: string[] // 6-18 months
    longTerm: string[] // 18+ months
  }
  mentorshipSuggestions: string[]
  estimatedTimeToPromotion: string
  aiInsights: string
  aiModel: 'claude-3-5-sonnet' | 'gpt-4o'
  processingTime: number
}

export interface CareerRecommendationInput {
  employeeId: string
  currentRole: string
  skills: string[]
  performanceSummary: string
  interests: string[]
  employeeName: string
}

// ============================================================================
// Chat Types (Conversational AI)
// ============================================================================

export interface AIChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    model?: string
    tokens?: number
    cost?: number
  }
}

export interface AIChatContext {
  organizationId: string
  userId: string
  userName: string
  userRole: 'admin' | 'manager' | 'hr' | 'employee'
  conversationTopic: 'goals' | 'performance' | 'recruitment' | 'general'
}

// ============================================================================
// AI Configuration Types
// ============================================================================

export interface AIConfig {
  provider: 'anthropic' | 'openai'
  model: string
  temperature: number
  maxTokens: number
  streaming: boolean
}

export const AI_MODELS = {
  ANTHROPIC: {
    CLAUDE_3_5_SONNET: 'claude-3-5-sonnet-20241022',
    CLAUDE_3_OPUS: 'claude-3-opus-20240229',
    CLAUDE_3_HAIKU: 'claude-3-haiku-20240307',
  },
  OPENAI: {
    GPT_4O: 'gpt-4o',
    GPT_4O_MINI: 'gpt-4o-mini',
    GPT_4_TURBO: 'gpt-4-turbo-preview',
  },
} as const

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'anthropic',
  model: AI_MODELS.ANTHROPIC.CLAUDE_3_5_SONNET,
  temperature: 0.7,
  maxTokens: 4096,
  streaming: true,
}

// ============================================================================
// Error Types
// ============================================================================

export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: 'API_KEY_MISSING' | 'RATE_LIMIT' | 'INVALID_INPUT' | 'API_ERROR' | 'TIMEOUT',
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'AIServiceError'
  }
}

// ============================================================================
// Streaming Types
// ============================================================================

export interface StreamingChunk {
  type: 'text' | 'data' | 'error' | 'done'
  content: string
  metadata?: Record<string, unknown>
}

export interface StreamingOptions {
  onStart?: () => void
  onToken?: (token: string) => void
  onComplete?: (fullText: string) => void
  onError?: (error: Error) => void
}
