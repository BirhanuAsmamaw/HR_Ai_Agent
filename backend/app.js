const express = require('express');
const cors = require('cors');
require('dotenv').config();


const supabase = require('./config/supabase.config');
const errorHandler = require('./middleware/error.handler');
const { initScheduledJobs } = require('./utils/scheduler');
const aiRoutes = require('./routes/ai.routes');


const emailRoutes = require('./routes/email.routes');
const applicantRoutes = require('./routes/applicant.routes');
const jobRoutes = require('./routes/job.routes');
const hrRoutes = require('./routes/hr.routes');
const interviewRoutes = require('./routes/interview.routes');


const app = express();


const allowedOrigins = [
  'http://localhost:3000', 
  'https://hr-ai-agent-delta.vercel.app', // Your Vercel deployment
  process.env.FRONTEND_URL 
].filter(Boolean); // Remove empty values if env var is missing

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin); // Log the blocked origin for debugging
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


app.use(express.json({ limit: '10mb' }));


app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});


app.use('/api/emails', emailRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/hr', hrRoutes); 
app.use('/api/applicants', applicantRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/interviews', interviewRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'HR Assistant API is running',
    database: 'Supabase',
    connected: true
  });
});


initScheduledJobs();


app.use(errorHandler);

module.exports = { app, supabase };
