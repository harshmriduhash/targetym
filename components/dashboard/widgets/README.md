# Dashboard Widgets

Modern, reusable dashboard widgets for the Targetym HR platform, inspired by TalentoHub design patterns.

## Available Widgets

### 1. AttendanceTracker
A circular gauge chart showing attendance hours breakdown with color-coded segments.

**Features:**
- Circular progress visualization
- Four metrics: Operating Hours, Total Hours, Remaining Hours, Less than not spent
- Color-coded legend
- Responsive design

**Usage:**
```tsx
import { AttendanceTracker } from '@/components/dashboard/widgets'

<AttendanceTracker
  data={{
    operatingHours: 50,
    totalHours: 130,
    remainingHours: 60,
    notSpent: 20
  }}
/>
```

### 2. SalarySlipCard
Download salary slip documents with month selection.

**Features:**
- Month selector dropdown
- PDF icon visualization
- Download action button
- Clean, minimal design

**Usage:**
```tsx
import { SalarySlipCard } from '@/components/dashboard/widgets'

<SalarySlipCard
  onDownload={(month) => {
    console.log('Downloading:', month)
  }}
/>
```

### 3. RequestsTable
Tabbed table showing employee requests with status filtering.

**Features:**
- Tab navigation (All, Approved, Rejected, Pending)
- Status badges with color coding
- Request type and date display
- Responsive layout

**Usage:**
```tsx
import { RequestsTable } from '@/components/dashboard/widgets'

const requests = [
  {
    id: '1',
    type: 'Leave Request',
    status: 'approved',
    date: new Date('2023-10-15'),
    description: '3 days vacation'
  }
]

<RequestsTable requests={requests} />
```

### 4. CalendarWidget
Interactive calendar with special dates and event types.

**Features:**
- Month navigation
- Special date highlighting
- Event type legend (Pay Days, Holidays, Birthdays, etc.)
- Current day highlighting
- Color-coded events

**Usage:**
```tsx
import { CalendarWidget } from '@/components/dashboard/widgets'

<CalendarWidget
  specialDates={[
    { date: 8, type: 'holiday' },
    { date: 14, type: 'payday' },
    { date: 17, type: 'birthday' }
  ]}
/>
```

### 5. AnnouncementsBoard
Company announcements and news feed with categories.

**Features:**
- Three categories: Internal News, Industry News, Calendar Events
- Date display
- Action menu for each announcement
- Empty state handling

**Usage:**
```tsx
import { AnnouncementsBoard } from '@/components/dashboard/widgets'

const announcements = [
  {
    id: '1',
    type: 'internal',
    title: 'Q4 Company Meeting',
    date: new Date('2023-10-09'),
    description: 'Join us for quarterly review'
  }
]

<AnnouncementsBoard
  announcements={announcements}
  onView={(id) => console.log('View:', id)}
  onEdit={(id) => console.log('Edit:', id)}
  onDelete={(id) => console.log('Delete:', id)}
/>
```

### 6. HRPoliciesCard
HR policy documents with download functionality.

**Features:**
- PDF document list
- Download buttons
- Open in browser option
- Document dates
- Information footer

**Usage:**
```tsx
import { HRPoliciesCard } from '@/components/dashboard/widgets'

<HRPoliciesCard
  documents={[
    {
      id: '1',
      title: 'Attendance policy',
      date: '15-Oct-23',
      url: '/policies/attendance-policy.pdf'
    }
  ]}
  onDownload={(id) => console.log('Download:', id)}
  onOpenBrowser={() => window.open('/policies', '_blank')}
/>
```

### 7. MyTeamCard
Team member directory with contact information.

**Features:**
- Avatar display with fallback initials
- Role and department info
- Email and phone contact buttons
- View all link
- Responsive grid

**Usage:**
```tsx
import { MyTeamCard } from '@/components/dashboard/widgets'

<MyTeamCard
  members={[
    {
      id: '1',
      name: 'Li Jinquan',
      role: 'Front-end Developer',
      department: 'Development',
      email: 'li.jinquan@targetym.com',
      phone: '+1 234 567 8901'
    }
  ]}
  onViewAll={() => console.log('View all team')}
/>
```

### 8. BirthdaysCard
Upcoming birthdays and work anniversaries.

**Features:**
- Period selector (Today, Weekly, Monthly)
- Birthday and anniversary icons
- Years of service for anniversaries
- Avatar display
- Event summary

