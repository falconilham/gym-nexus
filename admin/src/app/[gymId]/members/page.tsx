"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, UserPlus, Filter, Trash2, Edit, Ban, CheckCircle } from 'lucide-react';
import AddMemberModal from '@/components/AddMemberModal';
import EditMemberModal from '@/components/EditMemberModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
    IconButton, Button, TextField, InputAdornment, Box, Typography, Avatar,
    Menu, MenuItem, Card, CardContent, useMediaQuery, useTheme,
    Dialog, DialogTitle, DialogContent, DialogActions, TablePagination
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface Member {
  id: number;
  name: string;
  email: string;
  phone?: string;
  memberPhoto?: string;
  plan: string;
  status: string;
  suspended: boolean;
  suspensionReason?: string;
  suspensionEndDate?: string;
  joinDate: string;
  endDate?: string;
  User?: {
    phone?: string;
    memberPhoto?: string;
  };
}

export default function MembersPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { admin } = useAuth();
  const gymId = admin?.gymId;
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openFilter = Boolean(anchorEl);

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  // Read URL parameters and set initial filter
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'expiring') {
      setTimeout(() => setFilterStatus('expiring'), 0);
    }
  }, [searchParams]);

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleFilterClose = (status?: string) => {
    if (status) {
        setFilterStatus(status);
        setPage(0); // Reset to first page on filter change
    }
    setAnchorEl(null);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText: string;
    confirmColor: 'error' | 'warning' | 'primary';
  }>({ open: false, title: '', message: '', onConfirm: () => {}, confirmText: 'Confirm', confirmColor: 'error' });

  const fetchMembers = async () => {
    if (!gymId) return;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gym-nexus-backend.vercel.app';
    try {
      const response = await axios.get(`${API_URL}/api/admin/members`, {
        params: { 
            gymId,
            search: searchQuery,
            status: filterStatus,
            page: page + 1, // API uses 1-based indexing
            limit: rowsPerPage
        }
      });
      
      // Handle both new and legacy response formats if needed, but we updated backend so assume new format
      if (response.data.data) {
          setMembers(response.data.data);
          setTotalRows(response.data.pagination.total);
      } else {
          // Fallback if backend rollout isn't instant or dev environment mixup
          setMembers(response.data);
          setTotalRows(response.data.length);
      }
    } catch (err) {
      console.error('Failed to fetch members', err);
    }
  };

  useEffect(() => {
    setTimeout(() => setIsMounted(true), 0);
  }, []);

  useEffect(() => {
    if (gymId) {
        const timeoutId = setTimeout(() => {
            fetchMembers();
        }, 500);
        return () => clearTimeout(timeoutId);
    }
     
  }, [gymId, searchQuery, filterStatus, page, rowsPerPage]);

  const handleEditClick = (member: Member) => {
    console.log({member})
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (member: Member) => {
    setConfirmDialog({
      open: true,
      title: t('common.delete') + ' Member', // Ideally 'common.delete' or full string
      message: `Are you sure you want to delete ${member.name}? This action cannot be undone.`,
      confirmText: t('common.delete'),
      confirmColor: 'error',
      onConfirm: async () => {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gym-nexus-backend.vercel.app';
          await axios.delete(`${API_URL}/api/admin/members/${member.id}`);
          fetchMembers();
        } catch(err) {
          console.error(err);
        }
      }
    });
  };

  // Suspend Dialog State
  const [suspendDialog, setSuspendDialog] = useState({ open: false, member: null as Member | null });
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendEndDate, setSuspendEndDate] = useState('');

  const handleSuspendClick = (member: Member) => {
    setSuspendDialog({ open: true, member });
    setSuspendReason('');
    setSuspendEndDate('');
  };

  const confirmSuspendMember = async () => {
    if (!suspendDialog.member) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gym-nexus-backend.vercel.app';
      await axios.patch(`${API_URL}/api/admin/members/${suspendDialog.member.id}/suspend`, {
        suspended: !suspendDialog.member.suspended,
        reason: suspendReason,
        endDate: suspendEndDate || null
      });
      fetchMembers();
      setSuspendDialog({ open: false, member: null });
    } catch (err) {
      console.error(err);
    }
  };

  if (!isMounted) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
        <Box>
           <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>{t('members.title')}</Typography>
           <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 0.5 }}>{t('members.subtitle')}</Typography>
        </Box>
        <Button 
            variant="contained"
            onClick={() => setIsModalOpen(true)}
            sx={{ 
                backgroundColor: 'var(--primary)', 
                color: 'black', 
                fontWeight: 'bold',
                padding: '12px 24px',
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': { backgroundColor: '#bbe300' },
                display: 'flex',
                gap: 1
            }}
        >
            <UserPlus size={20} />
            {t('members.add_btn')}
        </Button>
      </Box>

      <AddMemberModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchMembers}
        gymId={gymId}
      />

      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchMembers}
        member={selectedMember}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        confirmColor={confirmDialog.confirmColor}
      />

      {/* Filters & Search - Using MUI TextField and Button */}
      <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 2, 
          // Only show card-like container on Desktop
          backgroundColor: { xs: 'transparent', md: '#1E1E1E' }, 
          p: { xs: 0, md: 2 }, 
          borderRadius: 3, 
          border: { xs: 'none', md: '1px solid #333' } 
      }}>
         <Box sx={{ flex: 1, position: 'relative' }}>
            <TextField 
                fullWidth
                placeholder={t('members.search_placeholder')}
                variant="outlined"
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
                        backgroundColor: '#0F0F0F', 
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary)' }
                    }
                }}
            />
         </Box>
         <Button 
            variant="outlined"
            onClick={handleFilterClick}
            sx={{ 
                color: 'white', 
                borderColor: '#333', 
                backgroundColor: '#2C2C2C',
                borderRadius: 2,
                textTransform: 'none',
                padding: '10px 16px',
                gap: 1,
                minWidth: 150,
                '&:hover': { backgroundColor: '#333', borderColor: '#333' }
            }}
         >
            <Filter size={18} />
            {t('common.filter')}: {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
         </Button>
         <Menu
            anchorEl={anchorEl}
            open={openFilter}
            onClose={() => handleFilterClose()}
            PaperProps={{
                sx: {
                    backgroundColor: '#2C2C2C',
                    color: 'white',
                    border: '1px solid #333',
                    mt: 1
                }
            }}
         >
            <MenuItem onClick={() => handleFilterClose('all')}>All Members</MenuItem>
            <MenuItem onClick={() => handleFilterClose('active')}>Active Only</MenuItem>
            <MenuItem onClick={() => handleFilterClose('expiring')}>Expiring Soon</MenuItem>
            <MenuItem onClick={() => handleFilterClose('suspended')}>Suspended</MenuItem>
            <MenuItem onClick={() => handleFilterClose('expired')}>Expired</MenuItem>
         </Menu>
      </Box>
      
      {/* Mobile Card View vs Desktop Table View */}

      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {members.map((member) => (
                <Box key={member.id} sx={{ width: '100%' }}>
                    <Card sx={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: 2 }}>
                        <CardContent sx={{ pb: 2 }}>
                            {/* Top Section: Avatar, Name & Status */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <Avatar 
                                    src={member.memberPhoto} 
                                    alt={member.name}
                                    sx={{ width: 48, height: 48, border: '1px solid #444', mt: 0.5 }}
                                >
                                    {member.name?.charAt(0) || '?'}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: '1rem', lineHeight: 1.3 }}>
                                            {member.name}
                                        </Typography>
                                        <Box 
                                            component="span"
                                            sx={{ 
                                                fontSize: '0.65rem', 
                                                fontWeight: 'bold', 
                                                px: 1, 
                                                py: 0.5, 
                                                borderRadius: 1, 
                                                ml: 1,
                                                whiteSpace: 'nowrap',
                                                backgroundColor: member.suspended ? 'rgba(113, 63, 18, 0.3)' : member.status === 'Active' ? 'rgba(20, 83, 45, 0.3)' : member.status === 'Expired' ? 'rgba(127, 29, 29, 0.3)' : 'rgba(113, 63, 18, 0.3)',
                                                color: member.suspended ? '#f59e0b' : member.status === 'Active' ? '#4ade80' : member.status === 'Expired' ? '#f87171' : '#eab308'
                                            }}
                                        >
                                            {member.suspended ? 'Suspended' : member.status}
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                                        {member.email}
                                    </Typography>
                                    {member.suspended && (
                                      <Box sx={{ mt: 1, p: 1, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 1 }}>
                                        <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 'bold' }}>Reason:</Typography>
                                        <Typography variant="body2" sx={{ color: '#fbbf24', fontStyle: 'italic' }}>
                                            {member.suspensionReason || 'No reason provided'}
                                        </Typography>
                                        {member.suspensionEndDate && (
                                          <Typography variant="caption" sx={{ color: '#fbbf24', display: 'block', mt: 0.5 }}>
                                              Auto-reactivates: {new Date(member.suspensionEndDate).toLocaleDateString()}
                                          </Typography>
                                        )}
                                      </Box>
                                    )}
                                 </Box>
                            </Box>
                            
                            {/* Dates Grid */}
                            <Box sx={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1fr 1fr', 
                                gap: 2, 
                                mb: 2,
                                backgroundColor: 'rgba(255,255,255,0.02)',
                                p: 1.5,
                                borderRadius: 1.5
                            }}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 0.5 }}>Joined</Typography>
                                    <Typography variant="body2" sx={{ color: '#D1D5DB', fontWeight: 500 }}>{member.joinDate}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 0.5 }}>Expires</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                        <Typography variant="body2" sx={{ color: '#D1D5DB', fontWeight: 500 }}>{member.endDate || '-'}</Typography>
                                        {member.endDate && (() => {
                                            const diff = new Date(member.endDate!).getTime() - new Date().getTime();
                                            if (diff > 0) {
                                                const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                                // Only show alert colors if expiring soon
                                                const color = days <= 7 ? '#fbbf24' : 'var(--primary)';
                                                return <Typography variant="caption" sx={{ color, fontWeight: 'bold' }}>{days}d left</Typography>;
                                            }
                                            return <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 'bold' }}>!</Typography>;
                                        })()}
                                    </Box>
                                </Box>
                            </Box>

                            {/* Actions */}
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                <IconButton 
                                    onClick={() => handleEditClick(member)}
                                    sx={{ 
                                        backgroundColor: '#2C2C2C', 
                                        color: '#9CA3AF', 
                                        borderRadius: 1.5,
                                        width: 42, height: 42, // Match button height
                                        '&:hover': { backgroundColor: '#333', color: 'white' }
                                    }}
                                >
                                    <Edit size={18} />
                                </IconButton>

                                <Button 
                                    size="small" 
                                    variant={member.suspended ? "contained" : "outlined"}
                                    fullWidth
                                    startIcon={member.suspended ? <CheckCircle size={16} /> : <Ban size={16} />}
                                    onClick={() => handleSuspendClick(member)}
                                    sx={{ 
                                        flex: 2,
                                        height: 42,
                                        borderColor: member.suspended ? 'transparent' : 'rgba(245, 158, 11, 0.5)', 
                                        color: member.suspended ? '#000' : '#f59e0b',
                                        backgroundColor: member.suspended ? '#10b981' : 'transparent',
                                        '&:hover': {
                                            borderColor: member.suspended ? 'transparent' : '#f59e0b',
                                            backgroundColor: member.suspended ? '#059669' : 'rgba(245, 158, 11, 0.1)'
                                        }
                                    }}
                                >
                                    {member.suspended ? 'Activate' : 'Suspend'}
                                </Button>
                                
                                <IconButton 
                                    onClick={() => handleDeleteClick(member)}
                                    sx={{ 
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        color: '#EF4444',
                                        borderRadius: 1.5,
                                        width: 42,
                                        height: 42,
                                        '&:hover': { 
                                            backgroundColor: 'rgba(239, 68, 68, 0.2)'
                                        } 
                                    }}
                                >
                                    <Trash2 size={18} />
                                </IconButton>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            ))}
        </Box>
      ) : (  
      <TableContainer component={Paper} sx={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: 3 }}>
        <Table>
            <TableHead sx={{ backgroundColor: '#252525' }}>
                <TableRow>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>{t('members.table.name')}</TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>{t('members.table.status')}</TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>{t('members.table.joined')}</TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>End Date</TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>Reason</TableCell>
                    <TableCell align="right" sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>{t('members.table.actions')}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {members.map((member) => (
                    <TableRow key={member.id} sx={{ '&:hover': { backgroundColor: '#252525' }, borderBottom: '1px solid #333' }}>
                        <TableCell sx={{ color: 'white', borderBottom: '1px solid #333' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar 
                                    src={member.memberPhoto} 
                                    alt={member.name}
                                    sx={{ width: 40, height: 40, border: '1px solid #444' }}
                                >
                                    {member.name?.charAt(0) || '?'}
                                </Avatar>
                                <Box>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{member.name}</Typography>
                                    <Typography variant="caption" sx={{ color: '#6B7280' }}>{member.email}</Typography>
                                </Box>
                            </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #333' }}>
                             <Box 
                                component="span"
                                sx={{ 
                                    fontSize: '0.75rem', 
                                    fontWeight: 'bold', 
                                    px: 1, 
                                    py: 0.5, 
                                    borderRadius: 1, 
                                    backgroundColor: member.suspended ? 'rgba(113, 63, 18, 0.3)' : member.status === 'Active' ? 'rgba(20, 83, 45, 0.3)' : member.status === 'Expired' ? 'rgba(127, 29, 29, 0.3)' : 'rgba(113, 63, 18, 0.3)',
                                    color: member.suspended ? '#f59e0b' : member.status === 'Active' ? '#4ade80' : member.status === 'Expired' ? '#f87171' : '#eab308'
                                }}
                            >
                                {member.suspended ? 'Suspended' : member.status}
                            </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#6B7280', borderBottom: '1px solid #333' }}>{member.joinDate}</TableCell>
                        <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #333' }}>
                            {member.endDate ? (
                                <Box>
                                    <Typography variant="body2" sx={{ color: '#D1D5DB' }}>{new Date(member.endDate).toLocaleDateString()}</Typography>
                                    <Typography variant="caption" sx={{ color: 'var(--primary)' }}>
                                        {(() => {
                                            const diff = new Date(member.endDate!).getTime() - new Date().getTime();
                                            if (diff < 0) return 'Expired';
                                            const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                            return `${days} days left`;
                                        })()}
                                    </Typography>
                                </Box>
                            ) : '-'}
                        </TableCell>
                    <TableCell sx={{ color: '#D1D5DB', borderBottom: '1px solid #333', maxWidth: 220 }}>
                        {member.suspended ? (
                            <Box>
                                <Typography variant="body2" sx={{ color: '#f59e0b', fontStyle: 'italic' }}>
                                    {member.suspensionReason || 'No reason provided'}
                                </Typography>
                                {member.suspensionEndDate && (
                                    <Typography variant="caption" sx={{ color: '#fbbf24', display: 'block', mt: 0.5 }}>
                                        Reactivates: {new Date(member.suspensionEndDate).toLocaleDateString()}
                                    </Typography>
                                )}
                            </Box>
                        ) : (
                            <Typography variant="body2" sx={{ color: '#4B5563' }}>-</Typography>
                        )}
                    </TableCell>
                        <TableCell align="right" sx={{ borderBottom: '1px solid #333' }}>
                            <IconButton 
                                onClick={() => handleEditClick(member)}
                                sx={{ color: '#9CA3AF', '&:hover': { color: 'white' } }}
                            >
                                <Edit size={20} />
                            </IconButton>
                            <IconButton 
                                onClick={() => handleSuspendClick(member)}
                                sx={{ 
                                    color: member.suspended ? '#10b981' : '#f59e0b', 
                                    '&:hover': { color: member.suspended ? '#34d399' : '#fbbf24' } 
                                }}
                                title={member.suspended ? 'Unsuspend Member' : 'Suspend Member'}
                            >
                                {member.suspended ? <CheckCircle size={20} /> : <Ban size={20} />}
                            </IconButton>
                            <IconButton 
                                onClick={() => handleDeleteClick(member)}
                                sx={{ color: '#EF4444', '&:hover': { color: '#F87171' } }}
                            >
                                <Trash2 size={20} />
                            </IconButton>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </TableContainer>
      )}

      {/* Pagination */}
      <TablePagination
        component="div"
        count={totalRows}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{ color: '#9CA3AF' }}
      />

      {/* Suspend Reason Dialog */}
      <Dialog 
        open={suspendDialog.open} 
        onClose={() => setSuspendDialog({ open: false, member: null })}
        PaperProps={{ sx: { backgroundColor: '#1E1E1E', border: '1px solid #333', color: 'white' } }}
      >
        <DialogTitle>{suspendDialog.member?.suspended ? 'Activate' : 'Suspend'} Member</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#D1D5DB', mb: 2 }}>
            {suspendDialog.member?.suspended 
                ? 'Are you sure you want to activate this member again?' 
                : 'Are you sure you want to suspend this member? They will lose access to the gym.'}
          </Typography>
             <TextField
               autoFocus
               margin="dense"
               label={suspendDialog.member?.suspended ? "Reason for Activation" : "Reason for Suspension"}
               type="text"
               fullWidth
               variant="outlined"
               value={suspendReason}
               onChange={(e) => setSuspendReason(e.target.value)}
               sx={{
                    marginTop: 2,
                    '& .MuiInputLabel-root': { color: '#9CA3AF' },
                    '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#555' },
                    '&.Mui-focused fieldset': { borderColor: 'var(--primary)' }
                    }
                }}
             />
             {!suspendDialog.member?.suspended && (
               <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label="Auto-Reactivate Date (Optional)"
                        value={suspendEndDate ? new Date(suspendEndDate) : null}
                        onChange={(newValue) => {
                            if (newValue) {
                                setSuspendEndDate(format(newValue, 'yyyy-MM-dd'));
                            } else {
                                setSuspendEndDate('');
                            }
                        }}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                margin: "dense",
                                sx: {
                                    marginTop: 2,
                                    '& .MuiInputLabel-root': { color: '#9CA3AF' },
                                    '& .MuiOutlinedInput-root': {
                                        color: 'white',
                                        '& fieldset': { borderColor: '#333' },
                                        '&:hover fieldset': { borderColor: '#555' },
                                        '&.Mui-focused fieldset': { borderColor: 'var(--primary)' },
                                        '& .MuiSvgIcon-root': { color: '#9CA3AF' }
                                    }
                                }
                            }
                        }}
                    />
               </LocalizationProvider>
             )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuspendDialog({ open: false, member: null })} sx={{ color: '#9CA3AF' }}>{t('common.cancel')}</Button>
          <Button 
            onClick={confirmSuspendMember} 
            variant="contained" 
            color={suspendDialog.member?.suspended ? "success" : "warning"}
          >
            {suspendDialog.member?.suspended ? 'Activate' : 'Suspend'} 
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

