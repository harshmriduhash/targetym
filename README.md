<div align="center">

# 🎯 Targetym

### AI-Powered HR Management Platform

*Modern HR solution with Goals & OKRs, Recruitment Pipeline, Performance Management, and AI-powered insights*

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.58-green?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Clerk](https://img.shields.io/badge/Clerk-6.35.1-purple?style=for-the-badge&logo=clerk)](https://clerk.com)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

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
- Goal collaboration and sharing

</td>
<td width="50%">

### 👥 Recruitment Pipeline
- Job posting management
- Kanban-style candidate pipeline
- Interview scheduling & feedback
- **AI CV Scoring** (0-100 with insights)
- Source tracking and analytics
- Candidate notes and history

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
- Performance analytics

</td>
<td width="50%">

### 🤖 AI-Powered Features
- **CV Scoring**: Automatic candidate evaluation
- **Performance Synthesis**: AI-generated review summaries
- **Career Recommendations**: Personalized growth paths
- **Smart Insights**: Data-driven HR analytics

</td>
</tr>
<tr>
<td width="50%">

### 📈 KPIs & Analytics
- Custom KPI definitions
- Real-time measurements
- Configurable alerts
- Interactive dashboards
- Data visualization with Recharts

</td>
<td width="50%">

### 🔗 Integrations
- **Slack**: Notifications and updates
- **Google Workspace**: Calendar and Drive
- **Asana**: Project management
- **Notion**: Documentation sync
- **SharePoint**: Document management
- Extensible integration framework

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15.5.4](https://nextjs.org) (App Router)
- **UI Library**: [React 19.1.0](https://react.dev)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com), [DaisyUI](https://daisyui.com)
- **State Management**: [TanStack Query 5](https://tanstack.com/query)

### Backend
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **Authentication**: [Clerk 6.35.1](https://clerk.com)
- **API**: Next.js Server Actions & API Routes
- **ORM**: Supabase Client (TypeScript)

### AI & Integrations
- **AI SDK**: [Vercel AI SDK](https://sdk.vercel.ai)
- **Models**: OpenAI GPT-4o, Anthropic Claude 3.5
- **Rate Limiting**: [Upstash Redis](https://upstash.com)

### Development Tools
- **Package Manager**: [pnpm 10.18.1](https://pnpm.io)
- **Testing**: [Jest 30](https://jestjs.io), [React Testing Library](https://testing-library.com)
- **Linting**: ESLint 9
- **Type Checking**: TypeScript strict mode

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 24.0.0
- **pnpm** >= 10.0.0
- **Supabase CLI** (for local development)
- **Git**

#### Installing pnpm

If you don't have pnpm installed, you can install it using one of the following methods:

**Method 1: Using Corepack (Recommended)**
```bash
# Enable Corepack (comes with Node.js 16.10+)
corepack enable

# Prepare and activate pnpm 10.18.1
corepack prepare pnpm@10.18.1 --activate

# Verify installation
pnpm --version  # Should show 10.18.1
```

**Method 2: Using npm**
```bash
npm install -g pnpm@10.18.1

# Verify installation
pnpm --version  # Should show 10.18.1
```

**Method 3: Using Homebrew (macOS/Linux)**
```bash
brew install pnpm

# Verify installation
pnpm --version  # Should show 10.x or higher
```

**Method 4: Using standalone installation script**
```bash
# On Windows (PowerShell)
iwr https://get.pnpm.io/install.ps1 -useb | iex

# On macOS/Linux
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Harshmriduhash/targetym.git
   cd targetym
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   - Clerk API keys from [Clerk Dashboard](https://dashboard.clerk.com)
   - Supabase credentials from [Supabase Dashboard](https://supabase.com/dashboard)

4. **Start Supabase locally** (optional)
   ```bash
   pnpm run supabase:start
   ```

5. **Run database migrations**
   ```bash
   pnpm run supabase:push
   ```

6. **Start development server**
   ```bash
   pnpm run dev
   ```

7. **Open your browser**
   ```
   http://localhost:3000
   ```

### First-Time Setup

```bash
# Validate environment setup
pnpm run setup

# Check authentication configuration
pnpm run check:auth

# Validate production environment (before deployment)
pnpm run validate:production
```

---

## 📁 Project Structure

```
targetym/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Dashboard routes
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── onboarding/        # Onboarding flow
├── src/
│   ├── actions/           # Server Actions (62 files)
│   ├── components/        # React components (50+)
│   ├── lib/               # Utilities & services
│   │   ├── services/      # Business logic layer
│   │   ├── middleware/    # Rate limiting, error handling
│   │   └── utils/         # Helper functions
│   └── types/             # TypeScript types
├── supabase/
│   ├── migrations/        # Database migrations (38 files)
│   └── config.toml       # Supabase configuration
├── components/            # Shared UI components
├── docs/                  # Documentation (80+ files)
├── scripts/               # Utility scripts
└── __tests__/             # Test files
```

---

## 💻 Development

### Available Scripts

```bash
# Development
pnpm run dev              # Start dev server with Turbopack
pnpm run build            # Build for production
pnpm run start            # Start production server

# Database
pnpm run supabase:start   # Start local Supabase
pnpm run supabase:stop    # Stop local Supabase
pnpm run supabase:push    # Push migrations to Supabase
pnpm run supabase:types   # Generate TypeScript types

# Testing
pnpm run test             # Run all tests
pnpm run test:watch       # Run tests in watch mode
pnpm run test:coverage    # Generate coverage report
pnpm run test:unit        # Run unit tests only
pnpm run test:integration # Run integration tests

# Code Quality
pnpm run lint             # Run ESLint
pnpm run type-check       # TypeScript type checking
pnpm run check:all        # Run all checks

# Validation
pnpm run validate:production  # Validate production env vars
```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the [coding guidelines](./docs/CODING_GUIDELINES.md)
   - Write tests for new features
   - Update documentation

3. **Run tests and checks**
   ```bash
   pnpm run check:all
   pnpm run test
   ```

4. **Commit and push**
   ```bash
   git commit -m "feat: add new feature"
   git push origin feature/your-feature-name
   ```

---

## 🧪 Testing

### Test Structure

- **Unit Tests**: `__tests__/unit/` - Test individual functions and components
- **Integration Tests**: `__tests__/integration/` - Test API routes and server actions
- **E2E Tests**: `__tests__/e2e/` - Test complete user flows

### Running Tests

```bash
# Run all tests
pnpm run test

# Run specific test suite
pnpm run test:unit
pnpm run test:integration

# Watch mode
pnpm run test:watch

# Coverage report
pnpm run test:coverage
```

### Test Coverage

Current coverage: **65.63%** (Target: 80%+)

---

## 🚀 Deployment

### Render Deployment

Targetym is configured for deployment on [Render](https://render.com). See the complete deployment guide:

📖 **[Complete Deployment Guide](./docs/DEPLOYMENT_RENDER_CLERK_SUPABASE.md)**

### Quick Deploy Steps

1. **Connect GitHub to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Connect your GitHub repository

2. **Configure Environment Variables**
   - Set all required variables in Render Dashboard
   - See [Environment Variables Reference](./docs/ENV_VARIABLES_REFERENCE.md)

3. **Deploy**
   - Render will auto-deploy on push to `main` branch
   - Or trigger manual deploy from Render Dashboard

### Environment Variables

Required variables for production:

- **Clerk**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`
- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **App**: `NEXT_PUBLIC_APP_URL`, `NODE_ENV`

See [Environment Variables Reference](./docs/ENV_VARIABLES_REFERENCE.md) for complete list.

---

## 📚 API Documentation

### REST API

Targetym provides a RESTful API for external integrations:

- **Base URL**: `https://your-app.onrender.com/api/v1`
- **Documentation**: [API Design Document](./docs/API_DESIGN.md)
- **OpenAPI Spec**: [docs/api/openapi.yaml](./docs/api/openapi.yaml)

### Server Actions

For Next.js frontend integration, use Server Actions:

```typescript
import { getGoals, createGoal } from '@/src/actions/goals'

// Get goals
const { data, error } = await getGoals({ filters: { status: 'active' } })

// Create goal
const result = await createGoal({
  title: 'Increase revenue by 20%',
  period: 'Q1',
})
```

See [API Quick Reference](./docs/API_QUICK_REFERENCE.md) for more examples.

---

## 🔒 Security

### Authentication & Authorization

- **Authentication**: Clerk (JWT-based)
- **Authorization**: Role-based access control (RBAC)
- **Roles**: `admin`, `hr`, `manager`, `employee`

### Database Security

- **Row Level Security (RLS)**: Enabled on all tables
- **Multi-tenant Isolation**: Organization-based data separation
- **Audit Logging**: Comprehensive audit trail

### Security Features

- ✅ CSRF protection
- ✅ XSS prevention
- ✅ SQL injection protection (via Supabase)
- ✅ Rate limiting (Upstash Redis)
- ✅ Secure headers (CSP, X-Frame-Options, etc.)
- ✅ Input validation (Zod schemas)

See [Security Audit Report](./docs/SECURITY_AUDIT_REPORT.md) for details.

---

## 📖 Documentation

Comprehensive documentation is available in the `docs/` directory:

### Key Documents

- **[Deployment Guide](./docs/DEPLOYMENT_RENDER_CLERK_SUPABASE.md)** - Complete deployment instructions
- **[API Design](./docs/API_DESIGN.md)** - API architecture and patterns
- **[Database Architecture](./docs/DATABASE_ARCHITECTURE_COMPREHENSIVE_ANALYSIS.md)** - Database schema and design
- **[Security Guide](./docs/SECURITY_AUDIT_REPORT.md)** - Security best practices
- **[Integration Guide](./docs/INTEGRATION_USER_GUIDE.md)** - Third-party integrations

### Quick References

- [Environment Variables](./docs/ENV_VARIABLES_REFERENCE.md)
- [API Quick Reference](./docs/API_QUICK_REFERENCE.md)
- [Testing Guide](./docs/TESTING_GUIDE.md)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Write tests** for new features
5. **Run checks** (`pnpm run check:all`)
6. **Commit** with descriptive messages
7. **Push** to your branch (`git push origin feature/amazing-feature`)
8. **Open a Pull Request**

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier
- Write self-documenting code
- Add JSDoc comments for public APIs

---

## 📊 Project Status

### Current Version: 0.1.0

### Completed Features ✅

- [x] Goals & OKRs management
- [x] Recruitment pipeline
- [x] Performance reviews
- [x] AI CV scoring
- [x] AI performance synthesis
- [x] Multi-tenant architecture
- [x] Role-based access control
- [x] Database migrations
- [x] API documentation
- [x] Deployment configuration

### In Progress 🚧

- [ ] Enhanced AI features
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] More integrations

### Roadmap 🗺️

See [Roadmap](./docs/ROADMAP.md) for planned features.

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Supabase](https://supabase.com) - Backend as a Service
- [Clerk](https://clerk.com) - Authentication
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Vercel AI SDK](https://sdk.vercel.ai) - AI integration

---

## 📞 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/harshmriduhash/targetym/issues)
- **Discussions**: [GitHub Discussions](https://github.com/harshmriduhash/targetym/discussions)

---

<div align="center">

**Built with ❤️ by the Targetym Team**

[⭐ Star us on GitHub](https://github.com/Harshmriduhash/targetym) • [📖 Read the Docs](./docs/) • [🚀 Deploy Now](./docs/DEPLOYMENT_RENDER_CLERK_SUPABASE.md)

</div>
