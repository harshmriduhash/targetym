<div align="center">

# 🎯 Targetym

### AI-Powered HR Management Platform

*Modern HR solution with Goals & OKRs, Recruitment Pipeline, Performance Management, and AI-powered insights*

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.58-green?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Supabase Auth](https://img.shields.io/badge/Auth-Supabase-green?style=for-the-badge&logo=supabase)](https://supabase.com/auth)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Demo](#-demo)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Roadmap](#-roadmap)

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎯 Goals & OKRs
- Create and track organizational goals
- Key Results with real-time progress
- Multiple periods (quarterly, annual, custom)
- Visibility controls (private, team, org-wide)
- Interactive progress tracking dashboard

</td>
<td width="50%">

### 👥 Recruitment Pipeline
- Job posting management
- Kanban-style candidate pipeline
- Interview scheduling & feedback
- **AI CV Scoring** (0-100 with insights)
- Source tracking and analytics

</td>
</tr>
<tr>
<td width="50%">

### 📊 Performance Management
- Review cycles (quarterly, annual)
- Multi-rating performance reviews
- 360° feedback (peer, manager, self)
- **AI Performance Synthesis**
- **AI Career Recommendations**

</td>
<td width="50%">

### 🤖 AI-Powered Features
- **CV Scoring**: Automatic candidate evaluation
- **Performance Insights**: AI-generated trends
- **Career Paths**: Personalized recommendations
- OpenAI GPT-4o & Anthropic Claude 3.5
- Graceful fallbacks (works without AI)

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 20+
npm or pnpm
Supabase account (free tier available)
Optional: OpenAI or Anthropic API key
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/badalot/targetym.git
cd targetym

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Start Supabase locally
npm run supabase:start

# 5. Apply database migrations
npm run supabase:reset

# 6. Generate TypeScript types
npm run supabase:types

# 7. Start development server
npm run dev
```

🎉 Open [http://localhost:3000](http://localhost:3000) in your browser!

### Environment Variables

Create a `.env.local` file:

```bash
# Supabase (Required - includes authentication)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Better Auth (Configured automatically with Supabase)
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000

# AI Features (Optional)
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🛠 Tech Stack

<table>
<tr>
<td width="33%" align="center">

### Frontend
![Next.js](https://img.shields.io/badge/-Next.js_15-000000?style=flat&logo=next.js)
![React](https://img.shields.io/badge/-React_19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/-Tailwind_CSS_4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/-shadcn/ui-000000?style=flat)

</td>
<td width="33%" align="center">

### Backend
![Supabase](https://img.shields.io/badge/-Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-336791?style=flat&logo=postgresql&logoColor=white)
![Better Auth](https://img.shields.io/badge/-Better_Auth-000000?style=flat)
![Server Actions](https://img.shields.io/badge/-Server_Actions-000000?style=flat)

</td>
<td width="33%" align="center">

### AI & Testing
![OpenAI](https://img.shields.io/badge/-OpenAI-412991?style=flat&logo=openai&logoColor=white)
![Anthropic](https://img.shields.io/badge/-Claude-181818?style=flat)
![Jest](https://img.shields.io/badge/-Jest-C21325?style=flat&logo=jest&logoColor=white)
![Testing Library](https://img.shields.io/badge/-Testing_Library-E33332?style=flat&logo=testing-library&logoColor=white)

</td>
</tr>
</table>

**Key Technologies:**
- **Next.js 15.5.4** with App Router & Turbopack
- **React 19** with Server Components
- **TypeScript** (strict mode)
- **Supabase** for database, authentication & realtime features
- **Better Auth** integrated with Supabase for user management
- **Tailwind CSS 4** + **shadcn/ui** for styling
- **React Query** for server state management
- **Zod** for validation
- **Jest** + **React Testing Library** for testing

---

## 📁 Project Structure

```
targetym/
├── src/
│   ├── actions/              # Server Actions (Next.js)
│   │   ├── goals/           # 7 actions for Goals & OKRs
│   │   ├── recruitment/     # 13 actions for hiring
│   │   ├── performance/     # 7 actions for reviews
│   │   └── ai/              # 3 AI-powered actions
│   │
│   ├── lib/
│   │   ├── services/        # Business logic layer
│   │   │   ├── goals.service.ts
│   │   │   ├── recruitment.service.ts
│   │   │   ├── performance.service.ts
│   │   │   └── ai.service.ts
│   │   ├── validations/     # Zod schemas
│   │   ├── supabase/        # DB clients (server, client, middleware)
│   │   └── utils/           # Helper functions
│   │
│   ├── components/          # React components
│   │   ├── goals/
│   │   ├── recruitment/
│   │   ├── performance/
│   │   └── ui/              # shadcn/ui components
│   │
│   └── types/
│       ├── database.types.ts    # Auto-generated from Supabase
│       └── modules.types.ts     # Application types
│
├── app/                     # Next.js App Router
│   ├── auth/               # Better Auth pages (sign-in, sign-up)
│   ├── (marketing)/        # Landing page
│   ├── dashboard/          # Protected dashboard routes
│   │   ├── goals/
│   │   ├── recruitment/
│   │   └── performance/
│   └── api/
│       └── auth/           # Better Auth API routes
│
├── supabase/
│   ├── migrations/         # Database migrations (10+)
│   └── tests/              # RLS policy tests
│
├── __tests__/              # Test suites
│   ├── unit/              # Unit tests (60+ tests)
│   └── integration/       # Integration tests
│
└── docs/                   # Documentation
```

---

## 💻 Development

### Available Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking

# Database
npm run supabase:start   # Start local Supabase
npm run supabase:stop    # Stop local Supabase
npm run supabase:reset   # Reset DB and apply migrations
npm run supabase:types   # Generate TypeScript types
npm run supabase:push    # Push migrations to production

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report (80% threshold)
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes following TDD**
   - Write tests first
   - Implement feature
   - Run tests: `npm test`

3. **Check code quality**
   ```bash
   npm run lint
   npm run type-check
   npm run test:coverage
   ```

4. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug"
   git commit -m "docs: update README"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

---

## 🧪 Testing

### Test Suite Overview

```bash
# Run specific test file
npm test -- path/to/test.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create goal"

# Run with coverage
npm run test:coverage
```

### Coverage Report

| Module            | Tests | Status | Coverage |
|-------------------|-------|--------|----------|
| Goals Service     | 23    | ✅     | 85%      |
| Recruitment       | 19    | ✅     | 82%      |
| Performance       | 16    | ✅     | 80%      |
| AI Service        | 8     | ✅     | 75%      |
| **Overall**       | **66+** | **✅** | **80%+** |

### Test Categories

- **Unit Tests**: Service layer, utilities, validation
- **Integration Tests**: Server Actions, API routes
- **Component Tests**: React components with user interactions
- **RLS Tests**: Database security policies

---

## 🗄️ Database

### Schema Overview

**Core Tables:**
- `organizations` - Multi-tenant container
- `user`, `session`, `account` - Better Auth tables (authentication)
- `profiles` - User profiles (linked to Better Auth)
- `goals`, `key_results`, `goal_collaborators` - Goals & OKRs
- `job_postings`, `candidates`, `interviews` - Recruitment
- `performance_reviews`, `performance_ratings`, `peer_feedback` - Performance
- `kpis`, `kpi_measurements`, `kpi_alerts` - KPI tracking

**Security:**
- Row Level Security (RLS) on all tables
- Organization-based isolation
- Role-based access control (admin, hr, manager, employee)
- 25+ security policies

### Database Commands

```bash
# Create new migration
npx supabase migration new migration_name

# Apply migrations locally
npm run supabase:reset

# Apply to production
npx supabase link --project-ref your-project-ref
npm run supabase:push

# Generate TypeScript types
npm run supabase:types

# Test RLS policies
npm run supabase:test
```

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy!

3. **Configure Better Auth**
   - Set `BETTER_AUTH_URL` to your production domain
   - Set `BETTER_AUTH_SECRET` (generate with `openssl rand -base64 32`)
   - Enable email provider in Supabase (optional)
   - Configure OAuth providers if needed

4. **Apply Database Migrations**
   ```bash
   npx supabase link --project-ref your-project-ref
   npm run supabase:push
   ```

### Environment Variables Checklist

✅ Supabase credentials (URL, anon key, service role key)
✅ Better Auth configuration (secret, URL)
✅ AI API keys (optional)
✅ Node environment

---

## 📚 Documentation

### Quick Links

| Document | Description |
|----------|-------------|
| **[QUICK_START.md](QUICK_START.md)** | 5-minute setup guide |
| **[CLAUDE.md](CLAUDE.md)** | Project instructions for Claude Code |
| **[DATABASE_COMMANDS.md](DATABASE_COMMANDS.md)** | Supabase CLI reference |
| **[AI_SETUP.md](AI_SETUP.md)** | AI features configuration |
| **[TESTING_GUIDE.md](TESTING_GUIDE.md)** | Testing best practices |
| **[RLS_AUDIT_SUMMARY.md](RLS_AUDIT_SUMMARY.md)** | Security audit report |
| **[DOCS_INDEX.md](DOCS_INDEX.md)** | Complete documentation index |

### Architecture Guides

- **[BETTER_AUTH_IMPLEMENTATION.md](BETTER_AUTH_IMPLEMENTATION.md)** - Better Auth integration
- **[FRONTEND_OPTIMIZATIONS.md](FRONTEND_OPTIMIZATIONS.md)** - Performance guide
- **[BACKEND_OPTIMIZATIONS.md](BACKEND_OPTIMIZATIONS.md)** - Backend patterns
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Database migrations

---

## 🔐 Security

### Authentication & Authorization
- **Better Auth** with Supabase integration for user authentication
- **Supabase RLS** enforces data access policies
- JWT-based session management
- Organization-based multi-tenancy

### Data Protection
- SQL injection prevention (parameterized queries)
- XSS protection (React escaping + CSP)
- CSRF protection (Next.js SameSite cookies)
- Input validation with Zod schemas
- Secure password storage (Better Auth with bcrypt)

### Security Features
- Row Level Security on all tables
- API rate limiting
- Webhook signature verification
- Environment variable validation
- Audit logging (ready)

---

## 📊 Project Status

### ✅ Phase 2: Complete (100%)

| Module | Backend | Frontend | Tests | AI | Status |
|--------|---------|----------|-------|----|----|
| Goals & OKRs | ✅ | ✅ | ✅ | ➖ | ✅ Complete |
| Recruitment | ✅ | ✅ | ✅ | ✅ | ✅ Complete |
| Performance | ✅ | ✅ | ✅ | ✅ | ✅ Complete |
| KPIs | ✅ | ✅ | ✅ | ➖ | ✅ Complete |
| Settings | ✅ | ✅ | ✅ | ➖ | ✅ Complete |

**Deliverables:**
- ✅ 5,000+ lines of production code
- ✅ 66+ unit tests with 80%+ coverage
- ✅ 30+ Server Actions
- ✅ 15+ React components
- ✅ 10+ database migrations
- ✅ 20+ documentation files
- ✅ AI-powered features
- ✅ Multi-tenant architecture
- ✅ Production-ready deployment

---

## 🗓️ Roadmap

### Phase 3: Advanced Features (Planned)

- [ ] **Learning & Development**
  - Training modules and courses
  - Skills matrix and gap analysis
  - Certification tracking

- [ ] **Career Development**
  - Career paths and succession planning
  - Internal job postings
  - Onboarding workflows

- [ ] **Analytics & Reporting**
  - Advanced dashboard customization
  - Custom report builder
  - Data export functionality

- [ ] **Integrations**
  - Microsoft Teams integration
  - Slack notifications
  - Calendar sync (Google, Outlook)
  - SharePoint document management

### Future Enhancements

- [ ] Mobile application (React Native)
- [ ] Advanced AI features (sentiment analysis, prediction)
- [ ] Multi-language support (i18n)
- [ ] Workflow automation builder
- [ ] Advanced permission system
- [ ] Two-factor authentication
- [ ] Compliance reporting (GDPR, SOC2)

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Contributing Guidelines

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Follow** our coding standards:
   - TypeScript strict mode
   - Write tests (TDD approach)
   - Use conventional commits
   - Update documentation
4. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
5. **Push** to the branch (`git push origin feature/amazing-feature`)
6. **Open** a Pull Request

### Development Standards

- ✅ TypeScript strict mode
- ✅ 80%+ test coverage
- ✅ ESLint + Prettier formatting
- ✅ Conventional commits
- ✅ Documentation updates
- ✅ RLS policies for new tables

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with amazing open-source tools:

- [Next.js](https://nextjs.org) - The React Framework for Production
- [Supabase](https://supabase.com) - Open Source Firebase Alternative
- [Better Auth](https://better-auth.com) - Type-safe authentication for TypeScript
- [shadcn/ui](https://ui.shadcn.com) - Re-usable components built with Radix UI
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [OpenAI](https://openai.com) & [Anthropic](https://anthropic.com) - AI capabilities

---

## 💬 Support & Contact

- **📖 Documentation**: [DOCS_INDEX.md](DOCS_INDEX.md)
- **🐛 Report Issues**: [GitHub Issues](https://github.com/badalot/targetym/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/badalot/targetym/discussions)
- **📧 Email**: support@targetym.com

---

<div align="center">

### ⭐ Star us on GitHub!

If you find Targetym useful, please consider giving it a star ⭐

**Made with ❤️ by the Targetym Team**

*Powered by Claude Code*

---

*Last Updated: January 2025 • Version: Phase 2 Complete*

[Back to Top ↑](#-targetym)

</div>
