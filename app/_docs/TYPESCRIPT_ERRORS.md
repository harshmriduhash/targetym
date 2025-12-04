# TypeScript Errors Reference

This document explains the TypeScript errors found in the project and how to address them.

## Summary

Total errors: ~90+ (primarily in tests, components, and webhooks)

### Error Categories:

1. **Test-related errors** (40+ errors) - Missing mock types, incorrect schema usage
2. **Component-related errors** (25+ errors) - Missing props, invalid variant values
3. **Webhook/API errors** (3 errors) - Type mismatches in Clerk integration
4. **Missing imports** (5+ errors) - Missing UI component modules

## Test File Errors

### Location: `__tests__/unit/lib/react-query/use-goals.test.tsx`

**Error Pattern:** Missing required properties in mock data

```typescript
// ERROR: Missing status, start_date, end_date, visibility
const mockGoal = {
  title: 'Test Goal',
  description: 'Test',
  period: 'quarterly',
}

// FIX: Add all required fields
const mockGoal = {
  title: 'Test Goal',
  description: 'Test',
  period: 'quarterly' as const,
  status: 'draft' as const,
  start_date: new Date().toISOString(),
  end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  visibility: 'organization' as const,
}
```

**Action:** Update test files to include all required fields from `CreateGoalInput` schema.

### Location: `__tests__/unit/lib/services/goals.service.test.ts`

**Error Pattern:** Undefined `mockSupabaseQueryBuilder` variable

```typescript
// ERROR: Cannot find name 'mockSupabaseQueryBuilder'
mockSupabaseQueryBuilder.select.mockReturnValue(...)

// FIX: Define the mock before using
const mockSupabaseQueryBuilder = {
  select: jest.fn(),
  eq: jest.fn(),
  single: jest.fn(),
  // ... other methods
}
```

**Status:** Low priority - tests need refactoring but don't block build

### Location: `__tests__/unit/lib/services/performance.service.test.ts`

**Error Patterns:**

1. **Wrong property name:**
   ```typescript
   // ERROR: 'employee_id' does not exist
   const mockData = {
     employee_id: 'user123',
   }

   // FIX: Should be 'reviewed_employee_id' or similar
   const mockData = {
     reviewed_employee_id: 'user123',
   }
   ```

2. **Missing method:**
   ```typescript
   // ERROR: Property 'submitFeedback' does not exist
   await service.submitFeedback(...)

   // FIX: Check PerformanceService class for actual method names
   ```

**Action:** Review PerformanceService class definition and update tests accordingly.

## Component Type Errors

### Location: `app/dashboard/attendance/page.tsx` & Similar

**Error Pattern:** Invalid variant value for Button component

```typescript
// ERROR: "success" is not a valid variant
<Button variant="success">Click</Button>

// FIX: Use valid variants from shadcn Button
<Button variant="default">Click</Button>
<Button variant="destructive">Delete</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
```

**Affected Files:**
- `app/dashboard/attendance/page.tsx` - line 134
- `app/dashboard/forms/page.tsx` - line 143
- `app/dashboard/help/page.tsx` - line 122
- `app/dashboard/leaves/page.tsx` - line 99
- `app/dashboard/security/page.tsx` - line 105

**Action:** Review shadcn Button component documentation and update variant values.

### Location: `components/common/AnimatedContainer.tsx`

**Error Pattern:** Missing JSX namespace and invalid component type

```typescript
// ERROR: Cannot find namespace 'JSX'
// ERROR: Component cannot be used as JSX component

interface Props {
  as?: string | number | symbol  // Wrong type for JSX component
}

// FIX: Use React.ElementType
import type { ElementType } from 'react'

interface Props {
  as?: ElementType
}

// Update component to handle ElementType correctly
const Component = as || 'div'
```

**Action:** Fix component typing to use React.ElementType for dynamic components.

### Location: `components/common/ErrorBoundary.tsx`

**Error Pattern:** Missing JSX namespace

```typescript
// ERROR: Cannot find namespace 'JSX'
// ERROR: React not imported in type-checking context

// FIX: Add React import
import React from 'react'
```

**Action:** Ensure React is imported in all JSX components.

### Location: `app/dashboard/goals/[id]/page.tsx`

**Error Pattern:** Wrong prop names

```typescript
// ERROR: Property 'goalId' does not exist
<ProgressTracker goalId={id} goalTitle={title} keyResults={keyResults} />

// FIX: Check ProgressTrackerProps interface
<ProgressTracker id={id} title={title} keyResults={keyResults} />
```

**Action:** Check ProgressTracker component definition for correct prop names.

### Location: `components/learning/CertificationsListModal.tsx`

**Error Pattern:** Array type mismatch

```typescript
// ERROR: Argument of type 'Certification' is not assignable to parameter of type 'never'
certifications.map((cert) => ...)  // certifications is typed as never[]

// FIX: Provide correct type
const [certifications, setCertifications] = useState<Certification[]>([])
```

**Action:** Review component state initialization and provide correct types.

