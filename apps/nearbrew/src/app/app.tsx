import { useEffect, useState } from 'react';
import {
  NearBrewCard,
  StickyBanner,
  NearBrewMap,
  VenueItemListComponent,
  NearBrewAutoComplete,
  BuyMeACoffeeButton,
} from '../../libs/nearbrew-libs/src';
import { config as nearbrewConfig } from '../../libs/nearbrew-libs/src/config';

// ipApi stuff START
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
type IpApiResponse = {
  ip: string;
  city: string;
  region: string;
  country_code: string;
  latitude: number;
  longitude: number;
};

type CachedEntry = { ts: number; data: IpApiResponse };


export function throttleAsync<T>(fn: () => Promise<T>, waitMs: number) {
  let locked = false;
  let pending: Promise<T> | null = null;

  return () => {
    if (locked) {
      // Return the same promise during the throttle window
      return pending as Promise<T>;
    }
    locked = true;
    pending = fn().finally(() => {
      setTimeout(() => {
        locked = false;
        pending = null;
      }, waitMs);
    });
    return pending!;
  };
}

async function getIpGeoBoot(): Promise<IpApiResponse | null> {
  try {
    const raw = localStorage.getItem('ipgeo:last');
    if (raw) {
      const cached: CachedEntry = JSON.parse(raw);
      if (Date.now() - cached.ts < ONE_DAY_MS) return cached.data;
    }
  } catch {/* ignore parse errors */}

  try {
        const base = nearbrewConfig.apiBaseUrl; // '/api' in dev, Render URL in prod

const res = await fetch(`${base}/geo/ip`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as IpApiResponse;
    localStorage.setItem('ipgeo:last', JSON.stringify({ ts: Date.now(), data }));
    console.log('Fetched IP geolocation data:', data);
    return data;
  } catch {
    return null;
  }
}

// ipApi stuff END
const getIpGeoThrottled = throttleAsync(getIpGeoBoot, 2000);

export function App() {
  const [searchCoords, setSearchCoords] = useState<{ lat: string; lng: string; radius?: string } | null>(null);
  // Geolocation-DB IP detection (no browser permission prompt)
  const [ip, setIp] = useState<IpApiResponse | null>(null);
  const [geoFetchError, setGeoFetchError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchIp = async () => {
      try {
        const data = await getIpGeoThrottled();
      
        if (mounted) {
          setIp(data);
          // Also seed venue search coordinates from geolocation-db
          console.log('Detected IP geolocation:', data);
          const lat = data?.latitude;
          const lng = data?.longitude; // API uses `longitude`; our state uses `lng`
          if (typeof lat === 'number' && typeof lng === 'number') {
            const round2 = (n: number) => Math.round(n * 100) / 100;
            const roundedLat = round2(lat);
            const roundedLng = round2(lng);
            setSearchCoords({
              lat: roundedLat.toString(),
              lng: roundedLng.toString(),
              radius: '9000',
            });
          }
        }
      } catch (e: any) {
        if (!mounted) setGeoFetchError(e?.message ?? 'Failed to fetch IP');
      }
    };
    fetchIp();
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <StickyBanner />

      {/* Add proper margin-top to account for sticky banner height */}
      <div
        className="flex justify-center py-16 px-4"
        style={{ marginTop: '72px' }}
      >
        <NearBrewCard className="w-full max-w-3xl space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">
              How busy is your favorite coffee shop?
            </h1>
            <p className="text-sm text-muted-foreground">
              Search your favorite coffee shop to jump into its live insights or browse curated
              picks below.
            </p>
           
            {geoFetchError && (
              <p className="text-xs text-destructive">IP lookup error: {geoFetchError}</p>
            )}
          </div>
          <NearBrewAutoComplete
            onGeocodeSearch={(coords: { lat: number; lng: number; radius?: string }) =>
              setSearchCoords({ lat: coords.lat.toString(), lng: coords.lng.toString(), radius: coords.radius ?? '9000' })
            }
          />
          <NearBrewMap
            height={350}
            latitude={searchCoords ? Number(searchCoords.lat) : undefined}
            longitude={searchCoords ? Number(searchCoords.lng) : undefined}
            onLocate={({ lat, lng }) =>
              setSearchCoords({ lat: lat.toString(), lng: lng.toString(), radius: '9000' })
            }
          />
          
          

          {searchCoords && (
            <VenueItemListComponent coords={searchCoords} />
          )}
        </NearBrewCard>
      </div>

      <div className="fixed inset-x-0 bottom-4 flex justify-center sm:hidden px-4">
        <BuyMeACoffeeButton />
      </div>
    </div>
  );
}

export default App;
