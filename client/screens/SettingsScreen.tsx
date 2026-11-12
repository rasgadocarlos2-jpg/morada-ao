import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Linking,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { track } from "@/lib/analytics";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const PRIVACY_URL = "https://rasgadolabs.com/morada-ao/privacy";
const SUPPORT_EMAIL = "carlos@rasgadolabs.com";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

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
    const subject = encodeURIComponent("Feedback Morada AO");
    const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}`;
    try {
      await Linking.openURL(url);
    } catch {
      handleCopyEmail();
    }
  };

  const handleRate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    track("rate_app_opened");
    Alert.alert(
      "Avaliar na loja",
      "A app ainda não está publicada. Em breve!"
    );
  };

  const cardBg = isDark ? theme.backgroundSecondary : theme.backgroundDefault;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing["2xl"],
        paddingHorizontal: Spacing.lg,
      }}
    >
      <View style={styles.section}>
        <SectionLabel theme={theme}>Sobre a Morada AO</SectionLabel>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.aboutHeader}>
            <View style={[styles.aboutIcon, { backgroundColor: Colors.light.primary }]}>
              <Feather name="map-pin" size={28} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.aboutTitle}>Morada AO</ThemedText>
            <ThemedText style={[styles.aboutSubtitle, { color: theme.textSecondary }]}>
              A tua morada digital em Angola
            </ThemedText>
            <View style={[styles.versionPill, { backgroundColor: theme.backgroundTertiary }]}>
              <ThemedText style={[styles.versionText, { color: theme.textSecondary }]}>
                Versão {appVersion}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <SectionLabel theme={theme}>Ferramentas</SectionLabel>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <LinkRow
            icon="bookmark"
            label="Minhas moradas"
            onPress={() => {
              Haptics.selectionAsync();
              navigation.navigate("Favorites");
            }}
            theme={theme}
          />
          <Separator theme={theme} />

          <LinkRow
            icon="search"
            label="Procurar por código"
            onPress={() => {
              Haptics.selectionAsync();
              navigation.navigate("Search");
            }}
            theme={theme}
          />
        </View>
      </View>

      <View style={styles.section}>
        <SectionLabel theme={theme}>Ajuda e Suporte</SectionLabel>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <LinkRow
            icon="help-circle"
            label="Como funciona o Plus Code?"
            onPress={() => openUrl("https://plus.codes/howitworks", "plus_codes_info")}
            theme={theme}
          />
          <Separator theme={theme} />

          <LinkRow
            icon="star"
            label="Avaliar a Morada AO"
            onPress={handleRate}
            theme={theme}
          />
          <Separator theme={theme} />

          <LinkRow
            icon="mail"
            label="Contactar / Feedback"
            onPress={handleContact}
            onLongPress={handleCopyEmail}
            theme={theme}
          />
        </View>
      </View>

      <View style={styles.section}>
        <SectionLabel theme={theme}>Legal</SectionLabel>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <LinkRow
            icon="lock"
            label="Política de privacidade"
            onPress={() => openUrl(PRIVACY_URL, "privacy_opened")}
            theme={theme}
          />
          <Separator theme={theme} />

          <LinkRow
            icon="file-text"
            label="Termos de uso"
            onPress={() => openUrl("https://rasgadolabs.com/morada-ao/terms", "terms_opened")}
            theme={theme}
          />
        </View>
      </View>

      <View style={styles.section}>
        <SectionLabel theme={theme}>O que saber</SectionLabel>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Tip color={Colors.light.success} theme={theme}>
            A morada segura funciona sempre, mesmo sem nome de rua.
          </Tip>
          <Tip color={Colors.light.primary} theme={theme}>
            O código curto é mais fácil de lembrar, mas precisa do nome do bairro.
          </Tip>
          <Tip color={Colors.light.primary} theme={theme}>
            O link que partilhas usa sempre o código completo para funcionar em qualquer lugar.
          </Tip>
        </View>
      </View>

      <View style={styles.footer}>
        <ThemedText style={[styles.footerLove, { color: theme.textMuted }]}>
          Feito em Angola 🇦🇴 com amor
        </ThemedText>
      </View>
    </ScrollView>
  );
}

function SectionLabel({ children, theme }: { children: React.ReactNode; theme: any }) {
  return (
    <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
      {children}
    </ThemedText>
  );
}

function Separator({ theme }: { theme: any }) {
  return <View style={[styles.separator, { backgroundColor: theme.border }]} />;
}

function LinkRow({
  icon,
  label,
  onPress,
  onLongPress,
  theme,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  onLongPress?: () => void;
  theme: any;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.linkRow, { opacity: pressed ? 0.6 : 1 }]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.linkContent}>
        <View style={[styles.iconCircle, { backgroundColor: Colors.light.primary + "15" }]}>
          <Feather name={icon} size={18} color={Colors.light.primary} />
        </View>
        <ThemedText style={styles.linkLabel}>{label}</ThemedText>
      </View>
      <Feather name="chevron-right" size={18} color={theme.textMuted} />
    </Pressable>
  );
}

function Tip({
  color,
  theme,
  children,
}: {
  color: string;
  theme: any;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.tipItem}>
      <View style={[styles.tipBullet, { backgroundColor: color }]} />
      <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>
        {children}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { marginBottom: Spacing["2xl"] },
  sectionTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    fontWeight: "600",
  },
  card: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  aboutHeader: {
    paddingVertical: Spacing["2xl"],
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    gap: Spacing.sm,
  },
  aboutIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  aboutTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  aboutSubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  versionPill: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  versionText: {
    fontSize: 12,
    fontWeight: "500",
  },
  separator: {
    height: 1,
    marginLeft: 60,
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  linkContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  linkLabel: {
    fontSize: 16,
    flex: 1,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    alignItems: "center",
    paddingTop: Spacing.xl,
  },
  footerLove: {
    fontSize: 13,
  },
});
