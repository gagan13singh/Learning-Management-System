import React, { useState, useEffect } from 'react';
import {
    Box, Drawer, List, ListItem, ListItemIcon, ListItemText,
    Typography, IconButton, Avatar, useTheme, AppBar, Toolbar, Tooltip
} from '@mui/material';
import {
    Dashboard, Class, EventAvailable, Insights,
    Menu, Logout, Settings, Person, Quiz, ChevronLeft, ChevronRight,
    Brightness4, Brightness7, People, School, Assignment, CheckCircle
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useColorMode } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NotificationBell';

const drawerWidth = 260;
const collapsedDrawerWidth = 80;

const Layout = () => {
    const theme = useTheme();
    const { toggleColorMode, mode } = useColorMode();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(() => {
        return localStorage.getItem('sidebarCollapsed') === 'true';
    });

    // Persist collapsed state
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', collapsed);
    }, [collapsed]);

    // Persist last active view
    useEffect(() => {
        localStorage.setItem('lastView', location.pathname);
    }, [location]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleCollapseToggle = () => {
        setCollapsed(!collapsed);
    };

    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/teacher/dashboard' },
        { text: 'Courses', icon: <School />, path: '/teacher/courses' },
        { text: 'Batches', icon: <People />, path: '/teacher/batches' },
        { text: 'Tests', icon: <Assignment />, path: '/teacher/tests' },
        { text: 'Attendance', icon: <CheckCircle />, path: '/teacher/attendance' },
        { text: 'Insights', icon: <Insights />, path: '/teacher/insights' },
        { text: 'Profile', icon: <Person />, path: '/teacher/profile' },
    ];

    const drawerContent = (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: theme.palette.background.paper,
            borderRight: '1px solid rgba(0,0,0,0.05)',
            transition: 'width 0.3s'
        }}>
            <Box sx={{
                p: collapsed ? 2 : 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 2,
                minHeight: 64
            }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: collapsed ? 32 : 40, height: collapsed ? 32 : 40 }}>T</Avatar>
                {!collapsed && (
                    <Typography variant="h6" fontWeight="bold" sx={{ background: theme.palette.gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>
                        Coaching LMS
                    </Typography>
                )}
            </Box>

            <List sx={{ px: 2, flexGrow: 1, mt: 2 }}>
                {menuItems.map((item) => (
                    <Tooltip title={collapsed ? item.text : ""} placement="right" key={item.text}>
                        <ListItem
                            button
                            onClick={() => navigate(item.path)}
                            aria-current={location.pathname === item.path ? 'page' : undefined}
                            sx={{
                                mb: 1,
                                borderRadius: '12px',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                px: collapsed ? 1 : 2,
                                background: location.pathname === item.path ? theme.palette.gradients.primary : 'transparent',
                                color: location.pathname === item.path ? '#fff' : theme.palette.text.primary,
                                '&:hover': {
                                    background: location.pathname === item.path ? theme.palette.gradients.primary : 'rgba(99, 102, 241, 0.1)',
                                },
                                transition: 'all 0.2s'
                            }}
                        >
                            <ListItemIcon sx={{
                                color: location.pathname === item.path ? '#fff' : theme.palette.primary.main,
                                minWidth: collapsed ? 0 : 40,
                                justifyContent: 'center'
                            }}>
                                {item.icon}
                            </ListItemIcon>
                            {!collapsed && (
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
                                />
                            )}
                        </ListItem>
                    </Tooltip>
                ))}
            </List>

            <Box sx={{ p: 2 }}>
                {!collapsed && (
                    <>
                        <ListItem button onClick={toggleColorMode} sx={{ borderRadius: '12px', mb: 1 }}>
                            <ListItemIcon>{mode === 'dark' ? <Brightness7 /> : <Brightness4 />}</ListItemIcon>
                            <ListItemText primary={mode === 'dark' ? "Light Mode" : "Dark Mode"} primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItem>
                        <ListItem button onClick={() => { logout(); navigate('/login'); }} sx={{ borderRadius: '12px', color: theme.palette.error.main, mb: 1 }}>
                            <ListItemIcon sx={{ color: theme.palette.error.main }}><Logout /></ListItemIcon>
                            <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItem>
                    </>
                )}
                {/* Collapse Toggle for Desktop */}
                <Box sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: collapsed ? 'center' : 'flex-end' }}>
                    <IconButton onClick={handleCollapseToggle} size="small">
                        {collapsed ? <ChevronRight /> : <ChevronLeft />}
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', background: theme.palette.background.default }}>
            {/* Top Bar (Mobile & Desktop) */}
            <AppBar
                position="fixed"
                component="header"
                sx={{
                    width: { sm: `calc(100% - ${collapsed ? collapsedDrawerWidth : drawerWidth}px)` },
                    ml: { sm: `${collapsed ? collapsedDrawerWidth : drawerWidth}px` },
                    background: theme.palette.background.paper,
                    boxShadow: 'none',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    color: 'text.primary',
                    transition: 'width 0.3s, margin 0.3s'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <Menu />
                    </IconButton>
                    <Typography variant="h6" noWrap component="h1" fontWeight="bold" sx={{ flexGrow: 1, background: theme.palette.gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Coaching LMS
                    </Typography>
                    <NotificationBell />
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Box
                component="nav"
                aria-label="Sidebar Navigation"
                sx={{ width: { sm: collapsed ? collapsedDrawerWidth : drawerWidth }, flexShrink: { sm: 0 }, transition: 'width 0.3s' }}
            >
                {/* Mobile Drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
                    }}
                >
                    {drawerContent}
                </Drawer>
                {/* Desktop Drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: collapsed ? collapsedDrawerWidth : drawerWidth,
                            border: 'none',
                            background: 'transparent',
                            transition: 'width 0.3s',
                            overflowX: 'hidden'
                        },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${collapsed ? collapsedDrawerWidth : drawerWidth}px)` },
                    mt: 8,
                    transition: 'width 0.3s'
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;
