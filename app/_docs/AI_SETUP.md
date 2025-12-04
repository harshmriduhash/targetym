# AI Features Setup Guide

## Overview

Phase 2 includes 3 AI-powered features:
1. **CV Scoring** - Automatic candidate evaluation
2. **Performance Synthesis** - AI-generated insights from reviews
3. **Career Recommendations** - Personalized career path suggestions

## Configuration

### Environment Variables

Add one of the following to your `.env.local`:

**Option 1: OpenAI (Recommended)**
```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Option 2: Anthropic Claude**
```bash
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here
```

### Getting API Keys

#### OpenAI
1. Visit https://platform.openai.com/api-keys
2. Sign up or log in
3. Create a new API key
4. Copy and add to `.env.local`

#### Anthropic
1. Visit https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new key
5. Copy and add to `.env.local`

## Usage

### 1. CV Scoring

Automatically score candidate CVs against job requirements:

```typescript
import { scoreCandidateCV } from '@/src/actions/ai'

const result = await scoreCandidateCV(candidateId)

if (result.success) {
  console.log('Score:', result.data.score) // 0-100
  console.log('Summary:', result.data.summary)
  console.log('Strengths:', result.data.strengths)
  console.log('Concerns:', result.data.concerns)
  console.log('Recommendation:', result.data.recommendation)
}
```

**UI Integration:**
- Candidate detail page shows AI score badge
- Automatic scoring on candidate creation
- Manual re-scoring option available

### 2. Performance Synthesis

Generate insights from multiple performance reviews:

```typescript
import { synthesizeEmployeePerformance } from '@/src/actions/ai'

const result = await synthesizeEmployeePerformance(employeeId)

if (result.success) {
  console.log('Summary:', result.data.summary)
  console.log('Key Strengths:', result.data.keyStrengths)
  console.log('Areas for Improvement:', result.data.areasForImprovement)
  console.log('Overall Trend:', result.data.overallTrend)
  console.log('Suggested Actions:', result.data.suggestedActions)
}
```

**UI Integration:**
- Performance dashboard shows AI insights
- Trend analysis across review periods
- Actionable recommendations

### 3. Career Recommendations

Get AI-powered career path suggestions:

```typescript
import { recommendCareerPath } from '@/src/actions/ai'

const result = await recommendCareerPath({
  employeeId: 'user-123',
  currentRole: 'Software Engineer',
  skills: ['React', 'TypeScript', 'Node.js'],
  interests: ['Architecture', 'Team Leadership']
})

if (result.success) {
  console.log('Next Roles:', result.data.nextRoles)
  console.log('Skill Gaps:', result.data.skillGaps)
  console.log('Development Plan:', result.data.developmentPlan)
  console.log('Timeframe:', result.data.timeframe)
  console.log('Confidence:', result.data.confidence)
}
```

**UI Integration:**
- Career planning page with AI suggestions
- Skill gap analysis
- Personalized development roadmap

## AI Service Architecture

### Service Layer

The AI service (`src/lib/services/ai.service.ts`) provides:
- Provider abstraction (OpenAI or Anthropic)
- Error handling and fallbacks
- JSON response parsing
- Type-safe interfaces

### Server Actions

Three server actions in `src/actions/ai/`:
- `score-cv.ts` - CV scoring with permissions
- `synthesize-performance.ts` - Performance analysis
- `recommend-career.ts` - Career recommendations

### Permission Model

- **CV Scoring**: Admin and Manager only
- **Performance Synthesis**: Employee (self), Manager, Admin
- **Career Recommendations**: Employee (self), Manager, Admin

## Cost Considerations

### OpenAI Pricing (GPT-4o)
- Input: $2.50 per 1M tokens
- Output: $10 per 1M tokens
- Estimated cost per CV score: ~$0.01-0.05
- Estimated cost per synthesis: ~$0.02-0.08

### Anthropic Pricing (Claude 3.5 Sonnet)
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens
- Similar cost structure to OpenAI

### Cost Optimization Tips

1. **Cache Results**: Store AI analysis in database
2. **Batch Processing**: Process multiple items together
3. **Rate Limiting**: Limit AI calls per user/day
4. **Fallback Mode**: Graceful degradation without API key

## Fallback Behavior

If no API key is configured, the AI service returns safe defaults:

```typescript
// CV Scoring fallback
{
  score: 50,
  summary: 'Unable to fully analyze CV at this time.',
  strengths: ['Relevant experience'],
  concerns: ['Manual review recommended'],
  recommendation: 'maybe'
}
```

This ensures the application works without AI features while encouraging manual review.

## Testing

### Unit Tests

AI service includes comprehensive mocking:

```typescript
// Mock AI service in tests
jest.mock('@/src/lib/services/ai.service', () => ({
  aiService: {
    scoreCandidateCV: jest.fn().mockResolvedValue({
      score: 85,
      summary: 'Strong candidate',
      strengths: ['5 years experience'],
      concerns: ['None'],
      recommendation: 'yes'
    })
  }
}))
```

### Integration Testing

Test with real API keys in development:

```bash
# Run AI-enabled tests
OPENAI_API_KEY=sk-test-key npm run test:integration
```

## Security Best Practices

1. **Never commit API keys** to git
2. **Use environment variables** for all keys
3. **Rotate keys regularly** (every 90 days)
4. **Monitor API usage** in provider dashboards
5. **Set spending limits** to prevent unexpected charges
6. **Log AI calls** for audit trails

## Troubleshooting

### Error: "AI API key not configured"
- Check `.env.local` has correct key
- Restart dev server after adding key
- Verify key format (starts with `sk-`)

### Error: "OpenAI API error"
- Check API key is valid
- Verify account has credits
- Check rate limits on OpenAI dashboard

### Error: "Failed to parse AI response as JSON"
- This is usually transient
- Retry the operation
- Check AI provider status page

## Future Enhancements

Potential AI feature additions:
- **Interview Question Generator** - AI-generated questions
- **Skills Gap Analysis** - Automated skill assessments
- **Team Composition Optimizer** - AI team recommendations
- **Sentiment Analysis** - Analyze feedback tone
- **Predictive Analytics** - Turnover prediction

## Support

For issues with AI features:
1. Check this documentation
2. Review error logs in console
3. Verify API key configuration
4. Contact support with error details
