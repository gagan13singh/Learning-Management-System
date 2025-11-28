const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');

// @desc    Create a quiz
// @route   POST /api/quizzes
// @access  Private (Teacher only)
exports.createQuiz = async (req, res) => {
    try {
        const { title, description, course, moduleId, questions, passingPercentage, timeLimit } = req.body;

        // Verify course exists and user is the instructor
        const courseDoc = await Course.findById(course);

        if (!courseDoc) {
            return res.status(404).json({
                success: false,
                message: 'Course not found',
            });
        }

        if (courseDoc.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to create quiz for this course',
            });
        }

        const quiz = await Quiz.create({
            title,
            description,
            course,
            moduleId,
            questions,
            passingPercentage,
            timeLimit,
        });

        res.status(201).json({
            success: true,
            message: 'Quiz created successfully',
            data: quiz,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all quizzes created by the teacher
// @route   GET /api/quizzes/teacher/my-quizzes
// @access  Private (Teacher)
exports.getTeacherQuizzes = async (req, res) => {
    try {
        // Find courses by this instructor
        const courses = await Course.find({ instructor: req.user.id }).select('_id');
        const courseIds = courses.map(c => c._id);

        // Find quizzes for these courses
        const quizzes = await Quiz.find({ course: { $in: courseIds } })
            .populate('course', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: quizzes.length,
            quizzes, // Changed from data to quizzes to match frontend expectation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all quizzes for a course
// @route   GET /api/quizzes/course/:courseId
// @access  Public
exports.getQuizzesByCourse = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ course: req.params.courseId, isActive: true })
            .select('-questions.correctOptionIndex -questions.explanation'); // Hide answers

        res.status(200).json({
            success: true,
            count: quizzes.length,
            data: quizzes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get single quiz (for students - without answers)
// @route   GET /api/quizzes/:id
// @access  Private (Student)
exports.getQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('course', 'title instructor');

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found',
            });
        }

        // Remove correct answers for students
        const quizData = quiz.toObject();
        quizData.questions = quizData.questions.map(q => ({
            _id: q._id,
            questionText: q.questionText,
            options: q.options,
            marks: q.marks,
        }));

        res.status(200).json({
            success: true,
            data: quizData,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get quiz with answers (for teachers)
// @route   GET /api/quizzes/:id/full
// @access  Private (Teacher - own course only)
exports.getQuizFull = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('course', 'title instructor');

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found',
            });
        }

        // Check authorization
        const course = await Course.findById(quiz.course._id);
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view full quiz details',
            });
        }

        res.status(200).json({
            success: true,
            data: quiz,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Submit quiz attempt
// @route   POST /api/quizzes/:id/submit
// @access  Private (Student)
exports.submitQuiz = async (req, res) => {
    try {
        const { answers, timeTaken } = req.body; // answers: [{ questionId, selectedOptionIndex }]

        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found',
            });
        }

        // Calculate score
        let score = 0;
        const processedAnswers = [];

        answers.forEach(answer => {
            const question = quiz.questions.id(answer.questionId);

            if (question) {
                const isCorrect = question.correctOptionIndex === answer.selectedOptionIndex;
                const marksObtained = isCorrect ? question.marks : 0;
                score += marksObtained;

                processedAnswers.push({
                    questionId: answer.questionId,
                    selectedOptionIndex: answer.selectedOptionIndex,
                    isCorrect,
                    marksObtained,
                });
            }
        });

        const percentage = (score / quiz.totalMarks) * 100;
        const passed = percentage >= quiz.passingPercentage;

        // Save attempt
        const attempt = await QuizAttempt.create({
            student: req.user.id,
            quiz: quiz._id,
            answers: processedAnswers,
            score,
            totalMarks: quiz.totalMarks,
            percentage,
            passed,
            timeTaken,
        });

        // Populate with quiz details for response
        await attempt.populate('quiz', 'title passingPercentage');

        res.status(201).json({
            success: true,
            message: passed ? 'Congratulations! You passed the quiz.' : 'You did not pass. Try again!',
            data: {
                attempt,
                correctAnswers: quiz.questions.map(q => ({
                    questionId: q._id,
                    correctOptionIndex: q.correctOptionIndex,
                    explanation: q.explanation,
                })),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get student's quiz attempts
// @route   GET /api/quizzes/:id/attempts
// @access  Private (Student - own attempts)
exports.getMyAttempts = async (req, res) => {
    try {
        const attempts = await QuizAttempt.find({
            student: req.user.id,
            quiz: req.params.id,
        })
            .populate('quiz', 'title totalMarks passingPercentage')
            .sort({ attemptDate: -1 });

        res.status(200).json({
            success: true,
            count: attempts.length,
            data: attempts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get quiz analytics (for teachers)
// @route   GET /api/quizzes/:id/analytics
// @access  Private (Teacher - own course only)
exports.getQuizAnalytics = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('course');

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found',
            });
        }

        // Check authorization
        const course = await Course.findById(quiz.course._id);
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view quiz analytics',
            });
        }

        // Get all attempts for this quiz
        const attempts = await QuizAttempt.find({ quiz: quiz._id })
            .populate('student', 'name email');

        const totalAttempts = attempts.length;
        const passedAttempts = attempts.filter(a => a.passed).length;
        const averageScore = totalAttempts > 0
            ? attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts
            : 0;

        res.status(200).json({
            success: true,
            data: {
                quiz: {
                    title: quiz.title,
                    totalMarks: quiz.totalMarks,
                    passingPercentage: quiz.passingPercentage,
                },
                analytics: {
                    totalAttempts,
                    passedAttempts,
                    failedAttempts: totalAttempts - passedAttempts,
                    passRate: totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0,
                    averageScore: averageScore.toFixed(2),
                },
                attempts,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Teacher - own course only)
exports.updateQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('course');

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found',
            });
        }

        // Check authorization
        const course = await Course.findById(quiz.course._id);
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this quiz',
            });
        }

        const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: 'Quiz updated successfully',
            data: updatedQuiz,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Teacher - own course only)
exports.deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('course');

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found',
            });
        }

        // Check authorization
        const course = await Course.findById(quiz.course._id);
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this quiz',
            });
        }

        await quiz.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Quiz deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
