"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Building2, Users, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Typography } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

const MENU_ITEMS = [
  { name: 'Dashboard', path: '/super-admin/dashboard', icon: LayoutDashboard },
  { name: 'Gyms', path: '/super-admin/gyms', icon: Building2 },
  { name: 'Members', path: '/super-admin/members', icon: Users },
];

export default function SuperAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    router.push('/super-admin/login');
  };

  const handleSettings = () => {
    router.push('/super-admin/settings');
  };

  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        backgroundColor: '#1a1a1a',
        borderRight: '1px solid #333',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid #333' }}>
        <Typography
          variant="h5"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            letterSpacing: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Building2 size={28} color="#bef264" />
          SUPER ADMIN
        </Typography>
        <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 0.5, display: 'block' }}>
          Platform Management
        </Typography>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, py: 2 }}>
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  backgroundColor: isActive ? 'rgba(190, 242, 100, 0.1)' : 'transparent',
                  borderLeft: isActive ? '3px solid #bef264' : '3px solid transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(190, 242, 100, 0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Icon size={20} color={isActive ? '#bef264' : '#9CA3AF'} />
                </ListItemIcon>
                <ListItemText
                  primary={item.name}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: isActive ? '#bef264' : '#E5E7EB',
                      fontWeight: isActive ? 600 : 400,
                      fontSize: '0.95rem',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: '#333' }} />

      {/* Bottom Actions */}
      <List sx={{ py: 2 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={handleSettings}
            sx={{
              mx: 1,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(190, 242, 100, 0.05)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Settings size={20} color="#9CA3AF" />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              sx={{
                '& .MuiListItemText-primary': {
                  color: '#E5E7EB',
                  fontSize: '0.95rem',
                },
              }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              mx: 1,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogOut size={20} color="#ef4444" />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              sx={{
                '& .MuiListItemText-primary': {
                  color: '#ef4444',
                  fontSize: '0.95rem',
                },
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
}
