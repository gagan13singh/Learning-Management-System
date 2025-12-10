import React, { useState } from 'react';
import { Card, Typography, Box, IconButton, Grid } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const CalendarWidget = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const renderCalendarDays = () => {
        const totalDays = daysInMonth(currentDate);
        const startDay = firstDayOfMonth(currentDate);
        const days = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < startDay; i++) {
            days.push(<Grid item xs={1.7} key={`empty-${i}`} />);
        }

        const today = new Date();
        const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

        for (let day = 1; day <= totalDays; day++) {
            const isToday = isCurrentMonth && day === today.getDate();
            days.push(
                <Grid item xs={1.7} key={day} sx={{ textAlign: 'center', mb: 1 }}>
                    <Box
                        sx={{
                            width: 30,
                            height: 30,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            bgcolor: isToday ? 'primary.main' : 'transparent',
                            color: isToday ? 'white' : 'text.primary',
                            fontWeight: isToday ? 'bold' : 'normal',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                                bgcolor: isToday ? 'primary.dark' : 'action.hover'
                            }
                        }}
                    >
                        {day}
                    </Box>
                </Grid>
            );
        }

        return days;
    };

    return (
        <Card sx={{ p: 2, borderRadius: 4, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </Typography>
                <Box>
                    <IconButton size="small" onClick={handlePrevMonth}><ChevronLeft /></IconButton>
                    <IconButton size="small" onClick={handleNextMonth}><ChevronRight /></IconButton>
                </Box>
            </Box>

            <Grid container columns={12}> {/* approx 7 columns but using flex gap */}
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
                    <Grid item xs={1.7} key={d} sx={{ textAlign: 'center', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            {d}
                        </Typography>
                    </Grid>
                ))}
            </Grid>

            <Grid container columns={12}>
                {renderCalendarDays()}
            </Grid>
        </Card>
    );
};

export default CalendarWidget;
