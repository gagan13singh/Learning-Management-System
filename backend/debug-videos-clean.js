const mongoose = require('mongoose');
const Course = require('./models/Course');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms');
    } catch (error) {
        process.exit(1);
    }
};

const debugVideos = async () => {
    await connectDB();
    const course = await Course.findOne({ 'modules.lectures.videoUrl': { $exists: true, $ne: '' } });

    if (course) {
        for (const module of course.modules) {
            for (const lecture of module.lectures) {
                if (lecture.videoUrl) {
                    console.log('VIDEO_URL_START');
                    console.log(lecture.videoUrl);
                    console.log('VIDEO_URL_END');
                    process.exit(0);
                }
            }
        }
    } else {
        console.log('NO_VIDEOS_FOUND');
    }
    process.exit(0);
};

debugVideos();
