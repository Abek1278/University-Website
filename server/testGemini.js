const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listAvailableModels() {
  console.log('\n=== Listing Available Models ===\n');
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    const data = await response.json();
    
    if (data.models) {
      console.log('Available models:');
      data.models.forEach(model => {
        console.log(`- ${model.name} (${model.displayName})`);
      });
    } else {
      console.log('Error:', data);
    }
  } catch (error) {
    console.log('Failed to list models:', error.message);
  }
}

async function testModels() {
  console.log('Testing Gemini API with key:', process.env.GEMINI_API_KEY ? 'Key found ✓' : 'Key missing ✗');
  
  await listAvailableModels();
  
  console.log('\n=== Testing Available Models ===\n');

  const modelsToTest = [
    'gemini-pro',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
    'models/gemini-pro',
    'models/gemini-1.5-flash'
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent('Hi');
      const response = await result.response;
      const text = response.text();
      
      console.log(`✓ ${modelName} - WORKS`);
      console.log(`  Response: ${text}\n`);
    } catch (error) {
      console.log(`✗ ${modelName} - FAILED`);
      const errorMsg = error.message.substring(0, 150);
      console.log(`  Error: ${errorMsg}...\n`);
    }
  }

  console.log('\n=== Test Complete ===');
}

testModels();
