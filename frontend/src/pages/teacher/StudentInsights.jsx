import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Card, CardContent,
    Avatar, Chip, Button, CircularProgress
} from '@mui/material';
import { TrendingUp, Warning, CheckCircle, Share } from '@mui/icons-material';
import api from '../../api/axios';
import { useTheme } from '@mui/material/styles';

const StudentInsights = () => {
    const theme = useTheme();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            // Fetch batches to get students
            const res = await api.get('/api/features/batches');
            const batches = res.data.batches || [];

            // Aggregate unique students from all batches
            const studentMap = new Map();
            batches.forEach(batch => {
                batch.students.forEach(student => {
                    if (!studentMap.has(student._id)) {
                        studentMap.set(student._id, {
                            ...student,
                            // Mock analytics data if not present in student object
                            riskStatus: student.riskStatus || 'Consistent',
                            behaviourScore: student.behaviourScore || 85,
                            attendance: '85%', // Placeholder until real aggregation
                            testAvg: '78%'    // Placeholder
                        });
                    }
                });
            });

            setStudents(Array.from(studentMap.values()));
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Consistent': return theme.palette.success.main;
            case 'Risk': return theme.palette.warning.main;
            case 'Critical': return theme.palette.error.main;
            default: return theme.palette.text.primary;
        }
    };

    const handleSendReport = async (studentId) => {
        try {
            await api.get(`/api/features/analytics/parent-report/${studentId}`);
            alert(`Parent Update Report sent successfully!`);
        } catch (error) {
            console.error(error);
            alert('Error sending report');
        }
    };

    return (
        <Box component="main" sx={{ p: 4, minHeight: '100vh', background: theme.palette.background.default }}>
            <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold', background: theme.palette.gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Behaviour & Consistency Analyzer
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress aria-label="Loading student insights" />
                </Box>
            ) : students.length === 0 ? (
                <Typography variant="h6" color="text.secondary" role="status">No students found in your batches.</Typography>
            ) : (
                <Grid container spacing={3} role="list">
                    {students.map((student) => (
                        <Grid item xs={12} md={4} key={student._id} role="listitem">
                            <Card className="glass-card" component="article" sx={{ borderTop: `4px solid ${getStatusColor(student.riskStatus)}` }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <Avatar
                                            sx={{ width: 60, height: 60, mr: 2, bgcolor: getStatusColor(student.riskStatus) }}
                                            aria-hidden="true"
                                        >
                                            {student.name ? student.name[0] : 'S'}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" component="h2" fontWeight="bold">{student.name}</Typography>
                                            <Chip
                                                label={student.riskStatus}
                                                size="small"
                                                sx={{
                                                    bgcolor: `${getStatusColor(student.riskStatus)}22`,
                                                    color: getStatusColor(student.riskStatus),
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        </Box>
                                    </Box>

                                    <Grid container spacing={2} sx={{ mb: 3 }}>
                                        <Grid item xs={6}>
                                            <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 2, textAlign: 'center' }}>
                                                <Typography variant="caption" color="text.secondary" display="block">Attendance</Typography>
                                                <Typography variant="h6" fontWeight="bold">{student.attendance}</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 2, textAlign: 'center' }}>
                                                <Typography variant="caption" color="text.secondary" display="block">Test Avg</Typography>
                                                <Typography variant="h6" fontWeight="bold">{student.testAvg}</Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">Behaviour Score</Typography>
                                        <Box position="relative" display="inline-flex" aria-label={`Behaviour score: ${student.behaviourScore}%`}>
                                            <CircularProgress
                                                variant="determinate"
                                                value={student.behaviourScore}
                                                size={40}
                                                sx={{ color: getStatusColor(student.riskStatus) }}
                                                aria-hidden="true"
                                            />
                                            <Box
                                                sx={{
                                                    top: 0,
                                                    left: 0,
                                                    bottom: 0,
                                                    right: 0,
                                                    position: 'absolute',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Typography variant="caption" component="div" color="text.secondary">
                                                    {`${Math.round(student.behaviourScore)}`}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<Share aria-hidden="true" />}
                                        onClick={() => handleSendReport(student._id)}
                                        sx={{ borderRadius: '12px', borderColor: theme.palette.primary.main }}
                                        aria-label={`Send parent report for ${student.name}`}
                                    >
                                        Send Parent Report
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default StudentInsights;
