import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => createTheme({
    palette: {
        mode,
        primary: {
            main: '#6366f1', // Vibrant Indigo
            light: '#818cf8',
            dark: '#4338ca',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#10b981', // Emerald - Fresh and Focus-inducing
            light: '#34d399',
            dark: '#059669',
            contrastText: '#ffffff',
        },
        background: {
            default: mode === 'light' ? '#f8fafc' : '#0f172a',
            paper: mode === 'light' ? '#ffffff' : '#1e293b',
            subtle: mode === 'light' ? '#f1f5f9' : '#334155',
        },
        text: {
            primary: mode === 'light' ? '#1e293b' : '#f8fafc', // Slate 800
            secondary: mode === 'light' ? '#64748b' : '#94a3b8', // Slate 500
        },
        error: {
            main: '#ef4444',
        },
        warning: {
            main: '#f59e0b',
        },
        success: {
            main: '#10b981',
        },
        info: {
            main: '#3b82f6',
        },
        action: {
            hover: mode === 'light' ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.15)',
            selected: mode === 'light' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.25)',
        },
        gradients: {
            primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', // Indigo to Violet
            secondary: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald
            glass: mode === 'light'
                ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.5) 100%)'
                : 'linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(30, 41, 59, 0.5) 100%)',
        },
    },
    typography: {
        fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
        h1: { fontWeight: 800, letterSpacing: '-0.025em', fontSize: '2.5rem' },
        h2: { fontWeight: 700, letterSpacing: '-0.025em', fontSize: '2rem' },
        h3: { fontWeight: 700, letterSpacing: '-0.025em', fontSize: '1.75rem' },
        h4: { fontWeight: 600, letterSpacing: '-0.025em', fontSize: '1.5rem' },
        h5: { fontWeight: 600, letterSpacing: '-0.015em', fontSize: '1.25rem' },
        h6: { fontWeight: 600, fontSize: '1rem' },
        body1: { fontSize: '1rem', lineHeight: 1.6 },
        body2: { fontSize: '0.875rem', lineHeight: 1.5 },
        button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: mode === 'light' ? '#cbd5e1 #f1f5f9' : '#475569 #1e293b',
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                        backgroundColor: mode === 'light' ? '#f1f5f9' : '#1e293b',
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        borderRadius: 8,
                        backgroundColor: mode === 'light' ? '#cbd5e1' : '#475569',
                        minHeight: 24,
                        border: mode === 'light' ? '3px solid #f1f5f9' : '3px solid #1e293b',
                    },
                    "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
                        backgroundColor: mode === 'light' ? '#94a3b8' : '#64748b',
                    },
                    "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
                        backgroundColor: mode === 'light' ? '#94a3b8' : '#64748b',
                    },
                    "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: mode === 'light' ? '#94a3b8' : '#64748b',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '8px 20px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #6366f1 0%, #5d5dff 100%)',
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                    '&:hover': {
                        boxShadow: '0 6px 16px rgba(99, 102, 241, 0.4)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: mode === 'light'
                        ? '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 16px -4px rgba(0, 0, 0, 0.02)'
                        : '0 0 0 1px rgba(255, 255, 255, 0.05), 0 4px 20px rgba(0, 0, 0, 0.25)',
                    transition: 'all 0.3s ease-in-out',
                    border: mode === 'light' ? '1px solid rgba(226, 232, 240, 0.8)' : 'none',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: mode === 'light'
                            ? '0 12px 24px -8px rgba(0, 0, 0, 0.08), 0 4px 8px -4px rgba(0, 0, 0, 0.04)'
                            : '0 8px 32px rgba(0, 0, 0, 0.35)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                        backgroundColor: mode === 'light' ? '#ffffff' : 'rgba(30, 41, 59, 0.5)',
                        transition: 'all 0.2s',
                        '& fieldset': {
                            borderColor: mode === 'light' ? '#e2e8f0' : '#334155',
                        },
                        '&:hover fieldset': {
                            borderColor: '#818cf8',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#6366f1',
                            borderWidth: 2,
                        },
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 600,
                },
                colorPrimary: {
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    color: '#6366f1',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                },
                colorSuccess: {
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#059669',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                },
                colorWarning: {
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    color: '#d97706',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                },
                colorError: {
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#dc2626',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                }
            },
        },
    },
});

export default getTheme;
