import React from 'react';
import { Box, Typography, Paper, Container, TextField, Button, Grid } from '@mui/material';
import { Send } from '@mui/icons-material';

const Support = () => {
    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>Help & Support 🤝</Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Having trouble? Fill out the form below and our support team will get back to you shortly.
                </Typography>

                <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12}>
                        <TextField fullWidth label="Subject" variant="outlined" />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth label="Message" multiline rows={6} variant="outlined" />
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained" size="large" endIcon={<Send />}>
                            Submit Ticket
                        </Button>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #eee' }}>
                    <Typography variant="h6" gutterBottom>Contact Info</Typography>
                    <Typography>Email: support@lms-platform.com</Typography>
                    <Typography>Phone: +1 (800) 123-4567</Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default Support;
