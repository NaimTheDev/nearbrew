import { useQuery } from '@tanstack/react-query';
import { Venue } from '@nearbrew/shared-types';
import { venueService } from '../services/venueService';

export interface UseVenues {
  venues: Venue[];
  loading: boolean;
  error: Error | null;
}

export function useVenues(): UseVenues {
  const { data = [], isLoading, error, isFetching, dataUpdatedAt } = useQuery<Venue[], Error>({
    queryKey: ['venues'],
    queryFn: async () => {
      console.log('🔴 CACHE MISS: Fetching venues from API');
      
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
