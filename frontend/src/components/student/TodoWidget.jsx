import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Checkbox,
    IconButton,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    Divider,
    Tooltip
} from '@mui/material';
import {
    CheckCircle,
    RadioButtonUnchecked,
    Add,
    ArrowForward,
    PlaylistAddCheck,
    Assignment as AssignmentIcon,
    Quiz as QuizIcon,
    VideoLibrary as VideoIcon,
    School
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const TodoWidget = () => {
    const navigate = useNavigate();
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTodos = async () => {
            try {
                const response = await api.get('/todos');
                // Filter only active todos and take top 5
                // The API returns mixed types. We want to show the most urgent ones (already sorted by date).
                const activeTodos = response.data.data.filter(t => !t.isCompleted).slice(0, 5);
                setTodos(activeTodos);
            } catch (error) {
                console.error('Error fetching todos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTodos();
    }, []);

    const toggleComplete = async (todo) => {
        if (todo.type !== 'manual') return;

        try {
            await api.put(`/todos/${todo.id}`, { isCompleted: true });
            // Remove from list immediately
            setTodos(prev => prev.filter(t => t.id !== todo.id));
        } catch (error) {
            console.error('Error completing todo:', error);
        }
    };

    const getTaskIcon = (type) => {
        switch (type) {
            case 'assignment': return <AssignmentIcon fontSize="small" color="primary" />;
            case 'test': return <QuizIcon fontSize="small" color="error" />;
            case 'resource': return <VideoIcon fontSize="small" color="secondary" />;
            default: return <RadioButtonUnchecked fontSize="small" />;
        }
    };

    return (
        <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        p: 1,
                        borderRadius: '12px',
                        bgcolor: 'info.light',
                        color: 'info.main',
                        display: 'flex'
                    }}>
                        <PlaylistAddCheck sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" fontWeight="700">
                        My Tasks
                    </Typography>
                </Box>
                <IconButton
                    size="small"
                    sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                    onClick={() => navigate('/student/todos')}
                >
                    <Add fontSize="small" />
                </IconButton>
            </Box>

            <CardContent sx={{ p: 0, flexGrow: 1 }}>
                {loading ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>Loading...</Box>
                ) : todos.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <CheckCircle sx={{ fontSize: 40, color: 'success.light', mb: 1, mx: 'auto', opacity: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                            All caught up! No tasks.
                        </Typography>
                        <Button
                            variant="text"
                            size="small"
                            startIcon={<Add />}
                            onClick={() => navigate('/student/todos')}
                            sx={{ mt: 1 }}
                        >
                            Add New
                        </Button>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {todos.map((todo, index) => (
                            <Box key={todo.id}>
                                <ListItem disablePadding sx={{ px: 2, py: 1.5 }}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        {todo.type === 'manual' ? (
                                            <Checkbox
                                                edge="start"
                                                checked={false}
                                                icon={<RadioButtonUnchecked />}
                                                checkedIcon={<CheckCircle />}
                                                onChange={() => toggleComplete(todo)}
                                                size="small"
                                                color="success"
                                            />
                                        ) : (
                                            <Tooltip title={`Auto: ${todo.type}`}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20 }}>
                                                    {getTaskIcon(todo.type)}
                                                </Box>
                                            </Tooltip>
                                        )}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5, lineHeight: 1.2 }}>
                                                {todo.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                {todo.type !== 'manual' && (
                                                    <Chip
                                                        label={todo.type}
                                                        size="small"
                                                        sx={{ height: 16, fontSize: '0.6rem', bgcolor: 'Background.paper', border: '1px solid', borderColor: 'divider' }}
                                                    />
                                                )}
                                                <Chip
                                                    label={todo.category || 'General'}
                                                    size="small"
                                                    sx={{ height: 16, fontSize: '0.6rem', bgcolor: 'action.hover' }}
                                                />
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                {index < todos.length - 1 && <Divider component="li" />}
                            </Box>
                        ))}
                    </List>
                )}
            </CardContent>

            <Box sx={{ p: 2, pt: 0 }}>
                <Button
                    fullWidth
                    endIcon={<ArrowForward />}
                    sx={{ borderRadius: 3, color: 'text.secondary' }}
                    onClick={() => navigate('/student/todos')}
                >
                    View Full Planner
                </Button>
            </Box>
        </Card>
    );
};

export default TodoWidget;
