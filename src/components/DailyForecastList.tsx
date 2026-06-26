import { Text, View } from 'react-native';

import type { DaySummary } from '@/utils/forecastAggregation';

interface DailyForecastListProps {
  days: DaySummary[];
}

const levelColors: Record<string, string> = {
  good: 'text-offshore-accent',
  caution: 'text-offshore-accentAlt',
  poor: 'text-offshore-warning',
  'no-go': 'text-offshore-danger',
};

const levelLabels: Record<string, string> = {
  good: 'God',
  caution: 'Vær forsiktig',
  poor: 'Dårlig',
  'no-go': 'Ikke landing',
};

function formatDateLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  return parsed.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
}

export function DailyForecastList({ days }: DailyForecastListProps) {
  if (days.length === 0) {
    return (
      <View className="items-center rounded-3xl border border-offshore-border bg-offshore-surface px-6 py-16">
        <Text className="text-center text-sm text-offshore-textMuted">
          Ingen værdata tilgjengelig for de neste dagene.
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-3">
      {days.map((day) => {
        const colorClass = levelColors[day.landingLevel];
        return (
          <View
            key={day.date}
            className="flex-row items-center rounded-3xl border border-offshore-border bg-offshore-surface p-5"
          >
            <View className="flex-1">
              <Text className="text-sm font-semibold text-offshore-text">
                {day.label}
              </Text>
              <Text className="text-xs text-offshore-textMuted">
                {formatDateLabel(day.date)}
              </Text>
              <Text className="mt-2 text-sm text-offshore-textMuted">
                {Math.round(day.minTemp)}° / {Math.round(day.maxTemp)}°C ·{' '}
                {day.maxWindSpeed.toFixed(1)} m/s
                {day.maxWindGust ? ` (byger ${day.maxWindGust.toFixed(1)})` : ''}
              </Text>
            </View>
            <View className="items-end">
              <Text className={`text-3xl font-light ${colorClass}`}>
                {day.landingProbability}%
              </Text>
              <Text className={`text-xs font-medium ${colorClass}`}>
                {levelLabels[day.landingLevel]}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
