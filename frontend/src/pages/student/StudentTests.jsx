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
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    LinearProgress
} from '@mui/material';
import {
    Quiz,
    Event,
    CheckCircle,
    Timer,
    History
} from '@mui/icons-material';
import api from '../../utils/api';
import { format, formatDistanceToNow } from 'date-fns';

const StudentTests = () => {
    const [upcomingTests, setUpcomingTests] = useState([]);
    const [pastResults, setPastResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    const fetchData = async () => {
        try {
            const [upcomingRes, resultsRes] = await Promise.all([
                api.get('/tests'),
                api.get('/tests/my-results')
            ]);
            setUpcomingTests(upcomingRes.data.data || []);
            setPastResults(resultsRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch tests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
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
                        Exams & Quizzes
                    </Typography>
                    <Typography color="text.secondary">
                        View your upcoming test schedule and past performance
                    </Typography>
                </Box>

                <Paper sx={{ mb: 4, borderRadius: 2 }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
                    >
                        <Tab label={`Upcoming (${upcomingTests.length})`} icon={<Event fontSize="small" />} iconPosition="start" />
                        <Tab label="Results & History" icon={<History fontSize="small" />} iconPosition="start" />
                    </Tabs>
                </Paper>

                {tabValue === 0 ? (
                    <Grid container spacing={3}>
                        {upcomingTests.length > 0 ? (
                            upcomingTests.map((test) => (
                                <Grid item xs={12} md={6} key={test._id}>
                                    <Card sx={{ borderRadius: 3, height: '100%', transition: '0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                                                    <Quiz />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="h6" fontWeight="700">
                                                        {test.title}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {test.course?.title}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Divider sx={{ my: 2 }} />

                                            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Event color="action" fontSize="small" />
                                                    <Typography variant="body2">
                                                        {format(new Date(test.date), 'PPP p')}
                                                    </Typography>
                                                </Box>
                                                {test.duration && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Timer color="action" fontSize="small" />
                                                        <Typography variant="body2">
                                                            {test.duration} mins
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>

                                            <Box sx={{ mt: 2 }}>
                                                {/* Start logic would go here if online test window is open */}
                                                <Button variant="outlined" fullWidth disabled={new Date(test.date) > new Date()}>
                                                    {new Date(test.date) > new Date() ? 'Not Started Yet' : 'Start/View Test'}
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))
                        ) : (
                            <Grid item xs={12}>
                                <Paper sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography color="text.secondary">No upcoming tests scheduled.</Typography>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                ) : (
                    <Grid container spacing={3}>
                        {pastResults.length > 0 ? (
                            pastResults.map((result, index) => (
                                <Grid item xs={12} key={index}>
                                    <Paper sx={{ p: 3, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                            <CircularProgress variant="determinate" value={result.score || 0} size={60} thickness={4} color={result.score >= 75 ? 'success' : result.score >= 50 ? 'warning' : 'error'} />
                                            <Box sx={{
                                                top: 0,
                                                left: 0,
                                                bottom: 0,
                                                right: 0,
                                                position: 'absolute',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <Typography variant="caption" component="div" color="text.secondary">
                                                    {`${Math.round(result.score)}%`}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6" fontWeight="bold">
                                                {result.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {result.date ? format(new Date(result.date), 'PPP') : 'Unknown Date'}
                                            </Typography>
                                        </Box>

                                        <Chip
                                            label={result.score >= 50 ? "Passed" : "Failed"}
                                            color={result.score >= 50 ? "success" : "error"}
                                            variant="outlined"
                                        />
                                    </Paper>
                                </Grid>
                            ))
                        ) : (
                            <Grid item xs={12}>
                                <Paper sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography color="text.secondary">No past test results found.</Typography>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default StudentTests;
