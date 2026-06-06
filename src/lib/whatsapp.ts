// WhatsApp Notification Utility
// Supports multiple WhatsApp API providers

export interface WhatsAppConfig {
  provider: 'whatsapp-web' | 'twilio' | 'messagebird' | 'fonnte';
  apiKey?: string;
  phoneNumber?: string;
  instanceId?: string;
}

export interface WhatsAppMessage {
  to: string;
  message: string;
}

// Fonnte API (populer di Indonesia)
async function sendViaFonnte(
  apiKey: string,
  to: string,
  message: string
): Promise<boolean> {
  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: to,
        message: message,
      }),
    });

    const data = await response.json();
    return data.status === true;
  } catch (error) {
    console.error('Fonnte error:', error);
    return false;
  }
}

// Twilio WhatsApp API
async function sendViaTwilio(
  accountSid: string,
  authToken: string,
  from: string,
  to: string,
  message: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: `whatsapp:${from}`,
          To: `whatsapp:${to}`,
          Body: message,
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Twilio error:', error);
    return false;
  }
}

// Main send function
export async function sendWhatsApp(
  config: WhatsAppConfig,
  message: WhatsAppMessage
): Promise<boolean> {
  switch (config.provider) {
    case 'fonnte':
      if (!config.apiKey) {
        console.error('Fonnte API key not configured');
        return false;
      }
      return sendViaFonnte(config.apiKey, message.to, message.message);

    case 'twilio':
      if (!config.apiKey || !config.phoneNumber) {
        console.error('Twilio credentials not configured');
        return false;
      }
      // Note: In production, store accountSid and authToken separately
      return false; // Placeholder - needs proper Twilio setup

    default:
      console.error('Unsupported WhatsApp provider:', config.provider);
      return false;
  }
}

// Pre-built message templates
export const WhatsAppTemplates = {
  deviceOnline: (deviceName: string) =>
    `🟢 *Perangkat Online*\n\nPerangkat "${deviceName}" telah online.`,

  deviceOffline: (deviceName: string) =>
    `🔴 *Perangkat Offline*\n\nPerangkat "${deviceName}" telah offline.`,

  geofenceEnter: (deviceName: string, geofenceName: string) =>
    `📍 *Masuk Geofence*\n\nPerangkat "${deviceName}" memasuki zona "${geofenceName}".`,

  geofenceExit: (deviceName: string, geofenceName: string) =>
    `📍 *Keluar Geofence*\n\nPerangkat "${deviceName}" keluar dari zona "${geofenceName}".`,

  speedingAlert: (deviceName: string, speed: number) =>
    `⚠️ *Peringatan Kecepatan*\n\nPerangkat "${deviceName}" melaju ${speed} km/jam.`,

  sosAlert: (deviceName: string) =>
    `🚨 *ALERT SOS*\n\nPerangkat "${deviceName}" mengaktifkan tombol SOS!`,

  dailyReport: (stats: {
    totalDevices: number;
    onlineDevices: number;
    trips: number;
    alerts: number;
  }) =>
    `📊 *Laporan Harian TraceFlow*\n\n` +
    `📱 Total Perangkat: ${stats.totalDevices}\n` +
    `🟢 Online: ${stats.onlineDevices}\n` +
    `🛣️ Perjalanan: ${stats.trips}\n` +
    `⚠️ Peringatan: ${stats.alerts}\n\n` +
    `_Dikirim otomatis oleh TraceFlow_`,
};

// Helper to format phone number for Indonesian numbers
export function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Convert Indonesian format
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('+62')) {
    cleaned = cleaned.slice(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  
  return cleaned;
}
