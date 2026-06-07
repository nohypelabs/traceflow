# TraceFlow

<div align="center">

**GPS Real-Time Fleet Tracking Dashboard**

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)
![License](https://img.shields.io/badge/license-Proprietary-red?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js)

Sistem manajemen armada GPS real-time dengan dashboard modern, geofencing, dan pelaporan lengkap.

</div>

---

## Daftar Isi

1. [Overview](#overview)
2. [Fitur](#fitur)
3. [Arsitektur Teknis](#arsitektur-teknis)
4. [Persyaratan Sistem](#persyaratan-sistem)
5. [Instalasi](#instalasi)
6. [Konfigurasi Environment](#konfigurasi-environment)
7. [Database](#database)
8. [Deployment ke VPS](#deployment-ke-vps)
9. [Integrasi GPS Provider](#integrasi-gps-provider)
10. [Panduan Penggunaan](#panduan-penggunaan)
11. [API Reference](#api-reference)
12. [Troubleshooting](#troubleshooting)
13. [Struktur Project](#struktur-project)
14. [Lisensi](#lisensi)

---

## Overview

TraceFlow adalah solusi manajemen armada berbasis web yang memungkinkan pemantauan kendaraan secara real-time, pembuatan zona geofence, penerimaan peringatan otomatis, serta analisis riwayat perjalanan.

Aplikasi ini mendukung berbagai perangkat GPS dari vendor Teltonika, Queclink, dan Concox, serta menyediakan mode testing menggunakan GPS smartphone.

**Target pengguna:** Perusahaan logistik, layanan transportasi, manajemen armada kendaraan.

---

## Fitur

### Peta Live
- Pemantauan posisi kendaraan secara real-time di peta OpenStreetMap
- Marker berkode warna berdasarkan status (Online, Idle, Offline)
- Animasi transisi smooth antar perangkat (multi-step fly)
- Dropdown pencarian perangkat di pojok kanan atas peta

### Manajemen Perangkat
- CRUD perangkat GPS (Create, Read, Update, Delete)
- Dukungan 4 provider: Teltonika, Queclink, Concox, Mock
- 3 metode integrasi: GPS Tracker fisik, API JSON Push, GPS HP (browser)
- Informasi kendaraan: plat nomor, jenis kendaraan

### Geofencing
- Pembuatan zona virtual berbentuk lingkaran atau poligon
- Penugasan geofence ke perangkat spesifik
- Peringatan otomatis saat kendaraan masuk/keluar zona
- Kustomisasi warna dan deskripsi zona

### Sistem Peringatan
- 9 tipe peringatan: Speeding, Geofence Enter/Exit, SOS, Ignition On/Off, Low Battery, Device Offline, Idle Too Long
- Filter berdasarkan tipe dan status baca
- Mark read per item atau semua sekaligus
- Export data ke CSV

### Riwayat Perjalanan
- Daftar perjalanan per perangkat dengan filter tanggal
- Putar ulang rute di peta dengan kontrol playback
- Statistik: jarak tempuh, durasi, kecepatan maksimum dan rata-rata

### Laporan
- Rentang waktu: Harian, Mingguan, Bulanan
- Statistik agregat: total perjalanan, jarak, peringatan
- Ringkasan per perangkat
- Export: TXT, Markdown, CSV

### Pengaturan
- Profil pengguna dengan upload foto
- Manajemen organisasi
- Pengaturan password

---

## Arsitektur Teknis

| Komponen | Teknologi | Versi |
|----------|-----------|-------|
| Framework | Next.js (App Router) | 16 |
| Bahasa | TypeScript | 5 |
| Styling | Tailwind CSS | 4 |
| UI Components | shadcn/ui + Radix UI | - |
| Animasi | Framer Motion | 12 |
| Database | PostgreSQL | 15+ |
| ORM | Prisma | 7 |
| Autentikasi | NextAuth v5 | 5 |
| API Layer | tRPC | 11 |
| Real-time | Socket.IO | 4 |
| Peta | Leaflet + OpenStreetMap | 1.9 |
| Icon | Lucide React | - |

---

## Persyaratan Sistem

### Minimum

| Spesifikasi | Nilai |
|-------------|-------|
| OS | Ubuntu 20.04+ / Debian 11+ / CentOS 8+ |
| RAM | 2 GB |
| CPU | 1 vCPU |
| Storage | 10 GB |
| Node.js | 18.17+ |
| PostgreSQL | 14+ |
| Package Manager | pnpm 8+ atau npm 9+ |

### Recommended (Production)

| Spesifikasi | Nilai |
|-------------|-------|
| RAM | 4 GB |
| CPU | 2 vCPU |
| Storage | 20 GB SSD |
| Node.js | 20 LTS |
| PostgreSQL | 15+ |

---

## Instalasi

### 1. Install System Dependencies

```bash
sudo apt update && sudo apt upgrade -y

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

npm install -g pnpm

sudo apt install -y postgresql postgresql-contrib build-essential git
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

Edit file `.env` sesuai konfigurasi Anda (lihat [Konfigurasi Environment](#konfigurasi-environment)).

### 5. Setup Database

```bash
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

### 7. Seed Data Demo (Opsional)

```bash
npx tsx prisma/seed-demo.ts
```

Akun demo yang dibuat:
- Email: `admin@traceflow.com`
- Password: `admin112233`

### 8. Jalankan Aplikasi

```bash
pnpm dev
```

Aplikasi berjalan di `http://localhost:3000`.

---

## Konfigurasi Environment

### Template `.env`

```env
# Database
DATABASE_URL="postgresql://traceflow:password@localhost:5432/traceflow"

# Authentication
NEXTAUTH_SECRET="<generate-dengan-openssl-rand-hex-32>"
NEXTAUTH_URL="http://localhost:3000"

# GPS Webhook Security
WEBHOOK_SECRET="<generate-dengan-openssl-rand-hex-32>"

# Supabase (opsional, untuk foto profil)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Generate Secret Keys

```bash
openssl rand -hex 32
```

### Penjelasan Variable

| Variable | Wajib | Deskripsi |
|----------|-------|-----------|
| `DATABASE_URL` | Ya | URL koneksi PostgreSQL |
| `NEXTAUTH_SECRET` | Ya | Secret key untuk JWT session |
| `NEXTAUTH_URL` | Ya | URL aplikasi (production: `https://domain-anda.com`) |
| `WEBHOOK_SECRET` | Ya | Bearer token untuk autentikasi GPS webhook |
| `NEXT_PUBLIC_SUPABASE_URL` | Tidak | URL Supabase project (foto profil) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tidak | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Tidak | Supabase service role key |

---

## Database

### Schema

Database menggunakan Prisma ORM. Schema utama ada di `prisma/schema.prisma`.

### Perintah Migrasi

| Perintah | Fungsi |
|----------|--------|
| `pnpm prisma migrate dev` | Jalankan migrasi (development) |
| `pnpm prisma migrate deploy` | Jalankan migrasi (production) |
| `pnpm prisma migrate reset` | Reset database (hapus semua data) |
| `pnpm prisma studio` | Buka database browser |
| `pnpm prisma generate` | Generate Prisma client |

### Tabel Database

| Tabel | Deskripsi |
|-------|-----------|
| `users` | Akun pengguna |
| `organizations` | Organisasi/perusahaan |
| `devices` | Perangkat GPS |
| `locations` | History lokasi GPS |
| `geofences` | Zona virtual |
| `geofence_devices` | Relasi geofence dan device |
| `alerts` | Riwayat peringatan |
| `trips` | Riwayat perjalanan |

---

## Deployment ke VPS

### Opsi A: PM2 (Recommended)

PM2 adalah process manager untuk Node.js yang menjaga aplikasi tetap berjalan dan restart otomatis.

#### Install PM2

```bash
npm install -g pm2
```

#### Build dan Deploy

```bash
cd /opt/traceflow
pnpm install
pnpm prisma generate
pnpm prisma migrate deploy
pnpm build
```

#### Konfigurasi PM2

File `ecosystem.config.js` sudah disediakan di root project. Jalankan:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Perintah PM2

| Perintah | Fungsi |
|----------|--------|
| `pm2 status` | Cek status aplikasi |
| `pm2 logs traceflow` | Lihat log |
| `pm2 restart traceflow` | Restart aplikasi |
| `pm2 stop traceflow` | Stop aplikasi |
| `pm2 monit` | Monitor real-time |

### Opsi B: Systemd Service

#### Buat Service File

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

#### Aktifkan Service

```bash
sudo chown -R www-data:www-data /opt/traceflow
sudo systemctl daemon-reload
sudo systemctl enable traceflow
sudo systemctl start traceflow
```

#### Perintah Systemd

| Perintah | Fungsi |
|----------|--------|
| `sudo systemctl status traceflow` | Cek status |
| `sudo systemctl restart traceflow` | Restart |
| `sudo systemctl stop traceflow` | Stop |
| `journalctl -u traceflow -f` | Lihat log |

### Nginx Reverse Proxy

#### Install Nginx dan Certbot

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

#### Konfigurasi Nginx

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

#### Aktifkan SSL

```bash
sudo ln -s /etc/nginx/sites-available/traceflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d domain-anda.com
sudo certbot renew --dry-run
```

#### Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Deploy Script

Gunakan script berikut untuk update production:

```bash
#!/bin/bash
set -e
cd /opt/traceflow
git pull origin main
pnpm install
pnpm prisma generate
pnpm prisma migrate deploy
pnpm build
pm2 restart traceflow
```

Simpan sebagai `deploy.sh` dan jalankan `chmod +x deploy.sh`.

---

## Integrasi GPS Provider

### Langkah Penyiapan

1. Tambah perangkat di menu **Perangkat** > **Tambah Perangkat**
2. Pilih provider (Teltonika / Queclink / Concox / Mock)
3. Isi IMEI atau Device ID
4. Konfigurasi GPS tracker fisik untuk mengirim data ke endpoint webhook

### Endpoint Webhook

```
POST https://domain-anda.com/api/gps-webhook
```

### Headers

```
Authorization: Bearer <WEBHOOK_SECRET>
Content-Type: application/json
x-gps-provider: TELTONIKA | QUECLINK | CONCOX | MOCK
```

### Format Payload

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

### Testing dengan cURL

```bash
curl -X POST https://domain-anda.com/api/gps-webhook \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -H "x-gps-provider: MOCK" \
  -d '{"deviceId":"device-001","lat":-6.2088,"lng":106.8456,"speed":35}'
```

### Testing dengan GPS HP

1. Buka menu **Perangkat** > **Tambah Perangkat**
2. Pilih metode **GPS HP**
3. Isi nama perangkat, klik **Simpan & Aktifkan GPS**
4. Izinkan lokasi di browser HP
5. Data akan masuk secara real-time ke peta

---

## Panduan Penggunaan

### Akun Demo

Setelah menjalankan seed database:

| Field | Nilai |
|-------|-------|
| Email | `admin@traceflow.com` |
| Password | `admin112233` |

### Daftar Halaman

| Halaman | Fungsi |
|---------|--------|
| Dashboard | Statistik overview, peringatan terbaru |
| Peta Live | Tracking real-time di peta |
| Perangkat | Kelola perangkat GPS |
| Geofence | Kelola zona virtual |
| Peringatan | Daftar semua peringatan |
| Perjalanan | Riwayat perjalanan dan playback |
| Laporan | Analitik dan export data |
| Pengaturan | Profil dan organisasi |

### Alur Kerja Standar

```
Tambah Perangkat > Setup GPS Tracker > Data Masuk
> Pantau di Peta > Buat Geofence > Terima Peringatan
> Lihat Laporan > Export Data
```

---

## API Reference

### Autentikasi

Semua endpoint API (kecuali GPS webhook) memerlukan session login via NextAuth.

### tRPC Endpoints

Base URL: `/api/trpc/`

**Device**

| Endpoint | Fungsi | Akses |
|----------|--------|-------|
| `device.list` | List semua perangkat | Semua role |
| `device.getById` | Detail perangkat | Semua role |
| `device.create` | Buat perangkat | Manager+ |
| `device.update` | Edit perangkat | Manager+ |
| `device.delete` | Hapus perangkat | Manager+ |

**Location**

| Endpoint | Fungsi | Akses |
|----------|--------|-------|
| `location.getLatest` | Lokasi terbaru semua perangkat | Semua role |
| `location.getHistory` | History lokasi per perangkat | Semua role |
| `location.getByTrip` | Lokasi per perjalanan | Semua role |
| `location.pushFromPhone` | Push lokasi dari HP | Semua role |

**Geofence**

| Endpoint | Fungsi | Akses |
|----------|--------|-------|
| `geofence.list` | List semua geofence | Semua role |
| `geofence.getById` | Detail geofence | Semua role |
| `geofence.create` | Buat geofence | Manager+ |
| `geofence.update` | Edit geofence + assign perangkat | Manager+ |
| `geofence.delete` | Hapus geofence | Manager+ |

**Alert**

| Endpoint | Fungsi | Akses |
|----------|--------|-------|
| `alert.list` | List peringatan (paginated) | Semua role |
| `alert.getUnreadCount` | Jumlah peringatan belum dibaca | Semua role |
| `alert.markRead` | Tandai sudah dibaca | Semua role |
| `alert.markAllRead` | Tandai semua sudah dibaca | Semua role |
| `alert.delete` | Hapus peringatan | Semua role |

**Trip**

| Endpoint | Fungsi | Akses |
|----------|--------|-------|
| `trip.list` | List perjalanan | Semua role |
| `trip.getById` | Detail perjalanan | Semua role |

**Dashboard**

| Endpoint | Fungsi | Akses |
|----------|--------|-------|
| `dashboard.getStats` | Statistik overview | Semua role |
| `dashboard.getRecentAlerts` | 10 peringatan terbaru | Semua role |

### GPS Webhook

```
POST /api/gps-webhook
Authorization: Bearer <WEBHOOK_SECRET>
x-gps-provider: TELTONIKA | QUECLINK | CONCOX | MOCK
```

### Hierarki Role

| Role | Akses |
|------|-------|
| ADMIN | Semua fitur + manajemen user |
| MANAGER | CRUD perangkat, geofence, organisasi |
| VIEWER | Read-only (lihat data, tidak bisa ubah) |

---

## Troubleshooting

### Aplikasi Tidak Bisa Diakses

```bash
sudo systemctl status traceflow
journalctl -u traceflow -f
sudo lsof -i :3000
```

### Database Connection Error

```bash
sudo systemctl status postgresql
psql -U traceflow -d traceflow -c "SELECT 1;"
cat .env | grep DATABASE_URL
```

### Prisma Migration Error

```bash
pnpm prisma migrate reset
pnpm prisma generate
pnpm prisma migrate dev
```

### GPS Data Tidak Masuk

1. Verifikasi webhook URL: `https://domain-anda.com/api/gps-webhook`
2. Pastikan `WEBHOOK_SECRET` di `.env` cocok dengan header `Authorization`
3. Pastikan header `x-gps-provider` sesuai dengan provider yang dipilih
4. Pastikan IMEI/Device ID cocok dengan yang terdaftar di dashboard
5. Cek log server untuk pesan error

### Peta Tidak Muncul

1. Pastikan koneksi internet aktif (OpenStreetMap tiles memerlukan internet)
2. Cek browser console untuk error JavaScript
3. Pastikan perangkat memiliki koordinat (`lastLatitude`, `lastLongitude`)

### Socket.IO Tidak Connect

1. Pastikan Nginx dikonfigurasi untuk WebSocket support
2. Pastikan path `/api/socketio` tidak di-block
3. Cek browser console untuk connection error

---

## Struktur Project

```
traceflow/
├── prisma/
│   ├── schema.prisma
│   ├── seed-demo.ts
│   └── migrations/
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login, Register
│   │   ├── (dashboard)/         # Halaman dashboard
│   │   │   ├── alerts/
│   │   │   ├── devices/
│   │   │   ├── geofences/
│   │   │   ├── map/
│   │   │   ├── reports/
│   │   │   ├── settings/
│   │   │   └── trips/
│   │   └── api/
│   │       ├── auth/
│   │       ├── gps-webhook/
│   │       ├── socketio/
│   │       └── trpc/
│   ├── components/
│   │   ├── layout/
│   │   ├── map/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   ├── server/
│   │   ├── api/routers/
│   │   └── gps/
│   └── types/
├── .env.example
├── ecosystem.config.js
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Lisensi

Proprietary. Dilarang mendistribusikan, menjual kembali, atau membuka source code ini tanpa izin tertulis dari pemegang lisensi.

---

<div align="center">

**TraceFlow** -- Real-Time GPS Fleet Tracking

</div>
