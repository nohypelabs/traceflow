// Internationalization (i18n) Utility
// Support Bahasa Indonesia dan English

export type Locale = 'id' | 'en';

export interface Translations {
  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    filter: string;
    export: string;
    import: string;
    loading: string;
    noData: string;
    confirm: string;
    back: string;
    next: string;
    previous: string;
    close: string;
    yes: string;
    no: string;
  };
  
  // Navigation
  nav: {
    dashboard: string;
    liveMap: string;
    devices: string;
    geofences: string;
    trips: string;
    alerts: string;
    reports: string;
    settings: string;
  };
  
  // Dashboard
  dashboard: {
    title: string;
    totalDevices: string;
    online: string;
    offline: string;
    idle: string;
    todayTrips: string;
    fleetStatus: string;
    recentAlerts: string;
    viewAll: string;
    noAlerts: string;
  };
  
  // Devices
  devices: {
    title: string;
    addDevice: string;
    deviceName: string;
    imei: string;
    vehiclePlate: string;
    vehicleType: string;
    lastSeen: string;
    status: string;
    actions: string;
    noDevices: string;
    createDevice: string;
    editDevice: string;
    deleteDevice: string;
    confirmDelete: string;
  };
  
  // Map
  map: {
    title: string;
    devices: string;
    loading: string;
  };
  
  // Geofences
  geofences: {
    title: string;
    addGeofence: string;
    name: string;
    type: string;
    circle: string;
    polygon: string;
    centerLat: string;
    centerLng: string;
    radius: string;
    color: string;
    description: string;
    noGeofences: string;
    createGeofence: string;
  };
  
  // Trips
  trips: {
    title: string;
    device: string;
    from: string;
    to: string;
    distance: string;
    duration: string;
    maxSpeed: string;
    avgSpeed: string;
    playback: string;
    noTrips: string;
    selectDevice: string;
  };
  
  // Alerts
  alerts: {
    title: string;
    unread: string;
    all: string;
    speeding: string;
    geofenceEnter: string;
    geofenceExit: string;
    sos: string;
    noAlerts: string;
    markRead: string;
    delete: string;
  };
  
  // Reports
  reports: {
    title: string;
    period: string;
    daily: string;
    weekly: string;
    monthly: string;
    totalTrips: string;
    totalDistance: string;
    totalAlerts: string;
    exportTXT: string;
    exportMD: string;
    exportCSV: string;
    topAlerts: string;
    deviceSummary: string;
  };
  
  // Settings
  settings: {
    title: string;
    profile: string;
    organization: string;
    whatsapp: string;
    name: string;
    email: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    saveChanges: string;
    changePassword: string;
    orgName: string;
    slug: string;
    logoUrl: string;
    enableNotifications: string;
    notificationTypes: string;
    dailyReport: string;
    testSend: string;
  };
  
  // Auth
  auth: {
    login: string;
    register: string;
    email: string;
    password: string;
    demoAccount: string;
    fillDemo: string;
    signIn: string;
    signOut: string;
    noAccount: string;
    hasAccount: string;
    invalidCredentials: string;
    minPassword: string;
  };
}

