const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'backend/.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db';

const populateV2 = async () => {
    try {
        const adminEmail = 'testadmin@example.com';
        const adminPass = 'password123';

        console.log('Logging in...');
        const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminEmail, password: adminPass })
        });
        const loginData = await loginRes.json();
        if (!loginData.success) {
            console.error('Login Failed:', loginData);
            return;
        }
        const token = loginData.token;

        console.log('Creating Announcement...');
        const createRes = await fetch('http://127.0.0.1:5000/api/admin/announcements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                title: 'System Update: Phase 4',
                message: 'Announcements module is live.',
                target: 'all',
                type: 'success'
            })
        });
        const createData = await createRes.json();
        console.log('Response:', JSON.stringify(createData, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
};

populateV2();
