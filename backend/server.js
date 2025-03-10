
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend requests
app.use(cors());
app.use(express.json());

// Play.ai API endpoints
const API_BASE_URL = 'https://play.ht/api/v2';

// Validate required environment variables
if (!process.env.PLAY_AI_USER_ID || !process.env.PLAY_AI_SECRET_KEY) {
  console.error('⚠️ Required environment variables are missing!');
  console.error('Make sure to copy .env.example to .env and fill in PLAY_AI_USER_ID and PLAY_AI_SECRET_KEY');
}

// Route to handle speech generation
app.post('/api/generate-speech', async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    // Use API credentials from environment variables, fallback to request body if not available
    const userId = process.env.PLAY_AI_USER_ID || req.body.userId;
    const apiKey = process.env.PLAY_AI_SECRET_KEY || req.body.apiKey;
    
    if (!userId || !apiKey) {
      return res.status(400).json({ 
        error: 'Missing credentials', 
        message: 'PLAY_AI_USER_ID and PLAY_AI_SECRET_KEY must be provided in .env file or request body' 
      });
    }
    
    console.log('Generating speech for text:', text.substring(0, 50) + '...');
    console.log('Using voice ID:', voiceId);
    
    // Make request to Play.ai API
    const response = await axios.post(`${API_BASE_URL}/tts`, {
      text,
      voice: voiceId,
      quality: "premium",
      output_format: "mp3"
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-User-ID': userId,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Speech generation started, task ID:', response.data.id);
    res.json({ taskId: response.data.id });
  } catch (error) {
    console.error('Error generating speech:', error.response?.data || error.message);
    
    // Provide more detailed error information to client
    const errorDetails = error.response?.data || { error: error.message };
    res.status(500).json({ 
      error: 'Failed to generate speech', 
      details: errorDetails,
      message: error.message
    });
  }
});

// Route to check speech generation status
app.get('/api/speech-status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    // Use API credentials from environment variables
    const userId = process.env.PLAY_AI_USER_ID || req.query.userId;
    const apiKey = process.env.PLAY_AI_SECRET_KEY || req.query.apiKey;
    
    if (!userId || !apiKey) {
      return res.status(400).json({ 
        error: 'Missing credentials', 
        message: 'PLAY_AI_USER_ID and PLAY_AI_SECRET_KEY must be provided in .env file or query parameters' 
      });
    }
    
    console.log(`Checking status for task: ${taskId}`);
    
    // Headers for Play.ai API
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'X-User-ID': userId
    };
    
    const response = await axios.get(`${API_BASE_URL}/tts/${taskId}`, { headers });
    console.log(`Status for task ${taskId}:`, response.data.status);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error checking speech status:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to check speech status', 
      details: error.response?.data || error.message 
    });
  }
});

// Route to download audio file (proxy to avoid CORS)
app.get('/api/download-audio', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'Audio URL is required' });
    }
    
    console.log('Downloading audio from URL:', url);
    
    const response = await axios.get(url.toString(), {
      responseType: 'arraybuffer'
    });
    
    // Set headers for audio file
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(response.data);
  } catch (error) {
    console.error('Error downloading audio:', error.message);
    res.status(500).json({ error: 'Failed to download audio' });
  }
});

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    playAiCredentials: {
      userId: process.env.PLAY_AI_USER_ID ? 'Configured' : 'Missing',
      apiKey: process.env.PLAY_AI_SECRET_KEY ? 'Configured' : 'Missing'
    }
  });
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('- POST /api/generate-speech');
  console.log('- GET /api/speech-status/:taskId');
  console.log('- GET /api/download-audio?url=URL');
  console.log('- GET /health');
  console.log('');
  console.log('Play.ai credentials status:');
  console.log(`- User ID: ${process.env.PLAY_AI_USER_ID ? 'Configured ✅' : 'Missing ❌'}`);
  console.log(`- API Key: ${process.env.PLAY_AI_SECRET_KEY ? 'Configured ✅' : 'Missing ❌'}`);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please use a different port or close the application using this port.`);
  } else {
    console.error('Server error:', err.message);
  }
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  // Don't exit the process, just log the error
});
