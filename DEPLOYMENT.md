# GymNexus Deployment Guide

This guide covers deploying the Backend API and Admin Panel for the GymNexus monorepo.

## Table of Contents

1. [Backend Deployment](#backend-deployment)
   - [Railway](#option-1-railway-recommended)
   - [Render](#option-2-render)
   - [Heroku](#option-3-heroku)
2. [Admin Panel Deployment](#admin-panel-deployment)
   - [Vercel](#option-1-vercel-recommended)
   - [Netlify](#option-2-netlify)
3. [Database Setup](#database-setup)
4. [Environment Variables](#environment-variables)

---

## Backend Deployment

### Option 1: Railway (Recommended)

**Why Railway?**

- Free tier available
- PostgreSQL database included
- Easy monorepo support
- Automatic deployments from GitHub

**Steps:**

1. **Install Railway CLI**

   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**

   ```bash
   railway login
   ```

3. **Create a new project**

   ```bash
   cd backend
   railway init
   ```

4. **Add PostgreSQL database**

   ```bash
   railway add
   # Select PostgreSQL
   ```

5. **Set environment variables**

   ```bash
   railway variables set PORT=5000
   railway variables set NODE_ENV=production
   ```

6. **Deploy**

   ```bash
   railway up
   ```

7. **Get your backend URL**
   ```bash
   railway domain
   ```

**Alternative: Deploy via Railway Dashboard**

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `gym-nexus` repository
4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add PostgreSQL database from the dashboard
6. Set environment variables in Settings

---

### Option 2: Render

**Steps:**

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** `gym-nexus-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

5. Add PostgreSQL database:
   - Click "New +" → "PostgreSQL"
   - Name it `gym-nexus-db`
   - Copy the Internal Database URL

6. Add environment variables:

   ```
   PORT=5000
   NODE_ENV=production
   DATABASE_URL=<your-postgres-url>
   ```

7. Click "Create Web Service"

---

### Option 3: Heroku

**Steps:**

1. **Install Heroku CLI**

   ```bash
   brew tap heroku/brew && brew install heroku
   ```

2. **Login**

   ```bash
   heroku login
   ```

3. **Create app**

   ```bash
   heroku create gym-nexus-backend
   ```

4. **Add PostgreSQL**

   ```bash
   heroku addons:create heroku-postgresql:essential-0
   ```

5. **Deploy from monorepo**

   ```bash
   # From root directory
   git subtree push --prefix backend heroku main
   ```

6. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   ```

---

## Admin Panel Deployment

### Option 1: Vercel (Recommended)

**Why Vercel?**

- Built for Next.js
- Free tier with generous limits
- Automatic deployments
- Edge network for fast loading

**Steps:**

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Deploy**

   ```bash
   cd admin
   vercel
   ```

3. **Follow the prompts:**
   - Link to existing project? No
   - Project name: `gym-nexus-admin`
   - Directory: `./` (already in admin folder)
   - Override settings? No

4. **Set environment variables** (if needed)

   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   # Enter your backend URL
   ```

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

**Alternative: Deploy via Vercel Dashboard**

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import `gym-nexus` repository
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `admin`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
5. Add environment variables in Settings
6. Click "Deploy"

---

### Option 2: Netlify

**Steps:**

1. Go to https://netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select `gym-nexus`
4. Configure:
   - **Base directory:** `admin`
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
5. Add environment variables in Site settings
6. Click "Deploy site"

---

## Database Setup

### PostgreSQL Configuration

Your backend uses Sequelize with PostgreSQL. Here's how to configure it:

1. **Create `.env` file in backend folder:**

   ```env
   PORT=5000
   NODE_ENV=production

   # PostgreSQL Connection
   DB_HOST=your-db-host
   DB_PORT=5432
   DB_NAME=gym_nexus
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password

   # Or use DATABASE_URL (Railway/Render format)
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

2. **Update `database.js` to use environment variables** (if not already done)

3. **Run migrations** (if you have any):
   ```bash
   railway run npm run migrate
   # or
   heroku run npm run migrate
   ```

---

## Environment Variables

### Backend Environment Variables

```env
# Server
PORT=5000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# CORS (optional)
ALLOWED_ORIGINS=https://your-admin-url.vercel.app

# JWT Secret (if using authentication)
JWT_SECRET=your-secret-key
```

### Admin Environment Variables

```env
# API URL
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app

# Other Next.js variables
NEXT_PUBLIC_APP_NAME=GymNexus Admin
```

---

## Quick Deployment Commands

### Deploy Backend to Railway

```bash
cd backend
railway login
railway init
railway add  # Add PostgreSQL
railway up
railway domain
```

### Deploy Admin to Vercel

```bash
cd admin
vercel login
vercel
vercel --prod
```

---

## Continuous Deployment

### Automatic Deployments from GitHub

**Railway:**

1. Connect GitHub in Railway dashboard
2. Select `gym-nexus` repository
3. Set root directory to `backend`
4. Every push to `main` will auto-deploy

**Vercel:**

1. Connect GitHub in Vercel dashboard
2. Select `gym-nexus` repository
3. Set root directory to `admin`
4. Every push to `main` will auto-deploy

---

## Monitoring & Logs

### Railway

```bash
railway logs
```

### Vercel

```bash
vercel logs
```

### Render

- View logs in the Render dashboard under "Logs" tab

---

## Troubleshooting

### Backend Issues

**Port already in use:**

- Make sure `PORT` environment variable is set
- Railway/Render automatically assign ports

**Database connection failed:**

- Check `DATABASE_URL` is correct
- Verify database is running
- Check firewall rules

**Module not found:**

- Ensure all dependencies are in `package.json`
- Run `npm install` in backend folder

### Admin Issues

**Build failed:**

- Check Next.js version compatibility
- Verify all dependencies are installed
- Check for TypeScript errors

**API calls failing:**

- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS settings on backend
- Ensure backend is deployed and running

---

## Cost Estimates

### Free Tier Options

| Service | Backend | Admin | Database | Limits                       |
| ------- | ------- | ----- | -------- | ---------------------------- |
| Railway | ✅      | ❌    | ✅       | $5 free credit/month         |
| Render  | ✅      | ❌    | ✅       | 750 hours/month              |
| Vercel  | ❌      | ✅    | ❌       | 100GB bandwidth              |
| Heroku  | ✅      | ❌    | ✅       | 1000 hours/month (with card) |

### Recommended Stack (Free)

- **Backend:** Railway (with PostgreSQL)
- **Admin:** Vercel
- **Total Cost:** $0/month (within free tier limits)

---

## Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Deploy admin to Vercel
3. ✅ Set up environment variables
4. ✅ Test the deployed applications
5. ✅ Set up custom domains (optional)
6. ✅ Configure CI/CD for automatic deployments

Need help? Check the platform-specific documentation or create an issue in the repository.
