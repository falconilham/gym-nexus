"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress, Box } from '@mui/material';

export default function SuperAdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/super-admin/dashboard');
  }, [router]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#000' }}>
      <CircularProgress color="primary" />
    </Box>
  );
}
