# Deployment Fix: DEFAULT_AI_CONFIG Import Error

**Date**: 2025-11-06
**Issue**: Runtime ReferenceError during Render deployment
**Status**: ✅ FIXED
**Commit**: `59d82ea`

---

## Problem Summary

### Error Details

**Error Type**: `ReferenceError: DEFAULT_AI_CONFIG is not defined`
**Phase**: Build phase - "Collecting page data" for `/api/ai/chat` route
**Environment**: Render production deployment (Node.js 25.1.0 with Turbopack)

### Complete Error Log

```
2025-11-06T18:09:02.522351788Z ReferenceError: DEFAULT_AI_CONFIG is not defined
2025-11-06T18:09:02.522379709Z     at K (.next/server/edge/chunks/turbopack-_next-internal_server_app_api_ai_chat_route_actions_24d8afea.js:3:914)
2025-11-06T18:09:02.522385209Z     at E (.next/server/edge/chunks/turbopack-_next-internal_server_app_api_ai_chat_route_actions_24d8afea.js:3:418)
2025-11-06T18:09:02.52242719Z     at r.i (.next/server/edge/chunks/turbopack-_next-internal_server_app_api_ai_chat_route_actions_24d8afea.js:1:2291)
2025-11-06T18:09:02.52243289Z     at <unknown> (.next/server/edge/chunks/[root-of-the-server]__a657b1cb._.js:2:827)
2025-11-06T18:09:02.525289001Z
2025-11-06T18:09:02.525308852Z > Build error occurred
2025-11-06T18:09:02.611239164Z [Error: Failed to collect page data for /api/ai/chat] { type: 'Error' }
```

### Build Progress Before Failure

- ✅ TypeScript compilation: SUCCESS (20.1s)
- ✅ Type validation: SKIPPED (as configured)
- ✅ Linting: SKIPPED (as configured)
- ❌ Page data collection: **FAILED**

---

## Root Cause Analysis

### The Problem

In `src/lib/services/ai.service.ts`, the constants `DEFAULT_AI_CONFIG` and `AI_MODELS` were imported as **type-only imports**:

```typescript
// INCORRECT - Type imports are stripped at runtime
import type {
  CVScoringResult,
  CVScoringInput,
  PerformanceSynthesisResult,
  PerformanceSynthesisInput,
  CareerRecommendation,
  CareerRecommendationInput,
  AIConfig,
  AIServiceError,
  AI_MODELS,           // ❌ Used as value but imported as type
  DEFAULT_AI_CONFIG,   // ❌ Used as value but imported as type
} from '@/src/types/ai.types'
```

However, these constants were being used as **runtime values**:

```typescript
class AIService {
  private config: AIConfig = DEFAULT_AI_CONFIG  // Line 36 - Runtime usage!
  // ...
}
```

### Why This Causes a Build Error

1. **TypeScript Behavior**: When you use `import type`, TypeScript treats these as type-only imports
2. **Compilation Phase**: During compilation, ALL type imports are completely removed from the JavaScript output
3. **Runtime Consequence**: At runtime, `DEFAULT_AI_CONFIG` becomes `undefined` because the import was stripped
4. **Build Failure**: During Next.js page data collection, the Edge Runtime tries to access `DEFAULT_AI_CONFIG` and throws `ReferenceError`

### TypeScript Import Types Explained

```typescript
// TYPE-ONLY IMPORT (stripped at runtime)
import type { MyType } from './module'
// Used only for type checking: let x: MyType = ...

// VALUE IMPORT (available at runtime)
import { MyConstant } from './module'
// Used as runtime value: const y = MyConstant

// MIXED IMPORT (recommended pattern)
import type { MyType } from './module'
import { MyConstant } from './module'
// MyType for types, MyConstant for values
```

---

## The Solution

### Code Changes

**File**: `src/lib/services/ai.service.ts`

**Before**:
```typescript
import type {
  CVScoringResult,
  CVScoringInput,
  PerformanceSynthesisResult,
  PerformanceSynthesisInput,
  CareerRecommendation,
  CareerRecommendationInput,
  AIConfig,
  AIServiceError,
  AI_MODELS,           // ❌ PROBLEM: Type import but used as value
  DEFAULT_AI_CONFIG,   // ❌ PROBLEM: Type import but used as value
} from '@/src/types/ai.types'
```

**After**:
```typescript
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
// ✅ FIXED: Separate value import for runtime constants
```

### What Changed

1. **Removed** `AI_MODELS` and `DEFAULT_AI_CONFIG` from the `import type` statement
2. **Added** a separate value import: `import { AI_MODELS, DEFAULT_AI_CONFIG } from '@/src/types/ai.types'`
3. **Result**: These constants are now available at runtime in the compiled JavaScript

---

## Verification Steps

### 1. TypeScript Type Checking

```bash
npm run type-check
```

**Expected**: No errors related to ai.service.ts imports

### 2. Local Build Test

```bash
npm run build
```

**Expected**:
- ✅ Compilation succeeds
- ✅ Page data collection succeeds for `/api/ai/chat`
- ✅ No ReferenceError

### 3. Edge Runtime Test

