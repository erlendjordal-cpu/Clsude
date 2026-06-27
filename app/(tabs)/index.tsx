import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HourlyForecastList } from '@/components/HourlyForecastList';
import { LandingProbabilityCard } from '@/components/LandingProbabilityCard';
import { WeatherCard } from '@/components/WeatherCard';
import { SLEIPNER_LOCATION } from '@/constants/location';
import { useForecast } from '@/hooks/useWeather';
import { getNext24Hours } from '@/utils/forecast';

export default function TodayScreen() {
  const { data, loading, refreshing, error, refresh } = useForecast(
    SLEIPNER_LOCATION.latitude,
    SLEIPNER_LOCATION.longitude
  );

  return (
    <SafeAreaView className="flex-1 bg-offshore-bg" edges={['top']}>
      <View className="px-5 pt-4 pb-2">
        <Text className="text-3xl font-bold text-offshore-text">Offshore Vær</Text>
        <Text className="mt-1 text-sm text-offshore-textMuted">
          Sleipner A · Sanntidsdata fra MET.no
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#2DD4BF"
          />
        }
      >
        {loading ? (
          <View className="flex-1 items-center justify-center py-24">
            <ActivityIndicator size="large" color="#2DD4BF" />
            <Text className="mt-4 text-sm text-offshore-textMuted">
              Henter værdata fra MET.no…
            </Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center rounded-3xl border border-offshore-border bg-offshore-surface px-6 py-16">
            <AlertTriangle color="#F87171" size={36} />
            <Text className="mt-4 text-center text-base font-semibold text-offshore-text">
              Kunne ikke hente værdata
            </Text>
            <Text className="mt-2 text-center text-sm text-offshore-textMuted">{error}</Text>
            <Pressable
              onPress={refresh}
              className="mt-6 flex-row items-center rounded-full bg-offshore-accent px-5 py-3"
            >
              <RefreshCw color="#0B1220" size={16} />
              <Text className="ml-2 text-sm font-semibold text-offshore-bg">Prøv igjen</Text>
            </Pressable>
          </View>
        ) : data ? (
          <>
            <WeatherCard
              locationName={SLEIPNER_LOCATION.name}
              latitude={SLEIPNER_LOCATION.latitude}
              longitude={SLEIPNER_LOCATION.longitude}
              weather={data.current}
            />
            <LandingProbabilityCard weather={data.current} />
            <HourlyForecastList points={getNext24Hours(data.hourly)} />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
