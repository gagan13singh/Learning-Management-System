import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    Chip,
    Paper
} from '@mui/material';
import {
    Event,
    ArrowForward,
    CalendarMonth
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../utils/api';

const UpcomingTests = () => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const response = await api.get('/tests/upcoming');
                setTests(response.data.data);
            } catch (error) {
                console.error('Error fetching tests:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTests();
    }, []);

    return (
        <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        p: 1,
                        borderRadius: '12px',
                        bgcolor: 'secondary.light',
                        color: 'secondary.main',
                        display: 'flex'
                    }}>
                        <Event sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" fontWeight="700">
                        Upcoming Tests
                    </Typography>
                </Box>
                <Chip
                    label={tests.length}
                    color="secondary"
                    size="small"
                    sx={{ fontWeight: 600, borderRadius: 2 }}
                />
            </Box>

            <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {loading ? (
                    <Box sx={{ textAlign: 'center' }}>Loading...</Box>
                ) : tests.length === 0 ? (
                    <Box sx={{ textAlign: 'center', my: 'auto' }}>
                        <CalendarMonth sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            No upcoming tests schedule.
                        </Typography>
                    </Box>
                ) : (
                    tests.map((test, index) => (
                        <Paper
                            key={test._id}
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: 'background.default',
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    borderColor: 'primary.main'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight="700" color="primary.main">
                                    {test.title}
                                </Typography>
                                <Chip
                                    label={format(new Date(test.date), 'MMM d')}
                                    size="small"
                                    sx={{
                                        borderRadius: 1,
                                        height: 20,
                                        fontSize: '0.7rem',
                                        bgcolor: 'error.main',
                                        color: 'white',
                                        fontWeight: 700
                                    }}
                                />
                            </Box>
                            <Typography variant="body2" fontWeight="600" gutterBottom>
                                {test.course?.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                                {test.syllabus || 'Syllabus not available'}
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                fullWidth
                                sx={{ borderRadius: 2, fontSize: '0.75rem', py: 0.5 }}
                            >
                                View Details
                            </Button>
                        </Paper>
                    ))
                )}
            </CardContent>

            <Box sx={{ p: 2, pt: 0 }}>
                <Button
                    fullWidth
                    color="secondary"
                    endIcon={<ArrowForward />}
                    sx={{ borderRadius: 3 }}
                >
                    View All Schedule
                </Button>
            </Box>
        </Card>
    );
};

export default UpcomingTests;
