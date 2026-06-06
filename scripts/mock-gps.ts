/**
 * Mock GPS Data Generator
 * Sends simulated GPS data to the webhook endpoint for testing
 */

const WEBHOOK_URL = 'http://localhost:3000/api/gps-webhook';
const DEVICES = [
  { id: 'device-001', name: 'Truck A', imei: '123456789012345' },
  { id: 'device-002', name: 'Car B', imei: '123456789012346' },
  { id: 'device-003', name: 'Motorcycle C', imei: '123456789012347' },
];

// Jakarta center coordinates
const CENTER_LAT = -6.2088;
const CENTER_LNG = 106.8456;
const RADIUS = 0.02; // ~2km radius

function getRandomOffset() {
  return (Math.random() - 0.5) * RADIUS * 2;
}

function generateLocation(deviceId: string) {
  return {
    deviceId,
    lat: CENTER_LAT + getRandomOffset(),
    lng: CENTER_LNG + getRandomOffset(),
    speed: Math.random() * 80,
    heading: Math.random() * 360,
    ignition: Math.random() > 0.3,
    timestamp: new Date().toISOString(),
  };
}

async function sendLocationUpdate(deviceId: string) {
  const location = generateLocation(deviceId);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gps-provider': 'MOCK',
      },
      body: JSON.stringify(location),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`[${new Date().toISOString()}] Sent update for ${deviceId}:`, {
        lat: location.lat.toFixed(4),
        lng: location.lng.toFixed(4),
        speed: location.speed.toFixed(1),
      });
    } else {
      console.error(`Failed to send update for ${deviceId}:`, response.statusText);
    }
  } catch (error) {
    console.error(`Error sending update for ${deviceId}:`, error);
  }
}

async function run() {
  console.log('Starting mock GPS data generator...');
  console.log(`Sending updates to: ${WEBHOOK_URL}`);
  console.log(`Devices: ${DEVICES.map((d) => d.name).join(', ')}`);
  console.log('');

  // Send updates every 5 seconds
  setInterval(() => {
    DEVICES.forEach((device) => {
      sendLocationUpdate(device.imei);
    });
  }, 5000);

  // Send initial updates immediately
  DEVICES.forEach((device) => {
    sendLocationUpdate(device.imei);
  });
}

run().catch(console.error);
