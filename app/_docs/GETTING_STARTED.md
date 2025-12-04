# Getting Started with Targetym

Welcome to Targetym! This guide will help you get up and running in 15 minutes.

## Choose Your Path

### Path 1: First Time Setting Up (15 minutes)
→ Follow `DEVELOPER_SETUP.md`

This is the complete setup guide with:
- Prerequisites checklist
- Step-by-step environment configuration
- Verification tests to confirm everything works
- Common commands reference

**Time needed:** 15 minutes

### Path 2: Something Isn't Working
→ Check `TROUBLESHOOTING.md`

This guide has solutions for:
- Environment & setup issues
- Authentication problems
- Database issues
- Build & type errors
- Performance issues
- Production deployment issues

**How to use:**
```bash
# First, validate your setup
npm run check:all

# Then find your issue in TROUBLESHOOTING.md
```

### Path 3: Need to Look Up a Command
→ Use `DEVELOPMENT_QUICK_REFERENCE.md`

This is a quick reference with:
- Commands by task
- Environment variables
- File locations
- Code patterns
- Keyboard shortcuts

**Best for:** "What's the command to...?"

### Path 4: Understanding TypeScript Errors
→ Read `TYPESCRIPT_ERRORS.md`

This explains:
- What each error means
- Why it happens
- How to fix it
- How to prevent it

**Use when:** You see TypeScript errors

### Path 5: Advanced Clerk Setup
→ Read `CLERK_QUICK_START.md` and `CLERK_CONFIGURATION.md`

These cover:
- Detailed Clerk configuration
- Webhook setup
- OAuth providers
- Production deployment

**Use for:** Advanced auth features

### Path 6: Understanding Architecture
→ Read `CLAUDE.md`

This explains:
- Project structure
- Architecture patterns
- Database design
- Code organization
- Testing approach

**Use for:** Understanding the big picture

## Quick Start (TL;DR)

```bash
# 1. Install dependencies
pnpm install

# 2. Validate environment setup
npm run setup

# 3. Copy and configure environment file
cp .env.production.example .env.local
# Then add your Clerk and Supabase keys

# 4. Start development
npm run dev:fresh

# 5. Verify everything works
# Visit http://localhost:3001
# Create a test account at /auth/sign-up
# You should be redirected to /dashboard
```

If anything fails, run `npm run check:all` and check `TROUBLESHOOTING.md`.

## Essential Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production

# Validation
npm run setup            # Check environment variables
npm run check:auth       # Check Clerk configuration
npm run check:all        # Full validation

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode (TDD)

# Database
npm run supabase:start   # Start local database
npm run supabase:reset   # Reset database with migrations

# Quality
npm run lint             # Check code style
npm run type-check       # Check TypeScript types
```

## Documentation Map

| Document | When to Read | Time |
|----------|--------------|------|
| **This file** | Right now | 2 min |
| `DEVELOPER_SETUP.md` | Setting up for the first time | 15 min |
| `DEVELOPMENT_QUICK_REFERENCE.md` | Looking up commands | 30 sec |
| `TROUBLESHOOTING.md` | Something isn't working | 5 min |
| `TYPESCRIPT_ERRORS.md` | Understanding type errors | 10 min |
| `CLERK_QUICK_START.md` | Setting up Clerk auth | 20 min |
| `CLERK_CONFIGURATION.md` | Advanced Clerk features | 30 min |
| `CLAUDE.md` | Understanding architecture | 20 min |
| `DX_OPTIMIZATION_SUMMARY.md` | For team leads | 10 min |

## Diagnostic Commands

These commands help diagnose problems:

```bash
# Check everything at once
npm run check:all

# Or check individual areas
npm run setup            # Environment variables
npm run check:auth       # Clerk authentication
npm run check:health     # TypeScript & linting

# See what's happening
npm run dev -- --verbose  # Verbose dev server
npm run build --verbose   # Verbose build
npm test -- --verbose    # Verbose tests
```

## Common Tasks

### Create a Test Account

```
1. npm run dev:fresh
2. Visit http://localhost:3001/auth/sign-up
3. Fill in form and submit
4. You should see /dashboard
5. Check Supabase to verify profile was created
```

### Check Database

```
# Start Supabase
npm run supabase:start

