import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Typography, Card, CardContent, Button, Avatar, LinearProgress, Skeleton, IconButton, useTheme
} from '@mui/material';
import { Add, TrendingUp, Warning, CheckCircle, School, ArrowForward, AccessTime } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100
        }
    }
};

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
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <motion.div variants={itemVariants}>
                        <Typography variant="h4" fontWeight="800" sx={{ mb: 1, background: theme.palette.primary.main, backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', display: 'inline-block' }}>
                            Hello, Teacher! 👋
                        </Typography>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <Typography variant="body1" color="text.secondary">
                            Here's what's happening in your classrooms today.
                        </Typography>
                    </motion.div>
                </Box>
                <motion.div variants={itemVariants}>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/teacher/create-course')}
                        size="large"
                        sx={{ borderRadius: '12px' }}
                    >
                        Create New Course
                    </Button>
                </motion.div>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <motion.div variants={itemVariants}>
                            <Card
                                onClick={() => navigate(stat.path)}
                                sx={{
                                    cursor: 'pointer',
                                    height: '100%',
                                    position: 'relative',
                                    overflow: 'visible'
                                }}
                            >
                                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                                    {loading ? (
                                        <Skeleton variant="circular" width={56} height={56} sx={{ mr: 2 }} />
                                    ) : (
                                        <Avatar
                                            variant="rounded"
                                            sx={{
                                                bgcolor: `${stat.color}15`,
                                                color: stat.color,
                                                width: 56,
                                                height: 56,
                                                mr: 2.5,
                                                borderRadius: '16px'
                                            }}
                                        >
                                            {stat.icon}
                                        </Avatar>
                                    )}
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="body2" color="text.secondary" fontWeight="600" sx={{ mb: 0.5 }}>
                                            {stat.title}
                                        </Typography>
                                        {loading ? (
                                            <Skeleton variant="text" width={60} height={40} />
                                        ) : (
                                            <Typography variant="h4" fontWeight="800">
                                                {stat.value}
                                            </Typography>
                                        )}
                                    </Box>
                                    <IconButton
                                        size="small"
                                        sx={{
                                            color: stat.color,
                                            opacity: 0.5,
                                            '&:hover': { opacity: 1, background: `${stat.color}10` }
                                        }}
                                    >
                                        <ArrowForward />
                                    </IconButton>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                {/* Main Content Area */}
                <Grid item xs={12} md={8}>
                    {/* Recent Courses */}
                    <motion.div variants={itemVariants}>
                        <Card sx={{ mb: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                                    <Typography variant="h6" fontWeight="bold">Recent Courses</Typography>
                                    <Button size="small" onClick={() => navigate('/teacher/courses')} color="inherit">View All</Button>
                                </Box>

                                {loading ? (
                                    <Box>
                                        <Skeleton height={80} sx={{ mb: 1, borderRadius: 2 }} />
                                        <Skeleton height={80} sx={{ mb: 1, borderRadius: 2 }} />
                                    </Box>
                                ) : recentCourses.length > 0 ? recentCourses.map((course, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.01, x: 4 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                p: 2,
                                                mb: 2,
                                                bgcolor: theme.palette.background.subtle,
                                                borderRadius: 3,
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s',
                                                '&:hover': { bgcolor: theme.palette.action.hover }
                                            }}
                                            onClick={() => navigate(`/teacher/course/${course._id}`)}
                                        >
                                            <Avatar
                                                variant="rounded"
                                                src={course.thumbnail}
                                                sx={{ width: 56, height: 56, mr: 2.5, borderRadius: '12px' }}
                                            >
                                                <School />
                                            </Avatar>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="subtitle1" fontWeight="700">{course.title}</Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <span style={{ opacity: 0.7 }}>{course.category}</span>
                                                    <span>•</span>
                                                    <span style={{ color: theme.palette.primary.main, fontWeight: 500 }}>{course.enrollmentCount || 0} Students</span>
                                                </Typography>
                                            </Box>
                                            <Button size="small" variant="text" sx={{ borderRadius: '8px' }}>Manage</Button>
                                        </Box>
                                    </motion.div>
                                )) : (
                                    <Typography color="text.secondary" textAlign="center" py={4}>No courses created yet.</Typography>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Upcoming Tests */}
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                                    <Typography variant="h6" fontWeight="bold">Upcoming Tests</Typography>
                                    <Button size="small" onClick={() => navigate('/teacher/tests')} color="inherit">View All</Button>
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
                                            mb: 1.5,
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: 3,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                borderColor: theme.palette.primary.main,
                                                bgcolor: `${theme.palette.primary.main}05`
                                            }
                                        }}
                                        onClick={() => navigate('/teacher/tests')}
                                    >
                                        <Avatar sx={{ bgcolor: `${theme.palette.secondary.main}15`, color: theme.palette.secondary.main, mr: 2, borderRadius: '10px' }}>
                                            <AccessTime />
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="600">{test.title}</Typography>
                                            <Typography variant="caption" color="text.secondary">{test.course?.title} • {test.timeLimit} mins</Typography>
                                        </Box>
                                        <Button size="small" variant="outlined" color="primary" sx={{ borderRadius: '8px' }}>View</Button>
                                    </Box>
                                )) : (
                                    <Typography color="text.secondary" textAlign="center" py={4}>No upcoming tests.</Typography>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>

                {/* Sidebar Widgets */}
                <Grid item xs={12} md={4}>
                    {/* Weak Topics */}
                    <motion.div variants={itemVariants}>
                        <Card sx={{ mb: 3, background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.subtle} 100%)` }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Weak Topics of the Week</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {weakTopics.map((topic, i) => (
                                        <motion.div key={i} whileHover={{ scale: 1.05 }}>
                                            <Box sx={{
                                                px: 2, py: 1,
                                                bgcolor: `${theme.palette.error.main}15`,
                                                color: theme.palette.error.main,
                                                borderRadius: '8px',
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                                border: `1px solid ${theme.palette.error.main}30`
                                            }}>
                                                {topic}
                                            </Box>
                                        </motion.div>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Students at Risk */}
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Students at Risk 🔴</Typography>
                                {['Amit Kumar', 'Sneha Gupta'].map((student, i) => (
                                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                                        <Avatar sx={{ width: 44, height: 44, mr: 2, bgcolor: `${theme.palette.error.main}20`, color: theme.palette.error.main, fontWeight: 'bold' }}>
                                            {student[0]}
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle2" fontWeight="700">{student}</Typography>
                                            <Typography variant="caption" color="error" fontWeight="500">Critical Attendance</Typography>
                                        </Box>
                                        <Button size="small" variant="text" color="error">Alert</Button>
                                    </Box>
                                ))}
                                <Button fullWidth variant="outlined" color="error" onClick={() => navigate('/teacher/insights')} sx={{ mt: 1 }}>View All Insights</Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>
            </Grid>
        </motion.div>
    );
};

export default TeacherDashboard;
