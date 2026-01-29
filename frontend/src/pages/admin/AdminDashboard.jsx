import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Typography, Card, CardContent, CircularProgress, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar
} from '@mui/material';
import {
    People, School, AttachMoney, TrendingUp, PersonAdd, Class, Assignment
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import StatCard from '../../components/dashboard/StatCard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AdminDashboard = () => {
    const { showError } = useToast();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/api/admin/stats');
                if (res.data.success) {
                    setStats(res.data.data);
                }
            } catch (error) {
                console.error("Error loading stats:", error);
                showError("Failed to load dashboard statistics");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [showError]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    const growthData = stats?.userGrowth?.map(item => ({
        name: item._id,
        users: item.count
    })) || [];

    const categoryData = stats?.courseCategories?.map(item => ({
        name: item._id,
        value: item.count
    })) || [];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="800" gutterBottom>
                    Admin Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Platform overview and analytics.
                </Typography>
            </Box>

            {/* Key Metrics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Users"
                        value={stats?.totalUsers || 0}
                        icon={<People />}
                        color="primary"
                        trend="+5%"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Courses"
                        value={stats?.publishedCourses || 0}
                        icon={<School />}
                        color="success"
                        trend={`Total: ${stats?.totalCourses}`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Enrollments"
                        value={stats?.totalEnrollments || 0}
                        icon={<Assignment />}
                        color="warning"
                        trend="+12%"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Instructors"
                        value={stats?.instructorsCount || 0}
                        icon={<Class />}
                        color="info"
                        trend="Active"
                    />
                </Grid>
            </Grid>

            {/* Charts Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* User Growth Chart */}
                <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'divider' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>User Growth Trends</Typography>
                            <Box sx={{ height: 300, width: '100%' }}>
                                <ResponsiveContainer>
                                    <LineChart data={growthData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="users"
                                            stroke="#6366F1"
                                            strokeWidth={3}
                                            dot={{ r: 4, strokeWidth: 2 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Categories Pie Chart */}
                <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'divider' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>Course Categories</Typography>
                            <Box sx={{ height: 300, width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Recent Activity / Enrollments */}
            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Recent Enrollments</Typography>
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student</TableCell>
                                    <TableCell>Course</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stats?.recentEnrollments?.length > 0 ? stats.recentEnrollments.map((enrollment) => (
                                    <TableRow key={enrollment._id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', fontSize: '0.8rem' }}>
                                                    {enrollment.student?.name?.[0] || 'U'}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="600">
                                                        {enrollment.student?.name || 'Unknown User'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {enrollment.student?.email}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="500">
                                                {enrollment.course?.title || 'Unknown Course'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(enrollment.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="right">
                                            {enrollment.course?.price === 0 ?
                                                <Box component="span" sx={{ color: 'success.main', fontWeight: 'bold' }}>Free</Box> :
                                                `₹${enrollment.course?.price}`
                                            }
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                            <Typography color="text.secondary">No recent enrollments.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default AdminDashboard;
