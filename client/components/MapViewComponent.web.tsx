import React, { forwardRef, useImperativeHandle, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors } from "@/constants/theme";

interface MapViewComponentProps {
  style?: any;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onRegionChangeComplete?: (region: any) => void;
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  showsCompass?: boolean;
  mapType?: string;
  userInterfaceStyle?: "light" | "dark";
  children?: React.ReactNode;
}

export interface MapViewRef {
  animateToRegion: (region: any, duration?: number) => void;
}

export const MapViewComponent = forwardRef<MapViewRef, MapViewComponentProps>(
  ({ style, initialRegion, onRegionChangeComplete }, ref) => {
    const { theme } = useTheme();

    useImperativeHandle(ref, () => ({
      animateToRegion: () => {},
    }));

    useEffect(() => {
      if (initialRegion && onRegionChangeComplete) {
        onRegionChangeComplete(initialRegion);
      }
    }, []);

    return (
      <View style={[style, styles.webFallback, { backgroundColor: theme.backgroundSecondary }]}>
        <View style={styles.webContent}>
          <View style={[styles.iconCircle, { backgroundColor: Colors.light.primary + "15" }]}>
            <Feather name="smartphone" size={48} color={Colors.light.primary} />
          </View>
          <ThemedText type="h3" style={styles.webTitle}>
            Mapa disponível no telemóvel
          </ThemedText>
          <ThemedText style={[styles.webDescription, { color: theme.textSecondary }]}>
            Para usar o mapa interactivo, abre esta app no teu telemóvel através do Expo Go.
          </ThemedText>
          <View style={[styles.instructionBox, { backgroundColor: theme.backgroundTertiary }]}>
            <ThemedText style={[styles.instructionText, { color: theme.textMuted }]}>
              Digitaliza o código QR no menu acima para abrir no Expo Go
            </ThemedText>
          </View>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  webFallback: {
    justifyContent: "center",
    alignItems: "center",
  },
  webContent: {
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
    maxWidth: 400,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
  },
  webTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  webDescription: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  instructionBox: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
  },
  instructionText: {
    textAlign: "center",
    fontSize: 13,
  },
});
