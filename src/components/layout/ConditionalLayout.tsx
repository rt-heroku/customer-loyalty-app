'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import AppLayout from './AppLayout';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  // Pages that don't require authentication
  const publicPages = ['/login', '/register', '/forgot-password'];
  const isPublicPage = publicPages.includes(pathname);

  // Handle main page redirect
  useEffect(() => {
    if (pathname === '/' && !loading && !user) {
      router.push('/login');
    }
  }, [pathname, loading, user, router]);

  // If it's a public page, render children directly
  if (isPublicPage) {
    return <>{children}</>;
  }

  // For main page, show nothing while redirecting
  if (pathname === '/' && !user) {
    return null;
  }

  // For protected pages, use AppLayout which handles authentication
  return <AppLayout>{children}</AppLayout>;
}
