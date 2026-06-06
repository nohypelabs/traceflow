# TraceFlow — GPS Real-Time Tracking Dashboard

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript strict
- **API:** tRPC v11 (`createTRPCReact`)
- **Database:** PostgreSQL + Prisma ORM (generated client at `src/generated/prisma`)
- **Auth:** NextAuth v5 (Credentials, JWT strategy)
- **Real-time:** Socket.IO
- **Map:** Leaflet + OpenStreetMap (react-leaflet)
- **UI:** Tailwind CSS v4 + shadcn/ui + Lucide icons

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login, Register (no sidebar)
│   ├── (dashboard)/       # All dashboard pages (with sidebar)
│   └── api/               # Route handlers (tRPC, auth, GPS webhook)
├── server/
│   ├── api/routers/       # tRPC routers (auth, device, location, geofence, trip, alert, dashboard)
│   └── gps/               # GPS provider adapters (mock, teltonika, queclink)
├── components/
│   ├── layout/            # Sidebar, Header
│   ├── map/               # Leaflet map components (Phase 2)
│   └── ui/                # shadcn/ui
├── hooks/                 # useSocket, useDeviceLocation
├── lib/                   # api-provider, auth, prisma, utils
└── types/                 # GPS types, NextAuth extensions
```

## Commands

```bash
pnpm dev                  # Development server
pnpm build                # Production build
pnpm prisma generate      # Generate Prisma client
pnpm prisma migrate dev   # Run migrations
pnpm prisma studio        # Database browser
```

## Key Patterns

- tRPC client: `api.router.query.useQuery()` / `api.router.mutation.mutate()` from `@/lib/api-provider`
- Protected routes: `protectedProcedure`, `managerProcedure`, `adminProcedure`
- GPS provider adapter: implement `GpsProviderAdapter` interface, register in `src/server/gps/index.ts`
- Real-time: Socket.IO events → `device:update`, `alert:new`, `geofence:event`

## Environment

```env
DATABASE_URL="postgresql://user:password@localhost:5432/traceflow"
NEXTAUTH_SECRET="random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Implementation Phases

1. ✅ Scaffold + Auth + Layout
2. Device management + Map
3. Real-time updates (Socket.IO + mock provider)
4. Geofencing
5. Trip history & playback
6. Alerts & dashboard polish
