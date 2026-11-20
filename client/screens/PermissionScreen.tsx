import React from "react";
import { View, StyleSheet, Platform, Linking, Alert, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { track } from "@/lib/analytics";

interface PermissionScreenProps {
  onPermissionGranted: () => void;
}

const NAVY = "#0D1A2A";
const NAVY_2 = "#15283C";
const ORANGE = "#EA5D1E";
const ORANGE_LIGHT = "#FF7A3C";

export default function PermissionScreen({ onPermissionGranted }: PermissionScreenProps) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = Location.useForegroundPermissions();

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    track("location_permission_response", {
      granted: result.granted,
      can_ask_again: result.canAskAgain,
    });
    if (result.granted) onPermissionGranted();
  };

  const handleOpenSettings = async () => {
    try {
      await Linking.openSettings();
    } catch {
      Alert.alert(
        "Não foi possível abrir as definições",
        "Abre as definições do telemóvel e ativa a localização para a Morada AO."
      );
    }
  };

  const isDeniedPermanently = permission?.status === "denied" && !permission?.canAskAgain;
  const showSettings = isDeniedPermanently && Platform.OS !== "web";

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <ThemedText style={styles.wordmark}>
        MORADA<ThemedText style={[styles.wordmark, { color: ORANGE }]}>·</ThemedText>AO
      </ThemedText>

      <Animated.View entering={FadeInUp.delay(150).duration(500)} style={styles.art}>
        <View style={styles.ring3} />
        <View style={styles.ring2} />
        <View style={styles.pinCircle}>
          <Feather name="crosshair" size={40} color="#FFFFFF" />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300).duration(500)}>
        <ThemedText style={styles.title}>
          Falta a tua <ThemedText style={[styles.title, { color: ORANGE_LIGHT }]}>localização</ThemedText>
        </ThemedText>
        <ThemedText style={styles.desc}>
          Sem ela não conseguimos calcular o código do sítio onde estás.
        </ThemedText>

        <View style={styles.list}>
          <Item text="O código é calculado no teu telemóvel." />
          <Item text="Só o nome do bairro é pedido pela internet." />
          <Item text="Podes desligar a qualquer momento nas definições." />
        </View>

        {isDeniedPermanently ? (
          <View style={styles.warn}>
            <Feather name="alert-circle" size={18} color={ORANGE_LIGHT} />
            <ThemedText style={styles.warnText}>
              A localização está bloqueada para a Morada AO. Ativa-a nas definições do telemóvel,
              de preferência como localização exata.
            </ThemedText>
          </View>
        ) : null}
      </Animated.View>

      <View style={{ flex: 1 }} />

      <Pressable
        onPress={showSettings ? handleOpenSettings : handleRequestPermission}
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]}
      >
        <Feather name={showSettings ? "settings" : "crosshair"} size={19} color="#FFFFFF" />
        <ThemedText style={styles.buttonText}>
          {showSettings ? "Abrir definições" : "Permitir localização"}
        </ThemedText>
      </Pressable>
    </View>
  );
}

function Item({ text }: { text: string }) {
  return (
    <View style={styles.item}>
      <View style={styles.itemIcon}>
        <Feather name="check" size={14} color={ORANGE_LIGHT} />
      </View>
      <ThemedText style={styles.itemText}>{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NAVY, paddingHorizontal: 24 },
  wordmark: { fontWeight: "700", fontSize: 13, letterSpacing: 1.8, color: "#FFFFFF" },
  art: {
    height: 220,
    marginTop: 24,
    borderRadius: 24,
    backgroundColor: NAVY_2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  ring3: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  ring2: {
    position: "absolute",
    width: 136,
    height: 136,
    borderRadius: 68,
    borderWidth: 1,
    borderColor: "rgba(255,122,60,0.35)",
  },
  pinCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.6,
    color: "#FFFFFF",
    marginTop: 32,
  },
  desc: { fontSize: 16, lineHeight: 24, color: "rgba(255,255,255,0.75)", marginTop: 12 },
  list: { gap: 12, marginTop: 24 },
  item: { flexDirection: "row", alignItems: "center", gap: 12 },
  itemIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: NAVY_2,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: { flex: 1, fontSize: 15, lineHeight: 21, color: "#FFFFFF" },
  warn: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: NAVY_2,
    borderRadius: 14,
    padding: 14,
    marginTop: 20,
  },
  warnText: { flex: 1, fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.85)" },
  button: {
    height: 56,
    borderRadius: 16,
    backgroundColor: ORANGE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
});
