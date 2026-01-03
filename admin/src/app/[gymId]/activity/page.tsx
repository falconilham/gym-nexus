'use client';

import { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    List, 
    ListItem, 
    ListItemAvatar, 
    Avatar, 
    ListItemText, 
    CircularProgress,
    Alert,
    Divider,
    FormControl, Select, MenuItem, InputLabel, TablePagination
} from '@mui/material';
import { UserPlus, UserX, Trash2, Edit, Activity, UserCheck, Dumbbell, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { formatDistanceToNow, format } from 'date-fns';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useTranslation } from 'react-i18next';

interface ActivityLog {
    id: number;
    action: string;
    details: string;
    adminName: string;
    timestamp: string;
    createdAt: string;
}

export default function ActivityPage() {
    const { t } = useTranslation();
    const { admin } = useAuth();
    const gymId = admin?.gymId;
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterType, setFilterType] = useState('all');
    const [filterDate, setFilterDate] = useState('');
    
    // Pagination State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [totalRows, setTotalRows] = useState(0);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const fetchLogs = async () => {
        if (!admin?.gymId) return;
        try {
            setLoading(true);
            setError(null);
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gym-nexus-backend.vercel.app';
            const response = await axios.get(`${API_URL}/api/admin/activity-logs`, {
                params: { 
                    gymId: admin.gymId,
                    type: filterType,
                    date: filterDate,
                    page: page + 1,
                    limit: rowsPerPage
                }
            });
            if (response.data.data) {
                setLogs(response.data.data);
                setTotalRows(response.data.pagination.total);
            } else {
                setLogs(response.data);
                setTotalRows(response.data.length || 0);
            }

        } catch (error) {
            console.error('Error fetching activity logs:', error);
            setError('Failed to load activity logs. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [admin?.gymId, filterType, filterDate, page, rowsPerPage]);

    const getIcon = (log: any) => {
        let action = log.action;
        let details = {} as any;
        try { details = JSON.parse(log.details); } catch(e){}

        if ((action === 'TRAINER_SUSPENDED' || action === 'MEMBER_SUSPENDED') && details.status === 'Active') {
             action = action.replace('SUSPENDED', 'ACTIVATED');
        }

        switch (action) {
            case 'MEMBER_ADDED': return <UserPlus size={20} color="#a3e635" />;
            case 'MEMBER_SUSPENDED': return <UserX size={20} color="#facc15" />;
            case 'TRAINER_SUSPENDED': return <UserX size={20} color="#facc15" />;
            case 'MEMBER_ACTIVATED': return <UserCheck size={20} color="#4ade80" />;
            case 'TRAINER_ACTIVATED': return <UserCheck size={20} color="#4ade80" />;
            case 'MEMBER_DELETED': return <Trash2 size={20} color="#f87171" />;
            case 'TRAINER_DELETED': return <Trash2 size={20} color="#f87171" />;
            case 'MEMBER_UPDATED': return <Edit size={20} color="#60a5fa" />;
            case 'TRAINER_UPDATED': return <Edit size={20} color="#60a5fa" />;
            case 'TRAINER_ADDED': return <UserPlus size={20} color="#22d3ee" />;
            
            // Equipment Icons
            case 'EQUIPMENT_ADDED': return <Dumbbell size={20} color="#4ade80" />;
            case 'EQUIPMENT_UPDATED':
                if (details.changes && details.changes.includes('Active -> Broken')) {
                    return <Dumbbell size={20} color="#f87171" />;
                } 
                // For other updates (Fixing, Name change, etc), use Blue
                return <Dumbbell size={20} color="#60a5fa" />;
            case 'EQUIPMENT_DELETED': return <Trash2 size={20} color="#f87171" />;
            
            default: return <Activity size={20} color="#d1d5db" />;
        }
    };

    const getActionText = (log: any) => {
        let action = log.action;
        let details = {} as any;
        try { details = JSON.parse(log.details); } catch(e){}

        if ((action === 'TRAINER_SUSPENDED' || action === 'MEMBER_SUSPENDED') && details.status === 'Active') {
             action = action.replace('SUSPENDED', 'ACTIVATED');
        }

        switch (action) {
            case 'MEMBER_ADDED': return 'Member Added';
            case 'MEMBER_SUSPENDED': return 'Member Suspended';
            case 'TRAINER_SUSPENDED': return 'Trainer Suspended';
            case 'MEMBER_ACTIVATED': return 'Member Activated';
            case 'TRAINER_ACTIVATED': return 'Trainer Activated';
            case 'MEMBER_DELETED': return 'Member Deleted';
            case 'TRAINER_DELETED': return 'Trainer Deleted';
            case 'MEMBER_UPDATED': return 'Member Updated';
            case 'TRAINER_UPDATED': return 'Trainer Updated';
            case 'TRAINER_ADDED': return 'Trainer Added';
            default: return action.replace(/_/g, ' ');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress sx={{ color: 'var(--primary)' }} />
            </Box>
        );
    }

    return (
         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
             <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
                        {t('activity.title')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        {t('activity.subtitle')}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker 
                            label={t('activity.filter_date')}
                            value={filterDate ? new Date(filterDate) : null}
                            onChange={(newValue) => {
                                if (newValue) {
                                    setFilterDate(format(newValue, 'yyyy-MM-dd'));
                                } else {
                                    setFilterDate('');
                                }
                            }}
                            slotProps={{ 
                                textField: { 
                                    size: 'small',
                                    sx: { 
                                        width: 180,
                                        '& .MuiInputLabel-root': { color: '#9CA3AF' },
                                        '& .MuiOutlinedInput-root': {
                                            color: 'white',
                                            '& fieldset': { borderColor: '#333' },
                                            '&:hover fieldset': { borderColor: '#555' },
                                            '&.Mui-focused fieldset': { borderColor: 'var(--primary)' },
                                            '& .MuiSvgIcon-root': { color: '#9CA3AF' }
                                        }
                                    }
                                } 
                            }}
                        />
                    </LocalizationProvider>
                    <FormControl sx={{ minWidth: 150 }}>
                        <Select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            size="small"
                            sx={{ 
                                color: 'white',
                                '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary)' }
                            }}
                        >
                            <MenuItem value="all">{t('activity.filter_type.all')}</MenuItem>
                            <MenuItem value="member">{t('activity.filter_type.member')}</MenuItem>
                            <MenuItem value="trainer">{t('activity.filter_type.trainer')}</MenuItem>
                            <MenuItem value="equipment">{t('activity.filter_type.equipment')}</MenuItem>
                            <MenuItem value="check">{t('activity.filter_type.check')}</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
             </Box>

             {error && (
                <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(211, 47, 47, 0.1)', color: '#ffcdd2', border: '1px solid #ef5350' }}>
                    {error}
                </Alert>
             )}

             <Paper sx={{ backgroundColor: '#1E1E1E', borderRadius: 3, border: '1px solid #333', overflow: 'hidden' }}>
                {logs.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography sx={{ color: '#6B7280' }}>{t('activity.no_logs')}</Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {logs.map((log, index) => (
                            <Box key={log.id}>
                                <ListItem alignItems="flex-start" sx={{ px: 3, py: 2 }}>
                                    <ListItemAvatar>
                                        <Avatar sx={{ backgroundColor: '#2C2C2C', border: '1px solid #333' }}>
                                            {getIcon(log)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                                                    {getActionText(log)}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#6B7280', textAlign: 'right' }}>
                                                    {format(new Date(log.timestamp), 'dd MMM yyyy, HH:mm')}
                                                    <br/>
                                                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                                               {(() => {
                                                   try {
                                                       const det = JSON.parse(log.details);
                                                       if (det.reason) return `${det.name} - ${det.status || 'Suspended'}. Reason: ${det.reason}`;
                                                       if (det.changes) return `${det.name || 'Item'} ${det.brand ? `- ${det.brand}` : ''} updated: ${det.changes}`;
                                                       if (log.action.includes('TRAINER')) return `Trainer: ${det.name}`;
                                                       if (log.action.includes('EQUIPMENT')) return `Equipment: ${det.name} ${det.brand ? `- ${det.brand}` : ''} ${det.category ? `(${det.category})` : ''}`;
                                                       if (det.name) return `Member: ${det.name} (${det.email || ''})`;
                                                       if (det.memberId) return `Member ID: ${det.memberId}`;
                                                       if (det.suspended !== undefined) return `Suspended: ${det.suspended}`;
                                                       return log.details;
                                                   } catch (e) {
                                                       return log.details;
                                                   }
                                               })()}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                                {index < logs.length - 1 && <Divider component="li" sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}
                            </Box>
                        ))}
                    </List>
                )}
             </Paper>
             
             {/* Pagination */}
             <TablePagination
                component="div"
                count={totalRows}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 20, 50, 100]}
                sx={{ color: '#9CA3AF' }}
              />
        </Box>
    );
}
