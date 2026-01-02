import { useEffect, useState } from 'react';
import {
  NearBrewCard,
  StickyBanner,
  NearBrewMap,
  VenueItemListComponent,
  NearBrewAutoComplete,
  BuyMeACoffeeButton,
} from '../../libs/nearbrew-libs/src';

export function App() {
  const [searchCoords, setSearchCoords] = useState<{ lat: string; lng: string; radius?: string } | null>(null);
  // Geolocation-DB IP detection (no browser permission prompt)
  const [ip, setIp] = useState<string | null>(null);
  const [geoFetchError, setGeoFetchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchIp = async () => {
      try {
        const response = await fetch('https://geolocation-db.com/json/');
        const data = await response.json();
        if (!cancelled) {
          setIp(data?.IPv4 ?? null);
          // Also seed venue search coordinates from geolocation-db
          const lat = data?.latitude;
          const lng = data?.longitude; // API uses `longitude`; our state uses `lng`
          if (typeof lat === 'number' && typeof lng === 'number') {
            setSearchCoords({
              lat: lat.toString(),
              lng: lng.toString(),
              radius: '30000',
            });
          }
        }
      } catch (e: any) {
        if (!cancelled) setGeoFetchError(e?.message ?? 'Failed to fetch IP');
      }
    };
    fetchIp();
    return () => {
      cancelled = true;
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
              setSearchCoords({ lat: coords.lat.toString(), lng: coords.lng.toString(), radius: coords.radius ?? '30000' })
            }
          />
          <NearBrewMap
            height={350}
            latitude={searchCoords ? Number(searchCoords.lat) : undefined}
            longitude={searchCoords ? Number(searchCoords.lng) : undefined}
          />
          
          

          <VenueItemListComponent coords={searchCoords ?? undefined} />
        </NearBrewCard>
      </div>

      <div className="fixed inset-x-0 bottom-4 flex justify-center sm:hidden px-4">
        <BuyMeACoffeeButton />
      </div>
    </div>
  );
}

export default App;
