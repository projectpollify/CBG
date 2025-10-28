#!/bin/bash

# Setup script to enable passwordless sudo for PostgreSQL service
# Run this once: sudo bash setup-postgres-sudo.sh

echo "========================================="
echo "PostgreSQL Passwordless Sudo Setup"
echo "========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "ERROR: This script must be run with sudo"
    echo "Usage: sudo bash setup-postgres-sudo.sh"
    exit 1
fi

# Get the current user (the one who ran sudo)
ACTUAL_USER="${SUDO_USER:-$USER}"

echo "Configuring passwordless sudo for user: $ACTUAL_USER"
echo "Service: PostgreSQL (start/stop/status/restart)"

# Create sudoers file for PostgreSQL
SUDOERS_FILE="/etc/sudoers.d/postgresql-$ACTUAL_USER"

cat > "$SUDOERS_FILE" <<EOF
# Allow $ACTUAL_USER to manage PostgreSQL service without password
$ACTUAL_USER ALL=(ALL) NOPASSWD: /usr/sbin/service postgresql start
$ACTUAL_USER ALL=(ALL) NOPASSWD: /usr/sbin/service postgresql stop
$ACTUAL_USER ALL=(ALL) NOPASSWD: /usr/sbin/service postgresql restart
$ACTUAL_USER ALL=(ALL) NOPASSWD: /usr/sbin/service postgresql status
EOF

# Set proper permissions
chmod 0440 "$SUDOERS_FILE"

# Validate the sudoers file
if visudo -c -f "$SUDOERS_FILE" >/dev/null 2>&1; then
    echo ""
    echo "✓ Passwordless sudo configured successfully!"
    echo ""
    echo "You can now run these commands without a password:"
    echo "  sudo service postgresql start"
    echo "  sudo service postgresql stop"
    echo "  sudo service postgresql restart"
    echo "  sudo service postgresql status"
    echo ""
    echo "Your start-servers.sh script will now work without prompting for a password."
    echo "========================================="
else
    echo ""
    echo "✗ ERROR: Sudoers file validation failed"
    rm -f "$SUDOERS_FILE"
    exit 1
fi
