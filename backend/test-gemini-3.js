const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function testModel(modelName) {
    console.log(`\nTesting Model: ${modelName}...`);
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Reply 'OK'");
        const response = await result.response;
        console.log(`✅ ${modelName} SUCCESS! Response:`, response.text());
        return true;
    } catch (error) {
        console.log(`❌ ${modelName} FAILED: ${error.message}`);
        return false;
    }
}

async function runTests() {
    // List of models found in the HTTP check
    const models = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-exp",
        "gemini-flash-latest",
        "models/gemini-2.0-flash" // Try with prefix
    ];
    for (const m of models) {
        if (await testModel(m)) break;
    }
}

runTests();
