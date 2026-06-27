import { ArrowRight } from 'lucide-react-native';
import { View, Text } from 'react-native';

import type { Flight, FlightStatus } from '@/types/flight';

interface Props {
  flight: Flight;
}

const statusColor: Record<FlightStatus, string> = {
  scheduled: '#2DD4BF',
  departed: '#38BDF8',
  arrived: '#8B97AC',
  delayed: '#F59E0B',
  cancelled: '#F87171',
};

const statusLabel: Record<FlightStatus, string> = {
  scheduled: 'Planlagt',
  departed: 'Avreist',
  arrived: 'Ankommet',
  delayed: 'Forsinket',
  cancelled: 'Kansellert',
};

export function FlightCard({ flight }: Props) {
  const color = statusColor[flight.status];
  const isCancelled = flight.status === 'cancelled';

  return (
    <View
      style={{
        backgroundColor: '#121A2B',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: isCancelled ? '#F8717144' : '#243149',
        padding: 14,
        marginBottom: 10,
        opacity: isCancelled ? 0.7 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Route */}
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#E5EAF2' }}>
              {flight.departureTime}
            </Text>
            <Text style={{ fontSize: 11, color: '#8B97AC', marginTop: 1 }}>
              {flight.fromCode}
            </Text>
          </View>

          <View style={{ marginHorizontal: 12, alignItems: 'center' }}>
            <ArrowRight color="#8B97AC" size={16} strokeWidth={2} />
            <Text style={{ fontSize: 9, color: '#8B97AC', marginTop: 2 }}>45 min</Text>
          </View>

          <View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#E5EAF2' }}>
              {flight.arrivalTime}
            </Text>
            <Text style={{ fontSize: 11, color: '#8B97AC', marginTop: 1 }}>
              {flight.toCode}
            </Text>
          </View>
        </View>

        {/* Status badge */}
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
          <Text style={{ fontSize: 11, fontWeight: '700', color }}>
            {statusLabel[flight.status]}
          </Text>
        </View>
      </View>

      {/* Details row */}
      <View style={{ flexDirection: 'row', marginTop: 10, gap: 16 }}>
        <View>
          <Text style={{ fontSize: 10, color: '#8B97AC' }}>Rute</Text>
          <Text style={{ fontSize: 12, color: '#C5D0DC', fontWeight: '500' }}>
            {flight.from} → {flight.to}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', marginTop: 6, gap: 16 }}>
        <View>
          <Text style={{ fontSize: 10, color: '#8B97AC' }}>Operatør</Text>
          <Text style={{ fontSize: 12, color: '#C5D0DC' }}>{flight.operator}</Text>
        </View>
        <View>
          <Text style={{ fontSize: 10, color: '#8B97AC' }}>Luftfartøy</Text>
          <Text style={{ fontSize: 12, color: '#C5D0DC' }}>
            {flight.aircraftType} · {flight.registration}
          </Text>
        </View>
        {flight.delayMinutes ? (
          <View>
            <Text style={{ fontSize: 10, color: '#8B97AC' }}>Forsinkelse</Text>
            <Text style={{ fontSize: 12, color: '#F59E0B' }}>{flight.delayMinutes} min</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
