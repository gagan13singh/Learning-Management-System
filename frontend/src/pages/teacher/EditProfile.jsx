import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Avatar,
    Alert,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import Navbar from '../../components/common/Navbar';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const EditProfile = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.bio || '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.put('/auth/profile', formData);

            updateUser(response.data.data); // Update user context
            setSuccess('Profile updated successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (user?.role === 'teacher') {
            navigate('/teacher/dashboard');
        } else {
            navigate('/student/dashboard');
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Navbar />
            <Container maxWidth="sm" sx={{ py: 4 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={handleBack}
                    sx={{ mb: 3 }}
                >
                    Back to Dashboard
                </Button>

                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                        <Avatar
                            src={user?.profilePicture}
                            alt={user?.name}
                            sx={{ width: 100, height: 100, mb: 2 }}
                        />
                        <Typography variant="h5" fontWeight="700">
                            Edit Profile
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Email Address"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            margin="normal"
                            disabled // Email usually shouldn't be changed easily
                        />
                        <TextField
                            fullWidth
                            label="Bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            multiline
                            rows={4}
                            margin="normal"
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            disabled={loading}
                            startIcon={<Save />}
                            sx={{ mt: 3 }}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default EditProfile;
