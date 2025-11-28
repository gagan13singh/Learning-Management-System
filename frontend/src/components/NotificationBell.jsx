import React, { useState, useEffect } from 'react';
import {
    IconButton, Badge, Menu, MenuItem, Typography, Box, Divider, Button, Chip
} from '@mui/material';
import { Notifications, CheckCircle, Warning, Error as ErrorIcon, Info } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchUnreadCount();
        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(() => {
            fetchUnreadCount();
            fetchNotifications();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/notifications/unread-count', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnreadCount(res.data.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/notifications?limit=5', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/notifications/${notificationId}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUnreadCount();
            fetchNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleViewAll = () => {
        handleClose();
        navigate('/notifications');
    };

    const getIcon = (type) => {
        switch (type) {
            case 'alert': return <ErrorIcon fontSize="small" color="error" />;
            case 'test': return <Info fontSize="small" color="info" />;
            case 'attendance': return <Warning fontSize="small" color="warning" />;
            default: return <CheckCircle fontSize="small" color="success" />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            default: return 'default';
        }
    };

    return (
        <>
            <IconButton
                color="inherit"
                onClick={handleClick}
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                aria-controls={Boolean(anchorEl) ? 'notification-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
            >
                <Badge badgeContent={unreadCount} color="error">
                    <Notifications aria-hidden="true" />
                </Badge>
            </IconButton>

            <Menu
                id="notification-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: 360,
                        maxHeight: 500,
                        mt: 1.5
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="h6" fontWeight="bold" component="h2">
                        Notifications
                    </Typography>
                </Box>
                <Divider />

                {notifications.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} aria-hidden="true" />
                        <Typography variant="body2" color="text.secondary" role="status">
                            No notifications
                        </Typography>
                    </Box>
                ) : (
                    notifications.map((notification) => (
                        <MenuItem
                            key={notification._id}
                            onClick={() => handleMarkAsRead(notification._id)}
                            sx={{
                                py: 1.5,
                                px: 2,
                                bgcolor: notification.read ? 'transparent' : 'rgba(33, 150, 243, 0.05)',
                                '&:hover': {
                                    bgcolor: notification.read ? 'action.hover' : 'rgba(33, 150, 243, 0.1)'
                                }
                            }}
                            aria-label={`Mark notification as read: ${notification.title}`}
                        >
                            <Box sx={{ display: 'flex', gap: 1.5, width: '100%' }}>
                                <Box aria-hidden="true">
                                    {getIcon(notification.type)}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <Typography variant="body2" fontWeight="bold" noWrap>
                                            {notification.title}
                                        </Typography>
                                        {notification.priority === 'high' && (
                                            <Chip label="High" size="small" color="error" sx={{ height: 18 }} />
                                        )}
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        {notification.message.substring(0, 60)}...
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>
                        </MenuItem>
                    ))
                )}

                {notifications.length > 0 && (
                    <>
                        <Divider />
                        <Box sx={{ p: 1 }}>
                            <Button fullWidth onClick={handleViewAll} aria-label="View all notifications">
                                View All Notifications
                            </Button>
                        </Box>
                    </>
                )}
            </Menu>
        </>
    );
};

export default NotificationBell;
