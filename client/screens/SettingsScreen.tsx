import React, { useCallback, useState } from "react";
import { View, StyleSheet, Pressable, Linking, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import * as Location from "expo-location";
import Constants from "expo-constants";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Fonts } from "@/constants/theme";
import { track } from "@/lib/analytics";

const SITE = "https://moradaao.com";
const SUPPORT_EMAIL = "carlos@rasgadolabs.com";
const NAVY = "#0D1A2A";
const ORANGE = "#EA5D1E";
const MONO = (Fonts as any)?.mono || "monospace";

type LocState = "exata" | "aproximada" | "desligada" | null;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const [loc, setLoc] = useState<LocState>(null);
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  useFocusEffect(
    useCallback(() => {
      Location.getForegroundPermissionsAsync()
        .then((p: any) => {
          if (!p.granted) return setLoc("desligada");
          const coarse = p?.android?.accuracy === "coarse" || p?.ios?.accuracy === "reduced";
          setLoc(coarse ? "aproximada" : "exata");
        })
        .catch(() => setLoc(null));
    }, [])
  );

  const openUrl = async (url: string, eventName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    track(eventName);
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Não foi possível abrir o link");
    }
  };

  const handleCopyEmail = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(SUPPORT_EMAIL);
    track("support_email_copied");
    Alert.alert("Email copiado", SUPPORT_EMAIL);
  };

  const handleContact = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    track("contact_opened");
    const subject = encodeURIComponent("Morada AO");
    try {
      await Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}`);
    } catch {
      handleCopyEmail();
    }
  };

  const cardBg = isDark ? theme.backgroundSecondary : "#FFFFFF";
  const locValue =
    loc === "exata" ? "Exata" : loc === "aproximada" ? "Aproximada" : loc === "desligada" ? "Desligada" : "";
  const locWarn = loc === "aproximada" || loc === "desligada";

  return (
    <ScrollView
      style={{ backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + 12,
        paddingBottom: insets.bottom + 32,
        paddingHorizontal: 16,
      }}
    >
      <View style={styles.hero}>
        <ThemedText style={styles.wordmark}>
          MORADA<ThemedText style={[styles.wordmark, { color: ORANGE }]}>·</ThemedText>AO
        </ThemedText>
        <ThemedText style={styles.heroTitle}>A tua morada digital em Angola.</ThemedText>
        <ThemedText style={styles.heroMeta}>Versão {appVersion}</ThemedText>
      </View>

      <Section title="LOCALIZAÇÃO" color={theme.textSecondary}>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: theme.border }]}>
          <Row
            icon="crosshair"
            label="Precisão da localização"
            value={locValue}
            valueColor={locWarn ? ORANGE : theme.textSecondary}
            onPress={() => {
              track("location_settings_opened");
              Linking.openSettings();
            }}
          />
          {locWarn ? (
            <ThemedText style={[styles.note, { color: theme.textSecondary }]}>
              {loc === "aproximada"
                ? "Com a localização aproximada o código pode falhar centenas de metros. Ativa a localização exata nas definições do telemóvel."
                : "A app precisa da localização para calcular o teu código."}
            </ThemedText>
          ) : null}
        </View>
      </Section>

      <Section title="AJUDA" color={theme.textSecondary}>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: theme.border }]}>
          <Row
            icon="help-circle"
            label="Como funciona"
            onPress={() => openUrl(`${SITE}/#funciona`, "how_it_works_opened")}
            external
          />
          <Divider color={theme.border} />
          <Row
            icon="message-circle"
            label="Perguntas frequentes"
            onPress={() => openUrl(`${SITE}/#perguntas`, "faq_opened")}
            external
          />
          <Divider color={theme.border} />
          <Row
            icon="mail"
            label="Falar connosco"
            value="Email"
            valueColor={theme.textSecondary}
            onPress={handleContact}
            onLongPress={handleCopyEmail}
          />
        </View>
      </Section>

      <Section title="LEGAL" color={theme.textSecondary}>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: theme.border }]}>
          <Row
            icon="lock"
            label="Política de privacidade"
            onPress={() => openUrl(`${SITE}/privacidade`, "privacy_opened")}
            external
          />
          <Divider color={theme.border} />
          <Row
            icon="file-text"
            label="Termos de uso"
            onPress={() => openUrl(`${SITE}/termos`, "terms_opened")}
            external
          />
        </View>
      </Section>

      <Pressable onPress={() => openUrl(SITE, "site_opened")} style={styles.footer}>
        <ThemedText style={[styles.footerText, { color: theme.textSecondary }]}>
          moradaao.com · Feito em Angola
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText style={[styles.sectionTitle, { color }]}>{title}</ThemedText>
      {children}
    </View>
  );
}

function Divider({ color }: { color: string }) {
  return <View style={[styles.divider, { backgroundColor: color }]} />;
}

function Row({
  icon,
  label,
  value,
  valueColor,
  external,
  onPress,
  onLongPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  valueColor?: string;
  external?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
    >
      <View style={styles.rowIcon}>
        <Feather name={icon} size={17} color="#FFFFFF" />
      </View>
      <ThemedText style={styles.rowLabel}>{label}</ThemedText>
      {value ? <ThemedText style={[styles.rowValue, { color: valueColor }]}>{value}</ThemedText> : null}
      <Feather name={external ? "arrow-up-right" : "chevron-right"} size={18} color={theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: NAVY, borderRadius: 22, padding: 20 },
  wordmark: { fontWeight: "700", fontSize: 13, letterSpacing: 1.8, color: "#FFFFFF" },
  heroTitle: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: "#FFFFFF",
    marginTop: 18,
  },
  heroMeta: { fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,0.62)", marginTop: 8 },

  section: { marginTop: 24 },
  sectionTitle: { fontFamily: MONO, fontSize: 11, letterSpacing: 2, marginBottom: 8, marginLeft: 4 },
  card: { borderRadius: 18, borderWidth: 1, paddingHorizontal: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56 },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: "600" },
  rowValue: { fontSize: 14, fontWeight: "600" },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 44 },
  note: { fontSize: 13, lineHeight: 19, paddingBottom: 14, marginTop: -4, marginLeft: 44 },

  footer: { alignItems: "center", marginTop: 28 },
  footerText: { fontSize: 13 },
});
