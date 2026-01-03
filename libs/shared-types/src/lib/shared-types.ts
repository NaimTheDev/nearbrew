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
  venue_live_busyness?: number;           // The real-time percentage
  venue_live_busyness_available?: boolean; // Whether live data exists right now
  venue_forecasted_busyness?: number;      // The "usual" busyness for this hour
  venue_live_forecasted_delta?: number;    
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

export interface VenueLiveForecastAnalysis {
  venue_forecasted_busyness?: number;
  venue_forecast_busyness_available?: boolean;
  venue_live_busyness?: number;
  venue_live_busyness_available?: boolean;
  venue_live_forecasted_delta?: number;
  hour_start?: number;
  hour_start_12?: string;
  hour_end?: number;
  hour_end_12?: string;
}

export interface VenueLiveForecastVenueInfo {
  venue_current_gmttime?: string;
  venue_current_localtime?: string;
  venue_id: string;
  venue_name: string;
  venue_address: string;
  venue_address_list?: string[];
  venue_timezone?: string;
  venue_open?: string;
  venue_dwell_time_min: number;
  venue_dwell_time_max: number;
  venue_dwell_time_avg?: number;
  venue_lat: number;
  venue_lon: number;
  rating?: number;
  reviews?: number;
  price_level?: number;
  venue_open_close_v2?: VenueDayInfo['venue_open_close_v2'];
}

export interface VenueLiveRequest {
  venue_name?: string;
  venue_address?: string;
}

export interface VenueLiveResponse {
  status: 'OK' | 'Error';
  message?: string;
  analysis?: VenueLiveForecastAnalysis;
  venue_info?: VenueLiveForecastVenueInfo;
}

export interface VenueLiveResponseFallback {
    status: "OK" | "Error";
    analysis: {
        hour_analysis: {
            hour: number; // 0-23
         
            intensity_nr: -2 | -1 | 0 | 1 | 2 | 999; 
            intensity_txt: "Low" | "Below average" | "Average" | "Above average" | "High" | "Closed";
        };
        /** The forecasted busyness percentage (0-100) */
        hour_raw: number; 
    };
    epoch_analysis: number;
    forecast_updated_on: string;
    venue_info: {
        venue_id: string;
        venue_name: string;
        venue_current_localtime_iso: string;
        venue_current_gmttime: string;
    };
}

export function sharedTypes(): string {
  return 'shared-types';
}
