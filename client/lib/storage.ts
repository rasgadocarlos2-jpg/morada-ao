import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  HAS_SEEN_ONBOARDING: "morada_ao_has_seen_onboarding_v2",
  SAVED_ADDRESSES: "morada_ao_saved_addresses",
  LAST_LOCATION: "morada_ao_last_location",
};

export type SavedAddressPreset =
  | "home"
  | "work"
  | "family"
  | "friend"
  | "business"
  | "other";

export interface SavedAddress {
  id: string;
  fullCode: string;
  shortCode: string;
  reference: string;
  latitude: number;
  longitude: number;
  label: string;
  preset: SavedAddressPreset;
  createdAt: string;
}

export async function getHasSeenOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(KEYS.HAS_SEEN_ONBOARDING);
    return value === "true";
  } catch {
    return false;
  }
}

export async function setHasSeenOnboarding(value: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.HAS_SEEN_ONBOARDING, value ? "true" : "false");
  } catch {
    console.error("Failed to save onboarding state");
  }
}

export async function getSavedAddresses(): Promise<SavedAddress[]> {
  try {
    const value = await AsyncStorage.getItem(KEYS.SAVED_ADDRESSES);
    if (!value) return [];
    const parsed = JSON.parse(value) as SavedAddress[];
    return parsed.map((a) => ({
      ...a,
      preset: a.preset ?? ("other" as SavedAddressPreset),
      label: a.label || "Morada",
    }));
  } catch {
    return [];
  }
}

export async function saveAddress(
  address: Omit<SavedAddress, "id" | "createdAt"> &
    Partial<Pick<SavedAddress, "id" | "createdAt">>
): Promise<SavedAddress> {
  const addresses = await getSavedAddresses();
  const id = address.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = address.createdAt ?? new Date().toISOString();

  const next: SavedAddress = {
    id,
    createdAt,
    fullCode: address.fullCode,
    shortCode: address.shortCode,
    reference: address.reference,
    latitude: address.latitude,
    longitude: address.longitude,
    label: address.label,
    preset: address.preset,
  };

  const existingIdx = addresses.findIndex(
    (a) => a.id === id || a.fullCode === next.fullCode
  );
  if (existingIdx >= 0) {
    addresses[existingIdx] = { ...addresses[existingIdx], ...next };
  } else {
    addresses.unshift(next);
  }

  await AsyncStorage.setItem(KEYS.SAVED_ADDRESSES, JSON.stringify(addresses));
  return next;
}

export async function deleteAddress(id: string): Promise<void> {
  try {
    const addresses = await getSavedAddresses();
    const filtered = addresses.filter((a) => a.id !== id);
    await AsyncStorage.setItem(KEYS.SAVED_ADDRESSES, JSON.stringify(filtered));
  } catch {
    console.error("Failed to delete address");
  }
}

export async function getAddressByPreset(
  preset: SavedAddressPreset
): Promise<SavedAddress | null> {
  const all = await getSavedAddresses();
  return all.find((a) => a.preset === preset) ?? null;
}

export interface LastLocation {
  latitude: number;
  longitude: number;
}

export async function getLastLocation(): Promise<LastLocation | null> {
  try {
    const value = await AsyncStorage.getItem(KEYS.LAST_LOCATION);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export async function setLastLocation(location: LastLocation): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.LAST_LOCATION, JSON.stringify(location));
  } catch {
    console.error("Failed to save last location");
  }
}
