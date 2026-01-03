import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Venue } from '@nearbrew/shared-types';
import { StickyBanner } from '../lib/StickyBanner';
import { NearBrewButton } from '../lib/NearBrewButton';
import {
  useDailyFlowInsights,
  useMeetupPlanner,
  useNextBusyTime,
  useShareInvite,
  useVenueBusyness,
} from '../hooks';
import { VenueLocationMap } from '../lib/VenueLocationMap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  type TooltipItem,
  type ScriptableContext,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  FiArrowLeft,
  FiMapPin,
  FiClock,
  FiTrendingUp,
  FiActivity,
  FiShare2,
  FiStar,
  FiCalendar,
} from 'react-icons/fi';
import { to12HourLabel } from '../utils/time';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

export interface NearBrewDetailsProps {
  venue: Venue;
  busynessNum?: number;
}

const COFFEE_COLOR = '#c47a3d';
const COFFEE_COLOR_FILL = 'rgba(196, 122, 61, 0.15)';

export function NearBrewDetails({ venue, busynessNum }: NearBrewDetailsProps) {
  const navigate = useNavigate();

  const busyness = useVenueBusyness(busynessNum ?? venue.day_raw[0]);
  const { peakWindows, quietWindows } = useDailyFlowInsights(
    venue.day_raw_whole
  );
  const nextBusyTime = useNextBusyTime(venue.day_raw_whole);
  const meetupPlan = useMeetupPlanner(venue);
  const { shareInvite, status: shareStatus } = useShareInvite();

  const priceLabel =
    typeof venue.price_level === 'number' && venue.price_level >= 0
      ? '$'.repeat(venue.price_level + 1)
      : 'N/A';

  const todaysHours =
    venue.day_info?.venue_open_close_v2?.['12h']?.[0] ?? 'Hours unavailable';
  const dwellTimeLabel =
    typeof venue.venue_dwell_time_min === 'number' &&
    typeof venue.venue_dwell_time_max === 'number'
      ? `${venue.venue_dwell_time_min}-${venue.venue_dwell_time_max} mins`
      : 'No dwell time available';
  const crowdRank = Number.isFinite(venue.day_info?.day_rank_mean)
    ? Math.round(venue.day_info?.day_rank_mean ?? 0)
    : '--';

  const crowdTrendData = useMemo<ChartData<'line'>>(() => {
    const rawValues =
      venue.day_raw_whole && venue.day_raw_whole.length > 0
        ? venue.day_raw_whole
        : Array.from({ length: 24 }, () => 0);

    // keep hour indexes so we can produce correct labels after filtering zeros
    const indexed = rawValues.map((v, i) => ({ value: v, hour: i }));
    const filtered = indexed.filter((item) => item.value !== 0);

    // If filtering removes all points, fall back to the original series to avoid an empty chart
    const finalSeries = filtered.length > 0 ? filtered : indexed;

    const labels = finalSeries.map((p) => to12HourLabel(p.hour));
    const data = finalSeries.map((p) => p.value);

    return {
      labels,
      datasets: [
        {
          label: 'Crowd Level',
          data,
          borderColor: COFFEE_COLOR,
          backgroundColor: COFFEE_COLOR_FILL,
          pointRadius: 0,
          fill: true,
          tension: 0.35,
          borderWidth: 3,
        },
      ],
    };
  }, [venue.day_raw_whole]);

  const crowdTrendOptions = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index' as const,
      },
      animation: {
        duration: 1400,
        easing: 'easeInCubic',
        delay: (context: ScriptableContext<'line'>) =>
          context.type === 'data' && typeof context.dataIndex === 'number'
            ? context.dataIndex * 40
            : 0,
      },
      animations: {
        y: {
          from: 0,
          easing: 'easeInCubic',
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<'line'>) => {
              const value =
                typeof context.raw === 'number'
                  ? context.raw
                  : Number(context.raw ?? 0);
              return `${Math.round(value)}% busy`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { maxRotation: 0 },
        },
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (value: string | number) => `${value}%`,
            stepSize: 25,
          },
          grid: { color: 'rgba(148, 163, 184, 0.2)' },
        },
      },
    }),
    []
  );

  const handleNavigateHome = () => navigate('/');
  const handleShareMeetup = async () => {
    await shareInvite(meetupPlan.shareData, meetupPlan.shareClipboardText);
  };

  const busySweep = (busyness.percentage / 100) * 360;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StickyBanner />

      <div
        className="px-4 pb-16 pt-6 sm:px-6 sm:pt-10"
        style={{
          marginTop: '72px',
        }}
      >
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
          <div className="flex items-center gap-3">
            <NearBrewButton
              variant="outline"
              size="sm"
              onClick={handleNavigateHome}
              className="inline-flex items-center gap-2"
            >
              <FiArrowLeft />
              Back
            </NearBrewButton>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Return to home
            </span>
          </div>

          <section className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 space-y-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3 text-center lg:text-left">
                <span className="inline-flex items-center justify-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-orange-50 text-orange-600">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: busyness.accentColor }}
                  />
                  Live: {busyness.label}
                </span>
                <h1 className="text-3xl sm:text-4xl font-semibold">
                  {venue.venue_name}
                </h1>
                <p className="text-muted-foreground flex items-center justify-center lg:justify-start gap-2 text-base">
                  <FiMapPin className="text-orange-500" />
                  {venue.venue_address}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground justify-center lg:justify-start">
                  <span className="flex items-center gap-2">
                    <FiActivity className="text-amber-500" />
                    {venue.venue_type}
                  </span>
                  <span className="flex items-center gap-2">
                    <FiStar className="text-amber-400" />
                    {venue.rating?.toFixed(1) ?? 'N/A'} ({venue.reviews}{' '}
                    reviews)
                  </span>
                  <span>Price: {priceLabel}</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-6 md:flex-row md:gap-8 lg:items-center lg:justify-end">
                <div className="relative h-32 w-32 sm:h-36 sm:w-36">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(${busyness.accentColor} ${busySweep}deg, rgba(226, 232, 240, 1) ${busySweep}deg 360deg)`,
                    }}
                  />
                  <div className="absolute inset-3 rounded-full bg-white shadow-inner flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-semibold">
                      {busyness.percentage}%
                    </span>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      Busy now
                    </span>
                  </div>
                </div>
                <div className="max-w-xs text-sm text-muted-foreground text-center md:text-left">
                  <p className="font-semibold text-foreground mb-1">
                    {busyness.label}
                  </p>
                  <p>{busyness.description}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-5 sm:p-6 space-y-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2 text-center lg:text-left">
                  <p className="text-sm font-semibold text-emerald-700 flex items-center justify-center lg:justify-start gap-2">
                    <FiCalendar />
                    Meet at the Best Time
                  </p>
                  <p className="text-2xl font-semibold text-emerald-900">
                    {meetupPlan.quietWindowDescription}
                  </p>
                  <p className="text-sm text-emerald-900/80">
                    {meetupPlan.inviteSupportingCopy}
                  </p>
                  <p className="text-xs text-emerald-900/70">
                    {meetupPlan.nextBusyCopy}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center lg:items-center">
                  <NearBrewButton
                    onClick={handleShareMeetup}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <FiShare2 />
                    Plan a Coffee Meet
                  </NearBrewButton>
                  <span className="text-xs text-muted-foreground">
                    Current busyness: {meetupPlan.busynessPercentage}%
                  </span>
                </div>
              </div>
              {shareStatus === 'copied' && (
                <p className="text-xs font-medium text-emerald-700 text-center lg:text-left">
                  Invite copied! Paste it anywhere to spread the word.
                </p>
              )}
              {shareStatus === 'error' && (
                <p className="text-xs font-medium text-red-600 text-center lg:text-left">
                  Could not open the share sheet - please try again.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-orange-700">
                  <FiClock />
                  {venue.day_info?.day_text ?? 'Today'}
                </p>
                <p className="text-foreground text-lg mt-2">{todaysHours}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  People usually spend around {dwellTimeLabel} here
                </p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-amber-700">
                  <FiTrendingUp />
                  Next busy wave
                </p>
                {nextBusyTime.label ? (
                  <>
                    <p className="text-lg font-semibold text-foreground mt-2">
                      {nextBusyTime.label}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Projected to reach ~{nextBusyTime.percentage}% capacity.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    Looks relaxed for the rest of today.
                  </p>
                )}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-muted-foreground mb-1">
                  Crowd insights
                </p>
                <p className="flex items-center gap-2 text-lg text-foreground">
                  <FiTrendingUp className="text-emerald-500" />
                  {crowdRank} avg
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on similar days
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <p className="text-lg font-semibold text-center sm:text-left">
                  Venue Snapshot
                </p>
                <VenueLocationMap
                  lat={venue.venue_lat}
                  lng={venue.venue_lng}
                  name={venue.venue_name}
                  className="h-56 sm:h-64 md:h-72"
                />
                <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center sm:justify-start">
                  <FiMapPin className="text-orange-500" />
                  {venue.venue_address}
                </p>
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                  {venue.day_info?.note ??
                    'Cozy atmosphere and reliable Wi-Fi make it perfect for remote work or study sessions.'}
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-lg font-semibold flex items-center gap-2">
                  <FiTrendingUp />
                  Today&apos;s Crowd Trend
                </p>
                <div className="h-52 sm:h-60">
                  <Line data={crowdTrendData} options={crowdTrendOptions} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-700">
                      Quiet Hours
                    </p>
                    <p className="text-lg text-emerald-900 mt-1">
                      {quietWindows.length > 0
                        ? quietWindows.join(', ')
                        : 'No data'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-700">
                      Peak Hours
                    </p>
                    <p className="text-lg text-amber-900 mt-1">
                      {peakWindows.length > 0
                        ? peakWindows.join(', ')
                        : 'No data'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default NearBrewDetails;
