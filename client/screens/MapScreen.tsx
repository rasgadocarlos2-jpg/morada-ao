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
  Linking,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import { Feather } from "@expo/vector-icons";
import Svg, { Path, Circle } from "react-native-svg";
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { captureRef } from "react-native-view-shot";

import { ThemedText } from "@/components/ThemedText";
import { MapViewComponent, MapViewRef } from "@/components/MapViewComponent";
import { ShareCard } from "@/components/ShareCard";
import { SaveAddressModal } from "@/components/SaveAddressModal";
import { useTheme } from "@/hooks/useTheme";
import { Fonts } from "@/constants/theme";
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
  getRecents,
  addRecent,
  RecentAddress,
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

// Paleta da marca (o cartão é sempre azul-escuro, em modo claro ou escuro).
const NAVY = "#0D1A2A";
const NAVY_2 = "#15283C";
const ORANGE = "#EA5D1E";
const ORANGE_LIGHT = "#FF7A3C";
const WHITE_60 = "rgba(255,255,255,0.62)";
const WHITE_75 = "rgba(255,255,255,0.75)";
const MONO = (Fonts as any)?.mono || "monospace";

// Precisão: para de procurar quando chega a este valor ou ao fim do tempo.
const GOOD_ACCURACY_METERS = 10;
const GPS_WATCH_MS = 15000;

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, "Map">;
  route: RouteProp<RootStackParamList, "Map">;
}

