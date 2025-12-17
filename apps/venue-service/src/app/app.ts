import * as path from 'path';
import { FastifyInstance } from 'fastify';
import AutoLoad from '@fastify/autoload';
import fastifyCors from '@fastify/cors';
import NodeCache from 'node-cache';
import {
  Venue,
  VenueFilterRequest,
  VenueFilterResponse,
  VenueLiveRequest,
  VenueLiveResponse,
  HealthResponse
} from '@nearbrew/shared-types';

/* eslint-disable-next-line */
export interface AppOptions {}

// Initialize cache with 10 minute TTL
const cache = new NodeCache({ stdTTL: 600 });

type BestTimeSearchResponse = {
  status: string;
  job_id: string;
};

type BestTimeProgressResponse = {
  job_finished: boolean;
  venues: Venue[];
};

// Helper function to calculate distance between two coordinates
const isNearby = (lat1: number, lon1: number, lat2: number, lon2: number, radiusM: number): boolean => {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) ** 2;
  const distance = 2 * R * Math.asin(Math.sqrt(a));
  return distance <= radiusM;
};

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const createDefaultWindow = (): VenueFilterResponse['window'] => ({
  time_window_start: 0,
  time_window_start_ix: 0,
  time_window_start_12h: '',
  day_window_start_int: 0,
  day_window_start_txt: '',
  day_window_end_int: 0,
  day_window_end_txt: '',
  time_window_end: 0,
  time_window_end_ix: 0,
  time_window_end_12h: '',
  day_window: '',
  time_local: 0,
  time_local_12: '',
  time_local_index: 0,
});

const pollForResults = async (jobId: string): Promise<Venue[]> => {
  const progressUrl = new URL('https://besttime.app/api/v1/venues/progress');
  progressUrl.searchParams.append('job_id', jobId);

  const maxRetries = 10;
  const delayMs = 2000;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(progressUrl.toString());

    if (!response.ok) {
      throw new Error(`Progress polling failed with status ${response.status}`);
    }

    const data = (await response.json()) as BestTimeProgressResponse;

    if (data.job_finished) {
      return data.venues ?? [];
    }

    await delay(delayMs);
  }

  throw new Error('Search timed out');
};

const getVenuesForLocation = async (
  lat: number,
  lng: number,
  radius: number
): Promise<{ venues: Venue[]; window?: VenueFilterResponse['window']; status?: string }> => {
  const apiKey = process.env.BEST_TIME_APP_API_KEY;
  if (!apiKey) {
    throw new Error('BEST_TIME_APP_API_KEY environment variable is not set');
  }

  const bestTimeUrl = new URL('https://besttime.app/api/v1/venues/filter');
  bestTimeUrl.searchParams.append('api_key_private', apiKey);
  bestTimeUrl.searchParams.append('busy_min', '50');
  bestTimeUrl.searchParams.append('busy_max', '100');
  bestTimeUrl.searchParams.append('live', 'true');
  bestTimeUrl.searchParams.append('types', 'CAFE,COFFEE');
  bestTimeUrl.searchParams.append('lat', lat.toString());
  bestTimeUrl.searchParams.append('lng', lng.toString());
  bestTimeUrl.searchParams.append('radius', radius.toString());
  bestTimeUrl.searchParams.append('order_by', 'day_rank_max,reviews');
  bestTimeUrl.searchParams.append('order', 'asc,desc');
  bestTimeUrl.searchParams.append('foot_traffic', 'both');
  bestTimeUrl.searchParams.append('limit', '20');
  bestTimeUrl.searchParams.append('page', '0');

  const filterResponse = await fetch(bestTimeUrl.toString());

  if (filterResponse.ok) {
    const bestTimeData = (await filterResponse.json()) as VenueFilterResponse;

    if (Array.isArray(bestTimeData.venues) && bestTimeData.venues.length > 0) {
      return {
        venues: bestTimeData.venues,
        window: bestTimeData.window,
        status: bestTimeData.status,
      };
    }
  }

  if (filterResponse.status !== 404 && filterResponse.ok) {
    // An OK response with empty venues falls through to seeding; other non-404 errors bubble up.
  } else if (!filterResponse.ok && filterResponse.status !== 404) {
    throw new Error(`BestTime API returned ${filterResponse.status}: ${filterResponse.statusText}`);
  }

  const searchResponse = await fetch('https://besttime.app/api/v1/venues/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key_private: apiKey,
      q: 'cafes and coffee shops',
      lat,
      lng,
      radius,
      fast: 'true',
      format: 'raw',
    }),
  });

  if (!searchResponse.ok) {
    throw new Error(`BestTime search failed with status ${searchResponse.status}`);
  }

  const searchData = (await searchResponse.json()) as BestTimeSearchResponse;

  if (!searchData.job_id) {
    throw new Error('BestTime search did not return a job_id');
  }

  const venues = await pollForResults(searchData.job_id);

  return {
    venues,
    status: 'ok',
  };
};

