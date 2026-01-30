import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    useTheme
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import api from '../../api/axios';

const PerformanceChart = () => {
    const theme = useTheme();
    const [data, setData] = useState([]);
    const [average, setAverage] = useState(0);
    const [trend, setTrend] = useState('neutral');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/tests/my-results');
                const resultData = response.data.data;
                setData(resultData);

                // Calculate average
                if (resultData.length > 0) {
                    const avg = resultData.reduce((acc, curr) => acc + curr.score, 0) / resultData.length;
                    setAverage(Math.round(avg));

                    // Simple trend analysis (last vs average)
                    const lastScore = resultData[resultData.length - 1].score;
                    if (lastScore > avg) setTrend('up');
                    else if (lastScore < avg) setTrend('down');
                }
            } catch (error) {
                console.error('Error fetching performance:', error);
            }
        };

        fetchData();
    }, []);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Box sx={{
                    bgcolor: 'background.paper',
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    boxShadow: 3
                }}>
                    <Typography variant="caption" color="text.secondary">{payload[0].payload.date ? new Date(payload[0].payload.date).toLocaleDateString() : label}</Typography>
                    <Typography variant="body2" fontWeight="700" color="primary">
                        Score: {payload[0].value}%
                    </Typography>
                    <Typography variant="caption" display="block">
                        {payload[0].payload.title}
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    return (
        <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Box sx={{ p: 2.5, pb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h6" fontWeight="700" gutterBottom>
                        Performance Analytics
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Last 5 Test Scores
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h3" fontWeight="800" color="primary.main">
                        {average}%
                    </Typography>
                    <Typography
                        variant="caption"
                        fontWeight="600"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            color: trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary'
                        }}
                    >
                        {trend === 'up' ? <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} /> : <TrendingDown sx={{ fontSize: 16, mr: 0.5 }} />}
                        {trend === 'up' ? 'Improving' : trend === 'down' ? 'Needs Focus' : 'Stable'}
                    </Typography>
                </Box>
            </Box>

            <CardContent sx={{ height: 280, p: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 20, right: 30, left: -20, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                            domain={[0, 100]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke={theme.palette.primary.main}
                            strokeWidth={3}
                            dot={{ r: 4, fill: theme.palette.background.paper, strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default PerformanceChart;
