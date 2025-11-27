import * as path from 'path';
import { FastifyInstance } from 'fastify';
import AutoLoad from '@fastify/autoload';
import fastifyCors from '@fastify/cors';
import NodeCache from 'node-cache';
import {
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
      // Build BestTime API URL
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
      bestTimeUrl.searchParams.append('lat', lat!.toString());
      bestTimeUrl.searchParams.append('lng', lng!.toString());
      bestTimeUrl.searchParams.append('radius', radius!.toString());
      bestTimeUrl.searchParams.append('order_by', 'day_rank_max,reviews');
      bestTimeUrl.searchParams.append('order', 'asc,desc');
      bestTimeUrl.searchParams.append('foot_traffic', 'both');
      bestTimeUrl.searchParams.append('limit', '20');
      bestTimeUrl.searchParams.append('page', '0');

      console.log(`Calling BestTime API for venues at lat: ${lat}, lng: ${lng}, radius: ${radius}`);
      
      const response = await fetch(bestTimeUrl.toString());
      
      if (!response.ok) {
        throw new Error(`BestTime API returned ${response.status}: ${response.statusText}`);
      }

      const bestTimeData = await response.json() as VenueFilterResponse;
      
      // Store in cache
      const cacheKey = `${lat}_${lng}_${radius}`;
      cache.set(cacheKey, {
        lat: latNum,
        lng: lngNum,
        radius: radiusNum,
        data: bestTimeData
      });
      console.log(`Cached result for key: ${cacheKey}`);
      
      // Return the BestTime API response directly as it should match our VenueFilterResponse type
      return bestTimeData;
      
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
