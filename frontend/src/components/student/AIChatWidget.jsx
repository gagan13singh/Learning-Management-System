import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Paper,
    TextField,
    IconButton,
    Typography,
    Fab,
    CircularProgress,
    Avatar,
    Tooltip,
    Chip,
    useTheme,
} from '@mui/material';
import {
    Send as SendIcon,
    SmartToy as BotIcon,
    Close as CloseIcon,
    ChatBubble as ChatIcon,
    Person as PersonIcon,
    AutoAwesome as SparkleIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const AIChatWidget = () => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        {
            role: 'assistant',
            content: 'Hi! I\'m your AI Study Assistant. Ask me anything about your courses, or just say hi!',
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isOpen]);

    const handleSend = async (text = null) => {
        const messageToSend = (typeof text === 'string') ? text : message;

        if (!messageToSend.trim()) return;

        if (typeof text !== 'string') setMessage('');

        const userMessage = messageToSend.trim();

        const newHistory = [...chatHistory, { role: 'user', content: userMessage }];
        setChatHistory(newHistory);
        setIsLoading(true);

        try {
            const apiHistory = newHistory
                .slice(0, -1)
                .filter(msg => msg.role !== 'assistant' || msg.content !== chatHistory[0].content)
                .map(msg => ({ role: msg.role, content: msg.content }));

            const response = await api.post('/chat', {
                message: userMessage,
                history: apiHistory,
            });

            if (response.data.success) {
                setChatHistory(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
            }
        } catch (error) {
            console.error('Chat Error:', error);
            const errorMessage = error.response?.data?.message || 'Sorry, I encountered an error. Please check your connection or try again later.';
            setChatHistory(prev => [...prev, {
                role: 'assistant',
                content: errorMessage,
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Extended Floating Action Button */}
            {!isOpen && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        position: 'fixed',
                        bottom: 32,
                        right: 120,
                        zIndex: 1000,
                    }}
                >
                    <Fab
                        variant="extended"
                        onClick={() => setIsOpen(true)}
                        sx={{
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            color: 'white',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            fontSize: '1rem',
                            px: 3,
                            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)',
                            }
                        }}
                    >
                        <SparkleIcon sx={{ mr: 1 }} />
                        Ask AI Doubt
                    </Fab>
                </motion.div>
            )}

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'fixed',
                            bottom: 100,
                            right: 32,
                            zIndex: 1000,
                            width: 380,
                            maxWidth: '90vw',
                        }}
                    >
                        <Paper
                            elevation={12}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: 550,
                                maxHeight: '80vh',
                                overflow: 'hidden',
                                borderRadius: 4,
                                bgcolor: 'background.paper',
                                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                            }}
                        >
                            {/* Header */}
                            <Box
                                sx={{
                                    p: 2.5,
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 34, height: 34 }}>
                                        <SparkleIcon fontSize="small" />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.2}>
                                            AI Study Assistant
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                            Powered by Gemini
                                        </Typography>
                                    </Box>
                                </Box>
                                <IconButton
                                    size="small"
                                    onClick={() => setIsOpen(false)}
                                    sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            {/* Messages Area */}
                            <Box
                                sx={{
                                    flex: 1,
                                    p: 2,
                                    overflowY: 'auto',
                                    bgcolor: isDarkMode ? 'background.default' : '#fafafa',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                }}
                            >
                                {chatHistory.map((msg, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                            gap: 1.5,
                                            alignItems: 'flex-start',
                                        }}
                                    >
                                        {msg.role === 'assistant' && (
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    bgcolor: 'primary.main',
                                                    mt: 0.5
                                                }}
                                            >
                                                <BotIcon fontSize="small" />
                                            </Avatar>
                                        )}

                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                maxWidth: '80%',
                                                bgcolor: msg.role === 'user'
                                                    ? 'primary.main'
                                                    : isDarkMode ? 'background.paper' : 'white',
                                                color: msg.role === 'user'
                                                    ? 'white'
                                                    : 'text.primary',
                                                borderRadius: 3,
                                                borderTopLeftRadius: msg.role === 'assistant' ? 4 : 20,
                                                borderTopRightRadius: msg.role === 'user' ? 4 : 20,
                                                border: msg.role === 'assistant' ? `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#e0e0e0'}` : 'none',
                                                boxShadow: msg.role === 'assistant' ? '0 2px 4px rgba(0,0,0,0.02)' : '0 2px 4px rgba(33, 150, 243, 0.2)',
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                                {msg.content}
                                            </Typography>
                                        </Paper>

                                        {msg.role === 'user' && (
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    bgcolor: isDarkMode ? 'grey.700' : 'grey.300',
                                                    mt: 0.5
                                                }}
                                            >
                                                <PersonIcon fontSize="small" sx={{ color: isDarkMode ? 'grey.300' : 'grey.700' }} />
                                            </Avatar>
                                        )}
                                    </Box>
                                ))}
                                {isLoading && (
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1.5 }}>
                                        <Avatar
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                bgcolor: 'primary.main',
                                            }}
                                        >
                                            <BotIcon fontSize="small" />
                                        </Avatar>
                                        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <motion.div
                                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                                    transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                                                    style={{ width: 8, height: 8, borderRadius: '50%', background: '#2196F3' }}
                                                />
                                                <motion.div
                                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                                                    style={{ width: 8, height: 8, borderRadius: '50%', background: '#2196F3' }}
                                                />
                                                <motion.div
                                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                                                    style={{ width: 8, height: 8, borderRadius: '50%', background: '#2196F3' }}
                                                />
                                            </Box>
                                        </Paper>
                                    </Box>
                                )}
                                <div ref={messagesEndRef} />
                            </Box>

                            {/* Quick Actions Area */}
                            {!isLoading && (
                                <Box sx={{
                                    px: 2,
                                    pb: 1.5,
                                    display: 'flex',
                                    gap: 1,
                                    overflowX: 'auto',
                                    whiteSpace: 'nowrap',
                                    // Custom Scrollbar styling
                                    scrollbarWidth: 'thin',
                                    '&::-webkit-scrollbar': { height: 6 },
                                    '&::-webkit-scrollbar-thumb': {
                                        borderRadius: 10,
                                        bgcolor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                                        '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }
                                    },
                                    '&::-webkit-scrollbar-track': { bgcolor: 'transparent' }
                                }}>
                                    {[
                                        '🎓 Study Tips',
                                        '📅 Create Schedule',
                                        '💪 Motivation',
                                        '📝 Explain Key Concepts',
                                        '🧠 Quiz Me',
                                        '📚 Summarize Topic'
                                    ].map((action) => (
                                        <Chip
                                            key={action}
                                            label={action}
                                            onClick={() => handleSend(action)}
                                            size="medium"
                                            sx={{
                                                bgcolor: 'background.paper',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 2,
                                                fontWeight: 500,
                                                color: 'text.primary',
                                                flexShrink: 0,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    bgcolor: isDarkMode ? 'rgba(33, 150, 243, 0.2)' : 'primary.50',
                                                    borderColor: 'primary.main',
                                                    color: 'primary.main',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 8px rgba(33, 150, 243, 0.15)'
                                                },
                                                '&:active': { transform: 'scale(0.98)' }
                                            }}
                                        />
                                    ))}
                                </Box>
                            )}

                            {/* Input Area */}
                            <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Ask a doubt..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        disabled={isLoading}
                                        multiline
                                        maxRows={3}
                                        variant="outlined"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 3,
                                                bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8f9fa',
                                                color: 'text.primary',
                                                '& fieldset': { borderColor: 'transparent' },
                                                '&:hover fieldset': { borderColor: 'divider' },
                                                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                                            },
                                            '& .MuiInputBase-input': {
                                                color: 'text.primary',
                                            },
                                            '& .MuiInputBase-input::placeholder': {
                                                color: 'text.secondary',
                                                opacity: 1,
                                            },
                                        }}
                                    />
                                    <IconButton
                                        onClick={() => handleSend()}
                                        disabled={!message.trim() || isLoading}
                                        sx={{
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            '&:hover': { bgcolor: 'primary.dark' },
                                            width: 44,
                                            height: 44,
                                            borderRadius: 2.5,
                                            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                                            transition: 'all 0.2s',
                                            '&:disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' }
                                        }}
                                    >
                                        <SendIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Paper>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChatWidget;
