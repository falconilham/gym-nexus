"use client";

import Link from 'next/link';
import { ArrowUpRight, Users, Activity, Clock, Calendar, MessageSquare } from 'lucide-react';
import { 
    Box, Typography, Button, Paper, List, ListItem, 
    ListItemAvatar, Avatar, ListItemText, Chip, IconButton 
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
// useRouter, useParams might still be used if I don't remove them all, but I am replacing them
import { useTenantUrl } from '@/hooks/useTenantUrl';
import { AuthGuard, useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface KPICardProps {
  title: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  trend?: number;
  href?: string;
}

const KPICard = ({ title, value, sub, icon: Icon, trend, href }: KPICardProps) => {
  const { t } = useTranslation();
  const CardContent = (
    <Paper sx={{ 
      backgroundColor: '#1E1E1E', 
      border: '1px solid #333', 
      p: 3, 
      borderRadius: 3,
      cursor: href ? 'pointer' : 'default',
      transition: 'all 0.3s ease',
      '&:hover': href ? {
        borderColor: 'var(--primary)',
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(204, 255, 0, 0.15)',
      } : {}
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            backgroundColor: title === 'Revenue' ? 'rgba(20, 83, 45, 0.3)' : '#2C2C2C',
            color: title === 'Revenue' ? '#4ade80' : 'var(--primary)'
        }}>
          <Icon size={24} />
        </Box>
        {trend && (
          <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: '0.75rem', 
              fontWeight: 'bold', 
              color: '#4ade80', 
              backgroundColor: 'rgba(20, 83, 45, 0.3)', 
              px: 1, 
              py: 0.5, 
              borderRadius: 1 
          }}>
            +{trend}% <ArrowUpRight size={12} style={{ marginLeft: 4}}/>
          </Box>
        )}
      </Box>
      <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>{value}</Typography>
        <Typography variant="body2" sx={{ color: '#6B7280' }}>{sub}</Typography>
      </Box>
      
      {href && (
        <Box sx={{ 
            mt: 2, 
            pt: 2, 
            borderTop: '1px solid #333', 
            display: 'flex', 
            justifyContent: 'flex-end',
            alignItems: 'center'
        }}>
            <Typography 
                variant="caption" 
                sx={{ 
                    color: 'var(--primary)', 
                    fontWeight: 'bold', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                }}
            >
                {t('dashboard.view_all')} <ArrowUpRight size={14} />
            </Typography>
        </Box>
      )}
    </Paper>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none' }}>
        {CardContent}
      </Link>
    );
  }

  return CardContent;
};

interface ExpiringMember {
  id: number;
  name: string;
  email: string;
  endDate: string;
  daysLeft: number;
  photo?: string;
}

interface TodayCheckIn {
  id: number;
  memberName?: string;
  timestamp: string;
  status: 'granted' | 'denied';
}

