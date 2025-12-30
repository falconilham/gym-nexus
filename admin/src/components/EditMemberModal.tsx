import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, 
    Select, MenuItem, InputLabel, Box, IconButton, Checkbox, Typography 
} from '@mui/material';
import axios from 'axios';

interface Member {
  id: number;
  name: string;
  email: string;
  duration?: string;
  endDate?: string;
}

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member: Member | null;
}

export default function EditMemberModal({ isOpen, onClose, onSuccess, member }: EditMemberModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    duration: '1 Month' // If they want to extend
  });
  const [extendMode, setExtendMode] = useState(false);
  console.log({isOpen})
  useEffect(() => {
    if (member) {
        setFormData({
            name: member.name,
            email: member.email,
            duration: '1 Month'
        });
        setExtendMode(false);
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    
    try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        // Decide if we are updating profile or extending membership
        const body = {
            name: formData.name,
            email: formData.email,
            extendDuration: extendMode ? formData.duration : null
        };

        const res = await axios.put(`${API_URL}/api/admin/members/${member.id}`, body);

        if (res.status === 200) {
            onSuccess();
            onClose();
        }
    } catch (error) {
        console.error('Error updating member:', error);
    }
  };

  return (
    <Dialog 
        open={isOpen} 
        onClose={onClose}
        PaperProps={{
            sx: {
                backgroundColor: '#1E1E1E',
                color: 'white',
                border: '1px solid #333',
                borderRadius: 3,
                width: '100%',
                maxWidth: '450px'
            }
        }}
    >
        <Box component="form" onSubmit={handleSubmit}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', p: 3 }}>
                <Box sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Edit Member</Box>
                <IconButton onClick={onClose} sx={{ color: '#9CA3AF', '&:hover': { color: 'white' } }}>
                    <X size={24} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                    <InputLabel sx={{ color: '#9CA3AF', mb: 1, fontSize: '0.875rem' }}>Full Name</InputLabel>
                    <TextField 
                        fullWidth
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        variant="outlined"
                        InputProps={{
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

                <Box>
                    <InputLabel sx={{ color: '#9CA3AF', mb: 1, fontSize: '0.875rem' }}>Email Address</InputLabel>
                    <TextField 
                        fullWidth
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        variant="outlined"
                        InputProps={{
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

                <Box sx={{ p: 2, backgroundColor: '#2C2C2C', borderRadius: 2, border: '1px solid #333' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#D1D5DB' }}>Current Expiry:</Typography>
                        <Typography variant="body2" sx={{ color: 'var(--primary)' }}>{member?.endDate || 'N/A'}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Checkbox 
                            checked={extendMode}
                            onChange={(e) => setExtendMode(e.target.checked)}
                            sx={{ 
                                color: 'var(--primary)',
                                '&.Mui-checked': { color: 'var(--primary)' },
                                p: 0.5,
                                mr: 0.5
                            }}
                        />
                        <Typography 
                            variant="body2" 
                            onClick={() => setExtendMode(!extendMode)}
                            sx={{ color: 'white', cursor: 'pointer', userSelect: 'none' }}
                        >
                            Extend Membership?
                        </Typography>
                    </Box>

                    {extendMode && (
                        <Box sx={{ mt: 1, animation: 'fadeIn 0.2s ease-in' }}>
                            <InputLabel sx={{ color: '#9CA3AF', mb: 1, fontSize: '0.75rem' }}>Add Duration</InputLabel>
                            <Select
                                fullWidth
                                value={formData.duration}
                                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                displayEmpty
                                size="small"
                                sx={{
                                    color: 'white', 
                                    backgroundColor: '#0F0F0F', 
                                    borderRadius: 2,
                                    fontSize: '0.875rem',
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary)' },
                                    '& .MuiSvgIcon-root': { color: '#9CA3AF' }
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            backgroundColor: '#2C2C2C',
                                            color: 'white',
                                            border: '1px solid #444'
                                        }
                                    }
                                }}
                            >
                                <MenuItem value="1 Month">1 Month</MenuItem>
                                <MenuItem value="3 Months">3 Months</MenuItem>
                                <MenuItem value="12 Months">12 Months</MenuItem>
                            </Select>
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
                <Button 
                    onClick={onClose}
                    variant="outlined"
                    fullWidth
                    sx={{ 
                        color: 'white', 
                        borderColor: 'transparent', 
                        backgroundColor: '#2C2C2C',
                        fontWeight: 500,
                        padding: '12px',
                        borderRadius: 2,
                        textTransform: 'none',
                        '&:hover': { backgroundColor: '#333', borderColor: 'transparent' }
                    }}
                >
                    Cancel
                </Button>
                <Button 
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ 
                        backgroundColor: 'var(--primary)', 
                        color: 'black', 
                        fontWeight: 'bold',
                        padding: '12px',
                        borderRadius: 2,
                        textTransform: 'none',
                        '&:hover': { backgroundColor: '#bbe300' }
                    }}
                >
                    Save Changes
                </Button>
            </DialogActions>
        </Box>
    </Dialog>
  );
}
