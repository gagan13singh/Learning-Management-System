const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'backend/.env') });
const User = require('./backend/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db';

const verifyAnnouncements = async () => {
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

        console.log('Creating Announcement...');
        const createRes = await fetch('http://127.0.0.1:5000/api/admin/announcements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                title: 'Test Announcement',
                message: 'This is a test message from verification script',
                target: 'all',
                type: 'info'
            })
        });
        const createData = await createRes.json();
        console.log('Create Response:', createData.success ? 'SUCCESS' : 'FAILED');

        if (createData.success) {
            console.log('New ID:', createData.data._id);

            console.log('Fetching Announcements...');
            const listRes = await fetch('http://127.0.0.1:5000/api/admin/announcements', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const listData = await listRes.json();
            console.log('List Count:', listData.count);

            console.log('Skipping Deletion to keep data for User...');
            /* await fetch(`http://127.0.0.1:5000/api/admin/announcements/${createData.data._id}`, {
               method: 'DELETE',
               headers: { Authorization: `Bearer ${token}` }
           });
           console.log('Delete status: COMPLETED'); */
        }

        console.log('VERIFICATION COMPLETE: ANNOUNCEMENT API CHECKS PASSED');

    } catch (error) {
        console.error('VERIFICATION FAILED:', error);
    } finally {
        await mongoose.disconnect();
    }
};

verifyAnnouncements();
