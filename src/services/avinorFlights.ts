import { WEATHER_USER_AGENT } from '@/constants/location';

const AVINOR_API = 'https://asrv.avinor.no/XmlFeed/v1.0';
const CACHE_TTL_MS = 3 * 60 * 1000;

export type AvinorStatusCode = 'A' | 'C' | 'D' | 'E';

export interface AvinorFlight {
  uniqueId: string;
  flightId: string;
  airline: string;
  scheduledTime: string;
  statusCode?: AvinorStatusCode;
  statusTime?: string;
  destination?: string;
  gate?: string;
  delayed: boolean;
}

let _cache: { data: AvinorFlight[]; at: number } | null = null;

function getTag(xml: string, name: string): string | undefined {
  const m = xml.match(new RegExp(`<${name}[^>]*>([^<]*)<\\/${name}>`));
  return m?.[1]?.trim() || undefined;
}

function isOffshoreCode(code: string | undefined): boolean {
  // Offshore platform codes follow the pattern: digit + 2 letters (e.g. 1SP, 2LE, 3BE)
  return !!code && /^\d[A-Z]{2}$/.test(code);
}

function parseFlights(xml: string): AvinorFlight[] {
  const out: AvinorFlight[] = [];
  const re = /<flight\s+uniqueID="([^"]*)">([\s\S]*?)<\/flight>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const body = m[2];
    const via = getTag(body, 'via_airport');
    const apt = getTag(body, 'airport');
    const dest = via && via !== 'SVG' ? via : apt !== 'SVG' ? apt : undefined;

    // Only include flights going to/via an offshore platform code
    if (!isOffshoreCode(via) && !isOffshoreCode(apt)) continue;

    const sm = body.match(/<status(?:\s+code="([^"]*)")?(?:\s+time="([^"]*)")?/);
    out.push({
      uniqueId: m[1],
      flightId: getTag(body, 'flight_id') ?? '',
      airline: getTag(body, 'airline') ?? '',
      scheduledTime: getTag(body, 'schedule_time') ?? '',
      statusCode: (sm?.[1] as AvinorStatusCode) || undefined,
      statusTime: sm?.[2] || undefined,
      destination: dest,
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
      `${AVINOR_API}?airport=SVG&direction=D&serviceType=E&TimeFrom=-2&TimeTo=168`,
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
