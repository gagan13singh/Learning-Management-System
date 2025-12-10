const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function testModel(modelName) {
    console.log(`\nTesting Model: ${modelName}...`);
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Reply 'OK'");
        console.log(`✅ ${modelName} SUCCESS!`);
        return true;
    } catch (error) {
        console.log(`❌ ${modelName} FAILED: ${error.status || error.message}`);
        return false;
    }
}

async function runTests() {
    const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];
    for (const m of models) {
        if (await testModel(m)) break;
    }
}

runTests();
