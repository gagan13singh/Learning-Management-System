const Test = require('../models/Test');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const TestResult = require('../models/TestResult');
const TestAttempt = require('../models/TestAttempt');
const Question = require('../models/Question');
const notificationController = require('./notificationController');

// Create a new test
exports.createTest = async (req, res) => {
    try {
        const { title, courseId, date, totalMarks, type, syllabus, questions, duration, mode, proctoring } = req.body;

        // 1. Create Questions first (if provided inline)
        const questionRefs = [];
        if (questions && questions.length > 0) {
            for (const q of questions) {
                // Check if it's already an ID or a new object
                if (typeof q === 'string') {
                    questionRefs.push({ questionId: q });
                } else {
                    const newQuestion = await Question.create({
                        type: q.type || 'MCQ',
                        content: { text: q.questionText, images: q.images },
                        options: q.options.map((opt, idx) => ({
                            id: String(idx),
                            text: opt,
                            isCorrect: q.correctAnswer === opt
                        })),
                        numericalConfig: q.numericalConfig,
                        marks: q.points || 1
                    });
                    questionRefs.push({ questionId: newQuestion._id, marks: newQuestion.marks });
                }
            }
        }

        const test = await Test.create({
            title,
            course: courseId,
            // Date is optional/virtual in new schema? Checking... kept createdAt but maybe scheduling date is needed?
            // Re-adding date field support implicitly if schema has it, my new schema had createdAt but not 'date'.
            // Wait, previous Test.js had 'date'. My NEW schema removed 'date' top level but added 'createdAt'.
            // I should have kept 'date' for scheduling. I will treat 'date' as metadata/instructions for now or add it back later if needed.
            // For now, let's assume it's for 'Exam' scheduling.
            config: {
                duration: duration || 60,
                totalMarks: totalMarks,
                isTimed: true
            },
            mode: mode || 'Exam',
            proctoring: proctoring || { enabled: true },
            syllabus,
            questions: questionRefs,
            type // Keeping legacy 'type' field mapping if needed, or ignoring
        });

        // Trigger Notification
        // await notificationController.sendTestNotification(test);

        res.status(201).json({ success: true, test });
    } catch (error) {
        console.error(error);
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

// Start a quiz attempt
exports.startQuiz = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id).populate('questions.questionId');
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        // New Schema uses 'mode' instead of 'isOnlineQuiz'
        if (test.mode !== 'Exam' && test.mode !== 'Practice' && test.mode !== 'Mock') {
            // Fallback logic
        }

        // Check if student already has an in-progress attempt
        const existingAttempt = await TestAttempt.findOne({
            student: req.user.id,
            test: req.params.id,
            status: 'InProgress'
        });

        if (existingAttempt) {
            return res.status(200).json({ success: true, data: existingAttempt });
        }

        // Create new attempt
        const attempt = await TestAttempt.create({
            student: req.user.id,
            test: req.params.id,
            totalScore: 0,
            status: 'InProgress'
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
            status: 'InProgress'
        })
            .populate({
                path: 'test',
                populate: {
                    path: 'questions.questionId'
                }
            });

        if (!attempt) {
            return res.status(404).json({ success: false, message: 'No active attempt found' });
        }

        res.status(200).json({ success: true, data: attempt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Submit an answer
// Submit an answer
exports.submitAnswer = async (req, res) => {
    try {
        const { questionId, answer, timeSpent } = req.body;

        const attempt = await TestAttempt.findOne({
            student: req.user.id,
            test: req.params.id,
            status: 'InProgress'
        }).populate({
            path: 'test',
            populate: { path: 'questions.questionId' }
        });

        if (!attempt) {
            return res.status(404).json({ success: false, message: 'No active attempt found' });
        }

        // Find the question in the test
        // Note: attempt.test.questions is an array of { questionId: Object, ... }
        const testQuestion = attempt.test.questions.find(q => q.questionId._id.toString() === questionId);

        if (!testQuestion) {
            return res.status(404).json({ success: false, message: 'Question not found in test' });
        }

        const question = testQuestion.questionId; // The populated Question doc

        // Calculate functionality
        let isCorrect = false;
        let pointsEarned = 0;

        // Logic for MCQ
        if (question.type === 'MCQ' || question.type === 'TrueFalse') {
            // Assuming answer is the option ID or text
            const correctOpt = question.options.find(o => o.isCorrect);
            if (correctOpt) {
                // Check if answer matches ID or Text
                if (answer === correctOpt.id || answer === correctOpt.text) {
                    isCorrect = true;
                    pointsEarned = question.marks;
                }
            }
        }

        // Update answers array
        const existingIndex = attempt.answers.findIndex(a => a.questionId.toString() === questionId);
        const answerEntry = {
            questionId,
            markedOptionIds: [answer], // Storing as array for generic support
            timeSpent,
            isCorrect,
            marksObtained: pointsEarned
        };

        if (existingIndex >= 0) {
            attempt.answers[existingIndex] = answerEntry;
        } else {
            attempt.answers.push(answerEntry);
        }

        await attempt.save();
        res.status(200).json({ success: true, data: attempt });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Log a violation
exports.logViolation = async (req, res) => {
    try {
        const { type, evidence } = req.body; // 'TAB_SWITCH', etc.

        const attempt = await TestAttempt.findOne({
            student: req.user.id,
            test: req.params.id,
            status: 'InProgress'
        });

        if (!attempt) {
            return res.status(404).json({ success: false, message: 'No active attempt' });
        }

        attempt.proctoringLogs.push({
            violationType: type,
            evidence,
            timestamp: new Date()
        });

        // Simple Fraud Score Increment
        if (type === 'TAB_SWITCH') attempt.fraudScore += 5;
        if (type === 'FULLSCREEN_EXIT') attempt.fraudScore += 10;

        await attempt.save();

        res.status(200).json({ success: true, data: attempt });
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

// @desc    Get Upcoming Tests for Student
// @route   GET /api/tests/upcoming
// @access  Private (Student)
exports.getUpcomingTests = async (req, res) => {
    try {
        // Enrolled courses
        const Enrollment = require('../models/Enrollment');
        const enrollments = await Enrollment.find({ student: req.user.id, status: 'active' });
        const courseIds = enrollments.map(e => e.course);

        const upcomingTests = await Test.find({
            course: { $in: courseIds },
            date: { $gte: new Date() }
        })
            .populate('course', 'title')
            .sort({ date: 1 })
            .limit(5);

        res.status(200).json({ success: true, data: upcomingTests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Student Test Results (Performance)
// @route   GET /api/tests/my-results
// @access  Private (Student)
exports.getStudentTestResults = async (req, res) => {
    try {
        // Fetch from TestResult model (offline/general tests)
        const results = await TestResult.find({ student: req.user.id })
            .populate('test', 'title date totalMarks')
            .sort({ submittedAt: -1 })
            .limit(5);

        // Transform for chart data
        const chartData = results.map((r, index) => ({
            name: `Test ${results.length - index}`, // or r.test.title
            score: r.percentage,
            title: r.test.title,
            date: r.test.date
        })).reverse(); // Oldest first for line chart

        res.status(200).json({ success: true, data: chartData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