# Open admin UI
http://localhost:54323

# View tables in left panel
# Find profiles table and check your test user
```

### Run Tests

```bash
npm test                          # Run all tests
npm run test:watch               # Watch mode
npm test -- path/to/test.ts      # Single test file
npm test -- --testNamePattern="pattern"  # Matching tests
```

### Fix Type Errors

```bash
# See all errors
npm run type-check

# Clear cache and rebuild
npm run type-check:clean

# Then review TYPESCRIPT_ERRORS.md for explanations
```

## Need Help?

1. **First, run diagnostics:**
   ```bash
   npm run check:all
   ```

2. **Search relevant doc:**
   - Is it a setup issue? → `DEVELOPER_SETUP.md`
   - Is it a command? → `DEVELOPMENT_QUICK_REFERENCE.md`
   - Is it a problem? → `TROUBLESHOOTING.md`
   - Is it a type error? → `TYPESCRIPT_ERRORS.md`

3. **Check your output:**
   - `npm run setup` shows what's missing
   - `npm run check:auth` diagnoses Clerk issues
   - Browser console shows client errors
   - Terminal shows server errors

4. **Ask the team:**
   - Include output from `npm run check:all`
   - Include error messages
   - Describe what you were trying to do
   - Describe what happened instead

## What You'll Build

Targetym is an AI-powered HR management platform with:

- **Goals & OKRs** - Set and track organizational goals
- **Recruitment Pipeline** - Manage job postings and candidates
- **Performance Management** - Review and rate employee performance
- **AI Insights** - Powered by OpenAI/Claude

Built with:
- Next.js 15.5.4 (React 19, Turbopack)
- TypeScript (strict mode)
- Clerk authentication
- Supabase (PostgreSQL)
- Tailwind CSS 4
- shadcn/ui components

## Tech Stack Overview

```
Frontend Layer (Next.js 15.5.4 + React 19)
├── Components (shadcn/ui + Tailwind CSS)
├── Forms (React Hook Form + Zod)
└── State (React Query)

Auth Layer (Clerk)
├── Sign-in/Sign-up pages
├── Webhook integration
└── User sync to Supabase

Backend Layer (Supabase)
├── PostgreSQL database
├── RLS policies (multi-tenant)
├── Server Actions
└── Services layer (business logic)

AI Layer (Optional)
├── OpenAI GPT-4
└── Anthropic Claude
```

## Next Steps

1. **Complete the 15-minute setup** → `DEVELOPER_SETUP.md`
2. **Verify everything works** → Run verification tests in DEVELOPER_SETUP.md
3. **Pick a feature** → Start coding!
4. **When stuck** → Check `TROUBLESHOOTING.md`
5. **Before committing** → Run `npm run check:all`

## Pro Tips

- **Always run `npm run check:all` before asking for help** - It usually shows what's wrong
- **Keep `DEVELOPMENT_QUICK_REFERENCE.md` nearby** - You'll use it constantly
- **Read error messages carefully** - They usually explain the fix
- **Use `npm run test:watch`** - Great for TDD and learning
- **Check browser console (F12)** - Client errors show up there

## Quick Reference

| Need | Run | Or Read |
|------|-----|---------|
| Setup validation | `npm run setup` | DEVELOPER_SETUP.md |
| Clerk help | `npm run check:auth` | CLERK_QUICK_START.md |
| Command lookup | - | DEVELOPMENT_QUICK_REFERENCE.md |
| Troubleshooting | `npm run check:all` | TROUBLESHOOTING.md |
| Type errors | `npm run type-check` | TYPESCRIPT_ERRORS.md |

---

## Let's Get Started!

Ready? Open `DEVELOPER_SETUP.md` and follow the 4 steps. You'll be running the app in 15 minutes!

```bash
# Step 1: Install
pnpm install

# Step 2: Validate
npm run setup

# Step 3: Configure
cp .env.production.example .env.local
# Add your Clerk and Supabase keys

# Step 4: Run
npm run dev:fresh

# 🎉 Visit http://localhost:3001
```

Welcome to the team! Happy coding!

---

**Questions?** Check the relevant documentation above.
**Something broken?** Run `npm run check:all` and check `TROUBLESHOOTING.md`.
**Still stuck?** Ask the team with your `npm run check:all` output.
