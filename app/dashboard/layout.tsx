import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DashboardLayout as NewDashboardLayout } from '@/components/layout/DashboardLayout';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check Clerk authentication
  const { userId } = await auth();

  if (!userId) {
    redirect('/auth/sign-in');
  }

  return <NewDashboardLayout>{children}</NewDashboardLayout>;
}
