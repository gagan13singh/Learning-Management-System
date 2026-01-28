const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'backend/.env') });
const User = require('./backend/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db';

const populateAnnouncement = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const adminEmail = 'testadmin@example.com';
        const adminPass = 'password123';

        console.log('Logging in as admin...');
        const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminEmail, password: adminPass })
        });

        if (!loginRes.ok) throw new Error('Login failed');
        const token = (await loginRes.json()).token;

        console.log('Creating "Welcome to Phase 4" Announcement...');
        const createRes = await fetch('http://127.0.0.1:5000/api/admin/announcements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                title: 'System Update: Phase 4',
                message: 'Announcements module has been successfully deployed. You can now broadcast updates.',
                target: 'all',
                type: 'success'
            })
        });
        const createData = await createRes.json();
        console.log('Create Response:', createData.success ? 'SUCCESS' : 'FAILED');

        console.log('POPULATION COMPLETE');

    } catch (error) {
        console.error('POPULATION FAILED:', error);
    } finally {
        await mongoose.disconnect();
    }
};

populateAnnouncement();
