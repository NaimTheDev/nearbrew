// Venue Types
export type VenueType = 'COFFEE' | 'CAFE' | 'RESTAURANT' | 'BAR' | 'BAKERY';

export interface LiveData {
  busyness: number; // 0-100 percentage
  delta: number; // positive = busier, negative = quieter than usual
  status: string; // human readable status
}

// Opening hours interface
export interface VenueOpeningHours {
  opens: number;
  closes: number;
  opens_minutes?: number;
  closes_minutes?: number;
}

// Day info interface  
export interface VenueDayInfo {
  day_int: number;
  day_text: string;
  venue_open: number;
  venue_closed: number;
  day_rank_mean: number;
  day_rank_max: number;
  day_mean: number;
  day_max: number;
  venue_open_close_v2: {
    '24h': VenueOpeningHours[];
    '12h': string[];
    special_day?: string | null;
    open_24h?: boolean;
    crosses_midnight?: boolean;
    day_text?: string;
  };
  note?: string;
}

export interface Venue {
  venue_id: string;
  day_int: number;
  day_raw: number[];
  day_raw_whole: number[];
  day_info: VenueDayInfo;
  rating: number;
  reviews: number;
  price_level: number;
  venue_name: string;
  venue_address: string;
  venue_lat: number;
  venue_lng: number;
  venue_type: VenueType;
  venue_dwell_time_min: number;
  venue_dwell_time_max: number;
}

// API Response Types
export interface VenueFilterRequest {
  lat?: string;
  lng?: string;
  radius?: string;
}

// Window info interface
export interface VenueWindow {
  time_window_start: number;
  time_window_start_ix: number;
  time_window_start_12h: string;
  day_window_start_int: number;
  day_window_start_txt: string;
  day_window_end_int: number;
  day_window_end_txt: string;
  time_window_end: number;
  time_window_end_ix: number;
  time_window_end_12h: string;
  day_window: string;
  time_local: number;
  time_local_12: string;
  time_local_index: number;
}

export interface VenueFilterResponse {
  status: string;
  venues: Venue[];
  venues_n: number;
  window: VenueWindow;
}

export interface HealthResponse {
  status: 'ok' | 'error';
}

export function sharedTypes(): string {
  return 'shared-types';
}
