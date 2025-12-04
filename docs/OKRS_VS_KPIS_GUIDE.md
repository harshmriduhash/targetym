# OKRs vs KPIs Implementation Guide

## Overview

This document explains the implementation of **OKRs (Objectives & Key Results)** and **KPIs (Key Performance Indicators)** in the Targetym platform, highlighting the distinction between these two complementary frameworks.

## Conceptual Framework

### OKRs (Objectives & Key Results)

**Purpose**: Setting ambitious, time-bound goals that drive growth and transformation.

**Characteristics**:
- **Time-bound**: Typically quarterly or annual cycles
- **Aspirational**: Success at 60-70% achievement is considered good
- **Goal-oriented**: Focuses on what you want to achieve
- **Periodic**: Set for specific periods, then reset
- **Qualitative + Quantitative**: Objectives are aspirational, Key Results are measurable

**Example OKR**:
```
Objective: Boost market presence in MENA region
Key Results:
1. Grow revenue by 40%
2. Launch 3 new products
3. Add 2 new markets
4. Increase social media engagement by 50%
```

**Best Practices**:
- Set challenging, qualitative objectives
- Define 3-5 measurable key results per objective
- Review and update quarterly
- Use for periods of growth or change

### KPIs (Key Performance Indicators)

**Purpose**: Ongoing performance monitoring to track business health.

**Characteristics**:
- **Continuous**: Measured regularly (daily, weekly, monthly)
- **Operational**: Focuses on maintaining and improving current operations
- **Metric-focused**: Pure numbers and trends
- **Baseline-driven**: Compared against historical data and targets
- **Quantitative only**: Always measurable metrics

**Example KPIs**:
- Revenue growth rate
- Employee turnover rate
- Customer acquisition cost (CAC)
- Net Promoter Score (NPS)
- Inventory turnover
- Return on investment (ROI)

**Best Practices**:
- Pick relevant and measurable metrics
- Align KPIs with goals and objectives
- Regularly review and adjust thresholds
- Use for ongoing performance monitoring

## Technical Implementation

### Database Schema

#### Goals Table (Extended for OKRs)

```sql
ALTER TABLE public.goals
  ADD COLUMN goal_type TEXT DEFAULT 'okr'
    CHECK (goal_type IN ('okr', 'smart', 'stretch', 'operational'));

ALTER TABLE public.goals
  ADD COLUMN is_aspirational BOOLEAN DEFAULT true;

ALTER TABLE public.goals
  ADD COLUMN confidence_level INTEGER
    CHECK (confidence_level IS NULL OR (confidence_level >= 0 AND confidence_level <= 10));
```

**Fields**:
- `goal_type`: Distinguish between OKR, SMART goals, stretch goals, etc.
- `is_aspirational`: Mark OKRs as aspirational (60-70% achievement = success)
- `confidence_level`: Track confidence in achieving the objective (0-10 scale)

#### KPIs Table

```sql
CREATE TABLE public.kpis (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations,
  owner_id UUID REFERENCES profiles,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- revenue, customer, operational, employee, quality, efficiency, custom
  metric_type TEXT, -- number, percentage, currency, ratio, boolean
  unit TEXT,
  target_value NUMERIC,
  current_value NUMERIC,
  baseline_value NUMERIC,
  target_min NUMERIC,
  target_max NUMERIC,
  status TEXT, -- on_track, at_risk, below_target, above_target, needs_attention
  measurement_frequency TEXT, -- daily, weekly, monthly, quarterly, annually
  department TEXT,
  aligned_goal_id UUID REFERENCES goals, -- Link to OKR if applicable
  visibility TEXT,
  data_source TEXT,
  auto_update_enabled BOOLEAN,
  tags TEXT[],
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

#### KPI Measurements Table

```sql
CREATE TABLE public.kpi_measurements (
  id UUID PRIMARY KEY,
  kpi_id UUID REFERENCES kpis,
  measured_value NUMERIC NOT NULL,
  measured_at TIMESTAMPTZ,
  measurement_period_start DATE,
  measurement_period_end DATE,
  notes TEXT,
  measured_by UUID REFERENCES profiles,
  measurement_source TEXT -- manual, automated, api, integration
);
```

#### KPI Alerts Table

```sql
CREATE TABLE public.kpi_alerts (
  id UUID PRIMARY KEY,
  kpi_id UUID REFERENCES kpis,
  alert_type TEXT, -- threshold_breach, target_achieved, trend_change, missing_data
  condition TEXT NOT NULL,
  threshold_value NUMERIC,
  notify_users UUID[],
  notification_channels TEXT[], -- in_app, email, slack, teams
  is_active BOOLEAN,
  last_triggered_at TIMESTAMPTZ
);
```

### TypeScript Types

```typescript
// OKR Types (extended from Goals)
interface OKR {
  id: string
  title: string // Objective
  description: string
  goal_type: 'okr' | 'smart' | 'stretch' | 'operational'
  is_aspirational: boolean
  confidence_level: number // 0-10
  period: 'quarterly' | 'annual'
  start_date: string
  end_date: string
  key_results: KeyResult[] // Array of Key Results
  owner_id: string
  organization_id: string
}

