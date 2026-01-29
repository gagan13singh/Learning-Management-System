import React, { useState } from 'react';
import {
    Box, Typography, Card, CardContent, Switch, FormControlLabel,
    Divider, Button, TextField, Grid, Avatar
} from '@mui/material';
import { Save, Security, Notifications, Language, ColorLens } from '@mui/icons-material';
import { useToast } from '../../context/ToastContext';

const AdminSettings = () => {
    const { showSuccess } = useToast();
    const [generalSettings, setGeneralSettings] = useState({
        siteName: 'Scientia LMS',
        supportEmail: 'support@scientia.com',
        maintenanceMode: false,
    });

    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        pushNotifications: false,
        newUserSignup: true,
    });

    const handleSave = () => {
        // Here you would typically make an API call to save settings
        showSuccess('Settings saved successfully');
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
            <Typography variant="h4" fontWeight="800" gutterBottom>
                Platform Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Manage system-wide configurations and preferences.
            </Typography>

            <Grid container spacing={4}>
                {/* General Settings */}
                <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'divider' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <ColorLens color="primary" />
                                <Typography variant="h6" fontWeight="bold">General Configuration</Typography>
                            </Box>
                            <Divider sx={{ mb: 3 }} />

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    label="Platform Name"
                                    fullWidth
                                    value={generalSettings.siteName}
                                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                                />
                                <TextField
                                    label="Support Email"
                                    fullWidth
                                    value={generalSettings.supportEmail}
                                    onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={generalSettings.maintenanceMode}
                                            onChange={(e) => setGeneralSettings({ ...generalSettings, maintenanceMode: e.target.checked })}
                                        />
                                    }
                                    label="Maintenance Mode (Close access for users)"
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Notification Settings */}
                <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'divider' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Notifications color="secondary" />
                                <Typography variant="h6" fontWeight="bold">Notifications</Typography>
                            </Box>
                            <Divider sx={{ mb: 3 }} />

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notifications.emailAlerts}
                                            onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                                        />
                                    }
                                    label="Enable Email Alerts"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notifications.pushNotifications}
                                            onChange={(e) => setNotifications({ ...notifications, pushNotifications: e.target.checked })}
                                        />
                                    }
                                    label="Enable Push Notifications"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notifications.newUserSignup}
                                            onChange={(e) => setNotifications({ ...notifications, newUserSignup: e.target.checked })}
                                        />
                                    }
                                    label="Notify on New User Signup"
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Save Button */}
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<Save />}
                            onClick={handleSave}
                            sx={{ borderRadius: 2, px: 4 }}
                        >
                            Save Changes
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminSettings;
