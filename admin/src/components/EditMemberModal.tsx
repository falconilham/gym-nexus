import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, 
    Select, MenuItem, InputLabel, Box, IconButton, Checkbox, Typography, Avatar 
} from '@mui/material';
import axios from 'axios';

interface Member {
  id: number;
  name: string;
  email: string;
  phone?: string;
  memberPhoto?: string;
  duration?: string;
  endDate?: string;
  User?: {
    phone?: string;
    memberPhoto?: string;
  };
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
    phone: '',
    memberPhoto: '',
    duration: '1 Month'
  });
  const [extendMode, setExtendMode] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  useEffect(() => {
    if (!member) return;
    
    const phone = member.User?.phone || member.phone || '';
    const memberPhoto = member.User?.memberPhoto || member.memberPhoto || '';
    
    // Initialize form data from member prop
    const initializeFormData = () => {
        setFormData({
            name: member.name,
            email: member.email,
            phone: phone,
            memberPhoto: memberPhoto,
            duration: '1 Month'
        });
        setPhotoPreview(memberPhoto);
        setExtendMode(false);
    };
    
    initializeFormData();
  }, [member]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setPhotoFile(file);
      
      // Compress and convert to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          let width = img.width;
          let height = img.height;
          const maxSize = 800;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setPhotoPreview(compressedBase64);
          setFormData({ ...formData, memberPhoto: compressedBase64 });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    
    try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const body = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            memberPhoto: formData.memberPhoto,
            extendDuration: extendMode ? formData.duration : null
        };

        const res = await axios.put(`${API_URL}/api/admin/members/${member.id}`, body);

        if (res.status === 200) {
            onSuccess();
            onClose();
            setFormData({
                name: '',
                email: '',
                phone: '',
                memberPhoto: '',
                duration: '1 Month'
            });
            setPhotoPreview('');
            setExtendMode(false);
        }
    } catch (error) {
        console.error('Error updating member:', error);
        if (axios.isAxiosError(error) && error.response) {
            alert(`Failed to update member: ${error.response.data.error || error.message}`);
        }
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
                maxWidth: '500px'
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

                <Box>
                    <InputLabel sx={{ color: '#9CA3AF', mb: 1, fontSize: '0.875rem' }}>Phone Number</InputLabel>
                    <TextField 
                        fullWidth
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                         placeholder="+62 (812) 123-4567"
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
                    <InputLabel sx={{ color: '#9CA3AF', mb: 1, fontSize: '0.875rem' }}>Member Photo</InputLabel>
                    <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 1 }}>
                        Used for admin verification and client profile (max 5MB)
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {photoPreview && (
                            <Avatar
                                src={photoPreview}
                                sx={{ width: 80, height: 80, border: '2px solid var(--primary)' }}
                            />
                        )}
                        
                        <Button
                            component="label"
                            variant="outlined"
                            sx={{
                                color: 'white',
                                borderColor: '#333',
                                backgroundColor: '#0F0F0F',
                                '&:hover': {
                                    borderColor: 'var(--primary)',
                                    backgroundColor: '#1a1a1a'
                                },
                                display: 'flex',
                                gap: 1,
                                flex: 1
                            }}
                        >
                            <Upload size={20} />
                            {photoFile ? photoFile.name : 'Change Image'}
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </Button>
                    </Box>
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
