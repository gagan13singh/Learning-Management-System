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
    PictureAsPdf,
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
    const [isEditing, setIsEditing] = useState(false);
    const [editingLectureId, setEditingLectureId] = useState(null);

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
    const [pdfFile, setPdfFile] = useState(null);
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
            if (lectureForm.type === 'video' && !videoFile && !isEditing) {
                alert('Please upload a video file');
                return;
            }

            setUploading(true);
            let videoData = {};
            let pdfData = {};

            // Handle video upload
            if (lectureForm.type === 'video' && videoFile) {
                const formData = new FormData();
                formData.append('video', videoFile);
                const uploadRes = await api.post('/courses/upload/video', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                console.log('Video upload response:', uploadRes.data);
                videoData = {
                    videoUrl: uploadRes.data.data.videoUrl,
                    videoPublicId: uploadRes.data.data.videoPublicId,
                    duration: uploadRes.data.data.duration,
                };
            }

            // Handle PDF upload for text lectures
            if (lectureForm.type === 'text' && pdfFile) {
                const formData = new FormData();
                formData.append('pdf', pdfFile);
                const uploadRes = await api.post('/courses/upload/pdf', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                console.log('PDF upload response:', uploadRes.data);
                pdfData = {
                    pdfUrl: uploadRes.data.data.pdfUrl,
                    pdfPublicId: uploadRes.data.data.pdfPublicId,
                };
            }

            console.log('Sending lecture data:', { ...lectureForm, ...videoData, ...pdfData, isEditing });

            if (isEditing) {
                await api.put(`/courses/${id}/modules/${currentModuleId}/lectures/${editingLectureId}`, {
                    ...lectureForm,
                    ...videoData,
                    ...pdfData,
                });
            } else {
                await api.post(`/courses/${id}/modules/${currentModuleId}/lectures`, {
                    ...lectureForm,
                    ...videoData,
                    ...pdfData,
                });
            }

            setOpenLectureDialog(false);
            setLectureForm({ title: '', description: '', type: 'video', content: '', videoUrl: '' });
            setVideoFile(null);
            setPdfFile(null);
            setIsEditing(false);
            setEditingLectureId(null);
            fetchCourse();
        } catch (error) {
            console.error('Error saving lecture:', error);
            alert(`Error saving lecture: ${error.response?.data?.message || error.message}`);
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
                console.log('Thumbnail upload response:', uploadRes.data);
                // Handle both object and potential direct string or fallback
                thumbnailUrl = uploadRes.data.data.thumbnailUrl || uploadRes.data.data || '';
                if (typeof thumbnailUrl === 'object') {
                    console.error('Thumbnail URL is an object!', thumbnailUrl);
                    alert('Error: returned thumbnail is an object, check console');
                }
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
                        <IconButton
                            onClick={() => navigate('/teacher/dashboard')}
                            sx={{
                                bgcolor: 'background.paper',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 3,
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                        >
                            <ArrowBack />
                        </IconButton>
                        <Box>
                            <Typography variant="h4" fontWeight="800" sx={{ lineHeight: 1.2 }}>
                                {course.title}
                            </Typography>
                            <Chip
                                label={course.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
                                color={course.status === 'published' ? 'success' : 'default'}
                                size="small"
                                variant={course.status === 'published' ? 'filled' : 'outlined'}
                                sx={{ mt: 1, fontWeight: 700, borderRadius: 1 }}
                            />
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant={course.status === 'published' ? 'outlined' : 'contained'}
                            color={course.status === 'published' ? 'warning' : 'success'}
                            onClick={handleTogglePublish}
                            startIcon={course.status === 'published' ? <Save /> : <CloudUpload />}
                            sx={{ borderRadius: 3, px: 3, fontWeight: 700, textTransform: 'none' }}
                        >
                            {course.status === 'published' ? 'Unpublish Course' : 'Publish Course'}
                        </Button>
                    </Box>
                </Box>

                {/* Tabs */}
                <Paper
                    elevation={0}
                    sx={{
                        mb: 4,
                        borderRadius: 3,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden'
                    }}
                >
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '1rem',
                                py: 2,
                                transition: 'all 0.2s',
                                '&.Mui-selected': {
                                    color: 'primary.main',
                                    bgcolor: 'primary.soft'
                                },
                                '&:hover:not(.Mui-selected)': {
                                    bgcolor: 'action.hover'
                                }
                            },
                            '& .MuiTabs-indicator': {
                                height: 3,
                                borderRadius: '3px 3px 0 0'
                            }
                        }}
                    >
                        <Tab label="Course Content" icon={<VideoLibrary sx={{ mb: 0 }} />} iconPosition="start" />
                        <Tab label="Enrolled Students" icon={<Person sx={{ mb: 0 }} />} iconPosition="start" />
                        <Tab label="Settings" icon={<Edit sx={{ mb: 0 }} />} iconPosition="start" />
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
                                {course.modules.length === 0 ? (
                                    <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '1px dashed', borderColor: 'divider', bgcolor: 'background.subtle' }}>
                                        <Typography variant="h6" color="text.secondary" gutterBottom>
                                            No modules added yet
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                            Start building your course structure by adding sections and lectures.
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            startIcon={<Add />}
                                            onClick={() => setOpenModuleDialog(true)}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Create First Module
                                        </Button>
                                    </Paper>
                                ) : (
                                    course.modules.map((module, index) => (
                                        <Accordion
                                            key={module._id}
                                            defaultExpanded
                                            disableGutters
                                            elevation={0}
                                            sx={{
                                                mb: 2,
                                                borderRadius: '12px !important',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                '&:before': { display: 'none' },
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <AccordionSummary
                                                expandIcon={<ExpandMore />}
                                                sx={{
                                                    bgcolor: 'background.subtle',
                                                    '&.Mui-expanded': { borderBottom: '1px solid', borderColor: 'divider' }
                                                }}
                                            >
                                                <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box component="span" sx={{
                                                        width: 28, height: 28, borderRadius: '50%',
                                                        bgcolor: 'primary.soft', color: 'primary.main',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem'
                                                    }}>
                                                        {index + 1}
                                                    </Box>
                                                    {module.title}
                                                </Typography>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ p: 0 }}>
                                                <List disablePadding>
                                                    {module.lectures.length === 0 ? (
                                                        <ListItem sx={{ py: 3, justifyContent: 'center' }}>
                                                            <Typography variant="body2" color="text.secondary">Empty module. Add content below.</Typography>
                                                        </ListItem>
                                                    ) : (
                                                        module.lectures.map((lecture) => (
                                                            <ListItem
                                                                key={lecture._id}
                                                                sx={{
                                                                    borderBottom: '1px solid',
                                                                    borderColor: 'divider',
                                                                    '&:last-child': { borderBottom: 'none' },
                                                                    py: 1.5,
                                                                    px: 3,
                                                                    '&:hover': { bgcolor: 'action.hover' }
                                                                }}
                                                                secondaryAction={
                                                                    <IconButton
                                                                        edge="end"
                                                                        size="small"
                                                                        onClick={() => {
                                                                            setCurrentModuleId(module._id);
                                                                            setEditingLectureId(lecture._id);
                                                                            setIsEditing(true);
                                                                            setLectureForm({
                                                                                title: lecture.title,
                                                                                description: lecture.description,
                                                                                type: lecture.type,
                                                                                content: lecture.content,
                                                                                videoUrl: lecture.videoUrl
                                                                            });
                                                                            setOpenLectureDialog(true);
                                                                        }}
                                                                        sx={{ color: 'primary.main', bgcolor: 'primary.soft', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
                                                                    >
                                                                        <Edit fontSize="small" />
                                                                    </IconButton>
                                                                }
                                                            >
                                                                <Box sx={{ mr: 2.5, display: 'flex', alignItems: 'center' }}>
                                                                    {lecture.type === 'video' && <VideoLibrary color="primary" />}
                                                                    {lecture.type === 'text' && <Description color="info" />}
                                                                    {lecture.type === 'quiz' && <Quiz color="warning" />}
                                                                </Box>
                                                                <ListItemText
                                                                    primary={lecture.title}
                                                                    primaryTypographyProps={{ fontWeight: 500 }}
                                                                    secondary={
                                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                            {lecture.type === 'video' ? 'Video Lecture' : lecture.type === 'quiz' ? 'Quiz Assessment' : 'Reading Material'}
                                                                            {lecture.type === 'video' && lecture.duration && ` • ${Math.round(lecture.duration / 60)} mins`}
                                                                        </Typography>
                                                                    }
                                                                />
                                                            </ListItem>
                                                        ))
                                                    )}
                                                </List>
                                                <Divider />
                                                <Box sx={{ p: 2, display: 'flex', gap: 1, bgcolor: 'background.default' }}>
                                                    <Button
                                                        startIcon={<Add />}
                                                        size="small"
                                                        variant="text"
                                                        onClick={() => {
                                                            setCurrentModuleId(module._id);
                                                            setEditingLectureId(null);
                                                            setIsEditing(false);
                                                            setLectureForm({ title: '', description: '', type: 'video', content: '', videoUrl: '' });
                                                            setVideoFile(null);
                                                            setOpenLectureDialog(true);
                                                        }}
                                                    >
                                                        Add Content
                                                    </Button>
                                                    <Button
                                                        startIcon={<Quiz />}
                                                        size="small"
                                                        variant="text"
                                                        color="warning"
                                                        onClick={() => {
                                                            setCurrentModuleId(module._id);
                                                            setOpenQuizDialog(true);
                                                        }}
                                                    >
                                                        Add Quiz
                                                    </Button>
                                                </Box>
                                            </AccordionDetails>
                                        </Accordion>
                                    ))
                                )}
                            </Grid>
                        </Grid>
                    </Box>
                )
                }

                {/* Students Tab */}
                {
                    tabValue === 1 && (
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
                    )
                }

                {/* Settings Tab */}
                {
                    tabValue === 2 && (
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
                    )
                }

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
                <Dialog
                    open={openLectureDialog}
                    onClose={() => {
                        setOpenLectureDialog(false);
                        setIsEditing(false);
                        setEditingLectureId(null);
                        setLectureForm({ title: '', description: '', type: 'video', content: '', videoUrl: '' });
                        setVideoFile(null);
                    }}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>{isEditing ? 'Edit Content' : 'Add Content'}</DialogTitle>
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
                            <>
                                <TextField
                                    label="Text Content/Notes"
                                    fullWidth
                                    multiline
                                    rows={6}
                                    margin="normal"
                                    value={lectureForm.content}
                                    onChange={(e) => setLectureForm({ ...lectureForm, content: e.target.value })}
                                    placeholder="Enter text notes here..."
                                />

                                <Box sx={{ mt: 2, border: '1px dashed grey', p: 3, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        Or upload a PDF document
                                    </Typography>
                                    <input
                                        accept=".pdf,.docx"
                                        style={{ display: 'none' }}
                                        id="pdf-upload"
                                        type="file"
                                        onChange={(e) => setPdfFile(e.target.files[0])}
                                    />
                                    <label htmlFor="pdf-upload">
                                        <Button variant="outlined" component="span" startIcon={<PictureAsPdf />}>
                                            Upload PDF/DOCX
                                        </Button>
                                    </label>
                                    {pdfFile && (
                                        <Box sx={{ mt: 2 }}>
                                            <Chip
                                                label={pdfFile.name}
                                                onDelete={() => setPdfFile(null)}
                                                color="primary"
                                                icon={<PictureAsPdf />}
                                            />
                                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                                Size: {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setOpenLectureDialog(false);
                            setIsEditing(false);
                            setEditingLectureId(null);
                            setLectureForm({ title: '', description: '', type: 'video', content: '', videoUrl: '' });
                            setVideoFile(null);
                        }}>Cancel</Button>
                        <Button
                            onClick={handleAddLecture}
                            variant="contained"
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : (isEditing ? 'Update Content' : 'Add Content')}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Quiz Creator Dialog */}
                {
                    course && (
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
                    )
                }
            </Container >
        </Box >
    );
};

export default ManageCourse;
