import { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        // In a real app, you would call an API here
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Reset Password
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Enter your email address to receive password reset instructions.
                </Typography>

                {submitted ? (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        If an account exists for {email}, you will receive an email shortly.
                    </Alert>
                ) : (
                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ mb: 3 }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{ borderRadius: 2 }}
                        >
                            Send Reset Link
                        </Button>
                    </Box>
                )}

                <Box sx={{ mt: 3 }}>
                    <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 600 }}>
                        Back to Login
                    </Link>
                </Box>
            </Paper>
        </Container>
    );
};

export default ForgotPassword;
