import React, { forwardRef } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

import { Colors, Spacing, BorderRadius, Fonts } from "@/constants/theme";

export interface ShareCardProps {
  fullCode: string;
  shortCode: string;
  reference: string;
  label?: string;
}

export const SHARE_CARD_SIZE = { width: 900, height: 1200 };

export const ShareCard = forwardRef<any, ShareCardProps>(function ShareCard(
  { fullCode, shortCode, reference, label },
  ref
) {
  const monoFont = (Fonts as any)?.mono || "monospace";
  const sansFont = (Fonts as any)?.sans || "System";

  return (
    <View
      ref={ref}
      collapsable={false}
      style={styles.card}
    >
      <View style={styles.gradient} />
      <View style={styles.gradientOverlay} />

      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Feather name="map-pin" size={32} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.brand, { fontFamily: sansFont }]}>MORADA AO</Text>
          <Text style={[styles.brandSub, { fontFamily: sansFont }]}>
            A tua morada digital em Angola
          </Text>
        </View>
      </View>

      <View style={styles.middle}>
        {label ? (
          <View style={styles.labelPill}>
            <Text style={[styles.labelText, { fontFamily: sansFont }]}>
              {label.toUpperCase()}
            </Text>
          </View>
        ) : null}

        <Text style={[styles.codeLabel, { fontFamily: sansFont }]}>
          Morada segura (funciona sempre)
        </Text>
        <Text
          style={[styles.fullCode, { fontFamily: monoFont }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {fullCode}
        </Text>

        {shortCode && reference ? (
          <>
            <View style={styles.divider} />
            <Text style={[styles.codeLabel, { fontFamily: sansFont }]}>
              Morada curta
            </Text>
            <Text style={[styles.shortCode, { fontFamily: monoFont }]} numberOfLines={2}>
              {shortCode} {reference}
            </Text>
          </>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.openHint, { fontFamily: sansFont }]}>
          Abre no Google Maps, Waze ou qualquer app de mapas
        </Text>
        <View style={styles.flagRow}>
          <View style={[styles.flagStripe, { backgroundColor: "#CE1126" }]} />
          <View style={[styles.flagStripe, { backgroundColor: "#000000" }]} />
          <View style={[styles.flagStripe, { backgroundColor: "#FFC500" }]} />
        </View>
        <Text style={[styles.made, { fontFamily: sansFont }]}>
          Feito em Angola · moradaao.com
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: SHARE_CARD_SIZE.width,
    height: SHARE_CARD_SIZE.height,
    backgroundColor: Colors.light.primary,
    padding: 64,
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.light.primary,
  },
  gradientOverlay: {
    position: "absolute",
    top: -200,
    right: -200,
    width: 700,
    height: 700,
    borderRadius: 350,
    backgroundColor: Colors.light.secondary,
    opacity: 0.55,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    zIndex: 2,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  brandSub: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
    marginTop: 4,
  },
  middle: {
    zIndex: 2,
    gap: Spacing.lg,
  },
  labelPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
  },
  labelText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 2,
  },
  codeLabel: {
    color: "#FFFFFF",
    opacity: 0.85,
    fontSize: 20,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  fullCode: {
    color: "#FFFFFF",
    fontSize: 92,
    fontWeight: "700",
    letterSpacing: 4,
  },
  shortCode: {
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "600",
    letterSpacing: 2,
  },
  divider: {
    height: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginVertical: 12,
  },
  footer: {
    zIndex: 2,
    gap: 20,
  },
  openHint: {
    color: "#FFFFFF",
    opacity: 0.85,
    fontSize: 20,
    lineHeight: 28,
  },
  flagRow: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    width: 120,
  },
  flagStripe: {
    flex: 1,
  },
  made: {
    color: "#FFFFFF",
    opacity: 0.75,
    fontSize: 16,
  },
});
