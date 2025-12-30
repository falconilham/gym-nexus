import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    IconButton
} from '@mui/material';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: 'error' | 'warning' | 'primary';
}

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmColor = 'error'
}: ConfirmDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    backgroundColor: '#1E1E1E',
                    color: 'white',
                    border: '1px solid #333',
                    borderRadius: 3,
                    minWidth: '400px'
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AlertTriangle size={24} color={confirmColor === 'error' ? '#EF4444' : confirmColor === 'warning' ? '#f59e0b' : '#CCFF00'} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{title}</Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ color: '#9CA3AF', '&:hover': { color: 'white' } }}>
                    <X size={24} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Typography variant="body1" sx={{ color: '#D1D5DB' }}>
                    {message}
                </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 3, gap: 2, borderTop: '1px solid #333' }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        color: '#9CA3AF',
                        borderColor: '#333',
                        textTransform: 'none',
                        '&:hover': {
                            borderColor: '#444',
                            backgroundColor: 'rgba(255,255,255,0.05)'
                        }
                    }}
                >
                    {cancelText}
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    sx={{
                        backgroundColor: confirmColor === 'error' ? '#EF4444' : confirmColor === 'warning' ? '#f59e0b' : 'var(--primary)',
                        color: confirmColor === 'primary' ? 'black' : 'white',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        '&:hover': {
                            backgroundColor: confirmColor === 'error' ? '#DC2626' : confirmColor === 'warning' ? '#d97706' : '#bbe300'
                        }
                    }}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
