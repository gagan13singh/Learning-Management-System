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
    useTheme,
    Grid,
    Divider,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import { Visibility, VisibilityOff, School, GitHub, Email, Lock } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.8 8.6h-8.8v3.6h5.3c-0.5 2.5-2.6 4.2-5.3 4.2-3.1 0-5.6-2.5-5.6-5.6s2.5-5.6 5.6-5.6c1.4 0 2.7 0.5 3.7 1.4l2.7-2.7c-1.7-1.6-4.1-2.5-6.4-2.5-5.5 0-10 4.5-10 10s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-0.7-0.1-1.3-0.2-1.9z" fill="currentColor" />
    </svg>
);

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const theme = useTheme();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
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

        const result = await login(formData.email, formData.password);

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

    return (
        <Grid container sx={{ minHeight: '100vh' }}>
            {/* Left Side - Branding (Hidden on mobile) */}
            <Grid
                item
                xs={false}
                sm={4}
                md={6}
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
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
                    component={motion.div}
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
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
                    component={motion.div}
                    animate={{
                        scale: [1, 1.1, 1],
                        x: [0, 30, 0]
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ zIndex: 2, textAlign: 'center' }}
                >
                    <School sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} />
                    <Typography variant="h2" fontWeight="800" gutterBottom>
                        EduPrime
                    </Typography>
                    <Typography variant="h5" sx={{ opacity: 0.8, maxWidth: 400, mx: 'auto' }}>
                        Empowering the next generation of learners and educators.
                    </Typography>
                </motion.div>
            </Grid>

            {/* Right Side - Login Form */}
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
                    backgroundImage: `radial-gradient(${theme.palette.primary.main} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    pointerEvents: 'none'
                }} />

                <Container maxWidth="sm" sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center', // Center aligment
                            mb: 4,
                            textAlign: 'center'
                        }}
                    >
                        <Box
                            sx={{
                                width: 50,
                                height: 50,
                                borderRadius: 3,
                                background: theme.palette.primary.main,
                                display: { xs: 'flex', sm: 'none' },
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2
                            }}
                        >
                            <School sx={{ color: 'white' }} />
                        </Box>
                        <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
                            Welcome Back
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Sign in to continue your learning journey
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

                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, maxWidth: 400, mx: 'auto', width: '100%' }}>

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
                            <Typography variant="caption" color="text.secondary">OR</Typography>
                        </Divider>

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            InputProps={{
                                sx: { borderRadius: 3 },
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                            InputProps={{
                                sx: { borderRadius: 3 },
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, mb: 2 }}>
                            <FormControlLabel
                                control={<Checkbox value="remember" color="primary" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
                                label="Remember me"
                                sx={{ color: 'text.secondary' }}
                            />
                            <Link component={RouterLink} to="/forgot-password" variant="body2" color="primary" fontWeight="600" sx={{ textDecoration: 'none' }}>
                                Forgot password?
                            </Link>
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                mt: 2,
                                mb: 3,
                                py: 1.5,
                                fontSize: '1rem',
                                borderRadius: 3,
                                textTransform: 'none',
                                boxShadow: theme.shadows[4]
                            }}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Button>

                        <Grid container justifyContent="center">
                            <Grid item>
                                <Typography variant="body2" color="text.secondary">
                                    Don't have an account?{' '}
                                    <Link component={RouterLink} to="/register" variant="body2" fontWeight="bold" color="primary" sx={{ textDecoration: 'none' }}>
                                        Sign Up
                                    </Link>
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    <Box sx={{ mt: 8, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                            © {new Date().getFullYear()} EduPrime LMS. All rights reserved.
                        </Typography>
                    </Box>
                </Container>
            </Grid>
        </Grid>
    );
};

export default Login;
