# Quick Deployment Reference

## 🚀 Fastest Way to Deploy

### Backend → Railway

```bash
cd backend
npx @railway/cli login
npx @railway/cli init
npx @railway/cli up
```

### Admin → Vercel

```bash
cd admin
npx vercel
npx vercel --prod
```

---

## 📋 Platform Comparison

| Platform    | Best For        | Free Tier       | Database      | Setup Time |
| ----------- | --------------- | --------------- | ------------- | ---------- |
| **Railway** | Backend         | $5 credit/mo    | ✅ PostgreSQL | 5 min      |
| **Render**  | Backend         | 750 hrs/mo      | ✅ PostgreSQL | 10 min     |
| **Vercel**  | Admin (Next.js) | 100GB bandwidth | ❌            | 3 min      |
| **Netlify** | Admin           | 100GB bandwidth | ❌            | 5 min      |

---

## 🎯 Recommended Stack (Free)

```
Backend:  Railway  → https://railway.app
Admin:    Vercel   → https://vercel.com
Database: Railway PostgreSQL (included)
```

**Total Cost:** $0/month

---

## ⚡ One-Command Deployment

Use the interactive script:

```bash
./deploy.sh
```

Or use the helper script for GitHub push:

```bash
./push-to-github.sh
```

---

## 🔧 Environment Variables

### Backend (.env)

```env
PORT=5000
DATABASE_URL=postgresql://...
NODE_ENV=production
```

### Admin (.env.local)

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

---

## 📖 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guides.

---

## 🆘 Quick Help

**Backend not starting?**

- Check `PORT` environment variable
- Verify database connection
- Check logs: `railway logs` or `heroku logs --tail`

**Admin build failing?**

- Verify `NEXT_PUBLIC_API_URL` is set
- Check Node.js version (18+)
- Review build logs in platform dashboard

**Database connection failed?**

- Copy `DATABASE_URL` from platform
- Ensure database is running
- Check firewall/IP whitelist

---

## 🔗 Useful Links

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
