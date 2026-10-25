'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isStudioRoute =
    pathname.startsWith('/ai-engine') ||
    pathname.startsWith('/chatbot') ||
    pathname.startsWith('/automations');

  return (
    <div className={isStudioRoute ? "h-screen flex bg-bg-app overflow-hidden" : "min-h-screen flex bg-bg-app"}>
      {/* Left-side Navigation Section */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className={isStudioRoute ? "flex-1 min-w-0 flex flex-col h-screen overflow-hidden" : "flex-1 min-w-0 flex flex-col min-h-screen"}>
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
        <main className={isStudioRoute ? "flex-1 w-full min-w-0 h-[calc(100vh-4rem)] overflow-hidden flex flex-col p-0" : "flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto"}>
          {children}
        </main>
      </div>
    </div>
  );
}
