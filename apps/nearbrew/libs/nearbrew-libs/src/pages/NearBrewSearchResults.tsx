import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type {
  VenueLiveForecastAnalysis,
  VenueLiveForecastVenueInfo,
  VenueLiveResponse,
} from '@nearbrew/shared-types';
import {
  FiActivity,
  FiArrowLeft,
  FiClock,
  FiMapPin,
  FiStar,
  FiTrendingUp,
} from 'react-icons/fi';
import { StickyBanner } from '../lib/StickyBanner';
import { NearBrewButton } from '../lib/NearBrewButton';

interface SearchLocationState {
  searchResult?: VenueLiveResponse;
  metadata?: {
    venueName?: string;
    venueAddress?: string;
  };
}

const SadCoffeeIcon = () => (
  <svg
    width="160"
    height="140"
    viewBox="0 0 200 180"
    role="img"
    aria-label="Sad coffee cup"
  >
    <defs>
      <linearGradient id="cupGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fff5ec" />
        <stop offset="100%" stopColor="#f2d8bf" />
      </linearGradient>
      <linearGradient id="coffeeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#5f371f" />
        <stop offset="100%" stopColor="#7c4a2c" />
      </linearGradient>
    </defs>
    <rect
      x="25"
      y="110"
      width="150"
      height="25"
      rx="12"
      fill="#ead7c8"
      opacity="0.7"
    />
    <ellipse cx="100" cy="70" rx="70" ry="28" fill="url(#cupGradient)" />
    <path
      d="M30 70 Q30 130 100 130 Q170 130 170 70"
      fill="url(#cupGradient)"
      stroke="#d8b898"
      strokeWidth="4"
    />
    <ellipse cx="100" cy="70" rx="62" ry="22" fill="url(#coffeeGradient)" />
    <path
      d="M160 80 Q190 90 180 110 Q170 130 145 115"
      fill="none"
      stroke="#d8b898"
      strokeWidth="8"
      strokeLinecap="round"
    />
    <circle cx="80" cy="85" r="6" fill="#2f1c10" />
    <circle cx="120" cy="85" r="6" fill="#2f1c10" />
    <path
      d="M90 105 Q100 115 110 105"
      fill="none"
      stroke="#794326"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <rect
      x="135"
      y="25"
      width="35"
      height="35"
      rx="8"
      fill="#fbeddb"
      stroke="#e2c8b1"
      strokeWidth="3"
    />
    <text
      x="152"
      y="48"
      textAnchor="middle"
      fill="#b27546"
      fontSize="18"
      fontWeight="700"
    >
      ?
    </text>
  </svg>
);

const BUSY_DESCRIPTIONS = [
  {
    max: 33,
    label: 'Not Busy',
    description: 'Plenty of seats and friendly baristas await.',
    accent: '#22c55e',
  },
  {
    max: 66,
    label: 'A Little Busy',
    description: 'Expect a gentle buzz and a short wait.',
    accent: '#f97316',
  },
  {
    max: 101,
    label: 'Poppin!',
    description: 'It is lively—grab your latte and soak it in.',
    accent: '#ef4444',
  },
];

function getBusynessInfo(
  value?: number,
  isAvailable?: boolean
): { label: string; description: string; accent: string; valueLabel: string } {
  if (!isAvailable || typeof value !== 'number') {
    return {
      label: 'No live data',
      description: 'BestTime could not fetch live readings right now.',
      accent: '#94a3b8',
      valueLabel: '--',
    };
  }

  const bucket =
    BUSY_DESCRIPTIONS.find((item) => value <= item.max) ??
    BUSY_DESCRIPTIONS[BUSY_DESCRIPTIONS.length - 1];

  return {
    label: bucket.label,
    description: bucket.description,
    accent: bucket.accent,
    valueLabel: `${Math.round(value)}% busy`,
  };
}

