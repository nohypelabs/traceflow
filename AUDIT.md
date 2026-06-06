# TraceFlow - Audit Report

**Project:** GPS Real-Time Tracking Dashboard  
**Location:** /x/projects/traceflow  
**Date:** June 7, 2026  
**Stack:** Next.js 16 + tRPC v11 + Prisma v7 + NextAuth v5 + Socket.IO + Leaflet + Tailwind v4 + shadcn/ui + Radix Themes + Framer Motion

---

## 1. DATABASE SCHEMA

### Tables
| Table | Status | Description |
|-------|--------|-------------|
| User | ✅ | Auth user (name, email, password, role, org) |
| Account | ✅ | NextAuth OAuth accounts |
| Session | ✅ | NextAuth sessions |
| Organization | ✅ | Multi-tenant org (name, slug, logo) |
| Device | ✅ | GPS tracker (IMEI, provider, vehicle, status) |
| Location | ✅ | GPS coordinates history (lat, lng, speed, heading) |
| Geofence | ✅ | Zones (circle/polygon, color) |
| GeofenceDevice | ✅ | Device-Geofence many-to-many |
| Trip | ✅ | Trip history (start/end, distance, duration) |
| Alert | ✅ | Notifications (type, severity, read status) |

### Enums
| Enum | Values |
|------|--------|
| Role | ADMIN, MANAGER, VIEWER |
| GpsProvider | TELTONIKA, QUECLINK, CONCOX, MOCK |
| DeviceStatus | ONLINE, OFFLINE, IDLE |
| VehicleType | CAR, TRUCK, MOTORCYCLE, VAN, BUS, OTHER |
| GeofenceType | CIRCLE, POLYGON |
| AlertType | SPEEDING, GEOFENCE_ENTER, GEOFENCE_EXIT, SOS, IGNITION_ON, IGNITION_OFF, LOW_BATTERY, DEVICE_OFFLINE, IDLE_TOO_LONG |
| AlertSeverity | INFO, WARNING, CRITICAL |

---

## 2. TROUTERS (tRPC API)

### auth.ts
| Endpoint | Access | Description |
|----------|--------|-------------|
| register | Public | Create new user |
| getSession | Protected | Get current session |
| updateProfile | Protected | Update name/email |
| changePassword | Protected | Change password |

### device.ts
| Endpoint | Access | Description |
|----------|--------|-------------|
| list | Protected | List all devices |
| create | Manager+ | Create device |
| update | Manager+ | Update device |
| delete | Manager+ | Delete device |

### location.ts
| Endpoint | Access | Description |
|----------|--------|-------------|
| getLatest | Protected | Get latest locations for all devices |
| getHistory | Protected | Get location history for device |
| getByTrip | Protected | Get locations for specific trip |

### geofence.ts
| Endpoint | Access | Description |
|----------|--------|-------------|
| list | Protected | List geofences |
| getById | Protected | Get geofence with devices |
| create | Manager+ | Create geofence |
| update | Manager+ | Update geofence |
| delete | Manager+ | Delete geofence |

### trip.ts
| Endpoint | Access | Description |
|----------|--------|-------------|
| list | Protected | List trips (with filters) |
| getById | Protected | Get trip details |

### alert.ts
| Endpoint | Access | Description |
|----------|--------|-------------|
| list | Protected | List alerts (with filters) |
| markRead | Protected | Mark single alert as read |
| markAllRead | Protected | Mark all alerts as read |
| delete | Protected | Delete alert |
| getUnreadCount | Protected | Get unread alert count |

### dashboard.ts
| Endpoint | Access | Description |
|----------|--------|-------------|
| getStats | Protected | Dashboard statistics |
| getRecentAlerts | Protected | Recent alerts |

### organization.ts
| Endpoint | Access | Description |
|----------|--------|-------------|
| getById | Protected | Get organization |
| update | Manager+ | Update organization |

---

## 3. PAGES

| Route | Status | Description |
|-------|--------|-------------|
| / | ✅ | Dashboard (stats, fleet status, alerts) |
| /devices | ✅ | Device CRUD + table |
| /map | ✅ | Leaflet map with device markers |
| /geofences | ✅ | Geofence CRUD + list |
| /trips | ✅ | Trip history + playback |
| /alerts | ✅ | Alert log + filters |
| /settings | ✅ | Profile + Organization settings |
| /login | ✅ | Auth login |
| /register | ✅ | Auth register |

---

## 4. COMPONENTS

