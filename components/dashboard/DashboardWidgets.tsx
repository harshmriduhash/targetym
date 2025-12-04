'use client'

import { WelcomeCard } from "@/components/dashboard/widgets/WelcomeCard";
import { StatCard } from "@/components/dashboard/widgets/StatCard";
import { EmployeeDistributionChart } from "@/components/dashboard/widgets/EmployeeDistributionChart";
import { AttendanceTracker } from "@/components/dashboard/widgets/AttendanceTracker";
import { SalarySlipCard } from "@/components/dashboard/widgets/SalarySlipCard";
import { RequestsTable } from "@/components/dashboard/widgets/RequestsTable";
import { CalendarWidget } from "@/components/dashboard/widgets/CalendarWidget";
import { AnnouncementsBoard } from "@/components/dashboard/widgets/AnnouncementsBoard";
import { HRPoliciesCard } from "@/components/dashboard/widgets/HRPoliciesCard";
import { MyTeamCard } from "@/components/dashboard/widgets/MyTeamCard";
import { BirthdaysCard } from "@/components/dashboard/widgets/BirthdaysCard";
import { CareerLadderChart } from "@/components/dashboard/widgets/CareerLadderChart";
import { NewJobsTable } from "@/components/dashboard/widgets/NewJobsTable";
import { DiscrepanciesCard } from "@/components/dashboard/widgets/DiscrepanciesCard";
import { Users, Calendar, UserPlus } from "lucide-react";

interface DashboardWidgetsProps {
  userEmail?: string;
}

export function DashboardWidgets({ userEmail }: DashboardWidgetsProps) {
  // Mock data - will be replaced with real data from DB
  const stats = {
    totalEmployees: { current: 200, max: 200, trend: 6 },
    onLeaves: { current: 20, max: 200, trend: -10 },
    newJoinee: { current: 10, max: 200, trend: 10 },
  };

  return (
    <div className="space-y-1.5 sm:space-y-2 pb-2 sm:pb-3">
      {/* Row 0: Welcome Card uniquement */}
      <div>
        <WelcomeCard />
      </div>

      {/* Row 1: Stats + Calendar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-13 gap-1.5 sm:gap-2">
        {/* Total Employés - 23% (3 cols sur 13) */}
        <div className="sm:col-span-1 md:col-span-1 lg:col-span-3">
          <StatCard
            title="Total Employés"
            value={stats.totalEmployees.current}
            icon={Users}
            trend={{ value: stats.totalEmployees.trend, isPositive: true }}
            suffix={`/${stats.totalEmployees.max}`}
          />
        </div>

        {/* En Congé - 23% (3 cols sur 13) */}
        <div className="sm:col-span-1 md:col-span-1 lg:col-span-3">
          <StatCard
            title="En Congé"
            value={stats.onLeaves.current}
            icon={Calendar}
            trend={{ value: Math.abs(stats.onLeaves.trend), isPositive: false }}
            suffix={`/${stats.onLeaves.max}`}
          />
        </div>

        {/* Nouvelles Embauches - 23% (3 cols sur 13) */}
        <div className="sm:col-span-1 md:col-span-1 lg:col-span-3">
          <StatCard
            title="Nouvelles Embauches"
            value={stats.newJoinee.current}
            icon={UserPlus}
            trend={{ value: stats.newJoinee.trend, isPositive: true }}
            suffix={`/${stats.newJoinee.max}`}
          />
        </div>

        {/* Calendar Widget - 31% (4 cols sur 13) */}
        <div className="sm:col-span-2 md:col-span-4 lg:col-span-4">
          <CalendarWidget />
        </div>
      </div>

      {/* Row 2: Attendance + Salary Slip + Requests (comme capture d'écran) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-20 gap-1.5 sm:gap-2">
        {/* My Attendance - 25% (5 cols sur 20) */}
        <div className="md:col-span-1 lg:col-span-5">
          <AttendanceTracker />
        </div>

        {/* Salary Slip - 25% (5 cols sur 20) */}
        <div className="md:col-span-1 lg:col-span-5">
          <SalarySlipCard />
        </div>

        {/* Requests Table - 50% (10 cols sur 20) */}
        <div className="md:col-span-2 lg:col-span-10">
          <RequestsTable />
        </div>
      </div>

      {/* Row 3: Announcements + Birthdays */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-20 gap-1.5 sm:gap-2">
        {/* Announcements Board - 35% (7 cols sur 20) */}
        <div className="md:col-span-1 lg:col-span-7">
          <AnnouncementsBoard />
        </div>

        {/* Birthdays & Anniversaries - 65% (13 cols sur 20) */}
        <div className="md:col-span-1 lg:col-span-13">
          <BirthdaysCard />
        </div>
      </div>

      {/* Row 4: Career Ladder + Discrepancies + New Jobs (comme capture d'écran) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-20 gap-1.5 sm:gap-2">
        {/* Career Ladder - 35% (7 cols sur 20) */}
        <div className="md:col-span-2 lg:col-span-7">
          <CareerLadderChart />
        </div>

        {/* Discrepancies - 25% (5 cols sur 20) */}
        <div className="md:col-span-1 lg:col-span-5">
          <DiscrepanciesCard />
        </div>

        {/* New Jobs - 40% (8 cols sur 20) */}
        <div className="md:col-span-1 lg:col-span-8">
          <NewJobsTable />
        </div>
      </div>
    </div>
  );
}
