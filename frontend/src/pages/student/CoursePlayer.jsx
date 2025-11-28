import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Button,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Alert,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    LinearProgress,
    Chip,
} from '@mui/material';
import {
    PlayCircle,
    Description,
    Quiz,
    ExpandMore,
    CheckCircle,
    ArrowBack,
    Lock,
    Download,
} from '@mui/icons-material';
import ReactPlayer from 'react-player';
import Navbar from '../../components/common/Navbar';
import api from '../../utils/api';

const CoursePlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [activeLecture, setActiveLecture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quizState, setQuizState] = useState(null); // null, 'taking', 'result'
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [progress, setProgress] = useState({}); // Map of lectureId -> boolean (completed)
    const [courseProgress, setCourseProgress] = useState(0);
    const [certificateId, setCertificateId] = useState(null);

    useEffect(() => {
        fetchCourse();
        fetchProgress();
    }, [id]);

    const fetchCourse = async () => {
        try {
            const response = await api.get(`/courses/${id}`);
            setCourse(response.data.data);

            // Set first lecture as active if available
            if (response.data.data.modules?.[0]?.lectures?.[0]) {
                setActiveLecture(response.data.data.modules[0].lectures[0]);
            }
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProgress = async () => {
        try {
            const response = await api.get(`/enrollments/${id}/progress`);
            const { enrollment } = response.data.data;

            // Map completed lectures
            const progressMap = {};
            enrollment.completedLectures.forEach(cl => {
                progressMap[cl.lectureId] = true;
            });
            setProgress(progressMap);
            setCourseProgress(enrollment.progress);
            setCertificateId(enrollment.certificate);
        } catch (error) {
            console.error('Error fetching progress:', error);
        }
    };

    const handleLectureClick = (lecture) => {
        setActiveLecture(lecture);
        setQuizState(null);
        setQuizAnswers({});
        setQuizResult(null);
    };

    const updateProgress = async (lectureId, moduleId, type) => {
        try {
            // For video, we might want to track duration, but for now simple completion
            await api.post('/enrollments/progress', {
                courseId: id,
                moduleId,
                lectureId,
                watchTime: 100, // Mock full watch
                duration: 100,
                lastWatchedPosition: 100,
            });

            // Refresh progress
            await fetchProgress();
        } catch (error) {
            console.error('Error updating progress:', error);
            alert('Failed to update progress. Please try again.');
        }
    };

    const handleVideoProgress = (state) => {
        // Mark as complete if watched > 90%
        if (state.played > 0.9 && !progress[activeLecture._id]) {
            // Find module ID
            const module = course.modules.find(m => m.lectures.some(l => l._id === activeLecture._id));
            if (module) {
                updateProgress(activeLecture._id, module._id, 'video');
            }
        }
    };

    const handleMarkAsCompleted = () => {
        if (!progress[activeLecture._id]) {
            const module = course.modules.find(m => m.lectures.some(l => l._id === activeLecture._id));
            if (module) {
                updateProgress(activeLecture._id, module._id, 'text');
            }
        }
    };

    const handleStartQuiz = async (quizId) => {
        try {
            const response = await api.get(`/quizzes/${quizId}`);
            setActiveLecture({ ...activeLecture, quizData: response.data.data });
            setQuizState('taking');
        } catch (error) {
            console.error('Error fetching quiz:', error);
        }
    };

    const handleQuizSubmit = async () => {
        try {
            const answers = Object.entries(quizAnswers).map(([qId, oIndex]) => ({
                questionId: qId,
                selectedOptionIndex: oIndex,
            }));

            const response = await api.post(`/quizzes/${activeLecture.quizData._id}/submit`, {
                answers,
                timeTaken: 0,
            });

            setQuizResult(response.data);
            setQuizState('result');

            // If passed, mark as complete
            if (response.data.data.attempt.passed) {
                const module = course.modules.find(m => m.lectures.some(l => l._id === activeLecture._id));
                if (module) {
                    updateProgress(activeLecture._id, module._id, 'quiz');
                }
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
        }
    };

    const handleDownloadCertificate = () => {
        navigate(`/certificate/${certificateId}`);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!course) return <Typography>Course not found</Typography>;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Navbar />
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/student/dashboard')}
                    >
                        Back to Dashboard
                    </Button>
                    {courseProgress >= 100 && certificateId && (
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<Download />}
                            onClick={handleDownloadCertificate}
                        >
                            Download Certificate
                        </Button>
                    )}
                </Box>

                <Grid container spacing={3}>
                    {/* Main Content Area */}
                    <Grid item xs={12} md={8}>
                        <Paper elevation={2} sx={{ p: 3, minHeight: '60vh' }}>
                            {activeLecture ? (
                                <>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h5">
                                            {activeLecture.title}
                                        </Typography>
                                        {progress[activeLecture._id] && (
                                            <Chip icon={<CheckCircle />} label="Completed" color="success" size="small" />
                                        )}
                                    </Box>

                                    {activeLecture.type === 'video' && (
                                        <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                                            <ReactPlayer
                                                url={activeLecture.videoUrl}
                                                width="100%"
                                                height="100%"
                                                style={{ position: 'absolute', top: 0, left: 0 }}
                                                controls
                                                onProgress={handleVideoProgress}
                                            />
                                        </Box>
                                    )}

                                    {activeLecture.type === 'text' && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
                                                {activeLecture.content}
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                onClick={handleMarkAsCompleted}
                                                disabled={progress[activeLecture._id]}
                                            >
                                                {progress[activeLecture._id] ? 'Completed' : 'Mark as Completed'}
                                            </Button>
                                        </Box>
                                    )}

                                    {activeLecture.type === 'quiz' && (
                                        <Box sx={{ mt: 2 }}>
                                            {!quizState && (
                                                <Box textAlign="center" py={4}>
                                                    <Quiz sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                                                    <Typography variant="h6" gutterBottom>
                                                        Quiz: {activeLecture.title}
                                                    </Typography>
                                                    <Button
                                                        variant="contained"
                                                        onClick={() => handleStartQuiz(activeLecture.content)}
                                                    >
                                                        Start Quiz
                                                    </Button>
                                                </Box>
                                            )}

                                            {quizState === 'taking' && activeLecture.quizData && (
                                                <Box>
                                                    {activeLecture.quizData.questions.map((q, index) => (
                                                        <Box key={q._id} sx={{ mb: 4 }}>
                                                            <Typography variant="subtitle1" gutterBottom>
                                                                {index + 1}. {q.questionText}
                                                            </Typography>
                                                            <FormControl component="fieldset">
                                                                <RadioGroup
                                                                    value={quizAnswers[q._id] ?? ''}
                                                                    onChange={(e) => setQuizAnswers({
                                                                        ...quizAnswers,
                                                                        [q._id]: parseInt(e.target.value)
                                                                    })}
                                                                >
                                                                    {q.options.map((opt, oIndex) => (
                                                                        <FormControlLabel
                                                                            key={oIndex}
                                                                            value={oIndex}
                                                                            control={<Radio />}
                                                                            label={opt}
                                                                        />
                                                                    ))}
                                                                </RadioGroup>
                                                            </FormControl>
                                                        </Box>
                                                    ))}
                                                    <Button
                                                        variant="contained"
                                                        onClick={handleQuizSubmit}
                                                        disabled={Object.keys(quizAnswers).length !== activeLecture.quizData.questions.length}
                                                    >
                                                        Submit Quiz
                                                    </Button>
                                                </Box>
                                            )}

                                            {quizState === 'result' && quizResult && (
                                                <Box textAlign="center">
                                                    <Alert severity={quizResult.data.attempt.passed ? 'success' : 'warning'} sx={{ mb: 2 }}>
                                                        {quizResult.message}
                                                    </Alert>
                                                    <Typography variant="h4" gutterBottom>
                                                        Score: {Math.round(quizResult.data.attempt.percentage)}%
                                                    </Typography>
                                                    <Button variant="outlined" onClick={() => setQuizState(null)}>
                                                        Back to Lecture
                                                    </Button>
                                                </Box>
                                            )}
                                        </Box>
                                    )}

                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {activeLecture.description}
                                        </Typography>
                                    </Box>
                                </>
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <Typography variant="h6" color="text.secondary">
                                        Select a lecture to start learning
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Sidebar - Curriculum */}
                    <Grid item xs={12} md={4}>
                        <Paper elevation={2}>
                            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="h6" fontWeight="700" gutterBottom>
                                    Course Content
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LinearProgress variant="determinate" value={courseProgress} sx={{ flexGrow: 1, height: 8, borderRadius: 4 }} />
                                    <Typography variant="body2" fontWeight="600">{Math.round(courseProgress)}%</Typography>
                                </Box>
                            </Box>
                            {course.modules.map((module, index) => (
                                <Accordion key={module._id} defaultExpanded={index === 0} disableGutters elevation={0}>
                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                        <Typography variant="subtitle1" fontWeight="600">
                                            Module {index + 1}: {module.title}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 0 }}>
                                        <List disablePadding>
                                            {module.lectures.map((lecture) => (
                                                <ListItem
                                                    key={lecture._id}
                                                    button
                                                    selected={activeLecture?._id === lecture._id}
                                                    onClick={() => handleLectureClick(lecture)}
                                                    sx={{ pl: 4 }}
                                                >
                                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                                        {lecture.type === 'video' && <PlayCircle fontSize="small" color={progress[lecture._id] ? 'success' : 'inherit'} />}
                                                        {lecture.type === 'text' && <Description fontSize="small" color={progress[lecture._id] ? 'success' : 'inherit'} />}
                                                        {lecture.type === 'quiz' && <Quiz fontSize="small" color={progress[lecture._id] ? 'success' : 'inherit'} />}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={lecture.title}
                                                        primaryTypographyProps={{ variant: 'body2' }}
                                                    />
                                                    {progress[lecture._id] && <CheckCircle fontSize="small" color="success" />}
                                                </ListItem>
                                            ))}
                                        </List>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default CoursePlayer;
