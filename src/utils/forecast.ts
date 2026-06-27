import type { DailyForecast } from '@/types/forecast';
import type { ForecastPoint, WeatherSnapshot } from '@/types/weather';
import { calculateLandingProbability } from './landingProbability';

function toSnapshot(p: ForecastPoint): WeatherSnapshot {
  return {
    temperature: p.temperature,
    windSpeed: p.windSpeed,
    windFromDirection: p.windFromDirection,
    windGust: p.windGust,
    fogAreaFraction: p.fogAreaFraction,
    cloudAreaFraction: p.cloudAreaFraction,
    probabilityOfThunder: p.probabilityOfThunder,
    waveHeight: p.waveHeight,
    waveDataUnavailable: p.waveHeight === undefined,
    forecastTime: p.time,
    updatedAt: p.time,
  };
}

function localDateKey(isoString: string): string {
  const d = new Date(isoString);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

function dayLabel(dateStr: string): string {
  const now = new Date();
  const todayKey = localDateKey(now.toISOString());
  const tomorrowKey = localDateKey(
    new Date(now.getTime() + 86_400_000).toISOString()
  );
  if (dateStr === todayKey) return 'I dag';
  if (dateStr === tomorrowKey) return 'I morgen';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('nb-NO', {
    weekday: 'long',
  });
}

export function getNext24Hours(points: ForecastPoint[]): ForecastPoint[] {
  return points.slice(0, 24);
}

export function groupByDay(points: ForecastPoint[]): DailyForecast[] {
  const map = new Map<string, ForecastPoint[]>();
  for (const p of points) {
    const key = localDateKey(p.time);
    const bucket = map.get(key);
    if (bucket) bucket.push(p);
    else map.set(key, [p]);
  }

  const todayKey = localDateKey(new Date().toISOString());
  const result: DailyForecast[] = [];

  for (const [date, pts] of map) {
    if (date < todayKey) continue;

    const temps = pts.map((p) => p.temperature);
    const winds = pts.map((p) => p.windSpeed);
    const gusts = pts
      .map((p) => p.windGust)
      .filter((g): g is number => g !== undefined);
    const waves = pts
      .map((p) => p.waveHeight)
      .filter((w): w is number => w !== undefined);
    const precip = pts.map((p) => p.precipitation ?? 0);

    const landingResults = pts.map((p) =>
      calculateLandingProbability(toSnapshot(p))
    );
    const avgProbability = Math.round(
      landingResults.reduce((s, r) => s + r.probability, 0) / landingResults.length
    );

    const levelOrder = { good: 0, caution: 1, poor: 2, 'no-go': 3 } as const;
    const worstLevel = landingResults.reduce<'good' | 'caution' | 'poor' | 'no-go'>(
      (worst, r) =>
        levelOrder[r.level] > levelOrder[worst] ? r.level : worst,
      'good'
    );

    const goodWindowHours = landingResults.filter(
      (r) => r.level === 'good' || r.level === 'caution'
    ).length;

    const midPoint = pts[Math.floor(pts.length / 2)];

    result.push({
      date,
      dayLabel: dayLabel(date),
      tempMin: Math.round(Math.min(...temps)),
      tempMax: Math.round(Math.max(...temps)),
      windSpeedMax: Math.round(Math.max(...winds)),
      windGustMax: gusts.length > 0 ? Math.round(Math.max(...gusts)) : undefined,
      waveHeightMax: waves.length > 0 ? Math.max(...waves) : undefined,
      precipitationTotal: Math.round(precip.reduce((a, b) => a + b, 0) * 10) / 10,
      dominantSymbolCode: midPoint?.symbolCode,
      landingProbabilityAvg: avgProbability,
      landingLevel: worstLevel,
      goodWindowHours,
      points: pts,
    });

    if (result.length >= 7) break;
  }

  return result;
}
