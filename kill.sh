#!/bin/bash

# kill.sh - Kill all CBG application servers and processes
# Leaves databases and Alfred gateway running

echo "========================================="
echo "Killing CBG Application Servers"
echo "========================================="
echo ""

# Use existing stop-servers.sh script
./stop-servers.sh

echo ""
echo "========================================="
echo "✓ All CBG servers stopped"
echo "========================================="
echo "Database and Alfred gateway still running"
echo "Use ./start.sh to restart servers"
echo "Use ./close.sh to shutdown everything"
echo "========================================="
