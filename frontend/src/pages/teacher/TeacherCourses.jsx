import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Button, CircularProgress, Alert,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import CourseCard from '../../components/common/CourseCard';
import { useTheme } from '@mui/material/styles';

const TeacherCourses = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Edit Dialog State
    const [openEdit, setOpenEdit] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [editData, setEditData] = useState({
        title: '', description: '', category: '', class: '', price: '', difficulty: 'Beginner', language: 'English'
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/api/courses/teacher/my-courses');
            setCourses(res.data.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleManage = (courseId) => {
        navigate(`/teacher/course/${courseId}`);
    };

    const handleDelete = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;

        try {
            await api.delete(`/api/courses/${courseId}`);
            setCourses(courses.filter(c => c._id !== courseId));
        } catch (err) {
            console.error(err);
            alert('Failed to delete course');
        }
    };

    const handleEditClick = (course) => {
        setEditingCourse(course);
        setEditData({
            title: course.title,
            description: course.description,
            category: course.category,
            class: course.class,
            price: course.price,
            difficulty: course.difficulty,
            language: course.language
        });
        setOpenEdit(true);
    };

    const handleSaveEdit = async () => {
        try {
            const res = await api.put(`/api/courses/${editingCourse._id}`, editData);

            // Update local list
            setCourses(courses.map(c => c._id === editingCourse._id ? res.data.data : c));
            setOpenEdit(false);
            setEditingCourse(null);
        } catch (err) {
            console.error(err);
            alert('Failed to update course');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">My Courses</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/teacher/create-course')}
                    sx={{ background: theme.palette.gradients.primary }}
                >
                    Create New Course
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {courses.length > 0 ? (
                        courses.map((course) => (
                            <Grid item xs={12} sm={6} md={4} key={course._id}>
                                <CourseCard
                                    course={course}
                                    isTeacher={true}
                                    onManage={handleManage}
                                    onEdit={handleEditClick}
                                    onDelete={handleDelete}
                                />
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Box sx={{ textAlign: 'center', py: 8, opacity: 0.7 }}>
                                <Typography variant="h6">No courses found</Typography>
                                <Typography variant="body2">Create your first course to get started!</Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Edit Dialog */}
            <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Course Details</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Course Title"
                            fullWidth
                            value={editData.title}
                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={editData.description}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField select fullWidth label="Category" value={editData.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })}>
                                    {['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Social Studies', 'Computer Science', 'Other'].map((option) => (
                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField select fullWidth label="Class/Grade" value={editData.class} onChange={(e) => setEditData({ ...editData, class: e.target.value })}>
                                    {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Other'].map((option) => (
                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField select fullWidth label="Difficulty" value={editData.difficulty} onChange={(e) => setEditData({ ...editData, difficulty: e.target.value })}>
                                    {['Beginner', 'Intermediate', 'Advanced'].map((option) => (
                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField fullWidth label="Price (₹)" type="number" value={editData.price} onChange={(e) => setEditData({ ...editData, price: e.target.value })} />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveEdit}>Save Changes</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TeacherCourses;