### UI Components
| Component | File | Description |
|-----------|------|-------------|
| Button | src/components/ui/button.tsx | shadcn/ui button |
| FadeIn | src/components/ui/animation.tsx | Fade in animation |
| SlideUp | src/components/ui/animation.tsx | Slide up from bottom |
| SlideInLeft | src/components/ui/animation.tsx | Slide in from left |
| ScaleIn | src/components/ui/animation.tsx | Scale in animation |
| StaggerContainer | src/components/ui/animation.tsx | Stagger children animations |
| StaggerItem | src/components/ui/animation.tsx | Item dalam stagger container |
| AnimatedPresence | src/components/ui/animation.tsx | Animate mount/unmount |
| HoverScale | src/components/ui/animation.tsx | Hover scale effect |
| Pulse | src/components/ui/animation.tsx | Pulse animation |
| StatCard | src/components/ui/radix.tsx | Stats card dengan color variants |
| AlertCard | src/components/ui/radix.tsx | Alert card dengan severity badges |
| DeviceStatusBadge | src/components/ui/radix.tsx | ONLINE/OFFLINE/IDLE badge |

### Layout Components
| Component | File | Description |
|-----------|------|-------------|
| Sidebar | src/components/layout/sidebar.tsx | Navigation sidebar |
| Header | src/components/layout/header.tsx | Top header |

### Map Components
| Component | File | Description |
|-----------|------|-------------|
| MapView | src/components/map/map-view.tsx | Leaflet map with device markers |
| TripPlaybackMap | src/components/map/trip-playback.tsx | Trip route playback |

---

## 5. GPS PROVIDERS

| Provider | File | Status | Description |
|----------|------|--------|-------------|
| MockGpsProvider | src/server/gps/mock.ts | ✅ | Development mock (Jakarta coordinates) |
| TeltonikaAdapter | src/server/gps/teltonika.ts | ✅ | Teltonika FM series |
| QueclinkAdapter | src/server/gps/queclink.ts | ✅ | Queclink GL series |
| ConcoxAdapter | - | ⏳ | Not implemented (TODO) |

### Webhook Payload Formats

**Teltonika:**
```json
{
  "imei": "123456789012345",
  "timestamp": 1234567890,
  "latitude": -6.2088,
  "longitude": 106.8456,
  "altitude": 100,
  "speed": 60,
  "heading": 180,
  "satellites": 8,
  "ignition": 1
}
```

**Queclink:**
```json
{
  "device_id": "123456789012345",
  "report_type": "heartbeat",
  "timestamp": "2024-01-01T00:00:00Z",
  "gps": {
    "fix": true,
    "latitude": -6.2088,
    "longitude": 106.8456,
    "altitude": 100,
    "speed": 60,
    "heading": 180,
    "satellites": 8
  },
  "io": {
    "ignition": true,
    "power": true,
    "battery": 85
  }
}
```

---

## 6. REAL-TIME FEATURES

### Socket.IO Setup
| Component | File | Description |
|-----------|------|-------------|
| Socket.IO Server | server.ts | Custom Next.js server with Socket.IO |
| useSocket | src/hooks/use-socket.ts | Socket.IO client hook |
| useDeviceLocation | src/hooks/use-socket.ts | Device-specific updates |
| useDeviceUpdates | src/hooks/use-socket.ts | All device updates |

### Events
| Event | Direction | Description |
|-------|-----------|-------------|
| device:update | Server → Client | Device location update |
| device:location | Server → Client | Device-specific location |
| alert:new | Server → Client | New alert notification |
| device:subscribe | Client → Server | Subscribe to device updates |
| device:unsubscribe | Client → Server | Unsubscribe from device updates |

---

## 7. AUTH & SECURITY

### Authentication
- **Strategy:** NextAuth v5 with JWT
- **Provider:** Credentials (email + password)
- **Password Hashing:** bcryptjs
- **Session:** JWT tokens

### Authorization
- **Roles:** ADMIN, MANAGER, VIEWER
- **Protected Routes:** proxy.ts middleware
- **Public Routes:** /login, /register, /api/auth, /api/gps-webhook

### Role-Based Access
| Endpoint | ADMIN | MANAGER | VIEWER |
|----------|-------|---------|--------|
| Device CRUD | ✅ | ✅ | ❌ (read only) |
| Geofence CRUD | ✅ | ✅ | ❌ (read only) |
| Organization Update | ✅ | ✅ | ❌ |
| Alert Management | ✅ | ✅ | ✅ |
| View Dashboard | ✅ | ✅ | ✅ |

---

## 8. ANIMATIONS (Framer Motion)

| Page | Animations Used |
|------|-----------------|
| Dashboard | FadeIn + StaggerContainer |
| Devices | FadeIn + AnimatedPresence |
| Map | FadeIn |
| Geofences | FadeIn + StaggerContainer |
| Trips | FadeIn + SlideUp |
| Alerts | FadeIn + StaggerContainer |
| Settings | FadeIn + SlideUp + Tabs |
| Login | FadeIn + ScaleIn |
| Register | FadeIn + ScaleIn |

