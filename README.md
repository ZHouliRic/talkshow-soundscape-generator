
# Talkshow Soundscape Generator

A web application that generates talkshow audio from text scripts with sound effects.

## Project info

**URL**: https://lovable.dev/projects/bf2f569e-6e68-49c4-8238-a9312f9b846c

## Quick Start

To run this project locally, follow these steps:

### On Windows:

1. Clone the repository:
```
git clone https://github.com/ZHouliRic/talkshow-soundscape-generator.git
cd talkshow-soundscape-generator
```

2. Install frontend dependencies:
```
npm install
```

3. Set up the backend:
```
cd backend
npm install
cp .env.example .env
cd ..
```

4. Start both servers (frontend and backend):
```
start-dev.bat
```

### On macOS/Linux:

1. Clone the repository:
```
git clone https://github.com/ZHouliRic/talkshow-soundscape-generator.git
cd talkshow-soundscape-generator
```

2. Install frontend dependencies:
```
npm install
```

3. Set up the backend:
```
cd backend
npm install
cp .env.example .env
cd ..
```

4. Make the start script executable and run it:
```
chmod +x start-dev.sh
./start-dev.sh
```

The application will be running at:
- Frontend: http://localhost:8080
- Backend: http://localhost:3001

## Setting up the Play.ai API

This project uses Play.ai API for text-to-speech. The backend server acts as a proxy to avoid CORS issues and to securely handle the API credentials.

The default credentials are included in the .env examples, but you may want to use your own credentials for production use.

## Deploying to Production

### Frontend Deployment

1. Build the frontend:
```
npm run build
```

2. Deploy the contents of the `dist` folder to your preferred hosting service (Netlify, Vercel, GitHub Pages, etc.)

3. Set the `VITE_BACKEND_URL` environment variable to point to your deployed backend URL.

### Backend Deployment

1. Deploy the `backend` folder to a Node.js hosting service (Heroku, Railway, Render, etc.)

2. Set the environment variables (`PLAY_AI_USER_ID`, `PLAY_AI_SECRET_KEY`, etc.) in your hosting service.

## Available Scripts

In the project directory, you can run:

- `npm run dev` - Starts the frontend development server
- `npm run build` - Builds the app for production
- `npm run preview` - Locally preview the production build

In the backend directory:
- `npm start` - Starts the backend server
- `npm run dev` - Starts the backend server with auto-restart on changes (requires nodemon)
