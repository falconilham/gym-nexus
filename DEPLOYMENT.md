# GymNexus Deployment Guide

This guide covers deploying the GymNexus monorepo using **Supabase** for the database and modern hosting platforms for the applications.

## 🚀 Recommended Stack

- **Database**: Supabase (PostgreSQL)
- **Backend API**: Render or Railway (Connected to Supabase)
- **Admin Panel**: Vercel (Already Deployed)
- **Mobile Client**: Expo/React Native

---

## 1. Database Deployment (Supabase)

Supabase provides a powerful PostgreSQL database that scales perfectly for this application.

1.  **Create Project**: Sign up at [supabase.com](https://supabase.com) and create a new project.
2.  **Database Connection**:
    - Go to **Project Settings** → **Database**.
    - Under **Connection string**, select **URI**.
    - Copy the URI (e.g., `postgresql://postgres:[YOUR-PASSWORD]@db.[REF].supabase.co:5432/postgres`).
    - **Keep your password safe; you'll need it for the backend setup.**

---

## 2. Backend Deployment (API)

Since the backend is built with Express/Node.js, it needs a hosting provider that supports Node.js processes.

### Option A: Render (Recommended)

1.  Go to [Render.com](https://render.com).
2.  **New +** → **Web Service**.
3.  Connect your GitHub repository.
4.  Configure:
    - **Root Directory**: `backend`
    - **Build Command**: `npm install`
    - **Start Command**: `npm start`
5.  **Environment Variables**:
    - `DATABASE_URL`: Your Supabase URI.
    - `DB_SSL`: `true`
    - `NODE_ENV`: `production`

### Option B: Railway

1.  `cd backend`
2.  `railway login`
3.  `railway init`
4.  Set variables:
    - `railway variables set DATABASE_URL="your_supabase_uri"`
    - `railway variables set DB_SSL="true"`
    - `railway variables set NODE_ENV="production"`
5.  `railway up`

---

## 3. Admin Panel Deployment (Vercel)

The admin panel is built with Next.js and is optimized for Vercel.

1.  Link your repository in the Vercel dashboard.
2.  Set **Root Directory** to `admin`.
3.  **Environment Variables**:
    - `NEXT_PUBLIC_API_URL`: The URL of your deployed backend (from Render/Railway).
4.  Deploy.

---

## 4. Environment Variables Reference

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://postgres:password@db.reference.supabase.co:5432/postgres
DB_SSL=true
NODE_ENV=production
PORT=5000
```

### Admin (`admin/.env.local`)

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

---

## 🛠️ Quick Deployment Script

You can use the included helper script to guide you through the process:

```bash
chmod +x deploy.sh
./deploy.sh
```

Follow the prompts to set up your Supabase connection and deploy the backend.
