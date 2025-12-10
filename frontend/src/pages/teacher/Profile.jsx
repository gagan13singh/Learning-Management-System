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
    Person
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
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

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
    const { user, updateUser } = useAuth();
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

    React.useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.bio || '',
            });
        }
    }, [user]);

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
                                            <Work color="secondary" /> Professional Info
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Subjects Taught</Typography>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                                                    <Chip label="Mathematics" size="small" color="primary" variant="outlined" />
                                                    <Chip label="Physics" size="small" color="primary" variant="outlined" />
                                                </Box>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Experience</Typography>
                                                <Typography variant="body1" fontWeight="500">5 Years</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Qualification</Typography>
                                                <Typography variant="body1" fontWeight="500">M.Sc. Physics, B.Ed</Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            )}

                            <Card sx={{ background: theme.palette.gradients.secondary, color: 'white' }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>Quick Actions</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        <Tooltip title="Create Test">
                                            <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}><Assignment /></IconButton>
                                        </Tooltip>
                                        <Tooltip title="Mark Attendance">
                                            <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}><CheckCircle /></IconButton>
                                        </Tooltip>
                                        <Tooltip title="Add Student">
                                            <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}><Person /></IconButton>
                                        </Tooltip>
                                        <Tooltip title="View Timetable">
                                            <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}><CalendarToday /></IconButton>
                                        </Tooltip>
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
                                    <Tab label="Attendance" icon={<CheckCircle />} iconPosition="start" />
                                    <Tab label="Tests" icon={<Assignment />} iconPosition="start" />
                                    <Tab label="Behaviour" icon={<Warning />} iconPosition="start" />
                                    <Tab label="Notes" icon={<NoteAdd />} iconPosition="start" />
                                    <Tab label="Security" icon={<Lock />} iconPosition="start" />
                                </Tabs>

                                <TabPanel value={tabValue} index={0}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <Typography variant="h6" fontWeight="bold" gutterBottom>Smart Insights</Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={4}>
                                                    <Paper sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981', borderRadius: 2 }}>
                                                        <Typography variant="subtitle2" color="success.main" fontWeight="bold">Consistency Score</Typography>
                                                        <Typography variant="h4" fontWeight="bold" color="success.main">92%</Typography>
                                                        <Typography variant="caption" color="text.secondary">Top 5% of teachers</Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <Paper sx={{ p: 2, bgcolor: 'rgba(245, 158, 11, 0.1)', border: '1px solid #F59E0B', borderRadius: 2 }}>
                                                        <Typography variant="subtitle2" color="warning.main" fontWeight="bold">Avg. Class Rating</Typography>
                                                        <Typography variant="h4" fontWeight="bold" color="warning.main">4.8/5</Typography>
                                                        <Typography variant="caption" color="text.secondary">Based on student feedback</Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <Paper sx={{ p: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3B82F6', borderRadius: 2 }}>
                                                        <Typography variant="subtitle2" color="info.main" fontWeight="bold">Total Classes</Typography>
                                                        <Typography variant="h4" fontWeight="bold" color="info.main">124</Typography>
                                                        <Typography variant="caption" color="text.secondary">This academic year</Typography>
                                                    </Paper>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Attendance Trend (30 Days)</Typography>
                                            <Box sx={{ height: 250, width: '100%' }}>
                                                <ResponsiveContainer>
                                                    <LineChart data={attendanceData}>
                                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                                        <XAxis dataKey="day" />
                                                        <YAxis />
                                                        <RechartsTooltip />
                                                        <Line type="monotone" dataKey="present" stroke={theme.palette.primary.main} strokeWidth={3} dot={{ r: 4 }} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Recent Test Performance</Typography>
                                            <Box sx={{ height: 250, width: '100%' }}>
                                                <ResponsiveContainer>
                                                    <BarChart data={testData}>
                                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                                        <XAxis dataKey="name" />
                                                        <YAxis />
                                                        <RechartsTooltip />
                                                        <Bar dataKey="score" fill={theme.palette.secondary.main} radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </TabPanel>

                                <TabPanel value={tabValue} index={1}>
                                    <Typography variant="body1" color="text.secondary">Detailed attendance logs will appear here.</Typography>
                                </TabPanel>
                                <TabPanel value={tabValue} index={2}>
                                    <Typography variant="body1" color="text.secondary">Detailed test history and analytics will appear here.</Typography>
                                </TabPanel>
                                <TabPanel value={tabValue} index={3}>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                                        <PieChart width={300} height={300}>
                                            <Pie
                                                data={behaviourData}
                                                cx={150}
                                                cy={150}
                                                innerRadius={60}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {behaviourData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                        </PieChart>
                                    </Box>
                                    <Typography align="center" variant="subtitle1" fontWeight="bold">Behaviour Overview</Typography>
                                </TabPanel>
                                <TabPanel value={tabValue} index={4}>
                                    <Button startIcon={<NoteAdd />} variant="outlined" sx={{ mb: 2 }}>Add New Note</Button>
                                    <Typography variant="body1" color="text.secondary">No notes added yet.</Typography>
                                </TabPanel>
                                <TabPanel value={tabValue} index={5}>
                                    <Typography variant="h6" gutterBottom>Account Security</Typography>
                                    <FormControlLabel control={<Switch defaultChecked />} label="Enable Two-Factor Authentication" />
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" gutterBottom>Preferences</Typography>
                                    <FormControlLabel control={<Switch />} label="Email Notifications" />
                                    <FormControlLabel control={<Switch defaultChecked />} label="Dark Mode" />
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
