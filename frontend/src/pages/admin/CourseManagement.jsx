import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, IconButton, TextField, InputAdornment, Tabs, Tab,
    Button, useTheme, Menu, MenuItem, Link
} from '@mui/material';
import {
    Search, MoreVert, Delete, CheckCircle, Cancel, Visibility, School
} from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const CourseManagement = () => {
    const { showSuccess, showError } = useToast();
    const theme = useTheme();
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, [statusFilter]);

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchCourses();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            let url = `http://localhost:5000/api/admin/courses?search=${searchTerm}`;
            if (statusFilter !== 'all') url += `&status=${statusFilter}`;

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setCourses(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
            showError(error.response?.data?.message || error.response?.data?.error || "Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    const handleMenuOpen = (event, course) => {
        setActionMenuAnchor(event.currentTarget);
        setSelectedCourse(course);
    };

    const handleMenuClose = () => {
        setActionMenuAnchor(null);
        setSelectedCourse(null);
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!selectedCourse) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/admin/courses/${selectedCourse._id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showSuccess(`Course ${newStatus === 'published' ? 'Published' : 'Drafted'} successfully`);
            fetchCourses();
            handleMenuClose();
        } catch (error) {
            showError("Failed to update course status");
        }
    };

    const handleDeleteCourse = async () => {
        if (!selectedCourse) return;
        if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/admin/courses/${selectedCourse._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSuccess("Course deleted successfully");
            fetchCourses();
            handleMenuClose();
        } catch (error) {
            showError("Failed to delete course");
        }
    };

    const getStatusChip = (status) => {
        if (status === 'published') {
            return <Chip label="Published" size="small" color="success" icon={<CheckCircle />} sx={{ bgcolor: 'success.light', color: 'success.dark' }} />
        }
        return <Chip label="Draft" size="small" color="warning" sx={{ bgcolor: 'warning.light', color: 'warning.dark' }} />
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="800" gutterBottom>
                    Course Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Review, approve, and manage courses created by instructors.
                </Typography>
            </Box>

            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                    {/* Filters and Search */}
                    <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                        <Tabs
                            value={statusFilter}
                            onChange={(e, v) => setStatusFilter(v)}
                            textColor="primary"
                            indicatorColor="primary"
                            sx={{ minHeight: 48 }}
                        >
                            <Tab label="All Courses" value="all" />
                            <Tab label="Published" value="published" />
                            <Tab label="Draft/Pending" value="draft" />
                        </Tabs>

                        <TextField
                            placeholder="Search courses..."
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                            }}
                            sx={{ minWidth: 250 }}
                        />
                    </Box>

                    {/* Courses Table */}
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Course Title</TableCell>
                                    <TableCell>Instructor</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Created</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {courses.length > 0 ? courses.map((course) => (
                                    <TableRow key={course._id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box
                                                    component="img"
                                                    src={course.thumbnail || 'https://via.placeholder.com/50'}
                                                    sx={{ width: 60, height: 40, borderRadius: 1, objectFit: 'cover' }}
                                                />
                                                <Typography variant="subtitle2" fontWeight="600">
                                                    {course.title}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{course.instructor?.name || 'Unknown'}</Typography>
                                            <Typography variant="caption" color="text.secondary">{course.instructor?.email}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusChip(course.status)}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(course.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={(e) => handleMenuOpen(e, course)}>
                                                <MoreVert />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">No courses found.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Action Menu */}
            <Menu
                anchorEl={actionMenuAnchor}
                open={Boolean(actionMenuAnchor)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => { navigate(`/student/course/${selectedCourse?._id}`); handleMenuClose(); }}>
                    <Visibility fontSize="small" sx={{ mr: 1 }} /> View Course
                </MenuItem>

                {selectedCourse?.status === 'published' ? (
                    <MenuItem onClick={() => handleStatusUpdate('draft')} sx={{ color: 'warning.main' }}>
                        <Cancel fontSize="small" sx={{ mr: 1 }} /> Unpublish (Draft)
                    </MenuItem>
                ) : (
                    <MenuItem onClick={() => handleStatusUpdate('published')} sx={{ color: 'success.main' }}>
                        <CheckCircle fontSize="small" sx={{ mr: 1 }} /> Publish (Approve)
                    </MenuItem>
                )}

                <MenuItem onClick={handleDeleteCourse} sx={{ color: 'error.main' }}>
                    <Delete fontSize="small" sx={{ mr: 1 }} /> Delete Permanently
                </MenuItem>
            </Menu>

        </motion.div>
    );
};

export default CourseManagement;
