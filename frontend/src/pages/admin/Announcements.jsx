import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, TextField, Button, MenuItem,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Chip, Alert, CircularProgress, Grid, Stack
} from '@mui/material';
import { Delete, Campaign, Send } from '@mui/icons-material';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';

const Announcements = () => {
    const { showSuccess, showError } = useToast();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        title: '',
        message: '',
        target: 'all',
        type: 'info'
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/announcements', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setAnnouncements(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching announcements:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/admin/announcements', form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSuccess('Announcement published successfully');
            setForm({ title: '', message: '', target: 'all', type: 'info' });
            fetchAnnouncements();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to publish announcement');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/admin/announcements/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSuccess('Announcement deleted');
            fetchAnnouncements();
        } catch (error) {
            showError('Failed to delete announcement');
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="800" gutterBottom>
                    Announcements
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Broadcast updates to students and instructors.
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Compose Form */}
                <Grid item xs={12} md={4}>
                    <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                <Campaign color="primary" />
                                <Typography variant="h6" fontWeight="bold">Compose New</Typography>
                            </Box>

                            <form onSubmit={handleSubmit}>
                                <Stack spacing={3}>
                                    <TextField
                                        label="Title"
                                        fullWidth
                                        required
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    />
                                    <TextField
                                        label="Message"
                                        fullWidth
                                        multiline
                                        rows={4}
                                        required
                                        value={form.message}
                                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    />
                                    <TextField
                                        select
                                        label="Target Audience"
                                        fullWidth
                                        value={form.target}
                                        onChange={(e) => setForm({ ...form, target: e.target.value })}
                                    >
                                        <MenuItem value="all">All Users</MenuItem>
                                        <MenuItem value="students">Students Only</MenuItem>
                                        <MenuItem value="instructors">Instructors Only</MenuItem>
                                    </TextField>
                                    <TextField
                                        select
                                        label="Type"
                                        fullWidth
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    >
                                        <MenuItem value="info">Info (Blue)</MenuItem>
                                        <MenuItem value="success">Success (Green)</MenuItem>
                                        <MenuItem value="warning">Warning (Orange)</MenuItem>
                                        <MenuItem value="alert">Alert (Red)</MenuItem>
                                    </TextField>

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        endIcon={<Send />}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Publish
                                    </Button>
                                </Stack>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>

                {/* History List */}
                <Grid item xs={12} md={8}>
                    <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                                Previous Announcements
                            </Typography>

                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Title</TableCell>
                                                <TableCell>Audience</TableCell>
                                                <TableCell>Type</TableCell>
                                                <TableCell>Date</TableCell>
                                                <TableCell align="right">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {announcements.length > 0 ? announcements.map((item) => (
                                                <TableRow key={item._id}>
                                                    <TableCell>
                                                        <Typography variant="subtitle2" fontWeight="600">{item.title}</Typography>
                                                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                                                            {item.message}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={item.target.toUpperCase()}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={item.type}
                                                            size="small"
                                                            color={
                                                                item.type === 'alert' ? 'error' :
                                                                    item.type === 'success' ? 'success' :
                                                                        item.type === 'warning' ? 'warning' : 'primary'
                                                            }
                                                            sx={{ textTransform: 'capitalize' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton color="error" size="small" onClick={() => handleDelete(item._id)}>
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                                        <Typography color="text.secondary">No announcements yet.</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </motion.div>
    );
};

export default Announcements;
