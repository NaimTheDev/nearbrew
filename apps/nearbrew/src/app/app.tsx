import { useState } from 'react';
import {
  NearBrewCard,
  StickyBanner,
  NearBrewMap,
  VenueItemListComponent,
  NearBrewAutoComplete,
  BuyMeACoffeeButton,
  NearBrewButton,
} from '../../libs/nearbrew-libs/src';

export function App() {
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setIsRequestingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationError(null);
        setIsRequestingLocation(false);
        // You can add logic here to update the map or do something with the coordinates
        console.log('Location:', position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setLocationError(error.message || 'Unable to retrieve location');
        setIsRequestingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };
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
          </div>
          <NearBrewAutoComplete />
          <NearBrewMap height={350} />
          
          {/* Location button below the map */}
          <div className="flex flex-col items-center gap-2">
            <NearBrewButton
              size="md"
              variant="secondary"
              onClick={requestUserLocation}
              disabled={isRequestingLocation}
            >
              {isRequestingLocation ? 'Updating location...' : '📍 Use my location'}
            </NearBrewButton>
            {locationError && (
              <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 shadow-sm max-w-md text-center">
                {locationError}
              </div>
            )}
          </div>

          <VenueItemListComponent />
        </NearBrewCard>
      </div>

      <div className="fixed inset-x-0 bottom-4 flex justify-center sm:hidden px-4">
        <BuyMeACoffeeButton />
      </div>
    </div>
  );
}

export default App;
