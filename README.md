# 📍 TraceFlow — GPS Real-Time Tracking Dashboard

<div align="center">

![TraceFlow](https://img.shields.io/badge/TraceFlow-v1.0.0-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)

**Sistem pelacakan GPS real-time dengan dashboard modern dan futuristik**

</div>

---

## 📋 Daftar Isi

- [Overview](#overview)
- [Fitur Lengkap](#fitur-lengkap)
- [Tech Stack](#tech-stack)
- [Persyaratan Sistem](#persyaratan-sistem)
- [Instalasi dari Nol](#instalasi-dari-nol)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Setup Database](#setup-database)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Deploy ke VPS (Production)](#deploy-ke-vps-production)
- [Setup GPS Provider](#setup-gps-provider)
- [Panduan Penggunaan](#panduan-penggunaan)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Struktur Project](#struktur-project)
- [Lisensi](#lisensi)

---

## Overview

TraceFlow adalah sistem manajemen armada GPS real-time yang memungkinkan Anda:

- **Melacak kendaraan** secara real-time di peta
- **Menerima peringatan** otomatis (geofence, kecepatan, SOS)
- **Melihat riwayat perjalanan** dengan playback di peta
- **Mengelola perangkat** GPS dari berbagai vendor (Teltonika, Queclink, Concox)
- **Menggunakan HP sebagai tracker** untuk testing cepat

Aplikasi ini dibangun dengan teknologi modern (Next.js 16, tRPC, Prisma, Socket.IO) dan siap deploy di VPS atau cloud.

---

## Fitur Lengkap

### 🗺️ Peta Live
- Tracking real-time dengan Leaflet + OpenStreetMap
- Marker berwarna berdasarkan status (Online/Idle/Offline)
- Fly-to animation ketika memilih perangkat
- Pulsing marker untuk perangkat yang sedang di-track
- Device dropdown dengan pencarian

### 📱 Manajemen Perangkat
- CRUD perangkat GPS
- Support 4 provider: Teltonika, Queclink, Concox, Mock
- 3 metode integrasi: GPS Tracker, API JSON Push, GPS HP
- Informasi kendaraan (plat, jenis)

### 🎯 Geofencing
- Buat zona virtual (lingkaran/poligon)
- Assign geofence ke perangkat spesifik
- Peringatan otomatis masuk/keluar zona
- Kustomisasi warna zona

### 🔔 Sistem Peringatan
- 9 tipe peringatan: Speeding, Geofence Enter/Exit, SOS, Ignition On/Off, Low Battery, Device Offline, Idle Too Long
- Filter berdasarkan tipe dan status baca
- Mark read per item atau semua sekaligus
- Export CSV

### 🛣️ Riwayat Perjalanan
- Daftar perjalanan per perangkat
- Filter berdasarkan tanggal
- Putar ulang rute di peta
- Statistik: jarak, durasi, kecepatan maks/rata-rata

### 📊 Laporan
- Periode: Harian, Mingguan, Bulanan
- Statistik: total perjalanan, jarak, peringatan
- Ringkasan per perangkat
- Export: TXT, MD, CSV

### 👤 Profil & Pengaturan
- Upload foto profil
- Ubah nama dan password
- Manajemen organisasi

### 📱 Responsif
- Desktop: sidebar device list
- Mobile: dropdown device selector
- Semua halaman responsive

---

## Tech Stack

| Kategori | Teknologi | Versi |
|----------|-----------|-------|
| **Framework** | Next.js (App Router) | 16 |
| **Language** | TypeScript | 5 |
| **Styling** | Tailwind CSS | 4 |
| **UI Components** | shadcn/ui + Radix UI | - |
| **Animations** | Framer Motion | 12 |
| **Database** | PostgreSQL | 15+ |
| **ORM** | Prisma | 7 |
| **Authentication** | NextAuth v5 | 5 |
| **API** | tRPC | 11 |
| **Real-time** | Socket.IO | 4 |
| **Maps** | Leaflet + OpenStreetMap | 1.9 |
| **Icons** | Lucide React | - |

---

## Persyaratan Sistem

### Minimum
- **OS:** Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM:** 2 GB
- **CPU:** 1 vCPU
- **Storage:** 10 GB
- **Node.js:** 18.17+ (recommended: 20 LTS)
- **PostgreSQL:** 14+
- **pnpm:** 8+ (atau npm 9+)

### Recommended (Production)
- **RAM:** 4 GB
- **CPU:** 2 vCPU
- **Storage:** 20 GB SSD
- **Node.js:** 20 LTS
- **PostgreSQL:** 15+

---

## Instalasi dari Nol

### 1. Install System Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install build tools (untuk native modules)
sudo apt install -y build-essential git
```

### 2. Clone Repository

```bash
git clone <repository-url> /opt/traceflow
cd /opt/traceflow
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Setup Environment

```bash
cp .env.example .env
```

Edit file `.env` (lihat [Konfigurasi Environment](#konfigurasi-environment)).

### 5. Setup Database

```bash
# Buat user dan database PostgreSQL
sudo -u postgres psql <<EOF
CREATE USER traceflow WITH PASSWORD 'your_password_here';
CREATE DATABASE traceflow OWNER traceflow;
GRANT ALL PRIVILEGES ON DATABASE traceflow TO traceflow;
EOF
```

### 6. Jalankan Migrasi

```bash
pnpm prisma generate
pnpm prisma migrate dev --name init
```

### 7. Seed Demo Data (Opsional)

```bash
npx tsx prisma/seed-demo.ts
```

Ini membuat akun demo:
- **Email:** `admin@traceflow.com`
- **Password:** `admin112233`

### 8. Jalankan Development

```bash
pnpm dev
```

Buka `http://localhost:3000`

---

## Konfigurasi Environment

File `.env` harus dikonfigurasi sebelum menjalankan aplikasi:

```env
# ── Database ──
DATABASE_URL="postgresql://traceflow:password@localhost:5432/traceflow"

# ── Authentication ──
NEXTAUTH_SECRET="generate-dengan-openssl-rand-hex-32"
NEXTAUTH_URL="http://localhost:3000"

# ── GPS Webhook Security ──
WEBHOOK_SECRET="generate-dengan-openssl-rand-hex-32"

# ── Supabase (untuk foto profil, opsional) ──
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Generate Secret Keys

```bash
# Generate NEXTAUTH_SECRET
openssl rand -hex 32

# Generate WEBHOOK_SECRET
openssl rand -hex 32
```

### Penjelasan Variable

| Variable | Wajib | Deskripsi |
|----------|-------|-----------|
| `DATABASE_URL` | ✅ | URL koneksi PostgreSQL. Format: `postgresql://user:pass@host:port/dbname` |
| `NEXTAUTH_SECRET` | ✅ | Secret key untuk JWT session. Harus random dan rahasia |
| `NEXTAUTH_URL` | ✅ | URL aplikasi (tanpa trailing slash). Di production: `https://domain-anda.com` |
| `WEBHOOK_SECRET` | ✅ | Bearer token untuk autentikasi GPS webhook. Dipakai di header `Authorization` |
| `NEXT_PUBLIC_SUPABASE_URL` | ❌ | URL Supabase project (hanya untuk upload foto profil) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ❌ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ | Supabase service role key (untuk storage) |

---

## Setup Database

### Prisma Schema

Database menggunakan Prisma ORM. Schema ada di `prisma/schema.prisma`.

### Migrasi

```bash
# Jalankan migrasi (development)
pnpm prisma migrate dev

# Jalankan migrasi (production)
pnpm prisma migrate deploy

# Reset database (WARNING: hapus semua data)
pnpm prisma migrate reset

# Buka Prisma Studio (database browser)
pnpm prisma studio
```

### Database Tables

| Table | Deskripsi |
|-------|-----------|
| `users` | Akun pengguna |
| `organizations` | Organisasi/perusahaan |
| `devices` | Perangkat GPS |
| `locations` | History lokasi GPS |
| `geofences` | Zona virtual |
| `geofence_devices` | Relasi geofence ↔ device |
| `alerts` | Riwayat peringatan |
| `trips` | Riwayat perjalanan |

---

## Menjalankan Aplikasi

### Development

```bash
pnpm dev
```

Aplikasi berjalan di `http://localhost:3000` dengan hot-reload.

### Production Build

```bash
# Build
pnpm build

# Start
pnpm start
```

### Perintah Lain

```bash
# Type checking
pnpm build 2>&1 | grep "Type error"

# Generate Prisma client
pnpm prisma generate

# Lihat schema database
pnpm prisma studio
```

---

## Deploy ke VPS (Production)

### Option A: PM2 (Recommended)

PM2 adalah process manager untuk Node.js yang menjaga aplikasi tetap berjalan.

#### 1. Install PM2

```bash
npm install -g pm2
```

#### 2. Build Aplikasi

```bash
cd /opt/traceflow
pnpm install
pnpm prisma generate
pnpm prisma migrate deploy
pnpm build
```

#### 3. Buat PM2 Config

Buat file `ecosystem.config.js` di root project:

```javascript
module.exports = {
  apps: [{
    name: 'traceflow',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/opt/traceflow',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
  }],
};
```

#### 4. Start dengan PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Auto-start saat server reboot
```

#### 5. PM2 Commands

```bash
pm2 status          # Cek status
pm2 logs traceflow  # Lihat log
pm2 restart traceflow  # Restart
pm2 stop traceflow  # Stop
pm2 monit           # Monitor real-time
```

### Option B: Systemd Service

#### 1. Buat Service File

```bash
sudo nano /etc/systemd/system/traceflow.service
```

```ini
[Unit]
Description=TraceFlow GPS Tracking Dashboard
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/traceflow
ExecStart=/usr/bin/node node_modules/.bin/next start
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

#### 2. Set Permissions

```bash
sudo chown -R www-data:www-data /opt/traceflow
sudo chmod 644 /etc/systemd/system/traceflow.service
```

#### 3. Enable & Start

```bash
sudo systemctl daemon-reload
sudo systemctl enable traceflow
sudo systemctl start traceflow
sudo systemctl status traceflow
```

#### 4. Systemd Commands

```bash
sudo systemctl status traceflow   # Status
sudo systemctl restart traceflow  # Restart
sudo systemctl stop traceflow     # Stop
journalctl -u traceflow -f        # Lihat log
```

### Nginx Reverse Proxy

Install Nginx sebagai reverse proxy dengan SSL:

#### 1. Install Nginx & Certbot

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

#### 2. Buat Nginx Config

```bash
sudo nano /etc/nginx/sites-available/traceflow
```

```nginx
server {
    listen 80;
    server_name domain-anda.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Socket.IO support
    location /api/socketio {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400;
    }
}
```

#### 3. Enable Site & SSL

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/traceflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL (Let's Encrypt)
sudo certbot --nginx -d domain-anda.com

# Auto-renewal test
sudo certbot renew --dry-run
```

#### 4. Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Full Deployment Script

Simpan sebagai `deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying TraceFlow..."

cd /opt/traceflow

# Pull latest code
git pull origin main

# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate deploy

# Build
pnpm build

# Restart PM2
pm2 restart traceflow

echo "✅ Deploy complete!"
```

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Setup GPS Provider

### 1. Tambah Perangkat di Dashboard

1. Buka menu **Perangkat** → **Tambah Perangkat**
2. Pilih provider (Teltonika / Queclink / Concox / Mock)
3. Isi IMEI atau Device ID
4. Simpan

### 2. Konfigurasi GPS Tracker

Setelah perangkat dibuat, konfigurasi GPS tracker fisik untuk mengirim data ke:

```
POST https://domain-anda.com/api/gps-webhook
```

**Headers:**
```
Authorization: Bearer <WEBHOOK_SECRET>
Content-Type: application/json
x-gps-provider: TELTONIKA
```

### 3. Webhook Payload Format

**Teltonika:**
```json
{
  "imei": "123456789012345",
  "timestamp": 1234567890,
  "latitude": -6.2088,
  "longitude": 106.8456,
  "speed": 60,
  "heading": 180,
  "ignition": 1
}
```

**Queclink:**
```json
{
  "device_id": "123456789012345",
  "timestamp": "2024-01-01T00:00:00Z",
  "gps": {
    "latitude": -6.2088,
    "longitude": 106.8456,
    "speed": 60
  },
  "io": {
    "ignition": true
  }
}
```

**API JSON Push (Generic):**
```json
{
  "deviceId": "device-001",
  "lat": -6.2088,
  "lng": 106.8456,
  "speed": 35
}
```

### 4. Testing dengan cURL

```bash
curl -X POST https://domain-anda.com/api/gps-webhook \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -H "x-gps-provider: MOCK" \
  -d '{
    "deviceId": "device-001",
    "lat": -6.2088,
    "lng": 106.8456,
    "speed": 35
  }'
```

### 5. Testing dengan GPS HP

1. Buka menu **Perangkat** → **Tambah Perangkat**
2. Pilih metode **GPS HP**
3. Isi nama perangkat
4. Klik **Simpan & Aktifkan GPS**
5. Izinkan lokasi di browser HP
6. Data akan masuk secara real-time

---

## Panduan Penggunaan

### Akun Demo

Setelah seed database, gunakan akun demo:

```
Email:    admin@traceflow.com
Password: admin112233
```

### Halaman Utama

| Halaman | Fungsi |
|---------|--------|
| **Dashboard** | Statistik overview, peringatan terbaru |
| **Peta Live** | Tracking real-time di peta |
| **Perangkat** | Kelola perangkat GPS |
| **Geofence** | Kelola zona virtual |
| **Peringatan** | Daftar semua peringatan |
| **Perjalanan** | Riwayat perjalanan + playback |
| **Laporan** | Analitik dan export data |
| **Pengaturan** | Profil dan organisasi |

### Alur Kerja

```
1. Tambah Perangkat → 2. Setup GPS Tracker → 3. Data Masuk
→ 4. Pantau di Peta → 5. Buat Geofence → 6. Terima Peringatan
→ 7. Lihat Laporan → 8. Export Data
```

---

## API Reference

### Authentication

Semua API (kecuali GPS webhook) memerlukan session login via NextAuth.

### tRPC Endpoints

Base URL: `/api/trpc/`

**Device:**
- `device.list` — List semua perangkat
- `device.getById` — Detail perangkat
- `device.create` — Buat perangkat (Manager+)
- `device.update` — Edit perangkat (Manager+)
- `device.delete` — Hapus perangkat (Manager+)

**Location:**
- `location.getLatest` — Lokasi terbaru semua perangkat
- `location.getHistory` — History lokasi per perangkat
- `location.getByTrip` — Lokasi per perjalanan
- `location.pushFromPhone` — Push lokasi dari HP

**Geofence:**
- `geofence.list` — List semua geofence
- `geofence.getById` — Detail geofence
- `geofence.create` — Buat geofence (Manager+)
- `geofence.update` — Edit geofence + assign perangkat (Manager+)
- `geofence.delete` — Hapus geofence (Manager+)

**Alert:**
- `alert.list` — List peringatan (paginated, filterable)
- `alert.getUnreadCount` — Jumlah peringatan belum dibaca
- `alert.markRead` — Tandai sudah dibaca
- `alert.markAllRead` — Tandai semua sudah dibaca
- `alert.delete` — Hapus peringatan

**Trip:**
- `trip.list` — List perjalanan (filter by device, date)
- `trip.getById` — Detail perjalanan

**Dashboard:**
- `dashboard.getStats` — Statistik overview
- `dashboard.getRecentAlerts` — 10 peringatan terbaru

### GPS Webhook

```
POST /api/gps-webhook
Authorization: Bearer <WEBHOOK_SECRET>
x-gps-provider: TELTONIKA | QUECLINK | CONCOX | MOCK
```

### Role Hierarchy

| Role | Akses |
|------|-------|
| **ADMIN** | Semua fitur + manajemen user |
| **MANAGER** | CRUD perangkat, geofence, organisasi |
| **VIEWER** | Read-only (lihat data, tidak bisa ubah) |

---

## Troubleshooting

### Aplikasi tidak bisa diakses

```bash
# Cek status service
sudo systemctl status traceflow  # atau pm2 status

# Cek log
journalctl -u traceflow -f  # atau pm2 logs traceflow

# Cek port
sudo lsof -i :3000
```

### Database connection error

```bash
# Cek PostgreSQL berjalan
sudo systemctl status postgresql

# Test koneksi
psql -U traceflow -d traceflow -c "SELECT 1;"

# Cek DATABASE_URL di .env
cat .env | grep DATABASE_URL
```

### Prisma migration error

```bash
# Reset database (WARNING: hapus semua data)
pnpm prisma migrate reset

# Generate ulang Prisma client
pnpm prisma generate

# Jalankan migrasi ulang
pnpm prisma migrate dev
```

### GPS data tidak masuk

1. Cek webhook URL benar: `https://domain-anda.com/api/gps-webhook`
2. Cek `WEBHOOK_SECRET` di `.env` sama dengan yang di header
3. Cek `x-gps-provider` header sesuai provider
4. Cek IMEI/device ID cocok dengan yang di dashboard
5. Cek log server untuk error

### Map tidak muncul

1. Cek koneksi internet (OpenStreetMap tiles perlu internet)
2. Cek browser console untuk error
3. Pastikan device punya koordinat (`lastLatitude`, `lastLongitude`)

### Socket.IO tidak connect

1. Cek Nginx config untuk WebSocket support
2. Cek `/api/socketio` path tidak di-block
3. Cek browser console untuk connection error

---

## Struktur Project

```
traceflow/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed-demo.ts           # Seed data demo
│   └── migrations/            # Database migrations
├── public/                    # Static assets
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login, Register (tanpa sidebar)
│   │   ├── (dashboard)/       # Semua halaman dashboard (dengan sidebar)
│   │   │   ├── alerts/        # Halaman peringatan
│   │   │   ├── devices/       # Halaman perangkat
│   │   │   ├── geofences/     # Halaman geofence
│   │   │   ├── map/           # Halaman peta live
│   │   │   ├── reports/       # Halaman laporan
│   │   │   ├── settings/      # Halaman pengaturan
│   │   │   └── trips/         # Halaman perjalanan
│   │   └── api/
│   │       ├── auth/          # NextAuth API routes
│   │       ├── gps-webhook/   # GPS webhook endpoint
│   │       ├── socketio/      # Socket.IO server
│   │       └── trpc/          # tRPC API handler
│   ├── components/
│   │   ├── layout/            # Sidebar, Header
│   │   ├── map/               # MapView, TripPlayback
│   │   └── ui/                # shadcn/ui components
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-socket.ts      # Socket.IO hooks
│   │   └── use-device-location.ts
│   ├── lib/
│   │   ├── api-provider.ts    # tRPC client setup
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── socket.ts          # Socket.IO server singleton
│   │   ├── export.ts          # CSV export utilities
│   │   └── reports.ts         # Report generation
│   ├── server/
│   │   ├── api/
│   │   │   ├── routers/       # tRPC routers
│   │   │   ├── root.ts        # Root router
│   │   │   └── trpc.ts        # tRPC context & middleware
│   │   └── gps/
│   │       ├── ingest.ts      # GPS data ingestion + geofence check
│   │       └── adapters/      # Provider adapters (mock, teltonika, etc)
│   └── types/                 # TypeScript type definitions
├── .env.example               # Environment template
├── ecosystem.config.js        # PM2 config (production)
├── next.config.ts             # Next.js config
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Lisensi

Proprietary — [noHype Labs](https://github.com/nohypelabs)

Dilarang mendistribusikan, menjual kembali, atau membuka source code ini tanpa izin tertulis.

---

<div align="center">

**📍 TraceFlow — Real-Time GPS Fleet Tracking**

</div>
