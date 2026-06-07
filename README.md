# 📍 TraceFlow — GPS Real-Time Tracking Dashboard

<div align="center">

![TraceFlow](https://img.shields.io/badge/TraceFlow-v1.0.0-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwindcss)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)

**Sistem pelacakan GPS real-time dengan dashboard modern dan futuristik**

[Demo](https://your-demo-url.vercel.app) · [Dokumentasi](#dokumentasi) · [Laporan Bug](https://github.com/your-username/traceflow/issues)

</div>

---

## 📋 Daftar Isi

- [Fitur](#fitur)
- [Screenshot](#screenshot)
- [Tech Stack](#tech-stack)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Penggunaan](#penggunaan)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

---

## ✨ Fitur

### Dashboard Real-Time
- 📊 Statistik perangkat (total, online, offline, idle)
- 🗺️ Peta live dengan lokasi perangkat
- 🔔 Sistem peringatan (geofence, kecepatan, SOS)
- 📈 Grafik dan analitik

### Manajemen Perangkat
- ➕ Tambah/hapus/edit perangkat GPS
- 📍 Lacak lokasi real-time
- 🚗 Informasi kendaraan (plat, jenis)
- 📱 Support berbagai provider GPS (Teltonika, Queclink, Concox, Mock)

### Geofencing
- 🎯 Buat zona virtual (lingkaran/poligon)
- 🔔 Peringatan masuk/keluar zona
- 🎨 Kustomisasi warna zona
- 📊 Riwayat pelanggaran geofence

### Riwayat Perjalanan
- 🛣️ Lacak rute perjalanan
- ⏱️ Putar ulang perjalanan
- 📏 Jarak, durasi, kecepatan
- 🗺️ Visualisasi rute di peta

### Fitur Tambahan
- 📱 PWA (installable di HP)
- 📱 Responsive (mobile/tablet/desktop)
- 🌙 Mode gelap
- 🎨 Desain futuristik
- 🇮🇩 Bahasa Indonesia

---

## 📸 Screenshot

### Dashboard
<!-- Tambahkan screenshot dashboard di sini -->
```
[Screenshot Dashboard]
```

### Peta Live
<!-- Tambahkan screenshot peta di sini -->
```
[Screenshot Peta Live]
```

### Mobile View
<!-- Tambahkan screenshot mobile di sini -->
```
[Screenshot Mobile]
```

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **UI Library** | Radix UI + shadcn/ui |
| **Animations** | Framer Motion |
| **Database** | PostgreSQL 15 |
| **ORM** | Prisma 7 |
| **Auth** | NextAuth v5 |
| **API** | tRPC v11 |
| **Real-time** | Socket.IO |
| **Maps** | Leaflet + OpenStreetMap |
| **Icons** | Lucide React |

---

## 🚀 Instalasi

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- pnpm (recommended) atau npm

### Langkah Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/your-username/traceflow.git
   cd traceflow
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup database**
   ```bash
   # Buat database PostgreSQL
   createdb traceflow
   
   # Atau via psql
   psql -U postgres -c "CREATE DATABASE traceflow;"
   ```

4. **Konfigurasi environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` dengan konfigurasi database Anda:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/traceflow"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

5. **Jalankan migrasi database**
   ```bash
   pnpm prisma migrate dev --name init
   ```

6. **Seed database (opsional)**
   ```bash
   node prisma/seed.js
   ```

7. **Jalankan development server**
   ```bash
   pnpm dev
   ```

8. **Buka browser**
   ```
   http://localhost:3000
   ```

---

## ⚙️ Konfigurasi

### Environment Variables

| Variable | Deskripsi | Default |
|----------|-----------|---------|
| `DATABASE_URL` | URL koneksi PostgreSQL | - |
| `NEXTAUTH_SECRET` | Secret key untuk auth | - |
| `NEXTAUTH_URL` | URL aplikasi | `http://localhost:3000` |
| `WEBHOOK_SECRET` | Bearer secret untuk semua GPS/API push | wajib di production |
| `PORT` | Port server | `3000` |

Generate `WEBHOOK_SECRET` sendiri. Secret ini bukan diberikan oleh vendor GPS:

```bash
openssl rand -hex 32
```

Simpan hasilnya di `.env` atau environment deployment. Gateway maupun aplikasi
pengirim harus memakai nilai yang sama pada header:

```http
Authorization: Bearer <WEBHOOK_SECRET>
```

### GPS Providers

TraceFlow mendukung beberapa provider GPS:

| Provider | Status | Deskripsi |
|----------|--------|-----------|
| Mock | ✅ | Untuk development/testing |
| Teltonika | ✅ | Teltonika FM series |
| Queclink | ✅ | Queclink GL series |
| Concox | ✅ | Concox JM series |

Adapter Teltonika, Queclink, dan Concox saat ini menerima HTTP webhook push.
Raw TCP/UDP listener dan polling API vendor belum diimplementasikan.

### Webhook Format

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

---

## 📖 Penggunaan

### Demo Account

```
Email:    admin@traceflow.com
Password: admin112233
```

### Menambah Perangkat

1. Buka menu **Perangkat**
2. Klik **Tambah Perangkat**
3. Pilih metode integrasi:
   - **GPS Tracker** untuk payload native Teltonika, Queclink, atau Concox
   - **API JSON Push** untuk aplikasi/gateway dengan payload standar TraceFlow
   - **GPS HP** untuk memakai browser smartphone sebagai tracker sementara
   - **Mock / Testing** untuk simulator lokal
4. Isi nama dan data kendaraan. Untuk tracker/API, isi juga IMEI/Device ID unik;
   metode GPS HP membuat ID internal secara otomatis
5. Klik **Simpan Perangkat**
6. Gunakan request guide yang muncul untuk mengirim lokasi pertama

### Testing dengan GPS HP

1. Tambahkan perangkat menggunakan metode **GPS HP** tanpa mengisi IMEI/Device ID
2. Buka `/phone-tracker` dari deployment HTTPS melalui HP
3. Login, pilih device, lalu tekan **Mulai Tracking**
4. Izinkan lokasi presisi dan biarkan halaman tetap terbuka
5. Pantau posisi yang masuk melalui halaman **Peta Live**

GPS browser dapat dihentikan oleh sistem ketika layar terkunci, tab ditutup, atau
mode hemat baterai aktif. Jalur ini ditujukan untuk testing, bukan tracking
background permanen.

### Membuat Geofence

1. Buka menu **Geofence**
2. Klik **Tambah Geofence**
3. Isi informasi:
   - Nama zona
   - Tipe (lingkaran/poligon)
   - Koordinat pusat
   - Radius (untuk lingkaran)
   - Warna
4. Klik **Buat Geofence**
5. Link perangkat ke geofence di pengaturan

### Melacak Perangkat

1. Buka menu **Peta Live**
2. Perangkat akan muncul di peta
3. Klik marker untuk info detail
4. Status perangkat:
   - 🟢 Online
   - 🟡 Idle
   - ⚫ Offline

### Melihat Riwayat Perjalanan

1. Buka menu **Perjalanan**
2. Pilih perangkat
3. Pilih rentang tanggal
4. Klik perjalanan untuk detail
5. Gunakan **Putar Ulang** untuk melihat rute

---

## 📡 API Reference

### Authentication

```bash
# Login
POST /api/auth/callback/credentials
Body: { email, password }

# Session
GET /api/auth/session
```

### Devices

```bash
# List devices
GET /api/trpc/device.list

# Create device
POST /api/trpc/device.create
Body: {
  name,
  imei,
  provider,
  vehiclePlate,
  vehicleType,
  providerConfig: {
    integrationMode,
    webhookFormat,
    externalDeviceId
  }
}

# Update device
POST /api/trpc/device.update
Body: { id, name, vehiclePlate, vehicleType }

# Delete device
POST /api/trpc/device.delete
Body: { id }
```

### Locations

```bash
# Get latest locations
GET /api/trpc/location.getLatest

# Get location history
GET /api/trpc/location.getHistory
Body: { deviceId, from, to }
```

### GPS Webhook

```bash
# Receive GPS data
POST /api/gps-webhook
Headers: {
  authorization: "Bearer <WEBHOOK_SECRET>",
  x-gps-provider: "TELTONIKA" | "QUECLINK" | "CONCOX" | "MOCK"
}
Body: { ...gps_data }
```

Payload standar untuk `API JSON Push` menggunakan provider `MOCK`:

```json
{
  "deviceId": "fleet-gateway-01",
  "lat": -6.2088,
  "lng": 106.8456,
  "speed": 35
}
```

---

## 🚀 Deployment

### Vercel

1. Push ke GitHub
2. Import project di Vercel
3. Add environment variables
4. Deploy

### Railway

1. Push ke GitHub
2. Create new project di Railway
3. Connect GitHub repo
4. Add PostgreSQL database
5. Add environment variables
6. Deploy

### Docker

```bash
# Build image
docker build -t traceflow .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  traceflow
```

---

## 🤝 Kontribusi

Kontribusi sangat welcome!

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Panduan Kontribusi

- Ikuti style guide yang ada
- Tambahkan test untuk fitur baru
- Update dokumentasi jika perlu
- Pastikan build berhasil sebelum PR

---

## 📄 Lisensi

Dibuat oleh [noHype Labs](https://github.com/nohypelabs)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Leaflet](https://leafletjs.com/)
- [Prisma](https://www.prisma.io/)
- [tRPC](https://trpc.io/)

---

<div align="center">

**⭐ Star repository ini jika bermanfaat!**

</div>
