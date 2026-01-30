import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    CircularProgress,
    Card,
    CardContent
} from '@mui/material';
import PerformanceChart from '../../components/student/PerformanceChart'; // Reuse widget if applicable or enhance
import api from '../../api/axios';
import { TrendingUp, School, EmojiEvents } from '@mui/icons-material';

const StudentPerformance = () => {
    // For now, we can reuse the chart logic or fetch more detailed stats
    // Since we don't have a dedicated "Comprehensive Analytics" endpoint other than test results,
    // we'll build a simple view around test results + maybe course completion stats.

    // We already have PerformanceChart component. Let's make a bigger version.

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="800" gutterBottom>
                        Analytics
                    </Typography>
                    <Typography color="text.secondary">
                        Detailed analysis of your academic performance
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Big Chart */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, borderRadius: 3, height: 400 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Test Performance Trend
                            </Typography>
                            <Box sx={{ height: 320, width: '100%' }}>
                                <PerformanceChart />
                                {/* Note: PerformanceChart fetches its own data currently. 
                                    Ideally we pass data props, but for now this works. 
                                    Wait, PerformanceChart in widget is small. 
                                    I should probably check if it's responsive. 
                                    It uses ResponsiveContainer, so it should fill parent. */}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default StudentPerformance;
