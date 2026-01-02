"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useTenantUrl } from './useTenantUrl';

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
  gymId: number;
  gymName?: string;
}

export function useAuth(requireSuperAdmin = false) {
  const router = useRouter();
  const pathname = usePathname();
  const { getUrl, gymId } = useTenantUrl();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip auth check for login page
    if (pathname.endsWith('/login')) {
      setLoading(false);
      return;
    }

    const adminData = localStorage.getItem('admin');
    
    if (!adminData) {
      if (requireSuperAdmin) {
        router.push('/super-admin/login');
      } else {
        router.push(getUrl('/login'));
      }
      return;
    }

    try {
      const parsedAdmin = JSON.parse(adminData);
      
      // Check if super admin is required
      if (requireSuperAdmin && parsedAdmin.role !== 'super_admin') {
        router.push(getUrl('/'));
        return;
      }

      setAdmin(parsedAdmin);
      setLoading(false);
    } catch (error) {
      console.error('Error parsing admin data:', error);
      if (requireSuperAdmin) {
        router.push('/super-admin/login');
      } else {
        router.push(getUrl('/login'));
      }
    }
  }, [pathname, router, requireSuperAdmin, gymId, getUrl]);

  const logout = () => {
    localStorage.removeItem('admin');
    if (requireSuperAdmin) {
        router.push('/super-admin/login');
    } else {
        router.push(getUrl('/login'));
    }
  };

  return { admin, loading, logout };
}

export function AuthGuard({ 
  children, 
  requireSuperAdmin = false 
}: { 
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}) {
  const { admin, loading } = useAuth(requireSuperAdmin);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#0F0F0F',
        }}
      >
        <CircularProgress sx={{ color: 'var(--primary)' }} />
      </Box>
    );
  }

  if (!admin) {
    return null;
  }

  return <>{children}</>;
}
