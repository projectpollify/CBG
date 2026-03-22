#!/bin/bash

# closethegate.sh - Stop Alfred AI gateway only
# Keeps servers and databases running

echo "========================================="
echo "Closing Alfred AI Gateway"
echo "========================================="
echo ""

# Stop OpenClaw gateway
if openclaw health >/dev/null 2>&1; then
    echo "Stopping Alfred gateway..."
    pkill -f "openclaw gateway" || true
    sleep 2

    if openclaw health >/dev/null 2>&1; then
        echo "⚠️  Gateway may still be running, force killing..."
        pkill -9 -f "openclaw" || true
    else
        echo "✓ Alfred gateway stopped"
    fi
else
    echo "✓ Alfred gateway already stopped"
fi

echo ""
echo "========================================="
echo "✓ Gateway closed"
echo "========================================="
echo "Servers and databases are still running"
echo "Use ./start.sh to restart Alfred"
echo "========================================="
