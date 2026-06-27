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

import { DailyForecastCard } from '@/components/DailyForecastCard';
import { SLEIPNER_LOCATION } from '@/constants/location';
import { useForecast } from '@/hooks/useWeather';
import { groupByDay } from '@/utils/forecast';

export default function WeekScreen() {
  const { data, loading, refreshing, error, refresh } = useForecast(
    SLEIPNER_LOCATION.latitude,
    SLEIPNER_LOCATION.longitude
  );

  const days = data ? groupByDay(data.hourly) : [];

  return (
    <SafeAreaView className="flex-1 bg-offshore-bg" edges={['top']}>
      <View className="px-5 pt-4 pb-2">
        <Text className="text-3xl font-bold text-offshore-text">7-dagersvarsel</Text>
        <Text className="mt-1 text-sm text-offshore-textMuted">
          Sleipner A · Daglig oversikt med landingsforhold
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#2DD4BF" />
        }
      >
        {loading ? (
          <View className="flex-1 items-center justify-center py-24">
            <ActivityIndicator size="large" color="#2DD4BF" />
            <Text className="mt-4 text-sm text-offshore-textMuted">
              Henter varseldata…
            </Text>
          </View>
        ) : error ? (
          <View className="items-center rounded-3xl border border-offshore-border bg-offshore-surface px-6 py-16">
            <AlertTriangle color="#F87171" size={36} />
            <Text className="mt-4 text-center text-base font-semibold text-offshore-text">
              Kunne ikke hente varsel
            </Text>
            <Pressable
              onPress={refresh}
              className="mt-6 flex-row items-center rounded-full bg-offshore-accent px-5 py-3"
            >
              <RefreshCw color="#0B1220" size={16} />
              <Text className="ml-2 text-sm font-semibold text-offshore-bg">Prøv igjen</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Legend */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                gap: 12,
                paddingHorizontal: 4,
                marginBottom: 12,
              }}
            >
              {[
                { label: 'God', color: '#2DD4BF' },
                { label: 'Forsiktig', color: '#38BDF8' },
                { label: 'Dårlig', color: '#F59E0B' },
                { label: 'No-go', color: '#F87171' },
              ].map((item) => (
                <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
                  <Text style={{ fontSize: 10, color: '#8B97AC' }}>{item.label}</Text>
                </View>
              ))}
            </View>

            {/* Column headers */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 4, marginBottom: 6 }}>
              <Text style={{ width: 90, fontSize: 10, color: '#8B97AC' }}>DAG</Text>
              <Text style={{ width: 70, textAlign: 'center', fontSize: 10, color: '#8B97AC' }}>TEMP</Text>
              <Text style={{ flex: 1, fontSize: 10, color: '#8B97AC' }}>VIND</Text>
              <Text style={{ width: 60, fontSize: 10, color: '#8B97AC' }}>BØLGE</Text>
              <Text style={{ width: 72, textAlign: 'right', fontSize: 10, color: '#8B97AC' }}>LANDING</Text>
            </View>

            {days.map((day) => (
              <DailyForecastCard key={day.date} day={day} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
