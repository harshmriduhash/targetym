# Performance Management Examples

Performance review and employee development tracking examples from the Targetym Component Registry.

## Overview

The `performance-management` module provides comprehensive tools for conducting performance reviews, collecting feedback, and tracking employee development over time.

## Examples

### 1. Basic Usage (`basic.tsx`)

Simple performance review creation and management.

**Features:**
- Review form with rating categories
- Review list with filtering
- Status tracking (draft, in progress, completed)
- Employee and reviewer selection

**Use Case:** Basic performance review cycle management.

### 2. Performance Analytics (`with-charts.tsx`)

Visual analytics and trend analysis using charts.

**Features:**
- Performance trend line chart
- Skills radar chart
- Rating distribution bar chart
- Key metrics dashboard
- Time-based filtering

**Use Case:** Track employee development, identify trends, support data-driven decisions.

## Installation

```bash
npm install react-hook-form zod @tanstack/react-query recharts
npx shadcn@latest add performance-management
```

## Component API

### ReviewForm

```tsx
interface ReviewFormProps {
  review?: PerformanceReview
  employeeId?: string
  onSuccess?: () => void
}
```

### ReviewsList

```tsx
interface ReviewsListProps {
  initialFilters?: {
    status?: 'draft' | 'in_progress' | 'completed'
    employee_id?: string
    reviewer_id?: string
  }
}
```

## Database Schema

```sql
CREATE TABLE performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  employee_id UUID NOT NULL REFERENCES auth.users(id),
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  review_type TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  overall_rating NUMERIC(2,1),
  strengths TEXT,
  areas_for_improvement TEXT,
  goals_for_next_period TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE performance_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES performance_reviews(id),
  category TEXT NOT NULL,
  rating NUMERIC(2,1) NOT NULL,
  comments TEXT
);

CREATE TABLE peer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES performance_reviews(id),
  provider_id UUID NOT NULL REFERENCES auth.users(id),
  feedback_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Server Actions

```tsx
import {
  createPerformanceReview,
  getPerformanceReviews,
  updateReviewStatus,
  createPeerFeedback
} from '@/src/actions/performance'

// Create review
await createPerformanceReview({
  employee_id: 'user-uuid',
  review_type: 'annual',
  review_period_start: '2025-01-01',
  review_period_end: '2025-12-31',
  ratings: {
    technical: 4.0,
    communication: 4.5,
    leadership: 3.5
  }
})

// Add peer feedback
await createPeerFeedback({
  review_id: 'review-uuid',
  feedback_text: 'Great team player...'
})
```

## Review Workflow

1. **Initiation**: Manager creates review
2. **Self-Assessment**: Employee completes self-review
3. **Peer Feedback**: Collect input from colleagues
4. **Manager Review**: Manager adds ratings and feedback
5. **Review Meeting**: Discuss results with employee
6. **Finalization**: Sign off and set goals

## Best Practices

- Conduct reviews regularly (quarterly/annual)
- Use standardized rating criteria
- Collect peer feedback for 360-degree view
- Focus on development, not just evaluation
- Set SMART goals for next period
- Document all feedback thoroughly

## Related Modules

- **goals-management**: Link reviews to goal achievement
- **kpis-dashboard**: Visualize performance metrics
