const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Chat with AI (Gemini)
// @route   POST /api/chat
// @access  Private (Student)
exports.chatWithAI = async (req, res) => {
    try {
        const { message, history } = req.body;
        console.log('💬 Chat Request:', { message, historyLength: history?.length });

        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ GEMINI_API_KEY is not set');
            return res.status(500).json({
                success: false,
                message: 'Server Configuration Error: GEMINI_API_KEY is missing.',
            });
        }

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a message',
            });
        }

        // System prompt to define behavior
        const systemPrompt = `You are a helpful AI assistant for a Learning Management System (LMS). 
        Your goal is to assist students with their learning journey.
        
        Follow these strict guidelines:
        1. **Academic Questions**: If the user asks about a study topic, concept, or assignment, provide a high-quality, structured answer. Use bullet points, examples, and clear explanations. Be concise but partial to detail where necessary.
        2. **Casual/Chit-Chat**: If the user says hello, asks how you are, or makes small talk, reply with a friendly, short, and engaging message. Do not be overly formal.
        3. **Motivational/Advice**: If the user asks for study tips or motivation, provide encouraging and actionable advice.
        4. **Sensitive/Unsafe Topics**: If the user asks about inappropriate, illegal, or harmful topics, politely refuse and redirect to learning. Say something like "I'm here to help you study! Let's focus on that."
        5. **Context**: You are inside a student dashboard. Keep your tone supportive and student-focused.
        6. **Formatting**: 
           - Use **Standard Markdown** (bold, italics, lists) for readability.
           - **DO NOT use LaTeX** (e.g., $$, \\(, \\text{}). logic. Users cannot render math symbols.
           - Instead of $$\\text{Voltage}$$ write *Voltage*.
           - Instead of $$x^2$$, write "x squared" or x^2 formatting.
           - Keep it simple and readable as plain text.

        Do not mention you are a model unless asked. You are the LMS Study Assistant.`;

        // Get the model - using 'gemini-flash-latest' as it's the stable alias for this account
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // Construct history in Gemini format
        const geminiHistory = (history || []).slice(-6).map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        // Start chat with history
        const chat = model.startChat({
            history: [
                ...geminiHistory
            ],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(systemPrompt + "\n\nUser Message: " + message);
        const response = result.response;
        const text = response.text();

        res.status(200).json({
            success: true,
            reply: text,
        });

    } catch (error) {
        console.error('AI Chat Error (Gemini):', error);

        let errorMessage = 'Failed to get response from AI';
        if (error.status === 404) {
            errorMessage = 'Model not found (404). Check API Key permissions or Region.';
        } else if (error.message.includes('API key not valid')) {
            errorMessage = 'Invalid API Key. Please check your .env file.';
        }

        res.status(500).json({
            success: false,
            message: errorMessage,
            error: error.message,
        });
    }
};
