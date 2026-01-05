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
        <Card sx={{
            height: '100%',
            borderRadius: 4,
            boxShadow: 'none',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s',
            '&:hover': {
                boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)',
                transform: 'translateY(-2px)'
            }
        }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        p: 1,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        display: 'flex',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}>
                        <PlaylistAddCheck sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                        My Tasks
                    </Typography>
                </Box>
                <IconButton
                    size="small"
                    sx={{
                        bgcolor: 'primary.soft',
                        color: 'primary.main',
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: 'primary.main', color: 'white' }
                    }}
                    onClick={() => navigate('/student/todos')}
                >
                    <Add fontSize="small" />
                </IconButton>
            </Box>

            <CardContent sx={{ p: 0, flexGrow: 1 }}>
                {loading ? (
                    <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>Loading tasks...</Box>
                ) : todos.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'success.soft', width: 'fit-content', mx: 'auto', mb: 2 }}>
                            <CheckCircle sx={{ fontSize: 32, color: 'success.main', opacity: 0.8 }} />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            All caught up! No tasks pending.
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Add />}
                            onClick={() => navigate('/student/todos')}
                            sx={{ mt: 2, borderRadius: 2 }}
                        >
                            Add New Task
                        </Button>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {todos.map((todo, index) => (
                            <Box key={todo.id}>
                                <ListItem
                                    disablePadding
                                    sx={{
                                        px: 2,
                                        py: 1.5,
                                        transition: 'background 0.2s',
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        {todo.type === 'manual' ? (
                                            <Checkbox
                                                edge="start"
                                                checked={false}
                                                icon={<RadioButtonUnchecked />}
                                                checkedIcon={<CheckCircle />}
                                                onChange={() => toggleComplete(todo)}
                                                size="small"
                                                color="success"
                                                sx={{ p: 0.5 }}
                                            />
                                        ) : (
                                            <Tooltip title={`Auto: ${todo.type}`}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: '8px',
                                                    bgcolor: 'background.subtle'
                                                }}>
                                                    {getTaskIcon(todo.type)}
                                                </Box>
                                            </Tooltip>
                                        )}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5, lineHeight: 1.3 }}>
                                                {todo.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                                                {todo.type !== 'manual' && (
                                                    <Chip
                                                        label={todo.type}
                                                        size="small"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: '0.65rem',
                                                            bgcolor: 'primary.soft',
                                                            color: 'primary.main',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                )}
                                                <Chip
                                                    label={todo.category || 'General'}
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: '0.65rem',
                                                        bgcolor: 'background.subtle'
                                                    }}
                                                />
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                {index < todos.length - 1 && <Divider component="li" variant="inset" sx={{ ml: 8 }} />}
                            </Box>
                        ))}
                    </List>
                )}
            </CardContent>

            <Box sx={{ p: 2, pt: 0 }}>
                <Button
                    fullWidth
                    endIcon={<ArrowForward />}
                    sx={{
                        borderRadius: 3,
                        color: 'text.secondary',
                        bgcolor: 'action.hover',
                        '&:hover': { bgcolor: 'action.selected' }
                    }}
                    onClick={() => navigate('/student/todos')}
                >
                    View All Tasks
                </Button>
            </Box>
        </Card>
    );
};

export default TodoWidget;
