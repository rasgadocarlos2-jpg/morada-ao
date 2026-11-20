import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius, Fonts } from "@/constants/theme";

type Variant = "map" | "offline" | "share";

const C = Colors.light;

function Codigo({ grande = false }: { grande?: boolean }) {
  const mono = (Fonts as any)?.mono || "monospace";
  return (
    <View>
      <ThemedText style={[grande ? styles.codeBig : styles.codeMid, { fontFamily: mono }]}>
        <ThemedText style={[grande ? styles.codeBig : styles.codeMid, styles.plus, { fontFamily: mono }]}>+</ThemedText>
        2Q3 Cazenga
      </ThemedText>
      <ThemedText style={[styles.codeFull, { fontFamily: mono }]}>6F3M576Q+2Q3</ThemedText>
    </View>
  );
}

export function OnboardingArt({ variant }: { variant: Variant }) {
  if (variant === "map") {
    return (
      <View style={styles.frame}>
        <View style={styles.frameInner}>
          <Image
            source={require("../../assets/images/onboarding-map.png")}
            style={styles.illustration}
            resizeMode="contain"
          />
          <View style={styles.codeCard}>
            <Codigo grande />
            <View style={styles.badge}>
              <Feather name="shield" size={11} color={C.success} />
              <ThemedText style={styles.badgeText}>FUNCIONA SEMPRE</ThemedText>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (variant === "offline") {
    return (
      <View style={styles.frame}>
        <View style={styles.frameInner}>
          <View style={styles.offlineChip}>
            <Feather name="wifi-off" size={13} color={C.warning} />
            <ThemedText style={styles.offlineChipText}>Sem rede</ThemedText>
          </View>
          <View style={styles.pinCircle}>
            <Feather name="map-pin" size={40} color="#FFFFFF" />
          </View>
          <View style={styles.codeCard}>
            <Codigo />
            <View style={styles.checkRow}>
              <Feather name="check-circle" size={14} color={C.success} />
              <ThemedText style={styles.checkText}>Calculado no telemóvel</ThemedText>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.frame}>
      <View style={[styles.frameInner, styles.chatFrame]}>
        <View style={styles.msgIn}>
          <ThemedText style={styles.msgInText}>Onde fica a tua casa?</ThemedText>
        </View>
        <View style={styles.msgOut}>
          <ThemedText style={styles.msgLabel}>A minha morada:</ThemedText>
          <Codigo />
          <View style={styles.mapsLink}>
            <Feather name="external-link" size={12} color={C.primary} />
            <ThemedText style={styles.mapsLinkText}>Abrir no Google Maps</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

const sombra = {
  shadowColor: "#0D1A2A",
  shadowOpacity: 0.1,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
};

const styles = StyleSheet.create({
  frame: {
    width: "100%",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  frameInner: {
    width: 300,
    height: 270,
    borderRadius: BorderRadius.lg,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  illustration: {
    width: 170,
    height: 135,
    marginBottom: 118,
  },
  codeCard: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
    ...sombra,
  },
  codeBig: { fontSize: 17, fontWeight: "700", color: C.text, letterSpacing: 0.3 },
  codeMid: { fontSize: 16, fontWeight: "700", color: C.text, letterSpacing: 0.5 },
  plus: { color: C.primary },
  codeFull: { fontSize: 11, color: C.textSecondary, marginTop: 2, letterSpacing: 0.5 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeText: { fontSize: 9, fontWeight: "700", color: C.success, letterSpacing: 0.4 },

  offlineChip: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    ...sombra,
  },
  offlineChipText: { fontSize: 12, fontWeight: "600", color: C.text },
  pinCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 80,
  },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 1 },
  checkText: { fontSize: 11, fontWeight: "600", color: C.success },

  chatFrame: {
    alignItems: "stretch",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: Spacing.sm,
  },
  msgIn: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...sombra,
  },
  msgInText: { fontSize: 14, color: C.text },
  msgOut: {
    alignSelf: "flex-end",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderBottomRightRadius: 4,
    borderWidth: 1.5,
    borderColor: C.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...sombra,
  },
  msgLabel: { fontSize: 12, color: C.textSecondary, marginBottom: 4 },
  mapsLink: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  mapsLinkText: { fontSize: 12, fontWeight: "700", color: C.primary },
});
