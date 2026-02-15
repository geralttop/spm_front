'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Header } from './header';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Не показываем сайдбар и хедер на страницах админки и авторизации
  const isAdminPage = pathname?.startsWith('/admin');
  const isAuthPage = pathname === '/auth';
  
  if (isAdminPage || isAuthPage) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}