# Railway Backend Deployment Guide

## ✅ PROJECT STATUS
- Frontend: Successfully deployed to Vercel
- Backend: Build fixed, ready for Railway deployment
- Database: 790 customers preserved in SQLite
- Login: info@cuttingboardguys.ca / pass1234

## 🔧 FIXES COMPLETED
1. ✅ Fixed package.json build scripts (added prisma generate)
2. ✅ Fixed TypeScript configuration (removed invalid types)
3. ✅ Fixed seed.ts to match Prisma schema
4. ✅ Created data migration script for SQLite → PostgreSQL
5. ✅ Updated Railway configuration files

## 🚀 DEPLOYMENT STEPS

### 1. Push to GitHub First
```bash
git add -A
git commit -m "Fix Railway deployment configuration"
git push
```

### 2. Connect Railway to GitHub
In your Railway dashboard:
1. Go to your project: https://railway.com/project/d1d2f3fb-25a3-4792-805d-fceda689f670
2. Click "Deploy" → "GitHub Repo"
3. Select your repository
4. Railway will auto-deploy from main branch

### 3. Set Environment Variables
In Railway dashboard, go to Variables tab and add:

```
JWT_SECRET=your-secret-key-change-this-in-production
PORT=3001
NODE_ENV=production
```

Railway automatically sets DATABASE_URL when PostgreSQL is added.

### 4. Deploy and Check Logs
Railway will auto-deploy. Monitor the deployment:
1. Check build logs in Railway dashboard
2. Look for "Build successful" message
3. Service should show as "Active"

### 5. Run Database Setup (After Deployment)
In Railway dashboard, use the shell or run:
```bash
# Create database schema
railway run npx prisma migrate deploy

# Optional: Seed initial data
railway run npx prisma db seed
```

### 6. Migrate Your 790 Customers
After database is ready:
```bash
railway run npm run migrate:data
```
This transfers all customers from SQLite to PostgreSQL.

### 7. Get Your Backend URL
In Railway dashboard:
1. Go to Settings → Domains
2. Click "Generate Domain"
3. Copy the URL (e.g., https://cbg-backend.railway.app)

## Update Frontend

Once you have your Railway backend URL, update your frontend on Vercel:

1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Update `NEXT_PUBLIC_API_URL` with your Railway backend URL
4. Redeploy the frontend

## Monitoring

View logs:
```bash
railway logs
```

Open Railway dashboard:
```bash
railway open
```

## Database Connection

Railway will automatically set the `DATABASE_URL` environment variable when you add PostgreSQL.

## Troubleshooting

If deployment fails:
1. Check logs: `railway logs`
2. Ensure all TypeScript builds: `npm run build`
3. Verify Prisma schema: `npx prisma validate`
4. Check environment variables: `railway variables`

## Cost Estimation

Railway offers:
- $5 monthly credit (free tier)
- PostgreSQL: ~$5-10/month for small databases
- Backend hosting: ~$5-10/month for basic usage

Total estimated cost: $5-15/month after free credits