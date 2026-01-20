import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  HAS_SEEN_ONBOARDING: "morada_ao_has_seen_onboarding",
  SAVED_ADDRESSES: "morada_ao_saved_addresses",
  LAST_LOCATION: "morada_ao_last_location",
};

export interface SavedAddress {
  id: string;
  fullCode: string;
  shortCode: string;
  reference: string;
  latitude: number;
  longitude: number;
  label?: string;
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
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

export async function saveAddress(address: SavedAddress): Promise<void> {
  try {
    const addresses = await getSavedAddresses();
    const exists = addresses.some((a) => a.id === address.id);
    if (!exists) {
      addresses.unshift(address);
      await AsyncStorage.setItem(KEYS.SAVED_ADDRESSES, JSON.stringify(addresses));
    }
  } catch {
    console.error("Failed to save address");
  }
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
