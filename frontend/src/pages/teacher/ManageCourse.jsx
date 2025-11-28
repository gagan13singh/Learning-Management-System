import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Button,
    TextField,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Tab,
    Tabs,
    Chip,
    CircularProgress,
    MenuItem,
    InputAdornment,
    Divider,
} from '@mui/material';
import {
    ExpandMore,
    Add,
    Delete,
    Edit,
    VideoLibrary,
    Description,
    Quiz,
    ArrowBack,
    Save,
    CloudUpload,
    Person,
    Email,
    Image,
} from '@mui/icons-material';
import Navbar from '../../components/common/Navbar';
import QuizCreator from '../../components/teacher/QuizCreator';
import api from '../../utils/api';

const ManageCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Dialog states
    const [openModuleDialog, setOpenModuleDialog] = useState(false);
    const [openLectureDialog, setOpenLectureDialog] = useState(false);
    const [openQuizDialog, setOpenQuizDialog] = useState(false);
    const [currentModuleId, setCurrentModuleId] = useState(null);

    // Form states
    const [moduleForm, setModuleForm] = useState({ title: '', description: '' });
    const [lectureForm, setLectureForm] = useState({
        title: '',
        description: '',
        type: 'video',
        content: '',
        videoUrl: '',
    });
    const [videoFile, setVideoFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Settings Form State
    const [settingsForm, setSettingsForm] = useState({
        title: '',
        description: '',
        category: '',
        class: '',
        difficulty: 'Beginner',
        price: 0,
        thumbnail: '',
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

    useEffect(() => {
        fetchCourse();
    }, [id]);

    useEffect(() => {
        if (tabValue === 1) {
            fetchStudents();
        }
    }, [tabValue, id]);

    const fetchCourse = async () => {
        try {
            const response = await api.get(`/courses/${id}`);
            setCourse(response.data.data);
            setSettingsForm({
                title: response.data.data.title,
                description: response.data.data.description,
                category: response.data.data.category,
                class: response.data.data.class,
                difficulty: response.data.data.difficulty,
                price: response.data.data.price,
                thumbnail: response.data.data.thumbnail,
            });
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
            const response = await api.get(`/enrollments/course/${id}/students`);
            setStudents(response.data.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleAddModule = async () => {
        try {
            await api.post(`/courses/${id}/modules`, moduleForm);
            setOpenModuleDialog(false);
            setModuleForm({ title: '', description: '' });
            fetchCourse();
        } catch (error) {
            console.error('Error adding module:', error);
        }
    };

    const handleAddLecture = async () => {
        try {
            setUploading(true);
            let videoData = {};

            if (lectureForm.type === 'video' && videoFile) {
                const formData = new FormData();
                formData.append('video', videoFile);
                const uploadRes = await api.post('/courses/upload/video', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                videoData = {
                    videoUrl: uploadRes.data.data.videoUrl,
                    videoPublicId: uploadRes.data.data.videoPublicId,
                    duration: uploadRes.data.data.duration,
                };
            }

            await api.post(`/courses/${id}/modules/${currentModuleId}/lectures`, {
                ...lectureForm,
                ...videoData,
            });

            setOpenLectureDialog(false);
            setLectureForm({ title: '', description: '', type: 'video', content: '', videoUrl: '' });
            setVideoFile(null);
            fetchCourse();
        } catch (error) {
            console.error('Error adding lecture:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleTogglePublish = async () => {
        try {
            await api.put(`/courses/${id}/publish`);
            fetchCourse();
        } catch (error) {
            console.error('Error toggling publish:', error);
        }
    };

    const handleUpdateSettings = async () => {
        try {
            let thumbnailUrl = settingsForm.thumbnail;

            if (thumbnailFile) {
                setUploadingThumbnail(true);
                const formData = new FormData();
                formData.append('thumbnail', thumbnailFile);
                const uploadRes = await api.post('/courses/upload/thumbnail', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                thumbnailUrl = uploadRes.data.data;
                setUploadingThumbnail(false);
            }

            await api.put(`/courses/${id}`, {
                ...settingsForm,
                thumbnail: thumbnailUrl,
            });
            alert('Course updated successfully!');
            fetchCourse();
        } catch (error) {
            console.error('Error updating course:', error);
            setUploadingThumbnail(false);
        }
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
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={() => navigate('/teacher/dashboard')}>
                            <ArrowBack />
                        </IconButton>
                        <Box>
                            <Typography variant="h4" fontWeight="700">
                                {course.title}
                            </Typography>
                            <Chip
                                label={course.status}
                                color={course.status === 'published' ? 'success' : 'default'}
                                size="small"
                                sx={{ mt: 1 }}
                            />
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleTogglePublish}
                        >
                            {course.status === 'published' ? 'Unpublish' : 'Publish'}
                        </Button>
                    </Box>
                </Box>

                {/* Tabs */}
                <Paper sx={{ mb: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} centered>
                        <Tab label="Content" />
                        <Tab label="Students" />
                        <Tab label="Settings" />
                    </Tabs>
                </Paper>

                {/* Content Tab */}
                {tabValue === 0 && (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => setOpenModuleDialog(true)}
                            >
                                Add Module
                            </Button>
                        </Box>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                {course.modules.map((module, index) => (
                                    <Accordion key={module._id} defaultExpanded>
                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                            <Typography variant="h6">
                                                Module {index + 1}: {module.title}
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <List>
                                                {module.lectures.map((lecture) => (
                                                    <ListItem key={lecture._id} sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1 }}>
                                                        <Box sx={{ mr: 2 }}>
                                                            {lecture.type === 'video' && <VideoLibrary color="primary" />}
                                                            {lecture.type === 'text' && <Description color="secondary" />}
                                                            {lecture.type === 'quiz' && <Quiz color="warning" />}
                                                        </Box>
                                                        <ListItemText
                                                            primary={lecture.title}
                                                            secondary={lecture.type === 'video' ? `${Math.round(lecture.duration)}s` : 'Text Content'}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                            <Button
                                                startIcon={<Add />}
                                                size="small"
                                                onClick={() => {
                                                    setCurrentModuleId(module._id);
                                                    setOpenLectureDialog(true);
                                                }}
                                                sx={{ mt: 1, mr: 1 }}
                                            >
                                                Add Content
                                            </Button>
                                            <Button
                                                startIcon={<Quiz />}
                                                size="small"
                                                onClick={() => {
                                                    setCurrentModuleId(module._id);
                                                    setOpenQuizDialog(true);
                                                }}
                                                sx={{ mt: 1 }}
                                                color="warning"
                                            >
                                                Add Quiz
                                            </Button>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* Students Tab */}
                {tabValue === 1 && (
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Enrolled Students ({students.length})
                        </Typography>
                        {loadingStudents ? (
                            <CircularProgress />
                        ) : students.length === 0 ? (
                            <Typography color="text.secondary">No students enrolled yet.</Typography>
                        ) : (
                            <List>
                                {students.map((enrollment) => (
                                    <ListItem key={enrollment._id} divider>
                                        <ListItemAvatar>
                                            <Avatar src={enrollment.student?.profilePicture}>
                                                {enrollment.student?.name?.charAt(0)}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={enrollment.student?.name}
                                            secondary={
                                                <>
                                                    <Typography component="span" variant="body2" color="text.primary">
                                                        {enrollment.student?.email}
                                                    </Typography>
                                                    <br />
                                                    Enrolled on: {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                                                </>
                                            }
                                        />
                                        <Chip
                                            label={`${Math.round(enrollment.progress)}% Complete`}
                                            color={enrollment.progress >= 100 ? 'success' : 'primary'}
                                            variant="outlined"
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Paper>
                )}

                {/* Settings Tab */}
                {tabValue === 2 && (
                    <Paper sx={{ p: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Course Settings
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Course Title"
                                    fullWidth
                                    value={settingsForm.title}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, title: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Description"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={settingsForm.description}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    label="Category"
                                    fullWidth
                                    value={settingsForm.category}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, category: e.target.value })}
                                >
                                    {['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Social Studies', 'Computer Science', 'Other'].map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    label="Class"
                                    fullWidth
                                    value={settingsForm.class}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, class: e.target.value })}
                                >
                                    {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Other'].map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    label="Difficulty"
                                    fullWidth
                                    value={settingsForm.difficulty}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, difficulty: e.target.value })}
                                >
                                    {['Beginner', 'Intermediate', 'Advanced'].map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Price (₹)"
                                    type="number"
                                    fullWidth
                                    value={settingsForm.price}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, price: e.target.value })}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ border: '1px dashed grey', p: 3, textAlign: 'center', borderRadius: 1 }}>
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="thumbnail-upload"
                                        type="file"
                                        onChange={(e) => setThumbnailFile(e.target.files[0])}
                                    />
                                    <label htmlFor="thumbnail-upload">
                                        <Button variant="outlined" component="span" startIcon={<Image />}>
                                            Change Thumbnail
                                        </Button>
                                    </label>
                                    {thumbnailFile ? (
                                        <Typography sx={{ mt: 1 }}>{thumbnailFile.name}</Typography>
                                    ) : settingsForm.thumbnail && (
                                        <Box sx={{ mt: 2 }}>
                                            <img src={settingsForm.thumbnail} alt="Thumbnail" style={{ maxWidth: '100%', maxHeight: 200 }} />
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<Save />}
                                    onClick={handleUpdateSettings}
                                    disabled={uploadingThumbnail}
                                >
                                    {uploadingThumbnail ? 'Uploading...' : 'Save Changes'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                )}

                {/* Add Module Dialog */}
                <Dialog open={openModuleDialog} onClose={() => setOpenModuleDialog(false)}>
                    <DialogTitle>Add New Module</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Module Title"
                            fullWidth
                            value={moduleForm.title}
                            onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="Description"
                            fullWidth
                            multiline
                            rows={2}
                            value={moduleForm.description}
                            onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenModuleDialog(false)}>Cancel</Button>
                        <Button onClick={handleAddModule} variant="contained">Add</Button>
                    </DialogActions>
                </Dialog>

                {/* Add Lecture Dialog */}
                <Dialog open={openLectureDialog} onClose={() => setOpenLectureDialog(false)} maxWidth="md" fullWidth>
                    <DialogTitle>Add Content</DialogTitle>
                    <DialogContent>
                        <TextField
                            select
                            label="Content Type"
                            fullWidth
                            margin="normal"
                            value={lectureForm.type}
                            onChange={(e) => setLectureForm({ ...lectureForm, type: e.target.value })}
                        >
                            <MenuItem value="video">Video Lecture</MenuItem>
                            <MenuItem value="text">Text/Notes</MenuItem>
                            <MenuItem value="quiz">Quiz</MenuItem>
                        </TextField>

                        <TextField
                            label="Title"
                            fullWidth
                            margin="normal"
                            value={lectureForm.title}
                            onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })}
                        />

                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={2}
                            margin="normal"
                            value={lectureForm.description}
                            onChange={(e) => setLectureForm({ ...lectureForm, description: e.target.value })}
                        />

                        {lectureForm.type === 'video' && (
                            <Box sx={{ mt: 2, border: '1px dashed grey', p: 3, textAlign: 'center' }}>
                                <input
                                    accept="video/*"
                                    style={{ display: 'none' }}
                                    id="video-upload"
                                    type="file"
                                    onChange={(e) => setVideoFile(e.target.files[0])}
                                />
                                <label htmlFor="video-upload">
                                    <Button variant="outlined" component="span" startIcon={<CloudUpload />}>
                                        Upload Video
                                    </Button>
                                </label>
                                {videoFile && <Typography sx={{ mt: 1 }}>{videoFile.name}</Typography>}
                            </Box>
                        )}

                        {lectureForm.type === 'text' && (
                            <TextField
                                label="Content"
                                fullWidth
                                multiline
                                rows={6}
                                margin="normal"
                                value={lectureForm.content}
                                onChange={(e) => setLectureForm({ ...lectureForm, content: e.target.value })}
                            />
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenLectureDialog(false)}>Cancel</Button>
                        <Button
                            onClick={handleAddLecture}
                            variant="contained"
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : 'Add Content'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Quiz Creator Dialog */}
                {course && (
                    <QuizCreator
                        open={openQuizDialog}
                        onClose={() => setOpenQuizDialog(false)}
                        courseId={course._id}
                        moduleId={currentModuleId}
                        onQuizCreated={() => {
                            fetchCourse();
                            setOpenQuizDialog(false);
                        }}
                    />
                )}
            </Container>
        </Box>
    );
};

export default ManageCourse;
