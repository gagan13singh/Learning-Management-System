import React, { useState } from 'react';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    Avatar,
    Button,
    IconButton,
    Tab,
    Tabs,
    Divider,
    Chip,
    Card,
    CardContent,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    InputAdornment,
    Switch,
    FormControlLabel,
    useTheme,
    Tooltip
} from '@mui/material';
import {
    Edit,
    Lock,
    Download,
    Message,
    NoteAdd,
    Email,
    Phone,
    CalendarToday,
    School,
    Work,
    Class,
    CheckCircle,
    Warning,
    TrendingUp,
    TrendingDown,
    Visibility,
    VisibilityOff,
    Save,
    Close,
    Share,
    Assignment,
    MenuBook,
    Person,
    ArrowBack
} from '@mui/icons-material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useColorMode } from '../../context/ThemeContext';
import api from '../../api/axios';

// Mock Data
const attendanceData = [
    { day: '1', present: 1 }, { day: '5', present: 1 }, { day: '10', present: 0 },
    { day: '15', present: 1 }, { day: '20', present: 1 }, { day: '25', present: 1 },
    { day: '30', present: 1 }
];

const testData = [
    { name: 'Test 1', score: 85 },
    { name: 'Test 2', score: 78 },
    { name: 'Test 3', score: 92 },
    { name: 'Test 4', score: 88 },
    { name: 'Test 5', score: 95 },
];

const behaviourData = [
    { name: 'Positive', value: 80 },
    { name: 'Needs Improvement', value: 20 },
];

const COLORS = ['#10B981', '#F59E0B'];

