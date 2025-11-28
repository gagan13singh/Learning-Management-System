import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    LinearProgress,
    Chip,
    Paper,
} from '@mui/material';
import {
    School,
    PlayCircle,
    Quiz,
    EmojiEvents,
    TrendingUp,
    MenuBook,
} from '@mui/icons-material';
import Navbar from '../../components/common/Navbar';
import CourseCard from '../../components/common/CourseCard';
import api from '../../utils/api';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCourses: 0,
        completedCourses: 0,
        inProgress: 0,
        certificates: 0,
    });

    useEffect(() => {
        fetchEnrolledCourses();
    }, []);

    const fetchEnrolledCourses = async () => {
        try {
            const response = await api.get('/enrollments/my-courses');
            const enrollments = response.data.data;
            setEnrolledCourses(enrollments);

            // Calculate stats
            const completed = enrollments.filter((e) => e.status === 'completed').length;
            const inProgress = enrollments.filter((e) => e.status === 'active').length;

            setStats({
                totalCourses: enrollments.length,
                completedCourses: completed,
                inProgress: inProgress,
                certificates: completed,
            });
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleContinueLearning = (courseId) => {
        navigate(`/student/course/${courseId}`);
    };

    const statCards = [
        {
            title: 'Enrolled Courses',
            value: stats.totalCourses,
            icon: <School sx={{ fontSize: 40 }} />,
            color: '#6366f1',
            bgColor: '#eef2ff',
        },
        {
            title: 'In Progress',
            value: stats.inProgress,
            icon: <TrendingUp sx={{ fontSize: 40 }} />,
            color: '#f59e0b',
            bgColor: '#fef3c7',
        },
        {
            title: 'Completed',
            value: stats.completedCourses,
            icon: <EmojiEvents sx={{ fontSize: 40 }} />,
            color: '#10b981',
            bgColor: '#d1fae5',
        },
        {
            title: 'Certificates',
            value: stats.certificates,
            icon: <Quiz sx={{ fontSize: 40 }} />,
            color: '#ec4899',
            bgColor: '#fce7f3',
        },
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Navbar />

            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Welcome Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="700" gutterBottom>
                        Welcome back! 👋
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Continue your learning journey
                    </Typography>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {statCards.map((stat, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    background: `linear-gradient(135deg, ${stat.bgColor} 0%, white 100%)`,
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                    },
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h3" fontWeight="700" color={stat.color}>
                                            {stat.value}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            {stat.title}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                {/* Quick Actions */}
                <Box sx={{ mb: 4 }}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<MenuBook />}
                        onClick={() => navigate('/student/courses')}
                        sx={{
                            mr: 2,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                            },
                        }}
                    >
                        Browse Courses
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/student/certificates')}
                    >
                        My Certificates
                    </Button>
                </Box>

                {/* Enrolled Courses */}
                <Box>
                    <Typography variant="h5" fontWeight="700" gutterBottom sx={{ mb: 3 }}>
                        My Courses
                    </Typography>

                    {loading ? (
                        <Box sx={{ width: '100%' }}>
                            <LinearProgress />
                        </Box>
                    ) : enrolledCourses.length === 0 ? (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 6,
                                textAlign: 'center',
                                bgcolor: 'background.paper',
                                borderRadius: 3,
                            }}
                        >
                            <School sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No courses enrolled yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Start your learning journey by enrolling in a course
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/student/courses')}
                            >
                                Browse Courses
                            </Button>
                        </Paper>
                    ) : (
                        <Grid container spacing={3}>
                            {enrolledCourses.map((enrollment) => (
                                <Grid item xs={12} sm={6} md={4} key={enrollment._id}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: 6,
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Box sx={{ mb: 2 }}>
                                                <Chip
                                                    label={enrollment.course?.category}
                                                    size="small"
                                                    color="primary"
                                                    sx={{ mr: 1 }}
                                                />
                                                {enrollment.status === 'completed' && (
                                                    <Chip
                                                        label="Completed"
                                                        size="small"
                                                        color="success"
                                                    />
                                                )}
                                            </Box>

                                            <Typography variant="h6" fontWeight="600" gutterBottom>
                                                {enrollment.course?.title}
                                            </Typography>

                                            <Box sx={{ my: 2 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Progress
                                                    </Typography>
                                                    <Typography variant="caption" fontWeight="600">
                                                        {Math.round(enrollment.progress)}%
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={enrollment.progress}
                                                    sx={{ height: 8, borderRadius: 4 }}
                                                />
                                            </Box>

                                            <Button
                                                fullWidth
                                                variant="contained"
                                                onClick={() => handleContinueLearning(enrollment.course._id)}
                                                sx={{ mt: 2 }}
                                            >
                                                {enrollment.progress > 0 ? 'Continue Learning' : 'Start Course'}
                                            </Button>
                                            {enrollment.status === 'completed' && enrollment.certificate && (
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    color="success"
                                                    onClick={() => navigate(`/certificate/${enrollment.certificate}`)}
                                                    sx={{ mt: 1 }}
                                                >
                                                    Download Certificate
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </Container>
        </Box>
    );
};

export default StudentDashboard;
