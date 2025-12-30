'use client';

import { useState, useEffect, useRef } from 'react';
import { XCircle, CheckCircle, ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Box, Typography, Button, Paper } from '@mui/material';
import axios from 'axios';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface ScanResult {
  type: 'success' | 'error' | 'warning';
  message: string;
  memberName?: string;
  memberInfo?: string;
  reason?: string;
}

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      startScanner();
    }, 500);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      if (scannerRef.current) {
        // Already running or not cleaned up
        await stopScanner();
      }

      const html5QrCode = new Html5Qrcode("reader", { 
        formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ],
        verbose: false
      });
      scannerRef.current = html5QrCode;

      setCameraError(null);
      setIsScanning(true);

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        (errorMessage) => {
          // ignore frames without QR
        }
      );
    } catch (err: any) {
      console.error('Camera error:', err);
      setCameraError(err.message || 'Unable to access camera');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner', err);
      }
      scannerRef.current = null;
    }
  };

  const handleScan = async (data: string | null) => {
    // Prevent multiple calls if already processing
    if (!data || processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    setIsScanning(false);
    
    // Pause checking, effectively stopping the feed for the user logic, 
    // although we might want to keep the camera running in bg for fast restart.
    // For now, let's stop it to match previous UX.
    await stopScanner();

    try {
      // Parse QR code data
      let qrData;
      try {
        qrData = JSON.parse(data);
      } catch (e) {
        throw new Error('Invalid QR Data Format');
      }

      const { memberId } = qrData;

      if (!memberId) {
        setScanResult({
          type: 'error',
          message: 'Invalid QR Code',
          memberInfo: 'QR code does not contain member information',
        });
        return;
      }

      // Call check-in API
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${API_URL}/api/admin/check-in`, { memberId });

      if (response.data.success && response.data.access === 'granted') {
        setScanResult({
          type: 'success',
          message: 'Access Granted',
          memberName: response.data.member.name,
          memberInfo: `${response.data.member.daysRemaining} days remaining`,
        });
      }
    } catch (error: any) {
      if (error.response) {
        const { reason, message, member } = error.response.data;
        
        if (reason === 'suspended') {
          setScanResult({
            type: 'error',
            message: 'Access Denied',
            memberName: member?.name || 'Member',
            memberInfo: 'Membership Suspended',
            reason: 'Please contact administration',
          });
        } else if (reason === 'expired') {
          setScanResult({
            type: 'warning',
            message: 'Access Denied',
            memberName: member?.name || 'Member',
            memberInfo: 'Membership Expired',
            reason: 'Please renew your membership',
          });
        } else if (reason === 'not_found') {
          setScanResult({
            type: 'error',
            message: 'Access Denied',
            memberInfo: 'Member Not Found',
            reason: 'Invalid member ID',
          });
        } else {
          setScanResult({
            type: 'error',
            message: 'Access Denied',
            memberInfo: message || 'Unknown error',
          });
        }
      } else if (error.message === 'Invalid QR Data Format') {
         setScanResult({
            type: 'error',
            message: 'Invalid QR Code',
            memberInfo: 'Could not parse QR data',
         });
      } else {
        setScanResult({
          type: 'error',
          message: 'System Error',
          memberInfo: 'Unable to verify membership',
          reason: 'Please try again',
        });
      }
    } finally {
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  const resetScan = () => {
    setScanResult(null);
    startScanner();
  };

  return (
    <Box sx={{ 
      position: 'fixed', 
      inset: 0, 
      zIndex: 50, 
      backgroundColor: '#0F0F0F', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      p: 4 
    }}>
      {/* Kiosk Header */}
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        p: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        zIndex: 10 
      }}>
         <Button 
            component={Link} 
            href="/" 
            startIcon={<ArrowLeft size={24} />}
            sx={{ 
              color: '#9CA3AF', 
              textTransform: 'none', 
              '&:hover': { color: 'white' } 
            }}
         >
            Exit Kiosk Mode
         </Button>
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                backgroundColor: isScanning ? '#22c55e' : '#6B7280',
                animation: isScanning ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
                '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: .5 }
                }
            }} />
            <Typography variant="caption" sx={{ 
              fontFamily: 'monospace', 
              color: '#9CA3AF', 
              textTransform: 'uppercase', 
              letterSpacing: 2 
            }}>
                {isScanning ? 'Camera Active' : 'Standby'}
            </Typography>
         </Box>
      </Box>

      {/* Main Scanner Container */}
      <Paper sx={{ 
          position: 'relative', 
          width: '100%', 
          maxWidth: 500, 
          aspectRatio: '1/1', 
          backgroundColor: 'black', 
          borderRadius: 6, 
          overflow: 'hidden', 
          border: '2px solid #333', 
          boxShadow: 24 
      }}>
         
         {/* Video or Result */}
         <Box sx={{ 
           position: 'absolute', 
           inset: 0, 
           backgroundColor: '#151515', 
           display: 'flex', 
           alignItems: 'center', 
           justifyContent: 'center' 
         }}>
             {/* This ID is required for Html5Qrcode to mount */}
             <div id="reader" style={{ 
               width: '100%', 
               height: '100%', 
               display: (isScanning && !cameraError) ? 'block' : 'none' 
             }}></div>

            {cameraError ? (
                <Box sx={{ textAlign: 'center', p: 4, position: 'absolute', zIndex: 20 }}>
                     <Box sx={{ mb: 2 }}>⚠️</Box>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>Camera Error</Typography>
                    <Typography sx={{ color: '#9CA3AF', mb: 3 }}>{cameraError}</Typography>
                    <Button 
                      onClick={resetScan}
                      variant="contained"
                      sx={{ 
                        backgroundColor: '#CCFF00', 
                        color: 'black',
                        '&:hover': { backgroundColor: '#bbe300' }
                      }}
                    >
                      Retry
                    </Button>
                </Box>
            ) : isProcessing ? (
                <Box sx={{ textAlign: 'center', position: 'absolute', zIndex: 20 }}>
                    <Box sx={{ 
                      width: 60, 
                      height: 60, 
                      border: '4px solid #333',
                      borderTop: '4px solid #CCFF00',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 16px',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' }
                      }
                    }} />
                    <Typography sx={{ color: '#9CA3AF' }}>Verifying...</Typography>
                </Box>
            ) : scanResult ? (
               // Result View
               <Box sx={{ 
                  textAlign: 'center', 
                  position: 'absolute',
                  zIndex: 20,
                  width: '100%',
                  p: 3,
                  animation: 'zoomIn 0.3s ease-out', 
                  '@keyframes zoomIn': { 
                    from: { opacity: 0, transform: 'scale(0.5)' }, 
                    to: { opacity: 1, transform: 'scale(1)' } 
                  } 
                }}>
                    {scanResult.type === 'success' ? (
                       <CheckCircle size={80} color="#CCFF00" style={{ margin: '0 auto', marginBottom: 16 }} />
                    ) : scanResult.type === 'warning' ? (
                       <AlertTriangle size={80} color="#f59e0b" style={{ margin: '0 auto', marginBottom: 16 }} />
                    ) : (
                       <XCircle size={80} color="#EF4444" style={{ margin: '0 auto', marginBottom: 16 }} />
                    )}

                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>{scanResult.message}</Typography>
                    
                    {scanResult.memberName && (
                      <Typography variant="h5" sx={{ color: scanResult.type === 'success' ? '#CCFF00' : scanResult.type === 'warning' ? '#f59e0b' : '#F87171', mb: 1 }}>
                        {scanResult.memberName}
                      </Typography>
                    )}
                    
                    <Typography variant="body1" sx={{ color: '#9CA3AF' }}>{scanResult.memberInfo}</Typography>
                    
                    {scanResult.reason && (
                      <Typography variant="body2" sx={{ color: '#6B7280', mt: 2 }}>{scanResult.reason}</Typography>
                    )}
                </Box>
            ) : null}

             {/* Overlay Scan UI (Only show when scanning) */}
             {isScanning && !scanResult && !isProcessing && (
                <>
                  <Box sx={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '70%',
                    height: '70%',
                    border: '2px solid #CCFF00',
                    borderRadius: 2,
                    pointerEvents: 'none',
                    zIndex: 10
                  }}>
                    <Box sx={{ 
                      position: 'absolute', 
                      left: 0, 
                      right: 0, 
                      height: 2, 
                      backgroundColor: '#CCFF00', 
                      boxShadow: '0 0 10px #CCFF00',
                      animation: 'scanLine 2s linear infinite',
                      '@keyframes scanLine': {
                        '0%': { top: 0 },
                        '50%': { top: '100%' },
                        '100%': { top: 0 }
                      }
                    }} />
                  </Box>
                  <Typography sx={{ 
                    position: 'absolute',
                    bottom: 40,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    color: '#6B7280', 
                    fontWeight: 500,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    py: 2,
                    zIndex: 10
                  }}>
                    Position QR Code within frame
                  </Typography>
                </>
             )}
         </Box>

         {/* Overlay UI Footer */}
         <Box sx={{ 
           position: 'absolute', 
           bottom: 0, 
           width: '100%', 
           p: 4, 
           background: 'linear-gradient(to top, black, rgba(0,0,0,0.8), transparent)', 
           textAlign: 'center',
           zIndex: 30 
         }}>
             {scanResult && (
                <Button 
                    onClick={resetScan}
                    fullWidth
                    variant="contained"
                    sx={{ 
                        py: 2, 
                        backgroundColor: '#CCFF00', 
                        color: 'black', 
                        fontWeight: 'bold', 
                        fontSize: '1.25rem', 
                        borderRadius: 3, 
                        boxShadow: '0 10px 15px -3px rgba(204, 255, 0, 0.2)',
                        textTransform: 'none',
                        '&:hover': { backgroundColor: '#bbe300' },
                        '&:active': { transform: 'scale(0.98)' }
                    }}
                >
                    Scan Next Member
                </Button>
             )}
         </Box>

      </Paper>

      <Box sx={{ mt: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 1 }}>
         <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1, color: 'white' }}>
            GYM<Box component="span" sx={{ color: '#CCFF00' }}>NEXUS</Box>
         </Typography>
         <Typography variant="caption" sx={{ color: '#6B7280', textTransform: 'uppercase', letterSpacing: 4 }}>
           Access Control Terminal 01
         </Typography>
      </Box>

    </Box>
  );
}
