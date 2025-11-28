import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Typography, Card, CardContent, Button, Avatar, LinearProgress, Skeleton, IconButton
} from '@mui/material';
import { Add, TrendingUp, Warning, CheckCircle, School, ArrowForward } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TeacherDashboard = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState([
        { title: 'Total Students', value: '0', icon: <School />, color: theme.palette.primary.main, path: '/teacher/batches' },
        { title: 'Avg Attendance', value: '0%', icon: <CheckCircle />, color: theme.palette.success.main, path: '/teacher/attendance' },
        { title: 'At Risk', value: '0', icon: <Warning />, color: theme.palette.error.main, path: '/teacher/insights' },
    ]);
    const [upcomingTests, setUpcomingTests] = useState([]);
    const [recentCourses, setRecentCourses] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch Stats
            const statsRes = await axios.get('http://localhost:5000/api/features/analytics/teacher-stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const { totalStudents, avgAttendance, atRisk, totalCourses } = statsRes.data.stats;

            setStats([
                { title: 'Total Courses', value: (totalCourses || 0).toString(), icon: <School />, color: theme.palette.secondary.main, path: '/teacher/courses' },
                { title: 'Total Students', value: totalStudents.toString(), icon: <School />, color: theme.palette.primary.main, path: '/teacher/batches' },
                { title: 'Avg Attendance', value: `${avgAttendance}%`, icon: <CheckCircle />, color: theme.palette.success.main, path: '/teacher/attendance' },
                { title: 'At Risk', value: atRisk.toString(), icon: <Warning />, color: theme.palette.error.main, path: '/teacher/insights' },
            ]);



            // Fetch Tests
            const testsRes = await axios.get('http://localhost:5000/api/quizzes/teacher/my-quizzes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUpcomingTests(testsRes.data.quizzes?.slice(0, 3) || []);

            // Fetch Recent Courses
            const coursesRes = await axios.get('http://localhost:5000/api/courses/teacher/my-courses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecentCourses(coursesRes.data.data?.slice(0, 3) || []);

            setLoading(false);

        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const weakTopics = ['Trigonometry', 'Organic Chemistry', 'Thermodynamics'];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                        Welcome back, Teacher! 👋
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Here's what's happening in your classes today.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/teacher/create-course')}
                    sx={{ borderRadius: '12px', background: theme.palette.gradients.primary }}
                >
                    Create New Course
                </Button>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card
                            className="glass-card"
                            onClick={() => navigate(stat.path)}
                            sx={{
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: theme.shadows[10]
                                }
                            }}
                        >
                            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                                {loading ? (
                                    <Skeleton variant="circular" width={56} height={56} sx={{ mr: 2 }} />
                                ) : (
                                    <Avatar sx={{ bgcolor: `${stat.color}22`, color: stat.color, width: 56, height: 56, mr: 2 }}>
                                        {stat.icon}
                                    </Avatar>
                                )}
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body2" color="text.secondary" fontWeight="600">
                                        {stat.title}
                                    </Typography>
                                    {loading ? (
                                        <Skeleton variant="text" width={60} height={40} />
                                    ) : (
                                        <Typography variant="h4" fontWeight="bold">
                                            {stat.value}
                                        </Typography>
                                    )}
                                </Box>
                                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                                    <ArrowForward />
                                </IconButton>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                {/* Main Content Area */}
                <Grid item xs={12} md={8}>


                    {/* Recent Courses */}
                    <Card className="glass-card" sx={{ mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">Recent Courses</Typography>
                                <Button size="small" onClick={() => navigate('/teacher/courses')}>View All</Button>
                            </Box>

                            {loading ? (
                                <Box>
                                    <Skeleton height={60} sx={{ mb: 1 }} />
                                    <Skeleton height={60} sx={{ mb: 1 }} />
                                </Box>
                            ) : recentCourses.length > 0 ? recentCourses.map((course, i) => (
                                <Box
                                    key={i}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        p: 2,
                                        mb: 1,
                                        bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.05)',
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: theme.palette.action.hover }
                                    }}
                                    onClick={() => navigate(`/teacher/course/${course._id}`)}
                                >
                                    <Avatar variant="rounded" src={course.thumbnail} sx={{ width: 50, height: 50, mr: 2 }}>
                                        <School />
                                    </Avatar>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="600">{course.title}</Typography>
                                        <Typography variant="caption" color="text.secondary">{course.category} • {course.enrollmentCount || 0} Students</Typography>
                                    </Box>
                                    <Button size="small" variant="outlined" sx={{ borderRadius: '8px' }}>Manage</Button>
                                </Box>
                            )) : (
                                <Typography color="text.secondary">No courses created yet.</Typography>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Tests */}
                    <Card className="glass-card">
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">Upcoming Tests</Typography>
                                <Button size="small" onClick={() => navigate('/teacher/tests')}>View All</Button>
                            </Box>

                            {loading ? (
                                <Box>
                                    <Skeleton height={60} sx={{ mb: 1 }} />
                                    <Skeleton height={60} sx={{ mb: 1 }} />
                                </Box>
                            ) : upcomingTests.length > 0 ? upcomingTests.map((test, i) => (
                                <Box
                                    key={i}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        p: 2,
                                        mb: 1,
                                        bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.05)',
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: theme.palette.action.hover }
                                    }}
                                    onClick={() => navigate('/teacher/tests')}
                                >
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="600">{test.title}</Typography>
                                        <Typography variant="caption" color="text.secondary">{test.course?.title} • {test.timeLimit} mins</Typography>
                                    </Box>
                                    <Button size="small" variant="outlined" sx={{ borderRadius: '8px' }}>View</Button>
                                </Box>
                            )) : (
                                <Typography color="text.secondary">No upcoming tests.</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Sidebar Widgets */}
                <Grid item xs={12} md={4}>
                    {/* Weak Topics */}
                    <Card className="glass-card" sx={{ mb: 3, background: theme.palette.gradients.glass }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Weak Topics of the Week</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {weakTopics.map((topic, i) => (
                                    <Box key={i} sx={{ px: 2, py: 1, bgcolor: 'rgba(239, 68, 68, 0.1)', color: 'error.main', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
                                        {topic}
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Students at Risk */}
                    <Card className="glass-card">
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Students at Risk 🔴</Typography>
                            {['Amit Kumar', 'Sneha Gupta'].map((student, i) => (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ width: 40, height: 40, mr: 2, bgcolor: 'error.main' }}>{student[0]}</Avatar>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="600">{student}</Typography>
                                        <Typography variant="caption" color="error">Critical Attendance</Typography>
                                    </Box>
                                </Box>
                            ))}
                            <Button fullWidth variant="text" onClick={() => navigate('/teacher/insights')}>View All Insights</Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TeacherDashboard;