**Usage:**
```tsx
import { BirthdaysCard } from '@/components/dashboard/widgets'

<BirthdaysCard
  events={[
    {
      id: '1',
      name: 'Umair Ali',
      role: 'Sr. Accountant',
      date: new Date('2023-11-17'),
      type: 'birthday'
    }
  ]}
/>
```

### 9. CareerLadderChart
Visual career progression with horizontal bar chart.

**Features:**
- Five career levels with progress bars
- Color-coded levels
- Progress percentages
- Action menu
- Next steps section
- Career progress summary

**Usage:**
```tsx
import { CareerLadderChart } from '@/components/dashboard/widgets'

<CareerLadderChart
  levels={[
    {
      id: '1',
      title: 'Junior Developer',
      description: 'Entry-level position',
      progress: 100,
      color: 'bg-blue-500'
    }
  ]}
  onViewDetails={(id) => console.log('View:', id)}
/>
```

### 10. NewJobsTable
Job openings with position counts and departments.

**Features:**
- Job title and position count
- Department display
- Location information
- Job type badges (Full-time, Part-time, Contract)
- Posted date calculation
- Total positions summary
- Links to job details

**Usage:**
```tsx
import { NewJobsTable } from '@/components/dashboard/widgets'

<NewJobsTable
  jobs={[
    {
      id: '1',
      title: 'UI UX Designer',
      positions: 2,
      department: 'Creative Department',
      location: 'Remote',
      type: 'full-time',
      postedDate: new Date('2023-10-20')
    }
  ]}
  onViewAll={() => console.log('View all jobs')}
/>
```

## Component Architecture

All widgets follow these principles:

1. **Type Safety**: Full TypeScript support with strict types
2. **Responsive Design**: Mobile-first approach with Tailwind CSS
3. **Accessibility**: Semantic HTML and ARIA labels
4. **Customization**: Accept optional props for data and callbacks
5. **Mock Data**: Include sensible defaults for rapid development
6. **shadcn/ui**: Built on Radix UI primitives
7. **Consistent Styling**: Follow TalentoHub design patterns

## Styling Guidelines

### Colors
- Primary: `#4F46E5` (Blue)
- Success: `#10B981` (Green)
- Danger: `#EF4444` (Red)
- Warning: `#F59E0B` (Orange)
- Info: `#A855F7` (Purple)
- Accent: `#06B6D4` (Cyan)

### Typography
- Card titles: `text-lg` + `font-semibold`
- Body text: `text-sm`
- Muted text: `text-muted-foreground`
- Small text: `text-xs`

### Spacing
- Card padding: `p-6`
- Item spacing: `space-y-3` or `space-y-4`
- Gap between elements: `gap-2`, `gap-3`, `gap-4`

## Integration Example

```tsx
// app/dashboard/page.tsx
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

export default function DashboardPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Left Column */}
      <div className="space-y-6">
        <AttendanceTracker />
        <SalarySlipCard />
        <RequestsTable />
      </div>

      {/* Middle Column */}
      <div className="space-y-6">
        <CalendarWidget />
        <AnnouncementsBoard />
        <HRPoliciesCard />
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <MyTeamCard />
        <BirthdaysCard />
        <CareerLadderChart />
        <NewJobsTable />
      </div>
    </div>
  )
}
```

## Testing

All widgets are designed to be testable with React Testing Library:

```tsx
import { render, screen } from '@testing-library/react'
import { AttendanceTracker } from '@/components/dashboard/widgets'

describe('AttendanceTracker', () => {
  it('renders attendance data correctly', () => {
    render(<AttendanceTracker />)
    expect(screen.getByText('Attendance Tracker')).toBeInTheDocument()
    expect(screen.getByText('130')).toBeInTheDocument()
  })
})
```

## Future Enhancements

- [ ] Real-time data updates via WebSocket
- [ ] Export widgets to PDF/Excel
- [ ] Drag-and-drop widget reordering
- [ ] Widget customization settings
- [ ] Dark mode optimization
- [ ] Animation improvements
- [ ] Accessibility audit
- [ ] Internationalization (i18n)

## Dependencies

- `react` ^19.1.0
- `next` ^15.5.4
- `@radix-ui/*` (via shadcn/ui)
- `lucide-react` ^0.544.0
- `date-fns` ^4.1.0
- `tailwindcss` ^4
- `class-variance-authority` ^0.7.1
- `clsx` ^2.1.1
- `tailwind-merge` ^3.3.1

## License

Part of the Targetym HR platform. Internal use only.