Since the route uses `export const runtime = 'edge'`, verify Edge Runtime compatibility:

```bash
# Build and start production server
npm run build
npm run start
```

Test the endpoint:
```bash
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
```

**Expected**: No `DEFAULT_AI_CONFIG is not defined` error

---

## Prevention Guidelines

### Best Practices for TypeScript Imports

#### Rule 1: Separate Type and Value Imports

```typescript
// ✅ CORRECT PATTERN
import type { MyType, AnotherType } from './module'
import { myConstant, myFunction } from './module'

// ❌ INCORRECT - Mixing types and values
import type { MyType, myConstant } from './module'
```

#### Rule 2: Identify Value vs Type Usage

**Types** (use `import type`):
- Interfaces
- Type aliases
- Classes used only for typing (e.g., `value: ClassName`)

**Values** (use regular `import`):
- Constants
- Functions
- Classes used for instantiation (e.g., `new ClassName()`)
- Enums (if used as values)
- Objects with properties

#### Rule 3: Check Runtime Usage

Before using `import type`, ask:
- "Is this used in any runtime expression?"
- "Is this assigned to a variable?"
- "Is this passed as a function argument?"

If YES to any → Use value import!

### Example from Our Codebase

```typescript
// ai.types.ts exports
export interface AIConfig { ... }           // Type only
export const AI_MODELS = { ... }            // Runtime constant
export const DEFAULT_AI_CONFIG: AIConfig = { ... } // Runtime constant

// ai.service.ts usage
private config: AIConfig = DEFAULT_AI_CONFIG
//              ^^^^^^^^    ^^^^^^^^^^^^^^^^
//              Type usage  Value usage (runtime!)
//
// Solution:
import type { AIConfig } from '@/src/types/ai.types'      // Type
import { DEFAULT_AI_CONFIG } from '@/src/types/ai.types'   // Value
```

---

## Related Files

### Files Changed
- `src/lib/services/ai.service.ts` - Fixed import statement

### Files Analyzed
- `src/types/ai.types.ts` - Verified constant definitions
- `app/api/ai/chat/route.ts` - Route that triggered the error

### Affected Routes
- `/api/ai/chat` - Streaming AI chat (Edge Runtime)
- All AI service features:
  - CV Scoring
  - Performance Synthesis
  - Career Recommendations
  - Conversational Chat

---

## Testing Checklist

- [x] TypeScript type checking passes
- [x] Code committed to git
- [x] Fix pushed to GitHub (`restructure/backend-frontend-separation` branch)
- [ ] Render deployment triggered automatically
- [ ] Render build succeeds
- [ ] Production `/api/ai/chat` endpoint responds correctly
- [ ] No console errors in browser
- [ ] AI features work as expected

---

## Deployment Monitoring

### Render Deployment

**Branch**: `restructure/backend-frontend-separation`
**Commit**: `59d82ea`
**Expected Outcome**: Build succeeds without `DEFAULT_AI_CONFIG is not defined` error

### What to Watch For

1. **Build Phase**:
   - ✅ Compilation completes
   - ✅ "Collecting page data" succeeds
   - ✅ No ReferenceError

2. **Runtime Phase**:
   - ✅ `/api/ai/chat` route loads
   - ✅ AI service initializes
   - ✅ No undefined constants

3. **Edge Cases**:
   - Verify Edge Runtime compatibility
   - Check streaming responses work
   - Test with both Anthropic and OpenAI providers

---

## Additional Context

### Why This Error Only Appeared in Production

1. **Local Development**: TypeScript IDE may not catch runtime issues with type imports
2. **Next.js Dev Server**: More lenient with imports during HMR
3. **Production Build**: Strict compilation and optimization reveals the issue
4. **Edge Runtime**: Stricter execution environment in Render deployment

### TypeScript Configuration

Our `tsconfig.json` has strict mode enabled:
```json
{
  "compilerOptions": {
    "strict": true,
    "verbatimModuleSyntax": false,
    // ...
  }
}
```

**Note**: With `verbatimModuleSyntax: true`, TypeScript would have caught this error earlier. Consider enabling for future projects.

---

## Key Learnings

1. **Type vs Value Imports**: Always distinguish between type-only and value imports
2. **Runtime Validation**: Test production builds locally before deploying
3. **Edge Runtime**: More strict about undefined references
4. **Import Statements**: When in doubt, separate type and value imports
5. **Build Errors**: "Collecting page data" failures often indicate runtime issues with server components

---

## References

- [TypeScript: Type-Only Imports](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-exports)
- [Next.js Edge Runtime](https://nextjs.org/docs/app/api-reference/edge)
- [Next.js Build Process](https://nextjs.org/docs/app/building-your-application/deploying/production-checklist)

---

## Summary

**Issue**: `DEFAULT_AI_CONFIG` was imported as a type but used as a runtime value
**Fix**: Changed to value import: `import { AI_MODELS, DEFAULT_AI_CONFIG } from '@/src/types/ai.types'`
**Impact**: Resolves Render deployment build failure
**Prevention**: Always use value imports for constants used at runtime

The fix has been committed and pushed to GitHub. The Render deployment should now succeed.
