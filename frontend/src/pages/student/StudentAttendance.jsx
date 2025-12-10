import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    CircularProgress,
    Card,
    CardContent,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { CheckCircle, Cancel, RemoveCircle } from '@mui/icons-material';
import api from '../../utils/api';

const StudentAttendance = () => {
    const [attendanceData, setAttendanceData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await api.get('/attendance/my-summary');
                setAttendanceData(res.data.data);
            } catch (error) {
                console.error('Failed to fetch attendance:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    const getColor = (percentage) => {
        if (percentage >= 75) return 'success';
        if (percentage >= 60) return 'warning';
        return 'error';
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="800" gutterBottom>
                        Attendance
                    </Typography>
                    <Typography color="text.secondary">
                        Overall: {attendanceData?.overallPercentage?.toFixed(1)}%
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {attendanceData?.subjectWise?.map((subject) => (
                        <Grid item xs={12} md={6} key={subject.subject}>
                            <Card sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="h6" fontWeight="bold">
                                            {subject.subject}
                                        </Typography>
                                        <Typography variant="h6" color={`${getColor(subject.percentage)}.main`}>
                                            {subject.percentage.toFixed(1)}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={subject.percentage}
                                        color={getColor(subject.percentage)}
                                        sx={{ height: 10, borderRadius: 5, mb: 2 }}
                                    />
                                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-around' }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h5" color="success.main" fontWeight="bold">
                                                {subject.present}
                                            </Typography>
                                            <Typography variant="caption">Present</Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h5" color="error.main" fontWeight="bold">
                                                {subject.absent}
                                            </Typography>
                                            <Typography variant="caption">Absent</Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h5" color="text.secondary" fontWeight="bold">
                                                {subject.total}
                                            </Typography>
                                            <Typography variant="caption">Total</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}

                    {(!attendanceData?.subjectWise || attendanceData.subjectWise.length === 0) && (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>No attendance records found.</Paper>
                        </Grid>
                    )}
                </Grid>
            </Container>
        </Box>
    );
};

export default StudentAttendance;
