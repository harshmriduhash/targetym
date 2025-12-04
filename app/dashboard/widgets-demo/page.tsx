/**
 * Dashboard Widgets Demo Page
 *
 * Showcases all available dashboard widgets with sample data
 * Route: /dashboard/widgets-demo
 */

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
  NewJobsTable,
} from '@/components/dashboard/widgets'

export default function WidgetsDemoPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Dashboard Widgets Demo</h1>
        <p className="text-muted-foreground">
          Explore all available dashboard widgets with sample data
        </p>
      </div>

      {/* Grid Layout - Row 1 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* AttendanceTracker */}
        <div className="lg:col-span-1">
          <AttendanceTracker />
        </div>

        {/* SalarySlipCard */}
        <div className="lg:col-span-1">
          <SalarySlipCard />
        </div>

        {/* CalendarWidget */}
        <div className="lg:col-span-1">
          <CalendarWidget />
        </div>
      </div>

      {/* Grid Layout - Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* RequestsTable */}
        <div className="md:col-span-1">
          <RequestsTable />
        </div>

        {/* AnnouncementsBoard */}
        <div className="md:col-span-1">
          <AnnouncementsBoard />
        </div>
      </div>

      {/* Grid Layout - Row 3 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* HRPoliciesCard */}
        <div className="lg:col-span-1">
          <HRPoliciesCard />
        </div>

        {/* MyTeamCard */}
        <div className="lg:col-span-1">
          <MyTeamCard />
        </div>

        {/* BirthdaysCard */}
        <div className="lg:col-span-1">
          <BirthdaysCard />
        </div>
      </div>

      {/* Grid Layout - Row 4 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* CareerLadderChart */}
        <div className="md:col-span-1">
          <CareerLadderChart />
        </div>

        {/* NewJobsTable */}
        <div className="md:col-span-1">
          <NewJobsTable />
        </div>
      </div>

      {/* Developer Info */}
      <div className="mt-8 p-6 rounded-lg border bg-muted/50">
        <h3 className="font-semibold mb-2">Developer Information</h3>
        <p className="text-sm text-muted-foreground mb-4">
          All widgets are built with Next.js 15, React 19, TypeScript, and shadcn/ui.
          They follow modern design patterns and are fully responsive.
        </p>
        <div className="grid gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium">Location:</span>
            <code className="px-2 py-0.5 rounded bg-background">
              components/dashboard/widgets/
            </code>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Documentation:</span>
            <code className="px-2 py-0.5 rounded bg-background">
              components/dashboard/widgets/README.md
            </code>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Import:</span>
            <code className="px-2 py-0.5 rounded bg-background">
              {`import { AttendanceTracker } from '@/components/dashboard/widgets'`}
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}
