#!/bin/bash

# Simple startup script - no fancy checks, just start the servers

echo "Starting Cutting Board Guys Servers (Simple Mode)"
echo "================================================"

# Kill any existing processes on our ports
echo "Cleaning up ports..."
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 2

# Start backend
echo "Starting backend on port 3001..."
cd /Users/shawn/Desktop/CBG/CBG-new/backend
npm run dev &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait a bit for backend to start
sleep 5

# Start frontend
echo "Starting frontend on port 3000..."
cd /Users/shawn/Desktop/CBG/CBG-new/frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "================================================"
echo "Servers starting..."
echo "Backend:  http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "================================================"

# Handle shutdown
trap 'echo "Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT TERM

# Keep script running
wait