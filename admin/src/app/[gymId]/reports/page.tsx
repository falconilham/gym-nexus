"use client";

import { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import axios from 'axios';
import { motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';

export default function ReportsPage() {
    const { t } = useTranslation();
    const [peakData, setPeakData] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
               const API_URL = process.env.NEXT_PUBLIC_API_URL!;
               const res = await axios.get(`${API_URL}/api/admin/reports/peak-hours`);
               setPeakData(res.data.hourCounts);
            } catch(e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const maxVal = Math.max(...peakData, 1);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>{t('reports.title')}</Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 1 }}>{t('reports.subtitle')}</Typography>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
                
                {/* Peak Hours Chart */}
                <Paper sx={{ p: 3, backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: 3, overflow: 'hidden' }}>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>{t('reports.peak_hours')}</Typography>
                    
                    {loading ? (
                        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                            Loading data...
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ width: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'flex-end', 
                                    height: 340, // Increased total height
                                    pt: 4,      // Space for tooltips at the top
                                    gap: { xs: 1, md: 1 }, 
                                    minWidth: { xs: '600px', sm: '100%' } // Force min-width on mobile to trigger scroll
                                }}>
                                    {peakData.map((count, hour) => {
                                        const heightPercent = (count / maxVal) * 100;
                                        return (
                                            <Box key={hour} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, position: 'relative', group: 'bar' }}>
                                                {/* Tooltip on hover */}
                                                <Box sx={{ 
                                                    position: 'absolute', 
                                                    bottom: '100%', 
                                                    mb: 1, 
                                                    backgroundColor: '#333', 
                                                    color: 'white', 
                                                    px: 1, 
                                                    py: 0.5, 
                                                    borderRadius: 1, 
                                                    fontSize: '0.75rem',
                                                    whiteSpace: 'nowrap',
                                                    opacity: 0,
                                                    pointerEvents: 'none',
                                                    transition: 'opacity 0.2s',
                                                    zIndex: 10,
                                                    '&::after': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: '50%',
                                                        ml: '-4px',
                                                        borderWidth: '4px',
                                                        borderStyle: 'solid',
                                                        borderColor: '#333 transparent transparent transparent'
                                                    }
                                                }} className="tooltip">
                                                    {count} visits
                                                </Box>
                                                
                                                <motion.div 
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${heightPercent}%` }}
                                                    transition={{ duration: 0.5, delay: hour * 0.02 }}
                                                    style={{ 
                                                        width: '100%', 
                                                        backgroundColor: count > 0 ? '#CCFF00' : '#333',
                                                        borderRadius: '4px 4px 0 0',
                                                        opacity: count > 0 ? 0.9 : 0.3,
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        const tooltip = e.currentTarget.parentElement?.querySelector('.tooltip') as HTMLElement;
                                                        if (tooltip) tooltip.style.opacity = '1';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        const tooltip = e.currentTarget.parentElement?.querySelector('.tooltip') as HTMLElement;
                                                        if (tooltip) tooltip.style.opacity = '0';
                                                    }}
                                                />
                                                {hour % 3 === 0 && (
                                                    <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '10px' }}>
                                                        {hour}:00
                                                    </Typography>
                                                )}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: '#6B7280' }}>
                                Time of Day (24h)
                            </Typography>
                        </>
                    )}
                </Paper>

                {/* Side Stats */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr' }, gap: 3 }}>
                     <Paper sx={{ p: 3, backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: 3, flex: 1 }}>
                        <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>Summary</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box>
                                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>BUSIEST HOUR</Typography>
                                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    {loading ? '-' : `${peakData.indexOf(maxVal)}:00`}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>TOTAL VISITS (7 DAYS)</Typography>
                                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    {loading ? '-' : peakData.reduce((a, b) => a + b, 0)}
                                </Typography>
                            </Box>
                        </Box>
                     </Paper>
                </Box>
            </Box>
        </Box>
    );
}
