# Alfred Gateway Fix - February 4, 2026

## Problem
Alfred AI gateway (OpenClaw) failed to start after system restart. Gateway returned:
```
Gateway auth is set to token, but no token is configured.
```

## Root Cause
OpenClaw 2026.2.1 now requires token authentication when gateway is bound to "lan" mode (0.0.0.0) for security. Previous configuration had:
- `gateway.bind: "lan"` (accessible on network)
- `gateway.auth: {}` (no authentication)

This combination is blocked as a security risk.

## Solution
Generated and configured a gateway authentication token:

```bash
# 1. Set auth mode to token
openclaw config set gateway.auth.mode token

# 2. Generate secure token
openssl rand -hex 32 | awk '{print "oc_"$0}'

# 3. Set token in config
openclaw config set gateway.auth.token "oc_[generated_token]"

# 4. Start gateway
openclaw gateway --force
```

## Current Configuration
- **Gateway Port:** 18898
- **Bind Mode:** lan (network accessible)
- **Auth Mode:** token
- **Token:** `oc_e64639175cb3d38982fbeef507bf217a7036d0e9d682f786e940c03775cc56bd`

## CORS Proxy Setup (Windows ↔ WSL)

**Problem:** Chrome extension running on Windows can't connect to WSL gateway due to missing CORS headers.

**Solution:** CORS proxy that sits between Chrome and the gateway, injecting required headers.

### Setup Steps

1. **Get WSL IP Address** (on WSL):
   ```bash
   ip addr show eth0 | grep "inet " | awk '{print $2}' | cut -d/ -f1
   # Example output: 172.19.160.94
   ```

2. **Update cors_proxy.js** with your WSL IP:
   ```javascript
   const WSL_GATEWAY_IP = '172.19.160.94';  // Replace with your actual WSL IP
   ```

3. **Run CORS Proxy** (on Windows PowerShell or WSL):
   ```bash
   node cors_proxy.js
   ```
   Should show:
   ```
   Alfred CORS Proxy Running
   Listening:  0.0.0.0:18900
   Forwarding: 172.19.160.94:18898
   ```

4. **Configure Chrome Extension**:
   - Gateway URL: `http://localhost:18900` (NOT the WSL IP!)
   - Auth Token: `oc_e64639175cb3d38982fbeef507bf217a7036d0e9d682f786e940c03775cc56bd`

### How It Works
```
Chrome Extension (Windows)
    ↓ http://localhost:18900
CORS Proxy (adds CORS headers)
    ↓ http://172.19.160.94:18898
OpenClaw Gateway (WSL)
    ↓ Telegram API
Alfred Bot (@alfredthemanbot)
```

### Files
- `cors_proxy.js` - CORS proxy with WebSocket upgrade support
- Port 18900 - Proxy listening port (Windows accessible)
- Port 18898 - Gateway port (WSL)

## Alfred Chrome Relay Setup
Alfred's Chrome relay extension configuration:
- **Gateway URL:** `http://localhost:18900` (via CORS proxy)
- **Auth Token:** `oc_e64639175cb3d38982fbeef507bf217a7036d0e9d682f786e940c03775cc56bd`
- Each gateway instance has unique token

## Quick Commands

### Gateway Management
```bash
# Start gateway
openclaw gateway --force

# Check status
openclaw health

# View token
openclaw config get gateway.auth.token

# Regenerate token (requires Alfred relay reconfiguration)
openssl rand -hex 32 | awk '{print "oc_"$0}'
openclaw config set gateway.auth.token "oc_[new_token]"
```

### CORS Proxy Management
```bash
# Get current WSL IP
ip addr show eth0 | grep "inet " | awk '{print $2}' | cut -d/ -f1

# Start CORS proxy
node cors_proxy.js

# Test proxy (should return gateway info)
curl http://localhost:18900/health
```

## Files Modified
- `~/.openclaw/openclaw.json` - Added gateway.auth.mode and gateway.auth.token

## Verification
Gateway healthy when `openclaw health` returns:
```
Telegram: ok (@alfredthemanbot)
Agents: main (default)
```
