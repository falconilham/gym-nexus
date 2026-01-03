"use client";

import { ChevronLeft, ChevronRight, Plus, Users } from 'lucide-react';
import { 
    Box, Typography, Button, IconButton, Paper, Chip 
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Client-side fetching for now
interface ClassSession {
  id: number;
  title: string;
  time: string;
  trainer: string;
  duration: string;
  capacity: number;
  booked: number;
  color?: string; // e.g. "bg-blue-500" - we might need to map this to hex if possible or custom style
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function SchedulePage() {
  const { t } = useTranslation();
  const [classList, setClassList] = useState<ClassSession[]>([]);

  useEffect(() => {
    const fetchClasses = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const res = await axios.get(`${API_URL}/api/admin/classes`);
            setClassList(res.data);
        } catch (error) {
            console.error(error);
        }
    };
    fetchClasses();
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
        <Box>
           <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>{t('schedule.title')}</Typography>
           <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 0.5 }}>{t('schedule.subtitle')}</Typography>
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
            {t('schedule.add_btn')}
        </Button>
      </Box>

      {/* Calendar Controls */}
      <Paper sx={{ backgroundColor: '#1E1E1E', p: 2, borderRadius: 3, border: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <IconButton sx={{ color: 'white', '&:hover': { backgroundColor: '#333' } }}>
            <ChevronLeft size={24} />
         </IconButton>
         <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>December 2025</Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Week 52</Typography>
         </Box>
         <IconButton sx={{ color: 'white', '&:hover': { backgroundColor: '#333' } }}>
            <ChevronRight size={24} />
         </IconButton>
      </Paper>

      {/* Week Grid */}
      <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '1px', 
          backgroundColor: '#333', 
          border: '1px solid #333', 
          borderRadius: 3, 
          overflow: 'hidden' 
      }}>
        {DAYS.map((day, index) => (
            <Box 
                key={day} 
                sx={{ 
                    backgroundColor: index === 2 ? '#252525' : '#1E1E1E', 
                    p: 2, 
                    textAlign: 'center', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: 1 
                }}
            >
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: index === 2 ? 'var(--primary)' : '#9CA3AF' }}>
                    {day}
                </Typography>
                <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '0.875rem', 
                    fontWeight: 'bold', 
                    backgroundColor: index === 2 ? 'var(--primary)' : 'transparent', 
                    color: index === 2 ? 'black' : 'white' 
                }}>
                    {29 + index}
                </Box>
            </Box>
        ))}
      </Box>

      {/* Timeline View */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {classList.map((cls) => (
            <Box key={cls.id} sx={{ position: 'relative', pl: { sm: 10 }, py: 2, '&:hover': { backgroundColor: 'rgba(30, 30, 30, 0.5)' }, borderRadius: 2, transition: 'background-color 0.2s' }}>
                {/* Time Indicator */}
                <Typography sx={{ position: 'absolute', left: 16, top: 20, color: '#9CA3AF', fontFamily: 'monospace', fontSize: '0.875rem', display: { xs: 'none', sm: 'block' } }}>
                    {cls.time}
                </Typography>
                
                {/* Class Card */}
                <Paper sx={{ 
                    backgroundColor: '#252525', 
                    border: '1px solid #333', 
                    p: 2, 
                    borderRadius: 3, 
                    mx: 2, 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' }, 
                    justifyContent: 'space-between', 
                    gap: 2, 
                    '&:hover': { borderColor: 'rgba(204, 255, 0, 0.5)' }, 
                    transition: 'border-color 0.2s'
                }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {/* Use a colored bar based on class type provided by backend or default */}
                         <Box sx={{ width: 4, height: 48, borderRadius: 4, backgroundColor: cls.color || 'var(--primary)' }} />
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>{cls.title}</Typography>
                            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>with {cls.trainer} • {cls.duration}</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#D1D5DB', backgroundColor: '#1E1E1E', px: 1.5, py: 0.75, borderRadius: 2, border: '1px solid #333' }}>
                            <Users size={16} color="#6B7280" />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{cls.booked}/{cls.capacity}</Typography>
                        </Box>
                         <Chip 
                                label={cls.booked >= cls.capacity ? t('schedule.full') : t('schedule.open')} 
                                size="small"
                                sx={{ 
                                    fontWeight: 'bold', 
                                    borderRadius: 1,
                                    height: '24px',
                                    backgroundColor: cls.booked >= cls.capacity ? 'rgba(127, 29, 29, 0.3)' : 'rgba(20, 83, 45, 0.3)',
                                    color: cls.booked >= cls.capacity ? '#f87171' : '#4ade80'
                                }}
                            />
                    </Box>
                </Paper>
            </Box>
        ))}
      </Box>

    </Box>
  );
}

