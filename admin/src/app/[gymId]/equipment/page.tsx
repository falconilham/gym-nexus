"use client";

import { Wrench, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { 
    Box, Typography, Button, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, TablePagination 
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface Equipment {
  id: number;
  name: string;
  brand?: string;
  category: string;
  status: string;
}

export default function EquipmentPage() {
  const { t } = useTranslation();
  const { admin } = useAuth();
  const gymId = admin?.gymId;
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  
  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState({
      name: '',
      brand: '',
      category: '',
      status: 'Active'
  });

  // Fetch logic wrapped for reuse
  const fetchEquipment = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fitflow-backend.vercel.app';
            const res = await axios.get(`${API_URL}/api/admin/equipment`, {
                params: {
                    gymId,
                    page: page + 1,
                    limit: rowsPerPage
                }
            });
            if (res.data.data) {
                setEquipmentList(res.data.data);
                setTotalRows(res.data.pagination.total);
            } else {
                setEquipmentList(res.data);
                 setTotalRows(res.data.length);
            }
        } catch (error) {
            console.error(error);
            setEquipmentList([]);
        }
    };

  useEffect(() => {
    if (gymId) {
        fetchEquipment();
    }
  }, [gymId, page, rowsPerPage]);

  const handleOpenDialog = (item?: Equipment) => {
      if (item) {
          setEditingItem(item);
          setFormData({
              name: item.name,
              brand: item.brand || '',
              category: item.category,
              status: item.status
          });
      } else {
          setEditingItem(null);
          setFormData({ name: '', brand: '', category: '', status: 'Active' });
      }
      setOpenDialog(true);
  };

  const handleCloseDialog = () => {
      setOpenDialog(false);
      setEditingItem(null);
  };

  const handleSubmit = async () => {
      if (!gymId) return;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fitflow-backend.vercel.app';
      
      try {
          if (editingItem) {
              await axios.put(`${API_URL}/api/admin/equipment/${editingItem.id}`, { ...formData, gymId });
          } else {
              await axios.post(`${API_URL}/api/admin/equipment`, { ...formData, gymId });
          }
          fetchEquipment();
          handleCloseDialog();
      } catch (error) {
          console.error('Failed to save equipment:', error);
      }
  };

  const handleDelete = async (id: number) => {
      if (!confirm('Are you sure you want to delete this equipment?')) return;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fitflow-backend.vercel.app';
      try {
          await axios.delete(`${API_URL}/api/admin/equipment/${id}`);
          fetchEquipment();
      } catch (error) {
          console.error(error);
      }
  };

  // Stats calculation (mocked for paginated data, ideally should come from backend stats endpoint)
  // For now we just show hardcoded or simple based on current page (which is inaccurate for total), 
  // so let's keep the UI static or fetch a separate stats endpoint if strictly needed.
  // We'll keep the static "Status Overview" from the design for now but ideally update it later.

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
        <Box>
           <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>{t('equipment.title')}</Typography>
           <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 0.5 }}>{t('equipment.subtitle')}</Typography>
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
            <Plus size={20} />
            {t('equipment.add_btn')}
        </Button>
      </Box>

      {/* Status Overview - REMOVED as requested */}

      {/* Mobile View (Cards) */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
        {equipmentList.length > 0 ? (
            equipmentList.map((item) => (
                <Paper key={item.id} sx={{ p: 2, backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                             <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>{item.name}</Typography>
                             <Typography variant="body2" sx={{ color: 'var(--primary)', fontWeight: 500 }}>{item.category}</Typography>
                        </Box>
                        <Chip 
                            size="small"
                            icon={item.status === 'Broken' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                            label={item.status}
                            sx={{ 
                                fontWeight: 'bold', 
                                borderRadius: 1,
                                height: '24px',
                                backgroundColor: item.status === 'Active' ? 'rgba(20, 83, 45, 0.3)' : 'rgba(127, 29, 29, 0.3)',
                                color: item.status === 'Active' ? '#4ade80' : '#f87171',
                                '& .MuiChip-icon': { color: 'inherit', marginLeft: '4px' }
                            }}
                        />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                         <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Brand: <span style={{ color: 'white' }}>{item.brand || '-'}</span></Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, borderTop: '1px solid #333', pt: 2 }}>
                         <Button 
                            size="small"
                            onClick={() => handleOpenDialog(item)}
                            sx={{ color: '#9CA3AF', textTransform: 'none', '&:hover': { color: 'white' } }}
                        >
                            Edit
                        </Button>
                        <Button 
                            size="small"
                            onClick={() => handleDelete(item.id)}
                            sx={{ color: '#EF4444', textTransform: 'none', '&:hover': { color: '#F87171' } }}
                        >
                            Delete
                        </Button>
                    </Box>
                </Paper>
            ))
        ) : (
             <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: 3 }}>
                <Typography sx={{ color: '#6B7280' }}>No equipment found.</Typography>
             </Paper>
        )}
      </Box>

      {/* Desktop View (Table) */}
      <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' }, backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: 3 }}>
        <Table>
            <TableHead sx={{ backgroundColor: '#252525' }}>
                <TableRow>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>{t('equipment.table.name')}</TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>{t('equipment.table.brand')}</TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>{t('equipment.table.category')}</TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>{t('equipment.table.status')}</TableCell>
                    <TableCell align="right" sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>{t('equipment.table.actions')}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {equipmentList.length > 0 ? (
                    equipmentList.map((item) => (
                    <TableRow key={item.id} sx={{ '&:hover': { backgroundColor: '#252525' }, borderBottom: '1px solid #333' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 500, borderBottom: '1px solid #333' }}>{item.name}</TableCell>
                        <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #333' }}>{item.brand || '-'}</TableCell>
                        <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #333' }}>{item.category}</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #333' }}>
                             <Chip 
                                icon={item.status === 'Broken' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                                label={item.status} 
                                size="small"
                                sx={{ 
                                    fontWeight: 'bold', 
                                    borderRadius: 1,
                                    height: '24px',
                                    backgroundColor: item.status === 'Active' ? 'rgba(20, 83, 45, 0.3)' : 'rgba(127, 29, 29, 0.3)',
                                    color: item.status === 'Active' ? '#4ade80' : '#f87171',
                                    '& .MuiChip-icon': { color: 'inherit', marginLeft: '4px' }
                                }}
                            />
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: '1px solid #333' }}>
                            <Button 
                                size="small"
                                onClick={() => handleOpenDialog(item)}
                                sx={{ 
                                    textTransform: 'none', 
                                    color: '#9CA3AF', 
                                    fontWeight: 500,
                                    '&:hover': { color: 'var(--primary)', backgroundColor: 'transparent' } 
                                }}
                            >
                                Edit
                            </Button>
                            <Button 
                                size="small"
                                onClick={() => handleDelete(item.id)}
                                sx={{ 
                                    textTransform: 'none', 
                                    color: '#EF4444', 
                                    fontWeight: 500,
                                    '&:hover': { color: '#F87171', backgroundColor: 'transparent' } 
                                }}
                            >
                                Delete
                            </Button>
                        </TableCell>
                    </TableRow>
                ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#6B7280', borderBottom: 'none' }}>
                            No equipment found.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
      </TableContainer>

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
    
    {/* Add/Edit Dialog */}
    {openDialog && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper sx={{ width: '100%', maxWidth: 500, bgcolor: '#1E1E1E', border: '1px solid #333', borderRadius: 3, p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {editingItem ? 'Edit Equipment' : 'Add New Equipment'}
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                     <input 
                        placeholder="Equipment Name"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#2C2C2C', color: 'white', width: '100%' }}
                     />
                     <input 
                        placeholder="Brand (e.g. Technogym)"
                        value={formData.brand}
                        onChange={e => setFormData({...formData, brand: e.target.value})}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#2C2C2C', color: 'white', width: '100%' }}
                     />
                     <input 
                        placeholder="Category (e.g. Cardio, Strength)"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#2C2C2C', color: 'white', width: '100%' }}
                     />
                     <select
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#2C2C2C', color: 'white', width: '100%' }}
                     >
                         <option value="Active">Active</option>
                         <option value="Broken">Broken</option>
                     </select>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button onClick={handleCloseDialog} sx={{ color: '#9CA3AF' }}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: 'var(--primary)', color: 'black', fontWeight: 'bold', '&:hover': { bgcolor: '#bbe300' } }}>
                        {editingItem ? 'Save Changes' : 'Add Equipment'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    )}

    </Box>
  );
}

