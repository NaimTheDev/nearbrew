import { useQuery } from '@tanstack/react-query';
import { Venue } from '@nearbrew/shared-types';
import { venueService } from '../services/venueService';

export interface UseVenues {
  venues: Venue[];
  loading: boolean;
  error: Error | null;
}

export type VenueSearchCoords = { lat: string; lng: string; radius?: string };

export function useVenues(coords?: VenueSearchCoords): UseVenues {
  const { data = [], isLoading, error, isFetching, dataUpdatedAt } = useQuery<Venue[], Error>({
    queryKey: ['venues', coords?.lat ?? null, coords?.lng ?? null, coords?.radius ?? null],
    queryFn: async () => {
      console.log('🔴 CACHE MISS: Fetching venues from API');
      
      if (coords?.lat && coords?.lng) {
        // Use provided coordinates (from a geocoded address search)
        const venues = await venueService.getVenues({
          lat: coords.lat,
          lng: coords.lng,
          radius: coords.radius ?? '30000',
        });
        return venues;
      }

      // Fall back to browser geolocation
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = position.coords;

      const venues = await venueService.getVenues({
        lat: latitude.toString(),
        lng: longitude.toString(),
        radius: '30000'
      });
      
      return venues;
    },
    staleTime: 5 * 60 * 1000
  });

  // Log cache hit when data exists and not currently fetching
  if (data.length > 0 && !isFetching && !isLoading) {
    console.log(`🟢 CACHE HIT: Using cached venues (${data.length} venues, last updated: ${new Date(dataUpdatedAt).toLocaleTimeString()})`);
  }

  return { venues: data, loading: isLoading, error };
}
