# Panduan Deployment Backend

## Backend TIDAK Perlu Di-Build

Backend menggunakan **Node.js + Express.js** dengan JavaScript murni, sehingga **TIDAK memerlukan proses build/compile**.

---

## File & Folder yang Harus Diupload

Upload file dan folder berikut ke server production:

### 1. Root Project Files

```
gym-nexus/
├── app.js                    # Main server entry point
├── package.json              # Root package.json
├── package-production.json   # Production dependencies
├── .env.production           # Root environment variables
└── node_modules/             # Root dependencies (atau install di server)
```

### 2. Backend Folder

```
backend/
├── index.js                  # Backend Express app
├── database.js               # Database models & connection
├── package.json              # Backend package.json
├── .env.production           # Backend environment variables
├── routes/                   # API routes
│   ├── admin.js
│   ├── auth.js
│   └── super-admin.js
├── middleware/               # Express middleware
│   ├── auth.js
│   └── errorHandler.js
├── jobs/                     # Background jobs
│   └── suspensionChecker.js
├── uploads/                  # Upload directory (create if not exists)
└── node_modules/             # Backend dependencies (atau install di server)
```

### 3. Admin Build (Sudah dibuat sebelumnya)

```
admin-build/                  # Hasil build admin panel
```

---

## Cara Deploy Backend

### Opsi 1: Upload Semua File (Termasuk node_modules)

**Kelebihan:** Langsung jalan tanpa install dependencies  
**Kekurangan:** Upload lebih lama karena ukuran besar

```bash
# Upload seluruh folder gym-nexus ke server
scp -r gym-nexus/ user@fitflow.id:/home/user/
```

### Opsi 2: Upload Tanpa node_modules (Recommended)

**Kelebihan:** Upload lebih cepat  
**Kekurangan:** Perlu install dependencies di server

```bash
# 1. Exclude node_modules saat upload
rsync -av --exclude 'node_modules' \
          --exclude 'admin/.next' \
          --exclude 'admin/node_modules' \
          gym-nexus/ user@fitflow.id:/home/user/gym-nexus/

# 2. SSH ke server dan install dependencies
ssh user@fitflow.id
cd /home/user/gym-nexus

# Install root dependencies
npm install --production

# Install backend dependencies
cd backend
npm install --production
```

---

## Environment Variables

### 1. Root `.env.production`

```env
NODE_ENV=production
PORT=3000
```

### 2. Backend `.env.production`

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/fitflow_db

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server
PORT=3001
NODE_ENV=production

# CORS
CORS_ORIGIN=https://fitflow.id

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Session
SESSION_SECRET=your-session-secret-key
```

**⚠️ PENTING:** Ganti semua secret keys dengan nilai yang aman untuk production!

---

## Menjalankan Backend di Server

### Menggunakan PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start server dengan PM2
cd /home/user/gym-nexus
pm2 start app.js --name "fitflow-server"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Jalankan command yang ditampilkan oleh PM2

# Monitor logs
pm2 logs fitflow-server

# Status
pm2 status
```

### Menggunakan systemd

Buat file `/etc/systemd/system/fitflow.service`:

```ini
[Unit]
Description=FitFlow Server
After=network.target mysql.service

[Service]
Type=simple
User=your-user
WorkingDirectory=/home/your-user/gym-nexus
ExecStart=/usr/bin/node app.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=fitflow

Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Kemudian:

```bash
sudo systemctl daemon-reload
sudo systemctl enable fitflow
sudo systemctl start fitflow
sudo systemctl status fitflow
```

### Manual (Development/Testing Only)

```bash
cd /home/user/gym-nexus
node app.js
```

---

## Database Setup

### 1. Install MySQL/MariaDB

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# Start MySQL
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 2. Create Database & User

```sql
-- Login ke MySQL
sudo mysql -u root -p

-- Create database
CREATE DATABASE fitflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'fitflow_user'@'localhost' IDENTIFIED BY 'your-secure-password';

