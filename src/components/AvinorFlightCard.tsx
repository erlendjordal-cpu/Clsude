import { ArrowRight } from 'lucide-react-native';
import { Text, View } from 'react-native';

import type { AvinorFlight, AvinorStatusCode } from '@/services/avinorFlights';

function localTime(isoUtc: string): string {
  return new Date(isoUtc).toLocaleTimeString('nb-NO', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const statusColor: Record<AvinorStatusCode, string> = {
  A: '#8B97AC',
  C: '#F87171',
  D: '#38BDF8',
  E: '#F59E0B',
};

const statusLabel: Record<AvinorStatusCode, string> = {
  A: 'Ankommet',
  C: 'Kansellert',
  D: 'Avreist',
  E: 'Ny tid',
};

interface Props {
  flight: AvinorFlight;
}

export function AvinorFlightCard({ flight }: Props) {
  const hasStatus = !!flight.statusCode;
  const color = hasStatus ? statusColor[flight.statusCode!] : '#2DD4BF';
  const label = hasStatus ? statusLabel[flight.statusCode!] : 'Planlagt';
  const isCancelled = flight.statusCode === 'C';
  const isNewTime = flight.statusCode === 'E' && !!flight.statusTime;
  const displayTime = isNewTime ? localTime(flight.statusTime!) : localTime(flight.scheduledTime);

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
      {/* Top row: time, route, status */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {/* Departure */}
          <View style={{ minWidth: 44 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#E5EAF2' }}>
              {displayTime}
            </Text>
            {isNewTime && (
              <Text style={{ fontSize: 10, color: '#8B97AC', textDecorationLine: 'line-through' }}>
                {localTime(flight.scheduledTime)}
              </Text>
            )}
            <Text style={{ fontSize: 11, color: '#8B97AC', marginTop: 1 }}>SVG</Text>
          </View>

          <ArrowRight color="#8B97AC" size={14} strokeWidth={2} style={{ marginHorizontal: 8 }} />

          {/* Stops */}
          <View style={{ flex: 1 }}>
            {flight.stopNames.length > 0 ? (
              flight.stopNames.map((name, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {i > 0 && (
                    <Text style={{ fontSize: 10, color: '#8B97AC', marginRight: 4 }}>→</Text>
                  )}
                  <Text
                    style={{ fontSize: 13, fontWeight: i === 0 ? '600' : '400', color: '#E5EAF2' }}
                    numberOfLines={1}
                  >
                    {name}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ fontSize: 13, color: '#8B97AC' }}>—</Text>
            )}
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
            marginLeft: 8,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', color }}>{label}</Text>
        </View>
      </View>

      {/* Details row */}
      <View style={{ flexDirection: 'row', marginTop: 10, gap: 16 }}>
        <View>
          <Text style={{ fontSize: 10, color: '#8B97AC' }}>Rutenr</Text>
          <Text style={{ fontSize: 12, color: '#C5D0DC', fontWeight: '600' }}>
            {flight.flightId}
          </Text>
        </View>
        <View>
          <Text style={{ fontSize: 10, color: '#8B97AC' }}>Operatør</Text>
          <Text style={{ fontSize: 12, color: '#C5D0DC' }}>{flight.airlineName}</Text>
        </View>
        {flight.gate ? (
          <View>
            <Text style={{ fontSize: 10, color: '#8B97AC' }}>Gate</Text>
            <Text style={{ fontSize: 12, color: '#C5D0DC' }}>{flight.gate}</Text>
          </View>
        ) : null}
        {flight.delayed && !isNewTime ? (
          <View>
            <Text style={{ fontSize: 10, color: '#8B97AC' }}>Status</Text>
            <Text style={{ fontSize: 12, color: '#F59E0B' }}>Forsinket</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
