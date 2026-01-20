import React from "react";
import { View, StyleSheet, Platform, Linking, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

interface PermissionScreenProps {
  onPermissionGranted: () => void;
}

export default function PermissionScreen({ onPermissionGranted }: PermissionScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [permission, requestPermission] = Location.useForegroundPermissions();

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result.granted) {
      onPermissionGranted();
    }
  };

  const handleOpenSettings = async () => {
    if (Platform.OS !== "web") {
      try {
        await Linking.openSettings();
      } catch {
        Alert.alert(
          "Não foi possível abrir as definições",
          "Por favor, abre manualmente as definições do dispositivo."
        );
      }
    }
  };

  const isDeniedPermanently = permission?.status === "denied" && !permission?.canAskAgain;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          paddingTop: insets.top + Spacing["4xl"],
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={styles.content}>
        <Animated.View
          entering={FadeInUp.delay(200).duration(600)}
          style={styles.iconContainer}
        >
          <View style={[styles.iconCircle, { backgroundColor: Colors.light.primary + "15" }]}>
            <Feather name="map-pin" size={48} color={Colors.light.primary} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(600)}>
          <ThemedText type="h1" style={styles.headline}>
            Precisamos da tua localização
          </ThemedText>

          <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
            Para gerar o código da tua morada digital, a app precisa saber onde estás. A tua localização nunca será partilhada sem a tua permissão.
          </ThemedText>
        </Animated.View>

        {isDeniedPermanently ? (
          <Animated.View
            entering={FadeInUp.delay(600).duration(600)}
            style={styles.deniedContainer}
          >
            <View style={[styles.warningBox, { backgroundColor: Colors.light.warning + "15" }]}>
              <Feather name="alert-circle" size={20} color={Colors.light.warning} />
              <ThemedText style={[styles.warningText, { color: theme.text }]}>
                A permissão de localização foi negada. Precisas de a activar nas definições do dispositivo.
              </ThemedText>
            </View>
          </Animated.View>
        ) : null}
      </View>

      <Animated.View
        entering={FadeInUp.delay(600).duration(600)}
        style={styles.footer}
      >
        {isDeniedPermanently && Platform.OS !== "web" ? (
          <Button
            onPress={handleOpenSettings}
            style={[styles.button, { backgroundColor: Colors.light.primary }]}
          >
            Abrir Definições
          </Button>
        ) : (
          <Button
            onPress={handleRequestPermission}
            style={[styles.button, { backgroundColor: Colors.light.primary }]}
          >
            Permitir Localização
          </Button>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: Spacing["3xl"],
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  headline: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  description: {
    textAlign: "center",
    paddingHorizontal: Spacing.md,
  },
  deniedContainer: {
    marginTop: Spacing["2xl"],
    width: "100%",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
  },
  footer: {
    width: "100%",
  },
  button: {
    borderRadius: BorderRadius.md,
  },
});