interface KeyResult {
  id: string
  goal_id: string
  title: string
  target_value: number
  current_value: number
  unit: string
  progress_percentage: number // Auto-calculated
  status: 'on_track' | 'at_risk' | 'behind' | 'achieved'
}

// KPI Types
interface KPI {
  id: string
  name: string
  description: string
  category: 'revenue' | 'customer' | 'operational' | 'employee' | 'quality' | 'efficiency' | 'custom'
  metric_type: 'number' | 'percentage' | 'currency' | 'ratio' | 'boolean'
  unit: string
  target_value: number
  current_value: number
  baseline_value: number
  target_min: number // Green threshold
  target_max: number // Red threshold
  status: 'on_track' | 'at_risk' | 'below_target' | 'above_target' | 'needs_attention'
  measurement_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually'
  aligned_goal_id?: string // Link to OKR
  owner_id: string
  organization_id: string
}
```

### API / Server Actions

#### OKRs Actions
Located in `src/actions/goals/`

- `createGoal(input)` - Create new OKR/Objective
- `updateGoal(input)` - Update OKR
- `createKeyResult(input)` - Add Key Result to OKR
- `updateKeyResultProgress(input)` - Update Key Result progress
- `deleteGoal(input)` - Soft delete OKR

#### KPIs Actions
Located in `src/actions/kpis/`

- `createKpi(input)` - Create new KPI
- `updateKpi(input)` - Update KPI
- `deleteKpi(input)` - Soft delete KPI
- `getKpis(filters, pagination)` - Get KPIs with filters
- `getKpiById(id)` - Get single KPI with measurements
- `addKpiMeasurement(input)` - Record new KPI measurement
- `createKpiAlert(input)` - Create alert for KPI

### Services Layer

#### Goals Service
Located in `src/lib/services/goals.service.ts`

```typescript
export class GoalsService {
  async createGoal(data: CreateGoalData): Promise<Goal>
  async getGoals(organizationId, filters?, pagination?): Promise<PaginatedResponse<Goal>>
  async getGoalById(goalId): Promise<Goal | null>
  async updateGoal(goalId, userId, data): Promise<Goal>
  async deleteGoal(goalId, userId): Promise<void>
  async getGoalsWithProgress(organizationId): Promise<Goal[]>
}
```

#### KPIs Service
Located in `src/lib/services/kpis.service.ts`

```typescript
export class KpisService {
  // KPI CRUD
  async createKpi(data: CreateKpiData): Promise<Kpi>
  async getKpis(organizationId, filters?, pagination?): Promise<PaginatedResponse<Kpi>>
  async getKpiById(kpiId): Promise<Kpi | null>
  async updateKpi(kpiId, userId, data): Promise<Kpi>
  async deleteKpi(kpiId, userId): Promise<void>

  // Measurements
  async addKpiMeasurement(data): Promise<KpiMeasurement>
  async getKpiMeasurements(kpiId, startDate?, endDate?): Promise<KpiMeasurement[]>

  // Alerts
  async createKpiAlert(data): Promise<KpiAlert>
  async getKpiAlerts(kpiId): Promise<KpiAlert[]>
  async updateKpiAlert(alertId, data): Promise<KpiAlert>

  // Analytics
  async getKpisWithLatestMeasurement(organizationId): Promise<Kpi[]>
  async getKpiPerformanceTrends(organizationId): Promise<any[]>
}
```

### Validation Schemas

#### Goals/OKRs Validation
Located in `src/lib/validations/goals.schemas.ts`

```typescript
export const createGoalSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']),
  period: z.enum(['quarterly', 'annual', 'custom']),
  start_date: z.string().datetime().or(z.date()),
  end_date: z.string().datetime().or(z.date()),
  visibility: z.enum(['private', 'team', 'organization']),
  parent_goal_id: z.string().uuid().optional(),
})

