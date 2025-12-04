## Task Objective
- Ensure every “Se connecter” and “Démarrer” CTA in marketing surfaces routes users to Clerk’s `/auth/sign-in` experience.

## Current State Assessment
- Marketing header links still target `/auth/signin` and `/auth/signup`, causing inconsistent routing and missing Clerk styling.
- Hero button “Démarrer gratuitement” leads to sign-up instead of the requested Clerk login page; pricing CTAs vary by tier.
- Clerk auth pages already exist under `/auth/sign-in` with customized appearance.

## Future State Goal
- All marketing CTAs labeled “Se connecter”, “Démarrer”, or “Commencer gratuitement” reliably open `/auth/sign-in`, ensuring the Clerk SignIn page handles both entry points.

## Implementation Plan
1. **Audit CTA Links**
   - [ ] Identify every marketing CTA referencing `/auth/signin`, `/auth/signup`, or `/auth/sign-up`.
2. **Normalize Routes**
   - [ ] Update header buttons to reference `/auth/sign-in`.
   - [ ] Point hero “Démarrer” button to `/auth/sign-in`.
   - [ ] Route pricing CTAs that previously targeted sign-up to `/auth/sign-in`; keep enterprise contact CTA untouched.
3. **Validation**
   - [ ] Manually verify navigation flows hit `/auth/sign-in` in dev server once tests are possible.

