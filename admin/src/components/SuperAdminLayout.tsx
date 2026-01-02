"use client";

import { Box } from '@mui/material';
import SuperAdminSidebar from '@/components/SuperAdminSidebar';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
      <SuperAdminSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginLeft: '280px',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
