# Deploying CBG to Hostinger VPS

## Benefits of Hosting vs Local Development
✅ Always accessible from anywhere  
✅ No "npm install" headaches  
✅ No port conflicts  
✅ Professional URL (cuttingboardguys.com)  
✅ Can share with team/customers  
✅ Automatic backups available  
✅ SSL certificates included  

## What You Need from Hostinger

### 1. VPS Plan (Recommended)
- **KVM 2** plan or higher ($7.99/month)
  - 2 vCPU Cores
  - 8 GB RAM
  - 50 GB NVMe disk space
  - Ubuntu 22.04 OS

### 2. Domain Setup
- Point your domain to VPS IP
- Configure SSL certificate (free with Let's Encrypt)

## Simplified Deployment Process

### Step 1: Initial VPS Setup
```bash
# SSH into your VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install nginx (reverse proxy)
apt install nginx -y

# Install PostgreSQL
apt install postgresql postgresql-contrib -y
```

### Step 2: Setup Database
```bash
# Create database
sudo -u postgres psql
CREATE DATABASE cbg_production;
CREATE USER cbg_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE cbg_production TO cbg_user;
\q
```

### Step 3: Upload Your Code
```bash
# Clone your repository
git clone https://github.com/yourusername/cbg.git
cd cbg

# Install dependencies (one time only!)
cd backend && npm install
cd ../frontend && npm install && npm run build
```

### Step 4: Environment Variables
```bash
# Create production .env
nano /root/cbg/backend/.env

DATABASE_URL="postgresql://cbg_user:password@localhost:5432/cbg_production"
JWT_SECRET="your-production-secret"
NODE_ENV="production"
```

### Step 5: Start Services with PM2
```bash
# Start backend
pm2 start /root/cbg/backend/dist/index.js --name cbg-backend

# Start frontend  
pm2 start "npm run start" --name cbg-frontend --cwd /root/cbg/frontend

# Save PM2 configuration
pm2 save
pm2 startup
```

### Step 6: Configure Nginx
```nginx
# /etc/nginx/sites-available/cbg
server {
    listen 80;
    server_name cuttingboardguys.com www.cuttingboardguys.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Even Easier Alternative: Use a Platform-as-a-Service

Instead of managing a VPS, consider these alternatives that handle all the DevOps for you:

### 1. **Vercel** (Frontend) + **Supabase** (Backend + Database)
- **Cost**: Free to start
- **Pros**: Zero configuration, automatic deployments
- **How**: 
  - Deploy Next.js to Vercel (automatic from GitHub)
  - Use Supabase for database and authentication
  - Rewrite backend as API routes in Next.js

### 2. **Railway.app**
- **Cost**: $5/month to start
- **Pros**: One-click deploy, handles everything
- **How**: Connect GitHub, click deploy, done!

### 3. **Render.com**
- **Cost**: Free tier available
- **Pros**: Automatic builds and deploys
- **How**: Connect repo, auto-detects Node.js apps

## Quick Start with Railway (Easiest Option)

1. Sign up at railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Railway auto-detects:
   - Backend (Node.js)
   - Frontend (Next.js)
   - Adds PostgreSQL database
5. Click "Deploy"
6. Get instant URL like: `cbg-production.up.railway.app`

## Why This Solves Your Problems

### Current Local Issues:
- ❌ npm install failures
- ❌ Port conflicts  
- ❌ TypeScript compilation errors
- ❌ Process crashes
- ❌ Different behavior on different machines

### With Cloud Hosting:
- ✅ Install dependencies once, runs forever
- ✅ No port conflicts (handled by reverse proxy)
- ✅ Build once, run compiled JavaScript
- ✅ Auto-restart on crashes (PM2/Railway)
- ✅ Same environment every time

## Migration Checklist

- [ ] Choose hosting platform
- [ ] Set up production database
- [ ] Update environment variables
- [ ] Build TypeScript to JavaScript
- [ ] Configure domain name
- [ ] Set up SSL certificate
- [ ] Test all features
- [ ] Set up backups

## Recommended: Start with Railway

For your situation, I'd recommend Railway because:
1. **No DevOps knowledge needed**
2. **Automatic everything**
3. **Free to try**
4. **GitHub integration**
5. **One-click rollbacks**

Would you like me to help you prepare your code for deployment to any of these platforms?