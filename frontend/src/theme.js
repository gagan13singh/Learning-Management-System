import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => createTheme({
    palette: {
        mode,
        primary: {
            main: '#4f46e5', // Darker indigo for better contrast
            light: '#818cf8',
            dark: '#3730a3',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#db2777', // Darker pink
            light: '#f472b6',
            dark: '#be185d',
            contrastText: '#ffffff',
        },
        error: {
            main: '#dc2626',
            light: '#ef4444',
            dark: '#b91c1c',
            contrastText: '#ffffff',
        },
        warning: {
            main: '#d97706',
            light: '#f59e0b',
            dark: '#b45309',
            contrastText: '#ffffff',
        },
        info: {
            main: '#2563eb',
            light: '#3b82f6',
            dark: '#1d4ed8',
            contrastText: '#ffffff',
        },
        success: {
            main: '#16a34a',
            light: '#22c55e',
            dark: '#15803d',
            contrastText: '#ffffff',
        },
        background: {
            default: mode === 'light' ? '#f8fafc' : '#0f172a',
            paper: mode === 'light' ? '#ffffff' : '#1e293b',
            glass: mode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)', // Increased opacity for readability
        },
        text: {
            primary: mode === 'light' ? '#0f172a' : '#f8fafc', // Higher contrast
            secondary: mode === 'light' ? '#475569' : '#cbd5e1',
        },
        gradients: {
            primary: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            secondary: 'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
            glass: mode === 'light'
                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 100%)'
                : 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(30, 41, 59, 0.2) 100%)',
        }
    },
    typography: {
        fontFamily: '"Poppins", "Inter", "Roboto", sans-serif',
        h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
        h2: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.3 },
        h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.3 },
        h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
        h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
        h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
        button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.02em' },
        body1: { lineHeight: 1.6 },
        body2: { lineHeight: 1.6 },
    },
    shape: {
        borderRadius: 16,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollBehavior: 'smooth',
                },
                // Global focus styles
                '*:focus-visible': {
                    outline: '2px solid #4f46e5',
                    outlineOffset: '2px',
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: '12px 24px', // Larger touch target
                    fontSize: '0.95rem',
                    minHeight: '48px', // Accessibility requirement
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    '&:focus-visible': {
                        boxShadow: '0 0 0 4px rgba(79, 70, 229, 0.4)',
                    }
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                },
                containedSecondary: {
                    background: 'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    padding: 12, // Ensure 48px touch target
                    '&:focus-visible': {
                        outline: '2px solid #4f46e5',
                        outlineOffset: '2px',
                    }
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 20,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    background: mode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)',
                    backdropFilter: 'blur(12px)',
                    border: mode === 'light' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                }
            }
        }
    },
});

export default getTheme;
