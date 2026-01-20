import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  Platform,
  Share,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  FadeInUp,
} from "react-native-reanimated";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { MapViewComponent, MapViewRef } from "@/components/MapViewComponent";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors, Shadows, Fonts } from "@/constants/theme";
import { generateMorada, generateShareMessage, MoradaResult } from "@/lib/plusCodes";
import { reverseGeocode, GeocodingResult } from "@/lib/geocoding";
import { setLastLocation } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

const ANGOLA_CENTER: Region = {
  latitude: -8.839988,
  longitude: 13.289437,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

interface MapScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, "Map">;
}

export default function MapScreen({ navigation }: MapScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const mapRef = useRef<MapViewRef>(null);

  const [region, setRegion] = useState<Region>(ANGOLA_CENTER);
  const [morada, setMorada] = useState<MoradaResult | null>(null);
  const [geocoding, setGeocoding] = useState<GeocodingResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const copyScale = useSharedValue(1);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newRegion: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 500);
      await updateMorada(newRegion.latitude, newRegion.longitude);
    } catch (error) {
      console.error("Error getting location:", error);
      await updateMorada(region.latitude, region.longitude);
    }
    setIsLoading(false);
  };

  const updateMorada = async (lat: number, lng: number) => {
    const geo = await reverseGeocode(lat, lng);
    setGeocoding(geo);

    const result = generateMorada(lat, lng, geo.bairro, geo.cidade);
    setMorada(result);

    await setLastLocation({ latitude: lat, longitude: lng });
  };

  const handleRegionChangeComplete = useCallback(async (newRegion: Region) => {
    setRegion(newRegion);
    await updateMorada(newRegion.latitude, newRegion.longitude);
  }, []);

  const handleCenterOnUser = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await getCurrentLocation();
  };

  const handleCopyFullCode = async () => {
    if (!morada) return;

    await Clipboard.setStringAsync(morada.fullCode);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    copyScale.value = withSequence(
      withSpring(1.2, { damping: 15 }),
      withSpring(1, { damping: 15 })
    );

    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!morada) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const message = generateShareMessage(morada);

    try {
      await Share.share({
        message,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const handleSettings = () => {
    navigation.navigate("Settings");
  };

  const copyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: copyScale.value }],
  }));

  const shortCodeDisplay =
    morada?.shortCode && geocoding?.bairro
      ? `${morada.shortCode} ${geocoding.bairro}`
      : morada?.shortCode && geocoding?.cidade
        ? `${morada.shortCode} ${geocoding.cidade}`
        : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <MapViewComponent
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        mapType="standard"
        userInterfaceStyle={isDark ? "dark" : "light"}
      />

      {Platform.OS !== "web" ? (
        <View style={styles.centerPinContainer} pointerEvents="none">
          <View style={[styles.centerPin, { backgroundColor: Colors.light.primary }]}>
            <Feather name="plus" size={16} color="#FFFFFF" />
          </View>
          <View style={[styles.pinShadow, { backgroundColor: Colors.light.primary }]} />
        </View>
      ) : null}

      <Pressable
        style={[
          styles.settingsButton,
          {
            top: insets.top + Spacing.md,
            backgroundColor: theme.backgroundRoot,
          },
          Shadows.fab,
        ]}
        onPress={handleSettings}
        hitSlop={10}
      >
        <Feather name="settings" size={22} color={theme.text} />
      </Pressable>

      {Platform.OS !== "web" ? (
        <Pressable
          style={[
            styles.locationButton,
            {
              top: insets.top + Spacing.md + 56,
              backgroundColor: theme.backgroundRoot,
            },
            Shadows.fab,
          ]}
          onPress={handleCenterOnUser}
          hitSlop={10}
        >
          <Feather name="navigation" size={22} color={Colors.light.primary} />
        </Pressable>
      ) : null}

      <Animated.View
        entering={FadeInUp.delay(300).duration(600)}
        style={[
          styles.bottomSheet,
          {
            backgroundColor: theme.backgroundRoot,
            paddingBottom: insets.bottom + Spacing.xl,
          },
          Shadows.bottomSheet,
        ]}
      >
        <View style={[styles.dragHandle, { backgroundColor: theme.border }]} />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
              A obter localização...
            </ThemedText>
          </View>
        ) : morada ? (
          <View style={styles.contentContainer}>
            <View style={styles.mainSection}>
              <View style={styles.labelRow}>
                <View style={[styles.safeBadge, { backgroundColor: Colors.light.success + "20" }]}>
                  <Feather name="shield" size={12} color={Colors.light.success} />
                  <ThemedText style={[styles.safeBadgeText, { color: Colors.light.success }]}>
                    SEGURA
                  </ThemedText>
                </View>
                <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                  Funciona sempre
                </ThemedText>
              </View>
              
              <View style={styles.codeRow}>
                <ThemedText style={[styles.fullCode, { fontFamily: Fonts?.mono || "monospace" }]}>
                  {morada.fullCode}
                </ThemedText>
                <Animated.View style={copyAnimatedStyle}>
                  <Pressable
                    style={[
                      styles.copyButton,
                      {
                        backgroundColor: isCopied
                          ? Colors.light.success + "20"
                          : theme.backgroundSecondary,
                      },
                    ]}
                    onPress={handleCopyFullCode}
                    hitSlop={10}
                  >
                    <Feather
                      name={isCopied ? "check" : "copy"}
                      size={20}
                      color={isCopied ? Colors.light.success : theme.text}
                    />
                  </Pressable>
                </Animated.View>
              </View>

              <ThemedText style={[styles.educationalText, { color: theme.textMuted }]}>
                A morada segura funciona sempre, mesmo sem nome de rua.
              </ThemedText>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.secondarySection}>
              <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                Morada curta (mais fácil de lembrar)
              </ThemedText>
              {shortCodeDisplay ? (
                <ThemedText style={[styles.shortCode, { fontFamily: Fonts?.mono || "monospace" }]}>
                  {shortCodeDisplay}
                </ThemedText>
              ) : (
                <ThemedText style={[styles.noShortCode, { color: theme.textMuted }]}>
                  Podes adicionar manualmente o nome do bairro ao partilhar.
                </ThemedText>
              )}
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.coordsRow}>
              <Feather name="map-pin" size={12} color={theme.textMuted} />
              <ThemedText style={[styles.coords, { color: theme.textMuted }]}>
                {morada.latitude.toFixed(6)}, {morada.longitude.toFixed(6)}
              </ThemedText>
            </View>
          </View>
        ) : null}
      </Animated.View>

      {morada && Platform.OS !== "web" ? (
        <Pressable
          style={[
            styles.fab,
            {
              bottom: 300 + insets.bottom,
              backgroundColor: Colors.light.primary,
            },
            Shadows.fab,
          ]}
          onPress={handleShare}
        >
          <Feather name="share-2" size={22} color="#FFFFFF" />
          <ThemedText style={styles.fabText}>Partilhar</ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  centerPinContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -16,
    marginTop: -60,
    alignItems: "center",
  },
  centerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  pinShadow: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
    opacity: 0.3,
  },
  settingsButton: {
    position: "absolute",
    right: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  locationButton: {
    position: "absolute",
    right: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
    minHeight: 280,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  loadingText: {
    marginTop: Spacing.md,
  },
  contentContainer: {
    alignItems: "stretch",
  },
  mainSection: {
    marginBottom: Spacing.sm,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  safeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  safeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.3,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  fullCode: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  copyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  educationalText: {
    fontSize: 13,
    lineHeight: 18,
  },
  secondarySection: {
    marginVertical: Spacing.xs,
  },
  shortCode: {
    fontSize: 18,
    fontWeight: "500",
    letterSpacing: 0.5,
    marginTop: Spacing.xs,
  },
  noShortCode: {
    fontSize: 14,
    fontStyle: "italic",
    marginTop: Spacing.xs,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  coordsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  coords: {
    fontSize: 12,
    fontFamily: Platform.select({ ios: "ui-monospace", default: "monospace" }),
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  fabText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
