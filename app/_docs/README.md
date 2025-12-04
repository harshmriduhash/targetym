# Targetym Component Registry Documentation

Welcome to the Targetym Component Registry documentation. This registry provides a comprehensive collection of reusable, accessible, and well-tested components for building enterprise HR management applications.

## Overview

The Targetym Registry contains components organized into the following categories:

- **UI Components** - Core UI building blocks (buttons, inputs, dialogs, forms)
- **Goals & OKRs** - Components for goal management and OKR tracking
- **Recruitment** - Job posting, candidate pipeline, and interview scheduling
- **Performance** - Performance reviews and analytics
- **Charts** - Data visualization components
- **Dashboard** - Layout and navigation components

## Getting Started

### Installation

All components are part of the Targetym monorepo and can be imported directly:

```typescript
import { Button } from '@/components/ui/button'
import { GoalForm } from '@/src/components/goals/GoalForm'
```

### Component Structure

Each component in the registry follows a consistent structure:

1. **Implementation** - The component source code
2. **Documentation** - Detailed API reference and usage guide
3. **Examples** - Live examples demonstrating various use cases
4. **Tests** - Comprehensive test suite with >90% coverage
5. **Accessibility** - WCAG 2.1 AA compliance

### Using Components

All components are designed with:

- **TypeScript** - Full type safety
- **Accessibility** - WCAG 2.1 AA compliant
- **Responsive Design** - Mobile-first approach
- **Dark Mode** - Full theme support
- **Testing** - Thoroughly tested with Jest and React Testing Library

## Component Categories

### UI Components

Core UI building blocks built on Radix UI primitives with custom styling:

- [Button](./ui/button.md) - Versatile button component
- [Input](./ui/input.md) - Form input with validation
- [Card](./ui/card.md) - Container component
- [Dialog](./ui/dialog.md) - Modal dialog
- [Form](./ui/form.md) - Form wrapper with React Hook Form

### Goals & OKRs

Components for managing organizational goals and OKRs:

- [GoalForm](./goals/goal-form.md) - Create and edit goals
- [OKRDashboard](./goals/okr-dashboard.md) - Visualize OKRs
- [ProgressTracker](./goals/progress-tracker.md) - Track progress

### Recruitment

Components for the recruitment pipeline:

- [JobPostingForm](./recruitment/job-posting-form.md) - Manage job postings
- [CandidatePipeline](./recruitment/candidate-pipeline.md) - Kanban-style pipeline
- [InterviewScheduler](./recruitment/interview-scheduler.md) - Schedule interviews

### Performance

Components for performance management:

- [ReviewForm](./performance/review-form.md) - Performance reviews
- [PerformanceDashboard](./performance/performance-dashboard.md) - Analytics dashboard

### Charts

Data visualization components:

- [GoalsProgressChart](./charts/goals-progress-chart.md) - Goal progress visualization
- [TeamPerformanceChart](./charts/team-performance-chart.md) - Team metrics
- [RecruitmentPipelineChart](./charts/recruitment-pipeline-chart.md) - Pipeline funnel

### Dashboard

Layout and navigation components:

- [DashboardSidebar](./dashboard/dashboard-sidebar.md) - Responsive sidebar
- [DashboardHeader](./dashboard/dashboard-header.md) - Header with user menu

## Standards & Best Practices

### Code Quality

- **TypeScript Strict Mode** - All components use strict TypeScript
- **ESLint** - Enforced code quality rules
- **Prettier** - Consistent code formatting
- **Test Coverage** - Minimum 90% coverage required

### Accessibility

All components follow WCAG 2.1 AA guidelines:

- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader support

### Performance

- Server Components by default
- Client Components only when necessary
- Code splitting and lazy loading
- Optimized bundle sizes (max 50kb per component)

### Security

- Input validation with Zod
- XSS protection
- CSRF protection
- Regular security audits

## Development Workflow

### Adding a New Component

1. **Create Component** - Implement in appropriate directory
2. **Add to Registry** - Update `@resty.json` with metadata
3. **Write Documentation** - Create detailed docs in `app/_docs/`
4. **Create Examples** - Add usage examples in `examples/`
5. **Write Tests** - Achieve >90% coverage
6. **Build Registry** - Run `pnpm registry:build`

### Testing Components

```bash
# Run tests for specific component
npm test -- ComponentName

# Run tests with coverage
npm run test:coverage

# Run accessibility tests
npm run test:a11y
```

### Building the Registry

```bash
# Build all registry components
pnpm registry:build

# Validate registry configuration
pnpm registry:validate

# Publish registry (CI/CD only)
pnpm registry:publish
```

## CI/CD Pipeline

The registry uses automated CI/CD workflows:

1. **Lint & Type Check** - Code quality validation
2. **Unit Tests** - Jest test suite
3. **Integration Tests** - Component integration
4. **Accessibility Tests** - Automated a11y checks
5. **Security Scan** - Vulnerability scanning
6. **Build** - Generate registry artifacts
7. **Publish** - Deploy to registry

## Agent System

The registry is maintained by specialized AI agents:

- **Frontend Agent** - UI components, accessibility, testing
- **Backend Agent** - Services, API, database integration
- **Integration Agent** - Third-party integrations (Microsoft 365, Asana, Notion)
- **Orchestrator Agent** - Coordination and planning

## Support & Resources

- **Repository**: https://github.com/targetym/targetym
- **Documentation**: https://docs.targetym.dev
- **Registry**: https://registry.targetym.dev
- **Issues**: https://github.com/targetym/targetym/issues

## License

MIT License - see [LICENSE](../LICENSE) for details

---

**Last Updated**: January 9, 2025
**Registry Version**: 1.0.0
