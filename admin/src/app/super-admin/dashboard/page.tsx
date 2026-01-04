"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  Building2, Users, Activity, TrendingUp, CheckCircle, Calendar, Shield 
} from 'lucide-react';
import { 
  Box, Typography, Paper, Grid, CircularProgress,
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip
} from '@mui/material';
import axios from 'axios';
import { AuthGuard } from '@/hooks/useAuth';
import SuperAdminLayout from '@/components/SuperAdminLayout';

interface Stats {
  totalGyms: number;
  activeGyms: number;
  totalMembers: number;
  totalAdmins: number;
  todayCheckIns: number;
}

interface Gym {
  id: number;
  name: string;
  subdomain: string;
  status: string;
  memberCount: number;
  todayCheckIns: number;
}

interface RecentMember {
  id: number;
  userName: string;
  userEmail: string;
  gymName: string;
  status: string;
  suspended: boolean;
  daysRemaining: number;
}

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalGyms: 0,
    activeGyms: 0,
    totalMembers: 0,
    totalAdmins: 0,
    todayCheckIns: 0,
  });
  const [topGyms, setTopGyms] = useState<Gym[]>([]);
  const [recentMembers, setRecentMembers] = useState<RecentMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fitflow-backend.vercel.app';

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await axios.get(`${API_URL}/api/super-admin/stats`);
      setStats(statsResponse.data);

      // Fetch gyms (for top gyms)
      const gymsResponse = await axios.get(`${API_URL}/api/super-admin/gyms`);
      const sortedGyms = gymsResponse.data
        .sort((a: Gym, b: Gym) => b.memberCount - a.memberCount)
        .slice(0, 5);
      setTopGyms(sortedGyms);

      // Fetch recent members
      const membersResponse = await axios.get(`${API_URL}/api/super-admin/members`);
      setRecentMembers(membersResponse.data.slice(0, 5));

      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching dashboard data:', err);
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

   useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getStatusColor = (member: RecentMember) => {
    if (member.suspended) return '#f59e0b';
    if (member.daysRemaining <= 0) return '#ef4444';
    if (member.daysRemaining < 7) return '#f59e0b';
    return '#10b981';
  };

  const getStatusText = (member: RecentMember) => {
    if (member.suspended) return 'Suspended';
    if (member.daysRemaining <= 0) return 'Expired';
    if (member.daysRemaining < 7) return 'Expiring Soon';
    return 'Active';
  };

  return (
    <AuthGuard requireSuperAdmin={true}>
      <SuperAdminLayout>
        <Box sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
              Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: '#9CA3AF' }}>
              Platform overview and key metrics
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Paper sx={{ p: 3, mb: 4, backgroundColor: '#7f1d1d', border: '1px solid #991b1b' }}>
              <Typography variant="h6" sx={{ color: '#fca5a5', mb: 1, fontWeight: 'bold' }}>
                Error Loading Dashboard
              </Typography>
              <Typography sx={{ color: '#fecaca' }}>{error}</Typography>
            </Paper>
          )}

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: 'var(--primary)' }} />
            </Box>
          )}

          {/* Dashboard Content */}
          {!loading && !error && (
            <>
              {/* Stats Cards */}
              <Grid container spacing={3} columns={{ xs: 12, sm: 12, md: 10 }} sx={{ mb: 4 }}>
                {/* Total Gyms */}
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <Paper sx={{ 
                    p: 2.5, 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #2a2a2a',
                    borderRadius: 2,
                    height: '100%',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#3a3a3a',
                      transform: 'translateY(-2px)',
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 1.5, 
                        backgroundColor: 'rgba(190, 242, 100, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Building2 size={20} color="var(--primary)" />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5, lineHeight: 1 }}>
                          {stats.totalGyms}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                          Total Gyms
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Active Gyms */}
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <Paper sx={{ 
                    p: 2.5, 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #2a2a2a',
                    borderRadius: 2,
                    height: '100%',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#3a3a3a',
                      transform: 'translateY(-2px)',
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 1.5, 
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <CheckCircle size={20} color="#10b981" />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5, lineHeight: 1 }}>
                          {stats.activeGyms}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                          Active
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Total Members */}
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <Paper sx={{ 
                    p: 2.5, 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #2a2a2a',
                    borderRadius: 2,
                    height: '100%',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#3a3a3a',
                      transform: 'translateY(-2px)',
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 1.5, 
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Users size={20} color="#3b82f6" />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5, lineHeight: 1 }}>
                          {stats.totalMembers}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                          Total Members
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Today's Check-ins */}
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <Paper sx={{ 
                    p: 2.5, 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #2a2a2a',
                    borderRadius: 2,
                    height: '100%',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#3a3a3a',
                      transform: 'translateY(-2px)',
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 1.5, 
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Activity size={20} color="#f59e0b" />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5, lineHeight: 1 }}>
                          {stats.todayCheckIns}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                          Today&apos;s Check-ins
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Total Admins */}
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <Paper sx={{ 
                    p: 2.5, 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #2a2a2a',
                    borderRadius: 2,
                    height: '100%',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#3a3a3a',
                      transform: 'translateY(-2px)',
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 1.5, 
                        backgroundColor: 'rgba(132, 204, 22, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Shield size={20} color="#84cc16" />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5, lineHeight: 1 }}>
                          {stats.totalAdmins}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                          Gym Admins
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Two Column Layout */}
              <Grid container spacing={3}>
                {/* Top Gyms */}
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Paper sx={{ p: 3, backgroundColor: '#1E1E1E', border: '1px solid #333', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <TrendingUp size={24} color="var(--primary)" />
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Top Gyms by Members
                      </Typography>
                    </Box>

                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ color: '#9CA3AF', fontWeight: 'bold', border: 'none', pb: 2 }}>
                              Gym
                            </TableCell>
                            <TableCell sx={{ color: '#9CA3AF', fontWeight: 'bold', border: 'none', pb: 2 }}>
                              Members
                            </TableCell>
                            <TableCell sx={{ color: '#9CA3AF', fontWeight: 'bold', border: 'none', pb: 2 }}>
                              Today
                            </TableCell>
                            <TableCell sx={{ color: '#9CA3AF', fontWeight: 'bold', border: 'none', pb: 2 }}>
                              Status
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {topGyms.map((gym, index) => (
                            <TableRow 
                              key={gym.id}
                              sx={{ 
                                '&:hover': { backgroundColor: '#252525' },
                                borderBottom: index === topGyms.length - 1 ? 'none' : '1px solid #333'
                              }}
                            >
                              <TableCell sx={{ color: 'white', border: 'none', py: 2 }}>
                                <Box>
                                  <Typography sx={{ fontWeight: '600' }}>
                                    {gym.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                                    {gym.subdomain}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ color: 'white', border: 'none' }}>
                                {gym.memberCount}
                              </TableCell>
                              <TableCell sx={{ color: '#f59e0b', border: 'none', fontWeight: 'bold' }}>
                                {gym.todayCheckIns}
                              </TableCell>
                              <TableCell sx={{ border: 'none' }}>
                                <Chip
                                  label={gym.status}
                                  size="small"
                                  sx={{
                                    backgroundColor: gym.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                    color: gym.status === 'active' ? '#10b981' : '#ef4444',
                                    fontWeight: 'bold',
                                    textTransform: 'capitalize',
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>

                {/* Recent Members */}
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Paper sx={{ p: 3, backgroundColor: '#1E1E1E', border: '1px solid #333', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Calendar size={24} color="var(--primary)" />
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Recent Memberships
                      </Typography>
                    </Box>

                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ color: '#9CA3AF', fontWeight: 'bold', border: 'none', pb: 2 }}>
                              Member
                            </TableCell>
                            <TableCell sx={{ color: '#9CA3AF', fontWeight: 'bold', border: 'none', pb: 2 }}>
                              Gym
                            </TableCell>
                            <TableCell sx={{ color: '#9CA3AF', fontWeight: 'bold', border: 'none', pb: 2 }}>
                              Status
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {recentMembers.map((member, index) => (
                            <TableRow 
                              key={member.id}
                              sx={{ 
                                '&:hover': { backgroundColor: '#252525' },
                                borderBottom: index === recentMembers.length - 1 ? 'none' : '1px solid #333'
                              }}
                            >
                              <TableCell sx={{ color: 'white', border: 'none', py: 2 }}>
                                <Box>
                                  <Typography sx={{ fontWeight: '600' }}>
                                    {member.userName}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                                    {member.userEmail}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ color: '#E5E7EB', border: 'none' }}>
                                {member.gymName}
                              </TableCell>
                              <TableCell sx={{ border: 'none' }}>
                                <Chip
                                  label={getStatusText(member)}
                                  size="small"
                                  sx={{
                                    backgroundColor: `${getStatusColor(member)}20`,
                                    color: getStatusColor(member),
                                    fontWeight: 'bold',
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </SuperAdminLayout>
    </AuthGuard>
  );
}
