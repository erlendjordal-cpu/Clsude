import { AlertTriangle } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FlightCard } from '@/components/FlightCard';
import { getFlightsForNext7Days } from '@/services/flights';

const DAYS = getFlightsForNext7Days();

function formatDateHeader(dateStr: string, index: number): string {
  if (index === 0) return 'I dag';
  if (index === 1) return 'I morgen';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function FlightsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B1220' }} edges={['top']}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#E5EAF2' }}>
          Avganger
        </Text>
        <Text style={{ marginTop: 4, fontSize: 13, color: '#8B97AC' }}>
          Sleipner A ↔ Stavanger (Sola)
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 32 }}
      >
        {/* Disclaimer */}
        <View
          style={{
            backgroundColor: '#1A2538',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#F59E0B55',
            padding: 12,
            flexDirection: 'row',
            marginBottom: 20,
            gap: 10,
          }}
        >
          <AlertTriangle color="#F59E0B" size={16} style={{ marginTop: 1 }} />
          <Text style={{ flex: 1, fontSize: 11, color: '#8B97AC', lineHeight: 16 }}>
            Disse avgangene er illustrative eksempler. Faktiske flyplaner fastsettes av
            operatøren (CHC/Bristow) og Equinor. Kontakt din personaltransportkoordinator
            for offisielle avgangstider.
          </Text>
        </View>

        {DAYS.map(({ date, flights }, index) => (
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
              {formatDateHeader(date, index)}
              {'  '}
              <Text style={{ fontSize: 11, fontWeight: '400', color: '#8B97AC' }}>
                {date}
              </Text>
            </Text>

            {flights.length === 0 ? (
              <View
                style={{
                  backgroundColor: '#121A2B',
                  borderRadius: 14,
                  padding: 16,
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: '#8B97AC', fontSize: 13 }}>
                  Ingen avganger registrert
                </Text>
              </View>
            ) : (
              flights.map((flight) => <FlightCard key={flight.id} flight={flight} />)
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
