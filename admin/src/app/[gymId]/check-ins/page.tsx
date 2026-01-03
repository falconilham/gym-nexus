"use client";

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
    Button, Box, Typography, Chip, Avatar, TextField
} from '@mui/material';
import axios from 'axios';

interface CheckIn {
  id: number;
  memberName: string;
  memberId: number;
  status: 'granted' | 'denied';
  reason?: string;
  timestamp: string;
  checkOutTime?: string | null;
}

export default function CheckInsPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-CA'));

  const fetchCheckIns = async () => {
    setLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL!;
    try {
      let url = `${API_URL}/api/admin/check-ins?limit=50`;
      if (selectedDate) {
          url += `&date=${selectedDate}`;
      }
      const response = await axios.get(url);
      setCheckIns(response.data);
    } catch (err) {
      console.error('Failed to fetch check-ins', err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckIns();
  }, [selectedDate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
           <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>Check-in History</Typography>
           <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 0.5 }}>Real-time log of member access.</Typography>
        </Box>
        <Button 
            variant="contained"
            onClick={fetchCheckIns}
            sx={{ 
                backgroundColor: '#2C2C2C', 
                color: 'white', 
                fontWeight: 'bold',
                padding: '10px 20px',
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': { backgroundColor: '#333' },
                display: 'flex',
                gap: 1
            }}
        >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
            type="date"
            size="small"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            placeholder="Filter by Date"
            sx={{ 
                backgroundColor: '#1E1E1E', 
                borderRadius: 2,
                '& .MuiOutlinedInput-root': { color: 'white' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }
            }}
        />
        {selectedDate && (
             <Button onClick={() => setSelectedDate('')} sx={{ color: '#9CA3AF' }}>Clear</Button>
        )}
      </Box>

      {/* Material UI Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: 3 }}>
        <Table>
            <TableHead sx={{ backgroundColor: '#252525' }}>
                <TableRow>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>MEMBER</TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>CHECK-IN</TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>CHECK-OUT</TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>STATUS</TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, borderBottom: '1px solid #333' }}>DETAILS</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {checkIns.length > 0 ? (
                    checkIns.map((checkIn) => (
                        <TableRow key={checkIn.id} sx={{ '&:hover': { backgroundColor: '#252525' }, borderBottom: '1px solid #333' }}>
                            <TableCell sx={{ color: 'white', borderBottom: '1px solid #333' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ backgroundColor: '#333', width: 32, height: 32, fontSize: 14 }}>
                                        {checkIn.memberName ? checkIn.memberName.charAt(0) : '?'}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{checkIn.memberName || 'Unknown'}</Typography>
                                        <Typography variant="caption" sx={{ color: '#6B7280' }}>ID: {checkIn.memberId}</Typography>
                                    </Box>
                                </Box>
                            </TableCell>
                            <TableCell sx={{ color: '#D1D5DB', borderBottom: '1px solid #333' }}>
                                 <Box>
                                    <Typography variant="body2">{new Date(checkIn.timestamp).toLocaleTimeString()}</Typography>
                                    <Typography variant="caption" sx={{ color: '#6B7280' }}>{new Date(checkIn.timestamp).toLocaleDateString()}</Typography>
                                 </Box>
                            </TableCell>
                            <TableCell sx={{ color: '#D1D5DB', borderBottom: '1px solid #333' }}>
                                {checkIn.checkOutTime ? (
                                    <Box>
                                        <Typography variant="body2">{new Date(checkIn.checkOutTime).toLocaleTimeString()}</Typography>
                                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                            {(() => {
                                                const duration = new Date(checkIn.checkOutTime).getTime() - new Date(checkIn.timestamp).getTime();
                                                const hours = Math.floor(duration / (1000 * 60 * 60));
                                                const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
                                                return `${hours}h ${minutes}m`;
                                            })()}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Chip 
                                        label="Active" 
                                        size="small"
                                        sx={{ 
                                            fontWeight: 'bold', 
                                            borderRadius: 1, 
                                            backgroundColor: 'rgba(59, 130, 246, 0.3)',
                                            color: '#60a5fa'
                                        }} 
                                    />
                                )}
                            </TableCell>
                            <TableCell sx={{ borderBottom: '1px solid #333' }}>
                                <Chip 
                                    label={checkIn.status === 'granted' ? 'Allowed' : 'Denied'} 
                                    size="small"
                                    sx={{ 
                                        fontWeight: 'bold', 
                                        borderRadius: 1, 
                                        backgroundColor: checkIn.status === 'granted' ? 'rgba(20, 83, 45, 0.3)' : 'rgba(127, 29, 29, 0.3)',
                                        color: checkIn.status === 'granted' ? '#4ade80' : '#f87171'
                                    }} 
                                />
                            </TableCell>
                            <TableCell sx={{ color: '#9CA3AF', borderBottom: '1px solid #333' }}>
                                {checkIn.reason ? (
                                    <Typography variant="body2" sx={{ color: '#f87171' }}>{checkIn.reason}</Typography>
                                ) : (
                                    <Typography variant="body2" sx={{ color: '#4ade80' }}>Check-in successful</Typography>
                                )}
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#6B7280', borderBottom: 'none' }}>
                            No check-in activity recorded.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
