"use client";

import { useState, useEffect } from 'react';
import { Search, UserPlus, Filter, Trash2, Edit, Ban, CheckCircle } from 'lucide-react';
import AddMemberModal from '@/components/AddMemberModal';
import EditMemberModal from '@/components/EditMemberModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
    IconButton, Button, TextField, InputAdornment, Box, Typography 
} from '@mui/material';
import axios from 'axios';

interface Member {
  id: number;
  name: string;
  email: string;
  plan: string;
  status: string;
  suspended: boolean;
  joinDate: string;
  endDate?: string;
}

export default function MembersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
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
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    try {
      const response = await axios.get(`${API_URL}/api/admin/members`);
      setMembers(response.data);
    } catch (err) {
      console.error('Failed to fetch members', err);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchMembers();
  }, []);

  const handleEditClick = (member: Member) => {
    console.log({member})
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (member: Member) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Member',
      message: `Are you sure you want to delete ${member.name}? This action cannot be undone.`,
      confirmText: 'Delete',
      confirmColor: 'error',
      onConfirm: async () => {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          await axios.delete(`${API_URL}/api/admin/members/${member.id}`);
          fetchMembers();
        } catch(err) {
          console.error(err);
        }
      }
    });
  };

  const handleSuspendClick = (member: Member) => {
    const action = member.suspended ? 'unsuspend' : 'suspend';
    setConfirmDialog({
      open: true,
      title: member.suspended ? 'Unsuspend Member' : 'Suspend Member',
      message: `Are you sure you want to ${action} ${member.name}? ${member.suspended ? 'They will regain access to the gym.' : 'They will lose access to the gym temporarily.'}`,
      confirmText: member.suspended ? 'Unsuspend' : 'Suspend',
      confirmColor: member.suspended ? 'primary' : 'warning',
      onConfirm: async () => {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          await axios.patch(`${API_URL}/api/admin/members/${member.id}/suspend`, {
            suspended: !member.suspended
          });
          fetchMembers();
        } catch(err) {
          console.error(err);
        }
      }
    });
  };

  if (!isMounted) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
        <Box>
           <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>Member Management</Typography>
           <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 0.5 }}>Manage active memberships and user profiles.</Typography>
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
            Add Member
        </Button>
      </Box>

      <AddMemberModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchMembers}
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
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, backgroundColor: '#1E1E1E', p: 2, borderRadius: 3, border: '1px solid #333' }}>
         <Box sx={{ flex: 1, position: 'relative' }}>
            <TextField 
                fullWidth
                placeholder="Search by name or email..." 
                variant="outlined"
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
            sx={{ 
                color: 'white', 
                borderColor: '#333', 
                backgroundColor: '#2C2C2C',
                borderRadius: 2,
                textTransform: 'none',
                padding: '10px 16px',
                gap: 1,
                '&:hover': { backgroundColor: '#333', borderColor: '#333' }
            }}
         >
            <Filter size={18} />
            Filter: All Plans
         </Button>
      </Box>
      
      {/* Material UI Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: 3 }}>
        <Table>
            <TableHead sx={{ backgroundColor: '#252525' }}>
                <TableRow>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>MEMBER</TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>STATUS</TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>JOINED</TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>EXPIRES</TableCell>
                    <TableCell align="right" sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>ACTIONS</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {members.map((member) => (
                    <TableRow key={member.id} sx={{ '&:hover': { backgroundColor: '#252525' }, borderBottom: '1px solid #333' }}>
                        <TableCell sx={{ color: 'white', borderBottom: '1px solid #333' }}>
                            <Box>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>{member.name}</Typography>
                                <Typography variant="caption" sx={{ color: '#6B7280' }}>{member.email}</Typography>
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
                                    <Typography variant="body2" sx={{ color: '#D1D5DB' }}>{member.endDate}</Typography>
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
    </Box>
  );
}

