import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Grid, Button, Chip, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField,
    MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab
} from '@mui/material';
import {
    Warning, Error as ErrorIcon, CheckCircle, Refresh, Send, Note,
    Timeline, TrendingDown, TrendingUp
} from '@mui/icons-material';
import api from '../../api/axios';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const Insights = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState({ totalStudents: 0, atRisk: 0, critical: 0, healthy: 0 });
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [reportData, setReportData] = useState({
        channel: 'email',
        template: 'at-risk',
        customMessage: '',
        recipientEmail: '',
        recipientPhone: ''
    });
    const [reportPreview, setReportPreview] = useState(null);

    useEffect(() => {
        fetchStats();
        fetchAtRiskStudents();
    }, [filter]);

    const fetchStats = async () => {
        try {
            const res = await api.get('/api/insights/stats');
            setStats(res.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchAtRiskStudents = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/insights/at-risk?riskLevel=${filter}`);
            setStudents(res.data.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateRisks = async () => {
        try {
            setLoading(true);
            await api.post('/api/insights/calculate', {});
            alert('Risk calculation complete!');
            fetchStats();
            fetchAtRiskStudents();
        } catch (error) {
            console.error('Error calculating risks:', error);
            alert('Error calculating risks');
        } finally {
            setLoading(false);
        }
    };

    const openReportModal = async (student) => {
        setSelectedStudent(student);
        setReportData({
            ...reportData,
            template: student.riskLevel === 'critical' ? 'critical' : 'at-risk',
            recipientEmail: student.student.email,
            recipientPhone: student.student.phone
        });

        // Fetch preview
        try {
            const res = await api.post('/api/insights/reports/preview', {
                studentId: student.student._id,
                template: student.riskLevel === 'critical' ? 'critical' : 'at-risk'
            });
            setReportPreview(res.data.data);
        } catch (error) {
            console.error('Error fetching preview:', error);
        }

        setReportModalOpen(true);
    };

    const sendReport = async () => {
        try {
            await api.post('/api/insights/reports/send', {
                studentId: selectedStudent.student._id,
                channel: reportData.channel,
                template: reportData.template,
                customMessage: reportData.customMessage || reportPreview?.message,
                recipientEmail: reportData.recipientEmail,
                recipientPhone: reportData.recipientPhone
            });
            alert(`Report sent via ${reportData.channel}!`);
            setReportModalOpen(false);
        } catch (error) {
            console.error('Error sending report:', error);
            alert('Error sending report');
        }
    };

    const getRiskColor = (level) => {
        switch (level) {
            case 'critical': return 'error';
            case 'at-risk': return 'warning';
            default: return 'success';
        }
    };

    const getRiskIcon = (level) => {
        switch (level) {
            case 'critical': return <ErrorIcon />;
            case 'at-risk': return <Warning />;
            default: return <CheckCircle />;
        }
    };

    return (
        <Box component="main" sx={{ p: 4 }}>
            <Box component="header" sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">📊 Student Insights & Risk Detection</Typography>
                <Button
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={calculateRisks}
                    disabled={loading}
                    aria-label="Recalculate risk analysis"
                    sx={{ borderRadius: '20px', background: theme.palette.gradients.primary }}
                >
                    Recalculate Risks
                </Button>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }} component="section" aria-label="Statistics Overview">
                <Grid item xs={12} sm={6} md={3}>
                    <Card className="glass-card" sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" component="p" fontWeight="bold" color="success.main">
                                        {stats.healthy}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">Healthy</Typography>
                                </Box>
                                <CheckCircle sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} aria-hidden="true" />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card className="glass-card" sx={{ bgcolor: 'rgba(255, 152, 0, 0.1)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" component="p" fontWeight="bold" color="warning.main">
                                        {stats.atRisk}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">At-Risk</Typography>
                                </Box>
                                <Warning sx={{ fontSize: 48, color: 'warning.main', opacity: 0.3 }} aria-hidden="true" />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card className="glass-card" sx={{ bgcolor: 'rgba(244, 67, 54, 0.1)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" component="p" fontWeight="bold" color="error.main">
                                        {stats.critical}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">Critical</Typography>
                                </Box>
                                <ErrorIcon sx={{ fontSize: 48, color: 'error.main', opacity: 0.3 }} aria-hidden="true" />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card className="glass-card">
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" component="p" fontWeight="bold">
                                        {stats.totalStudents}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">Total Students</Typography>
                                </Box>
                                <Timeline sx={{ fontSize: 48, opacity: 0.3 }} aria-hidden="true" />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filter Tabs */}
            <Box component="nav" sx={{ mb: 3 }} aria-label="Risk Level Filters">
                <Tabs
                    value={filter}
                    onChange={(e, v) => setFilter(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                >
                    <Tab label="All At-Risk" value="all" />
                    <Tab label="At-Risk Only" value="at-risk" />
                    <Tab label="Critical Only" value="critical" />
                </Tabs>
            </Box>

            {/* Students Table */}
            <Card className="glass-card" component="section" aria-label="At-Risk Students List">
                <CardContent>
                    <TableContainer>
                        <Table aria-label="At-risk students table">
                            <TableHead>
                                <TableRow>
                                    <TableCell scope="col">Student</TableCell>
                                    <TableCell scope="col">Risk Level</TableCell>
                                    <TableCell scope="col">Attendance</TableCell>
                                    <TableCell scope="col">Test Average</TableCell>
                                    <TableCell scope="col">Factors</TableCell>
                                    <TableCell scope="col">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={student._id} hover>
                                        <TableCell>
                                            <Typography fontWeight="bold">{student.student.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {student.student.email}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={getRiskIcon(student.riskLevel)}
                                                label={student.riskLevel.toUpperCase()}
                                                color={getRiskColor(student.riskLevel)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {student.attendancePercentage < 60 && <TrendingDown color="error" fontSize="small" aria-label="Trending down" />}
                                                {student.attendancePercentage}%
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {student.testAverage < 50 && <TrendingDown color="error" fontSize="small" aria-label="Trending down" />}
                                                {student.testAverage}%
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {student.factors.slice(0, 2).map((f, idx) => (
                                                <Chip key={idx} label={f.type} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                                            ))}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => navigate(`/teacher/insights/student/${student.student._id}`)}
                                                    aria-label={`View details for ${student.student.name}`}
                                                >
                                                    Details
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    startIcon={<Send />}
                                                    onClick={() => openReportModal(student)}
                                                    sx={{ background: theme.palette.gradients.secondary }}
                                                    aria-label={`Send report for ${student.student.name}`}
                                                >
                                                    Send Report
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {students.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} aria-hidden="true" />
                            <Typography variant="h6">No at-risk students found!</Typography>
                            <Typography variant="body2" color="text.secondary">
                                All students are performing well.
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Report Preview Modal */}
            <Dialog
                open={reportModalOpen}
                onClose={() => setReportModalOpen(false)}
                maxWidth="md"
                fullWidth
                aria-labelledby="report-dialog-title"
            >
                <DialogTitle id="report-dialog-title">Send Parent Report</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Channel"
                                fullWidth
                                value={reportData.channel}
                                onChange={(e) => setReportData({ ...reportData, channel: e.target.value })}
                            >
                                <MenuItem value="email">📧 Email</MenuItem>
                                <MenuItem value="sms">📱 SMS</MenuItem>
                                <MenuItem value="whatsapp">💬 WhatsApp</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Template"
                                fullWidth
                                value={reportData.template}
                                onChange={(e) => setReportData({ ...reportData, template: e.target.value })}
                            >
                                <MenuItem value="at-risk">At-Risk Alert</MenuItem>
                                <MenuItem value="critical">Critical Alert</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Recipient Email"
                                fullWidth
                                value={reportData.recipientEmail}
                                onChange={(e) => setReportData({ ...reportData, recipientEmail: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ p: 2, bgcolor: 'rgba(33, 150, 243, 0.1)', borderRadius: 2 }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                    Preview:
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {reportPreview?.message}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Custom Message (Optional)"
                                fullWidth
                                multiline
                                rows={4}
                                value={reportData.customMessage}
                                onChange={(e) => setReportData({ ...reportData, customMessage: e.target.value })}
                                placeholder="Edit the message above or leave blank to use template"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReportModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={sendReport} sx={{ background: theme.palette.gradients.primary }}>
                        Send Report
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Insights;
