'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GpsNetworkBackground } from '@/components/ui/gps-network-bg';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

const CLIENT_NAME = 'Mas Adwan';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950">
      {/* Animated GPS Network Background */}
      <GpsNetworkBackground />

      {/* Desktop Sidebar with Framer Motion width animation */}
      <div className="hidden md:block relative z-10">
        <motion.div
          className="flex h-screen flex-col overflow-hidden border-r border-zinc-200 dark:border-white/[0.06] bg-white/90 dark:bg-zinc-950/80 backdrop-blur-xl"
          animate={{ width: sidebarCollapsed ? 64 : 256 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Sidebar 
            collapsed={sidebarCollapsed} 
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
            onClose={() => setMobileMenuOpen(false)} 
          />
        </motion.div>
      </div>

      {/* Mobile Sidebar with Framer Motion slide + overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              className="fixed inset-0 bg-black/60 z-40 md:hidden" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sidebar panel */}
            <motion.div 
              className="fixed inset-y-0 left-0 w-64 z-50 flex h-screen flex-col border-r border-zinc-200 dark:border-white/[0.06] bg-white/90 dark:bg-zinc-950/80 backdrop-blur-xl md:hidden"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Sidebar 
                collapsed={false} 
                onToggle={() => {}} 
                onClose={() => setMobileMenuOpen(false)} 
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {/* Demo banner for client */}
        <div className="relative z-20 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600/10 via-cyan-500/15 to-blue-600/10 dark:from-cyan-600/10 dark:via-cyan-500/15 dark:to-blue-600/10 from-cyan-600/5 via-cyan-500/8 to-blue-600/5 border-b border-cyan-500/15 dark:border-cyan-500/10 px-4 py-1.5">
          <div className="flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5">
            <div className="h-1 w-1 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[9px] font-mono font-medium tracking-[2px] text-cyan-400">
              DEMO BUILD
            </span>
          </div>
          <span className="text-[11px] text-zinc-400">
            Custom-built for <span className="font-semibold text-cyan-300">{CLIENT_NAME}</span>
          </span>
          <div className="h-2.5 w-px bg-white/[0.06]" />
          <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
            by <span className="font-semibold text-zinc-500 dark:text-zinc-400">NoHype</span>
          </span>
        </div>

        <Header onToggleMobile={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 overflow-y-auto p-6 pb-0">
          {children}
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-zinc-200 dark:border-white/[0.04] bg-zinc-50/80 dark:bg-zinc-950/60 backdrop-blur-sm px-6 py-3">
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent" />

          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            {/* Left — client + dev branding */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500/60" style={{ boxShadow: '0 0 6px rgba(6,182,212,0.4)' }} />
                <span className="font-mono text-[11px] font-semibold tracking-[3px] text-zinc-400">
                  NOHYPE
                </span>
              </div>
              <div className="h-3 w-px bg-white/[0.06]" />
              <span className="text-[10px] text-zinc-500 tracking-wider">
                Built for <span className="text-zinc-300">{CLIENT_NAME}</span>
              </span>
            </div>

            {/* Center — system status */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-[2px] text-zinc-700">
                <div className="h-1 w-1 rounded-full bg-emerald-500/50 animate-pulse" />
                SYSTEM OPERATIONAL
              </div>
              <div className="h-3 w-px bg-white/[0.04]" />
              <span className="text-[9px] font-mono tracking-[2px] text-zinc-700">
                TRACEFLOW v1.0.0
              </span>
            </div>

            {/* Right — copyright */}
            <div className="text-[10px] text-zinc-700 tracking-wider">
              © 2026 <span className="text-zinc-500">NoHype</span> — All rights reserved
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
