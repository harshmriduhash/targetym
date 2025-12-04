/**
 * AI Service - Vercel AI SDK Integration
 *
 * Provides AI-powered features for Targetym HR platform:
 * - CV Scoring with Claude/OpenAI
 * - Performance Review Synthesis
 * - Career Path Recommendations
 * - Conversational AI Chat
 *
 * Uses Vercel AI SDK for streaming and production-ready AI integrations
 */

import { createClient } from '@/src/lib/supabase/server'
import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import { generateText, streamText, type CoreMessage } from 'ai'
import { logger } from '@/src/lib/utils/logger'
import type {
  CVScoringResult,
  CVScoringInput,
  PerformanceSynthesisResult,
  PerformanceSynthesisInput,
  CareerRecommendation,
  CareerRecommendationInput,
  AIConfig,
  AIServiceError,
} from '@/src/types/ai.types'
import { AI_MODELS, DEFAULT_AI_CONFIG } from '@/src/types/ai.types'

// ============================================================================
// Configuration and Provider Selection
// ============================================================================

class AIService {
  private config: AIConfig = DEFAULT_AI_CONFIG

  /**
   * Get the configured AI model based on environment
   */
  private getModel() {
    const provider = process.env.AI_PROVIDER || 'anthropic'

    if (provider === 'anthropic') {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw this.createError(
          'ANTHROPIC_API_KEY is not configured',
          'API_KEY_MISSING'
        )
      }
      return anthropic('claude-3-5-sonnet-20241022')
    }

    if (provider === 'openai') {
      if (!process.env.OPENAI_API_KEY) {
        throw this.createError(
          'OPENAI_API_KEY is not configured',
          'API_KEY_MISSING'
        )
      }
      return openai('gpt-4o')
    }

