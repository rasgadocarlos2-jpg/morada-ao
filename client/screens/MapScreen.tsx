import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  Platform,
  Share,
  Pressable,
  ActivityIndicator,
  LayoutChangeEvent,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  FadeInUp,
  FadeIn,
} from "react-native-reanimated";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { captureRef } from "react-native-view-shot";

import { ThemedText } from "@/components/ThemedText";
import { MapViewComponent, MapViewRef } from "@/components/MapViewComponent";
import { ShareCard } from "@/components/ShareCard";
import { SaveAddressModal } from "@/components/SaveAddressModal";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors, Shadows, Fonts } from "@/constants/theme";
import {
  generateMorada,
  generateShareMessage,
  MoradaResult,
} from "@/lib/plusCodes";
import { reverseGeocode, GeocodingResult } from "@/lib/geocoding";
import {
  setLastLocation,
  saveAddress,
  getAddressByPreset,
  SavedAddress,
  SavedAddressPreset,
} from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { track, recordError } from "@/lib/analytics";

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

const ACCURACY_WARNING_METERS = 25;

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, "Map">;
  route: RouteProp<RootStackParamList, "Map">;
}

export default function MapScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const mapRef = useRef<MapViewRef>(null);
  const cardRef = useRef<any>(null);

  const [region, setRegion] = useState<Region>(ANGOLA_CENTER);
  const [morada, setMorada] = useState<MoradaResult | null>(null);
  const [geocoding, setGeocoding] = useState<GeocodingResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [savedHome, setSavedHome] = useState<SavedAddress | null>(null);
  const [savedWork, setSavedWork] = useState<SavedAddress | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);

  const copyScale = useSharedValue(1);

  const handleSheetLayout = useCallback((e: LayoutChangeEvent) => {
    setSheetHeight(e.nativeEvent.layout.height);
  }, []);

  const loadShortcuts = useCallback(async () => {
    const [home, work] = await Promise.all([
      getAddressByPreset("home"),
      getAddressByPreset("work"),
    ]);
    setSavedHome(home);
    setSavedWork(work);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadShortcuts();
    }, [loadShortcuts])
  );

  useEffect(() => {
    const focus = route.params?.focus;
    if (focus) {
      navigation.setParams({ focus: undefined } as any);
      goTo(focus.latitude, focus.longitude);
      setIsLoading(false);
    } else {
      getCurrentLocation();
    }
  }, [route.params?.focus]);

  const goTo = useCallback(async (lat: number, lng: number) => {
    const r: Region = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    setRegion(r);
    mapRef.current?.animateToRegion(r, 500);
    await updateMorada(lat, lng);
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setAccuracy(location.coords.accuracy ?? null);
      await goTo(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      recordError(error, "getCurrentLocation");
      await updateMorada(region.latitude, region.longitude);
    }
    setIsLoading(false);
  }, [goTo]);

  const updateMorada = async (lat: number, lng: number) => {
    const geo = await reverseGeocode(lat, lng);
    setGeocoding(geo);
    const result = generateMorada(lat, lng, geo.municipio, geo.cidade || geo.bairro);
    setMorada(result);
    await setLastLocation({ latitude: lat, longitude: lng });
  };

  const handleRegionChangeComplete = useCallback(async (newRegion: Region) => {
    setRegion(newRegion);
    await updateMorada(newRegion.latitude, newRegion.longitude);
  }, []);

  const handleCenterOnUser = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    track("recenter_pressed");
    setIsLocating(true);
    try {
      await getCurrentLocation();
    } finally {
      setIsLocating(false);
    }
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
    track("code_copied", { code_type: "full", has_short: !!morada.shortCode });
  };

  const handleShareText = async () => {
    if (!morada) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await Share.share({
        message: generateShareMessage(morada),
      });
      track("code_shared", {
        kind: "text",
        has_short: !!morada.shortCode,
        action: (result as any).action ?? "unknown",
      });
    } catch (error) {
      recordError(error, "share-text");
    }
  };

  const handleShareImage = async () => {
    if (!morada || !cardRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSharing(true);
    try {
      const uri = await captureRef(cardRef.current, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Partilhar morada",
          UTI: "public.png",
        });
      } else {
        await Share.share({ url: uri } as any);
      }
      track("code_shared", { kind: "image", has_short: !!morada.shortCode });
    } catch (error) {
      recordError(error, "share-image");
    } finally {
      setIsSharing(false);
    }
  };

  const openShareMenu = () => {
    if (!morada) return;
    Alert.alert("Partilhar morada", "Escolhe o formato", [
      { text: "Como texto", onPress: handleShareText },
      { text: "Como cartão (imagem)", onPress: handleShareImage },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const handleOpenShortcut = async (addr: SavedAddress | null, preset: SavedAddressPreset) => {
    if (!addr) {
      setSaveOpen(true);
      return;
    }
    Haptics.selectionAsync();
    track("shortcut_opened", { preset });
    await goTo(addr.latitude, addr.longitude);
  };

  const handleSave = async ({
    preset,
    label,
  }: {
    preset: SavedAddressPreset;
    label: string;
  }) => {
    if (!morada) return;
    await saveAddress({
      preset,
      label,
      fullCode: morada.fullCode,
      shortCode: morada.shortCode,
      reference: morada.reference,
      latitude: morada.latitude,
      longitude: morada.longitude,
    });
    track("address_saved", { preset });
    setSaveOpen(false);
    loadShortcuts();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  };

  const copyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: copyScale.value }],
  }));

  const shortCodeDisplay =
    morada?.shortCode && morada.reference
      ? `${morada.shortCode} ${morada.reference}`
      : null;

  const showAccuracyWarning =
    accuracy !== null && accuracy > ACCURACY_WARNING_METERS;

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
        <View style={styles.centerPinOverlay} pointerEvents="none">
          <View style={styles.centerPinWrapper}>
            <View style={[styles.pinRing, { borderColor: theme.primary }]} />
            <View style={[styles.pinDot, { backgroundColor: theme.primary }]} />
          </View>
        </View>
      ) : null}

      {/* Top-right buttons */}
      <View style={[styles.topRight, { top: insets.top + Spacing.md }]}>
        <TopButton
          icon="search"
          onPress={() => {
            track("search_screen_opened");
            navigation.navigate("Search");
          }}
          theme={theme}
        />
        <TopButton
          icon="bookmark"
          onPress={() => navigation.navigate("Favorites")}
          theme={theme}
        />
        <TopButton
          icon="settings"
          onPress={() => {
            track("settings_opened");
            navigation.navigate("Settings");
          }}
          theme={theme}
        />
      </View>

      {/* Location button, bottom-left of controls */}
      {Platform.OS !== "web" ? (
        <Pressable
          style={[
            styles.locationButton,
            {
              top: insets.top + Spacing.md + 3 * (44 + Spacing.sm),
              backgroundColor: theme.backgroundRoot,
            },
            Shadows.fab,
          ]}
          onPress={handleCenterOnUser}
          hitSlop={10}
          disabled={isLocating}
        >
          {isLocating ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Feather name="navigation" size={22} color={theme.primary} />
          )}
        </Pressable>
      ) : null}

      {/* Accuracy warning */}
      {showAccuracyWarning ? (
        <Animated.View
          entering={FadeIn}
          style={[
            styles.accuracyBanner,
            { top: insets.top + Spacing.md, backgroundColor: theme.warningSoft },
          ]}
        >
          <Feather name="alert-triangle" size={14} color={Colors.light.warning} />
          <ThemedText style={[styles.accuracyText, { color: theme.text }]}>
            GPS impreciso (±{Math.round(accuracy!)}m) — vai para fora para melhorar
          </ThemedText>
        </Animated.View>
      ) : null}

      {/* Casa/Trabalho shortcut chips */}
      {sheetHeight > 0 ? (
        <View
          style={[
            styles.chipsRow,
            { bottom: sheetHeight + 40 },
          ]}
          pointerEvents="box-none"
        >
          <ShortcutChip
            icon="home"
            label={savedHome ? savedHome.label : "Casa"}
            filled={!!savedHome}
            onPress={() => handleOpenShortcut(savedHome, "home")}
            theme={theme}
          />
          <ShortcutChip
            icon="briefcase"
            label={savedWork ? savedWork.label : "Trabalho"}
            filled={!!savedWork}
            onPress={() => handleOpenShortcut(savedWork, "work")}
            theme={theme}
          />
        </View>
      ) : null}

      {/* Bottom sheet */}
      <Animated.View
        entering={FadeInUp.delay(300).duration(600)}
        onLayout={handleSheetLayout}
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
            <ActivityIndicator size="large" color={theme.primary} />
            <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
              A obter localização...
            </ThemedText>
          </View>
        ) : morada ? (
          <View style={styles.contentContainer}>
            <View style={styles.mainSection}>
              <Pressable onPress={handleCopyFullCode} style={styles.codeRow}>
                <ThemedText
                  style={[styles.fullCode, { fontFamily: (Fonts as any)?.mono || "monospace" }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {shortCodeDisplay ?? morada.fullCode}
                </ThemedText>
                <Animated.View style={copyAnimatedStyle}>
                  <View
                    style={[
                      styles.copyButton,
                      {
                        backgroundColor: isCopied
                          ? theme.successSoft
                          : theme.backgroundSecondary,
                      },
                    ]}
                  >
                    <Feather
                      name={isCopied ? "check" : "copy"}
                      size={20}
                      color={isCopied ? Colors.light.success : theme.text}
                    />
                  </View>
                </Animated.View>
              </Pressable>

              {shortCodeDisplay ? (
                <View style={[styles.labelRow, styles.fullCodeRow]}>
                  <ThemedText
                    style={[
                      styles.shortCode,
                      {
                        color: theme.textSecondary,
                        fontFamily: (Fonts as any)?.mono || "monospace",
                      },
                    ]}
                  >
                    {morada.fullCode}
                  </ThemedText>
                  <View
                    style={[
                      styles.safeBadge,
                      { backgroundColor: theme.successSoft },
                    ]}
                  >
                    <Feather name="shield" size={12} color={Colors.light.success} />
                    <ThemedText
                      style={[styles.safeBadgeText, { color: Colors.light.success }]}
                    >
                      FUNCIONA SEMPRE
                    </ThemedText>
                  </View>
                </View>
              ) : (
                <ThemedText style={[styles.hintText, { color: theme.textMuted }]}>
                  Adiciona o nome do bairro ao partilhar.
                </ThemedText>
              )}
            </View>

            <View style={styles.actionsRow}>
              <ActionButton
                icon="bookmark"
                label="Guardar"
                onPress={() => setSaveOpen(true)}
                theme={theme}
              />
              <ActionButton
                icon="search"
                label="Procurar"
                onPress={() => navigation.navigate("Search")}
                theme={theme}
              />
            </View>
          </View>
        ) : null}
      </Animated.View>

      {/* Share FAB */}
      {morada && Platform.OS !== "web" && sheetHeight > 0 ? (
        <Pressable
          style={[
            styles.fab,
            {
              bottom: sheetHeight - 22,
              backgroundColor: theme.primary,
            },
            Shadows.fab,
          ]}
          onPress={openShareMenu}
          onLongPress={handleShareImage}
          disabled={isSharing}
        >
          {isSharing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Feather name="share-2" size={20} color="#FFFFFF" />
          )}
          <ThemedText style={styles.fabText}>Partilhar</ThemedText>
        </Pressable>
      ) : null}

      {/* Off-screen share card for capture */}
      {morada ? (
        <View style={styles.offscreen} pointerEvents="none">
          <ShareCard
            ref={cardRef}
            fullCode={morada.fullCode}
            shortCode={morada.shortCode}
            reference={morada.reference}
          />
        </View>
      ) : null}

      <SaveAddressModal
        visible={saveOpen}
        onClose={() => setSaveOpen(false)}
        onSave={handleSave}
      />
    </View>
  );
}

