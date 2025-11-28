const Test = require('../models/Test');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const notificationController = require('./notificationController');

// Create a new test
exports.createTest = async (req, res) => {
    try {
        const { title, courseId, date, totalMarks, type, syllabus, questions } = req.body;

        const test = await Test.create({
            title,
            course: courseId,
            date,
            totalMarks,
            type,
            syllabus,
            questions
        });

        // Trigger Notification
        await notificationController.sendTestNotification(test);

        res.status(201).json({ success: true, test });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all tests
exports.getTests = async (req, res) => {
    try {
        console.log('=== GET TESTS DEBUG ===');
        console.log('User:', req.user);

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        console.log('User ID:', req.user.id);
        console.log('User Role:', req.user.role);

        let query = {};

        // If teacher, show only their tests
        if (req.user.role === 'teacher') {
            const teacherCourses = await Course.find({ instructor: req.user.id }).select('_id');
            const courseIds = teacherCourses.map(c => c._id);
            console.log('Teacher Courses:', courseIds);
            query.course = { $in: courseIds };
        }

        console.log('Query:', query);
        const tests = await Test.find(query)
            .populate('course', 'title')
            .sort({ date: -1 });

        console.log('Tests Found:', tests.length);
        console.log('Tests:', tests);
        console.log('=== END DEBUG ===');

        res.status(200).json({ success: true, data: tests });
    } catch (error) {
        console.error('Get Tests Error:', error);
        console.error('Error Stack:', error.stack);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single test
exports.getTestById = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id)
            .populate('course', 'title')
            .populate('results.student', 'name email');

        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        // If results are empty, populate them with students enrolled in the course
        if (test.results.length === 0 && test.course) {
            const enrollments = await Enrollment.find({ course: test.course }).populate('student');
            if (enrollments && enrollments.length > 0) {
                test.results = enrollments.map(enrollment => ({
                    student: enrollment.student,
                    marks: 0,
                    status: 'PRESENT'
                }));
            }
        }

        res.status(200).json({ success: true, data: test });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Test Results (Grading)
// Update Test Results (Grading)
exports.updateTestResults = async (req, res) => {
    try {
        const { results } = req.body;

        const test = await Test.findById(req.params.id);
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        test.results = results.map(r => ({
            student: r.studentId,
            marks: r.marks,
            status: r.status || 'PRESENT'
        }));

        await test.save();

        res.status(200).json({ success: true, message: 'Results updated', data: test });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Test Details
exports.updateTest = async (req, res) => {
    try {
        const { title, courseId, date, totalMarks, type, syllabus, questions, isOnlineQuiz, timeLimit, passingPercentage, randomizeQuestions, randomizeOptions, enableProctoring, maxViolations } = req.body;

        let test = await Test.findById(req.params.id);
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        test.title = title || test.title;
        test.course = courseId || test.course;
        test.date = date || test.date;
        test.totalMarks = totalMarks || test.totalMarks;
        test.type = type || test.type;
        test.syllabus = syllabus || test.syllabus;
        test.questions = questions || test.questions;

        // Quiz fields
        if (isOnlineQuiz !== undefined) test.isOnlineQuiz = isOnlineQuiz;
        if (timeLimit) test.timeLimit = timeLimit;
        if (passingPercentage) test.passingPercentage = passingPercentage;
        if (randomizeQuestions !== undefined) test.randomizeQuestions = randomizeQuestions;
        if (randomizeOptions !== undefined) test.randomizeOptions = randomizeOptions;
        if (enableProctoring !== undefined) test.enableProctoring = enableProctoring;
        if (maxViolations) test.maxViolations = maxViolations;

        await test.save();

        res.status(200).json({ success: true, data: test });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Test
exports.deleteTest = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        await test.deleteOne();
        res.status(200).json({ success: true, message: 'Test deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============ ONLINE QUIZ ENDPOINTS ============

const TestAttempt = require('../models/TestAttempt');

// Start a quiz attempt
exports.startQuiz = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        if (!test.isOnlineQuiz) {
            return res.status(400).json({ success: false, message: 'This is not an online quiz' });
        }

        // Check if student already has an in-progress attempt
        const existingAttempt = await TestAttempt.findOne({
            student: req.user.id,
            test: req.params.id,
            status: 'in-progress'
        });

        if (existingAttempt) {
            return res.status(200).json({ success: true, data: existingAttempt });
        }

        // Create question order (randomize if enabled)
        let questionOrder = test.questions.map(q => q._id);
        if (test.randomizeQuestions) {
            questionOrder = questionOrder.sort(() => Math.random() - 0.5);
        }

        // Create new attempt
        const attempt = await TestAttempt.create({
            student: req.user.id,
            test: req.params.id,
            totalPoints: test.totalPoints,
            questionOrder,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.status(201).json({ success: true, data: attempt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get current attempt
exports.getAttempt = async (req, res) => {
    try {
        const attempt = await TestAttempt.findOne({
            student: req.user.id,
            test: req.params.id,
            status: 'in-progress'
        }).populate('test');

        if (!attempt) {
            return res.status(404).json({ success: false, message: 'No active attempt found' });
        }

        res.status(200).json({ success: true, data: attempt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Submit an answer
exports.submitAnswer = async (req, res) => {
    try {
        const { questionId, answer, timeSpent } = req.body;

        const attempt = await TestAttempt.findOne({
            student: req.user.id,
            test: req.params.id,
            status: 'in-progress'
        }).populate('test');

        if (!attempt) {
            return res.status(404).json({ success: false, message: 'No active attempt found' });
        }

        // Find the question
        const question = attempt.test.questions.id(questionId);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        // Check if answer is correct and calculate points
        let isCorrect = false;
        let pointsEarned = 0;

        if (question.questionType === 'MCQ' || question.questionType === 'TRUE_FALSE' || question.questionType === 'FILL_BLANK') {
            const correctAnswer = question.correctAnswer.toString().trim().toLowerCase();
            const studentAnswer = answer.toString().trim().toLowerCase();
            isCorrect = correctAnswer === studentAnswer;
            pointsEarned = isCorrect ? question.points : 0;
        } else if (question.questionType === 'MULTIPLE_SELECT') {
            const correctAnswers = question.correctAnswers.map(a => a.toString().trim().toLowerCase()).sort();
            const studentAnswers = answer.map(a => a.toString().trim().toLowerCase()).sort();
            isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(studentAnswers);
            pointsEarned = isCorrect ? question.points : 0;
        }

        // Update or add answer
        const existingAnswerIndex = attempt.answers.findIndex(a => a.questionId.toString() === questionId);
        if (existingAnswerIndex >= 0) {
            attempt.answers[existingAnswerIndex] = {
                questionId,
                answer,
                isCorrect,
                pointsEarned,
                timeSpent
            };
        } else {
            attempt.answers.push({
                questionId,
                answer,
                isCorrect,
                pointsEarned,
                timeSpent
            });
        }

        await attempt.save();

        res.status(200).json({ success: true, data: attempt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Log a violation
exports.logViolation = async (req, res) => {
    try {
        const { type, description } = req.body;

        const attempt = await TestAttempt.findOne({
            student: req.user.id,
            test: req.params.id,
            status: 'in-progress'
        }).populate('test');

        if (!attempt) {
            return res.status(404).json({ success: false, message: 'No active attempt found' });
        }

        // Add violation
        attempt.violations.push({
            type: type || 'TAB_SWITCH',
            description
        });
        attempt.violationCount += 1;

        // Check if max violations exceeded
        if (attempt.violationCount > attempt.test.maxViolations) {
            attempt.status = 'cancelled';
            attempt.endTime = new Date();
            attempt.submittedAt = new Date();
        }

        await attempt.save();

        res.status(200).json({
            success: true,
            data: attempt,
            cancelled: attempt.status === 'cancelled'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Submit quiz
exports.submitQuiz = async (req, res) => {
    try {
        const attempt = await TestAttempt.findOne({
            student: req.user.id,
            test: req.params.id,
            status: 'in-progress'
        }).populate('test');

        if (!attempt) {
            return res.status(404).json({ success: false, message: 'No active attempt found' });
        }

        // Calculate final score
        attempt.calculateScore();
        attempt.checkPassed(attempt.test.passingPercentage);

        attempt.status = 'completed';
        attempt.endTime = new Date();
        attempt.submittedAt = new Date();

        await attempt.save();

        res.status(200).json({ success: true, data: attempt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get quiz results (for teacher)
exports.getQuizResults = async (req, res) => {
    try {
        const attempts = await TestAttempt.find({ test: req.params.id })
            .populate('student', 'name email')
            .sort({ submittedAt: -1 });

        res.status(200).json({ success: true, data: attempts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

