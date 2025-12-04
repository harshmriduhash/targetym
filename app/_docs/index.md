# Targetym Registry Documentation

Welcome to the Targetym component and utility registry. This documentation covers all available modules, components, and utilities that can be integrated into your HR management applications.

## Quick Start

### Installation

Install any component or module from the registry using the CLI:

```bash
# Install a complete module
pnpm registry:install goals-management

# Install a specific component
pnpm registry:install ui-goal-form

# Install a utility library
pnpm registry:install cache-manager
```

### Using Components

```tsx
import { GoalForm } from '@/components/goals/goal-form'
import { GoalsList } from '@/components/goals/goals-list'

export default function GoalsPage() {
  return (
    <div>
      <GoalForm />
      <GoalsList />
    </div>
  )
}
```

## Available Modules

### Core Business Modules

- **[Goals Management](./modules/goals-management.md)** - Complete Goals & OKR system with tracking and analytics
- **[Recruitment Pipeline](./modules/recruitment-pipeline.md)** - Candidate tracking and interview scheduling
- **[Performance Management](./modules/performance-management.md)** - Performance reviews and feedback system
- **[KPIs Dashboard](./modules/kpis-dashboard.md)** - Key Performance Indicators tracking and visualization

### Features & Integrations

- **[Realtime Features](./modules/realtime-features.md)** - Supabase Realtime subscriptions and live updates
- **[Integrations Framework](./integrations/integrations-framework.md)** - Microsoft 365, Google, Slack integrations
- **[Notifications System](./modules/notifications-system.md)** - Real-time notifications with Supabase
- **[AI Features](./modules/ai-features.md)** - OpenAI and Anthropic powered features
- **[A/B Testing](./modules/ab-testing.md)** - Experimentation and feature flags

### Utilities & Infrastructure

- **[Cache Manager](./utilities/cache-manager.md)** - Multi-layer caching with Redis
- **[Rate Limiter](./utilities/rate-limiter.md)** - Production-ready rate limiting
- **[Supabase Auth](./utilities/supabase-auth.md)** - Authentication utilities for Next.js
- **[Error Handling](./utilities/error-handling.md)** - Centralized error management
- **[Resilience Patterns](./utilities/resilience-patterns.md)** - Circuit breaker and retry logic
- **[Response Helpers](./utilities/response-helpers.md)** - Type-safe API responses

### Settings & Configuration

- **[Settings Panels](./modules/settings-panels.md)** - Comprehensive settings UI components

## Architecture Overview

All modules follow a consistent architecture:

```
module-name/
├── components/        # React UI components
│   ├── feature-form.tsx
│   ├── feature-list.tsx
│   └── feature-detail.tsx
├── lib/
│   ├── services/      # Business logic layer
│   │   └── feature.service.ts
│   └── validations/   # Zod schemas
│       └── feature.schemas.ts
└── actions/           # Next.js Server Actions
    ├── create-feature.ts
    ├── update-feature.ts
    └── delete-feature.ts
```

## Key Patterns

### Server Actions Pattern

All mutations use Server Actions with authentication and validation:

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { featureService } from '@/lib/services/feature.service'
import { createFeatureSchema } from '@/lib/validations/feature.schemas'
import { successResponse, errorResponse } from '@/lib/utils/response'

export async function createFeature(input: CreateFeatureInput) {
  try {
    const validated = createFeatureSchema.parse(input)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED')

    const result = await featureService.create(validated)
    return successResponse(result)
  } catch (error) {
    return errorResponse(error.message, 'CREATE_FAILED')
  }
}
```

### Service Layer Pattern

Business logic is centralized in services:

```typescript
export class FeatureService {
  private async getClient() {
    return createClient()
  }

  async create(data: CreateFeatureData) {
    const supabase = await this.getClient()
    const { data: result, error } = await supabase
      .from('features')
      .insert([data])
      .select()
      .single()

    if (error) throw new Error(error.message)
    return result
  }
}

export const featureService = new FeatureService()
```

### Component Pattern

UI components are client-side with React Hook Form and Zod:

```typescript
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFeatureSchema } from '@/lib/validations/feature.schemas'
import { createFeature } from '@/actions/features/create-feature'
import { toast } from 'sonner'

export function FeatureForm() {
  const form = useForm({
    resolver: zodResolver(createFeatureSchema)
  })

  async function onSubmit(data) {
    const result = await createFeature(data)
    if (result.success) {
      toast.success('Feature created successfully')
    } else {
      toast.error(result.error.message)
    }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>
}
```

## Dependencies

All modules require these peer dependencies:

```json
{
  "react": ">=19.0.0",
  "react-dom": ">=19.0.0",
  "next": ">=15.5.0",
  "@supabase/supabase-js": "^2.58.0",
  "@tanstack/react-query": "^5.90.0",
  "zod": "^4.1.0"
}
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on adding new components to the registry.

## License

MIT © Targetym Team
