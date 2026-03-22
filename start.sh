#!/bin/bash

# start.sh - Complete startup script for CBG system
# Starts databases, servers, and Alfred AI gateway

set -e

echo "========================================="
echo "Starting BC Cutting Board Guys System"
echo "========================================="
echo ""

# Display CLAUDE.md reminder
echo "📋 Reading project instructions..."
if [ -f "CLAUDE.md" ]; then
    echo "✓ CLAUDE.md loaded (Business Exit Strategy Partner)"
    echo ""
fi

# Start PostgreSQL if not running
echo "🗄️  Starting databases..."
if ! pg_isready -q 2>/dev/null; then
    echo "Starting PostgreSQL..."
    sudo service postgresql start
    sleep 2
else
    echo "✓ PostgreSQL already running"
fi
echo ""

# Start CBG application servers
echo "🚀 Starting CBG application servers..."
./start-servers.sh &
SERVERS_PID=$!

# Wait for servers to be ready
echo "Waiting for servers to initialize..."
sleep 5
echo ""

# Start OpenClaw gateway (Alfred)
echo "🤖 Starting Alfred AI gateway..."
if openclaw health >/dev/null 2>&1; then
    echo "✓ Alfred gateway already running"
else
    openclaw gateway >/dev/null 2>&1 &
    sleep 3
    if openclaw health >/dev/null 2>&1; then
        echo "✓ Alfred gateway started"
    else
        echo "⚠️  Alfred gateway may not have started correctly"
    fi
fi
echo ""

echo "========================================="
echo "✓ System startup complete!"
echo "========================================="
echo "Database:  PostgreSQL (Port 5432)"
echo "Backend:   http://localhost:3001"
echo "Frontend:  http://localhost:3000"
echo "Alfred:    @alfredthemanbot (Telegram)"
echo "========================================="
echo ""
echo "Use ./kill.sh to stop servers only"
echo "Use ./close.sh to shutdown everything"
echo "Use ./closethegate.sh to stop Alfred only"
echo "========================================="
