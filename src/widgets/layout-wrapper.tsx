'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { MobileNav, ErrorBoundary } from '@/shared/ui';
import { useState } from 'react';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Не показываем сайдбар и хедер на страницах админки и авторизации
  const isAdminPage = pathname?.startsWith('/admin');
  const isAuthPage = pathname === '/auth';
  
  if (isAdminPage || isAuthPage) {
    return (
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    );
  }
  
  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-background">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        {/* Overlay для мобильных устройств */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 pb-20 lg:pb-6">{children}</main>
          
          {/* Мобильная навигация */}
          <MobileNav />
        </div>
      </div>
    </ErrorBoundary>
  );
}