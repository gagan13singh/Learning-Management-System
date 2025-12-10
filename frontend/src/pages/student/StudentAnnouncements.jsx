import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    CircularProgress,
    Card,
    CardContent,
    Avatar,
    Chip
} from '@mui/material';
import { Campaign, Info, Warning, Event } from '@mui/icons-material';
import api from '../../utils/api';
import { formatDistanceToNow } from 'date-fns';

const StudentAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await api.get('/announcements');
                setAnnouncements(res.data.data);
            } catch (error) {
                console.error('Failed to fetch announcements:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    const getTypeIcon = (type) => {
        switch (type) {
            case 'urgent': return <Warning color="error" />;
            case 'event': return <Event color="info" />;
            default: return <Info color="primary" />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'urgent': return 'error.light';
            case 'event': return 'info.light';
            default: return 'background.paper';
        }
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="800" gutterBottom>
                        Announcements
                    </Typography>
                    <Typography color="text.secondary">
                        Updates from your teachers and admins
                    </Typography>
                </Box>

                <Grid container spacing={2}>
                    {announcements.length > 0 ? (
                        announcements.map((announcement) => (
                            <Grid item xs={12} key={announcement._id}>
                                <Card sx={{ borderRadius: 3, borderLeft: 6, borderColor: announcement.type === 'urgent' ? 'error.main' : 'primary.main' }}>
                                    <CardContent sx={{ display: 'flex', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: 'transparent' }}>
                                            {getTypeIcon(announcement.type)}
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                <Typography variant="h6" fontWeight="bold">
                                                    {announcement.title}
                                                </Typography>
                                                <Chip label={formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })} size="small" />
                                            </Box>
                                            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                                                {announcement.message}
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled" sx={{ mt: 2, display: 'block' }}>
                                                Posted by: {announcement.createdBy?.name || 'Admin'}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>No announcements found.</Paper>
                        </Grid>
                    )}
                </Grid>
            </Container>
        </Box>
    );
};

export default StudentAnnouncements;
