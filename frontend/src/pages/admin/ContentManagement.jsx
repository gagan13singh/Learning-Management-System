import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, IconButton, TextField, InputAdornment, Button,
    Link, useTheme, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
    Search, Delete, Visibility, PlayCircle, Description, AttachFile
} from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';

const ContentManagement = () => {
    const { showSuccess, showError } = useToast();
    const theme = useTheme();

    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        fetchContent();
    }, []);

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchContent();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/admin/content?search=${searchTerm}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setContent(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching content:", error);
            showError("Failed to load content");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (item) => {
        setSelectedItem(item);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedItem) return;
        try {
            const token = localStorage.getItem('token');
            // The payload matches what backend deleteContent expects
            await axios.delete('http://localhost:5000/api/admin/content', {
                headers: { Authorization: `Bearer ${token}` },
                data: {
                    type: selectedItem.type,
                    id: selectedItem._id,
                    parentId: selectedItem.parentId,
                    moduleId: selectedItem.moduleId,
                    lectureId: selectedItem.lectureId
                }
            });
            showSuccess("Content deleted successfully");
            fetchContent();
            setDeleteConfirmOpen(false);
            setSelectedItem(null);
        } catch (error) {
            showError("Failed to delete content");
        }
    };

    const getIcon = (type) => {
        if (type === 'lecture-video') return <PlayCircle color="primary" />;
        if (type.includes('resource')) return <Description color="secondary" />;
        return <AttachFile color="action" />;
    };

    const getTypeLabel = (type) => {
        if (type === 'lecture-video') return 'Video Lecture';
        if (type.includes('resource')) return 'Lecture Resource';
        return 'Assignment File';
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="800" gutterBottom>
                    Content Review
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Review and manage uploaded videos and files across the platform.
                </Typography>
            </Box>

            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>

                    {/* Search */}
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            placeholder="Search content by title..."
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                            }}
                            sx={{ maxWidth: 400 }}
                        />
                    </Box>

                    {/* Content Table */}
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Title & Source</TableCell>
                                    <TableCell>Instructor</TableCell>
                                    <TableCell>Link</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {content.length > 0 ? content.map((item) => (
                                    <TableRow key={item._id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getIcon(item.type)}
                                                <Typography variant="caption" fontWeight="600">{getTypeLabel(item.type)}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight="600">{item.title}</Typography>
                                            <Typography variant="caption" color="text.secondary">{item.source}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            {item.instructor || 'Unknown'}
                                        </TableCell>
                                        <TableCell>
                                            <Link href={item.url} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                View <Visibility fontSize="inherit" />
                                            </Link>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton color="error" onClick={() => handleDeleteClick(item)}>
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">No content found.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Delete Content?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <b>{selectedItem?.title}</b>?
                        This removes the file reference but might not delete the file from cloud storage immediately.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteConfirm}>Delete</Button>
                </DialogActions>
            </Dialog>

        </motion.div>
    );
};

export default ContentManagement;
