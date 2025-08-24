#!/bin/bash

# Cutting Board Guys - Enhanced Server Startup Script with Dependency Checking
# This script verifies all dependencies before starting servers

echo "========================================="
echo "Cutting Board Guys - Server Startup"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base directory
BASE_DIR="/Users/shawn/Desktop/CBG/CBG-new"

# Dependency tracking
MISSING_DEPS=()
WARNINGS=()

# ============================================
# DEPENDENCY CHECKING FUNCTIONS
# ============================================

# Check if a command exists
check_command() {
    local cmd=$1
    local friendly_name=$2
    local install_hint=$3
    
    if command -v $cmd &> /dev/null; then
        echo -e "  ${GREEN}✓${NC} $friendly_name found: $(command -v $cmd)"
        return 0
    else
        echo -e "  ${RED}✗${NC} $friendly_name NOT found"
        if [ ! -z "$install_hint" ]; then
            echo -e "    ${YELLOW}Install with: $install_hint${NC}"
        fi
        MISSING_DEPS+=("$friendly_name")
        return 1
    fi
}

# Check if a file exists
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $description exists"
        return 0
    else
        echo -e "  ${RED}✗${NC} $description NOT found at: $file"
        MISSING_DEPS+=("$description")
        return 1
    fi
}

# Check if a directory exists
check_directory() {
    local dir=$1
    local description=$2
    
    if [ -d "$dir" ]; then
        echo -e "  ${GREEN}✓${NC} $description exists"
        return 0
    else
        echo -e "  ${RED}✗${NC} $description NOT found at: $dir"
        MISSING_DEPS+=("$description")
        return 1
    fi
}

# Check Node.js version
check_node_version() {
    local required_major=18  # Minimum Node.js version
    
    if command -v node &> /dev/null; then
        local node_version=$(node -v | cut -d'v' -f2)
        local major_version=$(echo $node_version | cut -d'.' -f1)
        
        echo -e "  ${BLUE}ℹ${NC}  Node.js version: v$node_version"
        
        if [ "$major_version" -lt "$required_major" ]; then
            echo -e "  ${YELLOW}⚠${NC}  Node.js v$required_major or higher recommended (you have v$node_version)"
            WARNINGS+=("Node.js version is older than recommended")
        else
            echo -e "  ${GREEN}✓${NC} Node.js version meets requirements"
        fi
    fi
}

# Check npm packages in a directory
check_npm_packages() {
    local dir=$1
    local package_name=$2
    
    if [ -d "$dir/node_modules" ]; then
        local total_packages=$(ls -1 "$dir/node_modules" 2>/dev/null | wc -l | tr -d ' ')
        echo -e "  ${GREEN}✓${NC} $package_name node_modules found ($total_packages packages)"
        
        # Check if node_modules might be incomplete
        if [ "$total_packages" -lt 10 ]; then
            echo -e "  ${YELLOW}⚠${NC}  node_modules seems incomplete (only $total_packages packages)"
            WARNINGS+=("$package_name node_modules might be incomplete")
        fi
        return 0
    else
        echo -e "  ${RED}✗${NC} $package_name node_modules NOT found"
        echo -e "    ${YELLOW}Run: cd $dir && npm install${NC}"
        MISSING_DEPS+=("$package_name node_modules")
        return 1
    fi
}

# Check PostgreSQL connection
check_postgres() {
    echo -e "\n${BLUE}Checking PostgreSQL...${NC}"
    
    # Check if PostgreSQL is running
    if command -v pg_isready &> /dev/null; then
        if pg_isready -q 2>/dev/null; then
            echo -e "  ${GREEN}✓${NC} PostgreSQL is running"
        else
            echo -e "  ${YELLOW}⚠${NC}  PostgreSQL might not be running"
            echo -e "    ${YELLOW}Start with: brew services start postgresql${NC}"
            WARNINGS+=("PostgreSQL might not be running")
        fi
    else
        # Alternative check using lsof
        if lsof -i:5432 &> /dev/null; then
            echo -e "  ${GREEN}✓${NC} PostgreSQL appears to be running (port 5432)"
        else
            echo -e "  ${YELLOW}⚠${NC}  Cannot verify PostgreSQL status"
            WARNINGS+=("Cannot verify PostgreSQL status")
        fi
    fi
}

