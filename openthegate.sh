#!/bin/bash

# openthegate.sh - Start Alfred AI gateway only
# Does not start servers or databases

echo "========================================="
echo "Opening Alfred AI Gateway"
echo "========================================="
echo ""

# Start OpenClaw gateway (Alfred)
if openclaw health >/dev/null 2>&1; then
    echo "✓ Alfred gateway already running"
else
    echo "🤖 Starting Alfred gateway..."
    openclaw gateway >/dev/null 2>&1 &
    sleep 3

    if openclaw health >/dev/null 2>&1; then
        echo "✓ Alfred gateway started successfully"
    else
        echo "⚠️  Alfred gateway may not have started correctly"
        echo "Check logs: tail -f ~/.openclaw/gateway.log"
    fi
fi

echo ""
echo "========================================="
echo "✓ Gateway opened"
echo "========================================="
echo "Alfred:    @alfredthemanbot (Telegram)"
echo "Gateway:   ws://127.0.0.1:18898"
echo "Auth:      Token-based (see ALFRED-GATEWAY-FIX.md)"
echo "========================================="
echo ""
echo "Use ./closethegate.sh to stop Alfred only"
echo "Use ./start.sh to start full system"
echo "See ALFRED-GATEWAY-FIX.md for token configuration"
echo "========================================="
