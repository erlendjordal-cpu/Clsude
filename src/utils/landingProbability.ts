import type { WeatherSnapshot } from '@/types/weather';

const KT_PER_MS = 1.94384;

export type LandingLevel = 'good' | 'caution' | 'poor' | 'no-go';

export interface LandingFactor {
  score: number;
  excluded: boolean;
  note?: string;
}

export interface LandingProbabilityResult {
  probability: number;
  level: LandingLevel;
  factors: {
    wind: LandingFactor;
    visibility: LandingFactor;
    cloud: LandingFactor;
    waves: LandingFactor;
    thunder: LandingFactor;
  };
}

const WEIGHTS = {
  wind: 0.3,
  visibility: 0.2,
  cloud: 0.1,
  waves: 0.2,
  thunder: 0.2,
} as const;

function linearFalloff(value: number, goodAt: number, zeroAt: number): number {
  if (value <= goodAt) return 100;
  if (value >= zeroAt) return 0;
  return 100 * (1 - (value - goodAt) / (zeroAt - goodAt));
}

function scoreWind(windSpeed: number, windGust?: number): LandingFactor {
  const worstMs = Math.max(windSpeed, windGust ?? 0);
  const knots = worstMs * KT_PER_MS;
  return { score: linearFalloff(knots, 25, 60), excluded: false };
}

function scoreVisibility(fogAreaFraction?: number): LandingFactor {
  if (fogAreaFraction === undefined) {
    return { score: 100, excluded: true, note: 'Sikt: ikke tilgjengelig' };
  }
  return { score: linearFalloff(fogAreaFraction, 20, 85), excluded: false };
}

function scoreCloud(cloudAreaFraction?: number): LandingFactor {
  if (cloudAreaFraction === undefined) {
    return { score: 100, excluded: true, note: 'Skydekke: ikke tilgjengelig' };
  }
  return { score: 100 - 0.3 * cloudAreaFraction, excluded: false };
}

function scoreWaves(
  waveHeight?: number,
  waveDataUnavailable?: boolean
): LandingFactor {
  if (waveHeight === undefined) {
    return {
      score: 100,
      excluded: true,
      note: waveDataUnavailable
        ? 'Bølgehøyde: ikke tilgjengelig for denne posisjonen'
        : 'Bølgehøyde: ikke tilgjengelig',
    };
  }
  return { score: linearFalloff(waveHeight, 3, 6), excluded: false };
}

function scoreThunder(probabilityOfThunder?: number): LandingFactor {
  if (probabilityOfThunder === undefined) {
    return { score: 100, excluded: true, note: 'Lynrisiko: ikke tilgjengelig' };
  }
  if (probabilityOfThunder <= 10) return { score: 100, excluded: false };
  if (probabilityOfThunder >= 30) return { score: 0, excluded: false };
  const t = (probabilityOfThunder - 10) / (30 - 10);
  return { score: 100 * (1 - t * t), excluded: false };
}

export function calculateLandingProbability(
  snapshot: WeatherSnapshot
): LandingProbabilityResult {
  const factors = {
    wind: scoreWind(snapshot.windSpeed, snapshot.windGust),
    visibility: scoreVisibility(snapshot.fogAreaFraction),
    cloud: scoreCloud(snapshot.cloudAreaFraction),
    waves: scoreWaves(snapshot.waveHeight, snapshot.waveDataUnavailable),
    thunder: scoreThunder(snapshot.probabilityOfThunder),
  };

  const included = (Object.keys(factors) as (keyof typeof factors)[]).filter(
    (key) => !factors[key].excluded
  );
  const totalWeight = included.reduce((sum, key) => sum + WEIGHTS[key], 0);
  const weightedSum = included.reduce(
    (sum, key) => sum + factors[key].score * WEIGHTS[key],
    0
  );
  const probability =
    totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  if ((snapshot.probabilityOfThunder ?? 0) >= 30) {
    return { probability: Math.min(probability, 10), level: 'no-go', factors };
  }

  let level: LandingLevel;
  if (probability >= 75) level = 'good';
  else if (probability >= 50) level = 'caution';
  else if (probability >= 25) level = 'poor';
  else level = 'no-go';

  return { probability, level, factors };
}
