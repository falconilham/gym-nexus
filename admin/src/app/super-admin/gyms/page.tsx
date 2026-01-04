"use client";

import { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, Users, Activity, TrendingUp, Pencil, Search, Filter } from 'lucide-react';
import { 
    Box, Typography, Button, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField, Grid,
    FormControlLabel, Checkbox, FormGroup, InputAdornment, Menu, MenuItem
} from '@mui/material';
import axios from 'axios';
import { AuthGuard } from '@/hooks/useAuth';
import SuperAdminLayout from '@/components/SuperAdminLayout';

interface Gym {
  id: number;
  name: string;
  subdomain: string;
  status: string;
  plan: string;
  memberCount: number;
  adminCount: number;
  todayCheckIns: number;
  createdAt: string;
  features?: string[];
}

interface Stats {
  totalGyms: number;
  activeGyms: number;
  totalMembers: number;
  totalAdmins: number;
  todayCheckIns: number;
}

export default function SuperAdminPage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalGyms: 0,
    activeGyms: 0,
    totalMembers: 0,
    totalAdmins: 0,
    todayCheckIns: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [addGymOpen, setAddGymOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGymId, setSelectedGymId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    email: '',
    phone: '',
    address: '',
    plan: 'starter',
    maxMembers: 100,
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    features: ['dashboard', 'members', 'trainers', 'schedule', 'settings', 'activity', 'check_in'],
  });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openFilter = Boolean(anchorEl);

  // No client-side filtering
  // const filteredGyms = ...

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleFilterClose = (status?: string) => {
    if (status) setFilterStatus(status);
    setAnchorEl(null);
  };

  const AVAILABLE_FEATURES = ['dashboard', 'members', 'trainers', 'schedule', 'settings', 'activity', 'check_in'];

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fitflow-backend.vercel.app';

  const fetchData = useCallback(async () => {
    try {
      const [gymsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/super-admin/gyms`, {
            params: { search: searchQuery, status: filterStatus }
        }),
        axios.get(`${API_URL}/api/super-admin/stats`),
      ]);
      setGyms(gymsRes.data);
      setStats(statsRes.data);
      setError(null);
    } catch (error: unknown) {
      console.error('Error fetching data:', error);
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load data';
      setError(`Unable to connect to backend: ${errorMessage}. Make sure the backend server is running on port 5000.`);
    }
  }, [API_URL, searchQuery, filterStatus]);

  useEffect(() => {
    const t = setTimeout(() => {
        fetchData();
    }, 500);
    return () => clearTimeout(t);
  }, [fetchData]);

  const handleEditGym = (gym: Gym) => {
    setIsEditing(true);
    setSelectedGymId(gym.id);
    setFormData({
      name: gym.name,
      subdomain: gym.subdomain,
      email: '', // Not in Gym interface, leaving empty
      phone: '', // Not in Gym interface, leaving empty
      address: '', // Not in Gym interface, leaving empty
      plan: gym.plan,
      maxMembers: 100, // Default
      adminName: '', // Not editable here
      adminEmail: '', // Not editable here
      adminPassword: '', // Not editable here
      features: gym.features || ['dashboard', 'members', 'trainers', 'schedule', 'settings', 'activity', 'check_in'],
    });
    setAddGymOpen(true);
  };

  const handleSubmitGym = async () => {
    try {
      if (isEditing && selectedGymId) {
        await axios.put(`${API_URL}/api/super-admin/gyms/${selectedGymId}`, {
          name: formData.name,
          subdomain: formData.subdomain,
          plan: formData.plan,
          adminPassword: formData.adminPassword, // Send password if present
          features: formData.features,
        });
      } else {
        await axios.post(`${API_URL}/api/super-admin/gyms`, formData);
      }
      
      setAddGymOpen(false);
      setIsEditing(false);
      setSelectedGymId(null);
      setFormData({
        name: '',
        subdomain: '',
        email: '',
        phone: '',
        address: '',
        plan: 'starter',
        maxMembers: 100,
        adminName: '',
        adminEmail: '',
        adminPassword: '',
        features: ['dashboard', 'members', 'trainers', 'schedule', 'settings', 'activity', 'check_in'],
      });
      fetchData();
    } catch (error: unknown) {
      console.error('Error saving gym:', error);
      const err = error as { response?: { data?: { error?: string } } };
      alert(err.response?.data?.error || 'Failed to save gym');
    }
  };

  const handleStatusToggle = async (gymId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await axios.put(`${API_URL}/api/super-admin/gyms/${gymId}`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Error updating gym status:', error);
    }
  };


  return (
    <AuthGuard requireSuperAdmin={true}>
      <SuperAdminLayout>
        <Box sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
              Gyms Management
            </Typography>
            <Typography variant="body1" sx={{ color: '#9CA3AF' }}>
              Manage all gyms, view analytics, and control platform access
            </Typography>
          </Box>

      {/* Error Alert */}
      {error && (
        <Paper sx={{ p: 3, mb: 4, backgroundColor: '#7f1d1d', border: '1px solid #991b1b' }}>
          <Typography variant="h6" sx={{ color: '#fca5a5', mb: 1, fontWeight: 'bold' }}>
            ⚠️ Connection Error
          </Typography>
          <Typography variant="body2" sx={{ color: '#fecaca' }}>
            {error}
          </Typography>
          <Button
            onClick={fetchData}
            sx={{ mt: 2, color: '#fca5a5', borderColor: '#fca5a5' }}
            variant="outlined"
            size="small"
          >
            Retry
          </Button>
        </Paper>
      )}

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
          <Paper sx={{ p: 3, backgroundColor: '#1E1E1E', border: '1px solid #333' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#2C2C2C', color: 'var(--primary)' }}>
                <Building2 size={24} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                  {stats.totalGyms}
                </Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Total Gyms</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
          <Paper sx={{ p: 3, backgroundColor: '#1E1E1E', border: '1px solid #333' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'rgba(20, 83, 45, 0.3)', color: '#4ade80' }}>
                <TrendingUp size={24} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                  {stats.activeGyms}
                </Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Active</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
          <Paper sx={{ p: 3, backgroundColor: '#1E1E1E', border: '1px solid #333' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#2C2C2C', color: 'var(--primary)' }}>
                <Users size={24} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                  {stats.totalMembers}
                </Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Total Members</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
          <Paper sx={{ p: 3, backgroundColor: '#1E1E1E', border: '1px solid #333' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#2C2C2C', color: 'var(--primary)' }}>
                <Activity size={24} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                  {stats.todayCheckIns}
                </Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Today&apos;s Check-ins</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
          <Paper sx={{ p: 3, backgroundColor: '#1E1E1E', border: '1px solid #333' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#2C2C2C', color: 'var(--primary)' }}>
                <Users size={24} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                  {stats.totalAdmins}
                </Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Gym Admins</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
          All Gyms
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => setAddGymOpen(true)}
          sx={{
            backgroundColor: 'var(--primary)',
            color: 'black',
            fontWeight: 'bold',
            textTransform: 'none',
            '&:hover': { backgroundColor: '#bbe300' },
          }}
        >
          Add New Gym
        </Button>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
         <TextField 
            fullWidth
            placeholder="Search gyms by name or subdomain..." 
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <Search size={20} color="#6B7280" />
                    </InputAdornment>
                ),
                sx: { 
                    color: 'white', 
                    backgroundColor: '#1E1E1E', 
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary)' }
                }
            }}
            sx={{ flex: 1 }}
         />
         <Button 
            variant="outlined"
            onClick={handleFilterClick}
            sx={{ 
                color: 'white', 
                borderColor: '#333', 
                backgroundColor: '#1E1E1E',
                borderRadius: 2,
                textTransform: 'none',
                minWidth: 150,
                gap: 1,
                '&:hover': { backgroundColor: '#333', borderColor: '#333' }
            }}
         >
            <Filter size={18} />
            Filter: {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
         </Button>
         <Menu
            anchorEl={anchorEl}
            open={openFilter}
            onClose={() => handleFilterClose()}
            PaperProps={{
                sx: {
                    backgroundColor: '#1E1E1E',
                    color: 'white',
                    border: '1px solid #333',
                    mt: 1
                }
            }}
         >
            <MenuItem onClick={() => handleFilterClose('all')}>All Gyms</MenuItem>
            <MenuItem onClick={() => handleFilterClose('active')}>Active</MenuItem>
            <MenuItem onClick={() => handleFilterClose('suspended')}>Suspended</MenuItem>
         </Menu>
      </Box>

      {/* Gyms Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#252525' }}>
            <TableRow>
              <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>GYM NAME</TableCell>
              <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>SUBDOMAIN</TableCell>
              <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>PLAN</TableCell>
              <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>MEMBERS</TableCell>
              <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>TODAY</TableCell>
              <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>STATUS</TableCell>
              <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>CREATED</TableCell>
              <TableCell align="right" sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gyms.map((gym) => (
              <TableRow key={gym.id} sx={{ '&:hover': { backgroundColor: '#252525' } }}>
                <TableCell sx={{ color: 'white', borderBottom: '1px solid #333' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{gym.name}</Typography>
                </TableCell>
                <TableCell sx={{ color: '#D1D5DB', borderBottom: '1px solid #333' }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {gym.subdomain}.gymnexus.app
                  </Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid #333' }}>
                  <Chip
                    label={gym.plan.toUpperCase()}
                    size="small"
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: gym.plan === 'enterprise' ? 'rgba(147, 51, 234, 0.2)' : gym.plan === 'pro' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                      color: gym.plan === 'enterprise' ? '#a78bfa' : gym.plan === 'pro' ? '#60a5fa' : '#9ca3af',
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: '#D1D5DB', borderBottom: '1px solid #333' }}>
                  {gym.memberCount}
                </TableCell>
                <TableCell sx={{ color: '#D1D5DB', borderBottom: '1px solid #333' }}>
                  {gym.todayCheckIns}
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid #333' }}>
                  <Chip
                    label={gym.status.toUpperCase()}
                    size="small"
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: gym.status === 'active' ? 'rgba(20, 83, 45, 0.3)' : 'rgba(127, 29, 29, 0.3)',
                      color: gym.status === 'active' ? '#4ade80' : '#f87171',
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #333' }}>
                  {new Date(gym.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid #333' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                      size="small"
                      onClick={() => handleEditGym(gym)}
                      startIcon={<Pencil size={14} />}
                      sx={{
                        color: 'white',
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        borderColor: '#333',
                        '&:hover': { backgroundColor: '#333' }
                      }}
                      variant="outlined"
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleStatusToggle(gym.id, gym.status)}
                      sx={{
                        color: gym.status === 'active' ? '#f59e0b' : '#4ade80',
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        borderColor: gym.status === 'active' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(74, 222, 128, 0.5)',
                        '&:hover': {
                          backgroundColor: gym.status === 'active' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(74, 222, 128, 0.1)'
                        }
                      }}
                      variant="outlined"
                    >
                      {gym.status === 'active' ? 'Suspend' : 'Activate'}
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Gym Dialog */}
      <Dialog 
        open={addGymOpen} 
        onClose={() => {
          setAddGymOpen(false);
          setIsEditing(false);
          setSelectedGymId(null);
          setFormData({
            name: '',
            subdomain: '',
            email: '',
            phone: '',
            address: '',
            plan: 'starter',
            maxMembers: 100,
            adminName: '',
            adminEmail: '',
            adminPassword: '',
            features: ['dashboard', 'members', 'trainers', 'schedule', 'settings'],
          });
        }} 
        maxWidth="md" 
        fullWidth
        scroll="paper"
      >
      <DialogTitle sx={{ backgroundColor: '#1E1E1E', color: 'white', borderBottom: '1px solid #333' }}>
          {isEditing ? 'Edit Gym' : 'Add New Gym'}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#1E1E1E', pt: 3, overflowY: 'auto' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Gym Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ 
                  '& .MuiInputLabel-root': { color: '#9CA3AF' },
                  '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#333' } }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Subdomain"
                value={formData.subdomain}
                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                helperText="e.g., 'powerhouse' → powerhouse.gymnexus.app"
                sx={{ 
                  '& .MuiInputLabel-root': { color: '#9CA3AF' },
                  '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#333' } },
                  '& .MuiFormHelperText-root': { color: '#6B7280' }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                sx={{ 
                  '& .MuiInputLabel-root': { color: '#9CA3AF' },
                  '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#333' } }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                sx={{ 
                  '& .MuiInputLabel-root': { color: '#9CA3AF' },
                  '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#333' } }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                sx={{ 
                  '& .MuiInputLabel-root': { color: '#9CA3AF' },
                  '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#333' } }
                }}
              />
            </Grid>
            {!isEditing ? (
              <>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" sx={{ color: 'white', mt: 2, mb: 1 }}>Admin Account</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Admin Name"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    sx={{ 
                      '& .MuiInputLabel-root': { color: '#9CA3AF' },
                      '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#333' } }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Admin Email"
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    sx={{ 
                      '& .MuiInputLabel-root': { color: '#9CA3AF' },
                      '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#333' } }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Admin Password"
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    sx={{ 
                      '& .MuiInputLabel-root': { color: '#9CA3AF' },
                      '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#333' } }
                    }}
                  />
                </Grid>
              </>
            ) : (
              <>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" sx={{ color: 'white', mt: 2, mb: 1 }}>Security</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="New Admin Password"
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    helperText="Leave blank to keep the current password unchanged"
                    sx={{ 
                      '& .MuiInputLabel-root': { color: '#9CA3AF' },
                      '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#333' } },
                      '& .MuiFormHelperText-root': { color: '#6B7280' }
                    }}
                  />
                </Grid>
              </>
            )}
            
            <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ color: 'white', mt: 2, mb: 1 }}>Features</Typography>
                <FormGroup row>
                    {AVAILABLE_FEATURES.map((feature) => (
                        <FormControlLabel
                            key={feature}
                            control={
                                <Checkbox
                                    checked={formData.features.includes(feature)}
                                    onChange={(e) => {
                                        const newFeatures = e.target.checked
                                            ? [...formData.features, feature]
                                            : formData.features.filter((f: string) => f !== feature);
                                        setFormData({ ...formData, features: newFeatures });
                                    }}
                                    sx={{ 
                                        color: '#6B7280',
                                        '&.Mui-checked': { color: 'var(--primary)' },
                                    }}
                                />
                            }
                            label={
                                <Typography sx={{ color: 'white', textTransform: 'capitalize' }}>
                                    {feature.replace(/_/g, ' ')}
                                </Typography>
                            }
                            sx={{ mr: 3 }}
                        />
                    ))}
                </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#1E1E1E', borderTop: '1px solid #333', p: 2 }}>
          <Button onClick={() => {
            setAddGymOpen(false);
            setIsEditing(false);
            setSelectedGymId(null);
            setFormData({
              name: '',
              subdomain: '',
              email: '',
              phone: '',
              address: '',
              plan: 'starter',
              maxMembers: 100,
              adminName: '',
              adminEmail: '',
              adminPassword: '',
              features: ['dashboard', 'members', 'trainers', 'schedule', 'settings', 'activity', 'check_in'],
            });
          }} sx={{ color: '#9CA3AF' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitGym}
            variant="contained"
            sx={{
              backgroundColor: 'var(--primary)',
              color: 'black',
              fontWeight: 'bold',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#bbe300' },
            }}
          >
            {isEditing ? 'Save Changes' : 'Create Gym'}
          </Button>
        </DialogActions>
        </Dialog>
      </Box>
      </SuperAdminLayout>
    </AuthGuard>
  );
}
