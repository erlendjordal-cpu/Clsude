import { ScrollView, Text, View } from 'react-native';

import type { ForecastPoint } from '@/types/weather';
import { calculateLandingProbability } from '@/utils/landingProbability';
import { formatUpdatedAt } from '@/utils/weatherDisplay';

interface HourlyForecastListProps {
  points: ForecastPoint[];
}

const levelColors: Record<string, string> = {
  good: 'text-offshore-accent',
  caution: 'text-offshore-accentAlt',
  poor: 'text-offshore-warning',
  'no-go': 'text-offshore-danger',
};

export function HourlyForecastList({ points }: HourlyForecastListProps) {
  if (points.length === 0) return null;

  return (
    <View className="mt-4 rounded-3xl border border-offshore-border bg-offshore-surface p-5">
      <Text className="text-xs font-semibold uppercase tracking-widest text-offshore-textMuted">
        Helikopterflyging neste 24 timer
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-4"
      >
        {points.map((point) => {
          const result = calculateLandingProbability(point);
          const colorClass = levelColors[result.level];
          return (
            <View
              key={point.time}
              className="mr-2 w-[72px] items-center rounded-2xl bg-offshore-surfaceAlt px-2 py-3"
            >
              <Text className="text-xs text-offshore-textMuted">
                {formatUpdatedAt(point.time)}
              </Text>
              <Text className="mt-2 text-base font-semibold text-offshore-text">
                {Math.round(point.temperature)}°
              </Text>
              <Text className="mt-1 text-[11px] text-offshore-textMuted">
                {point.windSpeed.toFixed(1)} m/s
              </Text>
              <Text className={`mt-2 text-sm font-semibold ${colorClass}`}>
                {result.probability}%
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
