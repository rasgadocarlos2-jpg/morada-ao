import * as Linking from "expo-linking";
import { extractPlusCode } from "@/lib/plusCodes";

/**
 * Supported deep link formats:
 *   moradaao://code/6F3M576Q+2Q3
 *   moradaao://6F3M576Q+2Q3
 *   https://moradaao.com/c/6F3M576Q+2Q3
 *
 * Also accepts shared text/URLs that just happen to contain a Plus Code
 * (e.g. a WhatsApp message copied to the clipboard).
 */
export function parseDeepLink(url: string | null): string | null {
  if (!url) return null;

  try {
    const parsed = Linking.parse(url);
    const pathParts =
      typeof parsed.path === "string"
        ? parsed.path.split("/").filter(Boolean)
        : [];
    for (const part of pathParts) {
      const decoded = decodeURIComponent(part);
      const code = extractPlusCode(decoded);
      if (code) return code;
    }
    if (parsed.queryParams?.code) {
      const code = extractPlusCode(String(parsed.queryParams.code));
      if (code) return code;
    }
  } catch {}

  return extractPlusCode(url);
}

export function buildDeepLink(code: string): string {
  return `moradaao://code/${encodeURIComponent(code)}`;
}

export function buildWebLink(code: string): string {
  return `https://moradaao.com/c/${encodeURIComponent(code)}`;
}
