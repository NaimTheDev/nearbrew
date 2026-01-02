import { useMemo } from 'react';
import { Venue } from '@nearbrew/shared-types';
import { useDailyFlowInsights } from './useDailyFlowInsights';
import { useNextBusyTime } from './useNextBusyTime';

const DEFAULT_SHARE_BASE_URL = 'https://naimthedev.github.io/nearbrew';

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(Math.max(value, min), max);

const toFriendlyWindow = (windowLabel: string | null | undefined) => {
  if (!windowLabel) {
    return null;
  }

  const [startRaw = '', endRaw = ''] = windowLabel.split('-');
  const formatPiece = (value: string) => {
    if (!value) return '';
    const suffix = value.slice(-2).toUpperCase();
    const hour = value.slice(0, -2).trim();
    return `${hour} ${suffix}`.trim();
  };

  return `${formatPiece(startRaw)} - ${formatPiece(endRaw)}`.trim();
};

const buildShareUrl = (venueId: string) => {
  const base =
     DEFAULT_SHARE_BASE_URL;
  const encodedId = encodeURIComponent(venueId);
  return `${base}/details?venueId=${encodedId}`;
};

export interface MeetupPlannerResult {
  quietWindowRaw: string | null;
  quietWindowLabel: string | null;
  quietWindowDescription: string;
  nextBusyCopy: string;
  shareData: ShareData;
  shareClipboardText: string;
  inviteSupportingCopy: string;
  busynessPercentage: number;
}

export function useMeetupPlanner(venue: Venue): MeetupPlannerResult {
  const { quietWindows } = useDailyFlowInsights(venue.day_raw_whole);
  const nextBusyTime = useNextBusyTime(venue.day_raw_whole);
  console.log(venue.day_raw_whole);

  return useMemo(() => {
    const quietWindowRaw = quietWindows[0] ?? null;
    const quietWindowLabel = toFriendlyWindow(quietWindowRaw);
    const busynessRaw = Array.isArray(venue.day_raw)
      ? venue.day_raw[0]
      : null;
    const busynessPercentage = clamp(
      typeof busynessRaw === 'number' ? Math.round(busynessRaw) : 0
    );
    const shareUrl = buildShareUrl(venue.venue_id);

    const quietWindowDescription = quietWindowLabel
      ? quietWindowLabel
      : "We are still crunching today's quiet window.";

    const inviteSupportingCopy = quietWindowLabel
      ? "Suggested using Nearbrew's live calmest window."
      : 'Check back shortly for a precise quiet window.';

    const nextBusyCopy = nextBusyTime.label
      ? `Next rush expected around ${nextBusyTime.label}${
          typeof nextBusyTime.percentage === 'number'
            ? ` (~${Math.round(nextBusyTime.percentage)}% busy)`
            : ''
        }.`
      : 'Looks relaxed for the rest of today.';

    const shareText = quietWindowLabel
      ? `${venue.venue_name} is only ${busynessPercentage}% busy now - quiet window ${quietWindowLabel}. Join me for coffee? (via Nearbrew)`
      : `${venue.venue_name} is around ${busynessPercentage}% busy on Nearbrew right now. Coffee soon?`;

    const shareData: ShareData = {
      title: `Coffee at ${venue.venue_name}`,
      text: shareText,
      url: shareUrl,
    };

    const shareClipboardText = `${shareText} ${shareUrl}`.trim();

    return {
      quietWindowRaw,
      quietWindowLabel,
      quietWindowDescription,
      nextBusyCopy,
      shareData,
      shareClipboardText,
      inviteSupportingCopy,
      busynessPercentage,
    };
  }, [nextBusyTime.label, nextBusyTime.percentage, quietWindows, venue]);
}
