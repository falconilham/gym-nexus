# 🚀 Panduan Deploy FitFlow ke Kilat Hosting (Plesk)

## 📊 Status Saat Ini:

- ✅ Domain: fitflow.id (Active)
- ✅ Node.js: v22.21.1
- ✅ System User: fitflowi
- ✅ Website Root: httpdocs
- ⚠️ Current Status: 500 Error (aplikasi gagal start)

## 🎯 Langkah Deployment:

### **1. Backup & Clean Current Files**

Via Plesk File Manager:

1. Login ke Plesk: https://cpkh07.kilathosting.id:8443
2. Pilih domain **fitflow.id**
3. Klik **Files** → **File Manager**
4. Backup folder `httpdocs` (rename jadi `httpdocs_backup`)
5. Buat folder baru `httpdocs` (kosong)

### **2. Upload Admin Build**

**File yang perlu diupload:** `admin-build.tar.gz` (sudah di-compress)

**Cara Upload:**

1. Di File Manager, masuk ke folder `httpdocs`
2. Klik **Upload Files**
3. Upload file `admin-build.tar.gz`
4. Setelah upload selesai, klik kanan file → **Extract**
5. Setelah extract, pindahkan semua isi folder `admin-build` ke `httpdocs`

**Struktur akhir di `httpdocs`:**

```
httpdocs/
├── .next/
├── node_modules/
├── public/
├── .env.production
├── package.json
└── server.js
```

### **3. Setup Node.js di Plesk**

1. Kembali ke Dashboard fitflow.id
2. Klik **Node.js** di bagian Dev Tools
3. Set konfigurasi:
   - **Node.js version:** 22.21.1 (sudah benar)
   - **Application mode:** production
   - **Application root:** httpdocs
   - **Application startup file:** server.js
   - **Application URL:** https://fitflow.id

4. Klik **Enable Node.js**
5. Klik **NPM install** (untuk install dependencies)
6. Klik **Restart App**

### **4. Setup Environment Variables**

Di halaman Node.js settings, tambahkan environment variables:

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.fitflow.id
NEXT_PUBLIC_APP_URL=https://fitflow.id
PORT=3000
```

### **5. Fix SSL Certificate**

1. Di Dashboard fitflow.id, klik **SSL/TLS Certificates**
2. Klik **Install** (Let's Encrypt)
3. Pilih domain: **fitflow.id** dan **www.fitflow.id**
4. Klik **Get it free** atau **Install**
5. Tunggu proses selesai
6. Aktifkan **Redirect HTTP to HTTPS**

### **6. Deploy Backend API**

**File yang perlu diupload:** Folder `backend` dan `app.js`

**Struktur di server:**

```
/home/fitflowi/
├── httpdocs/          # Admin panel (sudah diupload)
├── backend/           # Backend API
│   ├── routes/
│   ├── middleware/
│   ├── jobs/
│   ├── database.js
│   ├── index.js
│   ├── package.json
│   └── .env.production
└── app.js             # Main server file
```

**Cara Upload Backend:**

1. Compress folder backend: `tar -czf backend.tar.gz backend/`
2. Upload via File Manager ke `/home/fitflowi/`
3. Extract file
4. Upload file `app.js` ke `/home/fitflowi/`

### **7. Setup Database MySQL**

1. Di Plesk, klik **Databases**
2. Klik **Add Database**
3. Isi:
   - **Database name:** fitflow_db
   - **Database user:** fitflow_user
   - **Password:** [buat password yang kuat]
4. Klik **OK**

5. Update `backend/.env.production`:

```env
DATABASE_URL=mysql://fitflow_user:PASSWORD@localhost:3306/fitflow_db
JWT_SECRET=your-super-secret-jwt-key-production
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://fitflow.id
```

### **8. Install Dependencies Backend**

Via SSH (lebih mudah) atau Plesk Terminal:

```bash
# Login SSH
ssh fitflowi@fitflow.id

# Masuk ke folder backend
cd backend

# Install dependencies
npm install --production

# Kembali ke home
cd ..

# Install dependencies root
npm install --production
```

### **9. Start Backend dengan PM2**

```bash
# Install PM2 globally (jika belum)
npm install -g pm2

# Start backend
pm2 start app.js --name "fitflow-server"

# Save PM2 config
pm2 save

# Setup auto-start
pm2 startup
# Jalankan command yang ditampilkan
```

### **10. Konfigurasi Reverse Proxy**

Di Plesk, setup Apache/Nginx untuk proxy ke backend:

1. Klik **Apache & nginx Settings**
2. Di bagian **Additional nginx directives**, tambahkan:

```nginx
location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

3. Klik **OK**

### **11. Verifikasi Deployment**

1. **Test Admin Panel:**
   - Buka: https://fitflow.id
   - Seharusnya muncul landing page

2. **Test Super Admin Login:**
   - Buka: https://fitflow.id/super-admin/login
   - Coba login

3. **Test Backend API:**
   - Buka: https://fitflow.id/api/
   - Seharusnya return JSON response

4. **Check Logs:**
   - Di Plesk, klik **Logs**
   - Pastikan tidak ada error 500

---

## 🔧 Troubleshooting:

### **Error: Cannot find module**

```bash
cd /home/fitflowi/httpdocs
npm install --production
pm2 restart fitflow-admin
```

### **Error: Database connection failed**

```bash
# Cek DATABASE_URL di .env.production
cat backend/.env.production | grep DATABASE_URL

# Test connection
mysql -u fitflow_user -p fitflow_db
```

### **Error: Port already in use**

```bash
# Cek port 3000 dan 3001
netstat -tulpn | grep 3000
netstat -tulpn | grep 3001

# Kill process jika perlu
pm2 stop all
pm2 delete all
pm2 start app.js --name "fitflow-server"
```

### **Error: Permission denied**

```bash
# Fix permissions
chmod -R 755 /home/fitflowi/
chmod -R 777 /home/fitflowi/backend/uploads
```

---

## 📋 Checklist Deployment:

- [ ] Upload admin-build.tar.gz
- [ ] Extract dan setup struktur folder
- [ ] Configure Node.js di Plesk
- [ ] Setup environment variables
- [ ] Install SSL certificate (Let's Encrypt)
- [ ] Upload backend folder
- [ ] Upload app.js
- [ ] Create MySQL database
- [ ] Update backend .env.production
- [ ] Install dependencies (npm install)
- [ ] Start backend dengan PM2
- [ ] Configure reverse proxy
- [ ] Test admin panel (https://fitflow.id)
- [ ] Test backend API (https://fitflow.id/api/)
- [ ] Check logs (no errors)

---

## 📞 Support:

Jika ada masalah:

1. Check Plesk Logs: Dashboard → Logs
2. Check PM2 Logs: `pm2 logs fitflow-server`
3. Check Node.js status: Dashboard → Node.js
4. Restart services: `pm2 restart all`

**File yang sudah disiapkan:**

- ✅ `admin-build.tar.gz` - Admin panel (61MB)
- ⏳ `backend.tar.gz` - Backend API (perlu di-compress)

**Lokasi file:**

- `/Users/bonita/Programming/iseng/gym-nexus/admin-build.tar.gz`
