# Environment Variables Configuration

This document describes the environment variables for all three workspaces in the GymNexus monorepo.

---

## 📱 Client (Mobile App)

**Location:** `client/`

### Environment Files

- `.env.example` - Template (committed)
- `.env` - Development (not committed)
- `.env.production` - Production (not committed)

### Variables

```env
# API Configuration
API_URL=https://gym-nexus-backend-production.up.railway.app

# App Configuration
APP_NAME=GymNexus
APP_VERSION=1.0.0
```

### Usage

```javascript
import { API_URL, API_ENDPOINTS } from './src/config/env';

// Fetch trainers
fetch(API_ENDPOINTS.client.trainers)
  .then(response => response.json())
  .then(data => console.log(data));
```

### Setup

```bash
cd client
cp .env.example .env
# Edit .env with your local settings
```

**Documentation:** See [client/ENV_CONFIG.md](./client/ENV_CONFIG.md)

---

## ⚙️ Admin (Web Panel)

**Location:** `admin/`  
**Platform:** Vercel

### Environment Files

- `.env.example` - Template (committed)
- `.env.local` - Local development (not committed)

### Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://gym-nexus-backend-production.up.railway.app

# App Configuration
NEXT_PUBLIC_APP_NAME=GymNexus Admin Panel
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Usage

```javascript
// In Next.js components
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

fetch(`${apiUrl}/api/admin/trainers`)
  .then(response => response.json())
  .then(data => console.log(data));
```

### Setup

**Local Development:**

```bash
cd admin
cp .env.example .env.local
# Edit .env.local with your settings
npm run dev
```

**Production (Vercel):**

- Environment variables are set in Vercel dashboard
- Auto-deployed from GitHub

**Vercel Dashboard:** https://vercel.com/falconilhams-projects/admin/settings/environment-variables

---

## 🔌 Backend (API Server)

**Location:** `backend/`  
**Platform:** Railway

### Environment Files

- `.env.example` - Template (committed)
- `.env` - Local development (not committed)

### Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database

# Or individual database settings
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gym_nexus
DB_USER=postgres
DB_PASSWORD=your_password

# CORS Configuration (optional)
ALLOWED_ORIGINS=https://admin-azure-nu.vercel.app

# JWT Secret (if using authentication)
JWT_SECRET=your-secret-key-here
```

### Usage

```javascript
// In Express routes
const port = process.env.PORT || 5000;
const dbUrl = process.env.DATABASE_URL;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

### Setup

**Local Development:**

```bash
cd backend
cp .env.example .env
# Edit .env with your local PostgreSQL settings
npm start
```

**Production (Railway):**

- Environment variables are set in Railway dashboard
- `DATABASE_URL` is automatically provided by Railway PostgreSQL
- Auto-deployed from GitHub

**Railway Dashboard:** https://railway.com/project/55f76477-fe70-4337-9dd4-7c7ac9022a98

---

## 🔄 Environment Switching

### Development

All workspaces use local environment files:

```bash
# Client
cd client && npm start
# Uses .env (API_URL=http://localhost:5000)

# Admin
cd admin && npm run dev
# Uses .env.local (NEXT_PUBLIC_API_URL=http://localhost:5000)

# Backend
cd backend && npm start
# Uses .env (local PostgreSQL)
```

### Production

Production environments are configured on hosting platforms:

- **Client:** Uses `.env.production` or build-time configuration
- **Admin:** Uses Vercel environment variables
- **Backend:** Uses Railway environment variables

---

## 📋 Quick Reference

| Workspace | Platform | Env File          | Production URL                                      |
| --------- | -------- | ----------------- | --------------------------------------------------- |
| Client    | Expo     | `.env`            | N/A (mobile app)                                    |
| Admin     | Vercel   | Vercel Dashboard  | https://admin-azure-nu.vercel.app                   |
| Backend   | Railway  | Railway Dashboard | https://gym-nexus-backend-production.up.railway.app |

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** (except `.env.example`)
2. **Use different secrets** for development and production
3. **Rotate secrets** regularly in production
4. **Use strong passwords** for databases
5. **Enable CORS** only for trusted domains
6. **Use HTTPS** in production (automatic on Vercel/Railway)

---

## 🆘 Troubleshooting

### Client can't connect to backend

1. Check `API_URL` in `client/.env`
2. Verify backend is running
3. Check network connectivity
4. For iOS simulator, use computer's IP instead of `localhost`

### Admin can't connect to backend

1. Check `NEXT_PUBLIC_API_URL` in Vercel dashboard
2. Verify backend is deployed and running
3. Check CORS settings in backend
4. Redeploy admin after changing env vars

### Backend database connection failed

1. Check `DATABASE_URL` in Railway dashboard
2. Verify PostgreSQL is running
3. Check database credentials
4. Review Railway logs for errors

---

## 📚 Related Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Deployment Summary](./DEPLOYMENT_SUMMARY.md)
- [Client Environment Config](./client/ENV_CONFIG.md)
- [Monorepo Quick Reference](./MONOREPO.md)

---

## 🔗 Platform Dashboards

- **Railway (Backend):** https://railway.com/project/55f76477-fe70-4337-9dd4-7c7ac9022a98
- **Vercel (Admin):** https://vercel.com/falconilhams-projects/admin
- **GitHub:** https://github.com/falconilham/gym-nexus
