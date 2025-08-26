# CBG Backend VPS Deployment Plan

## Current Situation
- **Frontend**: Successfully deployed on Vercel at `https://frontend-qe8irvn2c-shawns-projects-22b653d6.vercel.app`
- **Backend**: Failed to deploy on Railway due to persistent PORT configuration issues
- **Database**: 790 customers preserved in SQLite, ready to migrate to PostgreSQL
- **Code Status**: All TypeScript/build issues fixed, backend compiles successfully locally

## Why VPS?
After 8+ hours fighting Railway's deployment system, we're moving to a VPS where we have:
- Full control over the environment
- Direct access to logs and debugging
- No mysterious build system restrictions
- Ability to configure everything ourselves

## Architecture Plan
- **Keep Frontend on Vercel** (it's working perfectly)
- **Deploy Backend to Hostinger VPS**
- **Install PostgreSQL on VPS** for the database
- **Update frontend to point to VPS backend URL**

## Prerequisites Completed
✅ Backend code builds successfully (`npm run build` works)
✅ TypeScript configuration fixed
✅ PORT parsing fixed (uses `parseInt(process.env.PORT || '3001', 10)`)
✅ Prisma schema configured for PostgreSQL
✅ Frontend successfully deployed on Vercel
✅ 790 customers data preserved and ready to migrate

## Tasks to Complete (One at a Time)

### 1. VPS Initial Setup
- [ ] Access Hostinger VPS via SSH
- [ ] Update system packages
- [ ] Install Node.js (v18 or higher)
- [ ] Install PostgreSQL
- [ ] Install PM2 for process management
- [ ] Install nginx for reverse proxy

### 2. Database Setup
- [ ] Create PostgreSQL database and user
- [ ] Set up database password and permissions
- [ ] Test PostgreSQL connection

### 3. Backend Deployment
- [ ] Clone the repository to VPS
- [ ] Navigate to backend folder
- [ ] Create `.env` file with:
  - DATABASE_URL (PostgreSQL connection string)
  - JWT_SECRET
  - NODE_ENV=production
- [ ] Run `npm install`
- [ ] Run `npm run build`
- [ ] Run Prisma migrations: `npx prisma migrate deploy`

### 4. Run and Test Backend
- [ ] Start backend with PM2: `pm2 start dist/index.js --name cbg-backend`
- [ ] Test health endpoint: `http://YOUR-VPS-IP:3001/api/health`
- [ ] Check logs: `pm2 logs cbg-backend`

### 5. Configure Nginx (Optional but Recommended)
- [ ] Set up nginx reverse proxy to forward port 80 to 3001
- [ ] Configure domain if you have one
- [ ] Set up SSL with Let's Encrypt (if using domain)

### 6. Data Migration
- [ ] Run seed script to create admin user
- [ ] Import 790 customers from SQLite to PostgreSQL
- [ ] Verify data integrity

### 7. Connect Frontend to Backend
- [ ] Update Vercel environment variable:
  - NEXT_PUBLIC_API_URL = `http://YOUR-VPS-IP:3001` (or `https://your-domain.com` if configured)
- [ ] Redeploy frontend on Vercel
- [ ] Test login functionality

### 8. Final Testing
- [ ] Test login with credentials: info@cuttingboardguys.ca / pass1234
- [ ] Verify customer list loads
- [ ] Test invoice creation
- [ ] Check all API endpoints

## Key Files and Locations

**Backend Code**: `/Users/shawn/Desktop/CBG/CBG-new/backend/`
**Customer Data**: `backend/prisma/dev.db` (SQLite with 790 customers)
**Migration Script**: `backend/scripts/migrate-to-postgres.ts`
**Frontend URL**: `https://frontend-qe8irvn2c-shawns-projects-22b653d6.vercel.app`

## Important Notes
1. The backend is already configured to work with PostgreSQL (Prisma schema is ready)
2. All TypeScript compilation issues have been resolved
3. The frontend just needs the backend URL - doesn't matter where it's hosted
4. We have a migration script ready to transfer all 790 customers

## Success Criteria
- Backend responds to health check
- Frontend can connect to backend
- Users can log in
- All 790 customers are accessible
- No more deployment mysteries - we control everything

## New Chat Prompt for Next Session

"I need help deploying my CBG backend to a Hostinger VPS. The frontend is already working on Vercel. The backend builds successfully locally but Railway deployment failed due to PORT configuration issues. 

Current status:
- Frontend: Deployed on Vercel, working
- Backend: Builds successfully, needs VPS deployment  
- Database: 790 customers in SQLite, need PostgreSQL migration
- VPS: Hostinger VPS ready for setup

Please help me work through the VPS_DEPLOYMENT_PLAN.md file step by step, starting with SSH access and initial server setup."