const Profile = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const { mode, toggleColorMode } = useColorMode();
    const [tabValue, setTabValue] = useState(0);
    const [editOpen, setEditOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Edit Profile State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Data State
    const [stats, setStats] = useState(null);
    const [performanceData, setPerformanceData] = useState([]);
    const [attendanceChart, setAttendanceChart] = useState([]);

    // Fetch Data based on Role
    React.useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.bio || '',
            });
            fetchRoleData();
        }
    }, [user]);

    const fetchRoleData = async () => {
        try {
            if (user?.role === 'student') {
                // Fetch Student Data
                const [resultsRes, upcomingRes] = await Promise.all([
                    api.get('/tests/my-results'),
                    api.get('/tests/upcoming')
                ]);

                // Process performance data
                const perfData = resultsRes.data.data.map(r => ({
                    name: r.title,
                    score: r.score
                }));
                setPerformanceData(perfData);

                // Analyze stats
                const avgScore = perfData.length > 0
                    ? (perfData.reduce((acc, curr) => acc + curr.score, 0) / perfData.length).toFixed(1)
                    : 0;

                setStats({
                    stat1: { label: 'Avg Score', value: `${avgScore}%`, color: theme.palette.primary.main },
                    stat2: { label: 'Tests Taken', value: perfData.length, color: theme.palette.secondary.main },
                    stat3: { label: 'Upcoming', value: upcomingRes.data.data.length, color: theme.palette.warning.main }
                });

            } else if (user?.role === 'teacher') {
                // Fetch Teacher Data
                const res = await api.get('/features/analytics/teacher-stats');
                const { totalStudents, avgAttendance, totalCourses } = res.data.stats;

                setStats({
                    stat1: { label: 'Students', value: totalStudents, color: theme.palette.primary.main },
                    stat2: { label: 'Avg Attendance', value: `${avgAttendance}%`, color: theme.palette.success.main },
                    stat3: { label: 'Courses', value: totalCourses, color: theme.palette.info.main }
                });
            }
        } catch (error) {
            console.error("Error fetching profile stats:", error);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleEditSave = async () => {
        try {
            setLoading(true);
            const response = await api.put('/auth/profile', {
                name: profileData.name,
                phone: profileData.phone,
                bio: profileData.bio
            });

            if (response.data.success) {
                updateUser(response.data.data);
                setEditOpen(false);
                // Optional: show snackbar
            }
        } catch (error) {
            console.error('Update profile error:', error);
            alert(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSave = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords don't match");
            return;
        }
        if (passwordData.newPassword.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        try {
            setLoading(true);
            await api.put('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            setPasswordOpen(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            alert('Password changed successfully!');
        } catch (error) {
            console.error('Change password error:', error);
            alert(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const TabPanel = ({ children, value, index }) => (
        <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );

    return (
        <Box sx={{ minHeight: '100vh', pb: 8 }}>
            {/* Top Profile Header */}
            <Box sx={{
                background: theme.palette.gradients.primary,
                pt: 8,
                pb: 12,
                px: 4,
                borderRadius: '0 0 40px 40px',
                mb: -8,
                color: 'white',
                position: 'relative'
            }}>
                <Container maxWidth="lg">
                    <Grid container spacing={3} alignItems="center">
                        <Grid item>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar
                                    src={user?.profilePicture}
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        border: '4px solid white',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                                    }}
                                />
                                <IconButton
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        bgcolor: 'white',
                                        '&:hover': { bgcolor: '#f3f4f6' }
                                    }}
                                    onClick={() => setEditOpen(true)}
                                    size="small"
                                >
                                    <Edit color="primary" fontSize="small" />
                                </IconButton>
                            </Box>
                        </Grid>
                        <Grid item xs>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Button
                                    startIcon={<ArrowBack />}
                                    sx={{ color: 'white', borderColor: 'transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                                    onClick={() => {
                                        if (user?.role === 'admin') navigate('/admin/dashboard');
                                        else if (user?.role === 'teacher') navigate('/teacher/dashboard');
                                        else navigate('/student/dashboard');
                                    }}
                                >
                                    Back
                                </Button>
                            </Box>
                            <Typography variant="h3" fontWeight="bold" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                {user?.name || 'User Name'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1, opacity: 0.9 }}>
                                <Chip
                                    label={user?.role?.toUpperCase() || 'ROLE'}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
                                />
                                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Email fontSize="small" /> {user?.email}
                                </Typography>
                                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CalendarToday fontSize="small" /> Joined {new Date().getFullYear()}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<Edit />}
                                    onClick={() => setEditOpen(true)}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                                >
                                    Edit Profile
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<Lock />}
                                    onClick={() => setPasswordOpen(true)}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                                >
                                    Change Password
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Card className="glass-card">
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Person color="primary" /> Personal Information
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Email</Typography>
                                            <Typography variant="body1" fontWeight="500">{user?.email}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Phone</Typography>
                                            <Typography variant="body1" fontWeight="500">{profileData.phone}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Bio</Typography>
                                            <Typography variant="body2">{profileData.bio}</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            {user?.role === 'teacher' && (
                                <Card className="glass-card">
                                    <CardContent>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Work color="secondary" /> Account Status
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Role</Typography>
                                                <Typography variant="body1" fontWeight="500">Instructor</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Status</Typography>
                                                <Chip label="Active" color="success" size="small" />
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            )}

                            <Card sx={{ background: theme.palette.gradients.secondary, color: 'white' }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>Quick Actions</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {user?.role === 'teacher' ? (
                                            <>
                                                <Tooltip title="Create Test">
                                                    <IconButton
                                                        onClick={() => navigate('/teacher/tests')}
                                                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                                                    >
                                                        <Assignment />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Mark Attendance">
                                                    <IconButton
                                                        onClick={() => navigate('/teacher/attendance')}
                                                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                                                    >
                                                        <CheckCircle />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Create Course">
                                                    <IconButton
                                                        onClick={() => navigate('/teacher/create-course')}
                                                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                                                    >
                                                        <Work />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        ) : (
                                            <>
                                                <Tooltip title="Browse Courses">
                                                    <IconButton
                                                        onClick={() => navigate('/student/courses')}
                                                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                                                    >
                                                        <MenuBook />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="View Tests">
                                                    <IconButton
                                                        onClick={() => navigate('/student/tests')}
                                                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                                                    >
                                                        <Assignment />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Card className="glass-card" sx={{ minHeight: 600 }}>
                            <CardContent>
                                <Tabs
                                    value={tabValue}
                                    onChange={handleTabChange}
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
                                >
                                    <Tab label="Overview" icon={<TrendingUp />} iconPosition="start" />
                                    <Tab label="Security" icon={<Lock />} iconPosition="start" />
                                </Tabs>

                                <TabPanel value={tabValue} index={0}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                                {user?.role === 'student' ? 'My Progress' : 'Class Insights'}
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={4}>
                                                    <Paper sx={{ p: 2, bgcolor: `${stats?.stat1?.color}15`, border: `1px solid ${stats?.stat1?.color}`, borderRadius: 2 }}>
                                                        <Typography variant="subtitle2" sx={{ color: stats?.stat1?.color }} fontWeight="bold">{stats?.stat1?.label || 'Stat 1'}</Typography>
                                                        <Typography variant="h4" fontWeight="bold" sx={{ color: stats?.stat1?.color }}>{stats?.stat1?.value || '-'}</Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <Paper sx={{ p: 2, bgcolor: `${stats?.stat2?.color}15`, border: `1px solid ${stats?.stat2?.color}`, borderRadius: 2 }}>
                                                        <Typography variant="subtitle2" sx={{ color: stats?.stat2?.color }} fontWeight="bold">{stats?.stat2?.label || 'Stat 2'}</Typography>
                                                        <Typography variant="h4" fontWeight="bold" sx={{ color: stats?.stat2?.color }}>{stats?.stat2?.value || '-'}</Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <Paper sx={{ p: 2, bgcolor: `${stats?.stat3?.color}15`, border: `1px solid ${stats?.stat3?.color}`, borderRadius: 2 }}>
                                                        <Typography variant="subtitle2" sx={{ color: stats?.stat3?.color }} fontWeight="bold">{stats?.stat3?.label || 'Stat 3'}</Typography>
                                                        <Typography variant="h4" fontWeight="bold" sx={{ color: stats?.stat3?.color }}>{stats?.stat3?.value || '-'}</Typography>
                                                    </Paper>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                                {user?.role === 'student' ? 'Performance History' : 'Recent Test Performance'}
                                            </Typography>
                                            <Box sx={{ height: 250, width: '100%' }}>
                                                {performanceData.length > 0 ? (
                                                    <ResponsiveContainer>
                                                        <BarChart data={performanceData}>
                                                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                                            <XAxis dataKey="name" />
                                                            <YAxis />
                                                            <RechartsTooltip />
                                                            <Bar dataKey="score" fill={theme.palette.secondary.main} radius={[4, 4, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                                                        <Typography variant="body2" color="text.secondary">No test data available yet.</Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </TabPanel>

                                <TabPanel value={tabValue} index={1}>
                                    <Typography variant="h6" gutterBottom>Account Security</Typography>
                                    <FormControlLabel control={<Switch defaultChecked />} label="Enable Two-Factor Authentication" />
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" gutterBottom>Preferences</Typography>
                                    <FormControlLabel control={<Switch />} label="Email Notifications" />
                                    <FormControlLabel
                                        control={<Switch checked={mode === 'dark'} onChange={toggleColorMode} />}
                                        label="Dark Mode"
                                    />
                                </TabPanel>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            {/* Edit Profile Modal */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <Avatar src={user?.profilePicture} sx={{ width: 100, height: 100 }} />
                            <Button size="small" sx={{ position: 'absolute', mt: 10 }}>Change</Button>
                        </Box>
                        <TextField
                            label="Full Name"
                            fullWidth
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        />
                        <TextField
                            label="Email"
                            fullWidth
                            disabled
                            value={profileData.email}
                        />
                        <TextField
                            label="Phone"
                            fullWidth
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        />
                        <TextField
                            label="Bio"
                            fullWidth
                            multiline
                            rows={3}
                            value={profileData.bio}
                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)} disabled={loading}>Cancel</Button>
                    <Button variant="contained" onClick={handleEditSave} disabled={loading}>Save Changes</Button>
                </DialogActions>
            </Dialog>

            {/* Change Password Modal */}
            <Dialog open={passwordOpen} onClose={() => setPasswordOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Current Password"
                            type={showPassword ? 'text' : 'password'}
                            fullWidth
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            label="New Password"
                            type={showPassword ? 'text' : 'password'}
                            fullWidth
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                        <TextField
                            label="Confirm New Password"
                            type={showPassword ? 'text' : 'password'}
                            fullWidth
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPasswordOpen(false)} disabled={loading}>Cancel</Button>
                    <Button variant="contained" onClick={handlePasswordSave} disabled={loading}>Update Password</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Profile;
