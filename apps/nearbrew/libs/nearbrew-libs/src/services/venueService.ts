import { Venue, VenueFilterResponse, VenueFilterRequest } from '@nearbrew/shared-types';

interface VenueLookupResponse {
  status: 'ok';
  venue: Venue;
}

export const venueService = {
  async getVenues(params: VenueFilterRequest): Promise<Venue[]> {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        for (const v of value) {
          searchParams.append(key, String(v));
        }
      } else {
        searchParams.set(key, String(value));
      }
    }

    const response = await fetch(`/api/venues/filter?${searchParams.toString()}`);
    const data = await response.json() as VenueFilterResponse;
    return data.venues;
  },

  async getVenueById(venueId: string): Promise<Venue | null> {
    const response = await fetch(`/api/venues/${encodeURIComponent(venueId)}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Unable to load this venue at the moment');
    }

    const payload = (await response.json()) as VenueLookupResponse;
    return payload.venue ?? null;
  }
};
