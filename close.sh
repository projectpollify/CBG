#!/bin/bash

# close.sh - Complete system shutdown
# Stops all servers, databases, and Alfred AI gateway

echo "========================================="
echo "Shutting Down Complete CBG System"
echo "========================================="
echo ""

# Stop CBG application servers
echo "🛑 Stopping CBG application servers..."
./stop-servers.sh
echo ""

# Stop OpenClaw gateway (Alfred)
echo "🤖 Stopping Alfred AI gateway..."
if openclaw health >/dev/null 2>&1; then
    pkill -f "openclaw gateway" || true
    sleep 2

    if openclaw health >/dev/null 2>&1; then
        echo "Force killing gateway..."
        pkill -9 -f "openclaw" || true
    fi
    echo "✓ Alfred gateway stopped"
else
    echo "✓ Alfred gateway already stopped"
fi
echo ""

# Stop PostgreSQL database
echo "🗄️  Stopping PostgreSQL database..."
if pg_isready -q 2>/dev/null; then
    sudo service postgresql stop
    sleep 2
    echo "✓ PostgreSQL stopped"
else
    echo "✓ PostgreSQL already stopped"
fi
echo ""

echo "========================================="
echo "✓ Complete system shutdown"
echo "========================================="
echo "All servers, databases, and AI gateway stopped"
echo "Use ./start.sh to restart everything"
echo "========================================="
