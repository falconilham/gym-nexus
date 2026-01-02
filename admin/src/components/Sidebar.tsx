'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Dumbbell, 
  Settings, 
  LogOut,
  ChevronRight,
  UserCheck,
  BarChart3,
  QrCode
} from 'lucide-react';
import { 
    Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, Stack
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { useTenantUrl } from '@/hooks/useTenantUrl';
import { useGym } from '@/context/GymContext'; 
import { motion } from 'framer-motion';

const drawerWidth = 280;

export default function Sidebar() {
  const pathname = usePathname();
  const { getUrl, gymId } = useTenantUrl();
  const { logout } = useAuth();
  const { gym } = useGym(); 

  const MENU_ITEMS = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, feature: 'dashboard' },
    { name: 'Scanner', path: '/scanner', icon: QrCode, feature: 'dashboard' },
    { name: 'Members', path: '/members', icon: Users, feature: 'members' },
    { name: 'Trainers', path: '/trainers', icon: UserCheck, feature: 'trainers' },
    { name: 'Schedule', path: '/schedule', icon: CalendarDays, feature: 'schedule' },
    { name: 'Reports', path: '/reports', icon: BarChart3, feature: 'dashboard' },
    { name: 'Equipment', path: '/equipment', icon: Dumbbell, feature: 'settings' },
  ];

  return (
    <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
              width: drawerWidth, 
              boxSizing: 'border-box',
              backgroundColor: '#0A0A0A',
              borderRight: '1px solid rgba(255,255,255,0.05)',
              color: 'white',
              boxShadow: '10px 0 30px rgba(0,0,0,0.5)'
          },
        }}
    >
      {/* Brand Header */}
      <Box sx={{ 
        height: 80, 
        display: 'flex', 
        alignItems: 'center', 
        px: 3, 
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(255,255,255,0.02)'
      }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
            {gym?.logo ? (
                <Box 
                    component="img" 
                    src={gym.logo} 
                    alt={gym.name || "Gym Logo"} 
                    sx={{ maxHeight: 32, maxWidth: 120, objectFit: 'contain' }} 
                />
            ) : (
                <Box sx={{ 
                    p: 0.8, 
                    backgroundColor: 'var(--primary)', 
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 15px rgba(204, 255, 0, 0.2)'
                }}>
                    <Dumbbell size={20} color="black" />
                </Box>
            )}
            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -1, lineHeight: 1 }}>
                {gym?.name?.split(' ')[0].toUpperCase() || 'GYM'}<Box component="span" sx={{ color: 'var(--primary)' }}>{gym?.name?.split(' ')[1]?.toUpperCase() || 'NEXUS'}</Box>
            </Typography>
        </Stack>
      </Box>


      <Box sx={{ flex: 1, px: 2 }}>
        <Typography variant="overline" sx={{ px: 2, color: '#444', fontWeight: 800, letterSpacing: 1.5, mb: 1, display: 'block' }}>
            MAIN MENU
        </Typography>
        <List sx={{ pt: 0 }}>
            {MENU_ITEMS.filter(item => !gym?.features || gym.features.includes(item.feature)).map((item) => {
                const url = getUrl(item.path);
                const isActive = item.path === '/' 
                    ? pathname === url || pathname === `/${gymId}` || pathname === `/${gymId}/`
                    : pathname.startsWith(url);
                
                const Icon = item.icon;

                return (
                    <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton 
                            component={Link} 
                            href={url}
                            selected={isActive}
                            sx={{
                                borderRadius: 2.5,
                                py: 1.5,
                                px: 2,
                                transition: 'all 0.2s ease',
                                color: isActive ? 'white' : '#6B7280',
                                backgroundColor: isActive ? 'rgba(201, 255, 44, 0.08) !important' : 'transparent',
                                border: isActive ? '1px solid rgba(204, 255, 0, 0.15)' : '1px solid transparent',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    color: 'white',
                                    '& .lucide': { color: 'var(--primary)' }
                                },
                                '& .MuiTouchRipple-root': { color: 'var(--primary)' }
                            }}
                        >
                            <ListItemIcon sx={{ 
                                minWidth: 36, 
                                color: isActive ? 'var(--primary)' : '#4B5563',
                                transition: 'all 0.2s ease'
                            }}>
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </ListItemIcon>
                            <ListItemText 
                                primary={item.name} 
                                primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive ? 700 : 500, letterSpacing: 0.2 }}
                            />
                            {isActive && (
                                <motion.div layoutId="active-indicator">
                                    <ChevronRight size={14} color="var(--primary)" />
                                </motion.div>
                            )}
                        </ListItemButton>
                    </ListItem>
                );
            })}
        </List>
      </Box>

      <Box sx={{ p: 2, pb: 4 }}>
         <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.05)' }} />
         <List>
            <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton 
                    component={Link} 
                    href={getUrl('/settings')}
                    selected={pathname.startsWith(getUrl('/settings'))}
                    sx={{
                        borderRadius: 2.5,
                        py: 1.2,
                        transition: 'all 0.2s ease',
                        color: pathname.startsWith(getUrl('/settings')) ? 'white' : '#6B7280',
                        backgroundColor: pathname.startsWith(getUrl('/settings')) ? 'rgba(255,255,255,0.05) !important' : 'transparent',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'white'
                        }
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 36, color: pathname.startsWith(getUrl('/settings')) ? 'white' : '#4B5563' }}>
                        <Settings size={18} />
                    </ListItemIcon>
                    <ListItemText 
                        primary="Settings" 
                        primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                    />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
                <ListItemButton 
                    onClick={logout}
                    sx={{
                        borderRadius: 2.5,
                        py: 1.2,
                        color: '#F87171',
                        '&:hover': {
                            backgroundColor: 'rgba(248, 113, 113, 0.1)',
                            color: '#FCA5A5',
                            '& .lucide': { transform: 'translateX(3px)' }
                        },
                        transition: 'all 0.2s ease'
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                        <LogOut size={18} className="lucide" />
                    </ListItemIcon>
                    <ListItemText 
                        primary="Logout" 
                        primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
                    />
                </ListItemButton>
            </ListItem>
         </List>
      </Box>
    </Drawer>
  );
}
