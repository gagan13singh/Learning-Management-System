import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, IconButton, TextField, InputAdornment, Menu, MenuItem,
    Avatar, Button, useTheme, Pagination, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Select, FormControl, InputLabel
} from '@mui/material';
import {
    Search, MoreVert, Block, CheckCircle, Edit, FilterList, Person, Close
} from '@mui/icons-material';
import api from '../../api/axios';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';

const UserManagement = () => {
    const { showSuccess, showError } = useToast();
    const theme = useTheme();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false);
    const [newRole, setNewRole] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]); // Refetch when filter changes

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            let url = `/api/admin/users?search=${searchTerm}`;
            if (roleFilter) url += `&role=${roleFilter}`;

            const res = await api.get(url);

            if (res.data.success) {
                setUsers(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            showError("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleMenuOpen = (event, user) => {
        setActionMenuAnchor(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setActionMenuAnchor(null);
        setSelectedUser(null);
    };

    const handleStatusUpdate = async (isActive) => {
        if (!selectedUser) return;
        try {
            await api.put(`/api/admin/users/${selectedUser._id}/status`, { isActive });
            showSuccess(`User ${isActive ? 'unblocked' : 'blocked'} successfully`);
            fetchUsers();
            handleMenuClose();
        } catch (error) {
            showError("Failed to update user status");
        }
    };

    const handleRoleUpdateInit = () => {
        setNewRole(selectedUser.role);
        setEditRoleDialogOpen(true);
        setActionMenuAnchor(null); // Keep selectedUser set
    };

    const handleRoleUpdateConfirm = async () => {
        if (!selectedUser) return;
        try {
            await api.put(`/api/admin/users/${selectedUser._id}/role`, { role: newRole });
            showSuccess("User role updated");
            fetchUsers();
            setEditRoleDialogOpen(false);
            setSelectedUser(null);
        } catch (error) {
            showError("Failed to update role");
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'error';
            case 'teacher': return 'info';
            case 'student': return 'success';
            default: return 'default';
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="800" gutterBottom>
                        User Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage users, roles, and access controls.
                    </Typography>
                </Box>
                {/* <Button variant="contained" startIcon={<Person />}>Add User</Button> */}
            </Box>

            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>

                    {/* Filters */}
                    <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                        <TextField
                            placeholder="Search by name or email..."
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
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={roleFilter}
                                label="Role"
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <MenuItem value="">All Roles</MenuItem>
                                <MenuItem value="student">Student</MenuItem>
                                <MenuItem value="teacher">Teacher</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Users Table */}
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>User</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Joined</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.length > 0 ? users.map((user) => (
                                    <TableRow key={user._id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar src={user.profilePicture} alt={user.name}>{user.name[0]}</Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="600">{user.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.role.toUpperCase()}
                                                size="small"
                                                color={getRoleColor(user.role)}
                                                variant="outlined"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {user.isActive ? (
                                                <Chip icon={<CheckCircle />} label="Active" size="small" color="success" sx={{ bgcolor: 'success.light', color: 'success.dark' }} />
                                            ) : (
                                                <Chip icon={<Block />} label="Blocked" size="small" color="error" sx={{ bgcolor: 'error.light', color: 'error.dark' }} />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                                                <MoreVert />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">No users found.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Action Menu */}
            <Menu
                anchorEl={actionMenuAnchor}
                open={Boolean(actionMenuAnchor)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleRoleUpdateInit}>
                    <Edit fontSize="small" sx={{ mr: 1 }} /> Edit Role
                </MenuItem>
                {selectedUser?.isActive ? (
                    <MenuItem onClick={() => handleStatusUpdate(false)} sx={{ color: 'error.main' }}>
                        <Block fontSize="small" sx={{ mr: 1 }} /> Block User
                    </MenuItem>
                ) : (
                    <MenuItem onClick={() => handleStatusUpdate(true)} sx={{ color: 'success.main' }}>
                        <CheckCircle fontSize="small" sx={{ mr: 1 }} /> Unblock User
                    </MenuItem>
                )}
            </Menu>

            {/* Edit Role Dialog */}
            <Dialog open={editRoleDialogOpen} onClose={() => setEditRoleDialogOpen(false)}>
                <DialogTitle>Edit User Role</DialogTitle>
                <DialogContent sx={{ minWidth: 300, py: 2 }}>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={newRole}
                            label="Role"
                            onChange={(e) => setNewRole(e.target.value)}
                        >
                            <MenuItem value="student">Student</MenuItem>
                            <MenuItem value="teacher">Teacher</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditRoleDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleRoleUpdateConfirm}>Update</Button>
                </DialogActions>
            </Dialog>

        </motion.div>
    );
};

export default UserManagement;
