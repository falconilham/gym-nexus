# 🚀 GitHub Actions Auto-Deployment Guide

Panduan lengkap untuk setup auto-deployment dari GitHub ke Plesk hosting menggunakan GitHub Actions.

## 📋 Overview

Setiap kali Anda push code ke branch `main`, GitHub Actions akan otomatis:

1. ✅ Build aplikasi
2. ✅ Deploy ke Plesk hosting
3. ✅ Restart aplikasi

## 🔧 Setup GitHub Secrets

Anda perlu menambahkan secrets di GitHub repository untuk credentials hosting.

### Cara Menambahkan Secrets:

1. Buka repository di GitHub
2. Klik **Settings** → **Secrets and variables** → **Actions**
3. Klik **New repository secret**
4. Tambahkan secrets berikut:

### Admin App Secrets:

| Secret Name               | Description      | Example                        |
| ------------------------- | ---------------- | ------------------------------ |
| `FTP_SERVER`              | Hostname Plesk   | `cpkh07.kilathosting.id`       |
| `FTP_USERNAME`            | SSH/FTP username | `fitflowid`                    |
| `FTP_PORT`                | SSH port         | `22`                           |
| `SSH_PRIVATE_KEY`         | SSH private key  | (lihat cara generate di bawah) |
| `NEXT_PUBLIC_API_URL`     | Backend API URL  | `https://api.fitflow.id`       |
| `NEXT_PUBLIC_ROOT_DOMAIN` | Root domain      | `fitflow.id`                   |

### Backend API Secrets:

| Secret Name               | Description          | Example                  |
| ------------------------- | -------------------- | ------------------------ |
| `BACKEND_FTP_SERVER`      | Backend hostname     | `cpkh07.kilathosting.id` |
| `BACKEND_FTP_USERNAME`    | Backend SSH username | `apifitflowid`           |
| `BACKEND_FTP_PORT`        | Backend SSH port     | `22`                     |
| `BACKEND_SSH_PRIVATE_KEY` | Backend SSH key      | (lihat cara generate)    |
| `DATABASE_URL`            | Database connection  | `postgresql://...`       |
| `JWT_SECRET`              | JWT secret key       | `your-secret-key`        |
| `CORS_ORIGIN`             | CORS allowed origins | `https://fitflow.id`     |
| `BACKEND_PORT`            | Backend port         | `5000`                   |

## 🔑 Generate SSH Key untuk GitHub Actions

### 1. Generate SSH Key Pair

Di komputer lokal Anda:

```bash
# Generate new SSH key
ssh-keygen -t ed25519 -C "github-actions@fitflow.id" -f ~/.ssh/github_actions_fitflow

# Akan menghasilkan 2 file:
# - github_actions_fitflow (private key) → untuk GitHub Secret
# - github_actions_fitflow.pub (public key) → untuk Plesk
```

### 2. Copy Public Key ke Plesk

```bash
# Lihat public key
cat ~/.ssh/github_actions_fitflow.pub

# Copy output-nya, lalu tambahkan ke Plesk:
# Plesk → SSH Access → Authorized Keys → Add Key
```

**Atau via SSH:**

```bash
# Upload public key ke server
ssh-copy-id -i ~/.ssh/github_actions_fitflow.pub fitflowid@cpkh07.kilathosting.id
```

### 3. Copy Private Key ke GitHub Secret

```bash
# Lihat private key
cat ~/.ssh/github_actions_fitflow

# Copy SELURUH output (termasuk -----BEGIN dan -----END)
# Paste ke GitHub Secret: SSH_PRIVATE_KEY
```

## 📁 Workflow Files

### Admin Deployment (`.github/workflows/deploy-admin.yml`)

**Trigger:**

- Push ke `main` branch dengan perubahan di folder `admin/`
- Manual trigger via GitHub UI

**Steps:**

1. Checkout code
2. Setup Node.js 20
3. Install dependencies
4. Build Next.js app
5. Prepare deployment files (standalone + static)
6. Deploy via SFTP
7. Restart app via SSH

### Backend Deployment (`.github/workflows/deploy-backend.yml`)

**Trigger:**

- Push ke `main` branch dengan perubahan di folder `backend/`
- Manual trigger via GitHub UI

**Steps:**

1. Checkout code
2. Setup Node.js 20
3. Install production dependencies
4. Prepare deployment files
5. Deploy via SFTP
6. Setup environment & restart

## 🎯 Manual Trigger

Anda bisa trigger deployment manual tanpa push code:

1. Buka repository di GitHub
2. Klik **Actions** tab
3. Pilih workflow (Deploy Admin / Deploy Backend)
4. Klik **Run workflow** → **Run workflow**

## 📊 Monitoring Deployment

### Melihat Deployment Logs:

1. Buka **Actions** tab di GitHub
2. Klik workflow run yang sedang berjalan
3. Klik job "Build and Deploy Admin" atau "Deploy Backend"
4. Lihat logs real-time

### Deployment Status:

- ✅ **Green checkmark**: Deployment berhasil
- ❌ **Red X**: Deployment gagal (klik untuk lihat error)
- 🟡 **Yellow dot**: Sedang berjalan

## 🔍 Troubleshooting

### Error: "Permission denied (publickey)"

**Solusi:**

1. Pastikan SSH public key sudah ditambahkan ke Plesk
2. Verify private key di GitHub Secret benar (termasuk header/footer)
3. Test SSH connection manual:
   ```bash
   ssh -i ~/.ssh/github_actions_fitflow fitflowid@cpkh07.kilathosting.id
   ```

### Error: "npm ci failed"

**Solusi:**

1. Pastikan `package-lock.json` ada di repository
2. Commit `package-lock.json`:
   ```bash
   git add package-lock.json
   git commit -m "Add package-lock.json"
   git push
   ```

### Error: "Build failed"

**Solusi:**

1. Test build di local terlebih dahulu:
   ```bash
   cd admin
   npm run build:prod
   ```
2. Fix error yang muncul
3. Push fix ke GitHub

### Error: "SFTP upload failed"

**Solusi:**

1. Verify FTP credentials di GitHub Secrets
2. Pastikan remote path `/httpdocs` accessible
3. Check disk space di hosting

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
