const Todo = require('../models/Todo');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Test = require('../models/Test');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Get all todos (Smart aggregated list)
// @route   GET /api/todos
// @access  Private
exports.getTodos = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get Manual Todos (Pending only)
        const manualTodos = await Todo.find({ user: userId, isCompleted: false }).lean();
        const formattedManual = manualTodos.map(t => ({
            id: t._id,
            title: t.title,
            dueDate: t.dueDate,
            type: 'manual',
            status: 'pending',
            priority: t.priority,
            description: t.description,
            isCompleted: false,
            sourceId: t._id
        }));

        // 2. Get Enrollments (to find active courses)
        const enrollments = await Enrollment.find({ student: userId, status: 'active' });
        const courseIds = enrollments.map(e => e.course);

        // 3. Get Pending Assignments
        // Fetch assignments due in the future (or recently overdue - last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const assignments = await Assignment.find({
            course: { $in: courseIds },
            dueDate: { $gte: thirtyDaysAgo }
        }).lean();

        // Check which ones are submitted
        const submissions = await AssignmentSubmission.find({
            student: userId,
            assignment: { $in: assignments.map(a => a._id) }
        }).select('assignment').lean();

        const submittedAssignmentIds = new Set(submissions.map(s => s.assignment.toString()));

        const autoAssignments = assignments
            .filter(a => !submittedAssignmentIds.has(a._id.toString()))
            .map(a => ({
                id: `assign-${a._id}`,
                title: `Submit Assignment: ${a.title}`,
                dueDate: a.dueDate,
                type: 'assignment',
                courseId: a.course,
                description: a.description,
                status: 'pending',
                sourceId: a._id
            }));

        // 4. Get Upcoming Tests/Quizzes
        const upcomingTests = await Test.find({
            course: { $in: courseIds },
            date: { $gte: new Date() } // Only future tests
        }).lean();

        const autoTests = upcomingTests.map(t => ({
            id: `test-${t._id}`,
            title: `Revise: ${t.title}`,
            dueDate: t.date,
            type: 'test',
            courseId: t.course,
            status: 'pending',
            sourceId: t._id
        }));

        // 5. New Course Resources (Videos) - Added in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Fetch courses with their modules and lectures
        const activeCourses = await Course.find({
            _id: { $in: courseIds }
        }).select('modules title').lean();

        let newResources = [];

        activeCourses.forEach(course => {
            if (course.modules) {
                course.modules.forEach(module => {
                    if (module.lectures) {
                        module.lectures.forEach(lecture => {
                            // lecture.createdAt is available because of { timestamps: true } in lectureSchema
                            if (lecture.createdAt && new Date(lecture.createdAt) >= sevenDaysAgo) {
                                // Check if already completed by student
                                const enrollment = enrollments.find(e => e.course.toString() === course._id.toString());
                                const isCompleted = enrollment?.completedLectures?.some(cl => cl.lectureId === lecture._id.toString());

                                if (!isCompleted) {
                                    newResources.push({
                                        id: `res-${lecture._id}`,
                                        title: `Watch video: ${lecture.title}`,
                                        dueDate: null, // Resources usually don't have hard due dates
                                        type: 'resource',
                                        courseId: course._id,
                                        status: 'pending',
                                        sourceId: lecture._id,
                                        isNew: true
                                    });
                                }
                            }
                        });
                    }
                });
            }
        });

        // 6. Combine all tasks
        const combinedTodos = [
            ...formattedManual,
            ...autoAssignments,
            ...autoTests,
            ...newResources
        ];

        // Sort by Due Date (Ascending). Items without due date go to the bottom.
        combinedTodos.sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });

        res.status(200).json({
            success: true,
            count: combinedTodos.length,
            data: combinedTodos
        });
    } catch (error) {
        console.error('Error fetching smart todos:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error fetching todos'
        });
    }
};

// @desc    Create a manual todo
// @route   POST /api/todos
// @access  Private
exports.createTodo = async (req, res) => {
    try {
        req.body.user = req.user.id;

        const todo = await Todo.create(req.body);

        res.status(201).json({
            success: true,
            data: {
                ...todo.toObject(),
                id: todo._id,
                type: 'manual',
                sourceId: todo._id
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Update todo (Mark as completed or edit)
// @route   PUT /api/todos/:id
// @access  Private
exports.updateTodo = async (req, res) => {
    try {
        let todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo item not found'
            });
        }

        // Make sure user owns todo
        if (todo.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this todo'
            });
        }

        todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: {
                ...todo.toObject(),
                id: todo._id,
                type: 'manual',
                sourceId: todo._id
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Delete manual todo
// @route   DELETE /api/todos/:id
// @access  Private
exports.deleteTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo item not found'
            });
        }

        // Make sure user owns todo
        if (todo.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this todo'
            });
        }

        await todo.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
