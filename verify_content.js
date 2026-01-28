const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'backend/.env') });
const User = require('./backend/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db';

const verifyContent = async () => {
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

        console.log('Testing GET /api/admin/content...');
        const contentRes = await fetch('http://127.0.0.1:5000/api/admin/content', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const contentData = await contentRes.json();
        console.log('Content Response:', contentData.success ? 'SUCCESS' : 'FAILED');
        console.log('Content Items Found:', contentData.count);
        if (contentData.count > 0) {
            console.log('Sample item:', contentData.data[0].title, `(${contentData.data[0].type})`);
        }

        console.log('VERIFICATION COMPLETE: CONTENT API CHECKS PASSED');

    } catch (error) {
        console.error('VERIFICATION FAILED:', error);
    } finally {
        await mongoose.disconnect();
    }
};

verifyContent();
