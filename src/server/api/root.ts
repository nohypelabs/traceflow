import { createTRPCRouter } from '@/server/api/trpc';
import { authRouter } from '@/server/api/routers/auth';
import { deviceRouter } from '@/server/api/routers/device';
import { locationRouter } from '@/server/api/routers/location';
import { geofenceRouter } from '@/server/api/routers/geofence';
import { tripRouter } from '@/server/api/routers/trip';
import { alertRouter } from '@/server/api/routers/alert';
import { dashboardRouter } from '@/server/api/routers/dashboard';
import { organizationRouter } from '@/server/api/routers/organization';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  device: deviceRouter,
  location: locationRouter,
  geofence: geofenceRouter,
  trip: tripRouter,
  alert: alertRouter,
  dashboard: dashboardRouter,
  organization: organizationRouter,
});

export type AppRouter = typeof appRouter;
