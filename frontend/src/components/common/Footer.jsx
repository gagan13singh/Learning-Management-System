import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, useTheme, alpha } from '@mui/material';
import { Facebook, Twitter, LinkedIn, Instagram, Email, Phone, LocationOn } from '@mui/icons-material';

const Footer = () => {
    const theme = useTheme();

    return (
        <Box
            component="footer"
            sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                borderTop: `1px solid ${theme.palette.divider}`,
                pt: 8,
                pb: 4,
                mt: 'auto',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)`,
                    opacity: 0.5,
                }
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h5" color="primary" sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.5px' }}>
                            EduPrime
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 300 }}>
                            Empowering students and teachers with a modern, intuitive, and professional learning management system. Elevate your education journey with us.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {[Facebook, Twitter, LinkedIn, Instagram].map((Icon, index) => (
                                <IconButton
                                    key={index}
                                    size="small"
                                    sx={{
                                        color: 'primary.main',
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        '&:hover': { bgcolor: 'primary.main', color: 'white' }
                                    }}
                                >
                                    <Icon fontSize="small" />
                                </IconButton>
                            ))}
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 700, mb: 2 }}>
                            Platform
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {['Browse Courses', 'Student Success', 'Teachers', 'Pricing', 'Blog'].map((item) => (
                                <Link
                                    key={item}
                                    href="#"
                                    color="text.secondary"
                                    underline="hover"
                                    sx={{ '&:hover': { color: 'primary.main' } }}
                                >
                                    {item}
                                </Link>
                            ))}
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 700, mb: 2 }}>
                            Company
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {['About Us', 'Careers', 'Privacy Policy', 'Terms of Service', 'Contact Support'].map((item) => (
                                <Link
                                    key={item}
                                    href="#"
                                    color="text.secondary"
                                    underline="hover"
                                    sx={{ '&:hover': { color: 'primary.main' } }}
                                >
                                    {item}
                                </Link>
                            ))}
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 700, mb: 2 }}>
                            Contact Us
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <LocationOn fontSize="small" color="primary" />
                                <Typography variant="body2" color="text.secondary">
                                    123 Education Lane, Knowledge City, ED 54321
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Phone fontSize="small" color="primary" />
                                <Typography variant="body2" color="text.secondary">
                                    +1 (555) 123-4567
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Email fontSize="small" color="primary" />
                                <Typography variant="body2" color="text.secondary">
                                    support@eduprime.com
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 8, pt: 3, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        © {new Date().getFullYear()} EduPrime LMS. All rights reserved.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;
