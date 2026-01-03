import { VenueLiveRequest, VenueLiveResponse } from '@nearbrew/shared-types';
import { config } from '../config';

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export const searchService = {
  async fetchLiveForecast(params: VenueLiveRequest): Promise<VenueLiveResponse> {
    // Build query parameters
    const searchParams = new URLSearchParams();
    if (params.venue_name) {
      searchParams.append('venue_name', params.venue_name);
    }
    if (params.venue_address) {
      searchParams.append('venue_address', params.venue_address);
    }

    console.log('calling /venues/live-forecast')

    const response = await fetch(`${config.apiBaseUrl}/venues/live-forecast?${searchParams}`, {
      method: 'POST',
    });

    const data = (await response.json()) as VenueLiveResponse;

    if (response.status === 429) {
      throw new RateLimitError(
        data?.message ?? 'Too many live searches right now. Please try again in about an hour.'
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.message ?? 'Unable to complete the search right now.'
      );
    }

    return data;
  },
};
