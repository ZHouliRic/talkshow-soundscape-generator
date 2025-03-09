
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/bf2f569e-6e68-49c4-8238-a9312f9b846c

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/bf2f569e-6e68-49c4-8238-a9312f9b846c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Setting up the backend server (for Play.ai API integration)

This project uses a backend server to handle Play.ai API requests and avoid CORS issues. To set it up locally:

1. Create a new directory for the backend server:

```sh
mkdir -p backend && cd backend
```

2. Initialize a new Node.js project:

```sh
npm init -y
```

3. Install the required dependencies:

```sh
npm install express cors axios dotenv
```

4. Create a file named `server.js` with the following content:

```javascript
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend requests
app.use(cors());
app.use(express.json());

// Play.ai API endpoints
const API_BASE_URL = 'https://play.ht/api/v2';

// Route to handle speech generation
app.post('/api/generate-speech', async (req, res) => {
  try {
    const { text, voiceId, userId, apiKey } = req.body;
    
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
    
    res.json({ taskId: response.data.id });
  } catch (error) {
    console.error('Error generating speech:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to generate speech', 
      details: error.response?.data || error.message 
    });
  }
});

// Route to check speech generation status
app.get('/api/speech-status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId, apiKey } = req.query;
    
    // Get Play.ai API headers from request or use env variables
    const headers = {
      'Authorization': `Bearer ${apiKey || process.env.PLAY_AI_SECRET_KEY}`,
      'X-User-ID': userId || process.env.PLAY_AI_USER_ID
    };
    
    const response = await axios.get(`${API_BASE_URL}/tts/${taskId}`, { headers });
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

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
```

5. Create a start script to run both frontend and backend:

Create a file named `start-dev.sh` in the root directory:

```sh
#!/bin/bash
# Start the backend server
cd backend && npm start &
# Start the frontend
cd .. && npm run dev
```

Make it executable:

```sh
chmod +x start-dev.sh
```

6. Run the development environment:

```sh
./start-dev.sh
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/bf2f569e-6e68-49c4-8238-a9312f9b846c) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
