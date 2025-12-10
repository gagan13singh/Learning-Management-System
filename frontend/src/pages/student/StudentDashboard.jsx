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
    Skeleton,
    Avatar,
    LinearProgress
} from '@mui/material';
import {
    School,
    EmojiEvents,
    TrendingUp,
    Quiz,
    ArrowForward,
    AccessTime
} from '@mui/icons-material';
import api from '../../utils/api';
import { motion } from 'framer-motion';

// Widgets
import AssignmentsPanel from '../../components/student/AssignmentsPanel';
import UpcomingTests from '../../components/student/UpcomingTests';
import PerformanceChart from '../../components/student/PerformanceChart';
import AttendanceWidget from '../../components/student/AttendanceWidget';
import AnnouncementsWidget from '../../components/student/AnnouncementsWidget';
import TodoWidget from '../../components/student/TodoWidget';
import QuickActionsMenu from '../../components/student/QuickActionsMenu';
import AIChatWidget from '../../components/student/AIChatWidget';
import AIPlannerWidget from '../../components/student/AIPlannerWidget';
import AIPracticeWidget from '../../components/student/AIPracticeWidget';

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

            const coursesRes = await api.get('/enrollments/my-courses');
            const enrollments = coursesRes.data.data || [];
            setEnrolledCourses(enrollments);

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
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header */}
                    <Box sx={{ mb: 4 }}>
                        <motion.div variants={itemVariants}>
                            <Typography variant="h4" fontWeight="800" sx={{
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent',
                                display: 'inline-block'
                            }}>
                                Welcome back, {userName}! 👋
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                                Let's continue where you left off.
                            </Typography>
                        </motion.div>
                    </Box>

                    {/* Stats Grid + AI Planner */}
                    <Grid container spacing={3} sx={{ mb: 5 }}>
                        {statCards.map((stat, index) => (
                            <Grid item xs={12} sm={6} md={2} key={index}>
                                <motion.div variants={itemVariants} whileHover={{ y: -5 }} style={{ height: '100%' }}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderRadius: 4,
                                            background: stat.gradient,
                                            border: `1px solid ${stat.color}30`,
                                            position: 'relative',
                                            overflow: 'hidden',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                            <Box sx={{
                                                p: 1,
                                                borderRadius: '10px',
                                                bgcolor: 'background.paper',
                                                color: stat.color,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                            }}>
                                                {stat.icon}
                                            </Box>
                                        </Box>
                                        <Typography variant="h4" fontWeight="800" color="text.primary" sx={{ mb: 0.5 }}>
                                            {stat.value}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ fontSize: '0.75rem' }}>
                                            {stat.title}
                                        </Typography>
                                    </Paper>
                                </motion.div>
                            </Grid>
                        ))}

                        {/* AI Planner - Taking up the remaining 4 cols in the row */}
                        <Grid item xs={12} md={4}>
                            <motion.div variants={itemVariants} style={{ height: '100%' }}>
                                <AIPlannerWidget compact />
                            </motion.div>
                        </Grid>
                    </Grid>

                    {/* Key Content Areas */}
                    <Grid container spacing={4}>

                        {/* LEFT COLUMN - MAIN LEARNING STREAM (8 Cols) */}
                        <Grid item xs={12} lg={8}>

                            {/* My Courses - Priority #1 - Refined Appearance */}
                            <Box sx={{ mb: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" fontWeight="bold">Continue Learning</Typography>
                                    <Button endIcon={<ArrowForward />} onClick={() => navigate('/student/courses')} size="small">
                                        All Courses
                                    </Button>
                                </Box>

                                {loading ? (
                                    <Grid container spacing={3}>
                                        {[1, 2].map((i) => (
                                            <Grid item xs={12} sm={6} key={i}>
                                                <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 4 }} />
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : enrolledCourses.length === 0 ? (
                                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, bgcolor: 'background.paper', border: '1px dashed #ccc' }}>
                                        <Typography color="text.secondary">No active courses.</Typography>
                                        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/student/courses')}>Browse Catalog</Button>
                                    </Paper>
                                ) : (
                                    <Grid container spacing={3}>
                                        {enrolledCourses.slice(0, 2).map((enrollment) => (
                                            <Grid item xs={12} md={6} key={enrollment._id}>
                                                <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
                                                    <Paper
                                                        elevation={0}
                                                        onClick={() => navigate(`/student/course/${enrollment.course._id}`)}
                                                        sx={{
                                                            p: 2.5,
                                                            borderRadius: 4,
                                                            border: '1px solid',
                                                            borderColor: 'divider',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 3,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            '&:hover': {
                                                                borderColor: 'primary.main',
                                                                boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                                                            }
                                                        }}
                                                    >
                                                        {/* Thumbnail */}
                                                        <Box sx={{
                                                            width: 120,
                                                            height: 90,
                                                            borderRadius: 3,
                                                            bgcolor: 'grey.200',
                                                            backgroundImage: `url(${enrollment.course?.thumbnail})`,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center',
                                                            flexShrink: 0,
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                        }} />

                                                        {/* Details */}
                                                        <Box sx={{ flexGrow: 1 }}>
                                                            <Typography variant="h6" fontWeight="bold" noWrap sx={{ fontSize: '1.1rem', mb: 0.5 }}>
                                                                {enrollment.course?.title}
                                                            </Typography>

                                                            <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                                    <AccessTime sx={{ fontSize: 16 }} />
                                                                    <Typography variant="caption">1h 20m left</Typography>
                                                                </Box>
                                                            </Box>

                                                            {/* Progress Bar */}
                                                            <Box sx={{ width: '100%' }}>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                                    <Typography variant="caption" fontWeight="bold" color="primary.main">
                                                                        {Math.round(enrollment.progress)}% Complete
                                                                    </Typography>
                                                                </Box>
                                                                <LinearProgress
                                                                    variant="determinate"
                                                                    value={enrollment.progress}
                                                                    sx={{
                                                                        height: 6,
                                                                        borderRadius: 3,
                                                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'grey.100',
                                                                        '& .MuiLinearProgress-bar': { borderRadius: 3 }
                                                                    }}
                                                                />
                                                            </Box>
                                                        </Box>
                                                    </Paper>
                                                </motion.div>
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                            </Box>

                            {/* Assignments & Performance Split - Equal Heights */}
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                                        <Box sx={{ height: '100%' }}>
                                            <AssignmentsPanel />
                                        </Box>
                                    </motion.div>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <motion.div variants={itemVariants} style={{ height: '100%' }}>
                                        <Box sx={{ height: '100%' }}>
                                            <PerformanceChart />
                                        </Box>
                                    </motion.div>
                                </Grid>
                                <Grid item xs={12}>
                                    <motion.div variants={itemVariants}>
                                        <AttendanceWidget />
                                    </motion.div>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* RIGHT COLUMN - SIDEBAR & AI TOOLS (4 Cols) */}
                        <Grid item xs={12} lg={4}>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 3,
                                position: 'sticky',
                                top: 24,
                                height: 'fit-content'
                            }}>

                                {/* Side-by-Side: 2x2 Grid */}
                                <motion.div variants={itemVariants}>
                                    <Grid container spacing={2}>

                                        {/* Row 1: Upcoming Tests & Tasks */}
                                        <Grid item xs={12} md={6}>
                                            <UpcomingTests />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TodoWidget />
                                        </Grid>

                                        {/* Row 2: Weak Topics & Announcements */}
                                        <Grid item xs={12} md={6}>
                                            <AIPracticeWidget />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <AnnouncementsWidget />
                                        </Grid>

                                    </Grid>
                                </motion.div>

                            </Box>
                        </Grid>
                    </Grid>

                    {/* Floating Widgets */}
                    <QuickActionsMenu />
                    <AIChatWidget />

                </motion.div>
            </Container>
        </Box>
    );
};

export default StudentDashboard;
