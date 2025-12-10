import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip
} from '@mui/material';
import {
    Notifications,
    Campaign,
    Assignment,
    EventNote,
    Cancel,
    ArrowForward
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const AnnouncementsWidget = () => {
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const response = await api.get('/announcements');
                setAnnouncements(response.data.data);
            } catch (error) {
                console.error('Error fetching announcements:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'urgent': return <Campaign color="error" />;
            case 'test': return <EventNote color="warning" />;
            case 'notes': return <Assignment color="primary" />;
            case 'class_cancelled': return <Cancel color="error" />;
            default: return <Notifications color="info" />;
        }
    };

    return (
        <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
                <Typography variant="h6" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Campaign sx={{ color: 'primary.main' }} />
                    Announcements
                </Typography>
                <Button
                    endIcon={<ArrowForward />}
                    size="small"
                    sx={{ borderRadius: 2 }}
                    onClick={() => navigate('/student/announcements')}
                >
                    View All
                </Button>
            </Box>

            <CardContent sx={{ p: 0 }}>
                {loading ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>Loading...</Box>
                ) : announcements.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Notifications sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            No active announcements.
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {announcements.slice(0, 3).map((announcement, index) => (
                            <ListItem
                                key={announcement._id}
                                alignItems="flex-start"
                                sx={{
                                    px: 3,
                                    py: 2,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: announcement.priority === 'high' ? 'error.lighter' : 'transparent'
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                                    {getIcon(announcement.type)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="subtitle2" fontWeight="700">
                                                {announcement.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mt: 0.5,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {announcement.message}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </CardContent>
        </Card>
    );
};

export default AnnouncementsWidget;
