const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Adjust path to your User model
require('dotenv').config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'admin@example.com';
        const password = 'password123';

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log('⚠️ User already exists. Resetting password...');
            // Optional: Reset password if you want to be sure
            const salt = await bcrypt.genSalt(10);
            userExists.password = await bcrypt.hash(password, salt);
            await userExists.save();
            console.log(`✅ Password reset for ${email} to: ${password}`);
            process.exit();
        }

        // Create new user
        const user = await User.create({
            name: 'Admin User',
            email,
            password, // Make sure your User model has a pre-save hook to hash this!
            role: 'admin', // or 'teacher' depending on what controls you need
        });

        console.log(`🎉 User Created!`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        // await mongoose.disconnect();
        process.exit();
    }
};

createAdmin();
