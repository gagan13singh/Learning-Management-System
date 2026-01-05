import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Typography,
    Paper,
    Container,
    CircularProgress,
    Divider,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { AccessTime, Warning, Fullscreen } from '@mui/icons-material';
import api from '../../utils/api';
import useProctoring from '../../hooks/useProctoring';

const TestEngine = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();

    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: answer }
    const [timeLeft, setTimeLeft] = useState(0);
    const [violationModalOpen, setViolationModalOpen] = useState(false);
    const [violationMessage, setViolationMessage] = useState('');

    // --- Data Fetching ---
    useEffect(() => {
        const fetchAttempt = async () => {
            try {
                // In real implementation, get attempt by ID. 
                // Currently API uses /tests/:id/attempt which assumes 1 attempt per test.
                // We might need an endpoint to get attempt BY attemptId directly.
                // For now, using the assumption we have the TEST ID from params or fetching current attempt logic.
                // Let's assume the route is /student/test/:testId/engine
                const { data } = await api.get(`/tests/${attemptId}/attempt`); // Reusing endpoint
                if (data.success) {
                    setAttempt(data.data);
                    // Calculate Time Left
                    if (data.data.test.config.isTimed) {
                        const startTime = new Date(data.data.startTime).getTime();
                        const now = new Date().getTime();
                        const durationMs = data.data.test.config.duration * 60 * 1000;
                        const elapsed = now - startTime;
                        setTimeLeft(Math.max(0, Math.ceil((durationMs - elapsed) / 1000)));
                    }
                }
            } catch (error) {
                console.error("Failed to load test:", error);
                // Handle error (e.g., redirect if finished)
            } finally {
                setLoading(false);
            }
        };
        fetchAttempt();
    }, [attemptId]);

    // --- Proctoring Hook ---
    const handleViolation = async (type, msg) => {
        setViolationMessage(msg);
        setViolationModalOpen(true);
        // Log to backend
        try {
            await api.post(`/tests/${attemptId}/violation`, { type, evidence: msg });
        } catch (err) {
            console.error("Failed to log violation", err);
        }
    };

    const { enterFullscreen, isFullscreen, warningCount } = useProctoring(
        !loading && attempt?.status === 'InProgress',
        handleViolation
    );

    // --- Timer ---
    useEffect(() => {
        if (loading || !attempt) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmitTest();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [loading, attempt]);

    // --- Functions ---
    const handleSubmitTest = async () => {
        // Submit logic
        try {
            await api.post(`/tests/${attemptId}/submit`);
            navigate('/student/dashboard'); // Or results page
        } catch (err) {
            console.error("Submit failed", err);
        }
    };

    const handleAnswerChange = (qId, val) => {
        setAnswers(prev => ({ ...prev, [qId]: val }));
    };

    const handleSaveAnswer = async () => {
        const q = attempt.test.questions[currentQuestionIndex].questionId;
        const ans = answers[q._id];
        if (ans === undefined) return;

        try {
            await api.post(`/tests/${attemptId}/submit-answer`, {
                questionId: q._id,
                answer: ans,
                timeSpent: 0 // logic for time tracking needed
            });
        } catch (err) {
            console.error("Save failed", err);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // --- Render ---
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (!attempt) return <Alert severity="error">Test data unavailable</Alert>;

    if (!isFullscreen && attempt.status === 'InProgress') {
        return (
            <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
                <Paper sx={{ p: 4, borderRadius: 4 }}>
                    <Fullscreen sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h5" gutterBottom fontWeight="bold">Fullscreen Required</Typography>
                    <Typography gutterBottom color="text.secondary">
                        This is a proctored exam. You must enable fullscreen mode to proceed.
                    </Typography>
                    <Button variant="contained" size="large" onClick={enterFullscreen} sx={{ mt: 3 }}>
                        Enter Fullscreen & Start
                    </Button>
                </Paper>
            </Container>
        );
    }

    const currentQ = attempt.test.questions[currentQuestionIndex].questionId;

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f7fa' }}>
            {/* Header */}
            <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">{attempt.test.title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#fff0f1', color: '#d32f2f', px: 2, py: 0.5, borderRadius: 4 }}>
                        <AccessTime />
                        <Typography fontWeight="bold">{formatTime(timeLeft)}</Typography>
                    </Box>
                    <Button variant="contained" color="primary" onClick={handleSubmitTest}>Submit Test</Button>
                </Box>
            </Box>

            {/* Main Content */}
            <Container maxWidth="lg" sx={{ flex: 1, py: 4, display: 'flex', gap: 3 }}>
                {/* Question Area */}
                <Paper sx={{ flex: 3, p: 4, borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="subtitle1" color="text.secondary">Question {currentQuestionIndex + 1} of {attempt.test.questions.length}</Typography>
                        <Typography variant="subtitle2" color="primary">Marks: {currentQ.marks}</Typography>
                    </Box>
                    <Typography variant="h5" gutterBottom fontWeight="500">{currentQ.content.text}</Typography>

                    <Divider sx={{ my: 3 }} />

                    {/* Options (Assuming MCQ for MVP) */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {currentQ.options.map((opt) => (
                            <Button
                                key={opt.id}
                                variant={answers[currentQ._id] === opt.id ? "contained" : "outlined"}
                                sx={{ justifyContent: 'flex-start', py: 1.5, textAlign: 'left' }}
                                onClick={() => handleAnswerChange(currentQ._id, opt.id)}
                            >
                                {opt.id}. {opt.text}
                            </Button>
                        ))}
                    </Box>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleSaveAnswer}
                        >
                            Save Answer
                        </Button>
                        <Button
                            variant="contained"
                            disabled={currentQuestionIndex === attempt.test.questions.length - 1}
                            onClick={() => {
                                handleSaveAnswer();
                                setCurrentQuestionIndex(prev => prev + 1);
                            }}
                        >
                            Next
                        </Button>
                    </Box>
                </Paper>

                {/* Sidebar Navigation */}
                <Paper sx={{ flex: 1, p: 2, borderRadius: 3, height: 'fit-content' }}>
                    <Typography variant="h6" gutterBottom>Question Palette</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {attempt.test.questions.map((q, idx) => (
                            <Box
                                key={idx}
                                onClick={() => setCurrentQuestionIndex(idx)}
                                sx={{
                                    width: 35,
                                    height: 35,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    bgcolor: answers[q.questionId._id] ? '#4caf50' : '#e0e0e0',
                                    color: answers[q.questionId._id] ? 'white' : 'black',
                                    border: idx === currentQuestionIndex ? '2px solid #1976d2' : 'none'
                                }}
                            >
                                {idx + 1}
                            </Box>
                        ))}
                    </Box>
                </Paper>
            </Container>

            {/* Violation Modal */}
            <Dialog open={violationModalOpen} onClose={() => setViolationModalOpen(false)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
                    <Warning /> Warning: Proctoring Violation
                </DialogTitle>
                <DialogContent>
                    <Typography>{violationMessage}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        This incident has been logged. Multiple violations may lead to disqualification.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViolationModalOpen(false)} variant="contained" color="warning">
                        I Understand
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TestEngine;
