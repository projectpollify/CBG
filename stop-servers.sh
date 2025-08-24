#!/bin/bash

# Cutting Board Guys - Server Shutdown Script

echo "========================================="
echo "Stopping Cutting Board Guys Servers"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_DIR="/Users/shawn/Desktop/CBG/CBG-new"

# Function to kill process on port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port)
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}Killing process on port $port (PIDs: $pids)${NC}"
        kill -9 $pids 2>/dev/null
        echo -e "${GREEN}✓ Port $port cleared${NC}"
    else
        echo -e "${YELLOW}No process found on port $port${NC}"
    fi
}

# Kill saved PIDs if they exist
if [ -f "$BASE_DIR/.backend.pid" ]; then
    PID=$(cat "$BASE_DIR/.backend.pid")
    echo -e "${YELLOW}Stopping backend server (PID: $PID)...${NC}"
    kill $PID 2>/dev/null
    rm "$BASE_DIR/.backend.pid"
fi

if [ -f "$BASE_DIR/.frontend.pid" ]; then
    PID=$(cat "$BASE_DIR/.frontend.pid")
    echo -e "${YELLOW}Stopping frontend server (PID: $PID)...${NC}"
    kill $PID 2>/dev/null
    rm "$BASE_DIR/.frontend.pid"
fi

# Kill by port as backup
echo -e "\n${YELLOW}Cleaning up ports...${NC}"
kill_port 3001
kill_port 3000

# Kill any remaining Node.js processes related to the project
echo -e "\n${YELLOW}Cleaning up any remaining Node processes...${NC}"
pkill -f "ts-node.*CBG-new" 2>/dev/null
pkill -f "next.*CBG-new" 2>/dev/null

echo -e "\n========================================="
echo -e "${GREEN}✓ All servers stopped successfully${NC}"
echo -e "========================================="