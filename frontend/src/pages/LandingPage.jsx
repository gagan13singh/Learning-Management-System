import React, { useEffect } from 'react';
import {
    Box, Button, Container, Grid, Typography, Card, CardContent,
    Avatar, Stack, useTheme, Chip
} from '@mui/material';
import {
    LibraryBooks, Quiz, Security, Speed,
    Star, PlayArrow, Bolt, CheckCircle
} from '@mui/icons-material';
import { motion, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    // Animation Variants
    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    return (
        <Box sx={{ bgcolor: '#0B0F19', minHeight: '100vh', color: 'white', fontFamily: 'Inter', overflowX: 'hidden' }}>

            {/* Navbar */}
            <Box sx={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                backdropFilter: 'blur(12px)', bgcolor: 'rgba(11, 15, 25, 0.8)',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <Container maxWidth="xl" sx={{ py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" fontWeight="800" letterSpacing={-0.5} sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span" sx={{ width: 8, height: 8, bgcolor: '#6366F1', borderRadius: '50%' }} />
                        Scientia
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <Button color="inherit" onClick={() => navigate('/login')} sx={{ textTransform: 'none', fontWeight: 500 }}>Login</Button>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/register')}
                            sx={{
                                bgcolor: '#6366F1', color: 'white', textTransform: 'none', fontWeight: 600, borderRadius: '8px',
                                '&:hover': { bgcolor: '#4F46E5' }
                            }}
                        >
                            Get Started
                        </Button>
                    </Stack>
                </Container>
            </Box>

            {/* Hero Section (Centered & Symmetrical) */}
            <Box sx={{ pt: 20, pb: 10, position: 'relative', textAlign: 'center' }}>

                {/* Center Glow */}
                <Box sx={{
                    position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)',
                    filter: 'blur(60px)', zIndex: 0
                }} />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>

                        <motion.div variants={fadeUp}>
                            <Chip
                                label="🚀 New Batches Starting This Week"
                                sx={{
                                    bgcolor: 'rgba(99,102,241,0.1)', color: '#818cf8', fontWeight: 600,
                                    border: '1px solid rgba(99,102,241,0.2)', mb: 4
                                }}
                            />
                        </motion.div>

                        <motion.div variants={fadeUp}>
                            <Typography variant="h1" fontWeight="800" sx={{ fontSize: { xs: '2.5rem', md: '5rem' }, lineHeight: 1.1, mb: 3, letterSpacing: -1 }}>
                                Learning made <br />
                                <span style={{
                                    background: 'linear-gradient(to right, #818cf8, #c084fc)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                                }}>Simple & Effective.</span>
                            </Typography>
                        </motion.div>

                        <motion.div variants={fadeUp}>
                            <Typography variant="h6" color="grey.400" sx={{ mb: 6, maxWidth: 600, mx: 'auto', lineHeight: 1.6, fontWeight: 400 }}>
                                Premium handwritten notes, adaptive test series, and expert guidance.
                                Everything you need to ace your exams, all in one place.
                            </Typography>
                        </motion.div>

                        <motion.div variants={fadeUp}>
                            <Stack direction="row" spacing={2} justifyContent="center">
                                <Button
                                    variant="contained" size="large"
                                    onClick={() => navigate('/register')}
                                    startIcon={<Bolt />}
                                    sx={{
                                        bgcolor: 'white', color: 'black', fontSize: '1rem', py: 1.5, px: 5, borderRadius: '12px', textTransform: 'none', fontWeight: 700,
                                        '&:hover': { bgcolor: '#f1f5f9' }
                                    }}
                                >
                                    Start Learning
                                </Button>
                                <Button
                                    variant="outlined" size="large"
                                    onClick={() => navigate('/login')}
                                    startIcon={<PlayArrow />}
                                    sx={{
                                        color: 'white', borderColor: 'rgba(255,255,255,0.15)', fontSize: '1rem', py: 1.5, px: 5, borderRadius: '12px', textTransform: 'none',
                                        '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' }
                                    }}
                                >
                                    View Demo
                                </Button>
                            </Stack>
                        </motion.div>

                    </motion.div>
                </Container>
            </Box>

            {/* Dashboard Preview (Visual Anchor) */}
            <Container maxWidth="lg" sx={{ mb: 20 }}>
                <motion.div
                    initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
                    style={{
                        position: 'relative', borderRadius: '24px', overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 0 100px -20px rgba(99,102,241,0.2)'
                    }}
                >
                    <Box sx={{ bgcolor: '#1E293B', height: '40px', display: 'flex', alignItems: 'center', px: 2, gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#EF4444' }} />
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10B981' }} />
                    </Box>
                    <Box sx={{ bgcolor: '#0f172a', p: 0, height: { xs: 200, md: 500 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="rgba(255,255,255,0.1)" fontWeight="bold" variant="h3">DASHBOARD PREVIEW</Typography>
                        {/* In a real app, put an actual screenshot here */}
                    </Box>
                </motion.div>
            </Container>

            {/* Features Grid (Symmetrical 2x2 or 4x1) */}
            <Container maxWidth="lg" sx={{ mb: 20 }}>
                <Box sx={{ textAlign: 'center', mb: 10 }}>
                    <Typography variant="h3" fontWeight="bold">Unlock your potential</Typography>
                    <Typography color="grey.500" sx={{ mt: 2 }}>Tools designed to help you study smarter.</Typography>
                </Box>

                <Grid container spacing={3}>
                    {[
                        { title: 'Lecture Notes', desc: 'Detailed handwritten notes for every chapter.', icon: <LibraryBooks sx={{ fontSize: 30 }} />, color: '#818cf8' },
                        { title: 'Practice Tests', desc: 'Chapter-wise quizzes with instant results.', icon: <Quiz sx={{ fontSize: 30 }} />, color: '#f472b6' },
                        { title: 'Secure Login', desc: 'Your progress is saved securely in the cloud.', icon: <Security sx={{ fontSize: 30 }} />, color: '#34d399' },
                        { title: 'Growth Tracking', desc: 'Analytics to measure your improvements.', icon: <Speed sx={{ fontSize: 30 }} />, color: '#fbbf24' },
                    ].map((feature, i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                                <Box sx={{
                                    p: 4, height: '100%', borderRadius: '20px', bgcolor: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center'
                                }}>
                                    <Box sx={{
                                        width: 60, height: 60, mx: 'auto', mb: 3, borderRadius: '16px', bgcolor: `${feature.color}20`, color: feature.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {feature.icon}
                                    </Box>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>{feature.title}</Typography>
                                    <Typography variant="body2" color="grey.500">{feature.desc}</Typography>
                                </Box>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Trust Markers (Centered) */}
            <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', py: 8, bgcolor: 'rgba(255,255,255,0.01)' }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4} justifyContent="center" alignItems="center">
                        {[
                            '100% Syllabus Coverage', 'NCERT Solutions', 'Previous Year Questions', '24/7 Access'
                        ].map((item, i) => (
                            <Grid item xs={6} md={3} key={i} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5 }}>
                                <CheckCircle sx={{ color: '#6366F1', opacity: 0.8 }} />
                                <Typography fontWeight="600" color="grey.400">{item}</Typography>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Testimonials (Symmetrical) */}
            <Container maxWidth="lg" sx={{ py: 20 }}>
                <Box sx={{ textAlign: 'center', mb: 10 }}>
                    <Typography variant="h3" fontWeight="bold">Student Success Stories</Typography>
                </Box>
                <Grid container spacing={4}>
                    {[
                        { name: 'Aditya R.', role: "Class 12", quote: "The structured notes saved me so much time during revision." },
                        { name: 'Meera K.', role: "Class 10", quote: "I was struggling with Science until I found these test series." },
                        { name: 'Kabir S.', role: "JEE Aspirant", quote: "Concise, accurate, and extremely helpful for competitive exams." }
                    ].map((t, i) => (
                        <Grid item xs={12} md={4} key={i}>
                            <Card elevation={0} sx={{
                                bgcolor: '#1E293B', color: 'white', borderRadius: '24px', p: 3, height: '100%',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', gap: 0.5, mb: 3 }}>
                                        {[...Array(5)].map((_, i) => <Star key={i} sx={{ color: '#F59E0B', fontSize: 18 }} />)}
                                    </Box>
                                    <Typography variant="body1" sx={{ mb: 4, height: 60, fontStyle: 'italic', color: 'grey.300' }}>
                                        "{t.quote}"
                                    </Typography>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{ bgcolor: '#334155' }}>{t.name[0]}</Avatar>
                                        <Box>
                                            <Typography fontWeight="bold">{t.name}</Typography>
                                            <Typography variant="caption" color="grey.500">{t.role}</Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Final CTA (Centered) */}
            <Container maxWidth="md" sx={{ textAlign: 'center', pb: 20 }}>
                <Box sx={{
                    bgcolor: '#6366F1', borderRadius: '32px', p: { xs: 6, md: 10 },
                    position: 'relative', overflow: 'hidden'
                }}>
                    <Box sx={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent)',
                        pointerEvents: 'none'
                    }} />

                    <Typography variant="h3" fontWeight="800" sx={{ mb: 3, position: 'relative' }}>
                        Ready to top your class?
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 6, opacity: 0.9, fontWeight: 400, position: 'relative' }}>
                        Join a community of serious learners today.
                    </Typography>
                    <Button
                        variant="contained" size="large"
                        onClick={() => navigate('/register')}
                        sx={{
                            bgcolor: 'white', color: '#6366F1', fontSize: '1.2rem', py: 2, px: 6, borderRadius: '50px', fontWeight: 'bold',
                            '&:hover': { bgcolor: '#f8fafc' }
                        }}
                    >
                        Get Started Now
                    </Button>
                </Box>
            </Container>

            {/* Footer */}
            <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', py: 6 }}>
                <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="grey.600">© {new Date().getFullYear()} Scientia. All rights reserved.</Typography>
                    <Stack direction="row" spacing={4}>
                        <Typography variant="body2" color="grey.500" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>Privacy</Typography>
                        <Typography variant="body2" color="grey.500" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>Terms</Typography>
                        <Typography variant="body2" color="grey.500" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>Contact</Typography>
                    </Stack>
                </Container>
            </Box>

        </Box>
    );
};

export default LandingPage;
