/* eslint-disable */
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

const modelsToTest = [
    "gemini-2.5-flash-lite",
    "gemini-flash-latest",
    "gemini-2.0-flash-lite-001",
    "gemini-1.5-flash-latest", // Just in case
    "gemini-pro-latest"
];

async function testModel(modelName) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        console.error("No API KEY found");
        return false;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = "Hi";

    try {
        process.stdout.write(`Testing ${modelName}... `);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(`✅ Success!`);
        return true;
    } catch (error) {
        if (error.message.includes("404")) {
            console.log(`❌ 404 Not Found`);
        } else if (error.message.includes("429")) {
            // If it says limit 0, it's effectively not allowed. If it says limit > 0 but exceeded, it's valid but busy.
            // The user saw "limit: 0", so we treat 429 as failure if it implies no quota.
            console.log(`❌ 429 Quota Exceeded / Rate Limit`);
        } else {
            console.log(`❌ Error: ${error.message.split('\n')[0]}`);
        }
        return false;
    }
}

async function runTests() {
    console.log("Starting model availability tests...");
    for (const model of modelsToTest) {
        const success = await testModel(model);
        if (success) {
            console.log(`\n🎉 Found working model: ${model}`);
            console.log("Recommendation: Update code to use this model.");
            return;
        }
    }
    console.log("\n⚠️ No working models found in the test list.");
}

runTests();
