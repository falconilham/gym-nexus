"use client";

import { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Button, Box, Typography, Avatar, Chip, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Grid, InputAdornment,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { UserPlus, Edit, Trash2, Star, Search, Settings, Upload, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import SpecialtyManager from '@/components/SpecialtyManager';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Trainer {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  singleSessionPrice: number;
  packagePrice: number;
  packageCount: number;
  image?: string;
}

export default function TrainersPage() {
  const { admin } = useAuth();
  const gymId = admin?.gymId;
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [filterRating, setFilterRating] = useState(0);
  const [filterPrice, setFilterPrice] = useState('');
  const [specialtiesList, setSpecialtiesList] = useState<{id: number, name: string}[]>([]);
  const [isSpecialtyManagerOpen, setIsSpecialtyManagerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    rating: 5,
    singleSessionPrice: 0,
    packagePrice: 0,
    packageCount: 10,
    image: ''
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchTrainers = async () => {
    if (!gymId) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/admin/trainers`, {
        params: { 
            gymId, 
            search: searchQuery,
            specialty: filterSpecialty,
            minRating: filterRating > 0 ? filterRating : undefined,
            maxPrice: filterPrice || undefined
        }
      });
      setTrainers(response.data);
    } catch (err) {
      console.error('Failed to fetch trainers', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    if (!gymId) return;
    try {
        const response = await axios.get(`${API_URL}/api/admin/specialties`, { params: { gymId } });
        setSpecialtiesList(response.data);
    } catch(err) {
        console.error(err);
    }
  };

  useEffect(() => {
    if (gymId) {
        fetchSpecialties();
    }
  }, [gymId]);

  useEffect(() => {
    if (gymId) {
        const t = setTimeout(() => fetchTrainers(), 500);
        return () => clearTimeout(t);
    }
  }, [gymId, searchQuery, filterSpecialty, filterRating, filterPrice]);

  const handleOpenDialog = (trainer?: Trainer) => {
    if (trainer) {
      setEditingTrainer(trainer);
      setFormData({
        name: trainer.name,
        specialty: trainer.specialty,
        rating: trainer.rating,
        singleSessionPrice: trainer.singleSessionPrice,
        packagePrice: trainer.packagePrice,
        packageCount: trainer.packageCount,
        image: trainer.image || ''
      });
    } else {
      setEditingTrainer(null);
      setFormData({
        name: '',
        specialty: '',
        rating: 5,
        singleSessionPrice: 0,
        packagePrice: 0,
        packageCount: 10,
        image: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTrainer(null);
  };

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
          setFormData(prev => ({ ...prev, image: compressedBase64 }));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!gymId) return;
    
    try {
      if (editingTrainer) {
        // Update
        await axios.put(`${API_URL}/api/admin/trainers/${editingTrainer.id}`, {
          ...formData,
          gymId
        });
      } else {
        // Create
        await axios.post(`${API_URL}/api/admin/trainers`, {
          ...formData,
          gymId
        });
      }
      fetchTrainers();
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to save trainer', err);
    }
  };

  /* Confirm Dialog State */
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  const handleDelete = (id: number) => {
    setConfirmDialog({
        open: true,
        title: 'Delete Trainer',
        message: 'Are you sure you want to delete this trainer? This action cannot be undone.',
        onConfirm: async () => {
             try {
                await axios.delete(`${API_URL}/api/admin/trainers/${id}`);
                fetchTrainers();
              } catch (err) {
                console.error('Failed to delete trainer', err);
              }
        }
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>Trainers</Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 0.5 }}>Manage personal trainers and their services.</Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => handleOpenDialog()}
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
          Add Trainer
        </Button>

        
        <SpecialtyManager 
            open={isSpecialtyManagerOpen} 
            onClose={() => setIsSpecialtyManagerOpen(false)}
            onUpdate={() => {
                fetchSpecialties();
                fetchTrainers(); 
            }}
        />

        <ConfirmDialog
            open={confirmDialog.open}
            onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
            onConfirm={confirmDialog.onConfirm}
            title={confirmDialog.title}
            message={confirmDialog.message}
            confirmText="Delete"
            confirmColor="error"
        />
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
         <TextField 
            placeholder="Search trainers..." 
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
         
         <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel sx={{ color: '#9CA3AF' }}>Specialty</InputLabel>
            <Select
                value={filterSpecialty}
                label="Specialty"
                onChange={(e) => setFilterSpecialty(e.target.value as string)}
                sx={{ 
                    color: 'white',
                    backgroundColor: '#1E1E1E',
                    '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary)' }
                }}
            >
                <MenuItem value="">All Specialties</MenuItem>
                {specialtiesList.map((s) => (
                    <MenuItem key={s.id} value={s.name}>{s.name}</MenuItem>
                ))}
            </Select>
         </FormControl>

         <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: '#9CA3AF' }}>Rating</InputLabel>
            <Select
                value={filterRating}
                label="Rating"
                onChange={(e) => setFilterRating(Number(e.target.value))}
                sx={{ 
                    color: 'white',
                    backgroundColor: '#1E1E1E',
                    '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary)' }
                }}
            >
                <MenuItem value={0}>Any Rating</MenuItem>
                <MenuItem value={4.5}>4.5+ Stars</MenuItem>
                <MenuItem value={4}>4.0+ Stars</MenuItem>
                <MenuItem value={3}>3.0+ Stars</MenuItem>
            </Select>
         </FormControl>

         <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel sx={{ color: '#9CA3AF' }}>Max Price</InputLabel>
            <Select
                value={filterPrice}
                label="Max Price"
                onChange={(e) => setFilterPrice(e.target.value as string)}
                sx={{ 
                    color: 'white',
                    backgroundColor: '#1E1E1E',
                    '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary)' }
                }}
            >
                <MenuItem value="">Any Price</MenuItem>
                <MenuItem value="100000">Under Rp 100k</MenuItem>
                <MenuItem value="250000">Under Rp 250k</MenuItem>
                <MenuItem value="500000">Under Rp 500k</MenuItem>
                <MenuItem value="1000000">Under Rp 1M</MenuItem>
            </Select>
         </FormControl>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#252525' }}>
            <TableRow>
              <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>TRAINER</TableCell>
              <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>SPECIALTY</TableCell>
              <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>RATING</TableCell>
              <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>PRICING</TableCell>
              <TableCell align="right" sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trainers.length > 0 ? (
              trainers.map((trainer) => (
                <TableRow key={trainer.id} sx={{ '&:hover': { backgroundColor: '#252525' }, borderBottom: '1px solid #333' }}>
                  <TableCell sx={{ color: 'white', borderBottom: '1px solid #333' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={trainer.image}
                        sx={{ width: 40, height: 40, backgroundColor: '#333' }}
                      >
                        {trainer.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{trainer.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: '#D1D5DB', borderBottom: '1px solid #333' }}>
                    <Chip
                      label={trainer.specialty}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        color: '#60a5fa',
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #333' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Star size={16} fill="var(--primary)" color="var(--primary)" />
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                        {trainer.rating.toFixed(1)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: '#D1D5DB', borderBottom: '1px solid #333' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(trainer.singleSessionPrice)} / session
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(trainer.packagePrice)} / {trainer.packageCount} sessions
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ borderBottom: '1px solid #333' }}>
                    <IconButton
                      onClick={() => handleOpenDialog(trainer)}
                      sx={{ color: '#9CA3AF', '&:hover': { color: 'white' } }}
                    >
                      <Edit size={20} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(trainer.id)}
                      sx={{ color: '#EF4444', '&:hover': { color: '#F87171' } }}
                    >
                      <Trash2 size={20} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#6B7280', borderBottom: 'none' }}>
                  No trainers found. Add your first trainer!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1E1E1E',
            border: '1px solid #333',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 'bold' }}>
          {editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {/* Row 1: Name */}
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{
                  '& .MuiInputLabel-root': { color: '#9CA3AF' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#555' },
                    '&.Mui-focused fieldset': { borderColor: 'var(--primary)' }
                  }
                }}
              />
              
              {/* Row 2: Specialty + Rating */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    <FormControl fullWidth sx={{ flex: 1 }}>
                        <InputLabel sx={{ color: '#9CA3AF' }}>Specialty</InputLabel>
                        <Select
                            value={formData.specialty}
                            label="Specialty"
                            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                             sx={{ 
                                color: 'white',
                                backgroundColor: '#1E1E1E',
                                '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary)' }
                            }}
                        >
                             {specialtiesList.map((s) => (
                                <MenuItem key={s.id} value={s.name}>{s.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="outlined"
                        onClick={() => setIsSpecialtyManagerOpen(true)}
                        sx={{ minWidth: 50, height: 56, borderColor: '#333', color: '#9CA3AF', '&:hover': { borderColor: 'white', color: 'white' } }}
                        title="Manage Specialties"
                     >
                        <Settings size={20} />
                     </Button>
                  </Box>

                  <TextField
                    type="number"
                    label="Rating"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                    inputProps={{ min: 1, max: 5, step: 0.1 }}
                    sx={{
                      flex: 1,
                      '& .MuiInputLabel-root': { color: '#9CA3AF' },
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: '#333' },
                        '&:hover fieldset': { borderColor: '#555' },
                        '&.Mui-focused fieldset': { borderColor: 'var(--primary)' }
                      }
                    }}
                  />
              </Box>

              {/* Row 3: Prices */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    type="number"
                    label="Single Session Price"
                    value={formData.singleSessionPrice}
                    onChange={(e) => setFormData({ ...formData, singleSessionPrice: parseInt(e.target.value) })}
                    sx={{
                      flex: 1,
                      '& .MuiInputLabel-root': { color: '#9CA3AF' },
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: '#333' },
                        '&:hover fieldset': { borderColor: '#555' },
                        '&.Mui-focused fieldset': { borderColor: 'var(--primary)' }
                      }
                    }}
                  />

                  <TextField
                    type="number"
                    label="Package Price"
                    value={formData.packagePrice}
                    onChange={(e) => setFormData({ ...formData, packagePrice: parseInt(e.target.value) })}
                    sx={{
                      flex: 1,
                      '& .MuiInputLabel-root': { color: '#9CA3AF' },
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: '#333' },
                        '&:hover fieldset': { borderColor: '#555' },
                        '&.Mui-focused fieldset': { borderColor: 'var(--primary)' }
                      }
                    }}
                  />
              </Box>

              {/* Row 4: Sessions + Image */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    type="number"
                    label="Package Sessions"
                    value={formData.packageCount}
                    onChange={(e) => setFormData({ ...formData, packageCount: parseInt(e.target.value) })}
                    sx={{
                      flex: 1,
                      '& .MuiInputLabel-root': { color: '#9CA3AF' },
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: '#333' },
                        '&:hover fieldset': { borderColor: '#555' },
                        '&.Mui-focused fieldset': { borderColor: 'var(--primary)' }
                      }
                    }}
                  />

                  {/* Image Upload */}
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                     <input 
                        type="file" 
                        accept="image/*" 
                        hidden 
                        id="trainer-photo-input" 
                        onChange={handleFileChange} 
                     />
                     <label htmlFor="trainer-photo-input">
                         <Button 
                            component="span" 
                            variant="outlined" 
                            startIcon={<Upload size={18} />} 
                            sx={{ 
                                height: 56, 
                                borderColor: '#333', 
                                color: '#9CA3AF', 
                                '&:hover': { borderColor: 'white', color: 'white' },
                                textTransform: 'none' 
                            }}
                         >
                             Upload Photo
                         </Button>
                     </label>
                     {formData.image ? (
                         <Box sx={{ position: 'relative' }}>
                            <Avatar src={formData.image} sx={{ width: 40, height: 40 }} />
                            <IconButton 
                                size="small" 
                                onClick={() => setFormData({...formData, image: ''})}
                                sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'red', color: 'white', '&:hover': { bgcolor: 'darkred' } }}
                            >
                                <X size={12} />
                            </IconButton>
                         </Box>
                     ) : (
                         <Typography variant="caption" sx={{ color: '#666' }}>No photo</Typography>
                     )}
                  </Box>
              </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} sx={{ color: '#9CA3AF' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              backgroundColor: 'var(--primary)',
              color: 'black',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#bbe300' }
            }}
          >
            {editingTrainer ? 'Update' : 'Add'} Trainer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
