
#!/bin/bash

# Function to check if a port is in use
function is_port_in_use() {
  if command -v lsof >/dev/null 2>&1; then
    lsof -i:$1 >/dev/null 2>&1
  elif command -v netstat >/dev/null 2>&1; then
    netstat -tuln | grep -q ":$1 "
  else
    echo "Warning: Cannot check if port is in use (neither lsof nor netstat found)"
    return 1
  fi
}

# Check if backend port is already in use
if is_port_in_use 3001; then
  echo "Error: Port 3001 is already in use. Please close the application using this port and try again."
  exit 1
fi

# Start the backend server
echo "Starting backend server..."
cd backend && node server.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Check if backend started successfully
if ! curl -s http://localhost:3001/health >/dev/null; then
  echo "Error: Backend server failed to start properly. Check logs for details."
  kill $BACKEND_PID 2>/dev/null
  exit 1
fi

# Start the frontend
echo "Starting frontend dev server..."
cd .. && npm run dev &
FRONTEND_PID=$!

# Function to kill processes on exit
function cleanup {
  echo "Stopping servers..."
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  exit
}

# Trap Ctrl-C and call cleanup
trap cleanup SIGINT

echo "Both servers are running. Press Ctrl-C to stop."

# Wait for both processes
wait
