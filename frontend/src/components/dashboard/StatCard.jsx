import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const StatCard = ({ title, value, icon, color = 'primary', trend }) => {
    return (
        <Card elevation={0} sx={{
            borderRadius: 4,
            height: '100%',
            border: '1px solid',
            borderColor: 'divider',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.05)'
            }
        }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight="600" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h4" fontWeight="800">
                            {value}
                        </Typography>
                    </Box>
                    <Avatar sx={{
                        bgcolor: `${color}.light`,
                        color: `${color}.main`,
                        width: 48,
                        height: 48,
                        borderRadius: 3
                    }}>
                        {icon}
                    </Avatar>
                </Box>

                {trend && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {trend.includes('+') ? (
                            <TrendingUp fontSize="small" color="success" />
                        ) : trend.includes('-') ? (
                            <TrendingDown fontSize="small" color="error" />
                        ) : null}
                        <Typography variant="caption" fontWeight="600" color={trend.includes('+') ? 'success.main' : 'text.secondary'}>
                            {trend}
                        </Typography>
                        {!trend.includes('Total') && !trend.includes('Active') && (
                            <Typography variant="caption" color="text.secondary">
                                vs last month
                            </Typography>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default StatCard;
