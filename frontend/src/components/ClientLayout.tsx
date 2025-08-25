'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <AuthProvider>
      {!isLoginPage && <Navigation />}
      {isLoginPage ? (
        children
      ) : (
        <ProtectedRoute>
          {children}
        </ProtectedRoute>
      )}
    </AuthProvider>
  );
}