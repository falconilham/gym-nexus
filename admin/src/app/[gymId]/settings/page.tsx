"use client";

import { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, TextField, Button, Grid, 
    Alert, CircularProgress, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { Save, RefreshCw, Palette, Image as ImageIcon, Globe, Phone } from 'lucide-react';
import axios from 'axios';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
    const { t, i18n } = useTranslation();
    const [currentLang, setCurrentLang] = useState(i18n.language || 'en');

    const changeLanguage = (event: React.MouseEvent<HTMLElement>, newLang: string) => {
        if (newLang !== null) {
            i18n.changeLanguage(newLang);
            setCurrentLang(newLang);
        }
    };

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [imageError, setImageError] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        logo: '',
        primaryColor: '#bef264',
        secondaryColor: '#1a1a1a',
        address: '',
        phone: '',
        email: '',
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gym-nexus-backend.vercel.app';

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
            setImageError(false);
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
            setSuccess(t('settings.success'));
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
                        {t('settings.title')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#9CA3AF' }}>
                        {t('settings.subtitle')}
                    </Typography>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

            <Grid container spacing={3}>
                {/* Branding Section */}
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 3, backgroundColor: '#1E1E1E', border: '1px solid #333' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                            <Palette size={20} color="var(--primary)" />
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>{t('settings.branding')}</Typography>
                        </Box>
                        
                        <Grid container spacing={3} alignItems="flex-start">
                            <Grid size={{ xs: 12, md: 3 }}>
                                <Typography variant="caption" sx={{ color: '#9CA3AF', mb: 1, display: 'block' }}>{t('settings.gym_name')}</Typography>
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
                                <Typography variant="caption" sx={{ color: '#9CA3AF', mb: 1, display: 'block' }}>{t('settings.logo')}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    {(previewUrl && !imageError) ? (
                                        <Box sx={{ 
                                            width: 48, 
                                            height: 48, 
                                            borderRadius: 2, 
                                            overflow: 'hidden', 
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            border: '1px solid #333',
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <Image 
                                                src={previewUrl} 
                                                alt="Preview" 
                                                width={40} 
                                                height={40} 
                                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                onError={() => setImageError(true)}
                                            />
                                        </Box>
                                    ) : (
                                        <Box sx={{ width: 48, height: 48, borderRadius: 2, backgroundColor: '#252525', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <ImageIcon size={20} color="#666" />
                                        </Box>
                                    )}
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        fullWidth
                                        startIcon={<ImageIcon size={18} />}
                                        sx={{ 
                                            color: 'white', 
                                            borderColor: '#333',
                                            height: 48,
                                            flex: 1,
                                            textTransform: 'none',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            '&:hover': { borderColor: '#666', backgroundColor: 'rgba(255,255,255,0.05)' } 
                                        }}
                                    >
                                        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {logoFile ? logoFile.name : t('settings.upload_logo')}
                                        </Box>
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </Button>
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 12, md: 3 }}>
                                <Typography variant="caption" sx={{ color: '#9CA3AF', mb: 1, display: 'block' }}>{t('settings.primary_color')}</Typography>
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
                                <Typography variant="caption" sx={{ color: '#9CA3AF', mb: 1, display: 'block' }}>{t('settings.secondary_color')}</Typography>
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
                    <Paper sx={{ p: 3, backgroundColor: '#1E1E1E', border: '1px solid #333', height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                            <Phone size={20} color="var(--primary)" />
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>{t('settings.contact_info')}</Typography>
                        </Box>
                        
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label={t('settings.address')}
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
                                    label={t('settings.phone')}
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
                                    label={t('settings.email')}
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

                {/* Preferences Section */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, backgroundColor: '#1E1E1E', border: '1px solid #333', height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                            <Globe size={20} color="var(--primary)" />
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>{t('settings.preferences')}</Typography>
                        </Box>
                        
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" sx={{ color: '#9CA3AF', mb: 1, display: 'block' }}>{t('settings.language')}</Typography>
                                <ToggleButtonGroup
                                    value={currentLang}
                                    exclusive
                                    onChange={changeLanguage}
                                    aria-label="language selector"
                                    size="small"
                                    sx={{
                                        '& .MuiToggleButton-root': {
                                            color: '#6B7280',
                                            borderColor: '#333',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            px: 3,
                                            py: 1,
                                            '&.Mui-selected': {
                                                color: 'black !important',
                                                backgroundColor: 'var(--primary) !important',
                                                '&:hover': { backgroundColor: '#bbe300 !important' }
                                            },
                                            '&:hover': {
                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                                color: 'white'
                                            }
                                        }
                                    }}
                                >
                                    <ToggleButton value="en">English</ToggleButton>
                                    <ToggleButton value="id">Indonesia</ToggleButton>
                                </ToggleButtonGroup>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            {/* Save Button */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                    variant="contained" 
                    size="large"
                    startIcon={saving ? <RefreshCw className="animate-spin" /> : <Save />}
                    onClick={handleSave}
                    disabled={saving}
                    sx={{
                        backgroundColor: 'var(--primary)',
                        color: 'black',
                        fontWeight: 'bold',
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        '&:hover': { backgroundColor: '#bbe300' }
                    }}
                >
                    {saving ? t('settings.saving') : t('settings.save_btn')}
                </Button>
            </Box>
        </Box>
    );
}
