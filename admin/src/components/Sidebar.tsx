'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Dumbbell, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { 
    Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Button
} from '@mui/material';

const MENU_ITEMS = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Members', path: '/members', icon: Users },
    { name: 'Schedule', path: '/schedule', icon: CalendarDays },
    { name: 'Equipment', path: '/equipment', icon: Dumbbell },
];

const drawerWidth = 256;

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
              width: drawerWidth, 
              boxSizing: 'border-box',
              backgroundColor: '#0F0F0F',
              borderRight: '1px solid #333',
              color: 'white'
          },
        }}
    >
      <Box sx={{ height: 64, display: 'flex', alignItems: 'center', px: 3, borderBottom: '1px solid #333' }}>
        <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '0.1em', color: 'white' }}>
          GYM<Box component="span" sx={{ color: 'var(--primary)' }}>NEXUS</Box>
        </Typography>
      </Box>

      <Box sx={{ mt: 3, px: 1.5 }}>
        <List>
            {MENU_ITEMS.map((item) => {
                const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
                const Icon = item.icon;

                return (
                    <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton 
                            component={Link} 
                            href={item.path}
                            selected={isActive}
                            sx={{
                                borderRadius: 2,
                                py: 1.5,
                                color: isActive ? 'var(--primary)' : '#9CA3AF',
                                backgroundColor: isActive ? '#1E1E1E !important' : 'transparent',
                                border: isActive ? '1px solid #333' : '1px solid transparent',
                                '&:hover': {
                                    backgroundColor: '#1E1E1E',
                                    color: 'white',
                                    '& .lucide': { color: isActive ? 'var(--primary)' : 'white' }
                                }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'var(--primary)' : '#6B7280' }}>
                                <Icon size={20} />
                            </ListItemIcon>
                            <ListItemText 
                                primary={item.name} 
                                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                            />
                        </ListItemButton>
                    </ListItem>
                );
            })}
        </List>
      </Box>

      <Box sx={{ position: 'absolute', bottom: 24, left: 0, width: '100%', px: 1.5 }}>
         <List>
            <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton 
                    component={Link} 
                    href="/settings"
                    selected={pathname === '/settings'}
                    sx={{
                        borderRadius: 2,
                        py: 1.5,
                        color: pathname === '/settings' ? 'var(--primary)' : '#9CA3AF',
                        backgroundColor: pathname === '/settings' ? '#1E1E1E !important' : 'transparent',
                        '&:hover': {
                            backgroundColor: '#1E1E1E',
                            color: 'white',
                             '& .lucide': { color: 'white' }
                        }
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40, color: pathname === '/settings' ? 'var(--primary)' : '#6B7280' }}>
                        <Settings size={20} />
                    </ListItemIcon>
                    <ListItemText 
                        primary="Settings" 
                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                    />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
                <ListItemButton 
                    sx={{
                        borderRadius: 2,
                        py: 1.5,
                        color: '#EF4444',
                        '&:hover': {
                            backgroundColor: 'rgba(127, 29, 29, 0.2)',
                            color: '#F87171'
                        }
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40, color: '#EF4444' }}>
                        <LogOut size={20} />
                    </ListItemIcon>
                    <ListItemText 
                        primary="Logout" 
                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                    />
                </ListItemButton>
            </ListItem>
         </List>
      </Box>
    </Drawer>
  );
}

