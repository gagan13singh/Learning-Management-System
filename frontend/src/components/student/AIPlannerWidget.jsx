import React, { useState } from 'react';
import {
    Box,
    Card,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    CircularProgress,
    IconButton
} from '@mui/material';
import {
    AutoAwesome,
    CalendarMonth,
    Schedule,
    Close,
    CheckCircleOutline,
    Book
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import api from '../../utils/api';

const AIPlannerWidget = ({ compact = false }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState(null);

    const generatePlan = async () => {
        setLoading(true);
        setOpen(true);
        try {
            const response = await api.post('/ai/study-plan');
            if (response.data.success) {
                setPlan(response.data.plan);
            }
        } catch (error) {
            console.error('Failed to generate plan:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {compact ? (
                // Compact "Header" Mode for Top Row
                <Card
                    onClick={generatePlan}
                    elevation={0}
                    sx={{
                        p: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        height: '100%',
                        borderRadius: 4,
                        boxShadow: '0 4px 15px rgba(118, 75, 162, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '1px solid rgba(255,255,255,0.1)',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 25px rgba(118, 75, 162, 0.4)'
                        }
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{
                            p: 1,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <AutoAwesome sx={{ color: 'white', fontSize: 20 }} />
                        </Box>
                        <Chip
                            label="New"
                            size="small"
                            sx={{
                                bgcolor: 'white',
                                color: '#764ba2',
                                fontWeight: 'bold',
                                height: 24,
                                fontSize: '0.7rem'
                            }}
                        />
                    </Box>

                    <Typography variant="h6" fontWeight="800" sx={{ lineHeight: 1.2, mb: 0.5 }}>
                        AI Planner
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 500, lineHeight: 1.2 }}>
                        Generate your weekly study schedule
                    </Typography>
                </Card>
            ) : (
                // Full Banner Mode (Default)
                <Card
                    sx={{
                        p: 2,
                        mb: 3,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: 4,
                        boxShadow: '0 4px 15px rgba(118, 75, 162, 0.4)'
                    }}
                >
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            AI Study Planner
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Get a personalized schedule based on your exams.
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AutoAwesome />}
                        onClick={generatePlan}
                        sx={{
                            bgcolor: 'white',
                            color: '#764ba2',
                            fontWeight: 'bold',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                        }}
                    >
                        Plan My Week
                    </Button>
                </Card>
            )}

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 4 }
                }}
            >
                <DialogTitle sx={{ borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AutoAwesome color="primary" />
                        <Typography variant="h6" fontWeight="bold">Your AI Study Plan</Typography>
                    </Box>
                    <IconButton onClick={() => setOpen(false)}><Close /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: '#f8f9fa' }}>
                    {loading ? (
                        <Box sx={{ p: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <CircularProgress size={40} />
                            <Typography color="text.secondary">Analyzing your schedule...</Typography>
                        </Box>
                    ) : (
                        <Box sx={{ p: 3 }}>
                            {plan?.map((dayPlan, index) => (
                                <Card key={index} sx={{ mb: 2, borderRadius: 3, overflow: 'hidden' }}>
                                    <Box sx={{ p: 2, bgcolor: '#f0f4ff', borderBottom: '1px solid #e0e6ff', display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                                            {dayPlan.day}
                                        </Typography>
                                        <Chip label={dayPlan.focus} size="small" color="secondary" variant="outlined" />
                                    </Box>
                                    <List>
                                        {dayPlan.tasks.map((task, idx) => (
                                            <ListItem key={idx} divider={idx !== dayPlan.tasks.length - 1}>
                                                <ListItemIcon>
                                                    <Box sx={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: '50%',
                                                        bgcolor: 'primary.light',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {index + 1}.{idx + 1}
                                                    </Box>
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkMath]}
                                                            rehypePlugins={[rehypeKatex]}
                                                            components={{
                                                                p: ({ node, ...props }) => <span {...props} />, // Render as span to avoid nesting p in p
                                                            }}
                                                        >
                                                            {task.activity}
                                                        </ReactMarkdown>
                                                    }
                                                    secondary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                            <Schedule sx={{ fontSize: 14 }} />
                                                            <Typography variant="caption">{task.time}</Typography>
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Card>
                            ))}
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AIPlannerWidget;
