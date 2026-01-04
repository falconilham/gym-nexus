"use client";

import { Box, Typography, Button, Container } from '@mui/material';
import { Search, Home, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GymNotFound() {
  const router = useRouter();

  const handleGoHome = () => {
    // Redirect to the main portal
    router.push('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F0F0F 0%, #1a1a1a 100%)',
        textAlign: 'center',
        px: 3,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            mb: 4,
            display: 'inline-flex',
            p: 3,
            borderRadius: '50%',
            background: 'rgba(201, 255, 44, 0.1)',
            border: '1px solid rgba(201, 255, 44, 0.2)',
          }}
        >
          <Search size={64} color="#C9FF2C" strokeWidth={1.5} />
        </Box>

        <Typography variant="h2" sx={{ fontWeight: 800, color: 'white', mb: 2, letterSpacing: '-0.02em' }}>
          Gym Not Found
        </Typography>

        <Typography variant="h6" sx={{ color: '#9CA3AF', mb: 5, fontWeight: 400, lineHeight: 1.6 }}>
          We couldn&apos;t find a gym associated with this address. Please check the URL or contact your administrator.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Home size={20} />}
            onClick={handleGoHome}
            sx={{
              backgroundColor: '#C9FF2C',
              color: 'black',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': {
                backgroundColor: '#bbe300',
              },
            }}
          >
            Go to Main Portal
          </Button>

          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={20} />}
            onClick={() => router.back()}
            sx={{
              borderColor: '#333',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': {
                borderColor: '#555',
                backgroundColor: 'rgba(255,255,255,0.05)',
              },
            }}
          >
            Go Back
          </Button>
        </Box>

        <Typography variant="body2" sx={{ color: '#4B5563', mt: 8 }}>
          Powered by GymNexus &bull; Multi-Tenant Gym Management
        </Typography>
      </Container>
    </Box>
  );
}
