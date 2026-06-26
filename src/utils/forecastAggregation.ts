import type { ForecastPoint } from '@/types/weather';

import {
  calculateLandingProbability,
  levelFromProbability,
  type LandingLevel,
} from './landingProbability';

const WEEKDAY_LABELS = [
  'Søndag',
  'Mandag',
  'Tirsdag',
  'Onsdag',
  'Torsdag',
  'Fredag',
  'Lørdag',
];

const HOUR_MS = 60 * 60 * 1000;

export function getNext24Hours(
  points: ForecastPoint[],
  from: Date = new Date()
): ForecastPoint[] {
  const start = from.getTime() - HOUR_MS;
  const end = from.getTime() + 24 * HOUR_MS;
  return points.filter((point) => {
    const time = new Date(point.time).getTime();
    return time >= start && time <= end;
  });
}

export interface DaySummary {
  date: string;
  label: string;
  minTemp: number;
  maxTemp: number;
  maxWindSpeed: number;
  maxWindGust?: number;
  symbolCode?: string;
  landingProbability: number;
  landingLevel: LandingLevel;
}

export function groupByDay(points: ForecastPoint[], days = 7): DaySummary[] {
  const buckets = new Map<string, ForecastPoint[]>();

  for (const point of points) {
    const key = point.time.slice(0, 10);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(point);
    } else {
      buckets.set(key, [point]);
    }
  }

  return Array.from(buckets.entries())
    .slice(0, days)
    .map(([date, dayPoints]) => {
      const temps = dayPoints.map((point) => point.temperature);
      const windSpeeds = dayPoints.map((point) => point.windSpeed);
      const gusts = dayPoints
        .map((point) => point.windGust)
        .filter((gust): gust is number => gust !== undefined);
      const probabilities = dayPoints.map(
        (point) => calculateLandingProbability(point).probability
      );
      const landingProbability = Math.round(
        probabilities.reduce((sum, value) => sum + value, 0) /
          probabilities.length
      );
      const middayPoint =
        dayPoints.find((point) => new Date(point.time).getUTCHours() >= 12) ??
        dayPoints[0];

      return {
        date,
        label: WEEKDAY_LABELS[new Date(date).getUTCDay()],
        minTemp: Math.min(...temps),
        maxTemp: Math.max(...temps),
        maxWindSpeed: Math.max(...windSpeeds),
        maxWindGust: gusts.length > 0 ? Math.max(...gusts) : undefined,
        symbolCode: middayPoint.symbolCode,
        landingProbability,
        landingLevel: levelFromProbability(landingProbability),
      };
    });
}
