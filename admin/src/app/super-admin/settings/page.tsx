"use client";

import { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, TextField, Button, Grid, 
    Alert, InputAdornment, IconButton
} from '@mui/material';
import { Save, RefreshCw, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import SuperAdminLayout from '@/components/SuperAdminLayout';

export default function SuperAdminSettingsPage() {
    const { admin } = useAuth();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL!;

    useEffect(() => {
        if (admin) {
            setFormData(prev => ({
                ...prev,
                name: admin.name || '',
                email: admin.email || '',
            }));
        }
    }, [admin]);

    const handleSaveProfile = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                setError('Please enter a valid email address');
                setSaving(false);
                return;
            }

            await axios.put(`${API_URL}/api/super-admin/profile`, {
                name: formData.name,
                email: formData.email,
            });

            setSuccess('Profile updated successfully!');
            
            // Update local admin data if needed
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: unknown) {
            console.error('Error updating profile:', err);
            const error = err as { response?: { data?: { error?: string } } };
            setError(error.response?.data?.error || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Validate password fields
            if (!formData.currentPassword) {
                setError('Current password is required');
                setSaving(false);
                return;
            }

            if (!formData.newPassword) {
                setError('New password is required');
                setSaving(false);
                return;
            }

            if (formData.newPassword.length < 6) {
                setError('New password must be at least 6 characters long');
                setSaving(false);
                return;
            }

            if (formData.newPassword !== formData.confirmPassword) {
                setError('New passwords do not match');
                setSaving(false);
                return;
            }

            await axios.put(`${API_URL}/api/super-admin/change-password`, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });

            setSuccess('Password changed successfully!');
            
            // Clear password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            }));
            
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: unknown) {
            console.error('Error changing password:', err);
            const error = err as { response?: { data?: { error?: string } } };
            setError(error.response?.data?.error || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SuperAdminLayout>
            <Box sx={{ p: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
                        Settings
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#9CA3AF' }}>
                        Manage your account details and security settings
                    </Typography>
                </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

            <Grid container spacing={3}>
                {/* Profile Information */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, backgroundColor: '#1E1E1E', border: '1px solid #333' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                            <User size={20} color="var(--primary)" />
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                                Profile Information
                            </Typography>
                        </Box>
                        
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <User size={18} color="#9CA3AF" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ 
                                        '& .MuiInputLabel-root': { color: '#9CA3AF' }, 
                                        '& .MuiOutlinedInput-root': { 
                                            color: 'white', 
                                            '& fieldset': { borderColor: '#333' },
                                            '&:hover fieldset': { borderColor: '#666' },
                                        } 
                                    }}
                                />
                            </Grid>
                            
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Mail size={18} color="#9CA3AF" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ 
                                        '& .MuiInputLabel-root': { color: '#9CA3AF' }, 
                                        '& .MuiOutlinedInput-root': { 
                                            color: 'white', 
                                            '& fieldset': { borderColor: '#333' },
                                            '&:hover fieldset': { borderColor: '#666' },
                                        } 
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Button 
                                    variant="contained" 
                                    startIcon={saving ? <RefreshCw className="animate-spin" /> : <Save />}
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    fullWidth
                                    sx={{
                                        backgroundColor: 'var(--primary)',
                                        color: 'black',
                                        fontWeight: 'bold',
                                        py: 1.5,
                                        '&:hover': { backgroundColor: '#bbe300' }
                                    }}
                                >
                                    {saving ? 'Saving...' : 'Save Profile'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Change Password */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, backgroundColor: '#1E1E1E', border: '1px solid #333' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                            <Lock size={20} color="var(--primary)" />
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                                Change Password
                            </Typography>
                        </Box>
                        
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Current Password"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock size={18} color="#9CA3AF" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    edge="end"
                                                    sx={{ color: '#9CA3AF' }}
                                                >
                                                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ 
                                        '& .MuiInputLabel-root': { color: '#9CA3AF' }, 
                                        '& .MuiOutlinedInput-root': { 
                                            color: 'white', 
                                            '& fieldset': { borderColor: '#333' },
                                            '&:hover fieldset': { borderColor: '#666' },
                                        } 
                                    }}
                                />
                            </Grid>
                            
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="New Password"
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock size={18} color="#9CA3AF" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    edge="end"
                                                    sx={{ color: '#9CA3AF' }}
                                                >
                                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ 
                                        '& .MuiInputLabel-root': { color: '#9CA3AF' }, 
                                        '& .MuiOutlinedInput-root': { 
                                            color: 'white', 
                                            '& fieldset': { borderColor: '#333' },
                                            '&:hover fieldset': { borderColor: '#666' },
                                        } 
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Confirm New Password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock size={18} color="#9CA3AF" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    edge="end"
                                                    sx={{ color: '#9CA3AF' }}
                                                >
                                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ 
                                        '& .MuiInputLabel-root': { color: '#9CA3AF' }, 
                                        '& .MuiOutlinedInput-root': { 
                                            color: 'white', 
                                            '& fieldset': { borderColor: '#333' },
                                            '&:hover fieldset': { borderColor: '#666' },
                                        } 
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Button 
                                    variant="contained" 
                                    startIcon={saving ? <RefreshCw className="animate-spin" /> : <Lock />}
                                    onClick={handleChangePassword}
                                    disabled={saving}
                                    fullWidth
                                    sx={{
                                        backgroundColor: '#F59E0B',
                                        color: 'black',
                                        fontWeight: 'bold',
                                        py: 1.5,
                                        '&:hover': { backgroundColor: '#FBBF24' }
                                    }}
                                >
                                    {saving ? 'Changing...' : 'Change Password'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
                </Grid>
            </Box>
        </SuperAdminLayout>
    );
}
