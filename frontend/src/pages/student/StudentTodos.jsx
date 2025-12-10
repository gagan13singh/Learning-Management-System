import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    TextField,
    Button,
    IconButton,
    Checkbox,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    Fab,
    Tooltip
} from '@mui/material';
import {
    Add,
    Delete,
    Edit,
    CheckCircle,
    RadioButtonUnchecked,
    Flag,
    Event,
    Assignment as AssignmentIcon,
    Quiz as QuizIcon,
    VideoLibrary as VideoIcon,
    ArrowForward as ArrowForwardIcon,
    School
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { format, isPast, isToday, isTomorrow } from 'date-fns';

const StudentTodos = () => {
    const navigate = useNavigate();
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, active, completed
    const [openDialog, setOpenDialog] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        category: 'General',
        dueDate: ''
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            const res = await api.get('/todos');
            setTodos(res.data.data);
        } catch (error) {
            console.error('Failed to fetch todos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editingId) {
                await api.put(`/todos/${editingId}`, formData);
            } else {
                await api.post('/todos', formData);
            }
            fetchTodos();
            handleClose();
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save task');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/todos/${id}`);
            setTodos(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const toggleComplete = async (todo) => {
        if (todo.type !== 'manual') return; // Only manual tasks can be toggled directly

        try {
            const updated = { ...todo, isCompleted: !todo.isCompleted };
            // Optimistic update
            setTodos(prev => prev.map(t => t.id === todo.id ? updated : t));

            await api.put(`/todos/${todo.id}`, { isCompleted: updated.isCompleted });
        } catch (error) {
            console.error('Toggle error:', error);
            fetchTodos(); // Revert on error
        }
    };

    const handleOpen = (todo = null) => {
        if (todo) {
            setEditingId(todo.id);
            setFormData({
                title: todo.title,
                description: todo.description || '',
                priority: todo.priority || 'medium',
                category: todo.category || 'General',
                dueDate: todo.dueDate ? format(new Date(todo.dueDate), 'yyyy-MM-dd') : ''
            });
        } else {
            setEditingId(null);
            setFormData({
                title: '',
                description: '',
                priority: 'medium',
                category: 'General',
                dueDate: ''
            });
        }
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
    };

    const handleAction = (todo) => {
        if (todo.type === 'assignment') {
            navigate('/student/assignments');
        } else if (todo.type === 'test') {
            navigate('/student/tests'); // Or dashboard if tests aren't separate
        } else if (todo.type === 'resource') {
            navigate(`/student/courses/${todo.courseId}`);
        }
    };

    const filteredTodos = todos.filter(t => {
        // Smart tasks are always 'active' in the backend view (filtered by submission/completion)
        if (filter === 'active') return !t.isCompleted;
        if (filter === 'completed') return t.isCompleted && t.type === 'manual';
        return true;
    });

    const getPriorityColor = (p) => {
        switch (p) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    const formatDueDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        return format(date, 'MMM d');
    };

    // Render Icon based on type
    const getTaskIcon = (type) => {
        switch (type) {
            case 'assignment': return <AssignmentIcon color="primary" />;
            case 'test': return <QuizIcon color="error" />;
            case 'resource': return <VideoIcon color="secondary" />;
            default: return <School color="action" />; // Fallback
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="800" sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            My Smart To-Do
                        </Typography>
                        <Typography color="text.secondary">
                            Your automated academic planner
                        </Typography>
                    </Box>
                    <Box>
                        <Button
                            variant={filter === 'all' ? 'contained' : 'outlined'}
                            onClick={() => setFilter('all')}
                            sx={{ mr: 1, borderRadius: 2 }}
                            size="small"
                        >All</Button>
                        <Button
                            variant={filter === 'active' ? 'contained' : 'outlined'}
                            onClick={() => setFilter('active')}
                            sx={{ mr: 1, borderRadius: 2 }}
                            size="small"
                        >Pending</Button>
                        <Button
                            variant={filter === 'completed' ? 'contained' : 'outlined'}
                            onClick={() => setFilter('completed')}
                            sx={{ borderRadius: 2 }}
                            size="small"
                        >Done</Button>
                    </Box>
                </Box>

                <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    {filteredTodos.length === 0 ? (
                        <Box sx={{ p: 5, textAlign: 'center' }}>
                            <Typography color="text.secondary">No tasks found. Great job! 🎉</Typography>
                        </Box>
                    ) : (
                        <List sx={{ p: 0 }}>
                            {filteredTodos.map((todo, index) => (
                                <Box key={todo.id}>
                                    <ListItem
                                        sx={{
                                            bgcolor: todo.isCompleted ? '#f8f9fa' : 'white',
                                            opacity: todo.isCompleted ? 0.7 : 1,
                                            transition: 'all 0.2s',
                                            '&:hover': { bgcolor: '#fcfcfc' },
                                            py: 2
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 48 }}>
                                            {todo.type === 'manual' ? (
                                                <Checkbox
                                                    icon={<RadioButtonUnchecked />}
                                                    checkedIcon={<CheckCircle />}
                                                    checked={todo.isCompleted}
                                                    onChange={() => toggleComplete(todo)}
                                                    color="success"
                                                />
                                            ) : (
                                                <Tooltip title={`Auto-generated from ${todo.type}`}>
                                                    <Box sx={{ p: 1, bgcolor: '#f0f7ff', borderRadius: '50%', display: 'flex' }}>
                                                        {getTaskIcon(todo.type)}
                                                    </Box>
                                                </Tooltip>
                                            )}
                                        </ListItemIcon>

                                        <ListItemText
                                            primary={
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        textDecoration: todo.isCompleted ? 'line-through' : 'none',
                                                        fontSize: '1rem',
                                                        fontWeight: todo.type !== 'manual' ? 600 : 500,
                                                        color: todo.type === 'test' ? 'error.main' : 'text.primary'
                                                    }}
                                                >
                                                    {todo.title}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                                                    {todo.type !== 'manual' && (
                                                        <Chip
                                                            label={todo.type.toUpperCase()}
                                                            size="small"
                                                            color={todo.type === 'test' ? 'error' : todo.type === 'assignment' ? 'primary' : 'secondary'}
                                                            variant="filled"
                                                            sx={{ height: 20, fontSize: '0.65rem' }}
                                                        />
                                                    )}

                                                    {todo.priority && todo.type === 'manual' && (
                                                        <Chip
                                                            label={todo.priority}
                                                            size="small"
                                                            color={getPriorityColor(todo.priority)}
                                                            variant="outlined"
                                                            icon={<Flag sx={{ fontSize: 14 }} />}
                                                            sx={{ height: 20 }}
                                                        />
                                                    )}

                                                    {todo.dueDate && (
                                                        <Chip
                                                            label={formatDueDate(todo.dueDate)}
                                                            size="small"
                                                            variant="outlined"
                                                            color={isPast(new Date(todo.dueDate)) && !isToday(new Date(todo.dueDate)) ? 'error' : 'default'}
                                                            icon={<Event sx={{ fontSize: 14 }} />}
                                                            sx={{ height: 20 }}
                                                        />
                                                    )}

                                                    {todo.courseId && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            • From Course
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />

                                        <ListItemSecondaryAction>
                                            {todo.type === 'manual' ? (
                                                <>
                                                    <IconButton edge="end" onClick={() => handleOpen(todo)} sx={{ mr: 1 }}>
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                    <IconButton edge="end" onClick={() => handleDelete(todo.id)} color="error">
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </>
                                            ) : (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    endIcon={<ArrowForwardIcon />}
                                                    onClick={() => handleAction(todo)}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    {todo.type === 'assignment' ? 'Submit' : todo.type === 'test' ? 'Revise' : 'Watch'}
                                                </Button>
                                            )}
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    <Divider component="li" />
                                </Box>
                            ))}
                        </List>
                    )}
                </Paper>
            </Container>

            {/* Floating Action Button for Manual Tasks */}
            <Tooltip title="Add Manual Task">
                <Fab
                    color="primary"
                    aria-label="add"
                    sx={{ position: 'fixed', bottom: 32, right: 32 }}
                    onClick={() => handleOpen()}
                >
                    <Add />
                </Fab>
            </Tooltip>

            {/* Manual Task Dialog */}
            <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>{editingId ? 'Edit Task' : 'New Task'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Title"
                            fullWidth
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Read Chapter 4"
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={2}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Priority</InputLabel>
                            <Select
                                value={formData.priority}
                                label="Priority"
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <MenuItem value="low">Low</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={formData.category}
                                label="Category"
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <MenuItem value="General">General</MenuItem>
                                <MenuItem value="Homework">Homework</MenuItem>
                                <MenuItem value="Exam Prep">Exam Prep</MenuItem>
                                <MenuItem value="Personal">Personal</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Due Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save Task</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StudentTodos;
