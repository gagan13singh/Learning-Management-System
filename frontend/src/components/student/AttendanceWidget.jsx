import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    LinearProgress,
    CircularProgress
} from '@mui/material';
import { PieChart, CheckCircle } from '@mui/icons-material';
import api from '../../api/axios';

const AttendanceWidget = () => {
    const [summary, setSummary] = useState([]);
    const [overall, setOverall] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const response = await api.get('/attendance/summary');
                const data = response.data.data;
                setSummary(data);

                if (data.length > 0) {
                    const totalClasses = data.reduce((acc, curr) => acc + curr.total, 0);
                    const totalPresent = data.reduce((acc, curr) => acc + curr.present, 0);
                    setOverall(Math.round((totalPresent / totalClasses) * 100));
                }
            } catch (error) {
                console.error('Error fetching attendance:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, []);

    const getColor = (percentage) => {
        if (percentage >= 85) return 'success';
        if (percentage >= 75) return 'warning';
        return 'error';
    };

    return (
        <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6" fontWeight="700">
                        Attendance
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Overall Summary
                    </Typography>
                </Box>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress
                        variant="determinate"
                        value={overall}
                        color={getColor(overall)}
                        size={56}
                        thickness={4}
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
                        <Typography variant="caption" component="div" fontWeight="700" color="text.primary">
                            {overall}%
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <CardContent sx={{ pt: 1 }}>
                {loading ? (
                    <Box sx={{ textAlign: 'center' }}>Loading...</Box>
                ) : summary.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CheckCircle sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            No attendance records yet.
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        {summary.map((item) => (
                            <Box key={item.subject}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2" fontWeight="600">
                                        {item.subject}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        fontWeight="700"
                                        color={`${getColor(item.percentage)}.main`}
                                    >
                                        {item.percentage}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={item.percentage}
                                    color={getColor(item.percentage)}
                                    sx={{ height: 6, borderRadius: 3, bgcolor: theme => theme.palette.grey[200] }}
                                />
                            </Box>
                        ))}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default AttendanceWidget;
