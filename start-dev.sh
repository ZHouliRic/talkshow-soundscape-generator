
#!/bin/bash

# Start the backend server
echo "Starting backend server..."
cd backend && npm start &
BACKEND_PID=$!

# Start the frontend
echo "Starting frontend dev server..."
cd .. && npm run dev &
FRONTEND_PID=$!

# Function to kill processes on exit
function cleanup {
  echo "Stopping servers..."
  kill $BACKEND_PID
  kill $FRONTEND_PID
  exit
}

# Trap Ctrl-C and call cleanup
trap cleanup SIGINT

# Wait for both processes
wait
