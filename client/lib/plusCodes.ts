const OpenLocationCodeModule = require("open-location-code");
const OpenLocationCode = new OpenLocationCodeModule.OpenLocationCode();

export interface MoradaResult {
  fullCode: string;
  shortCode: string;
  reference: string;
  latitude: number;
  longitude: number;
}

export function generateMorada(
  lat: number,
  lng: number,
  bairro: string | null,
  cidade: string | null
): MoradaResult {
  const fullCode = OpenLocationCode.encode(lat, lng, 11);

  let shortCode = "";
  const reference = bairro || cidade || "";

  if (bairro || cidade) {
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
  
  lines.push("Minha morada:");
  
  if (morada.shortCode && morada.reference) {
    lines.push(`${morada.shortCode} ${morada.reference}`);
  }

  lines.push("");
  lines.push(`Código completo: ${morada.fullCode}`);

  lines.push("");
  lines.push("Abre no Google Maps:");
  lines.push(`https://www.google.com/maps/place/${encodeURIComponent(morada.fullCode)}`);

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
