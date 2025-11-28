import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Grid, TextField, MenuItem,
    Button, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Checkbox, Chip, IconButton, CircularProgress, Alert,
    Paper, FormControl, InputLabel, Select, Tooltip
} from '@mui/material';
import { Save, CheckCircle, Cancel, AccessTime, Search, FilterList } from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';

const AttendanceManager = () => {
    const theme = useTheme();
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({}); // { studentId: 'PRESENT' | 'ABSENT' | 'LATE' }
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBatches();
    }, []);

    useEffect(() => {
        if (selectedBatch && selectedDate) {
            fetchBatchData();
        }
    }, [selectedBatch, selectedDate]);

    const fetchBatches = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/features/batches', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBatches(res.data.batches);
            if (res.data.batches.length > 0) {
                setSelectedBatch(res.data.batches[0]._id);
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
        }
    };

    const fetchBatchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            // 1. Fetch Batch Details (to get students)
            const batchRes = await axios.get(`http://localhost:5000/api/features/batches/${selectedBatch}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const batchStudents = batchRes.data.data.students;
            setStudents(batchStudents);

            // 2. Fetch Existing Attendance for this date
            // Since we don't have a direct "get by date" endpoint, we fetch all and filter (or use the history endpoint)
            // Ideally, we should add a specific endpoint, but for now let's fetch history and find the date.
            const attendanceRes = await axios.get(`http://localhost:5000/api/features/attendance/batch/${selectedBatch}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const existingRecord = attendanceRes.data.attendanceRecords.find(
                r => new Date(r.date).toISOString().split('T')[0] === selectedDate
            );

            const initialData = {};
            if (existingRecord) {
                existingRecord.records.forEach(r => {
                    initialData[r.student] = r.status;
                });
            } else {
                // Default to PRESENT for all if no record exists
                batchStudents.forEach(s => {
                    initialData[s._id] = 'PRESENT';
                });
            }
            setAttendanceData(initialData);

        } catch (error) {
            console.error('Error fetching data:', error);
            setMessage({ type: 'error', text: 'Failed to load data' });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const markAll = (status) => {
        const newData = { ...attendanceData };
        students.forEach(s => {
            if (s.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                newData[s._id] = status;
            }
        });
        setAttendanceData(newData);
    };

    const saveAttendance = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const records = Object.entries(attendanceData).map(([studentId, status]) => ({
                studentId,
                status
            }));

            await axios.post('http://localhost:5000/api/features/attendance', {
                batchId: selectedBatch,
                date: selectedDate,
                records
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage({ type: 'success', text: 'Attendance saved successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Error saving attendance:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error saving attendance' });
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PRESENT': return 'success';
            case 'ABSENT': return 'error';
            case 'LATE': return 'warning';
            default: return 'default';
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate stats for current view
    const presentCount = Object.values(attendanceData).filter(s => s === 'PRESENT').length;
    const absentCount = Object.values(attendanceData).filter(s => s === 'ABSENT').length;
    const lateCount = Object.values(attendanceData).filter(s => s === 'LATE').length;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Attendance Manager</Typography>
                {message && (
                    <Alert severity={message.type} sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
                        {message.text}
                    </Alert>
                )}
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <Card className="glass-card">
                        <CardContent>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Select Batch</InputLabel>
                                <Select
                                    value={selectedBatch}
                                    label="Select Batch"
                                    onChange={(e) => setSelectedBatch(e.target.value)}
                                >
                                    {batches.map(batch => (
                                        <MenuItem key={batch._id} value={batch._id}>{batch.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                fullWidth
                                type="date"
                                label="Date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Card className="glass-card" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main" fontWeight="bold">{presentCount}</Typography>
                            <Typography variant="body2">Present</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="error.main" fontWeight="bold">{absentCount}</Typography>
                            <Typography variant="body2">Absent</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="warning.main" fontWeight="bold">{lateCount}</Typography>
                            <Typography variant="body2">Late</Typography>
                        </Box>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                            onClick={saveAttendance}
                            disabled={saving || !selectedBatch}
                            sx={{ background: theme.palette.gradients.primary }}
                        >
                            {saving ? 'Saving...' : 'Save Attendance'}
                        </Button>
                    </Card>
                </Grid>
            </Grid>

            <Card className="glass-card">
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                size="small"
                                placeholder="Search student..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{ startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button size="small" variant="outlined" color="success" onClick={() => markAll('PRESENT')}>Mark All Present</Button>
                            <Button size="small" variant="outlined" color="error" onClick={() => markAll('ABSENT')}>Mark All Absent</Button>
                        </Box>
                    </Box>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <TableContainer component={Paper} sx={{ boxShadow: 'none', bgcolor: 'transparent' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Student Name</TableCell>
                                        <TableCell align="center">Status</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                                        <TableRow key={student._id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box
                                                        component="img"
                                                        src={student.profilePicture || `https://ui-avatars.com/api/?name=${student.name}&background=random`}
                                                        sx={{ width: 40, height: 40, borderRadius: '50%' }}
                                                    />
                                                    <Box>
                                                        <Typography variant="subtitle2">{student.name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{student.email}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={attendanceData[student._id] || 'PRESENT'}
                                                    color={getStatusColor(attendanceData[student._id] || 'PRESENT')}
                                                    sx={{ fontWeight: 'bold', minWidth: 80 }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                    <Tooltip title="Mark Present">
                                                        <IconButton
                                                            color={attendanceData[student._id] === 'PRESENT' ? 'success' : 'default'}
                                                            onClick={() => handleStatusChange(student._id, 'PRESENT')}
                                                        >
                                                            <CheckCircle />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Mark Absent">
                                                        <IconButton
                                                            color={attendanceData[student._id] === 'ABSENT' ? 'error' : 'default'}
                                                            onClick={() => handleStatusChange(student._id, 'ABSENT')}
                                                        >
                                                            <Cancel />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Mark Late">
                                                        <IconButton
                                                            color={attendanceData[student._id] === 'LATE' ? 'warning' : 'default'}
                                                            onClick={() => handleStatusChange(student._id, 'LATE')}
                                                        >
                                                            <AccessTime />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">No students found in this batch.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default AttendanceManager;
