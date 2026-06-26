import { HelpCircle } from 'lucide-react-native';
import { View, Text } from 'react-native';

import type { WeatherSnapshot } from '@/types/weather';
import { calculateLandingProbability } from '@/utils/landingProbability';

interface LandingProbabilityCardProps {
  weather: WeatherSnapshot;
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

const factorLabels: Record<string, string> = {
  wind: 'Vind',
  visibility: 'Sikt',
  cloud: 'Skydekke',
  waves: 'Bølger',
  thunder: 'Lyn',
};

export function LandingProbabilityCard({ weather }: LandingProbabilityCardProps) {
  const result = calculateLandingProbability(weather);
  const colorClass = levelColors[result.level];

  return (
    <View className="mt-4 rounded-3xl border border-offshore-border bg-offshore-surface p-6">
      <Text className="text-xs font-semibold uppercase tracking-widest text-offshore-textMuted">
        Helikopterlanding
      </Text>

      <View className="mt-3 flex-row items-end">
        <Text className={`text-6xl font-light ${colorClass}`}>
          {result.probability}
        </Text>
        <Text className={`mb-2 ml-1 text-2xl font-medium ${colorClass}`}>%</Text>
      </View>
      <Text className={`text-sm font-semibold ${colorClass}`}>
        {levelLabels[result.level]}
      </Text>

      <View className="mt-4 flex-row flex-wrap gap-2">
        {(Object.keys(result.factors) as (keyof typeof result.factors)[]).map(
          (key) => {
            const factor = result.factors[key];
            return (
              <View
                key={key}
                className="rounded-xl bg-offshore-surfaceAlt px-3 py-2"
              >
                <Text className="text-xs uppercase tracking-wide text-offshore-textMuted">
                  {factorLabels[key]}
                </Text>
                <Text className="text-sm font-semibold text-offshore-text">
                  {factor.excluded ? '–' : `${Math.round(factor.score)} %`}
                </Text>
              </View>
            );
          }
        )}
      </View>

      <View className="mt-5 flex-row items-start rounded-2xl bg-offshore-surfaceAlt p-3">
        <HelpCircle color="#8B97AC" size={16} />
        <Text className="ml-2 flex-1 text-xs leading-4 text-offshore-textMuted">
          Dette er et veiledende estimat basert på tilnærmede, offentlig
          kjente kriterier for helikopterdekk offshore. Det er IKKE et
          sertifisert eller operativt go/no-go-verktøy, og skal ikke brukes
          som beslutningsgrunnlag for flyoperasjoner. Faktiske operative
          minima fastsettes av luftfartsmyndighet og operatør (jf. CAP 437 /
          CAP 1145).
        </Text>
      </View>
    </View>
  );
}
