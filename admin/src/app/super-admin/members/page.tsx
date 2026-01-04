"use client";

import { useState, useEffect, useCallback } from 'react';
import { Users, Search, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, TextField,
    InputAdornment, CircularProgress
} from '@mui/material';
import axios from 'axios';
import { AuthGuard } from '@/hooks/useAuth';
import SuperAdminLayout from '@/components/SuperAdminLayout';

interface Member {
  id: number;
  userId: number;
  gymId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  gymName: string;
  gymSubdomain: string;
  status: string;
  suspended: boolean;
  joinDate: string;
  endDate: string;
  duration: string;
  daysRemaining: number;
}

export default function SuperAdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fitflow-backend.vercel.app';

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/super-admin/members`);
      setMembers(response.data);
      setFilteredMembers(response.data);
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching members:', err);
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const getStatusColor = (member: Member) => {
    if (member.suspended) return '#f59e0b';
    if (member.daysRemaining <= 0) return '#ef4444';
    if (member.daysRemaining < 7) return '#f59e0b';
    return '#10b981';
  };

  const getStatusText = (member: Member) => {
    if (member.suspended) return 'Suspended';
    if (member.daysRemaining <= 0) return 'Expired';
    if (member.daysRemaining < 7) return 'Expiring Soon';
    return 'Active';
  };

   useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMembers(members);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = members.filter(member =>
        member.userName.toLowerCase().includes(query) ||
        member.userEmail.toLowerCase().includes(query) ||
        member.gymName.toLowerCase().includes(query) ||
        member.gymSubdomain.toLowerCase().includes(query)
      );
      setFilteredMembers(filtered);
    }
  }, [searchQuery, members]);
  
  return (
    <AuthGuard requireSuperAdmin={true}>
      <SuperAdminLayout>
        <Box sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
              Members Management
            </Typography>
            <Typography variant="body1" sx={{ color: '#9CA3AF' }}>
              View and manage all members across all gyms
            </Typography>
          </Box>

          {/* Search */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search by member name, email, or gym..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} color="#9CA3AF" />
                  </InputAdornment>
                ),
              }}
              sx={{
                maxWidth: 600,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#1E1E1E',
                  color: 'white',
                  '& fieldset': { borderColor: '#333' },
                  '&:hover fieldset': { borderColor: '#666' },
                  '&.Mui-focused fieldset': { borderColor: 'var(--primary)' },
                },
              }}
            />
          </Box>

          {/* Stats Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4 }}>
            <Paper sx={{ p: 3, backgroundColor: '#1E1E1E', border: '1px solid #333' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Users size={24} color="var(--primary)" />
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {members.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                    Total Members
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, backgroundColor: '#1E1E1E', border: '1px solid #333' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle size={24} color="#10b981" />
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {members.filter(m => !m.suspended && m.daysRemaining > 7).length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                    Active
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, backgroundColor: '#1E1E1E', border: '1px solid #333' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AlertCircle size={24} color="#f59e0b" />
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {members.filter(m => m.daysRemaining > 0 && m.daysRemaining < 7).length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                    Expiring Soon
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, backgroundColor: '#1E1E1E', border: '1px solid #333' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <XCircle size={24} color="#ef4444" />
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {members.filter(m => m.suspended).length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                    Suspended
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Error Alert */}
          {error && (
            <Paper sx={{ p: 3, mb: 4, backgroundColor: '#7f1d1d', border: '1px solid #991b1b' }}>
              <Typography variant="h6" sx={{ color: '#fca5a5', mb: 1, fontWeight: 'bold' }}>
                Error Loading Members
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

          {/* Members Table */}
          {!loading && !error && (
            <TableContainer component={Paper} sx={{ backgroundColor: '#1E1E1E', border: '1px solid #333' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#252525' }}>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 'bold', borderBottom: '1px solid #333' }}>
                      Member
                    </TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 'bold', borderBottom: '1px solid #333' }}>
                      Gym
                    </TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 'bold', borderBottom: '1px solid #333' }}>
                      Duration
                    </TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 'bold', borderBottom: '1px solid #333' }}>
                      Days Left
                    </TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 'bold', borderBottom: '1px solid #333' }}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', py: 8, color: '#9CA3AF', borderBottom: 'none' }}>
                        {searchQuery ? 'No members found matching your search' : 'No members found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow 
                        key={member.id}
                        sx={{ 
                          '&:hover': { backgroundColor: '#252525' },
                          borderBottom: '1px solid #333'
                        }}
                      >
                        <TableCell sx={{ borderBottom: '1px solid #333' }}>
                          <Box>
                            <Typography sx={{ color: 'white', fontWeight: '600' }}>
                              {member.userName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                              {member.userEmail}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #333' }}>
                          <Box>
                            <Typography sx={{ color: 'white' }}>
                              {member.gymName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                              {member.gymSubdomain}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#E5E7EB', borderBottom: '1px solid #333' }}>
                          {member.duration}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #333' }}>
                          <Typography 
                            sx={{ 
                              color: member.daysRemaining < 7 ? '#f59e0b' : 'white',
                              fontWeight: member.daysRemaining < 7 ? 'bold' : 'normal'
                            }}
                          >
                            {member.daysRemaining} days
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #333' }}>
                          <Chip
                            label={getStatusText(member)}
                            sx={{
                              backgroundColor: `${getStatusColor(member)}20`,
                              color: getStatusColor(member),
                              fontWeight: 'bold',
                              fontSize: '0.75rem',
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Results Count */}
          {!loading && !error && filteredMembers.length > 0 && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                Showing {filteredMembers.length} of {members.length} members
              </Typography>
            </Box>
          )}
        </Box>
      </SuperAdminLayout>
    </AuthGuard>
  );
}
