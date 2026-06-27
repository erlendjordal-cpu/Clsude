import { WEATHER_USER_AGENT } from '@/constants/location';

const AVINOR_API = 'https://asrv.avinor.no/XmlFeed/v1.0';
const CACHE_TTL_MS = 3 * 60 * 1000;

export type AvinorStatusCode = 'A' | 'C' | 'D' | 'E';

export interface AvinorFlight {
  uniqueId: string;
  flightId: string;
  airline: string;
  airlineName: string;
  scheduledTime: string;
  statusCode?: AvinorStatusCode;
  statusTime?: string;
  stops: string[];
  stopNames: string[];
  gate?: string;
  delayed: boolean;
}

const HELICOPTER_OPERATORS: Record<string, string> = {
  NOR: 'Bristow',
  HKS: 'CHC Helicopter',
  LTR: 'Lufttransport',
};

const PLATFORM_NAMES: Record<string, string> = {
  '1SP': 'Floatel Superior',
  '2LE': 'Loke',
  '3BE': 'Deepsea Aberdeen',
  '3HV': 'Haven',
  '2FL': 'Seven Falcon',
  '1WS': 'Eldfisk 2/7 S',
  '8PR': 'Cosl Promoter',
  '1WK': 'Gina Krog',
  '9DB': 'Shelf Drilling Barsk',
  '2IV': 'Noble Invincible',
  '1AF': 'Åsgard A',
};

export function platformName(code: string): string {
  return PLATFORM_NAMES[code] ?? code;
}

let _cache: { data: AvinorFlight[]; at: number } | null = null;

function getTag(xml: string, name: string): string | undefined {
  const m = xml.match(new RegExp(`<${name}[^>]*>([^<]*)<\\/${name}>`));
  return m?.[1]?.trim() || undefined;
}

function parseFlights(xml: string): AvinorFlight[] {
  const out: AvinorFlight[] = [];
  const re = /<flight\s+uniqueID="([^"]*)">([\s\S]*?)<\/flight>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const body = m[2];
    const airline = getTag(body, 'airline') ?? '';

    if (!(airline in HELICOPTER_OPERATORS)) continue;

    const viaRaw = getTag(body, 'via_airport') ?? '';
    const stops = viaRaw ? viaRaw.split(',').map((c) => c.trim()).filter(Boolean) : [];
    const stopNames = stops.map(platformName);

    const sm = body.match(/<status(?:\s+code="([^"]*)")?(?:\s+time="([^"]*)")?/);
    out.push({
      uniqueId: m[1],
      flightId: getTag(body, 'flight_id') ?? '',
      airline,
      airlineName: HELICOPTER_OPERATORS[airline],
      scheduledTime: getTag(body, 'schedule_time') ?? '',
      statusCode: (sm?.[1] as AvinorStatusCode) || undefined,
      statusTime: sm?.[2] || undefined,
      stops,
      stopNames,
      gate: getTag(body, 'gate'),
      delayed: getTag(body, 'delayed') === 'Y',
    });
  }
  return out;
}

export class AvinorApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AvinorApiError';
  }
}

export async function fetchHelicopterDepartures(): Promise<AvinorFlight[]> {
  if (_cache && Date.now() - _cache.at < CACHE_TTL_MS) return _cache.data;

  let res: Response;
  try {
    res = await fetch(
      `${AVINOR_API}?airport=SVG&direction=D&serviceType=E&TimeFrom=1&TimeTo=7`,
      { headers: { 'User-Agent': WEATHER_USER_AGENT, Accept: 'text/xml, application/xml' } }
    );
  } catch {
    throw new AvinorApiError('Kunne ikke nå Avinor. Sjekk internettforbindelsen.');
  }

  if (!res.ok) throw new AvinorApiError(`Avinor svarte med feil (${res.status}).`);

  const xml = await res.text();
  const data = parseFlights(xml);
  _cache = { data, at: Date.now() };
  return data;
}
