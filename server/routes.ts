import type { Express } from "express";
import { createServer, type Server } from "node:http";

interface NominatimResponse {
  address?: {
    suburb?: string;
    neighbourhood?: string;
    village?: string;
    town?: string;
    city?: string;
    municipality?: string;
    state?: string;
    province?: string;
    country?: string;
  };
  display_name?: string;
}

interface GeocodingResult {
  bairro: string | null;
  cidade: string | null;
  provincia: string | null;
  pais: string | null;
  displayName: string | null;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/geocode", async (req, res) => {
    try {
      const { lat, lng } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({ error: "Missing lat or lng parameters" });
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: "Invalid lat or lng values" });
      }

      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

      const response = await fetch(nominatimUrl, {
        headers: {
          "User-Agent": "MoradaAO/1.0 (contact@moradaao.com)",
          "Accept-Language": "pt",
        },
      });

      if (!response.ok) {
        console.error("Nominatim error:", response.status, response.statusText);
        return res.json({
          bairro: null,
          cidade: null,
          provincia: null,
          pais: null,
          displayName: null,
        } as GeocodingResult);
      }

      const data: NominatimResponse = await response.json();
      const address = data.address || {};

      const bairro =
        address.suburb ||
        address.neighbourhood ||
        address.village ||
        null;

      const cidade =
        address.city ||
        address.town ||
        address.municipality ||
        null;

      const provincia = address.state || address.province || null;

      const pais = address.country || null;

      if (pais && pais.toLowerCase() !== "angola" && !bairro && !cidade) {
        return res.json({
          bairro: null,
          cidade: null,
          provincia: null,
          pais,
          displayName: data.display_name || null,
        } as GeocodingResult);
      }

      const result: GeocodingResult = {
        bairro,
        cidade,
        provincia,
        pais,
        displayName: data.display_name || null,
      };

      res.json(result);
    } catch (error) {
      console.error("Geocoding error:", error);
      res.json({
        bairro: null,
        cidade: null,
        provincia: null,
        pais: null,
        displayName: null,
      } as GeocodingResult);
    }
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "Morada AO" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