export const createKeyResultSchema = z.object({
  goal_id: z.string().uuid(),
  description: z.string().min(3).max(500),
  target_value: z.number().positive(),
  current_value: z.number().default(0),
  unit: z.string().max(50).optional(),
  weight: z.number().min(0.1).max(1).default(1),
})
```

#### KPIs Validation
Located in `src/lib/validations/kpis.schemas.ts`

```typescript
export const createKpiSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(['revenue', 'customer', 'operational', 'employee', 'quality', 'efficiency', 'custom']),
  metric_type: z.enum(['number', 'percentage', 'currency', 'ratio', 'boolean']),
  unit: z.string().max(50).optional(),
  target_value: z.number().optional(),
  current_value: z.number().default(0),
  baseline_value: z.number().optional(),
  target_min: z.number().optional(),
  target_max: z.number().optional(),
  measurement_frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually']),
  department: z.string().max(100).optional(),
  aligned_goal_id: z.string().uuid().optional(),
  visibility: z.enum(['private', 'team', 'department', 'organization']),
})

export const createKpiMeasurementSchema = z.object({
  kpi_id: z.string().uuid(),
  measured_value: z.number(),
  measured_at: z.string().datetime().or(z.date()).optional(),
  measurement_period_start: z.string().datetime().or(z.date()).optional(),
  measurement_period_end: z.string().datetime().or(z.date()).optional(),
  notes: z.string().max(1000).optional(),
  measurement_source: z.enum(['manual', 'automated', 'api', 'integration']),
})
```

### Row Level Security (RLS) Policies

Both OKRs and KPIs implement comprehensive RLS policies for multi-tenant isolation:

```sql
-- KPI Visibility Policy
CREATE POLICY "Users can view organization KPIs"
  ON public.kpis
  FOR SELECT
  USING (
    organization_id = get_user_organization_id()
    AND (
      visibility = 'organization'
      OR owner_id = auth.uid()
      OR (visibility = 'team' AND is_same_department(owner_id))
      OR has_role('admin')
      OR has_role('hr')
      OR is_manager_of(owner_id)
    )
  );
```

## Usage Examples

### Creating an OKR

```typescript
import { createGoal, createKeyResult } from '@/src/actions/goals'

// 1. Create Objective
const okrResult = await createGoal({
  title: 'Boost market presence in Q1 2025',
  description: 'Expand market reach and brand awareness',
  period: 'quarterly',
  start_date: '2025-01-01',
  end_date: '2025-03-31',
  visibility: 'organization',
  status: 'active',
})

// 2. Add Key Results
await createKeyResult({
  goal_id: okrResult.data.id,
  description: 'Grow revenue by 40%',
  target_value: 40,
  unit: '%',
  weight: 0.3,
})

await createKeyResult({
  goal_id: okrResult.data.id,
  description: 'Launch 3 new products',
  target_value: 3,
  unit: 'products',
  weight: 0.3,
})

await createKeyResult({
  goal_id: okrResult.data.id,
  description: 'Add 2 new markets',
  target_value: 2,
  unit: 'markets',
  weight: 0.2,
})

await createKeyResult({
  goal_id: okrResult.data.id,
  description: 'Increase social media engagement by 50%',
  target_value: 50,
  unit: '%',
  weight: 0.2,
})
```

### Creating a KPI

```typescript
import { createKpi, addKpiMeasurement, createKpiAlert } from '@/src/actions/kpis'

// 1. Create KPI
const kpiResult = await createKpi({
  name: 'Monthly Revenue Growth Rate',
  description: 'Month-over-month revenue growth percentage',
  category: 'revenue',
  metric_type: 'percentage',
  unit: '%',
  target_value: 10, // Target: 10% growth
  baseline_value: 5, // Starting baseline
  target_min: 8, // Below 8% is at risk
  target_max: 15, // Above 15% is exceptional
  measurement_frequency: 'monthly',
  department: 'Sales',
  visibility: 'organization',
  aligned_goal_id: okrResult.data.id, // Link to OKR
})

// 2. Add Measurement
await addKpiMeasurement({
  kpi_id: kpiResult.data.id,
  measured_value: 12.5,
  measurement_period_start: '2025-01-01',
  measurement_period_end: '2025-01-31',
  notes: 'Strong performance in January',
  measurement_source: 'manual',
})

// 3. Create Alert
await createKpiAlert({
  kpi_id: kpiResult.data.id,
  alert_type: 'threshold_breach',
  condition: 'current_value < target_min',
  threshold_value: 8,
  notify_users: [userId],
  notification_channels: ['in_app', 'email'],
  is_active: true,
})
```

### Retrieving KPIs with Filters

```typescript
import { getKpis } from '@/src/actions/kpis'

const result = await getKpis({
  filters: {
    category: 'revenue',
    status: 'on_track',
    department: 'Sales',
    is_active: true,
  },
  pagination: {
    page: 1,
    pageSize: 20,
  },
})

