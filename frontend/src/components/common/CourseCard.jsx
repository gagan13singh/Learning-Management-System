import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Chip,
    Box,
    Button,
    Avatar,
} from '@mui/material';
import { Person, PlayCircle, Quiz } from '@mui/icons-material';

const CourseCard = ({ course, onEnroll, onView, onEdit, onDelete, onManage, enrolled = false, isTeacher = false }) => {
    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                },
            }}
        >
            <CardMedia
                component="img"
                height="180"
                image={course.thumbnail || 'https://via.placeholder.com/400x180?text=Course+Thumbnail'}
                alt={course.title}
                sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 2 }}>
                    <Chip
                        label={course.category}
                        size="small"
                        color="primary"
                        sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip
                        label={course.class}
                        size="small"
                        variant="outlined"
                        sx={{ mb: 1 }}
                    />
                </Box>

                <Typography variant="h6" gutterBottom fontWeight="600" sx={{ mb: 1 }}>
                    {course.title}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {course.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                        {course.instructor?.name?.charAt(0).toUpperCase() || 'T'}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                        {course.instructor?.name || 'Instructor'}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PlayCircle fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                            {course.totalLectures || 0} lectures
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                            {course.enrollmentCount || 0} students
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ mt: 'auto' }}>
                    {course.price > 0 ? (
                        <Typography variant="h6" color="primary" fontWeight="700" sx={{ mb: 2 }}>
                            ₹{course.price}
                        </Typography>
                    ) : (
                        <Chip label="FREE" color="success" size="small" sx={{ mb: 2 }} />
                    )}

                    {isTeacher ? (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                size="small"
                                color="primary"
                                onClick={() => onManage && onManage(course._id)}
                                sx={{ flexGrow: 1 }}
                            >
                                Manage
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                color="info"
                                onClick={() => onEdit && onEdit(course)}
                                sx={{ minWidth: 'auto' }}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                onClick={() => onDelete && onDelete(course._id)}
                                sx={{ minWidth: 'auto' }}
                            >
                                Delete
                            </Button>
                        </Box>
                    ) : enrolled ? (
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => onView(course._id)}
                        >
                            Continue Learning
                        </Button>
                    ) : (
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => onEnroll(course._id)}
                        >
                            Enroll Now
                        </Button>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default CourseCard;
