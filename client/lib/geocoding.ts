import { getApiUrl } from "@/lib/query-client";

export interface GeocodingResult {
  bairro: string | null;
  cidade: string | null;
  provincia: string | null;
  pais: string | null;
  displayName: string | null;
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodingResult> {
  try {
    const baseUrl = getApiUrl();
    const url = new URL("/api/geocode", baseUrl);
    url.searchParams.set("lat", latitude.toString());
    url.searchParams.set("lng", longitude.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error("Geocoding failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return {
      bairro: null,
      cidade: null,
      provincia: null,
      pais: null,
      displayName: null,
    };
  }
}
