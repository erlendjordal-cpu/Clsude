import { View, Text, ScrollView } from 'react-native';

import type { ForecastPoint } from '@/types/weather';
import { calculateLandingProbability } from '@/utils/landingProbability';
import { degreesToCompass } from '@/utils/weatherDisplay';

interface Props {
  points: ForecastPoint[];
}

function toSnapshot(p: ForecastPoint) {
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

const levelColors: Record<string, string> = {
  good: '#2DD4BF',
  caution: '#38BDF8',
  poor: '#F59E0B',
  'no-go': '#F87171',
};

export function HourlyForecastList({ points }: Props) {
  return (
    <View className="mt-4 rounded-3xl border border-offshore-border bg-offshore-surface overflow-hidden">
      <View className="px-5 pt-5 pb-3">
        <Text className="text-xs font-semibold uppercase tracking-widest text-offshore-textMuted">
          Neste 24 timer
        </Text>
      </View>

      {/* Header row */}
      <View className="flex-row px-5 pb-2">
        <Text style={{ width: 44 }} className="text-xs text-offshore-textMuted">Tid</Text>
        <Text style={{ width: 44 }} className="text-xs text-offshore-textMuted">Temp</Text>
        <Text style={{ flex: 1 }} className="text-xs text-offshore-textMuted">Vind (kt)</Text>
        <Text style={{ width: 44 }} className="text-xs text-offshore-textMuted">Bølge</Text>
        <Text style={{ width: 44, textAlign: 'right' }} className="text-xs text-offshore-textMuted">Land.</Text>
      </View>

      <ScrollView nestedScrollEnabled>
        {points.map((p, i) => {
          const result = calculateLandingProbability(toSnapshot(p));
          const time = new Date(p.time).toLocaleTimeString('nb-NO', {
            hour: '2-digit',
            minute: '2-digit',
          });
          const windKt = (p.windSpeed * 1.94384).toFixed(0);
          const gustKt = p.windGust
            ? `/${(p.windGust * 1.94384).toFixed(0)}`
            : '';
          const dir = degreesToCompass(p.windFromDirection);
          const dotColor = levelColors[result.level];
          const isLast = i === points.length - 1;

          return (
            <View
              key={p.time}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderTopWidth: 1,
                borderTopColor: '#243149',
                backgroundColor: i % 2 === 0 ? '#121A2B' : '#131D2E',
              }}
            >
              <Text style={{ width: 44, fontSize: 13, color: '#8B97AC' }}>{time}</Text>
              <Text style={{ width: 44, fontSize: 13, color: '#E5EAF2', fontWeight: '600' }}>
                {Math.round(p.temperature)}°
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: '#E5EAF2' }}>
                  {windKt}{gustKt} kt
                </Text>
                <Text style={{ fontSize: 11, color: '#8B97AC' }}>{dir}</Text>
              </View>
              <Text style={{ width: 44, fontSize: 13, color: '#E5EAF2' }}>
                {p.waveHeight !== undefined ? `${p.waveHeight.toFixed(1)}m` : '–'}
              </Text>
              <View style={{ width: 44, alignItems: 'flex-end' }}>
                <View
                  style={{
                    backgroundColor: dotColor + '33',
                    borderRadius: 8,
                    paddingHorizontal: 6,
                    paddingVertical: 3,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: dotColor }}>
                    {result.probability}%
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
