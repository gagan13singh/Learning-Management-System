import React from 'react';
import { Box, Typography, Paper, Container } from '@mui/material';

const StudentCalendar = () => {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, height: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h3" gutterBottom>📅 Calendar</Typography>
                <Typography variant="h6" color="text.secondary">
                    Your full academic calendar, exam dates, and holidays will appear here.
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                    (Feature coming soon)
                </Typography>
            </Paper>
        </Container>
    );
};

export default StudentCalendar;
