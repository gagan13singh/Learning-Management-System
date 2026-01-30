import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Typography,
    Box,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    LinearProgress,
    Alert,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import CourseCard from '../../components/common/CourseCard';
import api from '../../api/axios';

const CourseBrowser = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchCourses();
    }, [category, classFilter]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const params = {};
            if (category) params.category = category;
            if (classFilter) params.class = classFilter;

            const response = await api.get('/courses', { params });
            setCourses(response.data.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setError('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            await api.post(`/enrollments/${courseId}`);
            setSuccess('Successfully enrolled in course!');
            setTimeout(() => {
                navigate('/student/dashboard');
            }, 1500);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to enroll in course');
        }
    };

    const handleViewCourse = (courseId) => {
        navigate(`/student/course/${courseId}`);
    };

    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categories = ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Social Studies', 'Computer Science'];
    const classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>

            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="700" gutterBottom>
                        Browse Courses 📚
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Explore and enroll in courses
                    </Typography>
                </Box>

                {/* Alerts */}
                {error && (
                    <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 3 }}>
                        {success}
                    </Alert>
                )}

                {/* Filters */}
                <Box sx={{ mb: 4 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    label="Category"
                                >
                                    <MenuItem value="">All Categories</MenuItem>
                                    {categories.map((cat) => (
                                        <MenuItem key={cat} value={cat}>
                                            {cat}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Class</InputLabel>
                                <Select
                                    value={classFilter}
                                    onChange={(e) => setClassFilter(e.target.value)}
                                    label="Class"
                                >
                                    <MenuItem value="">All Classes</MenuItem>
                                    {classes.map((cls) => (
                                        <MenuItem key={cls} value={cls}>
                                            {cls}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>

                {/* Active Filters */}
                {(category || classFilter) && (
                    <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {category && (
                            <Chip
                                label={`Category: ${category}`}
                                onDelete={() => setCategory('')}
                                color="primary"
                            />
                        )}
                        {classFilter && (
                            <Chip
                                label={`Class: ${classFilter}`}
                                onDelete={() => setClassFilter('')}
                                color="primary"
                            />
                        )}
                    </Box>
                )}

                {/* Courses Grid */}
                {loading ? (
                    <Box sx={{ width: '100%' }}>
                        <LinearProgress />
                    </Box>
                ) : filteredCourses.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary">
                            No courses found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Try adjusting your filters
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
                        </Typography>
                        <Grid container spacing={3}>
                            {filteredCourses.map((course) => (
                                <Grid item xs={12} sm={6} md={4} key={course._id}>
                                    <CourseCard
                                        course={course}
                                        onEnroll={handleEnroll}
                                        onView={handleViewCourse}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </>
                )}
            </Container>
        </Box>
    );
};

export default CourseBrowser;
