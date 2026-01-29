import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Link,
    Alert,
    InputAdornment,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    useTheme,
    Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, School, PersonAdd, GitHub, Email, Person, Phone, Lock } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.8 8.6h-8.8v3.6h5.3c-0.5 2.5-2.6 4.2-5.3 4.2-3.1 0-5.6-2.5-5.6-5.6s2.5-5.6 5.6-5.6c1.4 0 2.7 0.5 3.7 1.4l2.7-2.7c-1.7-1.6-4.1-2.5-6.4-2.5-5.5 0-10 4.5-10 10s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-0.7-0.1-1.3-0.2-1.9z" fill="currentColor" />
    </svg>
);

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        phone: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        const { confirmPassword, ...registerData } = formData;
        const result = await register(registerData);

        if (result.success) {
            // Redirect based on role
            if (result.user.role === 'student') {
                navigate('/student/dashboard');
            } else if (result.user.role === 'teacher') {
                navigate('/teacher/dashboard');
            } else {
                navigate('/admin/dashboard');
            }
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    const theme = useTheme();

    return (
        <Grid container sx={{ minHeight: '100vh' }}>
            {/* Left Side - Branding (Hidden on mobile) */}
            <Grid
                item
                xs={false}
                sm={4}
                md={6}
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: { xs: 'none', sm: 'flex' },
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    p: 4,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Decorative Circles */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -100,
                        right: -100,
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        zIndex: 1,
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -50,
                        left: -50,
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        zIndex: 1,
                    }}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    style={{ zIndex: 2, textAlign: 'center' }}
                >
                    <Box
                        sx={{
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 3,
                            mx: 'auto',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <PersonAdd sx={{ fontSize: 50 }} />
                    </Box>
                    <Typography variant="h3" fontWeight="800" gutterBottom>
                        Join Scientia
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 400 }}>
                        Start your learning journey with thousands of courses and expert teachers.
                    </Typography>
                </motion.div>
            </Grid>

            {/* Right Side - Register Form */}
            <Grid
                item
                xs={12}
                sm={8}
                md={6}
                component={Paper}
                elevation={0}
                square
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: theme.palette.mode === 'light' ? '#ffffff' : theme.palette.background.default,
                    position: 'relative'
                }}
            >
                {/* Background Pattern */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.05,
                    backgroundImage: `radial-gradient(${theme.palette.secondary.main} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    pointerEvents: 'none'
                }} />

                <Container maxWidth="sm" sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
                            Create Account
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Fill in the details to get started
                        </Typography>
                    </Box>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        </motion.div>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ maxWidth: 500, mx: 'auto' }}>
                        {/* Social Login Buttons */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<GoogleIcon />}
                                    sx={{ borderRadius: 2, height: 48, borderColor: 'divider', color: 'text.primary' }}
                                    onClick={() => alert('Google Login is currently disabled in this demo.')}
                                >
                                    Google
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<GitHub />}
                                    sx={{ borderRadius: 2, height: 48, borderColor: 'divider', color: 'text.primary' }}
                                    onClick={() => alert('GitHub Login is currently disabled in this demo.')}
                                >
                                    GitHub
                                </Button>
                            </Grid>
                        </Grid>

                        <Divider sx={{ mb: 3 }}>
                            <Typography variant="caption" color="text.secondary">OR REGISTER WITH EMAIL</Typography>
                        </Divider>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    InputProps={{
                                        sx: { borderRadius: 3 },
                                        startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment>
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                    InputProps={{
                                        sx: { borderRadius: 3 },
                                        startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment>
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="9876543210"
                                    InputProps={{
                                        sx: { borderRadius: 3 },
                                        startAdornment: <InputAdornment position="start"><Phone color="action" /></InputAdornment>
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>I am a</InputLabel>
                                    <Select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        label="I am a"
                                        sx={{ borderRadius: 3 }}
                                    >
                                        <MenuItem value="student">Student</MenuItem>
                                        <MenuItem value="teacher">Teacher</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    InputProps={{
                                        sx: { borderRadius: 3 },
                                        startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Confirm Password"
                                    name="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    InputProps={{
                                        sx: { borderRadius: 3 },
                                        startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.5,
                                fontSize: '1rem',
                                borderRadius: 3,
                                textTransform: 'none',
                                background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                                boxShadow: theme.shadows[4],
                                '&:hover': {
                                    background: `linear-gradient(135deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
                                }
                            }}
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>

                        <Grid container justifyContent="center">
                            <Grid item>
                                <Typography variant="body2" color="text.secondary">
                                    Already have an account?{' '}
                                    <Link component={RouterLink} to="/login" variant="body2" fontWeight="bold" sx={{ textDecoration: 'none', color: 'secondary.main' }}>
                                        Sign In
                                    </Link>
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                            © {new Date().getFullYear()} Scientia LMS. Built for Education.
                        </Typography>
                    </Box>
                </Container>
            </Grid>
        </Grid>
    );
};

export default Register;
