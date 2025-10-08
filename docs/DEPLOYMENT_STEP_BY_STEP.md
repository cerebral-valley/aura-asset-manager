# 🎯 Step-by-Step Deployment Guide for Aura Asset Manager

## Step 1: Create Supabase Production Project (START HERE)

### 1.1 Create New Supabase Project
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `aura-asset-manager-prod`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for project to be ready (2-3 minutes)

### 1.2 Get Your Supabase Credentials
Once your project is ready, copy these values:

1. **Project URL**: Found in Settings → API
   - Example: `https://abc123def.supabase.co`
   
2. **Anon Key**: Found in Settings → API
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   
3. **Service Role Key**: Found in Settings → API (reveal and copy)
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

4. **Database URL**: Found in Settings → Database
   - Example: `postgresql://postgres:password@db.abc123def.supabase.co:5432/postgres`

### 1.3 Set Up Database Schema
1. In Supabase Dashboard, go to "SQL Editor"
2. Click "New Query"
3. Copy the contents of your `database/schema.sql` file
4. Paste it into the editor
5. Click "Run" to execute the schema
6. Verify tables are created in "Table Editor"

### 1.4 Configure Authentication
1. Go to Authentication → Settings
2. Enable Email authentication
3. Set Site URL to your future domain (can update later)
4. Configure redirect URLs (can update after frontend deployment)

---

## Step 2: Deploy Backend to Railway

### 2.1 Prepare for Railway Deployment
1. Go to [https://railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `aura-asset-manager` repository

### 2.2 Configure Railway Deployment
1. Select "Configure" next to your repo
2. **Root Directory**: Set to `backend`
3. **Build Command**: Will auto-detect from `railway.toml`
4. **Start Command**: Will auto-detect from `railway.toml`

### 2.3 Set Environment Variables in Railway
Go to your project → Variables tab and add these:

```
DATABASE_URL=your-supabase-database-url-from-step-1
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key-from-step-1
SUPABASE_SERVICE_KEY=your-service-role-key-from-step-1
SECRET_KEY=b6eb59a852912632b6a1573b52def6b857f32097157686b9b13e134a8d6f5508
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=production
DEBUG=false
ALLOWED_ORIGINS=["https://your-future-domain.com"]
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_BURST=100
LOG_LEVEL=INFO
```

### 2.4 Deploy Backend
1. Click "Deploy"
2. Wait for deployment to complete
3. Note your Railway URL (e.g., `https://aura-backend-production.railway.app`)
4. Test the backend by visiting: `https://your-railway-url.railway.app/health`

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Prepare for Vercel Deployment
1. Go to [https://vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your GitHub repository

### 3.2 Configure Vercel Deployment
1. **Framework Preset**: Vite (should auto-detect)
2. **Root Directory**: Set to `frontend`
3. **Build Command**: `pnpm run build` (auto-detected)
4. **Output Directory**: `dist` (auto-detected)

### 3.3 Set Environment Variables in Vercel
In the deployment configuration, add these environment variables:

```
VITE_API_BASE_URL=https://your-railway-url.railway.app
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-from-step-1
VITE_APP_NAME=Aura Asset Manager
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
```

### 3.4 Deploy Frontend
1. Click "Deploy"
2. Wait for deployment to complete
3. Note your Vercel URL (e.g., `https://aura-asset-manager.vercel.app`)

---

## Step 4: Update CORS and Test

### 4.1 Update Backend CORS Settings
1. Go back to Railway → Your project → Variables
2. Update `ALLOWED_ORIGINS` with your Vercel URL:
   ```
   ALLOWED_ORIGINS=["https://your-vercel-url.vercel.app"]
   ```
3. Redeploy the backend

### 4.2 Update Supabase Auth Settings
1. In Supabase Dashboard → Authentication → Settings
2. Update "Site URL" to your Vercel URL
3. Add redirect URLs:
   - `https://your-vercel-url.vercel.app/**`

### 4.3 Test Your Application
1. Visit your Vercel URL
2. Try to create an account
3. Test logging in
4. Try adding an asset
5. Verify data saves to database

---

## Step 5: Add Custom Domain (Optional)

### 5.1 Configure Domain in Vercel
1. In Vercel project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### 5.2 Update Environment Variables
Update CORS and auth settings with your custom domain

---

## 🎉 Deployment Complete!

Your Aura Asset Manager should now be live and fully functional!

## Troubleshooting Common Issues

### Backend Issues
- Check Railway logs for errors
- Verify environment variables are set correctly
- Test health endpoint: `/health`

### Frontend Issues
- Check Vercel deployment logs
- Verify API URLs are correct
- Check browser console for errors

### Database Issues
- Verify Supabase project is active
- Check RLS policies are correctly set
- Test database connection

---

## Next Steps After Deployment
1. Set up monitoring (Sentry, Uptime monitoring)
2. Configure backups
3. Set up analytics
4. Plan for scaling

Need help with any specific step? Let me know!
