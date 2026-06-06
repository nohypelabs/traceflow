import type { GpsProviderAdapter, GpsProviderType } from './provider-adapter';
import { MockGpsProvider } from './mock';
import { TeltonikaAdapter } from './teltonika';
import { QueclinkAdapter } from './queclink';
import { ConcoxAdapter } from './concox';

const adapters = new Map<GpsProviderType, GpsProviderAdapter>();

export function getGpsAdapter(provider: GpsProviderType): GpsProviderAdapter {
  const existing = adapters.get(provider);
  if (existing) return existing;

  let adapter: GpsProviderAdapter;

  switch (provider) {
    case 'MOCK':
      adapter = new MockGpsProvider();
      break;
    case 'TELTONIKA':
      adapter = new TeltonikaAdapter();
      break;
    case 'QUECLINK':
      adapter = new QueclinkAdapter();
      break;
    case 'CONCOX':
      adapter = new ConcoxAdapter();
      break;
    default:
      adapter = new MockGpsProvider();
  }

  adapters.set(provider, adapter);
  return adapter;
}

// Export adapters for direct use
export { MockGpsProvider } from './mock';
export { TeltonikaAdapter } from './teltonika';
export { QueclinkAdapter } from './queclink';
export { ConcoxAdapter } from './concox';
