import { useMemo } from 'react';
import { HOURS_IN_DAY, to12HourLabel } from '../utils/time';

export interface NextBusyTimeInfo {
  hour: number | null;
  label: string | null;
  percentage: number | null;
}

export function useNextBusyTime(
  dayRawWhole?: number[] | null,
  threshold = 65
): NextBusyTimeInfo {
  return useMemo(() => {
    if (!Array.isArray(dayRawWhole) || dayRawWhole.length === 0) {
      return { hour: null, label: null, percentage: null };
    }

    const sample = dayRawWhole.slice(0, HOURS_IN_DAY);
    const now = new Date();
    const currentHour = now.getHours();

    for (let hour = currentHour + 1; hour < HOURS_IN_DAY; hour += 1) {
      const value = sample[hour];
      if (typeof value === 'number' && value >= threshold) {
        return {
          hour,
          label: to12HourLabel(hour),
          percentage: Math.round(value),
        };
      }
    }

    return { hour: null, label: null, percentage: null };
  }, [dayRawWhole, threshold]);
}

