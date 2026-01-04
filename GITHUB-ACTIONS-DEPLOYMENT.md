# 🚀# GitHub Actions Deployment Guide

This guide explains how to set up automated deployment to Plesk using GitHub Actions with **FTP**.

## Overview

We have two separate workflows:

1. **Backend Deployment** (`deploy-backend.yml`) - Deploys Node.js backend to `api.fitflow.id`
2. **Admin Deployment** (`deploy-admin.yml`) - Deploys Next.js admin panel to `fitflow.id`

Both workflows use **FTP** for file transfer since SSH is not available on the hosting provider.

---

## Prerequisites

### 1. FTP Access Information

You need the following information from your Plesk hosting:

#### For Admin Panel (fitflow.id):

- **FTP Server**: `cpkh07.kilathosting.id`
- **FTP Username**: Your Plesk FTP username
- **FTP Password**: Your Plesk FTP password
- **FTP Port**: `21` (default FTP port)
- **Remote Directory**: `/httpdocs`

#### For Backend (api.fitflow.id):

- **FTP Server**: `cpkh07.kilathosting.id`
- **FTP Username**: Your Plesk FTP username for API subdomain
- **FTP Password**: Your Plesk FTP password for API subdomain
- **FTP Port**: `21` (default FTP port)
- **Remote Directory**: `/httpdocs`

### 2. Environment Variables

You need to prepare these values:

- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CORS_ORIGIN` - Allowed CORS origins (e.g., `https://fitflow.id`)
- `NEXT_PUBLIC_API_URL` - Backend API URL (e.g., `https://api.fitflow.id`)
- `NEXT_PUBLIC_ROOT_DOMAIN` - Root domain (e.g., `fitflow.id`)

---

## Setup Instructions

### Step 1: Get FTP Credentials from Plesk

1. **Login to Plesk**: https://cpkh07.kilathosting.id:8443
2. **For Admin Panel (fitflow.id)**:
   - Go to **Websites & Domains** → **fitflow.id**
   - Click **FTP Access**
   - Note down the FTP username and password
   - If no FTP account exists, create one

3. **For Backend (api.fitflow.id)**:
   - Go to **Websites & Domains** → **api.fitflow.id**
   - Click **FTP Access**
   - Note down the FTP username and password
   - If no FTP account exists, create one

### Step 2: Add Secrets to GitHub Repository

Go to your GitHub repository: https://github.com/falconilham/gym-nexus/settings/secrets/actions

Click **"New repository secret"** and add the following secrets:

#### Admin Panel Secrets:

```
FTP_SERVER = cpkh07.kilathosting.id
FTP_USERNAME = [your-fitflow-ftp-username]
FTP_PASSWORD = [your-fitflow-ftp-password]
FTP_PORT = 21
NEXT_PUBLIC_API_URL = https://api.fitflow.id
NEXT_PUBLIC_ROOT_DOMAIN = fitflow.id
```

#### Backend Secrets:

```
BACKEND_FTP_SERVER = cpkh07.kilathosting.id
BACKEND_FTP_USERNAME = [your-api-ftp-username]
BACKEND_FTP_PASSWORD = [your-api-ftp-password]
BACKEND_FTP_PORT = 21
BACKEND_PORT = 5000
DATABASE_URL = [your-postgresql-connection-string]
JWT_SECRET = [your-jwt-secret-key]
CORS_ORIGIN = https://fitflow.id
```

---

## How It Works

### Backend Deployment Workflow

When you push changes to `backend/**` or manually trigger the workflow:

1. **Checkout code** from GitHub
2. **Setup Node.js** v20
3. **Install dependencies** (production only)
4. **Prepare deployment files**:
   - Copy `src/`, `node_modules/`, `package.json`
   - Create `.env` file with secrets
   - Create `start.sh` script
5. **Deploy via FTP** to `/httpdocs` on `api.fitflow.id`
6. **Show deployment summary**

### Admin Deployment Workflow

When you push changes to `admin/**` or manually trigger the workflow:

1. **Checkout code** from GitHub
2. **Setup Node.js** v20
3. **Install dependencies**
4. **Build Next.js app** with production environment variables
5. **Prepare deployment files**:
   - Copy standalone build from `.next/standalone/`
   - Copy static files from `.next/static/`
   - Copy `public/` directory
   - Create `start.sh` script
6. **Deploy via FTP** to `/httpdocs` on `fitflow.id`
7. **Show deployment summary**

---

## Manual Deployment Trigger

You can manually trigger deployments from GitHub Actions:

1. Go to: https://github.com/falconilham/gym-nexus/actions
2. Select the workflow you want to run:
   - **Deploy Admin to Plesk**
   - **Deploy Backend to Plesk**
3. Click **"Run workflow"** → **"Run workflow"**

---

