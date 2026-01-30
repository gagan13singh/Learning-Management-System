import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    IconButton,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Grid,
    Divider,
} from '@mui/material';
import { Add, Delete, Close } from '@mui/icons-material';
import api from '../../api/axios';

const QuizCreator = ({ open, onClose, courseId, moduleId, onQuizCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [passingPercentage, setPassingPercentage] = useState(40);
    const [timeLimit, setTimeLimit] = useState(30);
    const [questions, setQuestions] = useState([
        {
            questionText: '',
            options: ['', '', '', ''],
            correctOptionIndex: 0,
            marks: 1,
        },
    ]);
    const [loading, setLoading] = useState(false);

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                questionText: '',
                options: ['', '', '', ''],
                correctOptionIndex: 0,
                marks: 1,
            },
        ]);
    };

    const removeQuestion = (index) => {
        if (questions.length > 1) {
            const newQuestions = questions.filter((_, i) => i !== index);
            setQuestions(newQuestions);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            // Validate
            if (!title) return alert('Title is required');

            const quizData = {
                title,
                description,
                course: courseId,
                moduleId,
                passingPercentage: Number(passingPercentage),
                timeLimit: Number(timeLimit),
                questions,
            };

            await api.post('/quizzes', quizData);
            onQuizCreated();
            onClose();
            // Reset form
            setTitle('');
            setDescription('');
            setQuestions([{ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, marks: 1 }]);
        } catch (error) {
            console.error('Error creating quiz:', error);
            alert(error.response?.data?.message || 'Failed to create quiz');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Create Quiz</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Quiz Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Passing Percentage (%)"
                            value={passingPercentage}
                            onChange={(e) => setPassingPercentage(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Time Limit (minutes)"
                            value={timeLimit}
                            onChange={(e) => setTimeLimit(e.target.value)}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Questions</Typography>

                {questions.map((q, qIndex) => (
                    <Box key={qIndex} sx={{ mb: 4, p: 2, bgcolor: 'background.default', borderRadius: 1, position: 'relative' }}>
                        <IconButton
                            onClick={() => removeQuestion(qIndex)}
                            sx={{ position: 'absolute', top: 8, right: 8 }}
                            color="error"
                            disabled={questions.length === 1}
                        >
                            <Delete />
                        </IconButton>

                        <Typography variant="subtitle1" gutterBottom>Question {qIndex + 1}</Typography>

                        <TextField
                            fullWidth
                            label="Question Text"
                            value={q.questionText}
                            onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                            sx={{ mb: 2 }}
                        />

                        <Grid container spacing={2}>
                            {q.options.map((option, oIndex) => (
                                <Grid item xs={6} key={oIndex}>
                                    <TextField
                                        fullWidth
                                        label={`Option ${oIndex + 1}`}
                                        value={option}
                                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <Radio
                                                    checked={q.correctOptionIndex === oIndex}
                                                    onChange={() => handleQuestionChange(qIndex, 'correctOptionIndex', oIndex)}
                                                />
                                            ),
                                        }}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                ))}

                <Button startIcon={<Add />} onClick={addQuestion} variant="outlined" fullWidth>
                    Add Question
                </Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Quiz'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default QuizCreator;
