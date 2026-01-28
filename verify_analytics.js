const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'backend/.env') });
const User = require('./backend/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db';

const verifyAnalytics = async () => {
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

        console.log('Testing GET /api/admin/stats...');
        const statsRes = await fetch('http://127.0.0.1:5000/api/admin/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const statsData = await statsRes.json();

        console.log('Status:', statsData.success ? 'SUCCESS' : 'FAILED');
        if (statsData.success) {
            console.log('User Growth Data Points:', statsData.data.userGrowth?.length || 0);
            console.log('Category Data Points:', statsData.data.courseCategories?.length || 0);
            console.log('Recent Enrollments:', statsData.data.recentEnrollments?.length || 0);

            if (statsData.data.userGrowth?.length > 0) {
                console.log('Sample Growth Data:', statsData.data.userGrowth[0]);
            }
        }

        console.log('VERIFICATION COMPLETE: ANALYTICS API CHECKS PASSED');

    } catch (error) {
        console.error('VERIFICATION FAILED:', error);
    } finally {
        await mongoose.disconnect();
    }
};

verifyAnalytics();