export default function MapScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const mapRef = useRef<MapViewRef>(null);
  const cardRef = useRef<any>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const watchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const programmatic = useRef(false);
  const gpsFix = useRef<{ latitude: number; longitude: number } | null>(null);

  const [region, setRegion] = useState<Region>(ANGOLA_CENTER);
  const [morada, setMorada] = useState<MoradaResult | null>(null);
  const [geocoding, setGeocoding] = useState<GeocodingResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const [pinMoved, setPinMoved] = useState(false);
  const [approximate, setApproximate] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [recents, setRecents] = useState<RecentAddress[]>([]);
  const [savedHome, setSavedHome] = useState<SavedAddress | null>(null);
  const [savedWork, setSavedWork] = useState<SavedAddress | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);

  const handleSheetLayout = useCallback((e: LayoutChangeEvent) => {
    setSheetHeight(e.nativeEvent.layout.height);
  }, []);

  const loadLists = useCallback(async () => {
    const [home, work, rec] = await Promise.all([
      getAddressByPreset("home"),
      getAddressByPreset("work"),
      getRecents(),
    ]);
    setSavedHome(home);
    setSavedWork(work);
    setRecents(rec);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLists();
      checkApproximate();
    }, [loadLists])
  );

  useEffect(() => {
    const focus = route.params?.focus;
    if (focus) {
      navigation.setParams({ focus: undefined } as any);
      stopWatch();
      setPinMoved(true);
      goTo(focus.latitude, focus.longitude);
      setIsLoading(false);
    } else {
      startGps();
    }
  }, [route.params?.focus]);

  useEffect(() => () => stopWatch(), []);

  // Android "aproximada" / iOS "reduzida": o código pode falhar centenas de metros.
  const checkApproximate = async () => {
    try {
      const p: any = await Location.getForegroundPermissionsAsync();
      const coarse =
        p?.android?.accuracy === "coarse" || p?.ios?.accuracy === "reduced";
      setApproximate(!!coarse);
    } catch {}
  };

  const stopWatch = () => {
    watchRef.current?.remove();
    watchRef.current = null;
    if (watchTimer.current) clearTimeout(watchTimer.current);
    watchTimer.current = null;
    setIsImproving(false);
  };

  const goTo = useCallback(async (lat: number, lng: number) => {
    const r: Region = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.004,
      longitudeDelta: 0.004,
    };
    programmatic.current = true;
    setRegion(r);
    mapRef.current?.animateToRegion(r, 500);
    await updateMorada(lat, lng);
  }, []);

  // Fica a ouvir o GPS e guarda a melhor leitura, até chegar a ±10 m ou passar 15 s.
  const startGps = useCallback(async () => {
    stopWatch();
    setPinMoved(false);
    let best = Infinity;
    try {
      const first = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      best = first.coords.accuracy ?? Infinity;
      setAccuracy(first.coords.accuracy ?? null);
      gpsFix.current = first.coords;
      await goTo(first.coords.latitude, first.coords.longitude);
    } catch (error) {
      recordError(error, "getCurrentLocation");
      await updateMorada(ANGOLA_CENTER.latitude, ANGOLA_CENTER.longitude);
    }
    setIsLoading(false);
    if (best <= GOOD_ACCURACY_METERS || Platform.OS === "web") return;

    try {
      setIsImproving(true);
      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 0,
        },
        (loc) => {
          const acc = loc.coords.accuracy ?? Infinity;
          if (acc >= best) return;
          best = acc;
          setAccuracy(acc);
          gpsFix.current = loc.coords;
          goTo(loc.coords.latitude, loc.coords.longitude);
          if (acc <= GOOD_ACCURACY_METERS) stopWatch();
        }
      );
      watchTimer.current = setTimeout(stopWatch, GPS_WATCH_MS);
    } catch (error) {
      recordError(error, "watchPosition");
      setIsImproving(false);
    }
  }, [goTo]);

  const updateMorada = async (lat: number, lng: number) => {
    const geo = await reverseGeocode(lat, lng);
    setGeocoding(geo);
    setMorada(generateMorada(lat, lng, geo.municipio, geo.cidade || geo.bairro));
    await setLastLocation({ latitude: lat, longitude: lng });
  };

  const handleRegionChangeComplete = useCallback(async (newRegion: Region) => {
    setRegion(newRegion);
    if (programmatic.current) {
      programmatic.current = false;
    } else {
      // Foi a pessoa que arrastou o mapa: o pin passa a ser o dela.
      stopWatch();
      setPinMoved(true);
    }
    await updateMorada(newRegion.latitude, newRegion.longitude);
  }, []);

  const handleBackToGps = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    track("recenter_pressed");
    startGps();
  };

  const handleCopyFullCode = async () => {
    if (!morada) return;
    await Clipboard.setStringAsync(morada.fullCode);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    track("code_copied", { code_type: "full", has_short: !!morada.shortCode });
  };

  const rememberShared = async () => {
    if (!morada) return;
    await addRecent({
      fullCode: morada.fullCode,
      shortCode: morada.shortCode,
      reference: morada.reference,
      bairro: geocoding?.bairro ?? null,
      kind: "partilhado",
      latitude: morada.latitude,
      longitude: morada.longitude,
    });
    setRecents(await getRecents());
  };

  const handleShareText = async () => {
    if (!morada) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await Share.share({ message: generateShareMessage(morada) });
      track("code_shared", {
        kind: "text",
        has_short: !!morada.shortCode,
        action: (result as any).action ?? "unknown",
      });
      if ((result as any).action !== Share.dismissedAction) rememberShared();
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
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Partilhar morada",
          UTI: "public.png",
        });
      } else {
        await Share.share({ url: uri } as any);
      }
      track("code_shared", { kind: "image", has_short: !!morada.shortCode });
      rememberShared();
    } catch (error) {
      recordError(error, "share-image");
    } finally {
      setIsSharing(false);
    }
  };

  const openShareMenu = () => {
    if (!morada) return;
    if (Platform.OS === "web") return handleShareText();
    Alert.alert("Partilhar morada", "Escolhe o formato", [
      { text: "Como texto", onPress: handleShareText },
      { text: "Como cartão (imagem)", onPress: handleShareImage },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const handleOpenMaps = () => {
    if (!morada) return;
    track("open_in_maps", { from: "map" });
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(morada.fullCode)}`
    );
  };

  const handleOpenShortcut = async (addr: SavedAddress | null, preset: SavedAddressPreset) => {
    if (!addr) {
      setSaveOpen(true);
      return;
    }
    Haptics.selectionAsync();
    track("shortcut_opened", { preset });
    stopWatch();
    setPinMoved(true);
    setExpanded(false);
    await goTo(addr.latitude, addr.longitude);
  };

  const handleOpenRecent = async (r: RecentAddress) => {
    Haptics.selectionAsync();
    track("recent_opened", { kind: r.kind });
    stopWatch();
    setPinMoved(true);
    setExpanded(false);
    await goTo(r.latitude, r.longitude);
  };

  const handleSave = async ({ preset, label }: { preset: SavedAddressPreset; label: string }) => {
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
    loadLists();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  };

  const shortLabel =
    morada?.shortCode && morada.reference
      ? { code: morada.shortCode.replace(/^\+/, ""), ref: morada.reference }
      : null;

  const addressWords = [geocoding?.bairro, geocoding?.municipio, geocoding?.provincia]
    .filter((v, i, a): v is string => !!v && a.indexOf(v) === i)
    .join(" · ");

  const accuracyLabel = pinMoved
    ? "Ajustado à mão"
    : accuracy !== null
      ? `GPS ±${Math.round(accuracy)} m${isImproving ? " · a melhorar" : ""}`
      : "GPS";
  const accuracyBad = !pinMoved && accuracy !== null && accuracy > 25;

  // O mapa ocupa só a zona acima do cartão, para o pin ficar visível.
  const mapBottom = sheetHeight > 0 ? sheetHeight - 28 : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.mapArea, { bottom: mapBottom }]}>
        <MapViewComponent
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={region}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          mapType="standard"
          userInterfaceStyle={isDark ? "dark" : "light"}
        />

        {/* Pin com a etiqueta do código */}
        <View style={styles.pinOverlay} pointerEvents="none">
          <View style={styles.pinStack}>
            {shortLabel ? (
              <View style={styles.pinLabel}>
                <ThemedText style={styles.pinLabelText}>
                  <ThemedText style={[styles.pinLabelText, { color: ORANGE_LIGHT }]}>+</ThemedText>
                  {shortLabel.code} {shortLabel.ref}
                </ThemedText>
              </View>
            ) : null}
            <Svg width={36} height={46} viewBox="0 0 32 40">
              <Path
                d="M16 1C8 1 2 7 2 15c0 10 14 24 14 24s14-14 14-24C30 7 24 1 16 1z"
                fill={ORANGE}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
              <Circle cx={16} cy={15} r={5} fill="#FFFFFF" />
            </Svg>
            <View style={styles.pinShadow} />
          </View>
        </View>

        {/* Atalhos Casa / Trabalho */}
        <View style={styles.chipsRow} pointerEvents="box-none">
          <ShortcutChip
            icon="home"
            label={savedHome ? savedHome.label : "Casa"}
            filled={!!savedHome}
            onPress={() => handleOpenShortcut(savedHome, "home")}
          />
          <ShortcutChip
            icon="briefcase"
            label={savedWork ? savedWork.label : "Trabalho"}
            filled={!!savedWork}
            onPress={() => handleOpenShortcut(savedWork, "work")}
          />
        </View>

        {/* Voltar ao GPS (aparece quando o pin foi mexido) */}
        {pinMoved && Platform.OS !== "web" ? (
          <Animated.View entering={FadeIn} style={styles.backGpsWrap}>
            <Pressable style={styles.backGps} onPress={handleBackToGps} hitSlop={8}>
              <Feather name="navigation" size={15} color={ORANGE} />
              <ThemedText style={styles.backGpsText}>Voltar ao GPS</ThemedText>
            </Pressable>
          </Animated.View>
        ) : null}
      </View>

      {/* Barra de topo */}
      <View style={[styles.topBar, { top: insets.top + 12 }]} pointerEvents="box-none">
        <View style={[styles.wordmark, styles.floatShadow]}>
          <ThemedText style={styles.wordmarkText}>
            MORADA<ThemedText style={[styles.wordmarkText, { color: ORANGE }]}>·</ThemedText>AO
          </ThemedText>
        </View>
        <View style={styles.topButtons}>
          <TopButton
            icon="search"
            label="Procurar código"
            onPress={() => {
              track("search_screen_opened");
              navigation.navigate("Search");
            }}
          />
          <TopButton
            icon="bookmark"
            label="Minhas moradas"
            onPress={() => navigation.navigate("Favorites")}
          />
          <TopButton
            icon="settings"
            label="Definições"
            onPress={() => {
              track("settings_opened");
              navigation.navigate("Settings");
            }}
          />
        </View>
      </View>

      {/* Aviso de localização aproximada ou GPS fraco */}
      {approximate || (accuracyBad && !isImproving) ? (
        <Animated.View
          entering={FadeIn}
          style={[styles.banner, styles.floatShadow, { top: insets.top + 70 }]}
        >
          <Feather name="alert-triangle" size={15} color={ORANGE} />
          <ThemedText style={styles.bannerText}>
            {approximate
              ? "A localização está em modo aproximado. Ativa a localização exata."
              : `GPS fraco (±${Math.round(accuracy!)} m). Vai para um sítio aberto ou ajusta o pin no mapa.`}
          </ThemedText>
          {approximate ? (
            <Pressable onPress={() => Linking.openSettings()} hitSlop={8}>
              <ThemedText style={styles.bannerAction}>Ativar</ThemedText>
            </Pressable>
          ) : null}
        </Animated.View>
      ) : null}

      {/* Cartão da morada */}
      <Animated.View
        entering={FadeInUp.delay(200).duration(500)}
        onLayout={handleSheetLayout}
        style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}
      >
        <Pressable
          onPress={() => setExpanded((e) => !e)}
          hitSlop={12}
          style={styles.handleHit}
          accessibilityLabel={expanded ? "Fechar lista" : "Ver guardadas e recentes"}
        >
          <View style={styles.handle} />
        </Pressable>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={ORANGE_LIGHT} />
            <ThemedText style={styles.loadingText}>A obter localização...</ThemedText>
          </View>
        ) : morada && expanded ? (
          <ExpandedLists
            morada={morada}
            shortLabel={shortLabel}
            city={geocoding?.provincia || geocoding?.cidade}
            savedHome={savedHome}
            savedWork={savedWork}
            recents={recents}
            onShortcut={handleOpenShortcut}
            onNew={() => setSaveOpen(true)}
            onRecent={handleOpenRecent}
            onClose={() => setExpanded(false)}
          />
        ) : morada ? (
          <View>
            <View style={styles.rowBetween}>
              <ThemedText style={styles.eyebrow}>A TUA MORADA</ThemedText>
              <View style={styles.gpsChip}>
                {isImproving ? (
                  <ActivityIndicator size="small" color={ORANGE_LIGHT} style={{ transform: [{ scale: 0.6 }] }} />
                ) : (
                  <View style={[styles.gpsDot, accuracyBad && { backgroundColor: "#F2B33D" }]} />
                )}
                <ThemedText style={styles.gpsText}>{accuracyLabel}</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.bigCode} numberOfLines={1} adjustsFontSizeToFit>
              {shortLabel ? (
                <>
                  <ThemedText style={[styles.bigCode, { color: ORANGE_LIGHT }]}>+</ThemedText>
                  {shortLabel.code} {shortLabel.ref}
                </>
              ) : (
                morada.fullCode
              )}
            </ThemedText>
            {addressWords ? (
              <ThemedText style={styles.words} numberOfLines={1}>
                {addressWords}
              </ThemedText>
            ) : null}

            <Pressable onPress={handleCopyFullCode} style={styles.fullBox}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.fullLabel} numberOfLines={1}>
                  CÓDIGO COMPLETO · FUNCIONA SEMPRE
                </ThemedText>
                <ThemedText style={styles.fullCode}>{morada.fullCode}</ThemedText>
              </View>
              <View style={[styles.copyBtn, isCopied && { backgroundColor: "rgba(29,125,86,0.35)" }]}>
                <Feather name={isCopied ? "check" : "copy"} size={18} color="#FFFFFF" />
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.9 }]}
              onPress={openShareMenu}
              onLongPress={handleShareImage}
              disabled={isSharing}
            >
              {isSharing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Feather name="share-2" size={19} color="#FFFFFF" />
              )}
              <ThemedText style={styles.shareText}>Partilhar morada</ThemedText>
            </Pressable>

            <View style={styles.tiles}>
              <Tile icon="bookmark" label="Guardar" onPress={() => setSaveOpen(true)} />
              <Tile icon="search" label="Procurar" onPress={() => navigation.navigate("Search")} />
              <Tile icon="map" label="Abrir no Maps" onPress={handleOpenMaps} />
            </View>
          </View>
        ) : null}
      </Animated.View>

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

function timeAgo(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return h === 1 ? "há 1 hora" : `há ${h} horas`;
  const d = Math.floor(h / 24);
  if (d === 1) return "ontem";
  if (d < 7) return `há ${d} dias`;
  const w = Math.floor(d / 7);
  return w === 1 ? "há 1 semana" : `há ${w} semanas`;
}

function ExpandedLists({
  morada,
  shortLabel,
  city,
  savedHome,
  savedWork,
  recents,
  onShortcut,
  onNew,
  onRecent,
  onClose,
}: {
  morada: MoradaResult;
  shortLabel: { code: string; ref: string } | null;
  city?: string | null;
  savedHome: SavedAddress | null;
  savedWork: SavedAddress | null;
  recents: RecentAddress[];
  onShortcut: (a: SavedAddress | null, p: SavedAddressPreset) => void;
  onNew: () => void;
  onRecent: (r: RecentAddress) => void;
  onClose: () => void;
}) {
  return (
    <View>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.midCode} numberOfLines={1}>
            {shortLabel ? (
              <>
                <ThemedText style={[styles.midCode, { color: ORANGE_LIGHT }]}>+</ThemedText>
                {shortLabel.code} {shortLabel.ref}
              </>
            ) : (
              morada.fullCode
            )}
          </ThemedText>
          <ThemedText style={styles.midSub} numberOfLines={1}>
            {morada.fullCode}
            {city ? ` · ${city}` : ""}
          </ThemedText>
        </View>
        <Pressable onPress={onClose} style={styles.copyBtn} accessibilityLabel="Fechar">
          <Feather name="chevron-down" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      <ThemedText style={[styles.eyebrow, { marginTop: 20 }]}>GUARDADAS</ThemedText>
      <View style={styles.savedRow}>
        <SavedPill icon="home" label={savedHome?.label ?? "Casa"} empty={!savedHome} onPress={() => onShortcut(savedHome, "home")} />
        <SavedPill icon="briefcase" label={savedWork?.label ?? "Trabalho"} empty={!savedWork} onPress={() => onShortcut(savedWork, "work")} />
        <SavedPill icon="plus" label="Nova" empty onPress={onNew} />
      </View>

      <ThemedText style={[styles.eyebrow, { marginTop: 20 }]}>RECENTES</ThemedText>
      {recents.length === 0 ? (
        <ThemedText style={styles.emptyText}>
          As moradas que partilhares ou procurares aparecem aqui.
        </ThemedText>
      ) : (
        <ScrollView style={{ maxHeight: 230 }} showsVerticalScrollIndicator={false}>
          {recents.map((r) => (
            <Pressable key={r.fullCode} style={styles.recentRow} onPress={() => onRecent(r)}>
              <View style={styles.recentIcon}>
                <Feather name={r.kind === "procurado" ? "search" : "share-2"} size={16} color={WHITE_75} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.recentCode} numberOfLines={1}>
                  {r.shortCode && r.reference ? `${r.shortCode} ${r.reference}` : r.fullCode}
                </ThemedText>
                <ThemedText style={styles.recentMeta}>
                  {r.kind === "procurado" ? "Procurado" : "Partilhado"} · {timeAgo(r.at)}
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={18} color={WHITE_60} />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function SavedPill({
  icon,
  label,
  empty,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  empty: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.savedPill, empty && styles.savedPillEmpty]}>
      <Feather name={icon} size={14} color={empty ? WHITE_60 : ORANGE_LIGHT} />
      <ThemedText style={[styles.savedPillText, empty && { color: WHITE_60 }]} numberOfLines={1}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function TopButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityLabel={label}
      style={[styles.topButton, styles.floatShadow]}
    >
      <Feather name={icon} size={19} color={NAVY} />
    </Pressable>
  );
}

function Tile({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && { backgroundColor: "#1C3249" }]}
    >
      <Feather name={icon} size={18} color="#FFFFFF" />
      <ThemedText style={styles.tileText}>{label}</ThemedText>
    </Pressable>
  );
}

function ShortcutChip({
  icon,
  label,
  filled,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  filled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, filled ? [styles.chipFilled, styles.floatShadow] : styles.chipEmpty]}
    >
      <Feather name={filled ? icon : "plus"} size={14} color={filled ? ORANGE : "#4A5A6E"} />
      <ThemedText style={[styles.chipText, !filled && { color: "#4A5A6E" }]}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapArea: { position: "absolute", top: 0, left: 0, right: 0 },
  floatShadow: {
    shadowColor: NAVY,
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  pinOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  // A ponta do pin fica no centro do mapa: sobe a pilha metade da sua altura.
  pinStack: { alignItems: "center", gap: 6, marginBottom: 82 },
  pinLabel: {
    backgroundColor: NAVY,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    shadowColor: NAVY,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  pinLabelText: { fontFamily: MONO, fontWeight: "700", fontSize: 14, color: "#FFFFFF" },
  pinShadow: {
    width: 22,
    height: 8,
    borderRadius: 11,
    backgroundColor: "rgba(13,26,42,0.25)",
    marginTop: -10,
  },

  topBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wordmark: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  wordmarkText: { fontWeight: "700", fontSize: 13, letterSpacing: 1.8, color: NAVY },
  topButtons: { flexDirection: "row", gap: 8 },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  banner: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bannerText: { flex: 1, fontSize: 13, lineHeight: 18, color: NAVY },
  bannerAction: { fontSize: 14, fontWeight: "700", color: ORANGE },

  chipsRow: {
    position: "absolute",
    left: 16,
    bottom: 44,
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    height: 40,
    borderRadius: 999,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chipFilled: { backgroundColor: "#FFFFFF" },
  chipEmpty: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#4A5A6E",
  },
  chipText: { fontSize: 14, fontWeight: "600", color: NAVY },

  backGpsWrap: { position: "absolute", right: 16, bottom: 44 },
  backGps: {
    height: 40,
    borderRadius: 999,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    shadowColor: NAVY,
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  backGpsText: { fontSize: 14, fontWeight: "600", color: NAVY },

  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: NAVY,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 4,
    paddingHorizontal: 20,
    minHeight: 280,
  },
  handleHit: { alignSelf: "center", paddingVertical: 8, paddingHorizontal: 24 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.25)" },
  loading: { alignItems: "center", paddingVertical: 56 },
  loadingText: { marginTop: 12, color: WHITE_75 },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 12,
  },
  eyebrow: { fontFamily: MONO, fontSize: 11, letterSpacing: 2, color: WHITE_60 },
  gpsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    paddingHorizontal: 10,
    height: 26,
  },
  gpsDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ORANGE_LIGHT },
  gpsText: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.8)" },

  bigCode: {
    fontFamily: MONO,
    fontWeight: "700",
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: 0.5,
    color: "#FFFFFF",
    marginTop: 10,
  },
  words: { fontSize: 15, color: WHITE_75, marginTop: 4 },

  fullBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: NAVY_2,
    borderRadius: 14,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 12,
    marginTop: 18,
  },
  fullLabel: { fontFamily: MONO, fontSize: 10, letterSpacing: 1.6, color: "rgba(255,255,255,0.6)" },
  fullCode: { fontFamily: MONO, fontWeight: "700", fontSize: 18, color: "#FFFFFF", marginTop: 4 },
  copyBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  shareBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: ORANGE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 16,
  },
  shareText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },

  tiles: { flexDirection: "row", gap: 10, marginTop: 12 },
  tile: {
    flex: 1,
    height: 64,
    borderRadius: 14,
    backgroundColor: NAVY_2,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  tileText: { fontSize: 12, fontWeight: "600", color: "#FFFFFF" },

  midCode: { fontFamily: MONO, fontWeight: "700", fontSize: 22, color: "#FFFFFF" },
  midSub: { fontFamily: MONO, fontSize: 12, color: WHITE_60, marginTop: 2 },
  savedRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  savedPill: {
    flexShrink: 1,
    height: 40,
    borderRadius: 999,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: NAVY_2,
  },
  savedPillEmpty: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.3)",
  },
  savedPillText: { fontSize: 14, fontWeight: "600", color: "#FFFFFF" },
  emptyText: { fontSize: 14, lineHeight: 20, color: WHITE_60, marginTop: 10, marginBottom: 8 },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  recentIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: NAVY_2,
    alignItems: "center",
    justifyContent: "center",
  },
  recentCode: { fontFamily: MONO, fontWeight: "700", fontSize: 15, color: "#FFFFFF" },
  recentMeta: { fontSize: 12, color: WHITE_60, marginTop: 2 },

  offscreen: { position: "absolute", left: -9999, top: -9999, opacity: 0 },
});
