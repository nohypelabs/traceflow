// Device types
export interface Device {
  id: string;
  name: string;
  imei: string;
  provider: string;
  vehiclePlate: string | null;
  vehicleType: string | null;
  status: 'ONLINE' | 'OFFLINE' | 'IDLE';
  lastLatitude: number | null;
  lastLongitude: number | null;
  lastSpeed: number | null;
  lastHeading: number | null;
  lastIgnition: boolean | null;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt?: Date;
}

export interface DeviceWithOrganization extends Device {
  organizationId: string;
}

// Location types
export interface Location {
  id: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  ignition: boolean | null;
  satellites: number | null;
  accuracy: number | null;
  fuelLevel: number | null;
  odometer: number | null;
  recordedAt: Date;
  receivedAt: Date;
}

// Geofence types
export interface Geofence {
  id: string;
  name: string;
  description: string | null;
  type: 'CIRCLE' | 'POLYGON';
  centerLat: number | null;
  centerLng: number | null;
  radius: number | null;
  polygon: [number, number][] | null;
  color: string;
  organizationId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface GeofenceWithDevices extends Geofence {
  geofenceDevices: {
    device: Device;
  }[];
  _count: {
    geofenceDevices: number;
  };
}

// Trip types
export interface Trip {
  id: string;
  deviceId: string;
  startAddress: string | null;
  endAddress: string | null;
  startOdometer: number | null;
  endOdometer: number | null;
  distance: number | null;
  maxSpeed: number | null;
  averageSpeed: number | null;
  duration: number | null;
  startedAt: Date;
  endedAt: Date | null;
}

export interface TripWithDevice extends Trip {
  device: {
    name: string;
    vehiclePlate: string | null;
  };
}

// Alert types
export interface Alert {
  id: string;
  deviceId: string;
  geofenceId: string | null;
  type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  latitude: number | null;
  longitude: number | null;
  isRead: boolean;
  triggeredAt: Date;
}

export interface AlertWithDevice extends Alert {
  device: {
    name: string;
    vehiclePlate: string | null;
  };
  geofence: {
    name: string;
  } | null;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  createdAt: Date;
  updatedAt?: Date;
}

export interface OrganizationWithCounts extends Organization {
  _count: {
    users: number;
    devices: number;
  };
}

// User types
export interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  organizationId: string | null;
}

// Dashboard stats
export interface DashboardStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  idleDevices: number;
  todayTrips: number;
}

// GPS types
export interface DeviceLocation {
  deviceId: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  satellites?: number;
  ignition?: boolean;
  timestamp: Date;
}

export interface ParsedWebhookPayload {
  provider: string;
  deviceId: string;
  locations: DeviceLocation[];
}
