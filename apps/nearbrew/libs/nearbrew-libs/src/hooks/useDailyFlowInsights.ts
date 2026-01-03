import { useMemo } from 'react';
import { HOURS_IN_DAY, formatHourRange } from '../utils/time';

const WINDOW_SIZE = 2;

interface WindowScore {
  hour: number;
  score: number;
}

const buildWindowScores = (values: number[]): WindowScore[] =>
  Array.from({ length: HOURS_IN_DAY }, (_, hour) => {
    const current = values[hour] ?? 0;
    const next = values[(hour + 1) % HOURS_IN_DAY] ?? current;
    return {
      hour,
      score: (current + next) / WINDOW_SIZE,
    };
  });

const isHourTooClose = (chosen: number[], candidate: number) =>
  chosen.some((hour) => {
    const distance = Math.abs(hour - candidate);
    return (
      distance < WINDOW_SIZE ||
      HOURS_IN_DAY - distance < WINDOW_SIZE // account for wrap-around
    );
  });

const buildRanges = (
  scores: WindowScore[],
  limit: number,
  sortDirection: 'asc' | 'desc'
) => {
  const sorted = [...scores].sort((a, b) =>
    sortDirection === 'desc' ? b.score - a.score : a.score - b.score
  );

  const selected: number[] = [];

  for (const { hour } of sorted) {
    if (selected.length >= limit) break;
    if (isHourTooClose(selected, hour)) continue;
    selected.push(hour);
  }

  return selected.map((hour) => formatHourRange(hour, WINDOW_SIZE));
};

export interface DailyFlowInsights {
  peakWindows: string[];
  quietWindows: string[];
  hasData: boolean;
}

export function useDailyFlowInsights(
  dayRawWhole?: number[] | null,
  limit = 2
): DailyFlowInsights {
  return useMemo(() => {
    if (!Array.isArray(dayRawWhole) || dayRawWhole.length === 0) {
      return {
        peakWindows: [],
        quietWindows: [],
        hasData: false,
      };
    }

    const sample = dayRawWhole
      .slice(0, HOURS_IN_DAY)
      .filter((v) => v !== 0);
    const scores = buildWindowScores(sample);

    return {
      peakWindows: buildRanges(scores, limit, 'desc'),
      quietWindows: buildRanges(scores, limit, 'asc'),
      hasData: true,
    };
  }, [dayRawWhole, limit]);
}