# Check environment files
check_env_files() {
    echo -e "\n${BLUE}Checking environment files...${NC}"
    
    # Backend .env
    if [ -f "$BASE_DIR/backend/.env" ]; then
        echo -e "  ${GREEN}✓${NC} Backend .env file exists"
        
        # Check for critical environment variables
        if grep -q "DATABASE_URL" "$BASE_DIR/backend/.env"; then
            echo -e "  ${GREEN}✓${NC} DATABASE_URL configured"
        else
            echo -e "  ${YELLOW}⚠${NC}  DATABASE_URL not found in backend/.env"
            WARNINGS+=("DATABASE_URL not configured")
        fi
        
        if grep -q "RESEND_API_KEY" "$BASE_DIR/backend/.env"; then
            echo -e "  ${GREEN}✓${NC} RESEND_API_KEY configured"
        else
            echo -e "  ${YELLOW}⚠${NC}  RESEND_API_KEY not found in backend/.env"
            WARNINGS+=("Email service might not work")
        fi
    else
        echo -e "  ${RED}✗${NC} Backend .env file NOT found"
        MISSING_DEPS+=("Backend .env file")
    fi
    
    # Frontend .env.local
    if [ -f "$BASE_DIR/frontend/.env.local" ]; then
        echo -e "  ${GREEN}✓${NC} Frontend .env.local file exists"
    else
        echo -e "  ${YELLOW}⚠${NC}  Frontend .env.local file not found (using defaults)"
    fi
}

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

# ============================================
# MAIN DEPENDENCY CHECKS
# ============================================

echo -e "\n${BLUE}Step 1: Checking system dependencies...${NC}"
echo "----------------------------------------"

# Check core commands
check_command "node" "Node.js" "brew install node"
check_command "npx" "npx (npm executor)" "comes with npm"
check_command "git" "Git" "brew install git"
check_command "lsof" "lsof (port checker)" "should be pre-installed on macOS"

# Check Node.js version
check_node_version

echo -e "\n${BLUE}Step 2: Checking project structure...${NC}"
echo "----------------------------------------"

# Check directories
check_directory "$BASE_DIR" "Project root"
check_directory "$BASE_DIR/backend" "Backend directory"
check_directory "$BASE_DIR/frontend" "Frontend directory"
check_directory "$BASE_DIR/shared" "Shared types directory"

# Check critical files
check_file "$BASE_DIR/backend/package.json" "Backend package.json"
check_file "$BASE_DIR/frontend/package.json" "Frontend package.json"
check_file "$BASE_DIR/backend/tsconfig.json" "Backend TypeScript config"
check_file "$BASE_DIR/frontend/tsconfig.json" "Frontend TypeScript config"

echo -e "\n${BLUE}Step 3: Checking npm packages...${NC}"
echo "----------------------------------------"

check_npm_packages "$BASE_DIR/backend" "Backend"
check_npm_packages "$BASE_DIR/frontend" "Frontend"

# Check specific critical packages
if [ -d "$BASE_DIR/backend/node_modules" ]; then
    if [ -d "$BASE_DIR/backend/node_modules/ts-node" ]; then
        echo -e "  ${GREEN}✓${NC} ts-node is installed"
    else
        echo -e "  ${RED}✗${NC} ts-node NOT installed"
        MISSING_DEPS+=("ts-node package")
    fi
fi

if [ -d "$BASE_DIR/frontend/node_modules" ]; then
    if [ -d "$BASE_DIR/frontend/node_modules/next" ]; then
        echo -e "  ${GREEN}✓${NC} Next.js is installed"
    else
        echo -e "  ${RED}✗${NC} Next.js NOT installed"
        MISSING_DEPS+=("Next.js package")
    fi
fi

# Check database and environment
check_postgres
check_env_files

echo -e "\n${BLUE}Step 4: Checking port availability...${NC}"
echo "----------------------------------------"

if check_port 3001; then
    echo -e "  ${YELLOW}⚠${NC}  Port 3001 is already in use"
    echo -e "    Will kill existing process before starting"
else
    echo -e "  ${GREEN}✓${NC} Port 3001 is available"
fi

if check_port 3000; then
    echo -e "  ${YELLOW}⚠${NC}  Port 3000 is already in use"
    echo -e "    Will kill existing process before starting"
else
    echo -e "  ${GREEN}✓${NC} Port 3000 is available"
fi

# ============================================
# DEPENDENCY CHECK RESULTS
# ============================================

echo -e "\n========================================="
echo -e "${BLUE}Dependency Check Summary${NC}"
echo "========================================="

