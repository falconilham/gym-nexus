"use client";

import { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, TextField, Button, Grid, 
    Divider, Alert, CircularProgress, InputAdornment 
} from '@mui/material';
import { Save, RefreshCw, Palette, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
    const { admin } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const [formData, setFormData] = useState({
        name: '',
        logo: '',
        primaryColor: '#bef264',
        secondaryColor: '#1a1a1a',
        address: '',
        phone: '',
        email: '',
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/admin/settings`);
            const data = response.data;
            setFormData({
                name: data.name || '',
                logo: data.logo || '',
                primaryColor: data.primaryColor || '#bef264',
                secondaryColor: data.secondaryColor || '#1a1a1a',
                address: data.address || '',
                phone: data.phone || '',
                email: data.email || '',
            });
            if (data.logo) setPreviewUrl(data.logo);
        } catch (err: unknown) {
            console.error('Error fetching settings:', err);
            setError('Failed to load settings.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('primaryColor', formData.primaryColor);
            data.append('secondaryColor', formData.secondaryColor);
            data.append('address', formData.address);
            data.append('phone', formData.phone);
            data.append('email', formData.email);
            
            if (logoFile) {
                data.append('logoFile', logoFile);
            } else {
                data.append('logo', formData.logo);
            }

            const response = await axios.put(`${API_URL}/api/admin/settings`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const updatedData = response.data;
            setFormData({
                name: updatedData.name || '',
                logo: updatedData.logo || '',
                primaryColor: updatedData.primaryColor || '#bef264',
                secondaryColor: updatedData.secondaryColor || '#1a1a1a',
                address: updatedData.address || '',
                phone: updatedData.phone || '',
                email: updatedData.email || '',
            });
            if (updatedData.logo) setPreviewUrl(updatedData.logo);
            setLogoFile(null);
            setSuccess('Settings saved successfully!');
        } catch (err: unknown) {
            console.error('Error saving settings:', err);
            setError('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress sx={{ color: 'var(--primary)' }} /></Box>;
    }

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
                        Gym Settings
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#9CA3AF' }}>
                        Customize your gym&apos;s appearance and contact info
                    </Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={saving ? <RefreshCw className="animate-spin" /> : <Save />}
                    onClick={handleSave}
                    disabled={saving}
                    sx={{
                        backgroundColor: 'var(--primary)',
                        color: 'black',
                        fontWeight: 'bold',
                        '&:hover': { backgroundColor: '#bbe300' }
                    }}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

            <Grid container spacing={3}>
                {/* Branding Section */}
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 3, backgroundColor: '#1E1E1E', border: '1px solid #333' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                            <Palette size={20} color="var(--primary)" />
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>Branding</Typography>
                        </Box>
                        
                        <Grid container spacing={3} alignItems="flex-start">
                            <Grid size={{ xs: 12, md: 3 }}>
                                <Typography variant="caption" sx={{ color: '#9CA3AF', mb: 1, display: 'block' }}>Gym Name</Typography>
                                <TextField
                                    fullWidth
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    sx={{ 
                                        '& .MuiOutlinedInput-root': { 
                                            color: 'white', 
                                            height: 48,
                                            '& fieldset': { borderColor: '#333' } 
                                        } 
                                    }}
                                />
                            </Grid>
                            
                            <Grid size={{ xs: 12, md: 3 }}>
                                <Typography variant="caption" sx={{ color: '#9CA3AF', mb: 1, display: 'block' }}>Logo</Typography>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    fullWidth
                                    startIcon={<ImageIcon size={18} />}
                                    sx={{ 
                                        color: 'white', 
                                        borderColor: '#333',
                                        height: 48,
                                        justifyContent: 'flex-start',
                                        textTransform: 'none',
                                        '&:hover': { borderColor: '#666', backgroundColor: 'rgba(255,255,255,0.05)' } 
                                    }}
                                >
                                    <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {logoFile ? logoFile.name : 'Upload Logo'}
                                    </Box>
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </Button>
                                {previewUrl && (
                                    <Box sx={{ mt: 2, p: 1, border: '1px dashed #444', borderRadius: 1, display: 'inline-block', backgroundColor: '#000' }}>
                                        <img src={previewUrl} alt="Preview" style={{ height: 60, maxWidth: '100%', objectFit: 'contain' }} />
                                    </Box>
                                )}
                            </Grid>

                            <Grid size={{ xs: 12, md: 3 }}>
                                <Typography variant="caption" sx={{ color: '#9CA3AF', mb: 1, display: 'block' }}>Primary Color</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <input 
                                        type="color" 
                                        value={formData.primaryColor} 
                                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                        style={{ width: 48, height: 48, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer', backgroundColor: 'transparent' }}
                                    />
                                    <TextField 
                                        value={formData.primaryColor}
                                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                        sx={{ 
                                            '& .MuiOutlinedInput-root': { 
                                                color: 'white', 
                                                height: 48,
                                                '& fieldset': { borderColor: '#333' } 
                                            } 
                                        }}
                                    />
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 12, md: 3 }}>
                                <Typography variant="caption" sx={{ color: '#9CA3AF', mb: 1, display: 'block' }}>Secondary Color</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <input 
                                        type="color" 
                                        value={formData.secondaryColor} 
                                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                        style={{ width: 48, height: 48, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer', backgroundColor: 'transparent' }}
                                    />
                                    <TextField 
                                        value={formData.secondaryColor}
                                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                        sx={{ 
                                            '& .MuiOutlinedInput-root': { 
                                                color: 'white', 
                                                height: 48,
                                                '& fieldset': { borderColor: '#333' } 
                                            } 
                                        }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Contact Info Section */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, backgroundColor: '#1E1E1E', border: '1px solid #333' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>Contact Info</Typography>
                        </Box>
                        
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    multiline
                                    rows={3}
                                    sx={{ 
                                        '& .MuiInputLabel-root': { color: '#9CA3AF' }, 
                                        '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#333' } } 
                                    }}
                                />
                            </Grid>
                            
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    sx={{ 
                                        '& .MuiInputLabel-root': { color: '#9CA3AF' }, 
                                        '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#333' } } 
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    sx={{ 
                                        '& .MuiInputLabel-root': { color: '#9CA3AF' }, 
                                        '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#333' } } 
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
