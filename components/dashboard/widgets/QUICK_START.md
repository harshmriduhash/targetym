# Dashboard Widgets - Quick Start Guide

## 🚀 Get Started in 2 Minutes

### 1. Import Widgets

```tsx
import {
  AttendanceTracker,
  SalarySlipCard,
  RequestsTable,
  CalendarWidget,
  AnnouncementsBoard,
  HRPoliciesCard,
  MyTeamCard,
  BirthdaysCard,
  CareerLadderChart,
  NewJobsTable
} from '@/components/dashboard/widgets'
```

### 2. Use in Your Page

```tsx
export default function DashboardPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <AttendanceTracker />
      <SalarySlipCard />
      <CalendarWidget />
    </div>
  )
}
```

### 3. View Demo

Start dev server and navigate to:
```
http://localhost:3001/dashboard/widgets-demo
```

## 📦 What's Included

| Widget | Purpose | Key Features |
|--------|---------|--------------|
| `AttendanceTracker` | Hours tracking | Circular gauge, 4 metrics |
| `SalarySlipCard` | Salary documents | Month selector, PDF download |
| `RequestsTable` | Employee requests | Tabs, status badges |
| `CalendarWidget` | Events calendar | Month nav, special dates |
| `AnnouncementsBoard` | Company news | Categories, date display |
| `HRPoliciesCard` | Policy docs | PDF list, download buttons |
| `MyTeamCard` | Team directory | Avatars, contact buttons |
| `BirthdaysCard` | Celebrations | Birthdays, anniversaries |
| `CareerLadderChart` | Career path | Progress bars, 5 levels |
| `NewJobsTable` | Job openings | Position counts, links |

## 🎨 Customization Examples

### With Custom Data

```tsx
<AttendanceTracker
  data={{
    operatingHours: 50,
    totalHours: 130,
    remainingHours: 60,
    notSpent: 20
  }}
/>
```

### With Event Handlers

```tsx
<SalarySlipCard
  onDownload={(month) => {
    // Your download logic
    downloadSalarySlip(month)
  }}
/>
```

### With API Data

```tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { MyTeamCard } from '@/components/dashboard/widgets'

export function TeamSection() {
  const { data: members } = useQuery({
    queryKey: ['team'],
    queryFn: fetchTeamMembers
  })

  return <MyTeamCard members={members} />
}
```

## 🔧 Common Patterns

### Server Component (Default)

```tsx
// app/dashboard/page.tsx
import { CalendarWidget } from '@/components/dashboard/widgets'

export default async function Page() {
  // Fetch data on server
  const events = await fetchEvents()

  return <CalendarWidget specialDates={events} />
}
```

### Client Component (Interactive)

```tsx
'use client'

import { useState } from 'react'
import { RequestsTable } from '@/components/dashboard/widgets'

export function RequestsSection() {
  const [requests, setRequests] = useState([])

  return <RequestsTable requests={requests} />
}
```

## 📱 Responsive Grid Layouts

### 2-Column Layout

```tsx
<div className="grid gap-6 md:grid-cols-2">
  <AttendanceTracker />
  <SalarySlipCard />
</div>
```

### 3-Column Layout

```tsx
<div className="grid gap-6 lg:grid-cols-3">
  <CalendarWidget />
  <AnnouncementsBoard />
  <HRPoliciesCard />
</div>
```

### Mixed Layout

```tsx
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {/* Full width on mobile, 2 cols on tablet, 3 cols on desktop */}
  <AttendanceTracker />
  <SalarySlipCard />
  <CalendarWidget />

  {/* Spanning columns */}
  <div className="md:col-span-2">
    <RequestsTable />
  </div>
  <AnnouncementsBoard />
</div>
```

## 🎯 Best Practices

### ✅ Do

- Use TypeScript for type safety
- Provide mock data during development
- Test on mobile devices
- Use proper grid layouts
- Add loading states
- Handle empty states

```tsx
// Good: With loading state
{isLoading ? (
  <Skeleton className="h-[400px]" />
) : (
  <AttendanceTracker data={attendanceData} />
)}
```

### ❌ Don't

- Don't mix Server and Client components incorrectly
- Don't forget to handle errors
- Don't skip accessibility testing
- Don't hardcode data in production

```tsx
// Bad: Hardcoded data in production
<MyTeamCard
  members={[
    { id: '1', name: 'John Doe', ... } // ❌ Don't do this
  ]}
/>

// Good: Fetch from API
<MyTeamCard members={teamData} />
```

## 🔌 Integration Checklist

- [ ] Import widget from `@/components/dashboard/widgets`
- [ ] Fetch data from API/database
- [ ] Add to dashboard layout
- [ ] Test responsive design
- [ ] Add loading states
- [ ] Handle errors gracefully
- [ ] Test accessibility (keyboard nav, screen readers)
- [ ] Verify dark mode compatibility
- [ ] Add analytics tracking (optional)

## 🐛 Troubleshooting

### Widget not displaying?

**Check:**
1. Import path is correct
2. Parent has proper grid/flex layout
3. Data prop is correct type
4. No console errors

### Type errors?

```bash
npm run type-check
```

### Build errors?

```bash
npm run build
```

## 📚 More Resources

- Full documentation: `./README.md`
- Implementation details: `../../DASHBOARD_WIDGETS_IMPLEMENTATION.md`
- Live demo: `/dashboard/widgets-demo`
- shadcn/ui docs: https://ui.shadcn.com

## 🆘 Need Help?

1. Check the full `README.md` in this directory
2. View the demo page at `/dashboard/widgets-demo`
3. Inspect the component source code
4. Check TypeScript types for prop details

## 🎉 You're Ready!

Start building your dashboard with these widgets. They're designed to be:
- **Easy to use** - Simple props, sensible defaults
- **Flexible** - Customize with props and CSS
- **Type-safe** - Full TypeScript support
- **Responsive** - Works on all devices
- **Accessible** - WCAG compliant

Happy coding! 🚀