function getForecastInfo(
  analysis?: VenueLiveForecastAnalysis
): { headline: string; detail: string } {
  if (
    !analysis?.venue_forecast_busyness_available ||
    typeof analysis.venue_forecasted_busyness !== 'number'
  ) {
    return {
      headline: 'Forecast unavailable',
      detail: 'BestTime did not provide a forecast window at this moment.',
    };
  }

  const delta = analysis.venue_live_forecasted_delta ?? 0;
  const direction = delta > 0 ? 'Busier' : delta < 0 ? 'Quieter' : 'Holding steady';
  const timeLabel = analysis.hour_start_12 && analysis.hour_end_12
    ? `${analysis.hour_start_12} – ${analysis.hour_end_12}`
    : 'the next hour';
  const detail =
    delta === 0
      ? `Expect around ${analysis.venue_forecasted_busyness}% for ${timeLabel}.`
      : `${direction} in ${Math.abs(delta)} mins around ${timeLabel}.`;

  return {
    headline: `${analysis.venue_forecasted_busyness}% soon`,
    detail,
  };
}

function formatHours(info?: VenueLiveForecastVenueInfo) {
  const hours = info?.venue_open_close_v2?.['12h'];
  if (hours && hours.length > 0) {
    return hours[0];
  }

  if (info?.venue_open) {
    return info.venue_open;
  }

  return 'Hours unavailable';
}

function formatDwellTime(info?: VenueLiveForecastVenueInfo) {
  if (
    typeof info?.venue_dwell_time_min === 'number' &&
    typeof info?.venue_dwell_time_max === 'number' &&
    info.venue_dwell_time_max > 0
  ) {
    const avg =
      typeof info.venue_dwell_time_avg === 'number'
        ? ` (Avg ${info.venue_dwell_time_avg} min)`
        : '';
    return `${info.venue_dwell_time_min}-${info.venue_dwell_time_max} min${avg}`;
  }

  return 'No dwell time available';
}

interface NoResultsCardProps {
  title: string;
  message: string;
  venueName?: string;
  venueAddress?: string;
  rating?: number;
  reviews?: number;
  statusLabel?: string;
  ctaLabel: string;
  onCta: () => void;
}

