import { Waves, Wind } from 'lucide-react-native';
import { View, Text } from 'react-native';

import type { DailyForecast } from '@/types/forecast';

interface Props {
  day: DailyForecast;
}

const levelColor: Record<string, string> = {
  good: '#2DD4BF',
  caution: '#38BDF8',
  poor: '#F59E0B',
  'no-go': '#F87171',
};

const levelLabel: Record<string, string> = {
  good: 'God',
  caution: 'Forsiktig',
  poor: 'Dårlig',
  'no-go': 'Ingen landing',
};

export function DailyForecastCard({ day }: Props) {
  const color = levelColor[day.landingLevel];
  const isCapitalized = day.dayLabel === 'I dag' || day.dayLabel === 'I morgen';
  const maxWindKt = (day.windSpeedMax * 1.94384).toFixed(0);
  const maxGustKt = day.windGustMax
    ? `/${(day.windGustMax * 1.94384).toFixed(0)}`
    : '';

  return (
    <View
      style={{
        backgroundColor: '#121A2B',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#243149',
        padding: 16,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {/* Day label + precip */}
      <View style={{ width: 90 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: isCapitalized ? '700' : '600',
            color: isCapitalized ? '#E5EAF2' : '#C5D0DC',
            textTransform: 'capitalize',
          }}
        >
          {day.dayLabel}
        </Text>
        {day.precipitationTotal > 0 ? (
          <Text style={{ fontSize: 11, color: '#8B97AC', marginTop: 2 }}>
            {day.precipitationTotal.toFixed(1)} mm
          </Text>
        ) : null}
      </View>

      {/* Temp range */}
      <View style={{ width: 70, alignItems: 'center' }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: '#E5EAF2' }}>
          {day.tempMax}°
        </Text>
        <Text style={{ fontSize: 12, color: '#8B97AC' }}>{day.tempMin}°</Text>
      </View>

      {/* Wind */}
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <Wind color="#38BDF8" size={14} strokeWidth={2} />
        <Text style={{ fontSize: 13, color: '#E5EAF2', marginLeft: 4 }}>
          {maxWindKt}{maxGustKt} kt
        </Text>
      </View>

      {/* Wave */}
      <View style={{ width: 60, flexDirection: 'row', alignItems: 'center' }}>
        <Waves color="#38BDF8" size={14} strokeWidth={2} />
        <Text style={{ fontSize: 13, color: '#E5EAF2', marginLeft: 4 }}>
          {day.waveHeightMax !== undefined
            ? `${day.waveHeightMax.toFixed(1)}m`
            : '–'}
        </Text>
      </View>

      {/* Landing indicator */}
      <View style={{ alignItems: 'flex-end', minWidth: 72 }}>
        <View
          style={{
            backgroundColor: color + '22',
            borderRadius: 10,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderWidth: 1,
            borderColor: color + '55',
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color }}>
            {day.landingProbabilityAvg}%
          </Text>
        </View>
        <Text style={{ fontSize: 10, color, marginTop: 3 }}>
          {levelLabel[day.landingLevel]}
        </Text>
      </View>
    </View>
  );
}