function TopButton({
  icon,
  onPress,
  theme,
}: {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  theme: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={[
        styles.topButton,
        { backgroundColor: theme.backgroundRoot },
        Shadows.fab,
      ]}
    >
      <Feather name={icon} size={20} color={theme.text} />
    </Pressable>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  theme,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  theme: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionBtn,
        {
          backgroundColor: pressed
            ? theme.backgroundTertiary
            : theme.backgroundSecondary,
        },
      ]}
    >
      <Feather name={icon} size={16} color={theme.text} />
      <ThemedText style={[styles.actionText, { color: theme.text }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function ShortcutChip({
  icon,
  label,
  filled,
  onPress,
  theme,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  filled: boolean;
  onPress: () => void;
  theme: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        Shadows.fab,
        {
          backgroundColor: filled ? theme.primary : theme.backgroundRoot,
        },
      ]}
    >
      <Feather
        name={icon}
        size={14}
        color={filled ? "#FFFFFF" : theme.primary}
      />
      <ThemedText
        style={[
          styles.chipText,
          { color: filled ? "#FFFFFF" : theme.text },
        ]}
      >
        {label}
      </ThemedText>
      {!filled ? (
        <Feather name="plus" size={12} color={theme.textMuted} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  centerPinOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  centerPinWrapper: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  pinRing: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    opacity: 0.35,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },

  topRight: {
    position: "absolute",
    right: Spacing.lg,
    gap: Spacing.sm,
  },
  topButton: {
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

  accuracyBanner: {
    position: "absolute",
    left: Spacing.lg,
    right: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
  },
  accuracyText: {
    fontSize: 12,
    flex: 1,
  },

  chipsRow: {
    position: "absolute",
    left: Spacing.lg,
    flexDirection: "row",
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
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
    minHeight: 260,
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
    gap: Spacing.md,
  },
  mainSection: {},
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  safeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  fullCode: {
    flex: 1,
    marginRight: Spacing.md,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  fullCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: 0,
  },
  copyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  shortCode: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  hintText: {
    fontSize: 13,
    fontStyle: "italic",
  },

  actionsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
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

  offscreen: {
    position: "absolute",
    left: -9999,
    top: -9999,
    opacity: 0,
  },
});
