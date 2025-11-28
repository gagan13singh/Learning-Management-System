import React, { createContext, useState, useMemo, useEffect, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import getTheme from '../theme';

const ThemeContext = createContext();

export const useColorMode = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light');

    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
            mode,
        }),
        [mode]
    );

    const theme = useMemo(() => getTheme(mode), [mode]);

    return (
        <ThemeContext.Provider value={colorMode}>
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};
