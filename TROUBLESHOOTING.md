# Troubleshooting Guide - FitFlow Deployment

## SSL Certificate Error

### Error yang Muncul:

```
[CHD1909: fitflow.id:4430 server certificate does NOT include an ID which matches the server name
```

### Penyebab:

- SSL certificate tidak cocok dengan domain `fitflow.id`
- Certificate mungkin untuk domain lain atau self-signed
- Apache/Nginx menggunakan certificate yang salah

### Solusi:

#### 1. Install SSL Certificate yang Benar (Let's Encrypt - GRATIS)

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-apache

# Generate certificate untuk fitflow.id
sudo certbot --apache -d fitflow.id -d www.fitflow.id

# Atau untuk Nginx:
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d fitflow.id -d www.fitflow.id
```

#### 2. Verifikasi Certificate

```bash
# Cek certificate yang terinstall
sudo certbot certificates

# Test SSL
openssl s_client -connect fitflow.id:443 -servername fitflow.id
```

#### 3. Update Apache/Nginx Configuration

**Untuk Apache (`/etc/apache2/sites-available/fitflow.conf`):**

```apache
<VirtualHost *:443>
    ServerName fitflow.id
    ServerAlias www.fitflow.id

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/fitflow.id/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/fitflow.id/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf

    # Proxy ke Node.js
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>

# Redirect HTTP to HTTPS
<VirtualHost *:80>
    ServerName fitflow.id
    ServerAlias www.fitflow.id
    Redirect permanent / https://fitflow.id/
</VirtualHost>
```

**Untuk Nginx (`/etc/nginx/sites-available/fitflow`):**

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name fitflow.id www.fitflow.id;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name fitflow.id www.fitflow.id;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/fitflow.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fitflow.id/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Node.js
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
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 4. Restart Web Server

```bash
# Apache
sudo systemctl restart apache2
sudo systemctl status apache2

# Nginx
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
sudo systemctl status nginx
```

---

## Error 500 - Internal Server Error

### Penyebab Umum:

1. Backend tidak running
2. Database connection error
3. Environment variables tidak benar
4. Permission issues

### Solusi:

#### 1. Cek Backend Status

```bash
# Jika menggunakan PM2
pm2 status
pm2 logs fitflow-server

# Jika menggunakan systemd
sudo systemctl status fitflow
sudo journalctl -u fitflow -f
```

#### 2. Cek Database Connection

```bash
# Test MySQL connection
mysql -u fitflow_user -p fitflow_db

# Cek DATABASE_URL di .env
cat backend/.env.production | grep DATABASE_URL
```

#### 3. Cek Environment Variables

```bash
# Pastikan .env.production ada dan benar
cat backend/.env.production

# Cek JWT_SECRET, DATABASE_URL, dll
```

#### 4. Cek Permissions

```bash
# Fix ownership
sudo chown -R www-data:www-data /home/user/gym-nexus

# Fix permissions
chmod -R 755 /home/user/gym-nexus
chmod -R 777 /home/user/gym-nexus/backend/uploads
```

---

## Favicon.ico Error

### Error:

```
GET /favicon.ico HTTP/1.0 - 500 Error
```

### Solusi:

#### 1. Tambahkan Favicon ke Public Folder

```bash
# Di admin-build/public/
# Pastikan ada file favicon.ico
ls -la admin-build/public/favicon.ico
```

#### 2. Update HTML Head (jika perlu)

Di `admin/src/app/layout.tsx`, pastikan ada:

```tsx
export const metadata = {
  title: 'FitFlow',
  description: 'Gym Management System',
  icons: {
    icon: '/favicon.ico',
  },
};
```

---

## Port Issues

### Error: Port Already in Use

```bash
# Cek process di port 3000
sudo lsof -i :3000
sudo netstat -tulpn | grep 3000

# Kill process
sudo kill -9 <PID>

# Atau gunakan port lain
PORT=8080 node server.js
```

---

## Apache/Nginx Not Proxying Correctly

### Cek Proxy Modules

**Apache:**

```bash
# Enable required modules
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod ssl
sudo a2enmod headers
sudo systemctl restart apache2
```

**Nginx:**

```bash
# Nginx biasanya sudah include proxy module
# Cek config syntax
sudo nginx -t
```

---

## Auto-Renewal SSL Certificate

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot biasanya sudah setup cron job otomatis
# Cek cron job:
sudo systemctl list-timers | grep certbot
```

---

## Monitoring & Debugging

### Real-time Logs

```bash
# PM2
pm2 logs fitflow-server --lines 100

# systemd
sudo journalctl -u fitflow -f

# Apache
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/apache2/access.log

# Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Health Check

```bash
# Test local
curl http://localhost:3000/health

# Test public
curl https://fitflow.id/health
curl https://fitflow.id/api/
```

---

## Quick Fix Checklist

Jika ada masalah, cek ini secara berurutan:

- [ ] Backend server running? (`pm2 status` atau `systemctl status fitflow`)
- [ ] Database running? (`sudo systemctl status mysql`)
- [ ] Database connection OK? (cek DATABASE_URL di .env)
- [ ] SSL certificate valid? (`sudo certbot certificates`)
- [ ] Web server running? (`systemctl status apache2/nginx`)
- [ ] Proxy configuration correct? (cek config file)
- [ ] Port 3000 accessible? (`curl http://localhost:3000`)
- [ ] Firewall allow port 80/443? (`sudo ufw status`)
- [ ] DNS pointing to server? (`nslookup fitflow.id`)
- [ ] Permissions correct? (`ls -la /home/user/gym-nexus`)

---

## Contact & Support

Jika masih ada masalah setelah mengikuti panduan ini:

1. Cek logs lengkap
2. Screenshot error message
3. Catat langkah-langkah yang sudah dilakukan
4. Dokumentasikan environment (OS, Node version, dll)
