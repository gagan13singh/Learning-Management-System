import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Chip,
    Button,
    Box,
    Divider,
    IconButton
} from '@mui/material';
import {
    Assignment,
    CheckCircle,
    AccessTime,
    ArrowForward
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import api from '../../utils/api';

const AssignmentsPanel = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await api.get('/assignments/my-pending');
                setAssignments(response.data.data);
            } catch (error) {
                console.error('Error fetching assignments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, []);

    const getSubjectColor = (subject) => {
        const colors = {
            'Physics': '#e91e63',
            'Maths': '#2196f3',
            'Chemistry': '#4caf50',
            'Biology': '#ff9800',
            'English': '#9c27b0'
        };
        return colors[subject] || '#757575';
    };

    return (
        <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                        <Assignment sx={{ fontSize: 18, color: 'primary.main' }} />
                    </Avatar>
                    <Typography variant="h6" fontWeight="700">
                        Assignments
                    </Typography>
                </Box>
                <Chip
                    label={`${assignments.length} Pending`}
                    color={assignments.length > 0 ? "warning" : "success"}
                    size="small"
                    sx={{ fontWeight: 600, borderRadius: 2 }}
                />
            </Box>

            <CardContent sx={{ p: 0 }}>
                {loading ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>Loading...</Box>
                ) : assignments.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <CheckCircle sx={{ fontSize: 48, color: 'success.light', mb: 1, opacity: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                            No pending assignments!
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {assignments.slice(0, 4).map((assignment, index) => (
                            <Box key={assignment._id}>
                                <ListItem alignItems="flex-start" sx={{ px: 2.5, py: 2 }}>
                                    <ListItemAvatar>
                                        <Avatar
                                            variant="rounded"
                                            sx={{
                                                bgcolor: `${getSubjectColor(assignment.subject)}15`,
                                                color: getSubjectColor(assignment.subject),
                                                width: 48,
                                                height: 48,
                                                borderRadius: 3
                                            }}
                                        >
                                            {assignment.subject?.[0] || 'A'}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="subtitle2" fontWeight="700" noWrap sx={{ maxWidth: '70%' }}>
                                                    {assignment.title}
                                                </Typography>
                                                <Typography variant="caption" color="error.main" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <AccessTime sx={{ fontSize: 12 }} />
                                                    {formatDistanceToNow(new Date(assignment.dueDate), { addSuffix: true })}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
                                                    {assignment.subject} • {assignment.type}
                                                </Typography>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ borderRadius: 2, textTransform: 'none', py: 0.2, fontSize: '0.75rem' }}
                                                >
                                                    Submit Now
                                                </Button>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                {index < assignments.length - 1 && <Divider component="li" variant="inset" />}
                            </Box>
                        ))}
                    </List>
                )}
                <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                        fullWidth
                        endIcon={<ArrowForward />}
                        sx={{ borderRadius: 3, py: 1, color: 'text.secondary' }}
                    >
                        View All Assignments
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default AssignmentsPanel;
