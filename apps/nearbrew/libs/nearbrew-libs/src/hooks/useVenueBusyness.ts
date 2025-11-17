import { useMemo } from 'react';

export enum BusyState {
  QUIET = 'QUIET',
  STEADY = 'STEADY',
  LIVELY = 'LIVELY',
  PACKED = 'PACKED',
}

interface BusyStateConfig {
  label: string;
  description: string;
  accentColor: string;
}

const BUSY_STATE_CONFIG: Record<BusyState, BusyStateConfig> = {
  [BusyState.QUIET]: {
    label: 'Quiet',
    description: 'Lots of open seats right now.',
    accentColor: '#22c55e',
  },
  [BusyState.STEADY]: {
    label: 'Average',
    description: 'A comfortable, steady flow.',
    accentColor: '#fb923c',
  },
  [BusyState.LIVELY]: {
    label: 'Busy',
    description: 'Expect a lively atmosphere.',
    accentColor: '#f97316',
  },
  [BusyState.PACKED]: {
    label: 'Packed',
    description: 'Very limited seating. Consider waiting.',
    accentColor: '#ef4444',
  },
};

export interface VenueBusyness {
  percentage: number;
  state: BusyState;
  label: string;
  description: string;
  accentColor: string;
}

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(Math.max(value, min), max);

export function useVenueBusyness(dayInt?: number | null): VenueBusyness {
  return useMemo(() => {
    const rawPercentage =
      typeof dayInt === 'number' && Number.isFinite(dayInt) ? dayInt : 0;

    const percentage = clamp(Math.round(rawPercentage));

    let state = BusyState.QUIET;

    if (percentage >= 85) {
      state = BusyState.PACKED;
    } else if (percentage >= 65) {
      state = BusyState.LIVELY;
    } else if (percentage >= 35) {
      state = BusyState.STEADY;
    }

    const config = BUSY_STATE_CONFIG[state];

    return {
      percentage,
      state,
      label: config.label,
      description: config.description,
      accentColor: config.accentColor,
    };
  }, [dayInt]);
}
