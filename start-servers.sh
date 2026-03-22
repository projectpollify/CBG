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
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base directory - Updated for WSL2 Linux filesystem (much faster!)
BASE_DIR="/home/shawn/projects/cbgwebapp"

# Function to check if PostgreSQL is running
check_postgres() {
    if pg_isready -q 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to start PostgreSQL
start_postgres() {
    echo -e "\n${BLUE}Checking PostgreSQL database...${NC}"

    if check_postgres; then
        echo -e "${GREEN}✓ PostgreSQL is already running${NC}"
        return 0
    fi

    echo -e "${YELLOW}PostgreSQL is not running. Attempting to start...${NC}"

    # Try to start PostgreSQL service (requires sudo)
    if sudo -n service postgresql start 2>/dev/null; then
        sleep 2
        if check_postgres; then
            echo -e "${GREEN}✓ PostgreSQL started successfully${NC}"
            return 0
        fi
    fi

    echo -e "${RED}✗ Failed to start PostgreSQL automatically${NC}"
    echo -e "${YELLOW}Please run: ${BLUE}sudo service postgresql start${NC}"
    echo -e "${YELLOW}Then run this script again.${NC}"
    exit 1
}

# Function to check if port is in use (WSL2-compatible)
check_port() {
    local port=$1
    # Simple check: just look for the port number in listening state
    if ss -tuln 2>/dev/null | grep -qE ":\s*$port\s"; then
        return 0
    elif ss -tuln 2>/dev/null | grep -q ":$port"; then
        return 0
    elif lsof -i :$port 2>/dev/null | grep -q LISTEN; then
        return 0
    else
        return 1
    fi
}

# Function to wait for port with timeout and HTTP health check
wait_for_port() {
    local port=$1
    local timeout=$2
    local elapsed=0

    echo -e "${YELLOW}Waiting for port $port (timeout: ${timeout}s)...${NC}"

    while [ $elapsed -lt $timeout ]; do
        # First check if port is listening
        if check_port $port; then
            # For backend, also verify HTTP health endpoint
            if [ "$port" = "3001" ]; then
                if curl -s -f http://localhost:3001/api/health > /dev/null 2>&1; then
                    echo ""
                    return 0
                else
                    echo -n "h"  # h for HTTP wait
                fi
            else
                # For frontend, just check port
                echo ""
                return 0
            fi
        else
            echo -n "."
        fi
        sleep 2
        elapsed=$((elapsed + 2))
    done
    echo ""
    return 1
}

# Function to kill process on port (WSL2-compatible)
kill_port() {
    local port=$1
    # Try lsof first, then fall back to fuser
    local pids=$(lsof -ti:$port 2>/dev/null || fuser $port/tcp 2>/dev/null | awk '{print $1}')
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}Killing existing process on port $port (PIDs: $pids)${NC}"
        kill -9 $pids 2>/dev/null
        sleep 2
    fi
}

# Start PostgreSQL database first
start_postgres

# Clean up any existing processes
echo -e "\n${YELLOW}Cleaning up existing processes...${NC}"
kill_port 3001
kill_port 3000

# Start Backend Server
echo -e "\n${GREEN}Starting Backend Server (Port 3001)...${NC}"
cd "$BASE_DIR/backend"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Backend dependencies not found. Installing...${NC}"
    npm install
fi

# Generate Prisma client if needed
if [ ! -d "node_modules/.prisma/client" ]; then
    echo -e "${YELLOW}Generating Prisma client...${NC}"
    npx prisma generate
fi

# Use npx directly to bypass npm issues, with explicit node options for better stability
export NODE_ENV=development
npx ts-node --transpile-only src/index.ts > "$BASE_DIR/.backend.log" 2>&1 &
BACKEND_PID=$!

echo -e "${GREEN}Backend server starting with PID: $BACKEND_PID${NC}"

# Give the process a moment to start before checking
sleep 3

# Check if process is still running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}✗ Backend process died immediately${NC}"
    echo -e "${YELLOW}Backend log:${NC}"
    cat "$BASE_DIR/.backend.log" 2>/dev/null || echo "No log file found"
    exit 1
fi

# Wait for backend to be ready with proper timeout
if wait_for_port 3001 45; then
    echo -e "\n${GREEN}✓ Backend server is running on port 3001${NC}"
    # Test the health endpoint
    if curl -s -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend health check passed${NC}"
    fi
else
    echo -e "${RED}✗ Backend server failed to start within 45 seconds${NC}"
    echo -e "${YELLOW}Backend log:${NC}"
    cat "$BASE_DIR/.backend.log" 2>/dev/null || echo "No log file found"

    # Check if process is still running
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${YELLOW}Process is still running but not responding on port 3001${NC}"
    else
        echo -e "${RED}Backend process died${NC}"
    fi
    exit 1
fi

# Start Frontend Server
echo -e "\n${GREEN}Starting Frontend Server (Port 3000)...${NC}"
cd "$BASE_DIR/frontend"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Frontend dependencies not found. Installing...${NC}"
    npm install
fi

# Use npx directly to bypass npm issues
export NODE_ENV=development
npx next dev > "$BASE_DIR/.frontend.log" 2>&1 &
FRONTEND_PID=$!

echo -e "${GREEN}Frontend server starting with PID: $FRONTEND_PID${NC}"

# Give the process a moment to start before checking
sleep 3

# Check if process is still running
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}✗ Frontend process died immediately${NC}"
    echo -e "${YELLOW}Frontend log:${NC}"
    cat "$BASE_DIR/.frontend.log" 2>/dev/null || echo "No log file found"
    exit 1
fi

# Wait for frontend to be ready with proper timeout (Next.js needs more time)
if wait_for_port 3000 60; then
    echo -e "\n${GREEN}✓ Frontend server is running on port 3000${NC}"
else
    echo -e "${RED}✗ Frontend server failed to start within 60 seconds${NC}"
    echo -e "${YELLOW}Last 20 lines of frontend log:${NC}"
    tail -20 "$BASE_DIR/.frontend.log" 2>/dev/null || echo "No log file found"

    # Check if process is still running
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${YELLOW}Process is still running but not responding on port 3000${NC}"
    else
        echo -e "${RED}Frontend process died${NC}"
    fi
    exit 1
fi

# Save PIDs to file for easy shutdown later
echo "$BACKEND_PID" > "$BASE_DIR/.backend.pid"
echo "$FRONTEND_PID" > "$BASE_DIR/.frontend.pid"

echo -e "\n========================================="
echo -e "${GREEN}✓ All services are running!${NC}"
echo -e "========================================="
echo -e "${GREEN}Database:${NC} PostgreSQL (Port 5432)"
echo -e "${GREEN}Backend:${NC}  http://localhost:3001"
echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
echo -e "\n${BLUE}API Health:${NC} http://localhost:3001/api/health"
echo -e "${BLUE}Test DB:${NC}    http://localhost:3001/api/test-db"
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