console.log(result.data) // Paginated KPIs
console.log(result.data.items) // Array of KPIs
console.log(result.data.pagination) // { page, pageSize, total, totalPages }
```

## Database Views

### KPIs with Latest Measurement

```sql
CREATE VIEW kpis_with_latest_measurement AS
SELECT
  k.*,
  m.measured_value as latest_measured_value,
  m.measured_at as latest_measured_at,
  -- Calculate progress percentage
  ROUND(((k.current_value - k.baseline_value) * 100.0 /
    NULLIF(k.target_value - k.baseline_value, 0)), 2) as progress_percentage,
  -- Calculate status based on thresholds
  CASE
    WHEN k.current_value >= k.target_min AND k.current_value <= k.target_max THEN 'on_track'
    WHEN k.current_value < k.target_min THEN 'below_target'
    WHEN k.current_value > k.target_max THEN 'above_target'
    ELSE 'needs_attention'
  END as calculated_status
FROM kpis k
LEFT JOIN LATERAL (
  SELECT measured_value, measured_at
  FROM kpi_measurements
  WHERE kpi_id = k.id
  ORDER BY measured_at DESC
  LIMIT 1
) m ON true
WHERE k.deleted_at IS NULL;
```

### KPI Performance Trends

```sql
CREATE VIEW kpi_performance_trends AS
SELECT
  k.id as kpi_id,
  k.name,
  k.organization_id,
  COUNT(m.id) as total_measurements,
  AVG(m.measured_value) as avg_value,
  MIN(m.measured_value) as min_value,
  MAX(m.measured_value) as max_value,
  STDDEV(m.measured_value) as stddev_value,
  MAX(m.measured_at) as last_measurement_date
FROM kpis k
LEFT JOIN kpi_measurements m ON k.id = m.kpi_id
GROUP BY k.id, k.name, k.organization_id;
```

## Migrations

To apply the OKRs vs KPIs schema:

```bash
# Start Supabase (if not already running)
npm run supabase:start

# Apply migrations
supabase db push

# Or reset database (WARNING: deletes all data)
npm run supabase:reset

# Generate TypeScript types
npm run supabase:types
```

Migration files:
- `supabase/migrations/20251011000000_add_kpis_table.sql` - KPIs schema
- `supabase/migrations/20251011000001_kpis_rls_policies.sql` - RLS policies

## When to Use OKRs vs KPIs

### Use OKRs when:
- Setting ambitious, transformational goals
- Planning quarterly or annual objectives
- Driving innovation and growth
- Aligning teams around strategic initiatives
- You need a structured approach to goal-setting

### Use KPIs when:
- Tracking ongoing business performance
- Monitoring operational metrics
- Measuring success of current operations
- Evaluating progress towards targets
- You need real-time health indicators

### Use Both Together:
- **Align KPIs to OKRs**: Link operational metrics to strategic goals
- **Track Progress**: Use KPIs to measure progress towards Key Results
- **Continuous Improvement**: OKRs drive change, KPIs maintain gains
- **Holistic View**: OKRs provide direction, KPIs provide validation

## Example: E-commerce Platform

### OKR Example
**Objective**: Dominate the MENA e-commerce market in 2025

**Key Results**:
1. Achieve $10M in annual revenue (up from $6M)
2. Expand to 3 new countries (UAE, Saudi Arabia, Egypt)
3. Launch mobile app with 100K downloads
4. Reach 1M social media followers

### Related KPIs
**Revenue KPIs**:
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (LTV)

**Operational KPIs**:
- Order fulfillment time
- Cart abandonment rate
- Website uptime percentage

**Customer KPIs**:
- Net Promoter Score (NPS)
- Customer satisfaction score
- Repeat purchase rate

**Employee KPIs**:
- Employee satisfaction score
- Support ticket resolution time
- Team productivity metrics

## Benefits of This Implementation

1. **Clear Separation**: Distinct tables for OKRs and KPIs prevent confusion
2. **Alignment**: `aligned_goal_id` field links KPIs to OKRs
3. **Flexibility**: Both frameworks support multiple use cases
4. **Scalability**: Designed for multi-tenant organizations
5. **Security**: Comprehensive RLS policies ensure data isolation
6. **Automation**: Triggers auto-update KPI values from measurements
7. **Alerting**: Built-in alert system for KPI thresholds
8. **Analytics**: Views provide performance insights and trends

## Conclusion

This implementation provides a robust, production-ready system for managing both OKRs and KPIs, allowing organizations to:
- Set ambitious strategic goals (OKRs)
- Track ongoing performance (KPIs)
- Align metrics with objectives
- Monitor progress in real-time
- Make data-driven decisions

The architecture follows Next.js best practices with Server Actions, RLS security, and TypeScript type safety throughout the stack.
