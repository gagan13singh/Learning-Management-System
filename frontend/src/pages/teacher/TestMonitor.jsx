import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, IconButton, Button, Dialog, DialogTitle,
    DialogContent, List, ListItem, ListItemText, CircularProgress, Alert
} from '@mui/material';
import { Refresh, Warning, CheckCircle, Cancel, Visibility, ArrowBack } from '@mui/icons-material';
import api from '../../api/axios';

const TestMonitor = () => {
    const { id } = useParams(); // Test ID
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAttempt, setSelectedAttempt] = useState(null);
    const [logsOpen, setLogsOpen] = useState(false);

    const fetchResults = async () => {
        try {
            // Using existing endpoint that returns all attempts for a test
            // Note: In real-world, we might want a lightweight 'status-only' endpoint for frequent polling
            const { data } = await api.get(`/tests/${id}/quiz-results`);
            if (data.success) {
                setAttempts(data.data);
            }
        } catch (error) {
            console.error("Monitor Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
        // Poll every 10 seconds for live updates
        const interval = setInterval(fetchResults, 10000);
        return () => clearInterval(interval);
    }, [id]);

    const handleViewLogs = (attempt) => {
        setSelectedAttempt(attempt);
        setLogsOpen(true);
    };

    const getRiskColor = (level) => {
        switch (level) {
            case 'High': return 'error';
            case 'Medium': return 'warning';
            default: return 'success';
        }
    };

    return (
        <Box sx={{ p: 4, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => navigate('/teacher/tests')}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h4" fontWeight="bold">Live Proctoring Monitor</Typography>
                </Box>
                <Button
                    startIcon={<Refresh />}
                    onClick={() => { setLoading(true); fetchResults(); }}
                    variant="outlined"
                >
                    Refresh Now
                </Button>
            </Box>

            {/* Stats Cards could go here (Active: 5, Submitted: 10) */}

            {/* Main Table */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 3 }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#eee' }}>
                            <TableRow>
                                <TableCell><b>Student</b></TableCell>
                                <TableCell><b>Status</b></TableCell>
                                <TableCell><b>Score</b></TableCell>
                                <TableCell><b>Violations</b></TableCell>
                                <TableCell><b>Risk Level</b></TableCell>
                                <TableCell><b>Action</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && attempts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center"><CircularProgress /></TableCell>
                                </TableRow>
                            ) : attempts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">No attempts found yet.</TableCell>
                                </TableRow>
                            ) : (
                                attempts.map((attempt) => (
                                    <TableRow key={attempt._id} hover>
                                        <TableCell>
                                            <Typography fontWeight="500">{attempt.student?.name || 'Unknown'}</Typography>
                                            <Typography variant="caption" color="text.secondary">{attempt.student?.email}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={attempt.status}
                                                color={attempt.status === 'InProgress' ? 'primary' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {attempt.status === 'Completed' ? `${attempt.totalScore || 0}` : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={attempt.proctoringLogs?.length || 0}
                                                color={attempt.proctoringLogs?.length > 0 ? 'warning' : 'default'}
                                                variant="outlined"
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={attempt.riskLevel || 'Low'}
                                                color={getRiskColor(attempt.riskLevel)}
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton color="primary" onClick={() => handleViewLogs(attempt)}>
                                                <Visibility />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Logs Modal */}
            <Dialog open={logsOpen} onClose={() => setLogsOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning color="warning" /> Violation Logs: {selectedAttempt?.student?.name}
                </DialogTitle>
                <DialogContent>
                    {selectedAttempt?.proctoringLogs?.length === 0 ? (
                        <Alert severity="success">No violations recorded. Clean attempt.</Alert>
                    ) : (
                        <List>
                            {selectedAttempt?.proctoringLogs?.map((log, idx) => (
                                <ListItem key={idx} divider>
                                    <ListItemText
                                        primary={
                                            <Typography color="error" fontWeight="bold">
                                                {log.violationType}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant="caption" component="span">
                                                    {new Date(log.timestamp).toLocaleTimeString()}
                                                </Typography>
                                                <br />
                                                {log.evidence}
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default TestMonitor;
