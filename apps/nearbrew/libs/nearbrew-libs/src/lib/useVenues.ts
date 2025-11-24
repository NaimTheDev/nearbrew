import { useQuery } from '@tanstack/react-query';
import { Venue } from '@nearbrew/shared-types';
import { venueService } from '../services/venueService';

export interface UseVenues {
  venues: Venue[];
  loading: boolean;
  error: Error | null;
}

export function useVenues(): UseVenues {
  const { data = [], isLoading, error } = useQuery<Venue[], Error>({
    queryKey: ['venues'],
    queryFn: async () => {
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

      return venueService.getVenues({
        lat: latitude.toString(),
        lng: longitude.toString(),
        radius: '30000'
      });
    },
    staleTime: 5 * 60 * 1000
  });

  

  return { venues: data, loading: isLoading, error };
}
