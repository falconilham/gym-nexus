# Panduan Deployment Admin Panel

## Folder yang Harus Diupload

Upload folder **`admin-build`** ke server production Anda.

### Struktur Folder admin-build:

```
admin-build/
├── .next/                  # Compiled Next.js application
│   ├── server/            # Server-side code
│   ├── static/            # Static assets (CSS, JS)
│   └── ...                # Build manifests & configs
├── node_modules/          # Production dependencies
├── public/                # Public assets (images, SVGs)
├── .env.production        # Environment variables
├── package.json           # Package configuration
└── server.js              # Entry point untuk menjalankan admin
```

**Total Size:** ~61MB

---

## Cara Deploy ke Server

### 1. Upload Folder

Upload seluruh folder `admin-build` ke server Anda, misalnya ke:

```
/home/your-user/gym-nexus/admin-build/
```

### 2. Jalankan Admin Panel

Ada 2 cara menjalankan admin panel:

#### Opsi A: Standalone (Port Terpisah)

Jalankan admin di port terpisah (misalnya 3000):

```bash
cd /home/your-user/gym-nexus/admin-build
node server.js
```

Admin akan berjalan di `http://localhost:3000`

#### Opsi B: Integrasi dengan Backend (Recommended)

Integrasikan admin panel dengan backend Express.js Anda di `app.js`:

```javascript
// Di app.js, tambahkan setelah middleware lainnya:

// Serve admin panel
const adminPath = path.join(__dirname, 'admin-build');
app.use('/admin', express.static(path.join(adminPath, 'public')));
app.use('/admin/_next', express.static(path.join(adminPath, '.next')));

// Handle admin routes
app.get('/admin*', (req, res) => {
  const nextServer = require('./admin-build/server.js');
  // Atau gunakan proxy ke port 3000 jika admin berjalan standalone
});
```

### 3. Environment Variables

File `.env.production` sudah termasuk dalam folder `admin-build`.
Pastikan isinya sesuai dengan konfigurasi production Anda:

```env
NEXT_PUBLIC_API_URL=https://api.fitflow.id
NEXT_PUBLIC_APP_URL=https://fitflow.id
```

### 4. Konfigurasi Nginx (Jika Menggunakan)

Jika menggunakan Nginx sebagai reverse proxy:

```nginx
# Admin panel
location /admin {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

---

## Cara Menjalankan di Server

### Menggunakan PM2 (Recommended)

```bash
# Install PM2 jika belum
npm install -g pm2

# Jalankan admin panel
cd /home/your-user/gym-nexus/admin-build
pm2 start server.js --name "gym-admin"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Menggunakan systemd

Buat file service `/etc/systemd/system/gym-admin.service`:

```ini
[Unit]
Description=Gym Nexus Admin Panel
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/home/your-user/gym-nexus/admin-build
ExecStart=/usr/bin/node server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Kemudian:

```bash
sudo systemctl daemon-reload
sudo systemctl enable gym-admin
sudo systemctl start gym-admin
```

---

## Verifikasi Deployment

Setelah deploy, cek apakah admin panel berjalan:

1. **Cek service status:**

   ```bash
   pm2 status gym-admin
   # atau
   sudo systemctl status gym-admin
   ```

2. **Cek logs:**

   ```bash
   pm2 logs gym-admin
   # atau
   sudo journalctl -u gym-admin -f
   ```

3. **Test akses:**
   - Buka browser: `https://fitflow.id/admin` atau `https://fitflow.id:3000`
   - Coba login ke super admin: `https://fitflow.id/admin/super-admin/login`

---

## Troubleshooting

### Admin tidak bisa diakses

- Cek apakah service berjalan: `pm2 status` atau `systemctl status gym-admin`
- Cek port 3000 sudah terbuka: `netstat -tulpn | grep 3000`
- Cek firewall: `sudo ufw status`

### Error "Cannot find module"

- Pastikan folder `node_modules` sudah terupload lengkap
- Jalankan `npm install --production` di folder admin-build

### Static assets tidak muncul

- Pastikan folder `.next/static` dan `public` sudah terupload
- Cek permission folder: `chmod -R 755 admin-build`

---

## Update Admin Panel

Untuk update admin panel di kemudian hari:

1. Build ulang di local:

   ```bash
   cd admin
   npm run build:prod
   ```

2. Copy ulang ke admin-build:

   ```bash
   cd ..
   rm -rf admin-build
   mkdir admin-build
   cp -r admin/.next/standalone/iseng/gym-nexus/admin/* admin-build/
   cp -r admin/.next/standalone/iseng/gym-nexus/node_modules admin-build/
   cp -r admin/.next/standalone/iseng/gym-nexus/admin/.next admin-build/
   cp admin/.env.production admin-build/
   ```

3. Upload ulang ke server dan restart service:
   ```bash
   pm2 restart gym-admin
   # atau
   sudo systemctl restart gym-admin
   ```
