const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function testGemini() {
    console.log('--- Testing Gemini API ---');

    const key = process.env.GEMINI_API_KEY;
    console.log('API Key Present:', !!key);
    if (key) {
        console.log('API Key Length:', key.length);
        console.log('API Key Start:', key.substring(0, 5) + '...');
    } else {
        console.error('❌ Error: GEMINI_API_KEY is missing in .env');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(key);
        // Try gemini-pro first, then 1.5-flash
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log('Sending request to Gemini...');
        const result = await model.generateContent("Hello, strictly reply with 'OK' if you can hear me.");
        const response = await result.response;
        const text = response.text();

        console.log('✅ Success! Response:', text);
    } catch (error) {
        console.error('❌ API Error:');
        console.error(error);
        if (error.response) {
            console.error('Response Data:', JSON.stringify(error.response, null, 2));
        }
    }
}

testGemini();
