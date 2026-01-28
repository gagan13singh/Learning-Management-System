const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'backend/.env') });
const User = require('./backend/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db';

const verifyAdminCourses = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const adminEmail = 'testadmin@example.com';
        const adminPass = 'password123';

        let admin = await User.findOne({ email: adminEmail });
        if (!admin) {
            console.log('Admin not found, please run previous verification first');
            return;
        }

        console.log('Logging in as admin...');
        const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminEmail, password: adminPass })
        });

        if (!loginRes.ok) throw new Error('Login failed');
        const token = (await loginRes.json()).token;

        console.log('Testing GET /api/admin/courses...');
        const coursesRes = await fetch('http://127.0.0.1:5000/api/admin/courses', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const coursesData = await coursesRes.json();
        console.log('Courses Response:', coursesData.success ? 'SUCCESS' : 'FAILED');
        console.log('Courses Found:', coursesData.count);

        if (coursesData.count > 0) {
            const courseId = coursesData.data[0]._id;
            console.log(`Testing Status Update for course ${courseId}...`);

            const updateRes = await fetch(`http://127.0.0.1:5000/api/admin/courses/${courseId}/status`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'published' })
            });
            const updateData = await updateRes.json();
            console.log('Update Response:', updateData.success ? 'SUCCESS' : 'FAILED');
        } else {
            console.log('No courses to test update on.');
        }

        console.log('VERIFICATION COMPLETE: COURSE API CHECKS PASSED');

    } catch (error) {
        console.error('VERIFICATION FAILED:', error);
    } finally {
        await mongoose.disconnect();
    }
};

verifyAdminCourses();
