import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState({
        open: false,
        message: '',
        severity: 'info'
    });

    const showToast = (message, severity = 'info') => {
        setToast({ open: true, message, severity });
    };

    const showSuccess = (message) => showToast(message, 'success');
    const showError = (message) => showToast(message, 'error');
    const showInfo = (message) => showToast(message, 'info');
    const showWarning = (message) => showToast(message, 'warning');

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setToast({ ...toast, open: false });
    };

    return (
        <ToastContext.Provider value={{ showSuccess, showError, showInfo, showWarning }}>
            {children}
            <Snackbar
                open={toast.open}
                autoHideDuration={4000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleClose} severity={toast.severity} sx={{ width: '100%' }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
};
