#!/bin/bash

# Cutting Board Guys - Stop Script
# This script stops both servers cleanly

echo "================================================"
echo "   🥖 Cutting Board Guys - Stopping Servers"
echo "================================================"

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to kill processes on a port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}Stopping process on port $port (PID: $pids)...${NC}"
        kill -9 $pids 2>/dev/null
        echo -e "${GREEN}✓ Stopped${NC}"
    else
        echo -e "No process running on port $port"
    fi
}

# Stop using PID files if they exist
if [ -f "$SCRIPT_DIR/.backend.pid" ]; then
    BACKEND_PID=$(cat "$SCRIPT_DIR/.backend.pid")
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${YELLOW}Stopping backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}✓ Backend stopped${NC}"
    fi
    rm -f "$SCRIPT_DIR/.backend.pid"
fi

if [ -f "$SCRIPT_DIR/.frontend.pid" ]; then
    FRONTEND_PID=$(cat "$SCRIPT_DIR/.frontend.pid")
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${YELLOW}Stopping frontend (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}✓ Frontend stopped${NC}"
    fi
    rm -f "$SCRIPT_DIR/.frontend.pid"
fi

# Also kill by port as backup
echo -e "\n${YELLOW}Checking for remaining processes...${NC}"
kill_port 3001
kill_port 3000

echo ""
echo "================================================"
echo -e "${GREEN}✓ All servers stopped${NC}"
echo "================================================"