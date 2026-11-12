export interface GeocodingResult {
  bairro: string | null;
  municipio: string | null;
  cidade: string | null;
  provincia: string | null;
  pais: string | null;
  displayName: string | null;
}

const EMPTY: GeocodingResult = {
  bairro: null,
  municipio: null,
  cidade: null,
  provincia: null,
  pais: null,
  displayName: null,
};

interface NominatimAddress {
  suburb?: string;
  neighbourhood?: string;
  village?: string;
  town?: string;
  city?: string;
  county?: string;
  municipality?: string;
  state?: string;
  province?: string;
  country?: string;
}

interface NominatimResponse {
  address?: NominatimAddress;
  display_name?: string;
}

const cache = new Map<string, GeocodingResult>();

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodingResult> {
  const key = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=json` +
      `&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "MoradaAO/1.0 (contact@moradaao.com)",
        "Accept-Language": "pt",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) return EMPTY;

    const data: NominatimResponse = await response.json();
    const address = data.address || {};

    const bairro = address.suburb || address.neighbourhood || address.village || null;
    const cidade = address.city || address.town || address.municipality || null;
    // Em Angola o OSM devolve o município em `county`, ex.: "Município do Cazenga".
    const municipio =
      (address.county || address.municipality)?.replace(
        /^Munic[ií]pio\s+(d[aeo]s?\s+)?/i,
        ""
      ) || null;
    const provincia = address.state || address.province || null;
    const pais = address.country || null;

    const result: GeocodingResult = {
      bairro,
      municipio,
      cidade,
      provincia,
      pais,
      displayName: data.display_name || null,
    };

    cache.set(key, result);
    return result;
  } catch {
    return EMPTY;
  }
}
