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
            elevation={0}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                overflow: 'hidden',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 30px -10px rgba(0, 0, 0, 0.1)',
                    borderColor: 'primary.light',
                    '& .MuiCardMedia-root': {
                        transform: 'scale(1.05)'
                    }
                },
            }}
        >
            <Box sx={{ overflow: 'hidden', position: 'relative' }}>
                <CardMedia
                    component="img"
                    height="200"
                    image={course.thumbnail || 'https://via.placeholder.com/400x200?text=Course+Thumbnail'}
                    alt={course.title}
                    sx={{
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        display: 'flex',
                        gap: 1
                    }}
                >
                    <Chip
                        label={course.category}
                        size="small"
                        sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(4px)',
                            fontWeight: 600,
                            color: 'primary.main',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    />
                    {isTeacher && (
                        <Chip
                            label={course.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
                            size="small"
                            color={course.status === 'published' ? 'success' : 'default'}
                            sx={{
                                bgcolor: course.status === 'published' ? 'success.main' : 'rgba(0, 0, 0, 0.6)',
                                color: 'white',
                                backdropFilter: 'blur(4px)',
                                fontWeight: 700,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                        />
                    )}
                </Box>
            </Box>

            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="primary.main" fontWeight="700" sx={{ letterSpacing: 0.5 }}>
                        {(course.class || 'General').toUpperCase()}
                    </Typography>
                    <Typography variant="h6" gutterBottom fontWeight="800" sx={{ mb: 1, lineHeight: 1.3 }}>
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
                            lineHeight: 1.6
                        }}
                    >
                        {course.description}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Avatar
                        sx={{
                            width: 32,
                            height: 32,
                            fontSize: '0.85rem',
                            bgcolor: 'secondary.main'
                        }}
                    >
                        {course.instructor?.name?.charAt(0).toUpperCase() || 'T'}
                    </Avatar>
                    <Box>
                        <Typography variant="caption" display="block" color="text.secondary" lineHeight={1}>
                            Instructor
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                            {course.instructor?.name || 'Instructor'}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    mb: 3,
                    p: 1.5,
                    bgcolor: 'background.default',
                    borderRadius: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PlayCircle fontSize="small" color="disabled" sx={{ fontSize: 18 }} />
                        <Typography variant="caption" fontWeight="600" color="text.secondary">
                            {course.totalLectures || 0} Lectures
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Person fontSize="small" color="disabled" sx={{ fontSize: 18 }} />
                        <Typography variant="caption" fontWeight="600" color="text.secondary">
                            {course.enrollmentCount || 0} Students
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    {course.price > 0 ? (
                        <Typography variant="h6" color="primary.main" fontWeight="800">
                            ₹{course.price}
                        </Typography>
                    ) : (
                        <Chip label="FREE" color="success" size="small" variant="soft" sx={{ bgcolor: 'success.light', color: 'success.dark', fontWeight: 700 }} />
                    )}

                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        {isTeacher ? (
                            <>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => onManage && onManage(course._id)}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Manage
                                </Button>
                            </>
                        ) : enrolled ? (
                            <Button
                                variant="contained"
                                size="small"
                                disableElevation
                                onClick={() => onView(course._id)}
                                sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                            >
                                Resume
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                size="small"
                                disableElevation
                                onClick={() => onEnroll(course._id)}
                                sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                            >
                                Enroll
                            </Button>
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default CourseCard;
