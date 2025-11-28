import React, { useState, useEffect } from 'react';
import {
    Box, Stepper, Step, StepLabel, Button, Typography, TextField,
    MenuItem, Grid, Card, CardContent, IconButton, List, ListItem,
    ListItemText, ListItemSecondaryAction, Paper, Tabs, Tab
} from '@mui/material';
import { CloudUpload, Delete, PersonAdd, CheckCircle } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const steps = ['Course Details', 'Create Batch', 'Add Students'];

const CreateCourse = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);

    // Form States
    const [courseData, setCourseData] = useState({
        title: '', description: '', category: '', class: '', price: '',
        difficulty: 'Beginner', language: 'English', tags: ''
    });
    const [batchData, setBatchData] = useState({
        name: '', startDate: '', endDate: '', maxStrength: 30
    });
    const [schedule, setSchedule] = useState([]);
    const [tempSlot, setTempSlot] = useState({ day: 'Monday', startTime: '', endTime: '' });
    const [students, setStudents] = useState([]); // List of students to add
    const [csvFile, setCsvFile] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [manualData, setManualData] = useState({ name: '', email: '', phone: '' });

    // Created IDs
    const [createdCourseId, setCreatedCourseId] = useState(null);
    const [createdBatchId, setCreatedBatchId] = useState(null);

    const handleNext = async () => {
        if (activeStep === 0) {
            await createCourse();
        } else if (activeStep === 1) {
            await createBatch();
        } else {
            navigate('/teacher/dashboard');
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const createCourse = async () => {
        // Validation
        if (!courseData.title || !courseData.description || !courseData.category || !courseData.class) {
            alert('Please fill in all required fields (Title, Description, Category, Class)');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/courses', {
                ...courseData,
                tags: courseData.tags ? courseData.tags.split(',').map(t => t.trim()) : []
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCreatedCourseId(res.data.data._id);
            setActiveStep(1);
        } catch (error) {
            console.error(error);
            alert(`Error: ${error.response?.data?.message || error.message || JSON.stringify(error)}`);
        } finally {
            setLoading(false);
        }
    };

    const createBatch = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/features/batches', {
                ...batchData,
                schedule,
                courseId: createdCourseId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCreatedBatchId(res.data.batch._id);
            setActiveStep(2);
        } catch (error) {
            console.error(error);
            alert('Error creating batch');
        } finally {
            setLoading(false);
        }
    };

    const handleManualAdd = async () => {
        if (!manualData.name || !manualData.email) {
            alert('Name and Email are required');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            // Register User
            const res = await axios.post('http://localhost:5000/api/auth/bulk-register', {
                students: [manualData]
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const createdUsers = res.data.users;
            const studentIds = createdUsers.map(u => u._id);

            // Add to Batch
            if (createdBatchId && studentIds.length > 0) {
                await axios.post('http://localhost:5000/api/features/batches/add-students', {
                    batchId: createdBatchId,
                    studentIds
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            alert(`Student added successfully!`);
            setStudents([...students, ...createdUsers]); // Update local list
            setManualData({ name: '', email: '', phone: '' }); // Reset form
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error adding student');
        }
    };

    const handleCsvUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const rows = text.split('\n').slice(1); // Skip header
            const parsedStudents = rows.map(row => {
                const [name, email, phone] = row.split(',');
                return { name: name?.trim(), email: email?.trim(), phone: phone?.trim() };
            }).filter(s => s.email); // Filter empty lines

            // Bulk Register
            try {
                const token = localStorage.getItem('token');
                const res = await axios.post('http://localhost:5000/api/auth/bulk-register', {
                    students: parsedStudents
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Add to batch logic
                const createdUsers = res.data.users;
                const studentIds = createdUsers.map(u => u._id);

                if (createdBatchId && studentIds.length > 0) {
                    await axios.post('http://localhost:5000/api/features/batches/add-students', {
                        batchId: createdBatchId,
                        studentIds
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }

                alert(`Processed: ${res.data.message}. Students added to batch.`);
                setStudents([...students, ...createdUsers]);
            } catch (error) {
                console.error(error);
                alert('Error uploading CSV or adding students to batch');
            }
        };
        reader.readAsText(file);
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Course Title" value={courseData.title} onChange={(e) => setCourseData({ ...courseData, title: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={4} label="Description" value={courseData.description} onChange={(e) => setCourseData({ ...courseData, description: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField select fullWidth label="Category" value={courseData.category} onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}>
                                {['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Social Studies', 'Computer Science', 'Other'].map((option) => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField select fullWidth label="Class/Grade" value={courseData.class} onChange={(e) => setCourseData({ ...courseData, class: e.target.value })}>
                                {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Other'].map((option) => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField select fullWidth label="Difficulty" value={courseData.difficulty} onChange={(e) => setCourseData({ ...courseData, difficulty: e.target.value })}>
                                {['Beginner', 'Intermediate', 'Advanced'].map((option) => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="Language" value={courseData.language} onChange={(e) => setCourseData({ ...courseData, language: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Tags (comma separated)" value={courseData.tags} onChange={(e) => setCourseData({ ...courseData, tags: e.target.value })} />
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Batch Name" value={batchData.name} onChange={(e) => setBatchData({ ...batchData, name: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth type="date" label="Start Date" InputLabelProps={{ shrink: true }} value={batchData.startDate} onChange={(e) => setBatchData({ ...batchData, startDate: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth type="date" label="End Date" InputLabelProps={{ shrink: true }} value={batchData.endDate} onChange={(e) => setBatchData({ ...batchData, endDate: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>Weekly Schedule</Typography>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                                <TextField select label="Day" value={tempSlot.day} onChange={(e) => setTempSlot({ ...tempSlot, day: e.target.value })} sx={{ minWidth: 120 }}>
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                        <MenuItem key={day} value={day}>{day}</MenuItem>
                                    ))}
                                </TextField>
                                <TextField type="time" label="Start" InputLabelProps={{ shrink: true }} value={tempSlot.startTime} onChange={(e) => setTempSlot({ ...tempSlot, startTime: e.target.value })} />
                                <TextField type="time" label="End" InputLabelProps={{ shrink: true }} value={tempSlot.endTime} onChange={(e) => setTempSlot({ ...tempSlot, endTime: e.target.value })} />
                                <Button variant="outlined" onClick={() => {
                                    if (tempSlot.startTime && tempSlot.endTime) {
                                        setSchedule([...schedule, tempSlot]);
                                        setTempSlot({ ...tempSlot, startTime: '', endTime: '' });
                                    }
                                }}>Add</Button>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {schedule.map((slot, index) => (
                                    <Box key={index} sx={{ bgcolor: 'primary.light', color: 'white', px: 2, py: 1, borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="caption">{slot.day}: {slot.startTime} - {slot.endTime}</Typography>
                                        <Delete fontSize="small" sx={{ cursor: 'pointer' }} onClick={() => setSchedule(schedule.filter((_, i) => i !== index))} />
                                    </Box>
                                ))}
                            </Box>
                        </Grid>
                    </Grid>
                );
            case 2:
                return (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" gutterBottom>Add Students</Typography>

                        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} centered sx={{ mb: 3 }}>
                            <Tab label="Manual Entry" />
                            <Tab label="Upload CSV" />
                        </Tabs>

                        {tabValue === 0 && (
                            <Box sx={{ maxWidth: 500, mx: 'auto', textAlign: 'left' }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Name" value={manualData.name} onChange={(e) => setManualData({ ...manualData, name: e.target.value })} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Email" value={manualData.email} onChange={(e) => setManualData({ ...manualData, email: e.target.value })} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Phone" value={manualData.phone} onChange={(e) => setManualData({ ...manualData, phone: e.target.value })} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button variant="contained" fullWidth onClick={handleManualAdd} startIcon={<PersonAdd />}>
                                            Add Student
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {tabValue === 1 && (
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Upload a CSV file with columns: Name, Email, Phone
                                </Typography>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<CloudUpload />}
                                    sx={{ mb: 2 }}
                                >
                                    Upload CSV
                                    <input type="file" hidden accept=".csv" onChange={handleCsvUpload} />
                                </Button>
                            </Box>
                        )}

                        {students.length > 0 && (
                            <Box sx={{ mt: 4, textAlign: 'left', maxWidth: 600, mx: 'auto' }}>
                                <Typography variant="subtitle1" fontWeight="bold">Added Students ({students.length})</Typography>
                                <List dense>
                                    {students.map((student, index) => (
                                        <ListItem key={index}>
                                            <ListItemText primary={student.name} secondary={student.email} />
                                            <CheckCircle color="success" fontSize="small" />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}

                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h5">All Set!</Typography>
                            <Typography color="text.secondary" sx={{ mb: 3 }}>
                                Course and Batch have been created successfully.
                            </Typography>
                            <Button variant="contained" onClick={() => navigate('/teacher/dashboard')}>
                                Go to Dashboard
                            </Button>
                        </Box>
                    </Box>
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>Create New Course</Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Card className="glass-card">
                <CardContent>
                    {renderStepContent(activeStep)}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                        <Button
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            sx={{ mr: 1 }}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={loading}
                            sx={{ background: theme.palette.gradients.primary }}
                        >
                            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default CreateCourse;
