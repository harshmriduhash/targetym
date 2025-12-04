/**
 * @jest-environment node
 */

/**
 * AIService Unit Tests
 *
 * Tests for AI-powered features using Vercel AI SDK
 * Coverage: CV Scoring, Performance Synthesis, Career Recommendations, Streaming Chat
 */

// Polyfill for TransformStream in Node.js test environment
import { TransformStream } from 'node:stream/web'
global.TransformStream = TransformStream as any

import { aiService } from '@/src/lib/services/ai.service'
import { generateText, streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import { logger } from '@/src/lib/utils/logger'
import { createClient } from '@/src/lib/supabase/server'

// Mock all external dependencies
jest.mock('ai')
jest.mock('@ai-sdk/anthropic')
jest.mock('@ai-sdk/openai')
jest.mock('@/src/lib/utils/logger')
jest.mock('@/src/lib/supabase/server')

describe('AIService', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env }
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
  })

  // Configuration & Helpers
  describe('Provider Selection', () => {
    it('should use Anthropic when ANTHROPIC_API_KEY is set', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key'
      process.env.AI_PROVIDER = 'anthropic'

      const mockModel = { name: 'claude' }
      ;(anthropic as jest.Mock).mockReturnValue(mockModel)
      ;(generateText as jest.Mock).mockResolvedValue({
        text: JSON.stringify({
          score: 85,
          summary: 'Good',
          strengths: [],
          concerns: [],
          recommendation: 'yes',
          matchPercentage: 85,
          detailedAnalysis: { skillsMatch: 90, experienceMatch: 85, educationMatch: 80, culturalFit: 85 },
          improvementSuggestions: [],
        }),
      })

      const result = await aiService.scoreCandidateCV('cv', 'job', ['req'])

      expect(anthropic).toHaveBeenCalledWith('claude-3-5-sonnet-20241022')
      expect(result.score).toBe(85)
    })

    it('should return fallback when no API keys configured', async () => {
      delete process.env.ANTHROPIC_API_KEY
      delete process.env.OPENAI_API_KEY

      const result = await aiService.scoreCandidateCV('cv', 'job', ['req'])

      expect(result.score).toBe(75)
      expect(result.recommendation).toBe('maybe')
    })
  })

  // CV Scoring Tests
  describe('scoreCandidateCV', () => {
    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = 'test-key'
    })

    it('should use temperature 0.3 for CV scoring', async () => {
      ;(generateText as jest.Mock).mockResolvedValue({
        text: '{"score": 80}',
      })

      await aiService.scoreCandidateCV('cv', 'job', ['req'])

      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.3,
          maxTokens: 2000,
        })
      )
    })

    it('should return fallback on parsing error', async () => {
      ;(generateText as jest.Mock).mockResolvedValue({
        text: 'Plain text without JSON',
      })

      const result = await aiService.scoreCandidateCV('cv', 'job', ['req'])

      expect(result.score).toBe(75)
    })
  })

  // Performance Synthesis Tests
  describe('synthesizePerformance', () => {
    it('should use temperature 0.5', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key'
      ;(generateText as jest.Mock).mockResolvedValue({
        text: '{"overallTrend": "stable", "averageRating": 4.0}',
      })

      await aiService.synthesizePerformance([
        { date: '2024-01-01', rating: 4, strengths: [], improvements: [] },
      ])

      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.5,
        })
      )
    })
  })

  // Streaming Chat Tests
  describe('streamChat', () => {
    it('should stream successfully', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key'

      const mockStreamResult = {
        toDataStreamResponse: jest.fn().mockReturnValue('stream'),
      }

      ;(streamText as jest.Mock).mockResolvedValue(mockStreamResult)

      const messages = [{ role: 'user' as const, content: 'Hello' }]
      const result = await aiService.streamChat(messages)

      expect(streamText).toHaveBeenCalled()
      expect(mockStreamResult.toDataStreamResponse).toHaveBeenCalled()
      expect(result).toBe('stream')
    })

    it('should throw if AI not configured', async () => {
      delete process.env.ANTHROPIC_API_KEY

      await expect(
        aiService.streamChat([{ role: 'user' as const, content: 'Hi' }])
      ).rejects.toThrow('not configured')
    })
  })
})