---

## 9. ISSUES FOUND

### HIGH PRIORITY

#### 9.1 GPS Webhook - Socket.IO Integration
**Issue:** server.ts creates Socket.IO but webhook route imports Socket.IO separately. Need to share IO instance properly.

**File:** src/app/api/gps-webhook/route.ts, server.ts

**Solution:** Create a shared Socket.IO singleton module.

#### 9.2 Database Migrations
**Issue:** Prisma schema defined but no migrations run.

**Solution:**
```bash
pnpm prisma migrate dev --name init
```

#### 9.3 Type Safety
**Issue:** Some `any` types used (device in DeviceRow, alert in AlertRow).

**Files:**
- src/app/(dashboard)/devices/page.tsx
- src/app/(dashboard)/alerts/page.tsx

**Solution:** Create proper TypeScript interfaces for Device and Alert types.

### MEDIUM PRIORITY

#### 9.4 Missing Error Handling
**Issue:** Some tRPC queries don't handle errors gracefully.

**Solution:** Add error boundaries and proper error states.

#### 9.5 Missing Loading States
**Issue:** Some pages show skeleton but no error states.

**Solution:** Add error states alongside loading states.

#### 9.6 Form Validation
**Issue:** Some forms don't validate all fields.

**Solution:** Add Zod schemas for form validation.

### LOW PRIORITY

#### 9.7 Missing Concox Adapter
**Issue:** Concox GPS provider not implemented.

**Solution:** Implement ConcoxAdapter following Teltonika/Queclink pattern.

#### 9.8 Environment Variables
**Issue:** .env.example exists but .env may be incomplete.

**Required Variables:**
```
DATABASE_URL=postgresql://user:password@localhost:5432/traceflow
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 10. RECOMMENDATIONS

### Phase 1: Critical (Do First)
1. [ ] Run database migrations
2. [ ] Fix Socket.IO singleton sharing
3. [ ] Add proper TypeScript interfaces
4. [ ] Add error boundaries

### Phase 2: Important (Do Next)
1. [ ] Add form validation (Zod)
2. [ ] Add loading/error states everywhere
3. [ ] Add unit tests for tRPC routers
4. [ ] Add E2E tests for critical flows

### Phase 3: Nice to Have
1. [ ] Add Concox GPS adapter
2. [ ] Add more dashboard widgets
3. [ ] Add export functionality (CSV/PDF)
4. [ ] Add notification preferences

---

## 11. BUILD STATUS

| Check | Status |
|-------|--------|
| TypeScript | ✅ Passing |
| Build | ✅ Successful |
| All Pages | ✅ Compiled |
| All Routes | ✅ Working |

---

## 12. COMMANDS

```bash
# Development
pnpm dev                    # Start development server
pnpm mock:gps               # Generate mock GPS data

# Production
pnpm build                  # Production build
pnpm start                  # Start production server

# Database
pnpm prisma generate        # Generate Prisma client
pnpm prisma migrate dev     # Run migrations
pnpm prisma studio          # Database browser

# Testing
pnpm lint                   # Run ESLint
```

---

## 13. FILE STRUCTURE

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── alerts/page.tsx
│   │   ├── devices/page.tsx
│   │   ├── geofences/page.tsx
│   │   ├── map/page.tsx
│   │   ├── settings/page.tsx
│   │   └── trips/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── gps-webhook/route.ts
│   │   └── trpc/[trpc]/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── header.tsx
│   │   └── sidebar.tsx
│   ├── map/
│   │   ├── map-view.tsx
│   │   └── trip-playback.tsx
│   └── ui/
│       ├── animation.tsx
│       ├── button.tsx
│       └── radix.tsx
├── hooks/
│   ├── use-device-location.ts
│   └── use-socket.ts
├── lib/
│   ├── api-provider.ts
│   ├── auth.ts
│   ├── prisma.ts
│   └── utils.ts
├── server/
│   ├── api/
│   │   ├── root.ts
│   │   ├── trpc.ts
│   │   └── routers/
│   │       ├── alert.ts
│   │       ├── auth.ts
│   │       ├── dashboard.ts
│   │       ├── device.ts
│   │       ├── geofence.ts
│   │       ├── location.ts
│   │       ├── organization.ts
│   │       └── trip.ts
│   └── gps/
│       ├── index.ts
│       ├── mock.ts
│       ├── provider-adapter.ts
│       ├── queclink.ts
│       └── teltonika.ts
├── types/
│   ├── gps.ts
│   └── index.ts
├── generated/prisma/
└── middleware.ts (proxy.ts)
```

---

**Audit Complete**  
**Next Step:** Fix issues starting from HIGH PRIORITY
