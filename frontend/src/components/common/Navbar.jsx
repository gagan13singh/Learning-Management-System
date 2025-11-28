import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Box,
    Divider,
    ListItemIcon,
} from '@mui/material';
import {
    School,
    Dashboard,
    Person,
    Logout,
    Settings,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        handleClose();
    };

    const handleDashboard = () => {
        if (user?.role === 'student') {
            navigate('/student/dashboard');
        } else if (user?.role === 'teacher') {
            navigate('/teacher/dashboard');
        }
        handleClose();
    };

    return (
        <AppBar
            position="sticky"
            elevation={2}
            sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
        >
            <Toolbar>
                <School sx={{ mr: 2, fontSize: 32 }} />
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ flexGrow: 1, fontWeight: 700, cursor: 'pointer' }}
                    onClick={handleDashboard}
                >
                    LMS Platform
                </Typography>

                {user && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {user.name}
                        </Typography>
                        <IconButton onClick={handleMenu} size="small">
                            <Avatar
                                sx={{
                                    bgcolor: 'secondary.main',
                                    width: 40,
                                    height: 40,
                                }}
                            >
                                {user.name.charAt(0).toUpperCase()}
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            PaperProps={{
                                sx: { mt: 1, minWidth: 200 },
                            }}
                        >
                            <Box sx={{ px: 2, py: 1 }}>
                                <Typography variant="subtitle2" fontWeight="600">
                                    {user.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {user.email}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: 'block',
                                        mt: 0.5,
                                        px: 1,
                                        py: 0.5,
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        borderRadius: 1,
                                        textAlign: 'center',
                                        textTransform: 'capitalize',
                                    }}
                                >
                                    {user.role}
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <MenuItem onClick={handleDashboard}>
                                <ListItemIcon>
                                    <Dashboard fontSize="small" />
                                </ListItemIcon>
                                Dashboard
                            </MenuItem>
                            <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                                <ListItemIcon>
                                    <Person fontSize="small" />
                                </ListItemIcon>
                                Profile
                            </MenuItem>
                            <Divider sx={{ my: 1 }} />
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                    <Logout fontSize="small" color="error" />
                                </ListItemIcon>
                                <Typography color="error">Logout</Typography>
                            </MenuItem>
                        </Menu>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
