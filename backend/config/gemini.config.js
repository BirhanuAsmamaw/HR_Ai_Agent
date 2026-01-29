require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in .env');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash-preview-09-2025';



const model = genAI.getGenerativeModel({ 
  model: modelName
});

module.exports = { genAI, model };
