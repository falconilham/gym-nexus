import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { Trash2, Plus } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import ConfirmDialog from './ConfirmDialog';

interface Specialty {
  id: number;
  name: string;
}

interface SpecialtyManagerProps {
  open: boolean;
  onClose: () => void;
  onUpdate: () => void; // Refresh parent list
}

export default function SpecialtyManager({ open, onClose, onUpdate }: SpecialtyManagerProps) {
  const { admin } = useAuth();
  const gymId = admin?.gymId;
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: () => {} });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchSpecialties = async () => {
    if (!gymId) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/admin/specialties`, { params: { gymId } });
      setSpecialties(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load specialties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSpecialties();
    }
     
  }, [open, gymId]);

  const handleAdd = async () => {
    if (!newSpecialty.trim() || !gymId) return;
    try {
      await axios.post(`${API_URL}/api/admin/specialties`, {
        gymId,
        name: newSpecialty.trim()
      });
      setNewSpecialty('');
      fetchSpecialties();
      onUpdate();
    } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        setError(error.response?.data?.error || 'Failed to add specialty');
    }
  };

  const handleDelete = (id: number) => {
    setConfirmDialog({
        open: true,
        title: 'Delete Specialty',
        message: 'Are you sure you want to delete this specialty?',
        onConfirm: async () => {
             try {
              await axios.delete(`${API_URL}/api/admin/specialties/${id}`);
              fetchSpecialties();
              onUpdate();
            } catch (err) {
              console.error(err);
              setError('Failed to delete');
            }
        }
    });
  };

  return (
    <>
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#1E1E1E', color: 'white' } }}>
      <DialogTitle sx={{ borderBottom: '1px solid #333' }}>Manage Specialties</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 1, mt: 2, mb: 2 }}>
            <TextField 
                fullWidth 
                size="small"
                placeholder="New Specialty Name (e.g. Pilates)"
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                sx={{ 
                    input: { color: 'white' },
                    label: { color: '#9CA3AF' },
                    '& .MuiOutlinedInput-root': {
                        bgcolor: '#2C2C2C',
                        '& fieldset': { borderColor: '#444' },
                        '&:hover fieldset': { borderColor: '#555' },
                    }
                }}
            />
            <Button 
                variant="contained" 
                onClick={handleAdd}
                disabled={!newSpecialty.trim()}
                sx={{ bgcolor: 'var(--primary)', color: 'black', '&:hover': { bgcolor: '#bbe300' } }}
            >
                <Plus size={20} />
            </Button>
        </Box>
        
        {error && <Typography color="error" variant="caption" sx={{ mb: 2, display: 'block' }}>{error}</Typography>}

        {loading ? (
             <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress size={24} /></Box>
        ) : (
            <List sx={{ bgcolor: '#252525', borderRadius: 2 }}>
                {specialties.length === 0 && (
                    <Typography sx={{ p: 2, textAlign: 'center', color: '#666' }}>No specialties found.</Typography>
                )}
                {specialties.map((s) => (
                    <ListItem 
                        key={s.id}
                        secondaryAction={
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(s.id)} sx={{ color: '#EF4444' }}>
                                <Trash2 size={18} />
                            </IconButton>
                        }
                        sx={{ borderBottom: '1px solid #333' }}
                    >
                        <ListItemText primary={s.name} sx={{ '& .MuiListItemText-primary': { color: 'white' } }} />
                    </ListItem>
                ))}
            </List>
        )}
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid #333', p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#9CA3AF' }}>Close</Button>
      </DialogActions>
    </Dialog>
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete"
        confirmColor="error"
      />
    </>
  );
}