export async function app(fastify: FastifyInstance, opts: AppOptions) {
  
   // CORS
  fastify.register(fastifyCors, {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001']
  });

   fastify.get<{ Reply: HealthResponse }>('/health', async (request, reply) => {
    return { status: 'ok' };
  });


  fastify.get<{
    Querystring: VenueFilterRequest;
    Reply: VenueFilterResponse;
  }>('/venues/filter', async (request, reply) => {
    const { lat, lng, radius } = request.query;

    // Convert query params to numbers
    const latNum = Number(lat);
    const lngNum = Number(lng);
    const radiusNum = Number(radius);

    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum) || !Number.isFinite(radiusNum)) {
      reply.status(400);
      return {
        status: 'error',
        venues: [],
        venues_n: 0,
        window: createDefaultWindow(),
      };
    }

    // Check cache for nearby results
    // If the incoming request's location is within a cached request's radius,
    // we can reuse the cached data since it would return similar venues
    const allKeys = cache.keys();
    for (const key of allKeys) {
      const cachedEntry = cache.get<{ lat: number; lng: number; radius: number; data: VenueFilterResponse }>(key);
      
      if (cachedEntry && isNearby(latNum, lngNum, cachedEntry.lat, cachedEntry.lng, cachedEntry.radius)) {
        console.log(`Cache hit for lat: ${lat}, lng: ${lng}, radius: ${radius} (within cached radius of ${cachedEntry.radius}m from cached location)`);
        return cachedEntry.data;
      }
    }

    console.log(`Cache miss for lat: ${lat}, lng: ${lng}, radius: ${radius}`);

    try {
      console.log(`Calling BestTime API for venues at lat: ${lat}, lng: ${lng}, radius: ${radius}`);

      const { venues, window, status } = await getVenuesForLocation(latNum, lngNum, radiusNum);

      const response: VenueFilterResponse = {
        status: status ?? 'ok',
        venues,
        venues_n: venues.length,
        window: window ?? createDefaultWindow(),
      };

      // Store in cache
      const cacheKey = `${lat}_${lng}_${radius}`;
      cache.set(cacheKey, {
        lat: latNum,
        lng: lngNum,
        radius: radiusNum,
        data: response
      });
      console.log(`Cached result for key: ${cacheKey}`);

      if (Array.isArray(response.venues)) {
        for (const venue of response.venues) {
          cache.set(`venue:${venue.venue_id}`, venue);
        }
      }

      return response;

    } catch (error) {
      console.error('Error calling BestTime API:', error);
      reply.status(500);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch venues');
    }
  });

  fastify.post<{
    Querystring: VenueLiveRequest;
    Reply: VenueLiveResponse;
  }>('/venues/live-forecast', async (request, reply) => {
    const { venue_name, venue_address } = request.query;

    if (!venue_name?.trim() || !venue_address?.trim()) {
      reply.status(400);
      return {
        status: 'Error',
        message: 'venue_name and venue_address are required'
      };
    }

    try {
      const apiKey = process.env.BEST_TIME_APP_API_KEY;
      if (!apiKey) {
        throw new Error('BEST_TIME_APP_API_KEY environment variable is not set');
      }
      
      // Build URLSearchParams for the BestTime API
      const params = new URLSearchParams({
        api_key_private: apiKey,
        venue_name,
        venue_address
      });

      const response = await fetch(`https://besttime.app/api/v1/forecasts/live?${params}`, {
        method: 'POST'
      });

      const payload = (await response.json()) as VenueLiveResponse;

      if (!response.ok) {
        reply.status(response.status);
        return payload;
      }

      return payload;
    } catch (error) {
      fastify.log.error('Error fetching live forecast');
      reply.status(500);
      return {
        status: 'Error',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to fetch live data for this venue.'
      };
    }
  });

  fastify.get<{
    Params: { venueId: string };
    Reply:
      | { status: 'ok'; venue: Venue }
      | { status: 'not_found' | 'error'; message: string };
  }>('/venues/:venueId', async (request, reply) => {
    const { venueId } = request.params;

    if (!venueId) {
      reply.status(400);
      return {
        status: 'error',
        message: 'venueId is required'
      };
    }

    const cachedVenue = cache.get<Venue>(`venue:${venueId}`);
    if (cachedVenue) {
      return {
        status: 'ok',
        venue: cachedVenue
      };
    }

    reply.status(404);
    return {
      status: 'not_found',
      message: 'We could not find this venue in the current cache window.'
    };
  });
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: { ...opts },
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: { ...opts },
  });
}
