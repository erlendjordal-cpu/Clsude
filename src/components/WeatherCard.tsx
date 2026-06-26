import { Clock, Eye, Gauge, Navigation, Thermometer, Waves, Wind, Zap } from 'lucide-react-native';
import { View, Text } from 'react-native';

import type { WeatherSnapshot } from '@/types/weather';
import {
  degreesToCompass,
  formatUpdatedAt,
  thunderRiskLabel,
  visibilityLabel,
  windSpeedLabel,
} from '@/utils/weatherDisplay';

interface WeatherCardProps {
  locationName: string;
  latitude: number;
  longitude: number;
  weather: WeatherSnapshot;
}

const levelColors: Record<string, string> = {
  calm: 'text-offshore-accent',
  moderate: 'text-offshore-accentAlt',
  strong: 'text-offshore-warning',
  severe: 'text-offshore-danger',
};

const visibilityColors: Record<string, string> = {
  good: 'text-offshore-accent',
  reduced: 'text-offshore-accentAlt',
  poor: 'text-offshore-warning',
};

const thunderColors: Record<string, string> = {
  none: 'text-offshore-accent',
  low: 'text-offshore-accentAlt',
  moderate: 'text-offshore-warning',
  high: 'text-offshore-danger',
};

export function WeatherCard({
  locationName,
  latitude,
  longitude,
  weather,
}: WeatherCardProps) {
  const wind = windSpeedLabel(weather.windSpeed);
  const windColorClass = levelColors[wind.level];
  const visibility = visibilityLabel(weather.fogAreaFraction);
  const visibilityColorClass = visibilityColors[visibility.level];
  const thunder = thunderRiskLabel(weather.probabilityOfThunder);
  const thunderColorClass = thunderColors[thunder.level];

  return (
    <View className="rounded-3xl border border-offshore-border bg-offshore-surface p-6">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-xs font-semibold uppercase tracking-widest text-offshore-textMuted">
            Offshore felt
          </Text>
          <Text className="mt-1 text-2xl font-bold text-offshore-text">
            {locationName}
          </Text>
          <Text className="mt-0.5 text-xs text-offshore-textMuted">
            {latitude.toFixed(2)}°N, {longitude.toFixed(2)}°Ø
          </Text>
        </View>
        <View className="h-3 w-3 rounded-full bg-offshore-accent" />
      </View>

      <View className="mt-6 flex-row items-end">
        <Thermometer color="#2DD4BF" size={28} strokeWidth={2} />
        <Text className="ml-2 text-6xl font-light text-offshore-text">
          {Math.round(weather.temperature)}
        </Text>
        <Text className="mb-2 ml-1 text-2xl font-medium text-offshore-textMuted">
          °C
        </Text>
      </View>

      <View className="mt-6 h-px bg-offshore-border" />

      <View className="mt-6 flex-row">
        <View className="flex-1 flex-row items-center">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-offshore-surfaceAlt">
            <View
              style={{ transform: [{ rotate: `${weather.windFromDirection}deg` }] }}
            >
              <Navigation color="#38BDF8" size={26} strokeWidth={2.2} />
            </View>
          </View>
          <View className="ml-3">
            <Text className="text-xs uppercase tracking-wide text-offshore-textMuted">
              Vindretning
            </Text>
            <Text className="text-lg font-semibold text-offshore-text">
              {degreesToCompass(weather.windFromDirection)} ({Math.round(weather.windFromDirection)}°)
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-4 flex-row items-center">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-offshore-surfaceAlt">
          <Wind color="#38BDF8" size={26} strokeWidth={2.2} />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-xs uppercase tracking-wide text-offshore-textMuted">
            Vindstyrke
          </Text>
          <View className="flex-row items-baseline">
            <Text className="text-lg font-semibold text-offshore-text">
              {weather.windSpeed.toFixed(1)} m/s
            </Text>
            {weather.windGust ? (
              <Text className="ml-2 text-xs text-offshore-textMuted">
                (byger {weather.windGust.toFixed(1)} m/s)
              </Text>
            ) : null}
          </View>
          <Text className={`text-xs font-medium ${windColorClass}`}>{wind.label}</Text>
        </View>
      </View>

      {weather.pressure ? (
        <View className="mt-4 flex-row items-center">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-offshore-surfaceAlt">
            <Gauge color="#38BDF8" size={26} strokeWidth={2.2} />
          </View>
          <View className="ml-3">
            <Text className="text-xs uppercase tracking-wide text-offshore-textMuted">
              Lufttrykk
            </Text>
            <Text className="text-lg font-semibold text-offshore-text">
              {Math.round(weather.pressure)} hPa
            </Text>
          </View>
        </View>
      ) : null}

      {weather.fogAreaFraction !== undefined ? (
        <View className="mt-4 flex-row items-center">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-offshore-surfaceAlt">
            <Eye color="#38BDF8" size={26} strokeWidth={2.2} />
          </View>
          <View className="ml-3">
            <Text className="text-xs uppercase tracking-wide text-offshore-textMuted">
              Sikt (tåkeandel)
            </Text>
            <Text className="text-lg font-semibold text-offshore-text">
              {Math.round(weather.fogAreaFraction)} %
            </Text>
            <Text className={`text-xs font-medium ${visibilityColorClass}`}>
              {visibility.label}
            </Text>
          </View>
        </View>
      ) : null}

      {weather.waveHeight !== undefined ? (
        <View className="mt-4 flex-row items-center">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-offshore-surfaceAlt">
            <Waves color="#38BDF8" size={26} strokeWidth={2.2} />
          </View>
          <View className="ml-3">
            <Text className="text-xs uppercase tracking-wide text-offshore-textMuted">
              Bølgehøyde
            </Text>
            <Text className="text-lg font-semibold text-offshore-text">
              {weather.waveHeight.toFixed(1)} m
            </Text>
          </View>
        </View>
      ) : null}

      {weather.probabilityOfThunder !== undefined ? (
        <View className="mt-4 flex-row items-center">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-offshore-surfaceAlt">
            <Zap color="#38BDF8" size={26} strokeWidth={2.2} />
          </View>
          <View className="ml-3">
            <Text className="text-xs uppercase tracking-wide text-offshore-textMuted">
              Lynrisiko
            </Text>
            <Text className="text-lg font-semibold text-offshore-text">
              {Math.round(weather.probabilityOfThunder)} %
            </Text>
            <Text className={`text-xs font-medium ${thunderColorClass}`}>
              {thunder.label}
            </Text>
          </View>
        </View>
      ) : null}

      <View className="mt-6 flex-row items-center justify-center border-t border-offshore-border pt-4">
        <Clock color="#8B97AC" size={14} />
        <Text className="ml-2 text-xs text-offshore-textMuted">
          Oppdatert {formatUpdatedAt(weather.updatedAt)}
        </Text>
      </View>
    </View>
  );
}
