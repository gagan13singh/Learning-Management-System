import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Button, Card, CardContent,
    Dialog, DialogTitle, DialogContent, TextField,
    MenuItem, LinearProgress, Chip, IconButton, List, ListItem, ListItemText, ListItemAvatar, Avatar
} from '@mui/material';
import { Add, People, Event, TrendingUp, Warning, PersonAdd, Delete, Edit } from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';

const BatchManager = () => {
    const theme = useTheme();
    const [batches, setBatches] = useState([]);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [open, setOpen] = useState(false);
    const [viewStudentsOpen, setViewStudentsOpen] = useState(false);
    const [addStudentOpen, setAddStudentOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [selectedStudentId, setSelectedStudentId] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        courseIds: [],
        maxStrength: 30,
        startDate: '',
        schedule: []
    });

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchBatches();
        fetchCourses();
        fetchStudents();
    }, []);

    const fetchBatches = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/features/batches', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBatches(res.data.batches);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/courses/teacher/my-courses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(res.data.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/auth/students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(res.data.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleOpenCreate = () => {
        setFormData({
            name: '',
            courseIds: [],
            maxStrength: 30,
            startDate: '',
            schedule: []
        });
        setIsEditing(false);
        setSelectedBatch(null);
        setOpen(true);
    };

    const handleEdit = (batch) => {
        setFormData({
            name: batch.name,
            courseIds: batch.courses ? batch.courses.map(c => c._id) : (batch.course ? [batch.course._id] : []),
            maxStrength: batch.maxStrength,
            startDate: batch.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : '',
            endDate: batch.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : '',
            schedule: batch.schedule || []
        });
        setSelectedBatch(batch);
        setIsEditing(true);
        setOpen(true);
    };

    const handleDelete = async (batchId) => {
        if (!window.confirm('Are you sure you want to delete this batch? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/features/batches/${batchId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchBatches();
            alert('Batch deleted successfully');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error deleting batch');
        }
    };

    const handleSave = async () => {
        if (!formData.name || formData.courseIds.length === 0 || !formData.startDate) {
            alert('Please fill in all required fields (Name, Courses, Start Date)');
            return;
        }

        const payload = { ...formData };
        if (!payload.endDate) delete payload.endDate;

        try {
            const token = localStorage.getItem('token');
            if (isEditing && selectedBatch) {
                await axios.put(`http://localhost:5000/api/features/batches/${selectedBatch._id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Batch updated successfully!');
            } else {
                await axios.post('http://localhost:5000/api/features/batches', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Batch created successfully!');
            }
            setOpen(false);
            fetchBatches();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error saving batch');
        }
    };

    const handleAddStudent = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/features/batches/add-student', {
                batchId: selectedBatch._id,
                studentId: selectedStudentId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAddStudentOpen(false);
            // Refresh batch data to show new student
            fetchBatches();
            // Also update selectedBatch if it's currently being viewed
            const updatedBatches = await axios.get('http://localhost:5000/api/features/batches', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updatedBatch = updatedBatches.data.batches.find(b => b._id === selectedBatch._id);
            setSelectedBatch(updatedBatch);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error adding student');
        }
    };

    const openStudentView = (batch) => {
        setSelectedBatch(batch);
        setViewStudentsOpen(true);
    };

    const getHealthColor = (score) => {
        if (score >= 80) return theme.palette.success.main;
        if (score >= 50) return theme.palette.warning.main;
        return theme.palette.error.main;
    };

    return (
        <Box sx={{ p: 4, minHeight: '100vh', background: theme.palette.background.default }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', background: theme.palette.gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Batch Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleOpenCreate}
                    sx={{ borderRadius: '20px', background: theme.palette.gradients.secondary }}
                >
                    Create Batch
                </Button>
            </Box>

            <Grid container spacing={3}>
                {batches.map((batch) => (
                    <Grid item xs={12} md={6} lg={4} key={batch._id}>
                        <Card className="glass-card">
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h6" fontWeight="bold">{batch.name}</Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <IconButton size="small" onClick={() => handleEdit(batch)} sx={{ color: theme.palette.primary.main }}>
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDelete(batch._id)} sx={{ color: theme.palette.error.main }}>
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {batch.courses && batch.courses.length > 0 ? (
                                        batch.courses.map((course) => (
                                            <Chip
                                                key={course._id}
                                                label={course.title}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontSize: '0.7rem' }}
                                            />
                                        ))
                                    ) : batch.course ? (
                                        <Chip
                                            label={batch.course.title || 'Course'}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontSize: '0.7rem' }}
                                        />
                                    ) : null}
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                                    <People fontSize="small" sx={{ mr: 1 }} />
                                    <Typography variant="body2">
                                        {batch.students?.length || 0} / {batch.maxStrength} Students
                                    </Typography>
                                </Box>

                                <Box sx={{ mt: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" fontWeight="600">Batch Health</Typography>
                                        <Typography variant="body2" fontWeight="bold" sx={{ color: getHealthColor(batch.healthScore) }}>
                                            {batch.healthScore}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={batch.healthScore || 0}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            bgcolor: 'rgba(0,0,0,0.05)',
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: getHealthColor(batch.healthScore)
                                            }
                                        }}
                                    />
                                </Box>

                                <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        sx={{ borderRadius: '12px' }}
                                        onClick={() => openStudentView(batch)}
                                    >
                                        View Students
                                    </Button>
                                    <Button variant="outlined" size="small" fullWidth sx={{ borderRadius: '12px' }}>
                                        Attendance
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Create/Edit Batch Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle>{isEditing ? 'Edit Batch' : 'Create New Batch'}</DialogTitle>
                <DialogContent>
                    {courses.length === 0 && (
                        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                            You need to create a course first before creating a batch.
                        </Typography>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Batch Name"
                        fullWidth
                        variant="outlined"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        sx={{ mb: 2, mt: 1 }}
                    />
                    <TextField
                        select
                        margin="dense"
                        label="Courses"
                        fullWidth
                        variant="outlined"
                        SelectProps={{
                            multiple: true,
                            value: formData.courseIds,
                            onChange: (e) => setFormData({ ...formData, courseIds: e.target.value }),
                            renderValue: (selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => {
                                        const course = courses.find(c => c._id === value);
                                        return <Chip key={value} label={course?.title} size="small" />;
                                    })}
                                </Box>
                            )
                        }}
                        value={formData.courseIds}
                        sx={{ mb: 2 }}
                        disabled={courses.length === 0}
                    >
                        {courses.map((course) => (
                            <MenuItem key={course._id} value={course._id}>
                                {course.title}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        margin="dense"
                        label="Max Strength"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={formData.maxStrength}
                        onChange={(e) => setFormData({ ...formData, maxStrength: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Start Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="End Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        value={formData.endDate || ''}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSave}
                        disabled={courses.length === 0}
                        sx={{ mt: 2, background: theme.palette.gradients.primary }}
                    >
                        {isEditing ? 'Update Batch' : 'Create Batch'}
                    </Button>
                </DialogContent>
            </Dialog>

            {/* View Students Dialog */}
            <Dialog
                open={viewStudentsOpen}
                onClose={() => setViewStudentsOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Students in {selectedBatch?.name}
                    <Button
                        startIcon={<PersonAdd />}
                        variant="contained"
                        size="small"
                        onClick={() => setAddStudentOpen(true)}
                        sx={{ borderRadius: '20px', background: theme.palette.gradients.secondary }}
                    >
                        Add Student
                    </Button>
                </DialogTitle>
                <DialogContent>
                    {selectedBatch?.students?.length > 0 ? (
                        <List>
                            {selectedBatch.students.map((student) => (
                                <ListItem key={student._id}>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                                            {student.name ? student.name[0] : 'S'}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={student.name}
                                        secondary={student.email}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                            No students added to this batch yet.
                        </Typography>
                    )}
                </DialogContent>
            </Dialog>

            {/* Add Student Dialog */}
            <Dialog
                open={addStudentOpen}
                onClose={() => setAddStudentOpen(false)}
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle>Add Student to Batch</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Select a student to add to <b>{selectedBatch?.name}</b>.
                    </Typography>
                    <TextField
                        select
                        label="Select Student"
                        fullWidth
                        variant="outlined"
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        sx={{ minWidth: 300 }}
                    >
                        {students.map((student) => (
                            <MenuItem key={student._id} value={student._id}>
                                {student.name} ({student.email})
                            </MenuItem>
                        ))}
                    </TextField>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleAddStudent}
                        sx={{ mt: 3, background: theme.palette.gradients.primary }}
                    >
                        Add Student
                    </Button>
                </DialogContent>
            </Dialog>

        </Box>
    );
};

export default BatchManager;
