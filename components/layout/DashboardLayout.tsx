'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <div
        className={cn(
          'flex h-full flex-col transition-all duration-300',
          'ml-0 lg:ml-16', // Mobile: no margin, Desktop: collapsed sidebar margin
          !sidebarCollapsed && 'lg:ml-64' // Desktop: expanded sidebar margin
        )}
      >
        {/* Header */}
        <Header onMobileMenuClick={() => setMobileSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/10 p-3 sm:p-4 md:p-6">
          {title && (
            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
