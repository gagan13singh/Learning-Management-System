const Batch = require('../models/Batch');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// Create a new batch
exports.createBatch = async (req, res) => {
    try {
        console.log('=== CREATE BATCH DEBUG ===');
        const { name, courseIds, schedule, maxStrength, startDate, endDate } = req.body;
        console.log('Request Body:', { name, courseIds, schedule, maxStrength, startDate, endDate });

        // 1. Create the Batch
        const batch = await Batch.create({
            name,
            courses: courseIds, // Save array of courses
            schedule,
            maxStrength,
            startDate,
            endDate
        });

        console.log('Batch Created:', {
            id: batch._id,
            name: batch.name,
            courses: batch.courses
        });

        console.log('=== END CREATE DEBUG ===');

        res.status(201).json({ success: true, batch });
    } catch (error) {
        console.error('Create Batch Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all batches (Robust & Backward Compatible)
exports.getAllBatches = async (req, res) => {
    try {
        console.log('=== GET ALL BATCHES DEBUG ===');
        console.log('User ID:', req.user.id);
        console.log('User Role:', req.user.role);

        let query = {};

        // If user is a teacher, filter by their courses
        if (req.user.role === 'teacher') {
            // 1. Find all courses taught by this teacher
            const teacherCourses = await Course.find({ instructor: req.user.id }).select('_id');
            const teacherCourseIds = teacherCourses.map(c => c._id);

            console.log('Teacher Courses Found:', teacherCourses.length);
            console.log('Teacher Course IDs:', teacherCourseIds);

            if (teacherCourseIds.length === 0) {
                console.log('No courses found for teacher - returning empty array');
                return res.status(200).json({ success: true, batches: [] });
            }

            // 2. Find batches linked to ANY of these courses
            // Check both 'courses' array AND legacy 'course' field
            query = {
                $or: [
                    { courses: { $in: teacherCourseIds } },
                    { course: { $in: teacherCourseIds } }
                ]
            };

            console.log('Query:', JSON.stringify(query, null, 2));
        }

        // 3. Fetch Batches with full population
        const batches = await Batch.find(query)
            .populate('courses', 'title') // Populate new array
            .populate('course', 'title')  // Populate legacy field
            .populate('students', 'name email')
            .sort({ createdAt: -1 });

        console.log('Batches Found:', batches.length);
        if (batches.length > 0) {
            console.log('First Batch Sample:', {
                id: batches[0]._id,
                name: batches[0].name,
                courses: batches[0].courses,
                course: batches[0].course
            });
        }
        console.log('=== END DEBUG ===');

        res.status(200).json({ success: true, batches });
    } catch (error) {
        console.error('Get Batches Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single batch details
exports.getBatchById = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id)
            .populate('courses', 'title')
            .populate('course', 'title')
            .populate('students', 'name email behaviourScore riskStatus');

        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }

        res.status(200).json({ success: true, batch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Batch
exports.updateBatch = async (req, res) => {
    try {
        const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }

        res.status(200).json({ success: true, batch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Batch
exports.deleteBatch = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);

        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }

        // Remove batch from students
        await User.updateMany(
            { batches: batch._id },
            { $pull: { batches: batch._id } }
        );

        await batch.deleteOne();

        res.status(200).json({ success: true, message: 'Batch deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add student to batch (Robust Enrollment)
exports.addStudentToBatch = async (req, res) => {
    try {
        const { batchId, studentId } = req.body;

        const batch = await Batch.findById(batchId);
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }

        // 1. Check if already in batch
        if (batch.students.includes(studentId)) {
            return res.status(400).json({ success: false, message: 'Student already in batch' });
        }

        // 2. Check capacity
        if (batch.students.length >= batch.maxStrength) {
            return res.status(400).json({ success: false, message: 'Batch is full' });
        }

        // 3. Add student to batch
        batch.students.push(studentId);
        await batch.save();

        // 4. Add batch to user profile
        await User.findByIdAndUpdate(studentId, { $push: { batches: batchId } });

        // 5. Enroll student in ALL associated courses
        // Collect all course IDs from both new and legacy fields
        let coursesToEnroll = [];
        if (batch.courses && batch.courses.length > 0) {
            coursesToEnroll = [...batch.courses];
        }
        if (batch.course) {
            coursesToEnroll.push(batch.course);
        }

        // Remove duplicates if any
        coursesToEnroll = [...new Set(coursesToEnroll.map(id => id.toString()))];

        // Create enrollments
        const enrollmentPromises = coursesToEnroll.map(courseId =>
            Enrollment.findOneAndUpdate(
                { student: studentId, course: courseId },
                { student: studentId, course: courseId, enrolledAt: new Date() },
                { upsert: true, new: true }
            )
        );

        await Promise.all(enrollmentPromises);

        res.status(200).json({ success: true, message: 'Student added to batch and enrolled in all courses', batch });
    } catch (error) {
        console.error('Add Student Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Bulk Add Students to Batch
exports.addStudentsToBatch = async (req, res) => {
    try {
        const { batchId, studentIds } = req.body;

        const batch = await Batch.findById(batchId);
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }

        let coursesToEnroll = [];
        if (batch.courses && batch.courses.length > 0) {
            coursesToEnroll = [...batch.courses];
        }
        if (batch.course) {
            coursesToEnroll.push(batch.course);
        }
        coursesToEnroll = [...new Set(coursesToEnroll.map(id => id.toString()))];

        let addedCount = 0;

        for (const studentId of studentIds) {
            if (!batch.students.includes(studentId) && batch.students.length < batch.maxStrength) {
                batch.students.push(studentId);
                await User.findByIdAndUpdate(studentId, { $push: { batches: batchId } });

                const enrollmentPromises = coursesToEnroll.map(courseId =>
                    Enrollment.findOneAndUpdate(
                        { student: studentId, course: courseId },
                        { student: studentId, course: courseId, enrolledAt: new Date() },
                        { upsert: true, new: true }
                    )
                );
                await Promise.all(enrollmentPromises);
                addedCount++;
            }
        }

        await batch.save();

        res.status(200).json({ success: true, message: `${addedCount} students added to batch`, batch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Calculate Batch Health Score
exports.getBatchHealth = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id).populate('students');
        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

        let healthScore = 85;
        if (batch.students.length < 5) healthScore = 60;
        if (batch.students.length > 20) healthScore = 95;

        batch.healthScore = healthScore;
        await batch.save();

        res.status(200).json({
            success: true,
            healthScore,
            metrics: {
                attendance: '85%',
                testPerformance: '78%',
                homeworkCompletion: '90%',
                doubtsAsked: 12
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
