const mongoose = require('mongoose');
const Course = require('./models/Course');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const debugVideos = async () => {
    await connectDB();

    console.log('\n--- Checking Course Videos ---\n');

    const courses = await Course.find({});
    let totalVideos = 0;

    courses.forEach(course => {
        let hasVideos = false;
        course.modules.forEach(module => {
            module.lectures.forEach(lecture => {
                if (lecture.type === 'video') {
                    hasVideos = true;
                    totalVideos++;
                    console.log(`Course: ${course.title}`);
                    console.log(`  Module: ${module.title}`);
                    console.log(`    Lecture: ${lecture.title}`);
                    console.log(`    Video URL: "${lecture.videoUrl}"`);
                    console.log(`    Public ID: "${lecture.videoPublicId}"`);
                    console.log('-----------------------------------');
                }
            });
        });
    });

    if (totalVideos === 0) {
        console.log('No video lectures found in any course.');
    }

    console.log('\n--- End Debug ---\n');
    process.exit();
};

debugVideos();
