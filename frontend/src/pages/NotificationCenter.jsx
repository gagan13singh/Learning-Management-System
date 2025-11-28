import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Button, Chip, IconButton, Tabs, Tab
} from '@mui/material';
import { CheckCircle, Warning, Error as ErrorIcon, Info, Delete } from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';

const NotificationCenter = () => {
    const theme = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchNotifications();
    }, [filter]);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const readParam = filter === 'unread' ? 'false' : filter === 'read' ? 'true' : '';
            const res = await axios.get(`http://localhost:5000/api/notifications?read=${readParam}&limit=100`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/notifications/${notificationId}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/notifications/mark-all-read', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/notifications/${notificationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'alert': return <ErrorIcon color="error" />;
            case 'test': return <Info color="info" />;
            case 'attendance': return <Warning color="warning" />;
            default: return <CheckCircle color="success" />;
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">🔔 Notifications</Typography>
                <Button
                    variant="outlined"
                    onClick={handleMarkAllAsRead}
                    disabled={notifications.filter(n => !n.read).length === 0}
                >
                    Mark All as Read
                </Button>
            </Box>

            {/* Filter Tabs */}
            <Box sx={{ mb: 3 }}>
                <Tabs value={filter} onChange={(e, v) => setFilter(v)}>
                    <Tab label="All" value="all" />
                    <Tab label="Unread" value="unread" />
                    <Tab label="Read" value="read" />
                </Tabs>
            </Box>

            {/* Notifications List */}
            {notifications.length === 0 ? (
                <Card className="glass-card">
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                        <Typography variant="h6">No notifications</Typography>
                        <Typography variant="body2" color="text.secondary">
                            You're all caught up!
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {notifications.map((notification) => (
                        <Card
                            key={notification._id}
                            className="glass-card"
                            sx={{
                                bgcolor: notification.read ? 'transparent' : 'rgba(33, 150, 243, 0.05)',
                                borderLeft: notification.read ? 'none' : '4px solid',
                                borderColor: 'primary.main'
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    {getIcon(notification.type)}
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Typography variant="h6" fontWeight="bold">
                                                {notification.title}
                                            </Typography>
                                            {notification.priority === 'high' && (
                                                <Chip label="High Priority" size="small" color="error" />
                                            )}
                                            {!notification.read && (
                                                <Chip label="New" size="small" color="primary" />
                                            )}
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {notification.message}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {!notification.read && (
                                            <Button
                                                size="small"
                                                onClick={() => handleMarkAsRead(notification._id)}
                                            >
                                                Mark as Read
                                            </Button>
                                        )}
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(notification._id)}
                                            color="error"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default NotificationCenter;