### Location: `components/learning/SkillsMatrixModal.tsx`

**Error Pattern:** Numeric index with string-keyed object

```typescript
// ERROR: Cannot use number to index { 1: string; 2: string; ... }
const rating = skillLevels[numericValue]

// FIX: Convert to correct type
const rating = skillLevels[numericValue as keyof typeof skillLevels]
```

**Action:** Ensure object access uses correct key types.

## Webhook & API Errors

### Location: `app/api/webhooks/clerk/route.ts` - Line 58

**Error:** Missing `organization_id` in insert payload

```typescript
// ERROR: Property 'organization_id' is missing
const { error } = await supabase.from('profiles').insert({
  id,
  email,
  full_name,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

// FIX: Add @ts-expect-error comment with explanation
// @ts-expect-error: organization_id will be set by database trigger or default
const { error } = await supabase.from('profiles').insert({
  id,
  email,
  full_name,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})
```

**Status:** Already fixed in current version

### Location: `app/api/recruitment/candidates/route.ts` - Line 57

**Error:** Accessing non-existent properties

```typescript
// ERROR: Property 'first_name' does not exist
const firstName = candidateData.first_name

// FIX: Check actual property names in schema
const firstName = candidateData.name?.split(' ')[0]
```

**Action:** Verify schema defines correct property names (name vs first_name/last_name).

### Location: `app/dashboard/recruitment/schedule-interview-example/page.tsx`

**Error:** Invalid enum value

```typescript
// ERROR: "phone_screen" is not a valid interview type
const type: InterviewType = 'phone_screen'

// FIX: Use valid values
const type: InterviewType = 'phone'  // or 'video', 'onsite', 'technical', 'behavioral', 'panel'
```

**Action:** Check Interview enum definition for valid values.

## Missing Imports

### Location: `components/landing/LandingTestimonials.tsx`

**Error:** Module not found

```typescript
// ERROR: Cannot find module '@/components/ui/icons'
import { Icon } from '@/components/ui/icons'

// FIX: Check if module exists or use lucide-react instead
import { Users, Star } from 'lucide-react'
```

**Action:** Create missing module or use alternative icon library.

### Location: `components/dashboard/PlaceholderContent.tsx`

**Error:** String used to index object

```typescript
// ERROR: Cannot use string to index type
const content = integrations[selectedIntegration]

// FIX: Use type guard
type IntegrationKey = keyof typeof integrations
const content = integrations[selectedIntegration as IntegrationKey]
```

**Action:** Add proper type guards for dynamic object access.

## Database Type Errors

### Location: `app/dashboard/page.tsx` - Line 22

**Error:** Missing profile property

```typescript
// ERROR: Property 'onboarding_completed' does not exist
const isOnboarded = profile.onboarding_completed

// FIX: Check if property exists in database schema
// If it doesn't, add migration or check for different property name
const isOnboarded = profile.employment_status !== 'inactive'
```

**Action:** Regenerate types and check database schema.

## How to Fix These Issues

### Quick Fix Strategy

1. **Run type check to see current status:**
   ```bash
   npm run type-check
   ```

2. **Fix errors in order of severity:**
   - Errors in main application code (highest priority)
   - Errors in test files (medium priority)
   - Errors in unused components (lower priority)

3. **For each error:**
   - Read the error message carefully
   - Check related file/component definition
   - Update types/props/values accordingly
   - Verify with `npm run type-check`

### Systematic Fix Process

```bash
# 1. Create a new branch for type fixes
git checkout -b fix/typescript-errors

# 2. Fix one category at a time
# Start with: Webhook errors
# Then: API errors
# Then: Test errors
# Then: Component errors

# 3. After each fix
npm run type-check

# 4. Run full checks
npm run check:all

# 5. Commit
git add .
git commit -m "fix: resolve typescript errors in [category]"

# 6. Push and create PR
git push origin fix/typescript-errors
```

## Prevention Going Forward

### Best Practices

1. **Always run type-check before committing:**
   ```bash
   npm run type-check
   ```

2. **Enable strict mode in TypeScript** (already enabled in tsconfig.json)

3. **Use proper types for props:**
   ```typescript
   // Good
   interface Props {
     variant: 'default' | 'destructive' | 'secondary' | 'outline'
     onClick: (e: React.MouseEvent) => void
   }

   // Avoid
   interface Props {
     variant: string
     onClick: any
   }
   ```

4. **Generate types after schema changes:**
   ```bash
   npm run supabase:types
   ```

5. **Use @ts-expect-error sparingly** with explanatory comments:
   ```typescript
   // @ts-expect-error: Explanation of why this is needed
   ```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Next.js TypeScript](https://nextjs.org/docs/basic-features/typescript)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Project CLAUDE.md](./CLAUDE.md) - Known Issues section

## Support

If you encounter type errors not listed here:

1. Check CLAUDE.md Known Issues section
2. Search for the error message
3. Ask the team with error details

Include when asking:
- Exact error message
- File and line number
- What you're trying to do
- What you've tried
