#!/bin/bash

echo "🚀 Starting Cutting Board Guys Servers..."
echo "========================================="

# Kill any existing processes on our ports
echo "📦 Cleaning up old processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Start Backend
echo "🔧 Starting Backend Server (Port 3001)..."
cd backend
npx tsx src/index.ts &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start Frontend
echo "🎨 Starting Frontend Server (Port 3000)..."
cd ../frontend
npx next dev &
FRONTEND_PID=$!

echo "========================================="
echo "✅ Servers are starting up!"
echo "   Backend:  http://localhost:3001"
echo "   Frontend: http://localhost:3000"
echo "========================================="
echo "Press Ctrl+C to stop all servers"

# Wait and handle shutdown
trap "echo '🛑 Shutting down servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Keep script running
wait