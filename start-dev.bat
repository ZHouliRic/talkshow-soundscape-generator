
@echo off
echo Starting servers...

REM Check if backend port is already in use
netstat -ano | findstr :3001 >nul
if %errorlevel% equ 0 (
  echo Error: Port 3001 is already in use. Please close the application using this port and try again.
  exit /b 1
)

REM Start the backend server
cd backend
start cmd /k "node server.js"

REM Wait for backend to start
timeout /t 2 /nobreak >nul

REM Check if backend started successfully
curl -s http://localhost:3001/health >nul
if %errorlevel% neq 0 (
  echo Error: Backend server failed to start properly. Check logs for details.
  exit /b 1
)

REM Start the frontend
cd ..
start cmd /k "npm run dev"

echo Servers started. Close the command windows to stop them.
