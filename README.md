# 🏋️ Gym Nexus - Multi-Tenant Gym Management System

Modern, scalable gym management platform with multi-tenant architecture.

## 🌟 Features

- 🏢 **Multi-tenant Architecture**: Each gym gets their own subdomain
- 👥 **Member Management**: Track members, memberships, and attendance
- 📅 **Class Scheduling**: Manage classes, trainers, and bookings
- 📊 **Analytics & Reports**: Real-time insights and performance metrics
- 💳 **Payment Integration**: Membership payments and billing
- 📱 **QR Code Check-in**: Fast and contactless attendance tracking
- 🌐 **Multi-language Support**: i18n ready (English, Indonesian)

## 🏗️ Project Structure

```
gym-nexus/
├── admin/          # Next.js admin dashboard (multi-tenant)
├── backend/        # Node.js/Express API server
├── client/         # Member mobile app (future)
└── .github/        # GitHub Actions workflows
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### Local Development

1. **Clone repository**

   ```bash
   git clone https://github.com/falconilham/gym-nexus.git
   cd gym-nexus
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment**

   ```bash
   # Admin
   cp admin/.env.example admin/.env.local

   # Backend
   cp backend/.env.example backend/.env
   ```

4. **Run development servers**

   ```bash
   # Admin (port 3000)
   cd admin
   npm run dev

   # Backend (port 5000)
   cd backend
   npm run dev
   ```

5. **Access applications**
   - Admin: http://localhost:3000
   - API: http://localhost:5000

## 📦 Deployment

### Option 1: GitHub Actions (Recommended)

Auto-deploy to Plesk hosting on every push to `main`:

1. **Setup SSH keys**

   ```bash
   ./scripts/generate-ssh-key.sh
   ```

2. **Add GitHub Secrets**
   - See [GITHUB-ACTIONS-DEPLOYMENT.md](./GITHUB-ACTIONS-DEPLOYMENT.md)

3. **Push to main**
   ```bash
   git push origin main
   ```

### Option 2: Manual Deployment

See detailed guides:

- [Admin Deployment](./DEPLOYMENT-ADMIN.md)
- [Backend Deployment](./DEPLOYMENT-BACKEND.md)

## 🛠️ Tech Stack

### Admin Dashboard

- **Framework**: Next.js 16 (App Router)
- **UI**: Material-UI (MUI) + Tailwind CSS
- **State**: React Context + Hooks
- **i18n**: react-i18next
- **Build**: Standalone output for Node.js hosting

### Backend API

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT
- **Validation**: Joi

## 📚 Documentation

- [GitHub Actions Deployment](./GITHUB-ACTIONS-DEPLOYMENT.md)
- [Admin Deployment Guide](./DEPLOYMENT-ADMIN.md)
- [Backend Deployment Guide](./DEPLOYMENT-BACKEND.md)
- [API Documentation](./backend/API.md) (coming soon)

## 🔧 Development Scripts

### Admin

```bash
npm run dev          # Development server
npm run dev:prod     # Dev with production env
npm run build        # Production build
npm run build:prod   # Build with production env
npm run start        # Start production server
```

### Backend

```bash
npm run dev          # Development with nodemon
npm start            # Production server
npm run migrate      # Run database migrations
npm run seed         # Seed database
```

## 🌐 Multi-Tenant Architecture

Each gym gets their own subdomain:

- `powerhouse.fitflow.id` → Powerhouse Gym
- `fitzone.fitflow.id` → Fitzone Gym
- `admin.fitflow.id` → Super Admin Portal

## 🔐 Environment Variables

### Admin (.env.production)

```env
NEXT_PUBLIC_API_URL=https://api.fitflow.id
NEXT_PUBLIC_ROOT_DOMAIN=fitflow.id
```

### Backend (.env)

```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://fitflow.id
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Ilham Falcon**

- GitHub: [@falconilham](https://github.com/falconilham)

## 🙏 Acknowledgments

- Next.js team for amazing framework
- Material-UI for beautiful components
- Vercel for hosting inspiration

---

**Built with ❤️ for fitness enthusiasts**
