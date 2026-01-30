import React, { useState, useEffect } from 'react';
import {
    Card,
    Typography,
    Box,
    Button,
    Grid,
    LinearProgress,
    Chip,
    Dialog,
    DialogContent,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    Alert
} from '@mui/material';
import {
    FitnessCenter,
    TrendingUp,
    Warning,
    CheckCircle,
    Cancel
} from '@mui/icons-material';
import api from '../../api/axios';

const AIPracticeWidget = () => {
    // Mock weak topics - In real app, fetch from analytics
    const [weakTopics, setWeakTopics] = useState([]);

    useEffect(() => {
        const fetchWeakAreas = async () => {
            try {
                // Fetch all quiz attempts
                const { data } = await api.get('/quizzes/my-attempts/all');

                if (data.success && data.data.length > 0) {
                    const attempts = data.data;

                    // Group by Course
                    const courseStats = {};
                    attempts.forEach(attempt => {
                        const courseTitle = attempt.quiz?.course?.title || 'General';
                        if (!courseStats[courseTitle]) {
                            courseStats[courseTitle] = { totalScore: 0, count: 0, subject: 'Course' };
                        }
                        courseStats[courseTitle].totalScore += attempt.percentage;
                        courseStats[courseTitle].count += 1;
                    });

                    // Calculate Average and Filter Weak (< 70%)
                    const calculatedTopics = Object.keys(courseStats).map(course => {
                        const avg = Math.round(courseStats[course].totalScore / courseStats[course].count);
                        return {
                            topic: course,
                            subject: 'Course', // Ideally this comes from course category
                            score: avg
                        };
                    }).sort((a, b) => a.score - b.score).slice(0, 3); // Top 3 weak areas

                    if (calculatedTopics.length > 0) {
                        setWeakTopics(calculatedTopics);
                    } else {
                        // Fallback if passing everything
                        setWeakTopics([]);
                    }
                }
            } catch (error) {
                console.error('Error fetching weak areas:', error);
            }
        };

        fetchWeakAreas();
    }, []);

    const [quizOpen, setQuizOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    const startPractice = async (topic, subject) => {
        setLoading(true);
        setQuizOpen(true);
        setQuizData(null);
        setAnswers({});
        setShowResults(false);

        try {
            const response = await api.post('/ai/practice-quiz', { topic, subject });
            if (response.data.success) {
                setQuizData(response.data.quiz);
            }
        } catch (error) {
            console.error('Quiz Gen Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (qIndex, value) => {
        setAnswers(prev => ({ ...prev, [qIndex]: value }));
    };

    const calculateScore = () => {
        let correct = 0;
        quizData.mcqs.forEach((q, idx) => {
            if (answers[idx] === q.correctAnswer) correct++;
        });
        return correct;
    };

    return (
        <Card sx={{ p: 3, borderRadius: 4, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'error.light', color: 'error.main' }}>
                    <FitnessCenter />
                </Box>
                <Typography variant="h6" fontWeight="bold">Weak Areas</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {weakTopics.length > 0 ? (
                    weakTopics.map((item, index) => (
                        <Box key={index} sx={{ p: 2, border: '1px solid #f0f0f0', borderRadius: 3, transition: 'all 0.2s', '&:hover': { bgcolor: '#fafafa' } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">{item.topic}</Typography>
                                <Chip label={`${item.score}%`} size="small" color={item.score < 50 ? "error" : "warning"} variant="soft" />
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={item.score}
                                color={item.score < 50 ? "error" : "warning"}
                                sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(0,0,0, 0.05)', mb: 2 }}
                            />
                            <Button
                                variant="outlined"
                                size="small"
                                fullWidth
                                color="primary"
                                startIcon={<TrendingUp />}
                                onClick={() => startPractice(item.topic, item.subject)}
                            >
                                Improve This
                            </Button>
                        </Box>
                    ))
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                        <CheckCircle sx={{ fontSize: 40, mb: 1, color: 'success.light' }} />
                        <Typography variant="body2">Great job! No weak areas detected yet.</Typography>
                        <Typography variant="caption">Take more quizzes to generate insights.</Typography>
                    </Box>
                )}
            </Box>

            {/* Quiz Dialog */}
            <Dialog open={quizOpen} onClose={() => setQuizOpen(false)} fullWidth maxWidth="md">
                <DialogContent>
                    {loading ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography>Generating personalized questions...</Typography>
                        </Box>
                    ) : quizData ? (
                        <Box>
                            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h5" fontWeight="bold">Practice Quiz</Typography>
                                {showResults && (
                                    <Chip
                                        label={`Score: ${calculateScore()} / ${quizData.mcqs.length}`}
                                        color={calculateScore() > 5 ? 'success' : 'warning'}
                                        sx={{ fontSize: '1.2rem', py: 2 }}
                                    />
                                )}
                            </Box>

                            {quizData.mcqs.map((q, idx) => (
                                <Card key={idx} sx={{ mb: 3, p: 3, border: '1px solid #eee' }}>
                                    <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                                        {idx + 1}. {q.question}
                                    </Typography>
                                    <FormControl component="fieldset">
                                        <RadioGroup
                                            value={answers[idx] || ''}
                                            onChange={(e) => handleAnswer(idx, e.target.value)}
                                        >
                                            {q.options.map((opt, optIdx) => {
                                                const optionLabel = ['A', 'B', 'C', 'D'][optIdx];
                                                const isSelected = answers[idx] === optionLabel;
                                                const isCorrect = q.correctAnswer === optionLabel;

                                                let style = {};
                                                if (showResults) {
                                                    if (isCorrect) style = { bgcolor: '#e8f5e9', borderRadius: 2, pr: 2 };
                                                    else if (isSelected && !isCorrect) style = { bgcolor: '#ffebee', borderRadius: 2, pr: 2 };
                                                }

                                                return (
                                                    <Box key={optionLabel} sx={style}>
                                                        <FormControlLabel
                                                            value={optionLabel}
                                                            control={<Radio disabled={showResults} />}
                                                            label={`${optionLabel}. ${opt}`}
                                                        />
                                                    </Box>
                                                );
                                            })}
                                        </RadioGroup>
                                    </FormControl>
                                    {showResults && (
                                        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Explanation:</strong> {q.explanation}
                                            </Typography>
                                        </Box>
                                    )}
                                </Card>
                            ))}

                            {!showResults ? (
                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    onClick={() => setShowResults(true)}
                                >
                                    Submit
                                </Button>
                            ) : (
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => setQuizOpen(false)}
                                >
                                    Close & Return to Dashboard
                                </Button>
                            )}
                        </Box>
                    ) : (
                        <Alert severity="error">Failed to load quiz.</Alert>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default AIPracticeWidget;
