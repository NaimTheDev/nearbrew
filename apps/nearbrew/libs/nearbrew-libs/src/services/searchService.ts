import { VenueLiveRequest, VenueLiveResponse } from '@nearbrew/shared-types';

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

    const response = await fetch(`/api/venues/live-forecast?${searchParams}`, {
      method: 'POST',
    });

    const data = (await response.json()) as VenueLiveResponse;

    if (!response.ok) {
      throw new Error(
        data?.message ?? 'Unable to complete the search right now.'
      );
    }

    return data;
  },
};
