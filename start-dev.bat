
@echo off
echo Starting servers...

REM Start the backend server
start cmd /k "cd backend && npm start"

REM Start the frontend
start cmd /k "npm run dev"

echo Servers started. Close the command windows to stop them.