export const translations: Record<Locale, Translations> = {
  id: {
    common: {
      save: 'Simpan',
      cancel: 'Batal',
      delete: 'Hapus',
      edit: 'Edit',
      add: 'Tambah',
      search: 'Cari',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      loading: 'Memuat...',
      noData: 'Tidak ada data',
      confirm: 'Konfirmasi',
      back: 'Kembali',
      next: 'Selanjutnya',
      previous: 'Sebelumnya',
      close: 'Tutup',
      yes: 'Ya',
      no: 'Tidak',
    },
    nav: {
      dashboard: 'Dashboard',
      liveMap: 'Peta Live',
      devices: 'Perangkat',
      geofences: 'Geofence',
      trips: 'Perjalanan',
      alerts: 'Peringatan',
      reports: 'Laporan',
      settings: 'Pengaturan',
    },
    dashboard: {
      title: 'Dashboard',
      totalDevices: 'Total Perangkat',
      online: 'Online',
      offline: 'Offline',
      idle: 'Idle',
      todayTrips: 'Perjalanan Hari Ini',
      fleetStatus: 'Status Armada',
      recentAlerts: 'Peringatan Terbaru',
      viewAll: 'Lihat semua',
      noAlerts: 'Tidak ada peringatan terbaru',
    },
    devices: {
      title: 'Perangkat',
      addDevice: 'Tambah Perangkat',
      deviceName: 'Nama Perangkat',
      imei: 'IMEI',
      vehiclePlate: 'Plat Kendaraan',
      vehicleType: 'Jenis Kendaraan',
      lastSeen: 'Terakhir Dilihat',
      status: 'Status',
      actions: 'Aksi',
      noDevices: 'Belum ada perangkat',
      createDevice: 'Buat Perangkat',
      editDevice: 'Edit Perangkat',
      deleteDevice: 'Hapus Perangkat',
      confirmDelete: 'Yakin ingin menghapus perangkat ini?',
    },
    map: {
      title: 'Peta Live',
      devices: 'perangkat',
      loading: 'Memuat peta...',
    },
    geofences: {
      title: 'Geofence',
      addGeofence: 'Tambah Geofence',
      name: 'Nama',
      type: 'Tipe',
      circle: 'Lingkaran',
      polygon: 'Poligon',
      centerLat: 'Lintang Pusat',
      centerLng: 'Bujur Pusat',
      radius: 'Radius (meter)',
      color: 'Warna',
      description: 'Deskripsi',
      noGeofences: 'Belum ada geofence',
      createGeofence: 'Buat Geofence',
    },
    trips: {
      title: 'Riwayat Perjalanan',
      device: 'Perangkat',
      from: 'Dari',
      to: 'Sampai',
      distance: 'Jarak',
      duration: 'Durasi',
      maxSpeed: 'Kecepatan Maks',
      avgSpeed: 'Kecepatan Rata²',
      playback: 'Putar Ulang',
      noTrips: 'Tidak ada perjalanan',
      selectDevice: 'Pilih perangkat',
    },
    alerts: {
      title: 'Peringatan',
      unread: 'Belum Dibaca',
      all: 'Semua',
      speeding: 'Kecepatan',
      geofenceEnter: 'Masuk Geofence',
      geofenceExit: 'Keluar Geofence',
      sos: 'SOS',
      noAlerts: 'Tidak ada peringatan',
      markRead: 'Tandai Dibaca',
      delete: 'Hapus',
    },
    reports: {
      title: 'Laporan',
      period: 'Periode',
      daily: 'Harian',
      weekly: 'Mingguan',
      monthly: 'Bulanan',
      totalTrips: 'Total Perjalanan',
      totalDistance: 'Total Jarak',
      totalAlerts: 'Total Peringatan',
      exportTXT: 'Export TXT',
      exportMD: 'Export MD',
      exportCSV: 'Export CSV',
      topAlerts: 'Peringatan Teratas',
      deviceSummary: 'Ringkasan Perangkat',
    },
    settings: {
      title: 'Pengaturan',
      profile: 'Profil',
      organization: 'Organisasi',
      whatsapp: 'WhatsApp',
      name: 'Nama',
      email: 'Email',
      currentPassword: 'Kata Sandi Saat Ini',
      newPassword: 'Kata Sandi Baru',
      confirmPassword: 'Konfirmasi Kata Sandi',
      saveChanges: 'Simpan Perubahan',
      changePassword: 'Ubah Kata Sandi',
      orgName: 'Nama Organisasi',
      slug: 'Slug',
      logoUrl: 'URL Logo',
      enableNotifications: 'Aktifkan Notifikasi',
      notificationTypes: 'Jenis Notifikasi',
      dailyReport: 'Laporan Harian',
      testSend: 'Test Kirim',
    },
    auth: {
      login: 'Masuk',
      register: 'Daftar',
      email: 'Email',
      password: 'Kata Sandi',
      demoAccount: 'Akun Demo',
      fillDemo: 'Isi Kredensial Demo',
      signIn: 'Masuk',
      signOut: 'Keluar',
      noAccount: 'Belum punya akun?',
      hasAccount: 'Sudah punya akun?',
      invalidCredentials: 'Email atau kata sandi salah',
      minPassword: 'Minimal 8 karakter',
    },
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      loading: 'Loading...',
      noData: 'No data',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      yes: 'Yes',
      no: 'No',
    },
    nav: {
      dashboard: 'Dashboard',
      liveMap: 'Live Map',
      devices: 'Devices',
      geofences: 'Geofences',
      trips: 'Trips',
      alerts: 'Alerts',
      reports: 'Reports',
      settings: 'Settings',
    },
    dashboard: {
      title: 'Dashboard',
      totalDevices: 'Total Devices',
      online: 'Online',
      offline: 'Offline',
      idle: 'Idle',
      todayTrips: "Today's Trips",
      fleetStatus: 'Fleet Status',
      recentAlerts: 'Recent Alerts',
      viewAll: 'View all',
      noAlerts: 'No recent alerts',
    },
    devices: {
      title: 'Devices',
      addDevice: 'Add Device',
      deviceName: 'Device Name',
      imei: 'IMEI',
      vehiclePlate: 'Vehicle Plate',
      vehicleType: 'Vehicle Type',
      lastSeen: 'Last Seen',
      status: 'Status',
      actions: 'Actions',
      noDevices: 'No devices yet',
      createDevice: 'Create Device',
      editDevice: 'Edit Device',
      deleteDevice: 'Delete Device',
      confirmDelete: 'Are you sure you want to delete this device?',
    },
    map: {
      title: 'Live Map',
      devices: 'devices',
      loading: 'Loading map...',
    },
    geofences: {
      title: 'Geofences',
      addGeofence: 'Add Geofence',
      name: 'Name',
      type: 'Type',
      circle: 'Circle',
      polygon: 'Polygon',
      centerLat: 'Center Latitude',
      centerLng: 'Center Longitude',
      radius: 'Radius (meters)',
      color: 'Color',
      description: 'Description',
      noGeofences: 'No geofences yet',
      createGeofence: 'Create Geofence',
    },
    trips: {
      title: 'Trip History',
      device: 'Device',
      from: 'From',
      to: 'To',
      distance: 'Distance',
      duration: 'Duration',
      maxSpeed: 'Max Speed',
      avgSpeed: 'Avg Speed',
      playback: 'Playback',
      noTrips: 'No trips found',
      selectDevice: 'Select device',
    },
    alerts: {
      title: 'Alerts',
      unread: 'Unread',
      all: 'All',
      speeding: 'Speeding',
      geofenceEnter: 'Geofence Enter',
      geofenceExit: 'Geofence Exit',
      sos: 'SOS',
      noAlerts: 'No alerts',
      markRead: 'Mark Read',
      delete: 'Delete',
    },
    reports: {
      title: 'Reports',
      period: 'Period',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      totalTrips: 'Total Trips',
      totalDistance: 'Total Distance',
      totalAlerts: 'Total Alerts',
      exportTXT: 'Export TXT',
      exportMD: 'Export MD',
      exportCSV: 'Export CSV',
      topAlerts: 'Top Alerts',
      deviceSummary: 'Device Summary',
    },
    settings: {
      title: 'Settings',
      profile: 'Profile',
      organization: 'Organization',
      whatsapp: 'WhatsApp',
      name: 'Name',
      email: 'Email',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      saveChanges: 'Save Changes',
      changePassword: 'Change Password',
      orgName: 'Organization Name',
      slug: 'Slug',
      logoUrl: 'Logo URL',
      enableNotifications: 'Enable Notifications',
      notificationTypes: 'Notification Types',
      dailyReport: 'Daily Report',
      testSend: 'Test Send',
    },
    auth: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      demoAccount: 'Demo Account',
      fillDemo: 'Fill Demo Credentials',
      signIn: 'Sign in',
      signOut: 'Sign out',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      invalidCredentials: 'Invalid email or password',
      minPassword: 'Minimum 8 characters',
    },
  },
};

// Get browser locale
export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return 'id';
  
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'en' ? 'en' : 'id';
}

// Get stored locale or default
export function getLocale(): Locale {
  if (typeof window === 'undefined') return 'id';
  
  const stored = localStorage.getItem('locale') as Locale;
  return stored || getBrowserLocale();
}

// Set locale
export function setLocale(locale: Locale) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('locale', locale);
}

// Get translation
export function t(key: string, locale?: Locale): string {
  const currentLocale = locale || getLocale();
  const keys = key.split('.');
  
  let value: any = translations[currentLocale];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to Indonesian
      value = translations['id'];
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // Return key if not found
        }
      }
      return typeof value === 'string' ? value : key;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

// Hook for using translations in components
export function useTranslations() {
  const locale = getLocale();
  
  return {
    locale,
    t: (key: string) => t(key, locale),
    setLocale,
  };
}