-- Grant privileges
GRANT ALL PRIVILEGES ON fitflow_db.* TO 'fitflow_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit
EXIT;
```

### 3. Update DATABASE_URL

Edit `backend/.env.production`:

```env
DATABASE_URL=mysql://fitflow_user:your-secure-password@localhost:3306/fitflow_db
```

### 4. Database akan Auto-Initialize

Saat server pertama kali dijalankan, database akan otomatis:

- Membuat tabel-tabel yang diperlukan (via Sequelize sync)
- Menjalankan seeding data awal (via `seedDatabase()`)

---

## Nginx Configuration (Reverse Proxy)

Jika menggunakan Nginx sebagai reverse proxy:

```nginx
server {
    listen 80;
    server_name fitflow.id www.fitflow.id;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name fitflow.id www.fitflow.id;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/fitflow.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fitflow.id/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Test dan reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL Certificate (HTTPS)

### Menggunakan Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d fitflow.id -d www.fitflow.id

# Auto-renewal (certbot biasanya sudah setup cron job otomatis)
sudo certbot renew --dry-run
```

---

## Verifikasi Deployment

### 1. Cek Service Status

```bash
# PM2
pm2 status
pm2 logs fitflow-server

# systemd
sudo systemctl status fitflow
sudo journalctl -u fitflow -f
```

### 2. Cek Database Connection

```bash
# Login ke MySQL
mysql -u fitflow_user -p fitflow_db

# Cek tables
SHOW TABLES;

# Cek data
SELECT * FROM Gyms;
SELECT * FROM Users;
```

### 3. Test API Endpoints

```bash
# Health check
curl http://localhost:3000/health

# API test
curl http://localhost:3000/api/

# From outside
curl https://fitflow.id/health
curl https://fitflow.id/api/
```

### 4. Test Admin Panel

- Buka browser: `https://fitflow.id`
- Login super admin: `https://fitflow.id/super-admin/login`

---

## Monitoring & Logs

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Logs
pm2 logs fitflow-server
pm2 logs fitflow-server --lines 100

# Flush logs
pm2 flush
```

### systemd Logs

```bash
# View logs
sudo journalctl -u fitflow -f

# Last 100 lines
sudo journalctl -u fitflow -n 100

# Today's logs
sudo journalctl -u fitflow --since today
```

---

## Troubleshooting

### Server tidak bisa start

```bash
# Cek port 3000 sudah digunakan atau belum
sudo netstat -tulpn | grep 3000
sudo lsof -i :3000

# Kill process jika perlu
sudo kill -9 <PID>
```

### Database connection error

```bash
# Cek MySQL running
sudo systemctl status mysql

# Test connection
mysql -u fitflow_user -p -h localhost fitflow_db

# Cek DATABASE_URL di .env.production
cat backend/.env.production | grep DATABASE_URL
```

### Permission errors

```bash
# Fix ownership
sudo chown -R your-user:your-user /home/your-user/gym-nexus

# Fix permissions
chmod -R 755 /home/your-user/gym-nexus
chmod -R 777 /home/your-user/gym-nexus/backend/uploads
```

### Admin panel tidak muncul

```bash
# Cek apakah admin-build ada
ls -la admin-build/

# Cek static files
ls -la admin-build/.next/static/

# Restart server
pm2 restart fitflow-server
```

---

## Update Backend di Production

Untuk update backend di kemudian hari:

```bash
# 1. Backup database
mysqldump -u fitflow_user -p fitflow_db > backup_$(date +%Y%m%d).sql

# 2. Pull/upload code terbaru
cd /home/user/gym-nexus
git pull origin main
# atau upload via SCP/FTP

# 3. Install dependencies baru (jika ada)
npm install --production
cd backend && npm install --production

# 4. Restart server
pm2 restart fitflow-server

# 5. Cek logs
pm2 logs fitflow-server
```

---

## Backup Strategy

### Database Backup (Automated)

Buat cron job untuk backup otomatis:

```bash
# Edit crontab
crontab -e

# Tambahkan (backup setiap hari jam 2 pagi)
0 2 * * * mysqldump -u fitflow_user -p'your-password' fitflow_db > /home/user/backups/fitflow_$(date +\%Y\%m\%d).sql

# Keep only last 7 days
0 3 * * * find /home/user/backups/ -name "fitflow_*.sql" -mtime +7 -delete
```

### Code Backup

```bash
# Backup code (exclude node_modules)
tar -czf fitflow_backup_$(date +%Y%m%d).tar.gz \
    --exclude='node_modules' \
    --exclude='admin/.next' \
    --exclude='backend/uploads' \
    gym-nexus/
```

---

## Checklist Deployment

- [ ] Upload semua file backend ke server
- [ ] Install dependencies (`npm install --production`)
- [ ] Setup MySQL database
- [ ] Update `.env.production` dengan credentials yang benar
- [ ] Install PM2 atau setup systemd service
- [ ] Start server dan cek logs
- [ ] Setup Nginx reverse proxy
- [ ] Install SSL certificate (Let's Encrypt)
- [ ] Test API endpoints
- [ ] Test admin panel
- [ ] Setup monitoring & logging
- [ ] Setup automated database backup
- [ ] Dokumentasikan credentials di tempat aman

---

## Support

Untuk masalah deployment, cek:

1. PM2 logs: `pm2 logs fitflow-server`
2. System logs: `sudo journalctl -u fitflow -f`
3. Nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. MySQL logs: `sudo tail -f /var/log/mysql/error.log`
