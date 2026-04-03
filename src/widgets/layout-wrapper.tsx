'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { ErrorBoundary } from '@/shared/ui';
import { useEffect, useState } from 'react';

/** Совпадает с `lg:` в Tailwind — мобильный оверлей сайдбара только ниже lg */
const MOBILE_SIDEBAR_MQ = '(max-width: 1023px)';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const unlockScroll = () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };

    if (!isSidebarOpen) {
      unlockScroll();
      return;
    }

    const mq = window.matchMedia(MOBILE_SIDEBAR_MQ);

    const apply = () => {
      if (mq.matches) {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
      } else {
        unlockScroll();
      }
    };

    apply();
    mq.addEventListener('change', apply);

    return () => {
      mq.removeEventListener('change', apply);
      unlockScroll();
    };
  }, [isSidebarOpen]);
  
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
        
        {/* Overlay для мобильных устройств (выше хэдера, ниже меню) */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-[55] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex min-h-0 flex-1 flex-col p-3 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}