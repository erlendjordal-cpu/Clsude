import type { ForecastPoint } from './weather';

export interface DailyForecast {
  date: string;
  dayLabel: string;
  tempMin: number;
  tempMax: number;
  windSpeedMax: number;
  windGustMax?: number;
  waveHeightMax?: number;
  precipitationTotal: number;
  dominantSymbolCode?: string;
  landingProbabilityAvg: number;
  landingLevel: 'good' | 'caution' | 'poor' | 'no-go';
  goodWindowHours: number;
  points: ForecastPoint[];
}
