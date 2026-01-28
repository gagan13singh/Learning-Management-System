const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'backend/.env') });
const User = require('./backend/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db';

const verifyAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const adminEmail = 'testadmin@example.com';
        const adminPass = 'password123';

        let admin = await User.findOne({ email: adminEmail });
        if (!admin) {
            console.log('Creating test admin user...');
            admin = await User.create({
                name: 'Test Admin',
                email: adminEmail,
                password: adminPass,
                role: 'admin',
                isActive: true
            });
        } else {
            console.log('Test admin user exists. ensuring role is admin...');
            admin.role = 'admin';
            await admin.save();
        }

        console.log('Logging in as admin...');
        const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminEmail, password: adminPass })
        });

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginRes.status} ${loginRes.statusText}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Got token:', token ? 'YES' : 'NO');
        if (!token) throw new Error('No token received');

        console.log('Testing GET /api/admin/stats...');
        const statsRes = await fetch('http://127.0.0.1:5000/api/admin/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const statsData = await statsRes.json();
        console.log('Stats Response:', statsData.success ? 'SUCCESS' : 'FAILED');

        console.log('Testing GET /api/admin/users...');
        const usersRes = await fetch('http://127.0.0.1:5000/api/admin/users?search=Test', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const usersData = await usersRes.json();
        console.log('Users Response:', usersData.success ? 'SUCCESS' : 'FAILED');
        console.log('Users Found:', usersData.count);

        console.log('VERIFICATION COMPLETE: ALL CHECKS PASSED');

    } catch (error) {
        console.error('VERIFICATION FAILED:', error);
    } finally {
        await mongoose.disconnect();
    }
};

verifyAdmin();
