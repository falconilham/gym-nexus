'use client';

import { useState, useEffect, useRef } from 'react';
import { XCircle, CheckCircle, ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Box, Typography, Button, Paper, Dialog, DialogTitle, DialogContent, TextField, List, ListItem, ListItemAvatar, Avatar, ListItemText, Chip, IconButton } from '@mui/material';
import { Search, User, Keyboard } from 'lucide-react';
import axios from 'axios';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useTenantUrl } from '@/hooks/useTenantUrl';

interface ScanResult {
  type: 'success' | 'error' | 'warning';
  message: string;
  memberName?: string;
  memberInfo?: string;
  reason?: string;
}

export default function ScannerPage() {
  const { getUrl } = useTenantUrl();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);

  // Manual Check-in State
  const [showManual, setShowManual] = useState(false);
  const [manualSearch, setManualSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]); // Using any for member object flexibility
  const [manualLoading, setManualLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

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
    } catch (err: unknown) {
      console.error('Camera error:', err);
      const error = err as { message?: string };
      setCameraError(error.message || 'Unable to access camera');
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

      const { userId, gymId, membershipId } = qrData;

      if (!userId || !gymId || !membershipId) {
        setScanResult({
          type: 'error',
          message: 'Invalid QR Code',
          memberInfo: 'QR code is missing required information',
        });
        return;
      }

      // Call check-in API
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${API_URL}/api/admin/check-in`, { 
        userId, 
        gymId, 
        membershipId 
      });

      if (response.data.success && response.data.access === 'granted') {
        const isCheckout = response.data.type === 'checkout';
        
        setScanResult({
          type: 'success',
          message: isCheckout ? 'Checked Out' : 'Access Granted',
          memberName: response.data.member.name,
          memberInfo: isCheckout 
            ? 'Thank you for visiting!' 
            : `${response.data.member.daysRemaining} days remaining`,
        });
      }
    } catch (error: unknown) {
      const err = error as { 
          response?: { 
              data: { 
                  reason?: string; 
                  message?: string; 
                  member?: { name: string } 
              } 
          }; 
          message?: string;
      };

      if (err.response) {
        const { reason, message, member } = err.response.data;
        
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
            memberInfo: 'Membership Not Found',
            reason: 'Invalid membership for this gym',
          });
        } else if (reason === 'wrong_gym') {
          setScanResult({
            type: 'error',
            message: 'Wrong Gym',
            memberInfo: 'This QR code is for a different gym',
            reason: 'Please use the correct gym\'s scanner',
          });
        } else {
          setScanResult({
            type: 'error',
            message: 'Access Denied',
            memberInfo: message || 'Unknown error',
          });
        }
      } else if (err.message === 'Invalid QR Data Format') {
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
            href={getUrl('/')} 
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
          <Button
            onClick={() => setShowManual(true)}
            startIcon={<Keyboard size={18} />}
            sx={{ 
                mt: 2, 
                color: '#6B7280', 
                textTransform: 'none',
                borderColor: '#333',
                '&:hover': { color: 'white', backgroundColor: 'transparent' } 
            }}
          >
            Manual Check-In
          </Button>
       </Box>

       {/* Manual Check-In Dialog */}
       <Dialog 
        open={showManual} 
        onClose={() => { setShowManual(false); setSelectedMember(null); }}
        PaperProps={{
            sx: {
                backgroundColor: '#1E1E1E',
                color: 'white',
                border: '1px solid #333',
                borderRadius: 3,
                width: '100%',
                maxWidth: 450
            }
        }}
       >
        <DialogTitle sx={{ borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedMember && (
                <IconButton onClick={() => setSelectedMember(null)} size="small" sx={{ color: '#9CA3AF' }}>
                    <ArrowLeft size={20} />
                </IconButton>
            )}
            {selectedMember ? 'Verify Member' : 'Manual Check-In'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
            {!selectedMember ? (
                // SEARCH VIEW
                <>
                <Box sx={{ display: 'flex', gap: 1, mb: 3, mt: 1 }}>
                    <TextField
                        fullWidth
                        placeholder="Search by email or phone..."
                        value={manualSearch}
                        onChange={(e) => setManualSearch(e.target.value)}
                        variant="outlined"
                        size="small"
                        InputProps={{
                            sx: { color: 'white', backgroundColor: '#252525', borderRadius: 1 },
                            startAdornment: <Search size={18} color="#6B7280" style={{ marginRight: 8 }} />
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setManualLoading(true);
                                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                                axios.get(`${API_URL}/api/admin/members`, { params: { search: manualSearch } })
                                    .then(res => {
                                        setSearchResults(res.data);
                                        setManualLoading(false);
                                    })
                                    .catch(err => {
                                        console.error(err);
                                        setManualLoading(false);
                                    });
                            }
                        }}
                    />
                    <Button 
                        variant="contained" 
                        onClick={() => {
                            setManualLoading(true);
                            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                            axios.get(`${API_URL}/api/admin/members`, { params: { search: manualSearch } })
                                .then(res => {
                                    setSearchResults(res.data);
                                    setManualLoading(false);
                                })
                                .catch(err => {
                                    console.error(err);
                                    setManualLoading(false);
                                });
                        }}
                        sx={{ backgroundColor: '#CCFF00', color: 'black', fontWeight: 'bold' }}
                    >
                        Search
                    </Button>
                </Box>

                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {manualLoading ? (
                        <Typography sx={{ textAlign: 'center', color: '#6B7280', py: 2 }}>Searching...</Typography>
                    ) : searchResults.length > 0 ? (
                        searchResults.map((member: any) => (
                            <ListItem 
                                key={member.id}
                                secondaryAction={
                                    <Button 
                                        size="small" 
                                        variant="outlined"
                                        onClick={() => setSelectedMember(member)}
                                        sx={{ 
                                            color: '#CCFF00', 
                                            borderColor: '#CCFF00',
                                            '&:hover': { backgroundColor: 'rgba(204, 255, 0, 0.1)', borderColor: '#CCFF00' }
                                        }}
                                    >
                                        View
                                    </Button>
                                }
                                sx={{ borderBottom: '1px solid #333' }}
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: '#333' }} src={member.memberPhoto || member.User?.memberPhoto}>
                                        <User size={18} />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText 
                                    primary={member.User?.name || 'Unknown'} 
                                    secondary={member.User?.email}
                                    primaryTypographyProps={{ sx: { color: 'white' } }}
                                    secondaryTypographyProps={{ sx: { color: '#9CA3AF', fontSize: '0.75rem' } }}
                                />
                            </ListItem>
                        ))
                    ) : (
                        <Typography sx={{ textAlign: 'center', color: '#6B7280', py: 2 }}>
                            {manualSearch ? 'No members found' : 'Enter email or phone to search'}
                        </Typography>
                    )}
                </List>
                </>
            ) : (
                // DETAIL VIEW
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                        sx={{ width: 120, height: 120, bgcolor: '#333', border: '2px solid #CCFF00' }}
                        src={selectedMember.memberPhoto || selectedMember.User?.memberPhoto}
                    >
                        <User size={60} />
                    </Avatar>
                    
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
                            {selectedMember.User?.name || 'Unknown'}
                        </Typography>
                        <Chip 
                            label={selectedMember.status} 
                            size="small"
                            sx={{ mt: 1, backgroundColor: selectedMember.status === 'Active' ? 'rgba(20, 83, 45, 0.3)' : 'rgba(127, 29, 29, 0.3)', color: selectedMember.status === 'Active' ? '#4ade80' : '#f87171' }}
                        />
                    </Box>

                    <Box sx={{ width: '100%', backgroundColor: '#252525', p: 2, borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 1 }}>
                            <strong>Email:</strong> {selectedMember.User?.email}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                            <strong>Phone:</strong> {selectedMember.User?.phone || 'N/A'}
                        </Typography>
                    </Box>

                   <Box sx={{ display: 'flex', gap: 2, width: '100%', mt: 2 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setSelectedMember(null)}
                            sx={{ color: '#EF4444', borderColor: '#EF4444' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => {
                                setShowManual(false);
                                setSelectedMember(null);
                                handleScan(JSON.stringify({
                                    userId: selectedMember.userId,
                                    gymId: selectedMember.gymId,
                                    membershipId: selectedMember.id
                                }));
                            }}
                            sx={{ backgroundColor: '#CCFF00', color: 'black', fontWeight: 'bold' }}
                        >
                            Confirm Check-In
                        </Button>
                   </Box>
                </Box>
            )}
        </DialogContent>
       </Dialog>

    </Box>
  );
}
