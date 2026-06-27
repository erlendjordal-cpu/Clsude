import { AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react-native';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvinorFlightCard } from '@/components/AvinorFlightCard';
import { useFlights } from '@/hooks/useFlights';
import type { AvinorFlight } from '@/services/avinorFlights';

function localDateKey(isoUtc: string): string {
  const d = new Date(isoUtc);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dayLabel(dateStr: string, index: number): string {
  if (index === 0) return 'I dag';
  if (index === 1) return 'I morgen';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function groupByDay(flights: AvinorFlight[]): { date: string; flights: AvinorFlight[] }[] {
  const map = new Map<string, AvinorFlight[]>();
  for (const f of flights) {
    if (!f.scheduledTime) continue;
    const key = localDateKey(f.scheduledTime);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(f);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, fs]) => ({
      date,
      flights: fs.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime)),
    }));
}

export default function FlightsScreen() {
  const { flights, loading, refreshing, error, refresh } = useFlights();
  const days = groupByDay(flights);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B1220' }} edges={['top']}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#E5EAF2' }}>Avganger</Text>
        <Text style={{ marginTop: 4, fontSize: 13, color: '#8B97AC' }}>
          Stavanger (SVG) · Helikopter offshore
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#2DD4BF" />
        }
      >
        {/* Heliport.no link */}
        <Pressable
          onPress={() => Linking.openURL('https://www.heliport.no/flights?port=SVG')}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#1E3A5F' : '#162840',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#2DD4BF55',
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          })}
        >
          <View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#2DD4BF' }}>
              Åpne Heliport.no
            </Text>
            <Text style={{ fontSize: 11, color: '#8B97AC', marginTop: 2 }}>
              Sanntids avganger fra Stavanger (SVG)
            </Text>
          </View>
          <ExternalLink color="#2DD4BF" size={18} />
        </Pressable>

        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <ActivityIndicator size="large" color="#2DD4BF" />
            <Text style={{ marginTop: 12, fontSize: 13, color: '#8B97AC' }}>
              Henter flydata fra Avinor…
            </Text>
          </View>
        ) : error ? (
          <View
            style={{
              backgroundColor: '#1A2538',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#F8717155',
              padding: 20,
              alignItems: 'center',
            }}
          >
            <AlertTriangle color="#F87171" size={28} />
            <Text style={{ marginTop: 10, fontSize: 14, fontWeight: '600', color: '#E5EAF2' }}>
              Kunne ikke hente flydata
            </Text>
            <Text style={{ marginTop: 4, fontSize: 12, color: '#8B97AC', textAlign: 'center' }}>
              {error}
            </Text>
            <Pressable
              onPress={refresh}
              style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw color="#2DD4BF" size={14} />
              <Text style={{ fontSize: 13, color: '#2DD4BF', fontWeight: '600' }}>Prøv igjen</Text>
            </Pressable>
          </View>
        ) : days.length === 0 ? (
          <View
            style={{
              backgroundColor: '#121A2B',
              borderRadius: 14,
              padding: 20,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#8B97AC', fontSize: 13 }}>
              Ingen planlagte avganger funnet
            </Text>
          </View>
        ) : (
          <>
            {days.map(({ date, flights: dayFlights }, index) => (
              <View key={date} style={{ marginBottom: 8 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: index === 0 ? '#2DD4BF' : '#8B97AC',
                    textTransform: index < 2 ? 'none' : 'capitalize',
                    marginBottom: 8,
                    marginLeft: 2,
                  }}
                >
                  {dayLabel(date, index)}
                  {'  '}
                  <Text style={{ fontSize: 11, fontWeight: '400', color: '#8B97AC' }}>
                    {date}
                  </Text>
                </Text>
                {dayFlights.map((flight) => (
                  <AvinorFlightCard key={flight.uniqueId} flight={flight} />
                ))}
              </View>
            ))}

            {/* Avinor attribution */}
            <Pressable
              onPress={() => Linking.openURL('https://avinor.no')}
              style={{ alignItems: 'center', marginTop: 8 }}
            >
              <Text style={{ fontSize: 11, color: '#8B97AC' }}>
                Flydata fra{' '}
                <Text style={{ color: '#2DD4BF', textDecorationLine: 'underline' }}>Avinor</Text>
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