if [ ${#MISSING_DEPS[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ All critical dependencies are satisfied!${NC}"
else
    echo -e "${RED}✗ Missing critical dependencies:${NC}"
    for dep in "${MISSING_DEPS[@]}"; do
        echo -e "  - $dep"
    done
fi

if [ ${#WARNINGS[@]} -gt 0 ]; then
    echo -e "\n${YELLOW}⚠ Warnings:${NC}"
    for warning in "${WARNINGS[@]}"; do
        echo -e "  - $warning"
    done
fi

# Ask user if they want to continue with warnings or missing deps
if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
    echo -e "\n${RED}Cannot start servers due to missing dependencies.${NC}"
    echo -e "Please install the missing dependencies and try again."
    exit 1
fi

if [ ${#WARNINGS[@]} -gt 0 ]; then
    echo -e "\n${YELLOW}There are warnings but we can try to start the servers.${NC}"
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Startup cancelled."
        exit 0
    fi
fi

# ============================================
# START SERVERS
# ============================================

echo -e "\n========================================="
echo -e "${GREEN}Starting Servers${NC}"
echo "========================================="

# Clean up any existing processes
echo -e "\n${YELLOW}Cleaning up existing processes...${NC}"
kill_port 3001
kill_port 3000

# Start Backend Server
echo -e "\n${GREEN}Starting Backend Server (Port 3001)...${NC}"
cd "$BASE_DIR/backend"

# Try npx first
npx ts-node src/index.ts &
BACKEND_PID=$!

echo -e "${GREEN}Backend server starting with PID: $BACKEND_PID${NC}"

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend to initialize...${NC}"
BACKEND_READY=false
for i in {1..20}; do
    if check_port 3001; then
        BACKEND_READY=true
        break
    fi
    sleep 1
    echo -n "."
done
echo

if [ "$BACKEND_READY" = true ]; then
    echo -e "${GREEN}✓ Backend server is running on port 3001${NC}"
else
    echo -e "${RED}✗ Backend server failed to start${NC}"
    kill $BACKEND_PID 2>/dev/null
    
    # Try alternative method
    echo -e "${YELLOW}Trying alternative startup method...${NC}"
    node -r ts-node/register src/index.ts &
    BACKEND_PID=$!
    sleep 5
    
    if check_port 3001; then
        echo -e "${GREEN}✓ Backend started with alternative method${NC}"
    else
        echo -e "${RED}✗ Backend failed to start. Check error messages.${NC}"
        exit 1
    fi
fi

# Start Frontend Server
echo -e "\n${GREEN}Starting Frontend Server (Port 3000)...${NC}"
cd "$BASE_DIR/frontend"

# Try npx first
npx next dev &
FRONTEND_PID=$!

echo -e "${GREEN}Frontend server starting with PID: $FRONTEND_PID${NC}"

# Wait for frontend to be ready
echo -e "${YELLOW}Waiting for frontend to initialize...${NC}"
FRONTEND_READY=false
for i in {1..30}; do
    if check_port 3000; then
        FRONTEND_READY=true
        break
    fi
    sleep 1
    echo -n "."
done
echo

if [ "$FRONTEND_READY" = true ]; then
    echo -e "${GREEN}✓ Frontend server is running on port 3000${NC}"
else
    echo -e "${RED}✗ Frontend server failed to start${NC}"
    kill $FRONTEND_PID 2>/dev/null
    
    # Try alternative method
    echo -e "${YELLOW}Trying alternative startup method...${NC}"
    node node_modules/.bin/next dev &
    FRONTEND_PID=$!
    sleep 10
    
    if check_port 3000; then
        echo -e "${GREEN}✓ Frontend started with alternative method${NC}"
    else
        echo -e "${RED}✗ Frontend failed to start. Check error messages.${NC}"
        exit 1
    fi
fi

# Save PIDs to file for easy shutdown later
echo "$BACKEND_PID" > "$BASE_DIR/.backend.pid"
echo "$FRONTEND_PID" > "$BASE_DIR/.frontend.pid"

# Final health check
echo -e "\n${BLUE}Running health checks...${NC}"
echo "----------------------------------------"

# Check backend health endpoint
HEALTH_RESPONSE=$(curl -s http://localhost:3001/api/health 2>/dev/null)
if [ ! -z "$HEALTH_RESPONSE" ]; then
    echo -e "${GREEN}✓ Backend health check passed${NC}"
else
    echo -e "${YELLOW}⚠ Backend health check failed or slow${NC}"
fi

# Check frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Frontend is responding${NC}"
else
    echo -e "${YELLOW}⚠ Frontend returned status: $FRONTEND_STATUS${NC}"
fi

echo -e "\n========================================="
echo -e "${GREEN}✓ Both servers are running!${NC}"
echo -e "========================================="
echo -e "${GREEN}Backend API:${NC}   http://localhost:3001"
echo -e "${GREEN}Frontend App:${NC}  http://localhost:3000"
echo -e "\n${BLUE}Useful endpoints:${NC}"
echo -e "  Health Check: http://localhost:3001/api/health"
echo -e "  Customers:    http://localhost:3001/api/customers"
echo -e "  Invoices:     http://localhost:3001/api/invoices"
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