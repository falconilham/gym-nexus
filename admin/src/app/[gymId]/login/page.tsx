"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Dumbbell } from 'lucide-react';
import axios from 'axios';
import { useTenantUrl } from '@/hooks/useTenantUrl';

interface GymConfig {
    name: string;
    logo?: string;
    primaryColor?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const params = useParams(); // params.gymId should be available
  const { getUrl } = useTenantUrl();
  const [gymConfig, setGymConfig] = useState<GymConfig | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (params.gymId) {
        axios.get(`${API_URL}/api/client/config?gymId=${params.gymId}`)
            .then(res => {
                setGymConfig(res.data);
                if (res.data.primaryColor) {
                    document.documentElement.style.setProperty('--primary', res.data.primaryColor);
                }
            })
            .catch(err => {
                const error = err as { response?: { data?: { error?: string } } };
                console.error('Failed to load gym config:', error.response?.data?.error)
            });
    }
  }, [params.gymId]);

  const handleLogin = async (e: React.FormEvent) => {
    // ... existing handleLogin logic ...
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, {
        email,
        password,
      });
      console.log({response})
      if (response.data.success) {
        const { admin } = response.data;
        
        // Store admin info in localStorage
        localStorage.setItem('admin', JSON.stringify(admin));
        
        // Redirect based on role
        if (admin.role === 'super_admin') {
          router.push('/super-admin');
        } else {
          // Redirect to the dashboard of the current gym context using tenant-aware URL
          router.push(getUrl('/'));
        }
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F0F0F 0%, #1a1a1a 100%)',
        padding: 3,
      }}
    >
      <Paper
        elevation={24}
        sx={{
          maxWidth: 450,
          width: '100%',
          p: 4,
          backgroundColor: '#1E1E1E',
          border: '1px solid #333',
          borderRadius: 3,
        }}
      >
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {gymConfig?.logo ? (
             <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
               <img 
                 src={gymConfig.logo} 
                 alt={gymConfig.name || "Gym Logo"} 
                 style={{ maxHeight: 80, maxWidth: '100%', objectFit: 'contain' }} 
               />
             </Box>
          ) : (
             <Box
                sx={{
                display: 'inline-flex',
                p: 2,
                borderRadius: 3,
                backgroundColor: 'rgba(201, 255, 44, 0.1)',
                mb: 2,
                }}
            >
                <Dumbbell size={48} color="var(--primary)" />
            </Box>
          )}
         
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
            {gymConfig?.name || 'GymNexus Admin'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
            Sign in to manage your gym
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, backgroundColor: '#7f1d1d', color: '#fca5a5' }}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
            sx={{
              mb: 3,
              '& .MuiInputLabel-root': { color: '#9CA3AF' },
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: '#333' },
                '&:hover fieldset': { borderColor: '#555' },
                '&.Mui-focused fieldset': { borderColor: 'var(--primary)' },
              },
              '& .MuiOutlinedInput-input': {
                '&::placeholder': {
                  color: '#6B7280',
                  opacity: 1,
                },
              },
            }}
          />

          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
            sx={{
              mb: 4,
              '& .MuiInputLabel-root': { color: '#9CA3AF' },
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: '#333' },
                '&:hover fieldset': { borderColor: '#555' },
                '&.Mui-focused fieldset': { borderColor: 'var(--primary)' },
              },
              '& .MuiOutlinedInput-input': {
                '&::placeholder': {
                  color: '#6B7280',
                  opacity: 1,
                },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: 'white' }}
                  >
                    {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              backgroundColor: 'var(--primary)',
              color: 'black',
              fontWeight: 'bold',
              fontSize: '1rem',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#bbe300',
              },
              '&:disabled': {
                backgroundColor: '#555',
                color: '#999',
              },
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
