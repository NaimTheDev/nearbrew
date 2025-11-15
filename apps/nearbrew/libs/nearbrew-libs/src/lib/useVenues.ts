import { useState, useEffect } from 'react';
import { Venue } from '@nearbrew/shared-types';
import { venueService } from '../services/venueService';

export interface UseVenues {
  venues: Venue[];
  loading: boolean;
  error: Error | null;
}

export function useVenues(): UseVenues {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
          throw new Error('Geolocation is not supported by this browser');
        }

        // Get current position using the Geolocation Web API
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000 // Cache for 5 minutes
            }
          );
        });

        const { latitude, longitude } = position.coords;
        
        // Convert to strings as expected by the API
        const data = await venueService.getVenues({
          lat: latitude.toString(),
          lng: longitude.toString(),
          radius: "30000",
        });
        
        setVenues(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch venues'));
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  return { venues, loading, error };
}
