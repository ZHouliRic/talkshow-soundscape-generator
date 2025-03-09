
# Talkshow Soundscape Generator Backend

This is the backend server for the Talkshow Soundscape Generator application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on the `.env.example` file:
```bash
cp .env.example .env
```

3. Start the server:
```bash
npm start
```

## Available Endpoints

- `POST /api/generate-speech` - Generate speech from text
- `GET /api/speech-status/:taskId` - Check the status of a speech generation task
- `GET /api/download-audio?url=URL` - Download audio file (proxy to avoid CORS)
- `GET /health` - Simple health check endpoint

## Environment Variables

- `PORT` - Port to run the server on (default: 3001)
- `PLAY_AI_USER_ID` - Play.ai user ID
- `PLAY_AI_SECRET_KEY` - Play.ai API key
