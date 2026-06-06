'use client';

import { GpsNetworkBackground } from '@/components/ui/gps-network-bg';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Animated GPS Network Background */}
      <GpsNetworkBackground />

      {/* Sidebar */}
      <div className="relative z-10">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
