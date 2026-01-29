import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
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
    EmojiEvents,
    Warning,
    Fullscreen,
    FullscreenExit,
    AutoAwesome,
    Send,
} from '@mui/icons-material';
import ReactPlayer from 'react-player';
import PDFViewer from '../../components/student/PDFViewer';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import api from '../../utils/api';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("CoursePlayer Render Error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h5" color="error">Something went wrong showing this course.</Typography>
                    <Paper sx={{ p: 2, bgcolor: '#fff0f0', maxWidth: '800px', width: '100%', overflow: 'auto' }}>
                        <Typography variant="subtitle2" component="div" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                            {this.state.error && this.state.error.toString()}
                        </Typography>
                        <br />
                        <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </Typography>
                    </Paper>
                    <Button variant="contained" onClick={() => window.location.reload()}>Reload Page</Button>
                </Box>
            );
        }

        return this.props.children;
    }
}

const CoursePlayer = () => {
    // ... hooks ...
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const [course, setCourse] = useState(null);
    const [activeLecture, setActiveLecture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quizState, setQuizState] = useState(null); // null, 'taking', 'result'
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [progress, setProgress] = useState({}); // Map of lectureId -> boolean (completed)
    const [courseProgress, setCourseProgress] = useState(0);
    const [certificateId, setCertificateId] = useState(null);
    const [isFullscreen, setisFullscreen] = useState(false);
    const [userName, setUserName] = useState('');
    const [error, setError] = useState(null);

    // Ask Doubt State
    const [doubtOpen, setDoubtOpen] = useState(false);
    const [doubtQuery, setDoubtQuery] = useState('');
    const [doubtLoading, setDoubtLoading] = useState(false);
    const [doubtResponse, setDoubtResponse] = useState(null);

    useEffect(() => {
        fetchCourse();
        fetchProgress();

        // Get user info from localStorage or context
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserName(user.name || user.email || 'Student');
    }, [id]);

    useEffect(() => {
        // Block screenshot keyboard shortcuts
        const handleKeyDown = (e) => {
            // Block PrintScreen, Windows+Shift+S, Ctrl+Shift+S, Cmd+Shift+4
            if (
                e.key === 'PrintScreen' ||
                (e.key === 's' && e.shiftKey && (e.metaKey || e.ctrlKey)) ||
                (e.key === '4' && e.shiftKey && e.metaKey)
            ) {
                e.preventDefault();
                alert('Screenshots are disabled for this content to protect intellectual property.');
                return false;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const fetchCourse = async () => {
        try {
            const response = await api.get(`/courses/${id}`);
            console.log('Course Data:', response.data.data);
            setCourse(response.data.data);

            // Set first lecture as active if available
            if (response.data.data.modules?.[0]?.lectures?.[0]) {
                const firstLecture = response.data.data.modules[0].lectures[0];
                console.log('First Lecture:', firstLecture);
                console.log('Lecture type:', firstLecture.type);
                console.log('Video URL:', firstLecture.videoUrl);
                console.log('Content:', firstLecture.content);
                setActiveLecture(firstLecture);
            }
        } catch (error) {
            console.error('Error fetching course:', error);
            setError(error.response?.data?.message || 'Failed to load course content');
        } finally {
            setLoading(false);
        }
    };

    const fetchProgress = async () => {
        try {
            const response = await api.get(`/enrollments/${id}/progress`);
            const { enrollment } = response.data.data;

            if (enrollment) {
                // Map completed lectures
                const progressMap = {};
                if (enrollment.completedLectures) {
                    enrollment.completedLectures.forEach(cl => {
                        progressMap[cl.lectureId] = true;
                    });
                }
                setProgress(progressMap);
                setCourseProgress(enrollment.progress || 0);
                setCertificateId(enrollment.certificate);
            }
        } catch (error) {
            console.error('Error fetching progress:', error);
            // Don't show error to user for progress fetch failure, just log it
            // as it might just mean they haven't started yet or enrollment delay
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
            const msg = error.response?.data?.message || error.message || 'Unknown error';
            alert(`Failed to update progress: ${msg}`);
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
            // Find module ID robustly
            let targetModuleId = null;

            if (course && course.modules) {
                for (const module of course.modules) {
                    const foundLecture = module.lectures.find(l => String(l._id) === String(activeLecture._id));
                    if (foundLecture) {
                        targetModuleId = module._id;
                        break;
                    }
                }
            }

            if (targetModuleId) {
                updateProgress(activeLecture._id, targetModuleId, 'text');
            } else {
                console.error("Could not find module for lecture:", activeLecture);
                alert("Unable to mark as completed. Module reference missing.");
            }
        }
    };

    const handleStartQuiz = async (quizId) => {
        try {
            if (!quizId) {
                alert('This quiz has not been set up yet. Please contact your instructor.');
                return;
            }
            console.log('Fetching quiz with ID:', quizId);
            const response = await api.get(`/quizzes/${quizId}`);
            setActiveLecture({ ...activeLecture, quizData: response.data.data });
            setQuizState('taking');
        } catch (error) {
            console.error('Error fetching quiz:', error);
            alert('Failed to load quiz. The quiz may not exist or you may not have access to it.');
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
        <ErrorBoundary>
            <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
                {/* Main Content Area (Left) */}
                <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto', width: '100%' }}>
                        {/* Header Actions */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                            <Button
                                startIcon={<ArrowBack />}
                                onClick={() => navigate('/student/dashboard')}
                                sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
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
                                    Certificate
                                </Button>
                            )}
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        {/* Active Content Viewer */}
                        <Box sx={{ minHeight: '60vh' }}>
                            {activeLecture ? (
                                <>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Box>
                                            <Typography variant="h5" fontWeight="700" gutterBottom>
                                                {activeLecture.title}
                                            </Typography>
                                            <Chip
                                                label={(activeLecture.type || 'video').toUpperCase()}
                                                size="small"
                                                color={activeLecture.type === 'video' ? 'primary' : activeLecture.type === 'quiz' ? 'warning' : 'secondary'}
                                                variant="outlined"
                                                sx={{ fontWeight: 600, borderRadius: 1 }}
                                            />
                                        </Box>
                                        {progress[activeLecture._id] && (
                                            <Chip icon={<CheckCircle />} label="Completed" color="success" variant="filled" />
                                        )}
                                    </Box>

                                    {activeLecture.type === 'video' && (
                                        <Box sx={{ position: 'relative', paddingTop: '56.25%', borderRadius: 4, overflow: 'hidden', bgcolor: 'black', mb: 3, boxShadow: 3 }}>
                                            {activeLecture.videoUrl ? (
                                                <video
                                                    src={activeLecture.videoUrl}
                                                    controls
                                                    width="100%"
                                                    height="100%"
                                                    style={{ position: 'absolute', top: 0, left: 0, objectFit: 'contain' }}
                                                    playsInline
                                                    onTimeUpdate={(e) => {
                                                        const video = e.target;
                                                        const played = video.currentTime / video.duration;
                                                        handleVideoProgress({ played, playedSeconds: video.currentTime });
                                                    }}
                                                    onError={(e) => {
                                                        console.error('Video Tag Error:', e);
                                                    }}
                                                >
                                                    Your browser does not support the video tag.
                                                </video>
                                            ) : (
                                                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
                                                    <PlayCircle sx={{ fontSize: 64, color: 'text.disabled' }} />
                                                    <Typography variant="h6" color="text.secondary">Video Unavailable</Typography>
                                                    <Typography color="text.secondary" fontSize="0.875rem">
                                                        The instructor hasn't uploaded a video for this lecture yet.
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    )}

                                    {activeLecture.type === 'text' && (
                                        <>
                                            {/* PDF Viewer Mode */}
                                            {activeLecture.pdfUrl && !isFullscreen && (
                                                <Box sx={{ mt: 2 }}>
                                                    <PDFViewer
                                                        pdfUrl={activeLecture.pdfUrl}
                                                        lectureTitle={activeLecture.title}
                                                        userName={userName}
                                                        isFullscreenProp={false}
                                                        onToggleFullscreen={setIsFullscreen}
                                                    />

                                                    {/* Show text content below PDF if available */}
                                                    {activeLecture.content && (
                                                        <Box sx={{ mt: 3, p: 3, bgcolor: 'background.paper', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                                                            <Typography variant="h6" gutterBottom>Additional Notes</Typography>
                                                            <Divider sx={{ mb: 2 }} />
                                                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                                                                {activeLecture.content}
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                                                        <Button
                                                            variant="contained"
                                                            onClick={handleMarkAsCompleted}
                                                            disabled={progress[activeLecture._id]}
                                                            startIcon={<CheckCircle />}
                                                            sx={{ borderRadius: 2 }}
                                                        >
                                                            {progress[activeLecture._id] ? 'Completed' : 'Mark as Completed'}
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            )}

                                            {/* Text-Only Mode (No PDF) */}
                                            {!activeLecture.pdfUrl && !isFullscreen && (
                                                <Box sx={{ mt: 2, position: 'relative' }}>
                                                    {activeLecture.content ? (
                                                        <>
                                                            <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper' }}>
                                                                <Box
                                                                    sx={{
                                                                        maxHeight: '60vh',
                                                                        overflowY: 'auto',
                                                                        userSelect: 'none',
                                                                        WebkitUserSelect: 'none'
                                                                    }}
                                                                    onContextMenu={(e) => e.preventDefault()}
                                                                >
                                                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                                                                        {activeLecture.content}
                                                                    </Typography>
                                                                </Box>
                                                            </Paper>
                                                            <Button
                                                                variant="outlined"
                                                                startIcon={<Fullscreen />}
                                                                onClick={() => setIsFullscreen(true)}
                                                                sx={{ mt: 2 }}
                                                            >
                                                                View Fullscreen
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Box sx={{ textAlign: 'center', py: 6 }}>
                                                            <Description sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                                                No Content Available
                                                            </Typography>
                                                            <Typography color="text.secondary" fontStyle="italic">
                                                                The instructor hasn't added notes for this lecture yet.
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                                                        <Button
                                                            variant="contained"
                                                            onClick={handleMarkAsCompleted}
                                                            disabled={progress[activeLecture._id]}
                                                            startIcon={<CheckCircle />}
                                                            sx={{ borderRadius: 2 }}
                                                        >
                                                            {progress[activeLecture._id] ? 'Completed' : 'Mark as Completed'}
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            )}

                                            {/* Fullscreen Viewer with Anti-Screenshot Protection */}
                                            {isFullscreen && (
                                                <>
                                                    {/* PDF Fullscreen Mode */}
                                                    {activeLecture.pdfUrl ? (
                                                        <PDFViewer
                                                            pdfUrl={activeLecture.pdfUrl}
                                                            lectureTitle={activeLecture.title}
                                                            userName={userName}
                                                            isFullscreenProp={true}
                                                            onToggleFullscreen={setIsFullscreen}
                                                        />
                                                    ) : (
                                                        /* Text Fullscreen Mode */
                                                        <Box
                                                            sx={{
                                                                position: 'fixed',
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                bottom: 0,
                                                                bgcolor: 'background.default',
                                                                zIndex: 9999,
                                                                overflow: 'hidden',
                                                                userSelect: 'none',
                                                                WebkitUserSelect: 'none',
                                                            }}
                                                            onContextMenu={(e) => e.preventDefault()}
                                                        >
                                                            {/* Watermark Overlay */}
                                                            <Box
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    right: 0,
                                                                    bottom: 0,
                                                                    pointerEvents: 'none',
                                                                    opacity: 0.15,
                                                                    zIndex: 10,
                                                                    display: 'flex',
                                                                    flexWrap: 'wrap',
                                                                    alignContent: 'space-around',
                                                                    justifyContent: 'space-around',
                                                                    transform: 'rotate(-30deg)',
                                                                }}
                                                            >
                                                                {Array.from({ length: 20 }).map((_, i) => (
                                                                    <Typography
                                                                        key={i}
                                                                        sx={{
                                                                            fontSize: '1.5rem',
                                                                            fontWeight: 'bold',
                                                                            color: 'text.primary',
                                                                            whiteSpace: 'nowrap',
                                                                        }}
                                                                    >
                                                                        {userName} - {new Date().toLocaleDateString()}
                                                                    </Typography>
                                                                ))}
                                                            </Box>

                                                            {/* Header */}
                                                            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Typography variant="h5" fontWeight="700">
                                                                    {activeLecture.title}
                                                                </Typography>
                                                                <Button
                                                                    variant="contained"
                                                                    onClick={() => setIsFullscreen(false)}
                                                                    startIcon={<FullscreenExit />}
                                                                >
                                                                    Exit Fullscreen
                                                                </Button>
                                                            </Box>

                                                            {/* Content */}
                                                            <Box
                                                                sx={{
                                                                    p: 4,
                                                                    height: 'calc(100vh - 80px)',
                                                                    overflowY: 'auto',
                                                                    fontSize: '1.1rem',
                                                                    lineHeight: 2,
                                                                }}
                                                            >
                                                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 2, fontSize: '1.1rem' }}>
                                                                    {activeLecture.content}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}

                                    {activeLecture.type === 'quiz' && (
                                        <Box sx={{ mt: 2 }}>
                                            {!quizState && (
                                                <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 4, bgcolor: 'background.paper' }}>
                                                    <Quiz sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
                                                    <Typography variant="h5" fontWeight="700" gutterBottom>
                                                        {activeLecture.title}
                                                    </Typography>
                                                    <Typography color="text.secondary" sx={{ mb: 4 }}>
                                                        Test your knowledge with this quiz
                                                    </Typography>
                                                    <Button
                                                        variant="contained"
                                                        size="large"
                                                        onClick={() => handleStartQuiz(activeLecture.content)}
                                                        sx={{ borderRadius: 2, px: 4 }}
                                                    >
                                                        Start Quiz
                                                    </Button>
                                                </Paper>
                                            )}

                                            {quizState === 'taking' && activeLecture.quizData && (
                                                <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                                                    {activeLecture.quizData.questions.map((q, index) => (
                                                        <Paper key={q._id} elevation={0} variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                                                            <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ display: 'flex', gap: 1 }}>
                                                                <Box component="span" sx={{ color: 'primary.main' }}>Q{index + 1}.</Box>
                                                                {q.questionText}
                                                            </Typography>
                                                            <FormControl component="fieldset" sx={{ width: '100%', mt: 1 }}>
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
                                                                            sx={{
                                                                                mb: 1,
                                                                                p: 1,
                                                                                borderRadius: 2,
                                                                                border: '1px solid',
                                                                                borderColor: quizAnswers[q._id] === oIndex ? 'primary.main' : 'transparent',
                                                                                bgcolor: quizAnswers[q._id] === oIndex ? 'primary.soft' : 'transparent'
                                                                            }}
                                                                        />
                                                                    ))}
                                                                </RadioGroup>
                                                            </FormControl>
                                                        </Paper>
                                                    ))}
                                                    <Button
                                                        variant="contained"
                                                        size="large"
                                                        fullWidth
                                                        onClick={handleQuizSubmit}
                                                        disabled={Object.keys(quizAnswers).length !== activeLecture.quizData.questions.length}
                                                        sx={{ mt: 2, borderRadius: 2 }}
                                                    >
                                                        Submit Quiz Answers
                                                    </Button>
                                                </Box>
                                            )}

                                            {quizState === 'result' && quizResult && (
                                                <Paper elevation={0} variant="outlined" sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
                                                    <Box sx={{ mb: 3 }}>
                                                        {quizResult.data.attempt.passed ?
                                                            <EmojiEvents sx={{ fontSize: 80, color: 'success.main' }} /> :
                                                            <Warning sx={{ fontSize: 80, color: 'warning.main' }} />
                                                        }
                                                    </Box>
                                                    <Typography variant="h4" fontWeight="800" gutterBottom>
                                                        Score: {Math.round(quizResult.data.attempt.percentage)}%
                                                    </Typography>
                                                    <Alert
                                                        severity={quizResult.data.attempt.passed ? 'success' : 'warning'}
                                                        sx={{ mb: 4, justifyContent: 'center', borderRadius: 2 }}
                                                    >
                                                        {quizResult.message}
                                                    </Alert>
                                                    <Button
                                                        variant="outlined"
                                                        onClick={() => setQuizState(null)}
                                                        sx={{ borderRadius: 2 }}
                                                    >
                                                        Review Lecture
                                                    </Button>
                                                </Paper>
                                            )}
                                        </Box>
                                    )}

                                    <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Description</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {activeLecture.description || 'No description available.'}
                                        </Typography>
                                    </Box>
                                </>
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', opacity: 0.5 }}>
                                    <PlayCircle sx={{ fontSize: 80, mb: 2 }} />
                                    <Typography variant="h6">
                                        Select a lecture from the sidebar to start learning
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* Sidebar - Curriculum (Right) */}
                <Box sx={{
                    width: 400,
                    borderLeft: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0,
                    boxShadow: '-4px 0 20px rgba(0,0,0,0.02)'
                }}>
                    <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
                        <Typography variant="h6" fontWeight="800" sx={{ letterSpacing: '-0.01em' }}>
                            Course Content
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                            <LinearProgress
                                variant="determinate"
                                value={courseProgress}
                                sx={{
                                    flexGrow: 1,
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: 'divider',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`
                                    }
                                }}
                            />
                            <Typography variant="body2" fontWeight="700" color="text.secondary">
                                {Math.round(courseProgress)}%
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ overflowY: 'auto', flex: 1 }}>
                        {course.modules?.map((module, index) => (
                            <Accordion
                                key={module._id}
                                defaultExpanded={index === 0}
                                disableGutters
                                elevation={0}
                                sx={{
                                    '&:before': { display: 'none' },
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    '&.Mui-expanded': { margin: 0 }
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMore />}
                                    sx={{
                                        px: 3,
                                        bgcolor: 'background.paper',
                                        minHeight: 64,
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                >
                                    <Typography variant="subtitle2" fontWeight="700" sx={{ color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box component="span" sx={{
                                            width: 24, height: 24, borderRadius: '50%',
                                            bgcolor: 'primary.soft', color: 'primary.main',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem'
                                        }}>
                                            {index + 1}
                                        </Box>
                                        {module.title}
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
                                                sx={{
                                                    pl: 3,
                                                    py: 2,
                                                    borderLeft: activeLecture?._id === lecture._id ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                                                    bgcolor: activeLecture?._id === lecture._id ? 'primary.soft' : 'transparent',
                                                    color: activeLecture?._id === lecture._id ? 'primary.main' : 'text.primary',
                                                    '&:hover': { bgcolor: activeLecture?._id === lecture._id ? 'primary.soft' : 'action.hover' }
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                                                    {lecture.type === 'video' && <PlayCircle fontSize="small" color="inherit" />}
                                                    {lecture.type === 'text' && <Description fontSize="small" color="inherit" />}
                                                    {lecture.type === 'quiz' && <Quiz fontSize="small" color="inherit" />}
                                                    {progress[lecture._id] && (
                                                        <CheckCircle sx={{ fontSize: 14, position: 'absolute', top: 10, left: 10, color: 'success.main' }} />
                                                    )}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={lecture.title}
                                                    primaryTypographyProps={{
                                                        variant: 'body2',
                                                        fontWeight: activeLecture?._id === lecture._id ? 700 : 500,
                                                        color: 'inherit'
                                                    }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
                </Box>
                {/* Ask Doubt Dialog */}
                <Dialog open={doubtOpen} onClose={() => setDoubtOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AutoAwesome color="primary" />
                        Ask AI Doubt
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Ask a question about the current lecture: <strong>{activeLecture?.title}</strong>
                            </Typography>

                            {doubtResponse ? (
                                <Paper sx={{ p: 2, bgcolor: '#f0f7ff', borderRadius: 2, mt: 2, border: '1px solid #cce5ff' }}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">AI Response:</Typography>
                                    <Box sx={{ typography: 'body2', '& p': { m: 0 } }}>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkMath]}
                                            rehypePlugins={[rehypeKatex]}
                                        >
                                            {doubtResponse}
                                        </ReactMarkdown>
                                    </Box>
                                    <Button
                                        size="small"
                                        sx={{ mt: 1 }}
                                        onClick={() => { setDoubtResponse(null); setDoubtQuery(''); }}
                                    >
                                        Ask Another
                                    </Button>
                                </Paper>
                            ) : (
                                <>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        placeholder="Type your question here..."
                                        value={doubtQuery}
                                        onChange={(e) => setDoubtQuery(e.target.value)}
                                        sx={{ mt: 1 }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                        <Button
                                            variant="contained"
                                            endIcon={doubtLoading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                                            onClick={async () => {
                                                if (!doubtQuery.trim()) return;
                                                setDoubtLoading(true);
                                                try {
                                                    const response = await api.post('/ai/resolve-doubt', {
                                                        query: doubtQuery,
                                                        context: `Lecture: ${activeLecture?.title || 'Course Content'}`
                                                    });
                                                    if (response.data.success) {
                                                        setDoubtResponse(response.data.answer);
                                                    } else {
                                                        setDoubtResponse('Failed to get a response. Please try again.');
                                                    }
                                                } catch (error) {
                                                    console.error('Ask Doubt Error:', error);
                                                    setDoubtResponse('An error occurred. Please check your connection.');
                                                } finally {
                                                    setDoubtLoading(false);
                                                }
                                            }}
                                            disabled={!doubtQuery.trim() || doubtLoading}
                                        >
                                            Ask Question
                                        </Button>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </DialogContent>
                </Dialog>
            </Box>
        </ErrorBoundary>
    );
};

export default CoursePlayer;
