import React from "react";
import { View, StyleSheet, Pressable, Linking, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const handleOpenPlusCodesInfo = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Linking.openURL("https://plus.codes/");
  };

  const handleOpenPrivacy = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Linking.openURL("https://plus.codes/");
  };

  const handleContact = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Linking.openURL("mailto:feedback@moradaao.com?subject=Feedback%20Morada%20AO");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Sobre a Morada AO
        </ThemedText>

        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.aboutHeader}>
            <ThemedText style={styles.aboutTitle}>
              Morada AO
            </ThemedText>
            <ThemedText style={[styles.aboutSubtitle, { color: theme.textSecondary }]}>
              A tua morada digital em Angola
            </ThemedText>
          </View>

          <View style={[styles.separator, { backgroundColor: theme.border }]} />

          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Versão</ThemedText>
            <ThemedText style={[styles.infoValue, { color: theme.textSecondary }]}>
              1.0.0
            </ThemedText>
          </View>

          <View style={[styles.separator, { backgroundColor: theme.border }]} />

          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Desenvolvido para</ThemedText>
            <ThemedText style={[styles.infoValue, { color: theme.textSecondary }]}>
              Angola
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Ajuda e Suporte
        </ThemedText>

        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <Pressable
            style={styles.linkRow}
            onPress={handleOpenPlusCodesInfo}
          >
            <View style={styles.linkContent}>
              <View style={[styles.iconCircle, { backgroundColor: Colors.light.primary + "15" }]}>
                <Feather name="help-circle" size={18} color={Colors.light.primary} />
              </View>
              <ThemedText style={styles.linkLabel}>Como funciona o Plus Code?</ThemedText>
            </View>
            <Feather name="external-link" size={18} color={theme.textMuted} />
          </Pressable>

          <View style={[styles.separator, { backgroundColor: theme.border }]} />

          <Pressable
            style={styles.linkRow}
            onPress={handleOpenPrivacy}
          >
            <View style={styles.linkContent}>
              <View style={[styles.iconCircle, { backgroundColor: Colors.light.primary + "15" }]}>
                <Feather name="lock" size={18} color={Colors.light.primary} />
              </View>
              <ThemedText style={styles.linkLabel}>Privacidade</ThemedText>
            </View>
            <Feather name="external-link" size={18} color={theme.textMuted} />
          </Pressable>

          <View style={[styles.separator, { backgroundColor: theme.border }]} />

          <Pressable
            style={styles.linkRow}
            onPress={handleContact}
          >
            <View style={styles.linkContent}>
              <View style={[styles.iconCircle, { backgroundColor: Colors.light.primary + "15" }]}>
                <Feather name="mail" size={18} color={Colors.light.primary} />
              </View>
              <ThemedText style={styles.linkLabel}>Contacto / Feedback</ThemedText>
            </View>
            <Feather name="chevron-right" size={18} color={theme.textMuted} />
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          O Que Saber
        </ThemedText>

        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.tipItem}>
            <View style={[styles.tipBullet, { backgroundColor: Colors.light.success }]} />
            <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>
              A morada segura funciona sempre, mesmo sem nome de rua.
            </ThemedText>
          </View>

          <View style={styles.tipItem}>
            <View style={[styles.tipBullet, { backgroundColor: Colors.light.primary }]} />
            <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>
              O código curto é mais fácil de lembrar, mas precisa do nome do bairro.
            </ThemedText>
          </View>

          <View style={styles.tipItem}>
            <View style={[styles.tipBullet, { backgroundColor: Colors.light.primary }]} />
            <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>
              O link que partilhas usa sempre o código completo para funcionar em qualquer lugar.
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <ThemedText style={[styles.footerText, { color: theme.textMuted }]}>
          Feito com amor para Angola
        </ThemedText>
        <View style={styles.exampleLocations}>
          <ThemedText style={[styles.locationTag, { color: theme.textMuted }]}>
            Cazenga
          </ThemedText>
          <ThemedText style={[styles.locationDot, { color: theme.textMuted }]}>•</ThemedText>
          <ThemedText style={[styles.locationTag, { color: theme.textMuted }]}>
            Viana
          </ThemedText>
          <ThemedText style={[styles.locationDot, { color: theme.textMuted }]}>•</ThemedText>
          <ThemedText style={[styles.locationTag, { color: theme.textMuted }]}>
            Maianga
          </ThemedText>
          <ThemedText style={[styles.locationDot, { color: theme.textMuted }]}>•</ThemedText>
          <ThemedText style={[styles.locationTag, { color: theme.textMuted }]}>
            Kilamba
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  card: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  aboutHeader: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  aboutSubtitle: {
    fontSize: 14,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
  },
  separator: {
    height: 1,
    marginLeft: Spacing.lg,
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
    paddingTop: Spacing["2xl"],
    paddingBottom: Spacing.xl,
  },
  footerText: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  exampleLocations: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  locationTag: {
    fontSize: 12,
  },
  locationDot: {
    fontSize: 10,
  },
});
