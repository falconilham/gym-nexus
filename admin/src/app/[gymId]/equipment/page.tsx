"use client";

import { Wrench, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { 
    Box, Typography, Button, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip 
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface Equipment {
  id: number;
  name: string;
  category: string;
  status: string;
  lastService: string;
  nextService: string;
}

export default function EquipmentPage() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);

  useEffect(() => {
    const fetchEquipment = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const res = await axios.get(`${API_URL}/api/admin/equipment`);
            setEquipmentList(res.data);
        } catch (error) {
            console.error(error);
            setEquipmentList([]);
        }
    };
    fetchEquipment();
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
        <Box>
           <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>Equipment Registry</Typography>
           <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 0.5 }}>Track asset status and maintenance schedules.</Typography>
        </Box>
        <Button 
            variant="contained"
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
            Add Equipment
        </Button>
      </Box>

      {/* Status Overview */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
         <Paper sx={{ backgroundColor: '#1E1E1E', p: 3, borderRadius: 3, border: '1px solid #333', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'rgba(20, 83, 45, 0.3)', color: '#4ade80' }}>
                <CheckCircle size={24} />
            </Box>
            <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>42</Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Operational</Typography>
            </Box>
         </Paper>
         <Paper sx={{ backgroundColor: '#1E1E1E', p: 3, borderRadius: 3, border: '1px solid #333', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'rgba(133, 77, 14, 0.3)', color: '#eab308' }}>
                <Wrench size={24} />
            </Box>
            <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>3</Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Maintenance Due</Typography>
            </Box>
         </Paper>
         <Paper sx={{ backgroundColor: '#1E1E1E', p: 3, borderRadius: 3, border: '1px solid #333', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'rgba(127, 29, 29, 0.3)', color: '#f87171' }}>
                <AlertTriangle size={24} />
            </Box>
            <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>1</Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Out of Order</Typography>
            </Box>
         </Paper>
      </Box>

      {/* Equipment Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: 3 }}>
        <Table>
            <TableHead sx={{ backgroundColor: '#252525' }}>
                <TableRow>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>EQUIPMENT NAME</TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>CATEGORY</TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>STATUS</TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>LAST SERVICE</TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>NEXT DUE</TableCell>
                    <TableCell align="right" sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>ACTIONS</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {equipmentList.map((item) => (
                    <TableRow key={item.id} sx={{ '&:hover': { backgroundColor: '#252525' }, borderBottom: '1px solid #333' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 500, borderBottom: '1px solid #333' }}>{item.name}</TableCell>
                        <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #333' }}>{item.category}</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #333' }}>
                             <Chip 
                                icon={item.status === 'Maintenance' ? <Wrench size={14} /> : item.status === 'Broken' ? <AlertTriangle size={14} /> : undefined}
                                label={item.status} 
                                size="small"
                                sx={{ 
                                    fontWeight: 'bold', 
                                    borderRadius: 1,
                                    height: '24px',
                                    backgroundColor: item.status === 'Operational' ? 'rgba(20, 83, 45, 0.3)' : item.status === 'Maintenance' ? 'rgba(133, 77, 14, 0.3)' : 'rgba(127, 29, 29, 0.3)',
                                    color: item.status === 'Operational' ? '#4ade80' : item.status === 'Maintenance' ? '#eab308' : '#f87171',
                                    '& .MuiChip-icon': { color: 'inherit', marginLeft: '4px' } // Adjust icon color and spacing
                                }}
                            />
                        </TableCell>
                        <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #333' }}>{item.lastService}</TableCell>
                        <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #333' }}>{item.nextService}</TableCell>
                        <TableCell align="right" sx={{ borderBottom: '1px solid #333' }}>
                            <Button 
                                size="small"
                                sx={{ 
                                    textTransform: 'none', 
                                    color: '#9CA3AF', 
                                    fontWeight: 500,
                                    '&:hover': { color: 'var(--primary)', backgroundColor: 'transparent' } 
                                }}
                            >
                                Details
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

