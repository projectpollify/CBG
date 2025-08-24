#!/bin/bash

# Cutting Board Guys - Server Startup Script
# This script starts both backend and frontend servers without using npm

echo "========================================="
echo "Starting Cutting Board Guys Servers"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base directory
BASE_DIR="/Users/shawn/Desktop/CBG/CBG-new"

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port)
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}Killing existing process on port $port${NC}"
        kill -9 $pids 2>/dev/null
        sleep 2
    fi
}

# Clean up any existing processes
echo -e "${YELLOW}Cleaning up existing processes...${NC}"
kill_port 3001
kill_port 3000

# Start Backend Server
echo -e "\n${GREEN}Starting Backend Server (Port 3001)...${NC}"
cd "$BASE_DIR/backend"

# Use npx directly to bypass npm issues
npx ts-node src/index.ts &
BACKEND_PID=$!

echo -e "${GREEN}Backend server starting with PID: $BACKEND_PID${NC}"

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend to be ready...${NC}"
sleep 5

# Check if backend is running
if check_port 3001; then
    echo -e "${GREEN}✓ Backend server is running on port 3001${NC}"
else
    echo -e "${RED}✗ Backend server failed to start${NC}"
    echo -e "${YELLOW}Trying alternative startup method...${NC}"
    
    # Alternative: Use node directly
    node -r ts-node/register src/index.ts &
    BACKEND_PID=$!
    sleep 5
    
    if check_port 3001; then
        echo -e "${GREEN}✓ Backend server started with alternative method${NC}"
    else
        echo -e "${RED}✗ Backend server failed to start. Check error messages above.${NC}"
        exit 1
    fi
fi

# Start Frontend Server
echo -e "\n${GREEN}Starting Frontend Server (Port 3000)...${NC}"
cd "$BASE_DIR/frontend"

# Use npx directly to bypass npm issues
npx next dev &
FRONTEND_PID=$!

echo -e "${GREEN}Frontend server starting with PID: $FRONTEND_PID${NC}"

# Wait for frontend to be ready
echo -e "${YELLOW}Waiting for frontend to be ready...${NC}"
sleep 10

# Check if frontend is running
if check_port 3000; then
    echo -e "${GREEN}✓ Frontend server is running on port 3000${NC}"
else
    echo -e "${RED}✗ Frontend server failed to start${NC}"
    echo -e "${YELLOW}Trying alternative startup method...${NC}"
    
    # Alternative: Use node directly with Next.js
    node node_modules/.bin/next dev &
    FRONTEND_PID=$!
    sleep 10
    
    if check_port 3000; then
        echo -e "${GREEN}✓ Frontend server started with alternative method${NC}"
    else
        echo -e "${RED}✗ Frontend server failed to start. Check error messages above.${NC}"
        exit 1
    fi
fi

# Save PIDs to file for easy shutdown later
echo "$BACKEND_PID" > "$BASE_DIR/.backend.pid"
echo "$FRONTEND_PID" > "$BASE_DIR/.frontend.pid"

echo -e "\n========================================="
echo -e "${GREEN}✓ Both servers are running!${NC}"
echo -e "========================================="
echo -e "${GREEN}Backend:${NC}  http://localhost:3001"
echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
echo -e "\n${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo -e "========================================="

# Function to handle shutdown
shutdown_servers() {
    echo -e "\n${YELLOW}Shutting down servers...${NC}"
    
    if [ -f "$BASE_DIR/.backend.pid" ]; then
        kill $(cat "$BASE_DIR/.backend.pid") 2>/dev/null
        rm "$BASE_DIR/.backend.pid"
    fi
    
    if [ -f "$BASE_DIR/.frontend.pid" ]; then
        kill $(cat "$BASE_DIR/.frontend.pid") 2>/dev/null
        rm "$BASE_DIR/.frontend.pid"
    fi
    
    # Also kill by port as backup
    kill_port 3001
    kill_port 3000
    
    echo -e "${GREEN}Servers stopped${NC}"
    exit 0
}

# Set up trap to handle Ctrl+C
trap shutdown_servers INT TERM

# Keep script running and show logs
tail -f /dev/null