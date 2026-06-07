'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';

interface DeviceCounts {
  total: number;
  online: number;
  idle: number;
  offline: number;
}

const emptyCounts: DeviceCounts = { total: 0, online: 0, idle: 0, offline: 0 };

/**
 * Subscribes to Supabase Realtime changes on the devices table.
 * Returns live device status counts and connection state.
 * Falls back gracefully if Supabase env vars are not configured.
 */
export function useDeviceRealtime() {
  const [isConnected, setIsConnected] = useState(false);
  const [deviceCounts, setDeviceCounts] = useState<DeviceCounts>(emptyCounts);

  const fetchCounts = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    const { data, error } = await supabase
      .from('devices')
      .select('status');

    if (error || !data) return;

    const counts: DeviceCounts = { total: 0, online: 0, idle: 0, offline: 0 };
    for (const d of data as { status: string }[]) {
      counts.total++;
      if (d.status === 'ONLINE') counts.online++;
      else if (d.status === 'IDLE') counts.idle++;
      else counts.offline++;
    }

    setDeviceCounts(counts);
  }, []);

  // Fetch initial counts
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Subscribe to realtime changes
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel('device-status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'devices',
        },
        () => {
          fetchCounts();
        },
      )
      .subscribe((status: string) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCounts]);

  return { isConnected, deviceCounts };
}
