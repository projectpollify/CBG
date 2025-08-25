# 🚀 CBG Server Startup Information

## IMPORTANT: This is the WORKING startup method for Cutting Board Guys servers

### ✅ The Working Script: `./start-servers.sh`

**Location:** `/Users/shawn/Desktop/CBG/CBG-new/start-servers.sh`

**THIS SCRIPT WORKS - USE THIS METHOD ONLY**

---

## 📋 What This Script Does

### 1. **Cleanup Phase**
- Kills any existing processes on ports 3001 (backend) and 3000 (frontend)
- Uses `lsof -ti:PORT | kill -9` to ensure clean port availability
- Waits 2 seconds after killing processes

### 2. **Backend Startup (Port 3001)**
- **Primary Method:** `npx ts-node src/index.ts &`
- Runs from `/Users/shawn/Desktop/CBG/CBG-new/backend`
- Waits 5 seconds for backend to initialize
- **Fallback Method:** If primary fails, tries `node -r ts-node/register src/index.ts &`
- Verifies backend is running by checking port 3001

### 3. **Frontend Startup (Port 3000)**  
- **Primary Method:** `npx next dev &`
- Runs from `/Users/shawn/Desktop/CBG/CBG-new/frontend`
- Waits 10 seconds for frontend to initialize (Next.js takes longer)
- **Fallback Method:** If primary fails, tries `node node_modules/.bin/next dev &`
- Verifies frontend is running by checking port 3000

### 4. **Process Management**
- Saves PIDs to `.backend.pid` and `.frontend.pid` files
- Sets up Ctrl+C trap for clean shutdown
- Kills processes by PID first, then by port as backup

---

## ⚠️ KEY DIFFERENCES FROM OTHER METHODS

### Why This Works vs npm run dev:
1. **Uses `npx` directly** - Bypasses npm workspace issues
2. **No nodemon** - Avoids the problematic auto-restart that causes port conflicts
3. **Direct TypeScript execution** - Uses ts-node directly instead of through npm scripts
4. **Built-in error handling** - Has fallback methods if primary startup fails
5. **Proper process management** - Tracks PIDs and ensures clean shutdown

### DO NOT USE:
- ❌ `npm run dev` - Causes workspace errors
- ❌ `nodemon` - Creates port conflicts on file changes
- ❌ `npm start` - Not configured properly
- ❌ Docker or PM2 - Not set up for this project

---

## 🎯 How to Use

### Starting Servers:
```bash
cd /Users/shawn/Desktop/CBG/CBG-new
./start-servers.sh
```

### Stopping Servers:
- Press `Ctrl+C` in the terminal running the script
- OR use the companion script: `./stop-servers.sh`

### Checking Status:
- Backend health: `curl http://localhost:3001/api/health`
- Frontend: Open browser to `http://localhost:3000`

---

## 🔧 Troubleshooting

### If servers won't start:
1. Check if ports are already in use: `lsof -i:3001` and `lsof -i:3000`
2. Kill any orphaned processes: `lsof -ti:3001 | xargs kill -9`
3. Ensure you're in the correct directory: `/Users/shawn/Desktop/CBG/CBG-new`
4. Make sure script is executable: `chmod +x start-servers.sh`

### Common Issues:
- **"address already in use"** - Old process still running, script will auto-kill
- **"command not found"** - Ensure npx is installed: `npm install -g npx`
- **TypeScript errors** - The script continues despite TS errors (development mode)

---

## 📝 For AI Assistants / Developers

### CRITICAL NOTES:
1. **DO NOT attempt to restart servers using npm commands**
2. **DO NOT modify the startup method without testing**
3. **USE ONLY `./start-servers.sh` for starting servers**
4. **This script has been tested and confirmed working by the developer**

### When servers need restarting:
1. Tell the user to manually run `./start-servers.sh`
2. Wait for confirmation that servers are running
3. Continue with the task

### The script handles:
- Port cleanup automatically
- Process management with PID tracking
- Graceful shutdown on Ctrl+C
- Fallback methods if primary startup fails
- Color-coded output for easy reading

---

## 📊 Server Details

| Server | Port | Directory | Command | PID File |
|--------|------|-----------|---------|----------|
| Backend | 3001 | `/backend` | `npx ts-node src/index.ts` | `.backend.pid` |
| Frontend | 3000 | `/frontend` | `npx next dev` | `.frontend.pid` |

## 🔍 Verification Endpoints

- **Backend Health:** `http://localhost:3001/api/health`
- **Database Test:** `http://localhost:3001/api/test-db`
- **Customers API:** `http://localhost:3001/api/customers`
- **Invoices API:** `http://localhost:3001/api/invoices`
- **Frontend App:** `http://localhost:3000`

---

**Last Updated:** August 2025
**Confirmed Working By:** Shawn
**Script Version:** Production Ready

## Remember: This script WORKS. Don't try to "fix" it or use alternative methods!