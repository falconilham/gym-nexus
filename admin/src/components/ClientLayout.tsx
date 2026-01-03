"use client";

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Box, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { Menu as MenuIcon } from 'lucide-react';

import { GymProvider, useGym } from '@/context/GymContext';
import GymNotFound from '@/components/GymNotFound';
import '@/i18n';
import axios from 'axios';

// Bypass Ngrok warning page for API calls
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#CCFF00' },
        background: { default: '#050505', paper: '#1E1E1E' },
    },
});

function InnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isNotFound } = useGym();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Initialize as true to match server-side rendering, then update on client
  const [isRootDomain, setIsRootDomain] = useState(true);
  
  useEffect(() => {
    const hostname = window.location.hostname;
    const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000').split(':')[0];
    
    const isRoot = hostname === rootDomain || 
           hostname === `www.${rootDomain}` || 
           hostname === 'gym-nexus.vercel.app';
    
    setTimeout(() => setIsRootDomain(isRoot), 0);
  }, []);
  
  // Hide sidebar on:
  // 1. Login pages
  // 2. Super Admin pages
  // 3. The Root Landing Page (but NOT a Gym Dashboard at /)
  // If gym is not found and we are not on the root domain, show GymNotFound
  if (isNotFound && !isRootDomain) {
    return <GymNotFound />;
  }

  // Hide sidebar on:
  // 1. Login pages
  // 2. Super Admin pages (/super-admin/*)
  // 3. The Root Landing Page (but NOT a Gym Dashboard at /)
  const hideSidebar = 
    pathname.split('/').some(p => p === 'login') || 
    pathname.startsWith('/super-admin') ||
    (pathname === '/' && isRootDomain);

  if (hideSidebar) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: '#050505',
        display: 'flex',
        flexDirection: 'column',
        '& input:-webkit-autofill': {
          WebkitBoxShadow: '0 0 0 1000px #1E1E1E inset !important',
          WebkitTextFillColor: 'white !important',
          transition: 'background-color 5000s ease-in-out 0s',
        }
      }}>
        {children}
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh', 
      backgroundColor: '#050505',
      '& input:-webkit-autofill': {
        WebkitBoxShadow: '0 0 0 1000px #1E1E1E inset !important',
        WebkitTextFillColor: 'white !important',
        transition: 'background-color 5000s ease-in-out 0s',
      }
    }}>
      {/* Mobile Header */}
      {isMobile && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          backgroundColor: '#0A0A0A',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <IconButton
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{
              color: 'var(--primary)',
              border: '1px solid rgba(204, 255, 0, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(204, 255, 0, 0.1)',
                borderColor: 'var(--primary)',
              },
            }}
          >
            <MenuIcon size={24} />
          </IconButton>
        </Box>
      )}

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar mobileOpen={mobileOpen} onMobileToggle={() => setMobileOpen(!mobileOpen)} />
        <Box component="main" sx={{ 
          flex: 1, 
          p: { xs: 2, sm: 3, md: 4 }, 
          backgroundColor: '#050505', 
          position: 'relative',
          width: { xs: '100%', md: 'auto' },
          overflow: 'auto'
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: 'mui' });
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }
    let styles = '';
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <GymProvider>
              <InnerLayout>{children}</InnerLayout>
            </GymProvider>
        </ThemeProvider>
    </CacheProvider>
  );
}