function NoResultsCard({
  title,
  message,
  venueName,
  venueAddress,
  rating,
  reviews,
  statusLabel,
  ctaLabel,
  onCta,
}: NoResultsCardProps) {
  return (
    <section className="bg-white rounded-[32px] shadow-2xl p-8 text-center space-y-8">
      <div className="flex justify-center">
        <SadCoffeeIcon />
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">{message}</p>
      </div>

      {(venueName || venueAddress) && (
        <div className="bg-stone-50 rounded-2xl shadow-inner p-6 flex flex-col sm:flex-row items-center gap-4 max-w-2xl mx-auto text-left">
          <div className="flex-shrink-0 bg-white rounded-full p-3 shadow">
            <span className="text-3xl">☕️</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{venueName}</h3>
            {venueAddress && (
              <p className="text-sm text-muted-foreground">{venueAddress}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
              {typeof rating === 'number' && (
                <span className="flex items-center gap-1 font-semibold text-[#c47a3d]">
                  <FiStar /> {rating.toFixed(1)}
                </span>
              )}
              {typeof reviews === 'number' && reviews > 0 && (
                <span>({reviews} reviews)</span>
              )}
              {statusLabel && <span className="font-medium">{statusLabel}</span>}
            </div>
          </div>
        </div>
      )}

      <NearBrewButton
        variant="primary"
        size="md"
        className="mx-auto w-full max-w-xs bg-[#2b1a10] text-white hover:bg-[#1f120b]"
        onClick={onCta}
      >
        {ctaLabel}
      </NearBrewButton>
    </section>
  );
}

function SuccessResultsCard({ result }: { result: VenueLiveResponse }) {
  const analysis = result.analysis!;
  const info = result.venue_info!;
  const busynessInfo = useMemo(
    () => getBusynessInfo(analysis.venue_live_busyness, analysis.venue_live_busyness_available),
    [analysis]
  );
  const forecastInfo = useMemo(() => getForecastInfo(analysis), [analysis]);
  const hoursLabel = useMemo(() => formatHours(info), [info]);
  const dwellTime = useMemo(() => formatDwellTime(info), [info]);

  return (
    <section className="bg-white rounded-[32px] shadow-2xl overflow-hidden">
      <div className="bg-[#d6b892] px-6 py-10 flex justify-center">
        <div className="bg-[#f6eadf] rounded-3xl p-6 w-40 h-40 flex items-center justify-center shadow-inner">
          <div className="bg-white rounded-2xl w-full h-full flex items-center justify-center border-4 border-white shadow-lg">
            <div className="bg-[#c47a3d]/15 rounded-xl w-24 h-24 flex items-center justify-center text-[#c47a3d] text-4xl">
              <FiMapPin />
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="text-center lg:text-left space-y-3">
          <span className="inline-flex items-center justify-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full bg-orange-50 text-orange-700">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: busynessInfo.accent }}
            />
            Live: {busynessInfo.label}
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold">{info.venue_name}</h1>
          <p className="text-muted-foreground flex items-center gap-2 justify-center lg:justify-start">
            <FiMapPin className="text-orange-500" />
            {info.venue_address}
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1 text-base text-[#c47a3d] font-semibold">
              <FiStar />
              {info.rating ? info.rating.toFixed(1) : 'N/A'}
            </div>
            {info.reviews ? <span>({info.reviews} reviews)</span> : null}
            {info.venue_open && (
              <span className="inline-flex items-center gap-2 text-green-600 font-medium">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {info.venue_open}
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-orange-100 bg-orange-50/80 p-5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-orange-600">
              <FiActivity />
              Live Business
            </div>
            <p className="text-2xl font-semibold text-orange-700">
              {busynessInfo.valueLabel}
            </p>
            <p className="text-sm text-orange-700/80">{busynessInfo.description}</p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-600">
              <FiClock />
              Today
            </div>
            <p className="text-xl font-semibold text-stone-800">{hoursLabel}</p>
            <p className="text-sm text-stone-500">Dwell: {dwellTime}</p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <FiTrendingUp />
              Forecast
            </div>
            <p className="text-2xl font-semibold text-emerald-800">
              {forecastInfo.headline}
            </p>
            <p className="text-sm text-emerald-700/80">{forecastInfo.detail}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function NearBrewSearchResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as SearchLocationState;
  const searchResult = state.searchResult;
  const fallbackName = state.metadata?.venueName;
  const fallbackAddress = state.metadata?.venueAddress;

  const isSuccess =
    searchResult?.status === 'OK' &&
    Boolean(searchResult.analysis) &&
    Boolean(searchResult.venue_info);

  let content: JSX.Element;

  if (!searchResult) {
    content = (
      <NoResultsCard
        title="Ready to Brew?"
        message="Search for a coffee shop to view live busyness insights."
        venueName={fallbackName}
        venueAddress={fallbackAddress}
        ctaLabel="Start a Search"
        onCta={() => navigate('/')}
      />
    );
  } else if (isSuccess) {
    content = <SuccessResultsCard result={searchResult} />;
  } else {
    const displayName =
      searchResult.venue_info?.venue_name ??
      fallbackName ??
      'this coffee shop';
    const displayAddress =
      searchResult.venue_info?.venue_address ?? fallbackAddress ?? '';

    content = (
      <NoResultsCard
        title="Oh No! No Matches Found"
        message={
          searchResult.message ??
          `We couldn't find live data for "${displayName}" right now.`
        }
        venueName={displayName}
        venueAddress={displayAddress}
        rating={searchResult.venue_info?.rating}
        reviews={searchResult.venue_info?.reviews}
        statusLabel="Status: No live data available"
        ctaLabel="Search Again"
        onCta={() => navigate('/')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f1e8] text-foreground">
      <StickyBanner />

      <div
        className="px-4 pb-16 pt-6 sm:px-6 sm:pt-10"
        style={{ marginTop: '72px' }}
      >
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
          <div className="flex items-center gap-3">
            <NearBrewButton
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2"
            >
              <FiArrowLeft />
              Back
            </NearBrewButton>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Return to the search
            </span>
          </div>

          {content}
        </div>
      </div>
    </div>
  );
}

export default NearBrewSearchResults;
