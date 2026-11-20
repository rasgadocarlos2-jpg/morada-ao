import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Linking,
  Share,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Fonts } from "@/constants/theme";
import {
  extractPlusCode,
  isValidPlusCode,
  isFullCode,
  decodePlusCode,
  generateMorada,
  generateShareMessage,
  MoradaResult,
} from "@/lib/plusCodes";
import { reverseGeocode, GeocodingResult } from "@/lib/geocoding";
import { addRecent } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { track } from "@/lib/analytics";

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, "Search">;
}

const NAVY = "#0D1A2A";
const NAVY_2 = "#15283C";
const ORANGE = "#EA5D1E";
const ORANGE_LIGHT = "#FF7A3C";
const MONO = (Fonts as any)?.mono || "monospace";

export default function SearchScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const [input, setInput] = useState("");
  const [geo, setGeo] = useState<GeocodingResult | null>(null);
  const [loadingGeo, setLoadingGeo] = useState(false);

  const code = extractPlusCode(input) ?? input.trim().toUpperCase();
  const valid = isValidPlusCode(code);
  const full = valid && isFullCode(code);
  const decoded = full ? decodePlusCode(code) : null;
  const typed = input.trim().length >= 4;

  // Com o código válido, vai buscar o bairro para mostrar a morada por extenso.
  useEffect(() => {
    if (!decoded) {
      setGeo(null);
      return;
    }
    let alive = true;
    setLoadingGeo(true);
    reverseGeocode(decoded.latitudeCenter, decoded.longitudeCenter)
      .then((g) => alive && setGeo(g))
      .finally(() => alive && setLoadingGeo(false));
    track("search_code_valid");
    return () => {
      alive = false;
    };
  }, [decoded?.latitudeCenter, decoded?.longitudeCenter]);

  const morada: MoradaResult | null = decoded
    ? generateMorada(
        decoded.latitudeCenter,
        decoded.longitudeCenter,
        geo?.municipio ?? null,
        geo?.cidade || geo?.bairro || null
      )
    : null;

  const words = [geo?.bairro, geo?.municipio, geo?.provincia]
    .filter((v, i, a): v is string => !!v && a.indexOf(v) === i)
    .join(" · ");

  const remember = () => {
    if (!morada) return;
    addRecent({
      fullCode: morada.fullCode,
      shortCode: morada.shortCode,
      reference: morada.reference,
      bairro: geo?.bairro ?? null,
      kind: "procurado",
      latitude: morada.latitude,
      longitude: morada.longitude,
    });
  };

  const handlePaste = async () => {
    Haptics.selectionAsync();
    const clip = await Clipboard.getStringAsync();
    if (clip) setInput(clip);
  };

  const handleSeeOnMap = () => {
    if (!decoded) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    track("search_opened_code", { via: "manual" });
    remember();
    navigation.navigate("Map", {
      focus: {
        latitude: decoded.latitudeCenter,
        longitude: decoded.longitudeCenter,
        code,
      },
    });
  };

  const handleGo = async () => {
    if (!decoded) return;
    track("search_opened_external", { app: "google" });
    remember();
    await Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${decoded.latitudeCenter},${decoded.longitudeCenter}`
    );
  };

  const handleShare = async () => {
    if (!morada) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({ message: generateShareMessage(morada) });
      track("search_shared");
      remember();
    } catch {}
  };

  const fieldBg = isDark ? theme.backgroundSecondary : "#FFFFFF";
  const errorMsg =
    typed && !decoded
      ? !valid
        ? "Esse código não parece válido. Confirma as letras e o +."
        : "Falta a parte da frente. Pede o código completo (ex.: 6F3M576Q+2Q3)."
      : null;

  return (
    <ScrollView
      style={{ backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + 12,
        paddingBottom: insets.bottom + 24,
        paddingHorizontal: 16,
        gap: 14,
        flexGrow: 1,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={[
          styles.field,
          { backgroundColor: fieldBg, borderColor: errorMsg ? Colors.light.error : theme.border },
        ]}
      >
        <View style={{ flex: 1 }}>
          <ThemedText style={[styles.eyebrow, { color: theme.textSecondary }]}>
            CÓDIGO QUE RECEBESTE
          </ThemedText>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="6F3M576Q+2Q3"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={handleSeeOnMap}
            style={[styles.input, { color: theme.text }]}
          />
        </View>
        {input ? (
          <Pressable onPress={() => setInput("")} hitSlop={8} accessibilityLabel="Limpar">
            <Feather name="x" size={18} color={theme.textSecondary} />
          </Pressable>
        ) : null}
        <Pressable onPress={handlePaste} style={styles.pasteBtn} hitSlop={6}>
          <Feather name="clipboard" size={15} color="#FFFFFF" />
          <ThemedText style={styles.pasteText}>Colar</ThemedText>
        </Pressable>
      </View>

      {errorMsg ? (
        <View style={styles.errorRow}>
          <Feather name="alert-circle" size={14} color={Colors.light.error} />
          <ThemedText style={[styles.errorText, { color: Colors.light.error }]}>{errorMsg}</ThemedText>
        </View>
      ) : null}

      {decoded && morada ? (
        <View style={styles.card}>
          <View style={styles.validChip}>
            <Feather name="check" size={13} color="#7BD3A8" />
            <ThemedText style={styles.validText}>Código válido</ThemedText>
          </View>

          {loadingGeo && !geo ? (
            <ActivityIndicator color={ORANGE_LIGHT} style={{ alignSelf: "flex-start", marginTop: 14 }} />
          ) : (
            <>
              <ThemedText style={styles.bigCode} numberOfLines={1} adjustsFontSizeToFit>
                {morada.shortCode && morada.reference ? (
                  <>
                    <ThemedText style={[styles.bigCode, { color: ORANGE_LIGHT }]}>+</ThemedText>
                    {morada.shortCode.replace(/^\+/, "")} {morada.reference}
                  </>
                ) : (
                  morada.fullCode
                )}
              </ThemedText>
              {words ? <ThemedText style={styles.words}>{words}</ThemedText> : null}
              <ThemedText style={styles.full}>{morada.fullCode}</ThemedText>
            </>
          )}

          <Pressable
            onPress={handleGo}
            style={({ pressed }) => [styles.goBtn, pressed && { opacity: 0.9 }]}
          >
            <Feather name="navigation" size={18} color="#FFFFFF" />
            <ThemedText style={styles.goText}>Ir até lá no Google Maps</ThemedText>
          </Pressable>
          <View style={styles.tiles}>
            <Pressable style={styles.tile} onPress={handleSeeOnMap}>
              <Feather name="map-pin" size={17} color="#FFFFFF" />
              <ThemedText style={styles.tileText}>Ver no mapa</ThemedText>
            </Pressable>
            <Pressable style={styles.tile} onPress={handleShare}>
              <Feather name="share-2" size={17} color="#FFFFFF" />
              <ThemedText style={styles.tileText}>Partilhar</ThemedText>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={{ flex: 1 }} />
      <ThemedText style={[styles.tip, { color: theme.textSecondary }]}>
        Recebeste um código pelo WhatsApp? Toca nele, copia e carrega em{" "}
        <ThemedText style={[styles.tip, { color: theme.text, fontWeight: "700" }]}>Colar</ThemedText>.
      </ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 18,
    paddingLeft: 16,
    paddingRight: 10,
    paddingVertical: 10,
  },
  eyebrow: { fontFamily: MONO, fontSize: 10, letterSpacing: 1.6 },
  input: {
    fontFamily: MONO,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
    paddingVertical: 4,
    marginTop: 2,
  },
  pasteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: NAVY,
  },
  pasteText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: -4 },
  errorText: { fontSize: 13, flex: 1 },

  card: { backgroundColor: NAVY, borderRadius: 22, padding: 18 },
  validChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(123,211,168,0.12)",
    borderRadius: 999,
    paddingHorizontal: 10,
    height: 26,
  },
  validText: { color: "#7BD3A8", fontSize: 12, fontWeight: "700" },
  bigCode: {
    fontFamily: MONO,
    fontWeight: "700",
    fontSize: 30,
    lineHeight: 38,
    color: "#FFFFFF",
    marginTop: 12,
  },
  words: { fontSize: 15, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  full: { fontFamily: MONO, fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 6 },
  goBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: ORANGE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 18,
  },
  goText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  tiles: { flexDirection: "row", gap: 10, marginTop: 10 },
  tile: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: NAVY_2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  tileText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  tip: { fontSize: 14, lineHeight: 21, textAlign: "center" },
});