export default function Home() {
  const { t } = useTranslation();
  const { getUrl } = useTenantUrl();
  const { admin } = useAuth();
  const [stats, setStats] = useState({ totalMembers: 0, dailyCheckIns: 0, revenue: 0, activeMembers: 0 });
  const [expiringMembers, setExpiringMembers] = useState<ExpiringMember[]>([]);
  const [todayCheckIns, setTodayCheckIns] = useState<TodayCheckIn[]>([]);

  useEffect(() => {
    if (!admin?.gymId) return;

    const fetchData = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fitflow-backend.vercel.app';
            const config = { params: { gymId: admin.gymId } };
            
            // Fetch Stats
            const statsRes = await axios.get(`${API_URL}/api/admin/stats`, config);
            setStats(statsRes.data);

            // Fetch Expiring Members
            const expiringRes = await axios.get(`${API_URL}/api/admin/members/expiring`, config);
            setExpiringMembers(expiringRes.data);

            // Fetch Today Check-ins
            const checkInsRes = await axios.get(`${API_URL}/api/admin/check-ins`, { 
                params: { 
                    gymId: admin.gymId,
                    date: new Date().toLocaleDateString('en-CA') 
                } 
            });
            setTodayCheckIns(checkInsRes.data);
        } catch (error) {
            console.error(error);
        }
    };
    fetchData();
  }, [admin?.gymId]);

  return (
    <AuthGuard>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>{t('dashboard.title')}</Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 0.5 }}>{t('dashboard.welcome')}, Admin</Typography>
          </Box>
        </Box>

        {/* KPI Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          <Box>
              <KPICard 
                  title={t('dashboard.stats.total_members')} 
                  value={stats.totalMembers.toLocaleString()} 
                  sub={t('dashboard.stats.active_members')}
                  icon={Users} 
                //   trend={12}
                  href={getUrl('/members')}
              />
          </Box>
          <Box>
              <KPICard 
                  title={t('dashboard.stats.daily_checkins')} 
                  value={stats.dailyCheckIns} 
                  sub={t('dashboard.today')} 
                  icon={Activity}
                  href={getUrl('/check-ins')}
              />
          </Box>
        </Box>

        {/* Recent Activity Section */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
          {/* Expiring Members Widget */}
          <Box>
              <Paper sx={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ p: 3, borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Clock size={20} color="#f87171" />
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>{t('dashboard.expiring_members')}</Typography>
                      </Box>
                  </Box>
                  <List sx={{ pt: 0, pb: 0 }}>
                      {expiringMembers.length > 0 ? (
                          expiringMembers.map((member, index) => (
                              <ListItem 
                                  key={member.id} 
                                  sx={{ 
                                      borderBottom: index !== expiringMembers.length - 1 ? '1px solid #333' : 'none',
                                      '&:hover': { backgroundColor: '#252525' }
                                  }}
                              >
                                  <ListItemAvatar>
                                      <Avatar sx={{ backgroundColor: '#333', color: 'white' }} src={member.photo}>
                                          {member.name.charAt(0)}
                                      </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText 
                                      primary={<Typography sx={{ color: 'white', fontWeight: 500 }}>{member.name}</Typography>}
                                      secondary={
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                              <Calendar size={12} color="#6B7280" />
                                              <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                                  Ends {new Date(member.endDate).toLocaleDateString()}
                                              </Typography>
                                          </Box>
                                      }
                                  />
                                  <Chip 
                                      label={`${member.daysLeft} Days`} 
                                      size="small"
                                      sx={{ 
                                          fontWeight: 'bold', 
                                          borderRadius: 1,
                                          backgroundColor: member.daysLeft <= 3 ? 'rgba(248, 113, 113, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                                          color: member.daysLeft <= 3 ? '#f87171' : '#fbbf24'
                                      }}
                                  />
                                  <IconButton size="small" sx={{ ml: 1, color: '#9CA3AF', '&:hover': { color: '#CCFF00' } }} href={`mailto:${member.email}`}>
                                      <MessageSquare size={16} />
                                  </IconButton>
                              </ListItem>
                          ))
                      ) : (
                          <Box sx={{ p: 4, textAlign: 'center', color: '#6B7280' }}>
                              <Typography>No memberships expiring in 7 days.</Typography>
                              <Typography variant="caption">All active members are good.</Typography>
                          </Box>
                      )}
                  </List>
                  <Box sx={{ 
                      p: 2, 
                      borderTop: '1px solid #333', 
                      display: 'flex', 
                      justifyContent: 'flex-end'
                  }}>
                      <Link href={getUrl('/members?filter=expiring')} style={{ textDecoration: 'none' }}>
                          <Typography 
                              variant="caption" 
                              sx={{ 
                                  color: 'var(--primary)', 
                                  fontWeight: 'bold', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 0.5,
                                  textTransform: 'uppercase', 
                                  letterSpacing: 0.5
                              }}
                          >
                              {t('dashboard.view_all')} <ArrowUpRight size={14} />
                          </Typography>
                      </Link>
                  </Box>
              </Paper>
          </Box>

          {/* Recent Check-ins Widget */}
          <Box>
              <Paper sx={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: 3, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ p: 3, borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>{t('dashboard.recent_checkins')}</Typography>
                  </Box>
                  <List sx={{ pt: 0, pb: 0, flex: 1 }}>
                      {todayCheckIns.length > 0 ? (
                          todayCheckIns.map((checkin, index) => (
                              <ListItem 
                                  key={checkin.id} 
                                  sx={{ 
                                      borderBottom: index !== todayCheckIns.length - 1 ? '1px solid #333' : 'none',
                                      '&:hover': { backgroundColor: '#252525' }
                                  }}
                              >
                                  <ListItemAvatar>
                                      <Avatar sx={{ backgroundColor: '#333', color: 'white', fontWeight: 'bold' }}>
                                          {checkin.memberName ? checkin.memberName.charAt(0) : '?'}
                                      </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText 
                                      primary={<Typography sx={{ color: 'white', fontWeight: 500 }}>{checkin.memberName || 'Unknown'}</Typography>}
                                      secondary={
                                          <Typography variant="body2" sx={{ color: '#6B7280' }}>
                                              {new Date(checkin.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(checkin.timestamp).toLocaleDateString()}
                                          </Typography>
                                      }
                                  />
                                  <Chip 
                                      label={checkin.status === 'granted' ? 'Success' : 'Denied'} 
                                      size="small"
                                      sx={{ 
                                          fontWeight: 'bold', 
                                          borderRadius: 1,
                                          backgroundColor: checkin.status === 'granted' ? 'rgba(20, 83, 45, 0.3)' : 'rgba(127, 29, 29, 0.3)',
                                          color: checkin.status === 'granted' ? '#4ade80' : '#f87171'
                                      }}
                                  />
                              </ListItem>
                          ))
                      ) : (
                          <Box sx={{ p: 3, textAlign: 'center', color: '#6B7280' }}>
                              No check-ins today yet.
                          </Box>
                      )}
                  </List>
                  <Box sx={{ 
                      p: 2, 
                      borderTop: '1px solid #333', 
                      display: 'flex', 
                      justifyContent: 'flex-end',
                      mt: 'auto'
                  }}>
                      <Link href={getUrl('/check-ins')} style={{ textDecoration: 'none' }}>
                          <Typography 
                              variant="caption" 
                              sx={{ 
                                  color: 'var(--primary)', 
                                  fontWeight: 'bold', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 0.5,
                                  textTransform: 'uppercase', 
                                  letterSpacing: 0.5
                              }}
                          >
                              {t('dashboard.view_all')} <ArrowUpRight size={14} />
                          </Typography>
                      </Link>
                  </Box>
              </Paper>
          </Box>
        </Box>


      </Box>
    </AuthGuard>
  );
}
