import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Typography,
    Box,
    Button,
    Paper,
    useTheme,
    Skeleton
} from '@mui/material';
import {
    School,
    EmojiEvents,
    TrendingUp,
    Quiz,
    MenuBook
} from '@mui/icons-material';
import Navbar from '../../components/common/Navbar';
import api from '../../utils/api';
import { motion } from 'framer-motion';

// Widgets
import AssignmentsPanel from '../../components/student/AssignmentsPanel';
import UpcomingTests from '../../components/student/UpcomingTests';
import PerformanceChart from '../../components/student/PerformanceChart';
import AttendanceWidget from '../../components/student/AttendanceWidget';
import AnnouncementsWidget from '../../components/student/AnnouncementsWidget';
import QuickActionsMenu from '../../components/student/QuickActionsMenu';

// Components
// Components
// CourseCard logic is currently inlined


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

const StudentDashboard = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCourses: 0,
        completedCourses: 0,
        inProgress: 0,
        certificates: 0,
    });
    const [userName, setUserName] = useState('Student');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch User Data independently
            try {
                const userRes = await api.get('/auth/me');
                if (userRes.data?.data) {
                    setUserName(userRes.data.data.name?.split(' ')[0] || 'Student');
                }
            } catch (err) {
                console.warn('Failed to fetch user data:', err);
                const storedUser = JSON.parse(localStorage.getItem('userInfo'));
                if (storedUser) setUserName(storedUser.name.split(' ')[0]);
            }

            // Fetch Enrolled Courses
            const coursesRes = await api.get('/enrollments/my-courses');
            const enrollments = coursesRes.data.data || [];
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
            console.error('Error fetching dashboard data:', error);
            // Even if enrollments fail, we stop loading
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Enrolled Courses',
            value: stats.totalCourses,
            icon: <School sx={{ fontSize: 32 }} />,
            color: theme.palette.primary.main,
            gradient: `linear-gradient(135deg, ${theme.palette.primary.light}20 0%, ${theme.palette.primary.main}10 100%)`,
        },
        {
            title: 'In Progress',
            value: stats.inProgress,
            icon: <TrendingUp sx={{ fontSize: 32 }} />,
            color: theme.palette.warning.main,
            gradient: `linear-gradient(135deg, ${theme.palette.warning.light}20 0%, ${theme.palette.warning.main}10 100%)`,
        },
        {
            title: 'Completed',
            value: stats.completedCourses,
            icon: <EmojiEvents sx={{ fontSize: 32 }} />,
            color: theme.palette.success.main,
            gradient: `linear-gradient(135deg, ${theme.palette.success.light}20 0%, ${theme.palette.success.main}10 100%)`,
        },
        {
            title: 'Certificates',
            value: stats.certificates,
            icon: <Quiz sx={{ fontSize: 32 }} />,
            color: theme.palette.secondary.main,
            gradient: `linear-gradient(135deg, ${theme.palette.secondary.light}20 0%, ${theme.palette.secondary.main}10 100%)`,
        },
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
            <Navbar />

            <Container maxWidth="xl" sx={{ py: 4 }}>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Welcome Section */}
                    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <motion.div variants={itemVariants}>
                                <Typography variant="h4" fontWeight="800" gutterBottom sx={{ background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', display: 'inline-block' }}>
                                    Welcome back, {userName}! 👋
                                </Typography>
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <Typography variant="body1" color="text.secondary">
                                    Here's what's happening with your courses today.
                                </Typography>
                            </motion.div>
                        </Box>
                    </Box>

                    {/* Stats Cards */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {statCards.map((stat, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <motion.div variants={itemVariants} whileHover={{ y: -5 }}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: 4,
                                            background: stat.gradient,
                                            border: `1px solid ${stat.color}30`,
                                            position: 'relative',
                                            overflow: 'hidden',
                                            height: '100%'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Box sx={{
                                                p: 1.5,
                                                borderRadius: '12px',
                                                bgcolor: 'background.paper',
                                                color: stat.color,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                            }}>
                                                {stat.icon}
                                            </Box>
                                        </Box>
                                        <Typography variant="h3" fontWeight="800" color="text.primary">
                                            {stat.value}
                                        </Typography>
                                        <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
                                            {stat.title}
                                        </Typography>
                                    </Paper>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Announcements - Full Width */}
                    <Box sx={{ mb: 4 }}>
                        <motion.div variants={itemVariants}>
                            <AnnouncementsWidget />
                        </motion.div>
                    </Box>

                    {/* Main Content Grid */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {/* Left Column: Assignments & Attendance & Performance */}
                        <Grid item xs={12} lg={8}>
                            <Grid container spacing={3}>
                                {/* Row 1: Assignments + Attendance */}
                                <Grid item xs={12} md={6}>
                                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                                        <AssignmentsPanel />
                                    </motion.div>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                                        <AttendanceWidget />
                                    </motion.div>
                                </Grid>

                                {/* Row 2: Performance Chart */}
                                <Grid item xs={12}>
                                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                                        <PerformanceChart />
                                    </motion.div>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Right Column: Upcoming Tests */}
                        <Grid item xs={12} lg={4}>
                            <motion.div variants={itemVariants} style={{ height: '100%' }}>
                                <UpcomingTests />
                            </motion.div>
                        </Grid>
                    </Grid>

                    {/* My Courses Section */}
                    <Box sx={{ mb: 4 }}>
                        <motion.div variants={itemVariants}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h5" fontWeight="700">
                                    My Courses
                                </Typography>
                                <Button
                                    endIcon={<MenuBook />}
                                    onClick={() => navigate('/student/courses')}
                                >
                                    Browse All
                                </Button>
                            </Box>
                        </motion.div>

                        {loading ? (
                            <Grid container spacing={3}>
                                {[1, 2, 3].map((i) => (
                                    <Grid item xs={12} sm={6} md={4} key={i}>
                                        <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 4 }} />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : enrolledCourses.length === 0 ? (
                            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, bgcolor: 'background.paper' }}>
                                <Typography color="text.secondary">You haven't enrolled in any courses yet.</Typography>
                                <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/student/courses')}>
                                    Start Learning
                                </Button>
                            </Paper>
                        ) : (
                            <Grid container spacing={3}>
                                {enrolledCourses.slice(0, 3).map((enrollment) => (
                                    <Grid item xs={12} sm={6} md={4} key={enrollment._id}>
                                        <motion.div variants={itemVariants} whileHover={{ y: -8 }}>
                                            {/* Reuse existing course card logic inline or separate component */}
                                            {/* For brevity, I'll inline a simplified card reusing the one from previous file logic */}
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 0,
                                                    borderRadius: 4,
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    overflow: 'hidden',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => navigate(`/student/course/${enrollment.course._id}`)}
                                            >
                                                <Box sx={{
                                                    height: 160,
                                                    bgcolor: 'grey.200',
                                                    backgroundImage: `url(${enrollment.course?.thumbnail})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center'
                                                }} />
                                                <Box sx={{ p: 2.5, flexGrow: 1 }}>
                                                    <Typography variant="h6" fontWeight="700" gutterBottom noWrap>
                                                        {enrollment.course?.title}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                                                        <Typography variant="caption" fontWeight="600" color="text.secondary">
                                                            {Math.round(enrollment.progress)}% Complete
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ mt: 1, bgcolor: 'grey.100', borderRadius: 2, height: 6, overflow: 'hidden' }}>
                                                        <Box sx={{ width: `${enrollment.progress}%`, bgcolor: 'primary.main', height: '100%' }} />
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        </motion.div>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>

                    {/* Quick Actions FAB */}
                    <QuickActionsMenu />

                </motion.div>
            </Container>
        </Box>
    );
};

export default StudentDashboard;
