#!/bin/bash

echo "========================================="
echo "Starting Cutting Board Guys Servers"
echo "========================================="

# Kill any existing processes on the ports
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 2

# Start Backend
echo "Starting Backend Server (Port 3001)..."
cd backend
npx ts-node src/index.ts &
BACKEND_PID=$!
cd ..

# Wait for backend
sleep 5

# Start Frontend
echo "Starting Frontend Server (Port 3000)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================="
echo "✅ Servers Started!"
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo "========================================="
echo ""
echo "Press Ctrl+C to stop servers"

# Keep script running
wait
