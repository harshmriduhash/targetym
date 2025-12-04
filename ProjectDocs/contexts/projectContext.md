## Project Context

### Overview
- Build BA Copilot, a Next.js 15 App Router application targeting BA workflows, hosted on Vercel/Replit.
- Focus on AI-assisted BPMN diagramming with supporting sections (documents, artifacts, toolkit).

### Stack & Architecture
- Next.js App Router with React Server Components where possible; avoid Pages Router patterns.
- Primary auth via Clerk; ensure `clerkMiddleware` (proxy pattern) and `ClerkProvider` wrap.
- Data layer powered by Supabase (auth + database) with type safety; prefer server actions and API routes for backend logic.
- State management uses Zustand for client-side needs; styling leverages Tailwind, Shadcn UI, and Material UI where appropriate.

### Key Guidelines
- Emphasize simplicity, readability, and minimal code changes; files should stay under 150 lines when feasible.
- Prefer functional, immutable patterns and descriptive naming; use early returns to reduce nesting.
- Add concise comments only for non-obvious logic; avoid TODOs unless flagging known issues.
- Maintain PWA readiness, responsive design, and good Web Vitals (LCP, CLS, FID).

### Documentation Expectations
- Maintain Build Notes for each task under `ProjectDocs/Build_Notes`.
- Update context files only for substantial scope or requirement changes; reference them before implementation.

### Auth & Access UX
- Provide seamless Clerk sign-in/sign-up flows via `/auth/sign-in` and `/auth/sign-up`.
- Marketing CTAs (e.g., “Démarrer”, “Se connecter”) should route to Clerk auth experiences to keep funnel consistent.

