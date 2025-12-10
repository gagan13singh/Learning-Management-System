import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    Chip,
    Button,
    Tab,
    Tabs,
    CircularProgress,
    Card,
    CardContent,
    CardActions,
    Divider,
    Alert
} from '@mui/material';
import {
    Assignment,
    CheckCircle,
    Pending,
    Warning,
    AttachFile,
    Description
} from '@mui/icons-material';
import api from '../../utils/api';
import { formatDistanceToNow, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const StudentAssignments = () => {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    const fetchAssignments = async () => {
        try {
            const res = await api.get('/assignments/my-assignments');
            setAssignments(res.data.data);
        } catch (error) {
            console.error('Failed to fetch assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const filteredAssignments = assignments.filter(a => {
        if (tabValue === 0) return a.status === 'pending' || a.status === 'overdue';
        if (tabValue === 1) return a.status === 'submitted' || a.status === 'graded';
        return true;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'submitted': return 'info';
            case 'graded': return 'success';
            case 'overdue': return 'error';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
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
                        My Assignments
                    </Typography>
                    <Typography color="text.secondary">
                        Track and manage your course assignments
                    </Typography>
                </Box>

                <Paper sx={{ mb: 4, borderRadius: 2 }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
                    >
                        <Tab label={`Pending (${assignments.filter(a => a.status === 'pending' || a.status === 'overdue').length})`} />
                        <Tab label={`Completed (${assignments.filter(a => a.status === 'submitted' || a.status === 'graded').length})`} />
                    </Tabs>
                </Paper>

                <Grid container spacing={3}>
                    {filteredAssignments.length > 0 ? (
                        filteredAssignments.map((assignment) => (
                            <Grid item xs={12} md={6} key={assignment._id}>
                                <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Chip
                                                label={assignment.status.toUpperCase()}
                                                color={getStatusColor(assignment.status)}
                                                size="small"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                Course: <b>{assignment.course?.title}</b>
                                            </Typography>
                                        </Box>

                                        <Typography variant="h6" fontWeight="700" gutterBottom>
                                            {assignment.title}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary" paragraph sx={{
                                            display: '-webkit-box',
                                            overflow: 'hidden',
                                            WebkitBoxOrient: 'vertical',
                                            WebkitLineClamp: 3,
                                        }}>
                                            {assignment.description}
                                        </Typography>

                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                                            <Chip
                                                icon={<Pending sx={{ fontSize: 16 }} />}
                                                label={`Due ${formatDistanceToNow(new Date(assignment.dueDate), { addSuffix: true })}`}
                                                variant="outlined"
                                                size="small"
                                                color={new Date(assignment.dueDate) < new Date() && assignment.status !== 'submitted' ? 'error' : 'default'}
                                            />
                                            <Chip
                                                label={`Max Score: ${assignment.maxScore}`}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Box>

                                        {/* Show attachments count if any */}
                                        {assignment.attachments?.length > 0 && (
                                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AttachFile fontSize="small" color="action" />
                                                <Typography variant="caption" color="text.secondary">
                                                    {assignment.attachments.length} attachment(s)
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Show Grade if graded */}
                                        {assignment.status === 'graded' && (
                                            <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 2, color: 'success.contrastText' }}>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    Score: {assignment.submission?.grade} / {assignment.maxScore}
                                                </Typography>
                                                {assignment.submission?.feedback && (
                                                    <Typography variant="caption" display="block" mt={0.5}>
                                                        Feedback: {assignment.submission.feedback}
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                    </CardContent>

                                    <Divider />

                                    <CardActions sx={{ p: 2, justifyContent: 'flex-end' }}>
                                        {(assignment.status === 'pending' || assignment.status === 'overdue') && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<Description />}
                                                onClick={() => {
                                                    // TODO: Implement submission modal
                                                    alert('Submission flow to be implemented');
                                                }}
                                            >
                                                Submit Assignment
                                            </Button>
                                        )}
                                        {assignment.status === 'submitted' && (
                                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                Submitted on {format(new Date(assignment.submission.submittedAt), 'PPP')}
                                            </Typography>
                                        )}
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                                <Description sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">
                                    No {tabValue === 0 ? 'pending' : 'completed'} assignments found.
                                </Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Container>
        </Box>
    );
};

export default StudentAssignments;