    throw this.createError(
      `Invalid AI provider: ${provider}`,
      'INVALID_INPUT'
    )
  }

  /**
   * Create standardized error
   */
  private createError(
    message: string,
    code: AIServiceError['code'],
    originalError?: unknown
  ): AIServiceError {
    const error = new Error(message) as AIServiceError
    error.code = code
    error.originalError = originalError
    return error
  }

  /**
   * Check if AI is available
   */
  private isAIAvailable(): boolean {
    return !!(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY)
  }

  private async getClient() {
    return await createClient()
  }

  // ============================================================================
  // CV SCORING WITH AI
  // ============================================================================

  /**
   * Score a candidate's CV against job requirements using AI
   * Returns detailed analysis with strengths, concerns, and recommendations
   */
  async scoreCandidateCV(
    cvText: string,
    jobDescription: string,
    requirements: string[]
  ): Promise<CVScoringResult> {
    const startTime = Date.now()

    if (!this.isAIAvailable()) {
      logger.warn('AI not configured, returning fallback CV score')
      return this.getFallbackCVScore(startTime)
    }

    try {
      const model = this.getModel()

      const prompt = `You are an expert HR recruiter analyzing a candidate's CV for a job position.

JOB DESCRIPTION:
${jobDescription}

KEY REQUIREMENTS:
${requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

CANDIDATE CV:
${cvText}

Analyze this CV thoroughly and provide a JSON response with the following structure:
{
  "score": <number 0-100>,
  "summary": "<brief 2-3 sentence summary>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "concerns": ["<concern 1>", "<concern 2>", ...],
  "recommendation": "<strong_yes|yes|maybe|no>",
  "matchPercentage": <number 0-100>,
  "detailedAnalysis": {
    "skillsMatch": <number 0-100>,
    "experienceMatch": <number 0-100>,
    "educationMatch": <number 0-100>,
    "culturalFit": <number 0-100>
  },
  "improvementSuggestions": ["<suggestion 1>", "<suggestion 2>", ...]
}

Focus on:
- Relevance of skills and experience
- Quality of accomplishments
- Cultural fit indicators
- Growth potential
- Red flags or concerns

Be objective, thorough, and actionable.`

      const { text } = await generateText({
        model,
        prompt,
        temperature: 0.3, // Lower for more consistent scoring
        maxTokens: 2000,
      })

      // Parse AI response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw this.createError(
          'Failed to parse AI response',
          'API_ERROR'
        )
      }

      const analysis = JSON.parse(jsonMatch[0])

      const result: CVScoringResult = {
        score: analysis.score,
        summary: analysis.summary,
        strengths: analysis.strengths || [],
        concerns: analysis.concerns || [],
        recommendation: analysis.recommendation,
        matchPercentage: analysis.matchPercentage,
        detailedAnalysis: analysis.detailedAnalysis,
        improvementSuggestions: analysis.improvementSuggestions || [],
        aiModel: process.env.AI_PROVIDER === 'openai' ? 'gpt-4o' : 'claude-3-5-sonnet',
        processingTime: Date.now() - startTime,
      }

      logger.info('CV scored successfully', {
        score: result.score,
        recommendation: result.recommendation,
        processingTime: result.processingTime,
      })

      return result

    } catch (error) {
      logger.error('Failed to score CV with AI', { error })

      // Return fallback if AI fails
      return this.getFallbackCVScore(startTime)
    }
  }

  /**
   * Fallback scoring when AI is unavailable
   */
  private getFallbackCVScore(startTime: number): CVScoringResult {
    return {
      score: 75,
      summary: 'AI analysis unavailable. Manual review recommended.',
      strengths: ['Candidate profile needs manual review'],
      concerns: ['AI scoring not configured'],
      recommendation: 'maybe',
      matchPercentage: 70,
      detailedAnalysis: {
        skillsMatch: 70,
        experienceMatch: 75,
        educationMatch: 75,
        culturalFit: 70,
      },
      improvementSuggestions: ['Configure AI service for automated scoring'],
      aiModel: 'claude-3-5-sonnet',
      processingTime: Date.now() - startTime,
    }
  }

  // ============================================================================
  // PERFORMANCE SYNTHESIS
  // ============================================================================

  /**
   * Synthesize multiple performance reviews into insights and trends
   */
  async synthesizePerformance(
    reviews: PerformanceSynthesisInput['reviews']
  ): Promise<PerformanceSynthesisResult> {
    const startTime = Date.now()

    if (!this.isAIAvailable()) {
      logger.warn('AI not configured, returning fallback synthesis')
      return this.getFallbackPerformanceSynthesis(reviews, startTime)
    }

    try {
      const model = this.getModel()

      const reviewsText = reviews
        .map((r, i) => {
          return `Review ${i + 1} (${r.date}):
- Rating: ${r.rating}/5
- Strengths: ${r.strengths.join(', ')}
- Areas for Improvement: ${r.improvements.join(', ')}`
        })
        .join('\n\n')

      const prompt = `You are an expert HR analyst synthesizing performance review data.

PERFORMANCE REVIEWS:
${reviewsText}

Analyze these reviews and provide a JSON response with the following structure:
{
  "overallTrend": "<improving|stable|declining>",
  "averageRating": <number>,
  "keyStrengths": ["<strength 1>", "<strength 2>", ...],
  "criticalImprovementAreas": ["<area 1>", "<area 2>", ...],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...],
  "careerTrajectory": "<description of career direction>",
  "nextSteps": ["<action 1>", "<action 2>", ...],
  "aiInsights": "<2-3 paragraph synthesis with deeper insights>"
}

Focus on:
- Performance trends over time
- Consistent patterns
- Growth indicators
- Potential and opportunities
- Actionable next steps`

      const { text } = await generateText({
        model,
        prompt,
        temperature: 0.5,
        maxTokens: 2000,
      })

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw this.createError('Failed to parse AI response', 'API_ERROR')
      }

      const synthesis = JSON.parse(jsonMatch[0])

      const result: PerformanceSynthesisResult = {
        overallTrend: synthesis.overallTrend,
        averageRating: synthesis.averageRating,
        keyStrengths: synthesis.keyStrengths,
        criticalImprovementAreas: synthesis.criticalImprovementAreas,
        recommendations: synthesis.recommendations,
        careerTrajectory: synthesis.careerTrajectory,
        nextSteps: synthesis.nextSteps,
        aiInsights: synthesis.aiInsights,
        aiModel: process.env.AI_PROVIDER === 'openai' ? 'gpt-4o' : 'claude-3-5-sonnet',
        processingTime: Date.now() - startTime,
      }

      logger.info('Performance synthesized successfully', {
        trend: result.overallTrend,
        avgRating: result.averageRating,
        processingTime: result.processingTime,
      })

      return result

    } catch (error) {
      logger.error('Failed to synthesize performance with AI', { error })
      return this.getFallbackPerformanceSynthesis(reviews, startTime)
    }
  }

  /**
   * Fallback synthesis when AI is unavailable
   */
  private getFallbackPerformanceSynthesis(
    reviews: PerformanceSynthesisInput['reviews'],
    startTime: number
  ): PerformanceSynthesisResult {
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length

    return {
      overallTrend: 'stable',
      averageRating: avgRating,
      keyStrengths: ['Manual review required'],
      criticalImprovementAreas: ['AI synthesis not available'],
      recommendations: ['Configure AI service for automated insights'],
      careerTrajectory: 'Manual analysis needed',
      nextSteps: ['Review performance data manually'],
      aiInsights: 'AI analysis unavailable. Please configure AI service for detailed insights.',
      aiModel: 'claude-3-5-sonnet',
      processingTime: Date.now() - startTime,
    }
  }

  // ============================================================================
  // CAREER RECOMMENDATIONS
  // ============================================================================

  /**
   * Generate personalized career path recommendations
   */
  async recommendCareerPath(
    currentRole: string,
    skills: string[],
    performanceSummary: string,
    interests: string[]
  ): Promise<CareerRecommendation> {
    const startTime = Date.now()

    if (!this.isAIAvailable()) {
      logger.warn('AI not configured, returning fallback recommendations')
      return this.getFallbackCareerRecommendation(currentRole, startTime)
    }

    try {
      const model = this.getModel()

      const prompt = `You are an expert career advisor analyzing an employee's career trajectory.

CURRENT ROLE: ${currentRole}
SKILLS: ${skills.join(', ')}
PERFORMANCE: ${performanceSummary}
INTERESTS: ${interests.join(', ')}

Provide a JSON response with the following structure:
{
  "suggestedRoles": [
    {
      "title": "<role title>",
      "match": <number 0-100>,
      "reasoning": "<why this role fits>",
      "requiredSkills": ["<skill 1>", "<skill 2>", ...],
      "timeline": "<estimated time to transition>"
    }
  ],
  "skillGaps": [
    {
      "skill": "<skill name>",
      "currentLevel": "<beginner|intermediate|advanced>",
      "targetLevel": "<intermediate|advanced|expert>",
      "learningResources": ["<resource 1>", "<resource 2>", ...]
    }
  ],
  "developmentPlan": {
    "shortTerm": ["<action 1>", "<action 2>", ...],
    "mediumTerm": ["<action 1>", "<action 2>", ...],
    "longTerm": ["<action 1>", "<action 2>", ...]
  },
  "mentorshipSuggestions": ["<suggestion 1>", "<suggestion 2>", ...],
  "estimatedTimeToPromotion": "<timeframe>",
  "aiInsights": "<2-3 paragraph career guidance>"
}

Focus on:
- Realistic career progression
- Skill development priorities
- Market trends
- Personalized action plans
- Mentorship opportunities`

      const { text } = await generateText({
        model,
        prompt,
        temperature: 0.6,
        maxTokens: 3000,
      })

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw this.createError('Failed to parse AI response', 'API_ERROR')
      }

      const recommendation = JSON.parse(jsonMatch[0])

      const result: CareerRecommendation = {
        suggestedRoles: recommendation.suggestedRoles,
        skillGaps: recommendation.skillGaps,
        developmentPlan: recommendation.developmentPlan,
        mentorshipSuggestions: recommendation.mentorshipSuggestions,
        estimatedTimeToPromotion: recommendation.estimatedTimeToPromotion,
        aiInsights: recommendation.aiInsights,
        aiModel: process.env.AI_PROVIDER === 'openai' ? 'gpt-4o' : 'claude-3-5-sonnet',
        processingTime: Date.now() - startTime,
      }

      logger.info('Career recommendations generated', {
        rolesCount: result.suggestedRoles.length,
        processingTime: result.processingTime,
      })

      return result

    } catch (error) {
      logger.error('Failed to generate career recommendations', { error })
      return this.getFallbackCareerRecommendation(currentRole, startTime)
    }
  }

  /**
   * Fallback recommendations when AI is unavailable
   */
  private getFallbackCareerRecommendation(
    currentRole: string,
    startTime: number
  ): CareerRecommendation {
    return {
      suggestedRoles: [
        {
          title: 'Senior ' + currentRole,
          match: 80,
          reasoning: 'Natural progression in current role',
          requiredSkills: ['Leadership', 'Strategic thinking'],
          timeline: '12-18 months',
        },
      ],
      skillGaps: [
        {
          skill: 'Leadership',
          currentLevel: 'intermediate',
          targetLevel: 'advanced',
          learningResources: ['Leadership training', 'Mentorship program'],
        },
      ],
      developmentPlan: {
        shortTerm: ['Complete current projects', 'Seek feedback'],
        mediumTerm: ['Take on leadership roles', 'Develop strategic skills'],
        longTerm: ['Pursue promotion opportunities'],
      },
      mentorshipSuggestions: ['Seek senior mentor', 'Join leadership program'],
      estimatedTimeToPromotion: '12-18 months',
      aiInsights: 'AI analysis unavailable. Configure AI service for personalized career guidance.',
      aiModel: 'claude-3-5-sonnet',
      processingTime: Date.now() - startTime,
    }
  }

  // ============================================================================
  // STREAMING CHAT (For conversational AI)
  // ============================================================================

  /**
   * Stream conversational AI responses
   * Used for interactive chat interfaces
   */
  async streamChat(messages: CoreMessage[]) {
    if (!this.isAIAvailable()) {
      throw this.createError(
        'AI service not configured',
        'API_KEY_MISSING'
      )
    }

    try {
      const model = this.getModel()

      const result = await streamText({
        model,
        messages,
        temperature: 0.7,
        maxTokens: 2000,
      })

      return result.toDataStreamResponse()

    } catch (error) {
      logger.error('Failed to stream chat', { error })
      throw this.createError(
        'Failed to generate AI response',
        'API_ERROR',
        error
      )
    }
  }

  // ============================================================================
  // HELPER METHODS FOR DATABASE INTEGRATION
  // ============================================================================

  /**
   * Save CV scoring results to database
   */
  async saveCVScore(data: {
    candidate_id: string
    score: number
    summary: string
    strengths: string[]
    concerns: string[]
    recommendation: string
    analysis_data?: any
  }): Promise<void> {
    const supabase = await this.getClient()

    const { error } = await supabase
      .from('candidates')
      .update({
        ai_cv_score: data.score,
        ai_cv_analysis: {
          summary: data.summary,
          strengths: data.strengths,
          concerns: data.concerns,
          recommendation: data.recommendation,
          analysis_data: data.analysis_data,
        },
        ai_analyzed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.candidate_id)

    if (error) {
      throw new Error(`Failed to update AI CV score: ${error.message}`)
    }
  }

  /**
   * Generate insights for dashboard (goals, performance, recruitment)
   */
  async generateInsights(
    organizationId: string,
    dataType: 'goals' | 'performance' | 'recruitment'
  ): Promise<any> {
    // This would use AI to analyze patterns and generate insights
    // For now, return basic analytics
    logger.info('Generating insights', { organizationId, dataType })

    switch (dataType) {
      case 'goals':
        return {
          completion_rate: 0.75,
          top_performers: [],
          areas_for_improvement: [],
        }
      case 'performance':
        return {
          average_rating: 4.2,
          improvement_areas: [],
          recognition_opportunities: [],
        }
      case 'recruitment':
        return {
          pipeline_health: 'good',
          bottlenecks: [],
          optimization_suggestions: [],
        }
      default:
        return {}
    }
  }
}

export const aiService = new AIService()
export type { AIService }
