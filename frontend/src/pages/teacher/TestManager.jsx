import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Card, CardContent, Grid, Dialog, DialogTitle,
    DialogContent, TextField, MenuItem, Chip, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton, Stepper, Step, StepLabel,
    FormControl, InputLabel, Select, Switch, FormControlLabel
} from '@mui/material';
import { Add, Assignment, CheckCircle, WhatsApp, Edit, Close, Delete } from '@mui/icons-material';

import axios from 'axios';
import { useTheme } from '@mui/material/styles';

const TestManager = () => {
    const theme = useTheme();
    const [tests, setTests] = useState([]);
    const [courses, setCourses] = useState([]);
    const [open, setOpen] = useState(false);
    const [gradingOpen, setGradingOpen] = useState(false);
    const [selectedTest, setSelectedTest] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [isEditing, setIsEditing] = useState(false);


    // Form State
    const [formData, setFormData] = useState({
        title: '',
        courseId: '',
        date: '',
        totalMarks: 100,
        type: 'SUBJECTIVE',
        syllabus: '',
        notify: true,
        // Quiz-specific fields
        isOnlineQuiz: false,
        timeLimit: 60,
        passingPercentage: 40,
        randomizeQuestions: false,
        randomizeOptions: false,
        enableProctoring: true,
        maxViolations: 2,
        questions: []
    });

    // ... (Question builder state remains same)
    const [currentQuestion, setCurrentQuestion] = useState({
        questionText: '',
        questionType: 'MCQ',
        options: ['', '', '', ''],
        correctAnswer: '',
        correctAnswers: [],
        points: 1
    });

    // ... (Grading State remains same)
    const [gradingData, setGradingData] = useState([]);

    useEffect(() => {
        fetchTests();
        fetchCourses();
    }, []);

    // ... (fetchTests, fetchCourses remain same)
    const fetchTests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/features/tests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Tests response:', res.data);
            setTests(res.data.data);
        } catch (error) {
            console.error('Error fetching tests:', error);
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

    // ... (Question management functions remain same)
    const addQuestion = () => {
        if (!currentQuestion.questionText.trim()) {
            alert('Please enter a question');
            return;
        }

        const newQuestion = {
            ...currentQuestion,
            _id: Date.now().toString() // Temporary ID for frontend
        };

        setFormData({
            ...formData,
            questions: [...formData.questions, newQuestion]
        });

        // Reset current question
        setCurrentQuestion({
            questionText: '',
            questionType: 'MCQ',
            options: ['', '', '', ''],
            correctAnswer: '',
            correctAnswers: [],
            points: 1
        });
    };

    const removeQuestion = (index) => {
        const newQuestions = formData.questions.filter((_, i) => i !== index);
        setFormData({ ...formData, questions: newQuestions });
    };

    const updateQuestionOption = (index, value) => {
        const newOptions = [...currentQuestion.options];
        newOptions[index] = value;
        setCurrentQuestion({ ...currentQuestion, options: newOptions });
    };

    const addOption = () => {
        setCurrentQuestion({
            ...currentQuestion,
            options: [...currentQuestion.options, '']
        });
    };

    const removeOption = (index) => {
        const newOptions = currentQuestion.options.filter((_, i) => i !== index);
        setCurrentQuestion({ ...currentQuestion, options: newOptions });
    };


    const handleOpenCreate = () => {
        setFormData({
            title: '',
            courseId: '',
            date: '',
            totalMarks: 100,
            type: 'SUBJECTIVE',
            syllabus: '',
            notify: true,
            isOnlineQuiz: false,
            timeLimit: 60,
            passingPercentage: 40,
            randomizeQuestions: false,
            randomizeOptions: false,
            enableProctoring: true,
            maxViolations: 2,
            questions: []
        });
        setIsEditing(false);
        setSelectedTest(null);
        setActiveStep(0);
        setOpen(true);
    };

    const handleEdit = (test) => {
        setFormData({
            title: test.title,
            courseId: test.course?._id || test.course,
            date: test.date ? new Date(test.date).toISOString().split('T')[0] : '',
            totalMarks: test.totalMarks,
            type: test.type,
            syllabus: test.syllabus,
            notify: false, // Don't notify on edit by default
            isOnlineQuiz: test.type === 'ONLINE_QUIZ',
            timeLimit: test.timeLimit || 60,
            passingPercentage: test.passingPercentage || 40,
            randomizeQuestions: test.randomizeQuestions || false,
            randomizeOptions: test.randomizeOptions || false,
            enableProctoring: test.enableProctoring !== undefined ? test.enableProctoring : true,
            maxViolations: test.maxViolations || 2,
            questions: test.questions || []
        });
        setSelectedTest(test);
        setIsEditing(true);
        setActiveStep(0);
        setOpen(true);
    };

    const handleDelete = async (testId) => {
        if (!window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/features/tests/${testId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTests();
            alert('Test deleted successfully');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error deleting test');
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');

            // Clean questions data - remove temporary _id if it's a number (newly added)
            // Backend should handle _id if it's a valid ObjectId string
            const cleanedData = {
                ...formData,
                questions: formData.questions.map(q => {
                    // If _id is numeric string (Date.now()), remove it to let backend generate new ObjectId
                    // If it's a real ObjectId, keep it for updates
                    if (q._id && !isNaN(q._id)) {
                        const { _id, ...cleanQuestion } = q;
                        return cleanQuestion;
                    }
                    return q;
                })
            };

            if (isEditing && selectedTest) {
                await axios.put(`http://localhost:5000/api/features/tests/${selectedTest._id}`, cleanedData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Test updated successfully!');
            } else {
                const res = await axios.post('http://localhost:5000/api/features/tests', cleanedData, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (formData.notify) {
                    const course = courses.find(c => c._id === formData.courseId);
                    const message = `Dear Parents, a ${formData.type} test on "${formData.title}" for ${course?.title} (Syllabus: ${formData.syllabus}) is scheduled for ${new Date(formData.date).toDateString()}. Total Marks: ${formData.totalMarks}. Please ensure your ward prepares well.`;
                    const url = `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;
                    window.open(url, '_blank');
                }
                alert('Test created successfully!');
            }

            setOpen(false);
            fetchTests();
            setActiveStep(0);
        } catch (error) {
            console.error('Full error:', error);
            console.error('Error response:', error.response?.data);
            alert(`Error saving test: ${error.response?.data?.message || error.message}`);
        }
    };

    // ... (openGrading, handleGradeChange, saveGrades, calculateAverage remain same)
    const openGrading = async (test) => {
        setSelectedTest(test);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/features/tests/${test._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const results = res.data.data.results.map(r => ({
                studentId: r.student._id || r.student,
                name: r.student.name || 'Unknown',
                marks: r.marks,
                status: r.status
            }));

            setGradingData(results);
            setGradingOpen(true);
        } catch (error) {
            console.error(error);
        }
    };

    const handleGradeChange = (index, field, value) => {
        const newData = [...gradingData];
        newData[index][field] = value;
        setGradingData(newData);
    };

    const saveGrades = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/features/tests/${selectedTest._id}/results`, {
                results: gradingData
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGradingOpen(false);
            fetchTests();
            alert('Grades saved successfully!');
        } catch (error) {
            console.error(error);
            alert('Error saving grades');
        }
    };

    const calculateAverage = () => {
        if (gradingData.length === 0) return 0;
        const total = gradingData.reduce((sum, item) => sum + Number(item.marks || 0), 0);
        return (total / gradingData.length).toFixed(1);
    };

    const steps = ['Basic Info', 'Details', 'Review'];

    return (
        <Box component="main" sx={{ p: 4 }}>
            <Box component="header" sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">Test Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add aria-hidden="true" />}
                    onClick={handleOpenCreate}
                    className="btn-animate"
                    sx={{ borderRadius: '20px', background: theme.palette.gradients.secondary }}
                    aria-label="Create new test"
                >
                    Create Test
                </Button>
            </Box>

            <Grid container spacing={3} component="section" aria-label="Tests List">
                {tests.map((test) => (
                    <Grid item xs={12} md={6} lg={4} key={test._id}>
                        <Card className="glass-card" component="article">
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="h6" component="h2" fontWeight="bold">{test.title}</Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Chip label={test.type} size="small" color="primary" variant="outlined" />
                                        <IconButton size="small" onClick={() => handleEdit(test)} sx={{ color: theme.palette.primary.main }}>
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDelete(test._id)} sx={{ color: theme.palette.error.main }}>
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {test.course?.title} • {new Date(test.date).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    Syllabus: {test.syllabus}
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        onClick={() => openGrading(test)}
                                        className="btn-animate"
                                        aria-label={`Grade results for ${test.title}`}
                                    >
                                        Grade / Results
                                    </Button>
                                    {(test.type === 'ONLINE_QUIZ' || test.isOnlineQuiz) && (
                                        <Button
                                            variant="contained"
                                            color="warning"
                                            fullWidth
                                            size="small"
                                            onClick={() => {
                                                // Assuming we have useNavigate here.
                                                // TestManager uses useState, useEffect. Need to check if it imports useNavigate?
                                                // It does NOT. I need to add it or use window.location.
                                                // I'll use window.location for simplicity in this replace block, or fix imports in next step.
                                                window.location.href = `/teacher/test/${test._id}/monitor`;
                                            }}
                                        >
                                            Monitor Live
                                        </Button>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Create/Edit Test Wizard */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4 } }}
                aria-labelledby="create-test-dialog-title"
            >
                <DialogTitle id="create-test-dialog-title">{isEditing ? 'Edit Test' : 'Create New Test'}</DialogTitle>
                <DialogContent>
                    <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }} alternativeLabel>
                        {steps.map((label) => (
                            <Step key={label}><StepLabel>{label}</StepLabel></Step>
                        ))}
                    </Stepper>

                    {activeStep === 0 && (
                        <Box role="group" aria-label="Basic Information">
                            <TextField
                                label="Test Title"
                                fullWidth
                                margin="normal"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                            <TextField
                                select
                                label="Course"
                                fullWidth
                                margin="normal"
                                value={formData.courseId}
                                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                required
                            >
                                {courses.map((c) => (
                                    <MenuItem key={c._id} value={c._id}>{c.title}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                type="date"
                                label="Date"
                                fullWidth
                                margin="normal"
                                InputLabelProps={{ shrink: true }}
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </Box>
                    )}

                    {activeStep === 1 && (
                        <Box role="group" aria-label="Test Details">
                            <TextField
                                select
                                label="Test Type"
                                fullWidth
                                margin="normal"
                                value={formData.type}
                                onChange={(e) => {
                                    const isQuiz = e.target.value === 'ONLINE_QUIZ';
                                    setFormData({
                                        ...formData,
                                        type: e.target.value,
                                        isOnlineQuiz: isQuiz
                                    });
                                }}
                            >
                                <MenuItem value="SUBJECTIVE">Subjective</MenuItem>
                                <MenuItem value="OBJECTIVE">Objective</MenuItem>
                                <MenuItem value="PRACTICAL">Practical</MenuItem>
                                <MenuItem value="VIVA">Viva</MenuItem>
                                <MenuItem value="ONLINE_QUIZ">Online Quiz (Auto-graded)</MenuItem>
                            </TextField>
                            <TextField
                                label="Total Marks"
                                type="number"
                                fullWidth
                                margin="normal"
                                value={formData.totalMarks}
                                onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                            />
                            <TextField
                                label="Syllabus"
                                fullWidth
                                multiline
                                rows={3}
                                margin="normal"
                                value={formData.syllabus}
                                onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
                            />

                            {/* Quiz-specific settings */}
                            {formData.isOnlineQuiz && (
                                <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(33, 150, 243, 0.1)', borderRadius: 2 }} role="group" aria-label="Online Quiz Settings">
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                                        Online Quiz Settings
                                    </Typography>

                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" gutterBottom id="time-limit-label">
                                            Time Limit: {formData.timeLimit} minutes
                                        </Typography>
                                        <input
                                            type="range"
                                            min="5"
                                            max="180"
                                            value={formData.timeLimit}
                                            onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                                            style={{ width: '100%' }}
                                            aria-labelledby="time-limit-label"
                                        />
                                    </Box>

                                    <TextField
                                        label="Passing Percentage"
                                        type="number"
                                        fullWidth
                                        margin="normal"
                                        value={formData.passingPercentage}
                                        onChange={(e) => setFormData({ ...formData, passingPercentage: parseInt(e.target.value) })}
                                        inputProps={{ min: 0, max: 100 }}
                                    />

                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.enableProctoring}
                                                onChange={(e) => setFormData({ ...formData, enableProctoring: e.target.checked })}
                                            />
                                        }
                                        label="Enable Proctoring (Tab-switch detection)"
                                    />

                                    {formData.enableProctoring && (
                                        <TextField
                                            label="Max Violations Allowed"
                                            type="number"
                                            fullWidth
                                            margin="normal"
                                            value={formData.maxViolations}
                                            onChange={(e) => setFormData({ ...formData, maxViolations: parseInt(e.target.value) })}
                                            inputProps={{ min: 0, max: 10 }}
                                            helperText="Quiz will auto-submit after this many tab switches"
                                        />
                                    )}

                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.randomizeQuestions}
                                                onChange={(e) => setFormData({ ...formData, randomizeQuestions: e.target.checked })}
                                            />
                                        }
                                        label="Randomize Question Order"
                                    />

                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.randomizeOptions}
                                                onChange={(e) => setFormData({ ...formData, randomizeOptions: e.target.checked })}
                                            />
                                        }
                                        label="Randomize Option Order"
                                    />
                                </Box>
                            )}

                            {/* Question Builder for Online Quiz */}
                            {formData.isOnlineQuiz && (
                                <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }} role="group" aria-label="Question Builder">
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="success.main">
                                        Question Builder ({formData.questions.length} questions)
                                    </Typography>

                                    {/* Question Type Selector */}
                                    <TextField
                                        select
                                        label="Question Type"
                                        fullWidth
                                        margin="normal"
                                        value={currentQuestion.questionType}
                                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionType: e.target.value })}
                                    >
                                        <MenuItem value="MCQ">Multiple Choice (Single Answer)</MenuItem>
                                        <MenuItem value="MULTIPLE_SELECT">Multiple Select</MenuItem>
                                        <MenuItem value="TRUE_FALSE">True/False</MenuItem>
                                        <MenuItem value="FILL_BLANK">Fill in the Blank</MenuItem>
                                    </TextField>

                                    {/* Question Text */}
                                    <TextField
                                        label="Question"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        margin="normal"
                                        value={currentQuestion.questionText}
                                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                                        placeholder="Enter your question here..."
                                    />

                                    {/* Options for MCQ and MULTIPLE_SELECT */}
                                    {(currentQuestion.questionType === 'MCQ' || currentQuestion.questionType === 'MULTIPLE_SELECT') && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="body2" gutterBottom>Options:</Typography>
                                            {currentQuestion.options.map((option, index) => (
                                                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                                    <TextField
                                                        size="small"
                                                        fullWidth
                                                        value={option}
                                                        onChange={(e) => updateQuestionOption(index, e.target.value)}
                                                        placeholder={`Option ${index + 1}`}
                                                        aria-label={`Option ${index + 1}`}
                                                    />
                                                    {currentQuestion.options.length > 2 && (
                                                        <IconButton size="small" onClick={() => removeOption(index)} color="error" aria-label={`Remove Option ${index + 1}`}>
                                                            <Close />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            ))}
                                            <Button size="small" onClick={addOption} sx={{ mt: 1 }}>+ Add Option</Button>

                                            {/* Correct Answer Selection */}
                                            {currentQuestion.questionType === 'MCQ' && (
                                                <TextField
                                                    select
                                                    label="Correct Answer"
                                                    fullWidth
                                                    margin="normal"
                                                    value={currentQuestion.correctAnswer}
                                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                                                >
                                                    {currentQuestion.options.map((opt, idx) => (
                                                        <MenuItem key={idx} value={opt}>{opt || `Option ${idx + 1}`}</MenuItem>
                                                    ))}
                                                </TextField>
                                            )}
                                        </Box>
                                    )}

                                    {/* True/False Options */}
                                    {currentQuestion.questionType === 'TRUE_FALSE' && (
                                        <TextField
                                            select
                                            label="Correct Answer"
                                            fullWidth
                                            margin="normal"
                                            value={currentQuestion.correctAnswer}
                                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                                        >
                                            <MenuItem value="true">True</MenuItem>
                                            <MenuItem value="false">False</MenuItem>
                                        </TextField>
                                    )}

                                    {/* Fill in the Blank Answer */}
                                    {currentQuestion.questionType === 'FILL_BLANK' && (
                                        <TextField
                                            label="Correct Answer"
                                            fullWidth
                                            margin="normal"
                                            value={currentQuestion.correctAnswer}
                                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                                            placeholder="Enter the correct answer"
                                        />
                                    )}

                                    {/* Points */}
                                    <TextField
                                        label="Points"
                                        type="number"
                                        fullWidth
                                        margin="normal"
                                        value={currentQuestion.points}
                                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
                                        inputProps={{ min: 1, max: 100 }}
                                    />

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={addQuestion}
                                        sx={{ mt: 2, background: theme.palette.gradients.success }}
                                    >
                                        Add Question
                                    </Button>

                                    {/* Questions List */}
                                    {formData.questions.length > 0 && (
                                        <Box sx={{ mt: 3 }}>
                                            <Typography variant="body2" fontWeight="bold" gutterBottom>
                                                Added Questions:
                                            </Typography>
                                            {formData.questions.map((q, index) => (
                                                <Card key={index} sx={{ mb: 1, p: 1, bgcolor: 'background.paper' }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                Q{index + 1}. {q.questionText}
                                                            </Typography>
                                                            <Chip label={q.questionType} size="small" sx={{ mt: 0.5, mr: 1 }} />
                                                            <Chip label={`${q.points} pts`} size="small" color="primary" sx={{ mt: 0.5 }} />
                                                        </Box>
                                                        <IconButton size="small" onClick={() => removeQuestion(index)} color="error" aria-label={`Remove question ${index + 1}`}>
                                                            <Close />
                                                        </IconButton>
                                                    </Box>
                                                </Card>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Box>
                    )}

                    {activeStep === 2 && (
                        <Box role="group" aria-label="Review Test">
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Summary</Typography>
                            <Typography variant="body2"><b>Title:</b> {formData.title}</Typography>
                            <Typography variant="body2"><b>Course:</b> {courses.find(c => c._id === formData.courseId)?.title}</Typography>
                            <Typography variant="body2"><b>Date:</b> {formData.date}</Typography>
                            <Typography variant="body2"><b>Type:</b> {formData.type}</Typography>
                            <Typography variant="body2"><b>Marks:</b> {formData.totalMarks}</Typography>

                            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(37, 211, 102, 0.1)', borderRadius: 2, display: 'flex', alignItems: 'center' }}>
                                <WhatsApp sx={{ color: '#25D366', mr: 2 }} aria-hidden="true" />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.notify}
                                            onChange={(e) => setFormData({ ...formData, notify: e.target.checked })}
                                            color="success"
                                        />
                                    }
                                    label="Notify Parents on WhatsApp"
                                />
                            </Box>
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        <Button disabled={activeStep === 0} onClick={() => setActiveStep(prev => prev - 1)}>Back</Button>
                        {activeStep === steps.length - 1 ? (
                            <Button variant="contained" onClick={handleSave} sx={{ background: theme.palette.gradients.primary }}>
                                {isEditing ? 'Update Test' : 'Create Test'}
                            </Button>
                        ) : (
                            <Button variant="contained" onClick={() => setActiveStep(prev => prev + 1)}>Next</Button>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Grading Modal */}
            <Dialog
                open={gradingOpen}
                onClose={() => setGradingOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4 } }}
                aria-labelledby="grading-dialog-title"
            >
                {/* ... (Grading dialog content remains same) */}
                <DialogTitle id="grading-dialog-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Grading: {selectedTest?.title}
                    <Box>
                        <Chip label={`Class Avg: ${calculateAverage()}`} color="primary" variant="outlined" sx={{ mr: 1 }} />
                        <IconButton onClick={() => setGradingOpen(false)} aria-label="Close grading modal"><Close /></IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                        <Table aria-label="Grading table">
                            <TableHead>
                                <TableRow>
                                    <TableCell scope="col">Student</TableCell>
                                    <TableCell scope="col">Status</TableCell>
                                    <TableCell scope="col">Marks (/{selectedTest?.totalMarks})</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {gradingData.map((row, index) => (
                                    <TableRow key={row.studentId}>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>
                                            <Select
                                                size="small"
                                                value={row.status}
                                                onChange={(e) => handleGradeChange(index, 'status', e.target.value)}
                                                aria-label={`Status for ${row.name}`}
                                            >
                                                <MenuItem value="PRESENT">Present</MenuItem>
                                                <MenuItem value="ABSENT">Absent</MenuItem>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={row.marks}
                                                onChange={(e) => handleGradeChange(index, 'marks', e.target.value)}
                                                disabled={row.status === 'ABSENT'}
                                                inputProps={{ max: selectedTest?.totalMarks, min: 0, 'aria-label': `Marks for ${row.name}` }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="contained" onClick={saveGrades} sx={{ background: theme.palette.gradients.primary }}>
                            Save Results
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default TestManager;
