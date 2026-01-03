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
        const venues = await venueService.getVenues({
          lat: coords.lat,
          lng: coords.lng,
          radius: coords.radius ?? '10000',
        });
        return venues;
      }
    
      return [];
    },
    staleTime: 5 * 60 * 1000
  });

  if (data.length > 0 && !isFetching && !isLoading) {
    console.log(`🟢 CACHE HIT: Using cached venues (${data.length} venues, last updated: ${new Date(dataUpdatedAt).toLocaleTimeString()})`);
  }

  return { venues: data, loading: isLoading, error };
}
