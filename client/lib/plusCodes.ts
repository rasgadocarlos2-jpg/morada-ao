const OpenLocationCodeModule = require("open-location-code");
const OpenLocationCode = new OpenLocationCodeModule.OpenLocationCode();

export interface MoradaResult {
  fullCode: string;
  shortCode: string;
  reference: string;
  latitude: number;
  longitude: number;
}

export interface DecodedCode {
  latitudeCenter: number;
  longitudeCenter: number;
  latitudeLo: number;
  longitudeLo: number;
  latitudeHi: number;
  longitudeHi: number;
}

export function generateMorada(
  lat: number,
  lng: number,
  municipio: string | null,
  alternativa: string | null
): MoradaResult {
  const fullCode = OpenLocationCode.encode(lat, lng, 11);

  let shortCode = "";
  const reference = municipio || alternativa || "";

  if (reference) {
    try {
      shortCode = OpenLocationCode.shorten(fullCode, lat, lng);
    } catch {
      shortCode = "";
    }
  }

  return {
    fullCode,
    shortCode,
    reference,
    latitude: lat,
    longitude: lng,
  };
}

export function generateShareMessage(morada: MoradaResult): string {
  const lines: string[] = [];
  lines.push("A minha morada:");

  if (morada.shortCode && morada.reference) {
    lines.push(`${morada.shortCode} ${morada.reference}`);
  }

  lines.push("");
  lines.push(`Código completo: ${morada.fullCode}`);

  lines.push("");
  lines.push("Abrir no mapa:");
  lines.push(
    `https://www.google.com/maps/place/${encodeURIComponent(morada.fullCode)}`
  );
  lines.push("");
  lines.push("Gerado com Morada AO");

  return lines.join("\n");
}

export function isValidPlusCode(code: string): boolean {
  try {
    return OpenLocationCode.isValid(code);
  } catch {
    return false;
  }
}

export function isFullCode(code: string): boolean {
  try {
    return OpenLocationCode.isFull(code);
  } catch {
    return false;
  }
}

export function decodePlusCode(code: string): DecodedCode | null {
  try {
    const trimmed = code.trim();
    if (!OpenLocationCode.isFull(trimmed)) return null;
    const area = OpenLocationCode.decode(trimmed);
    return {
      latitudeCenter: area.latitudeCenter,
      longitudeCenter: area.longitudeCenter,
      latitudeLo: area.latitudeLo,
      longitudeLo: area.longitudeLo,
      latitudeHi: area.latitudeHi,
      longitudeHi: area.longitudeHi,
    };
  } catch {
    return null;
  }
}

const PLUS_CODE_REGEX = /([23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,8})/i;

export function extractPlusCode(text: string): string | null {
  if (!text) return null;
  const match = text.match(PLUS_CODE_REGEX);
  if (!match) return null;
  const code = match[1].toUpperCase();
  return isValidPlusCode(code) ? code : null;
}

export function moradaFromCode(
  code: string,
  bairro: string | null,
  cidade: string | null
): MoradaResult | null {
  const decoded = decodePlusCode(code);
  if (!decoded) return null;
  return generateMorada(
    decoded.latitudeCenter,
    decoded.longitudeCenter,
    bairro,
    cidade
  );
}
