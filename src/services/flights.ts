import type { Flight, FlightStatus } from '@/types/flight';

const OPERATORS = [
  { name: 'CHC Helicopter', aircraft: 'S-92A', regs: ['LN-OQJ', 'LN-OQY', 'LN-ONX'] },
  { name: 'Bristow Norway', aircraft: 'AW189', regs: ['LN-OJF', 'LN-OJG'] },
];

const WEEKDAY_SCHEDULE = [
  { dep: '07:00', arr: '07:45' },
  { dep: '10:00', arr: '10:45' },
  { dep: '13:00', arr: '13:45' },
  { dep: '16:00', arr: '16:45' },
];

const WEEKEND_SCHEDULE = [
  { dep: '08:00', arr: '08:45' },
  { dep: '14:00', arr: '14:45' },
];

// Deterministic pseudo-random based on date + index so schedule is stable
function seed(dateStr: string, index: number): number {
  let h = 0;
  for (const ch of dateStr + String(index)) {
    h = (Math.imul(31, h) + ch.charCodeAt(0)) | 0;
  }
  return Math.abs(h) / 2_147_483_647;
}

function pickStatus(dateStr: string, slot: number): { status: FlightStatus; delay?: number } {
  const r = seed(dateStr, slot * 7);
  if (r < 0.04) return { status: 'cancelled' };
  if (r < 0.12) return { status: 'delayed', delay: Math.round(seed(dateStr, slot * 7 + 1) * 30 + 10) };
  return { status: 'scheduled' };
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function isWeekend(dateStr: string): boolean {
  const day = new Date(dateStr + 'T12:00:00').getDay();
  return day === 0 || day === 6;
}

export function getFlightsForDate(dateStr: string): Flight[] {
  const schedule = isWeekend(dateStr) ? WEEKEND_SCHEDULE : WEEKDAY_SCHEDULE;
  const flights: Flight[] = [];
  let idx = 0;

  for (const slot of schedule) {
    const opIdx = Math.floor(seed(dateStr, idx) * OPERATORS.length);
    const op = OPERATORS[opIdx];
    const regIdx = Math.floor(seed(dateStr, idx + 1) * op.regs.length);
    const reg = op.regs[regIdx];
    const pax = op.aircraft === 'S-92A' ? 19 : 16;

    // Outbound: SVG → SLP-A
    const outStatus = pickStatus(dateStr, idx * 2);
    const outDep = outStatus.delay ? addMinutes(slot.dep, outStatus.delay) : slot.dep;
    const outArr = outStatus.delay ? addMinutes(slot.arr, outStatus.delay) : slot.arr;

    flights.push({
      id: `${dateStr}-out-${idx}`,
      date: dateStr,
      departureTime: outDep,
      arrivalTime: outArr,
      from: 'Stavanger (Sola)',
      fromCode: 'SVG',
      to: 'Sleipner A',
      toCode: 'SLP',
      operator: op.name,
      aircraftType: op.aircraft,
      registration: reg,
      status: outStatus.status,
      delayMinutes: outStatus.delay,
      paxSeats: pax,
    });

    // Return: SLP-A → SVG (departs 30 min after arrival, back ~45 min later)
    const retDep = addMinutes(outArr, 30);
    const retArr = addMinutes(retDep, 45);
    const retStatus = pickStatus(dateStr, idx * 2 + 1);

    flights.push({
      id: `${dateStr}-ret-${idx}`,
      date: dateStr,
      departureTime: retDep,
      arrivalTime: retArr,
      from: 'Sleipner A',
      fromCode: 'SLP',
      to: 'Stavanger (Sola)',
      toCode: 'SVG',
      operator: op.name,
      aircraftType: op.aircraft,
      registration: reg,
      status: retStatus.status,
      delayMinutes: retStatus.delay,
      paxSeats: pax,
    });

    idx++;
  }

  return flights.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
}

export function getFlightsForNext7Days(): { date: string; flights: Flight[] }[] {
  const result: { date: string; flights: Flight[] }[] = [];
  const now = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dateStr = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-');
    result.push({ date: dateStr, flights: getFlightsForDate(dateStr) });
  }

  return result;
}
