export type FlightStatus = 'scheduled' | 'cancelled' | 'delayed' | 'departed' | 'arrived';

export interface Flight {
  id: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  operator: string;
  aircraftType: string;
  registration: string;
  status: FlightStatus;
  delayMinutes?: number;
  paxSeats: number;
}
