"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fitflow-backend.vercel.app';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/super-admin/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const { admin } = response.data;
        
        if (admin.role !== 'super_admin') {
            setError('Access Denied. You are not a Super Admin.');
            setLoading(false);
            return;
        }

        // Store admin info in localStorage
        localStorage.setItem('admin', JSON.stringify(admin));
        
        // Redirect to Super Admin Dashboard
        router.push('/super-admin');
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
        background: 'linear-gradient(135deg, #0F0F0F 0%, #3a0000 100%)', // Red tint for Super Admin
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
          <Box
            sx={{
              display: 'inline-flex',
              p: 2,
              borderRadius: 3,
              backgroundColor: 'rgba(239, 68, 68, 0.1)', // Red
              mb: 2,
            }}
          >
            <ShieldCheck size={48} color="#EF4444" />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
            Super Admin
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
            Restricted Access Portal
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
            placeholder="Super Admin Email"
            sx={{
              mb: 3,
              '& .MuiInputLabel-root': { color: '#9CA3AF' },
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: '#333' },
                '&:hover fieldset': { borderColor: '#555' },
                '&.Mui-focused fieldset': { borderColor: '#EF4444' }, // Red focus
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
                '&.Mui-focused fieldset': { borderColor: '#EF4444' },
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
              backgroundColor: '#EF4444',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1rem',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#DC2626',
              },
              '&:disabled': {
                backgroundColor: '#555',
                color: '#999',
              },
            }}
          >
            {loading ? 'Authenticating...' : 'Access Portal'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
