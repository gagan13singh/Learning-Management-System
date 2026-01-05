const { GoogleGenerativeAI } = require("@google/generative-ai");
const Test = require('../models/Test');
const Assignment = require('../models/Assignment');
const Todo = require('../models/Todo');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to clean JSON string from Markdown
const cleanJson = (text) => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

// @desc    Generate a personalized study plan
// @route   POST /api/ai/study-plan
// @access  Private
const generateStudyPlan = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Fetch relevant data
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        const [tests, assignments, todos] = await Promise.all([
            Test.find({
                // course: { $in: req.user.enrolledCourses } // Assuming user enrollment logic exists, strict filtering for simplicity
                date: { $gte: today }
            }).limit(5).lean(),
            Assignment.find({
                dueDate: { $gte: today }
            }).limit(5).lean(),
            Todo.find({ user: userId, isCompleted: false }).limit(10).lean()
        ]);

        // 2. Construct Prompt
        const dataContext = {
            currentDate: today.toDateString(),
            upcomingTests: tests.map(t => ({ title: t.title, date: t.date, syllabus: t.syllabus })),
            upcomingAssignments: assignments.map(a => ({ title: a.title, date: a.dueDate })),
            pendingTasks: todos.map(t => ({ title: t.title, type: t.type }))
        };

        const prompt = `
            You are an expert AI Study Planner.
            Create a realistic, adaptive 3-day study plan for a student based on the following schedule:
            ${JSON.stringify(dataContext)}

            Rules:
            1. Prioritize upcoming Tests.
            2. Break down syllabi into small tasks.
            3. Keep descriptions concise (< 10 words).
            4. Output STRICTLY VALID JSON in the following format:
            [
                {
                    "day": "Monday",
                    "focus": "Maths",
                    "tasks": [
                        { "time": "20m", "activity": "Revise Integration" }
                    ]
                }
            ]
            Do not include markdown.
        `;

        // 3. Call Gemini
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { maxOutputTokens: 2000 }
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 4. Parse and Send
        try {
            const plan = JSON.parse(cleanJson(text));
            res.status(200).json({ success: true, plan });
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError, text);
            res.status(500).json({ success: false, message: "AI generated invalid format", raw: text });
        }

    } catch (error) {
        console.error("Study Plan Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Generate a topic-specific quiz
// @route   POST /api/ai/practice-quiz
// @access  Private
const generatePracticeQuiz = async (req, res) => {
    try {
        const { topic, subject } = req.body;

        if (!topic) {
            return res.status(400).json({ success: false, message: "Topic is required" });
        }

        const prompt = `
            Generate a personalized practice quiz for a student on the topic: "${topic}" ${subject ? `in subject: ${subject}` : ''}.
            
            Requirements:
            1. Generate 5 Multiple Choice Questions (MCQs).
            2. Generate 3 Short Numerical/Conceptual problems (just the question).
            3. Output STRICTLY VALID JSON in this format:
            {
                "mcqs": [
                    { "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "..." }
                ],
                "numericals": [
                    { "question": "...", "hint": "..." }
                ]
            }
            Do not include markdown.
        `;

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { maxOutputTokens: 1500 }
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            const quiz = JSON.parse(cleanJson(text));
            res.status(200).json({ success: true, quiz });
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError, text);
            res.status(500).json({ success: false, message: "AI generated invalid format", raw: text });
        }

    } catch (error) {
        console.error("Quiz Gen Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Resolve student doubt using AI
// @route   POST /api/ai/resolve-doubt
// @access  Private
const generateDoubtResolution = async (req, res) => {
    try {
        const { query, context } = req.body; // context can be lecture title, course name, etc.

        if (!query) {
            return res.status(400).json({ success: false, message: "Query is required" });
        }

        const prompt = `
            You are an expert academic tutor.
            A student has asked the following doubt:
            "${query}"
            
            Context: ${context || 'General Doubt'}
            
            Please provide a clear, concise, and accurate explanation.
            - Use LaTeX for any mathematical formulas (enclose in $$ for block or $ for inline).
            - Break down complex concepts into simple steps.
            - Keep the tone encouraging and educational.
            - If the query is irrelevant to academics, politely refuse.
            
            Response:
        `;

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { maxOutputTokens: 1000 }
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ success: true, answer: text });

    } catch (error) {
        console.error("Doubt Resolution Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    generateStudyPlan,
    generatePracticeQuiz,
    generateDoubtResolution
};
