# GymNexus - Vercel Deployment Guide

Since you want to deploy **Frontend (Admin)** and **Backend (API)** to Vercel, and use **Supabase** for the database, follow these exact steps.

---

## 🌎 Part 1: Database (Supabase)

_You already did this!_

1.  **Host**: `db.xazvmooeoqhnsgandvnf.supabase.co`
2.  **Connection String**: `postgresql://postgres:[YOUR-PASSWORD]@db.xazvmooeoqhnsgandvnf.supabase.co:5432/postgres`

---

## 🚀 Part 2: Backend Deployment (Vercel)

1.  **Push your code** to a GitHub repository (if you haven't already).
2.  Go to [Vercel Dashboard](https://vercel.com/dashboard) -> **Add New...** -> **Project**.
3.  Import your GitHub repository `gym-nexus`.
4.  **Configure Project:**
    - **Project Name**: `gym-nexus-backend`
    - **Root Directory**: Click "Edit" and select `backend`.
    - **Framework Preset**: Select `Other` (or leave as default).
    - **Environment Variables**:
      - `DATABASE_URL`: _(Paste your Supabase connection string)_
      - `DB_SSL`: `true`
      - `NODE_ENV`: `production`
5.  Click **Deploy**.

**✅ Copy the URL:**
Once deployed, Vercel will give you a URL (e.g., `https://gym-nexus-backend.vercel.app`).
**Testing**: Visit `https://gym-nexus-backend.vercel.app/`. You should see "GymNexus API is running".

---

## 💻 Part 3: Admin Deployment (Vercel)

1.  Go to [Vercel Dashboard](https://vercel.com/dashboard) -> **Add New...** -> **Project**.
2.  Import the **SAME** GitHub repository `gym-nexus`.
3.  **Configure Project:**
    - **Project Name**: `gym-nexus-admin`
    - **Root Directory**: Click "Edit" and select `admin`.
    - **Framework Preset**: Vercel should automatically detect `Next.js`.
    - **Environment Variables**:
      - `NEXT_PUBLIC_API_URL`: _(Paste the backend URL from Part 2, e.g., `https://gym-nexus-backend.vercel.app`)_
4.  Click **Deploy**.

**✅ Success!**
You can now access your Admin Panel at `https://gym-nexus-admin.vercel.app`.

---

## ⚡ Important Notes

- **Background Jobs:** The backend `suspensionChecker` (automatic suspension of expired members) **will not work** accurately on Vercel because Vercel functions go significantly to sleep. You should set up a **Cron Job** (Vercel Cron) to hit your API once a day if this feature is critical.
- **CORS**: If you get CORS errors, you might need to update `backend/index.js` to explicitly allow your new Admin URL. currently `app.use(cors())` allows everything, which is fine for now.