## Post-Deployment Steps

### Starting the Application on Plesk

Since FTP only uploads files and cannot execute commands, you need to manually start the application via Plesk:

#### For Backend (api.fitflow.id):

1. Login to Plesk
2. Go to **Websites & Domains** → **api.fitflow.id**
3. Click **Node.js**
4. Configure:
   - **Application Mode**: Production
   - **Application Root**: `/httpdocs`
   - **Application Startup File**: `src/index.js`
   - **Node.js Version**: 20.x
5. Click **Enable Node.js**
6. Click **Restart App**

#### For Admin Panel (fitflow.id):

1. Login to Plesk
2. Go to **Websites & Domains** → **fitflow.id**
3. Click **Node.js**
4. Configure:
   - **Application Mode**: Production
   - **Application Root**: `/httpdocs`
   - **Application Startup File**: `server.js`
   - **Node.js Version**: 20.x
5. Click **Enable Node.js**
6. Click **Restart App**

---

## Troubleshooting

### FTP Connection Failed

**Error**: `Failed to connect to FTP server`

**Solution**:

1. Verify FTP credentials in GitHub Secrets
2. Check if FTP port is correct (usually `21`)
3. Ensure FTP is enabled in Plesk for the domain
4. Check firewall settings

### Files Not Uploading

**Error**: `Permission denied` or `Cannot create directory`

**Solution**:

1. Check FTP user has write permissions
2. Verify the remote directory path is correct (`/httpdocs`)
3. Check disk space on hosting

### Application Not Starting

**Error**: Application doesn't respond after deployment

**Solution**:

1. Login to Plesk
2. Go to **Node.js** settings for the domain
3. Click **Restart App**
4. Check **Logs** for error messages
5. Verify environment variables are set correctly

### Database Connection Failed

**Error**: `Cannot connect to database`

**Solution**:

1. Verify `DATABASE_URL` secret is correct
2. Check if database server allows connections from Plesk server
3. Verify database credentials and database name

---

## Security Notes

1. **Never commit secrets** to the repository
2. **Use strong passwords** for FTP accounts
3. **Rotate credentials** periodically
4. **Use HTTPS** for all API and admin panel access
5. **Keep dependencies updated** to patch security vulnerabilities

---

## Monitoring

After deployment, monitor your application:

1. **Check GitHub Actions logs**: https://github.com/falconilham/gym-nexus/actions
2. **Check Plesk logs**:
   - Go to **Websites & Domains** → **[domain]** → **Logs**
3. **Test endpoints**:
   - Admin: https://fitflow.id
   - API: https://api.fitflow.id/health

---

## Next Steps

1. ✅ Set up FTP credentials in Plesk
2. ✅ Add all secrets to GitHub
3. ✅ Test manual deployment
4. ✅ Configure Node.js in Plesk
5. ✅ Verify application is running
6. ✅ Set up monitoring and alerts
7. Pastikan remote path `/httpdocs` accessible
8. Check disk space di hosting

## 🚦 Deployment Flow

```
┌─────────────────┐
│  Push to main   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GitHub Actions  │
│   Triggered     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Install deps   │
│  & Build app    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Deploy files   │
│   via SFTP      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Restart app    │
│   via SSH       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   ✅ LIVE!      │
└─────────────────┘
```

## 📝 Best Practices

### 1. **Test Locally First**

Selalu test build di local sebelum push:

```bash
npm run build:prod
```

### 2. **Use Staging Branch**

Buat branch `staging` untuk test deployment:

```yaml
on:
  push:
    branches:
      - main
      - staging # Add this
```

### 3. **Monitor Logs**

Selalu check deployment logs di GitHub Actions

### 4. **Backup Before Deploy**

Plesk biasanya auto-backup, tapi bisa manual backup juga:

```bash
ssh fitflowid@cpkh07.kilathosting.id
cd /httpdocs
tar -czf backup-$(date +%Y%m%d).tar.gz .
```

### 5. **Environment Variables**

Jangan commit `.env` file! Gunakan GitHub Secrets

## 🎨 Custom Deployment Script

Jika Anda perlu custom deployment, edit file `.github/workflows/deploy-admin.yml`:

```yaml
- name: Custom Deploy Step
  run: |
    # Your custom commands here
    echo "Running custom deployment..."
```

## 📞 Support

Jika ada masalah:

1. Check GitHub Actions logs
2. Check Plesk error logs: `/httpdocs/app.log`
3. Test SSH connection manual
4. Verify all secrets di GitHub

## 🎉 Success Indicators

Deployment berhasil jika:

- ✅ GitHub Actions workflow selesai dengan status green
- ✅ Website accessible di https://fitflow.id
- ✅ API accessible di https://api.fitflow.id
- ✅ No errors di browser console

---

**Happy Deploying! 🚀**
