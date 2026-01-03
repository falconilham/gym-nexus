'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
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
  QrCode,
  Activity
} from 'lucide-react';
import { 
    Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, Stack, useMediaQuery, useTheme
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { useTenantUrl } from '@/hooks/useTenantUrl';
import { useGym } from '@/context/GymContext'; 
import { motion } from 'framer-motion';

const drawerWidth = 280;

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
}

export default function Sidebar({ mobileOpen: externalMobileOpen, onMobileToggle }: SidebarProps = {}) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  
  const pathname = usePathname();
  const { getUrl, gymId } = useTenantUrl();
  const { logout } = useAuth();
  const { gym } = useGym(); 

  // Use external control if provided, otherwise use internal state
  const mobileOpen = externalMobileOpen !== undefined ? externalMobileOpen : internalMobileOpen;
  const handleDrawerToggle = onMobileToggle || (() => setInternalMobileOpen(!internalMobileOpen));



  const MENU_ITEMS = [
    { name: t('sidebar.dashboard'), path: '/', icon: LayoutDashboard, feature: 'dashboard' },
    { name: t('sidebar.check_in'), path: '/check-in', icon: QrCode, feature: 'check_in' },
    { name: t('sidebar.members'), path: '/members', icon: Users, feature: 'members' },
    { name: t('sidebar.trainers'), path: '/trainers', icon: UserCheck, feature: 'trainers' },
    { name: t('sidebar.schedule'), path: '/schedule', icon: CalendarDays, feature: 'schedule' },
    { name: t('sidebar.reports'), path: '/reports', icon: BarChart3, feature: 'dashboard' },
    { name: t('sidebar.activity'), path: '/activity', icon: Activity, feature: 'activity' },
    { name: t('sidebar.equipment'), path: '/equipment', icon: Dumbbell, feature: 'settings' },
  ];

  const drawerContent = (
    <>
      {/* Brand Header */}
      <Box sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 120
      }}>
        {/* ... existing brand content ... */}
        <Stack direction="column" spacing={2} alignItems="flex-start">
            {gym?.logo ? (
                <Box
                    component="img"
                    src={gym.logo}
                    alt={gym.name || "Gym Logo"}
                    sx={{ maxHeight: 48, maxWidth: '100%', objectFit: 'contain' }}
                />
            ) : (
                <Box sx={{
                    p: 1,
                    backgroundColor: 'var(--primary)',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 15px rgba(204, 255, 0, 0.2)'
                }}>
                    <Dumbbell size={24} color="black" />
                </Box>
            )}
            <Typography variant="h6" sx={{ 
                fontWeight: 900, 
                letterSpacing: -0.5, 
                lineHeight: 1.1, 
                color: 'white',
                width: '100%',
                wordBreak: 'break-word'
            }}>
                {gym?.name?.toUpperCase() || 'GYMNEXUS'}
            </Typography>
        </Stack>
      </Box>


      <Box sx={{ flex: 1, px: 2 }}>
        <Typography variant="overline" sx={{ px: 2, color: '#444', fontWeight: 800, letterSpacing: 1.5, mb: 1, display: 'block' }}>
            {t('sidebar.main_menu')}
        </Typography>
        <List sx={{ pt: 0 }}>
            {MENU_ITEMS.filter(item => !gym?.features || gym.features.includes(item.feature)).map((item) => {
                // ... existing item mapping logic ...
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
                            onClick={() => isMobile && handleDrawerToggle()}
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
                    onClick={() => isMobile && handleDrawerToggle()}
                    sx={{
                        borderRadius: 2.5,
                        py: 1.5,
                        px: 2,
                        transition: 'all 0.2s ease',
                        color: pathname.startsWith(getUrl('/settings')) ? 'white' : '#6B7280',
                        backgroundColor: pathname.startsWith(getUrl('/settings')) ? 'rgba(201, 255, 44, 0.08) !important' : 'transparent',
                        border: pathname.startsWith(getUrl('/settings')) ? '1px solid rgba(204, 255, 0, 0.15)' : '1px solid transparent',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'white',
                            '& .lucide': { color: 'var(--primary)' }
                        }
                    }}
                >
                    <ListItemIcon sx={{ 
                        minWidth: 36, 
                        color: pathname.startsWith(getUrl('/settings')) ? 'var(--primary)' : '#4B5563' 
                    }}>
                        <Settings size={20} strokeWidth={pathname.startsWith(getUrl('/settings')) ? 2.5 : 2} />
                    </ListItemIcon>
                    <ListItemText 
                        primary={t('sidebar.settings')} 
                        primaryTypographyProps={{ 
                            fontSize: '0.9rem', 
                            fontWeight: pathname.startsWith(getUrl('/settings')) ? 700 : 500,
                            letterSpacing: 0.2 
                        }}
                    />
                    {pathname.startsWith(getUrl('/settings')) && (
                        <motion.div layoutId="active-indicator">
                            <ChevronRight size={14} color="var(--primary)" />
                        </motion.div>
                    )}
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
                <ListItemButton 
                    onClick={() => {
                        logout();
                        if (isMobile) handleDrawerToggle();
                    }}
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
                        primary={t('sidebar.logout')} 
                        primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
                    />
                </ListItemButton>
            </ListItem>
         </List>
      </Box>
    </>
  );

  return (
    <>
      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              width: drawerWidth, 
              boxSizing: 'border-box',
              backgroundColor: '#0A0A0A',
              borderRight: '1px solid rgba(255,255,255,0.05)',
              color: 'white',
              boxShadow: '10px 0 30px rgba(0,0,0,0.5)'
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        /* Desktop Permanent Drawer */
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
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
          {drawerContent}
        </Drawer>
      )}
    </>
  );
}
