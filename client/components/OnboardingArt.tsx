import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius, Fonts } from "@/constants/theme";

type Variant = "map" | "offline" | "share";

export function OnboardingArt({ variant }: { variant: Variant }) {
  const monoFont = (Fonts as any)?.mono || "monospace";

  if (variant === "map") {
    return (
      <View style={styles.frame}>
        <View style={styles.frameInner}>
          <Image
            source={require("../../assets/images/onboarding-map.png")}
            style={styles.illustration}
            resizeMode="contain"
          />
          <View style={[styles.floatingPill, styles.pillTop]}>
            <View style={styles.pillDot} />
            <ThemedText style={[styles.pillText, { fontFamily: monoFont }]}>
              6F3M576Q+2Q3
            </ThemedText>
          </View>
          <View style={[styles.floatingPill, styles.pillBottom]}>
            <View style={styles.pillDot} />
            <ThemedText style={[styles.pillText, { fontFamily: monoFont }]}>
              7F2Q4W6V+XR
            </ThemedText>
          </View>
        </View>
      </View>
    );
  }

  if (variant === "offline") {
    return (
      <View style={styles.frame}>
        <View style={[styles.frameInner, styles.dottedFrame]}>
          <View style={styles.offlineIcons}>
            <View style={[styles.circleIcon, styles.bigCircle, { backgroundColor: Colors.light.primary }]}>
              <Feather name="map-pin" size={44} color="#FFFFFF" />
            </View>
            <View style={styles.wifiCluster}>
              <View style={[styles.smallCircle, { backgroundColor: Colors.light.warning }]}>
                <Feather name="wifi-off" size={16} color="#FFFFFF" />
              </View>
              <View style={[styles.smallCircle, { backgroundColor: Colors.light.success }]}>
                <Feather name="check" size={16} color="#FFFFFF" />
              </View>
            </View>
          </View>
          <ThemedText style={[styles.floatingLabel, { fontFamily: monoFont }]}>
            Cazenga · Viana · Benguela
          </ThemedText>
        </View>
      </View>
    );
  }

  // share
  return (
    <View style={styles.frame}>
      <View style={styles.frameInner}>
        <View style={styles.shareStack}>
          <View style={[styles.shareBubble, styles.bubbleGreen]}>
            <Feather name="message-circle" size={20} color="#FFFFFF" />
          </View>
          <View style={[styles.shareBubble, styles.bubbleOrange]}>
            <Feather name="smartphone" size={20} color="#FFFFFF" />
          </View>
          <View style={[styles.shareBubble, styles.bubbleRed]}>
            <Feather name="share-2" size={22} color="#FFFFFF" />
          </View>
        </View>
        <View style={styles.chatBubble}>
          <ThemedText style={[styles.chatText, { fontFamily: monoFont }]}>
            6F3M576Q+2Q3
          </ThemedText>
          <ThemedText style={styles.chatHint}>Cazenga Popular</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: "100%",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  frameInner: {
    width: 280,
    height: 240,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.primary + "0D",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  dottedFrame: {
    backgroundColor: Colors.light.secondary + "15",
  },
  illustration: {
    width: 220,
    height: 180,
  },
  floatingPill: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pillTop: { top: 22, right: 20 },
  pillBottom: { bottom: 22, left: 20 },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1A1A1A",
    letterSpacing: 0.5,
  },

  offlineIcons: {
    alignItems: "center",
    position: "relative",
  },
  circleIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  bigCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
  },
  smallCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  wifiCluster: {
    flexDirection: "row",
    gap: -8,
    position: "absolute",
    bottom: -10,
    right: -24,
  },
  floatingLabel: {
    position: "absolute",
    bottom: 18,
    fontSize: 11,
    color: Colors.light.secondary,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  shareStack: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  shareBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleGreen: { backgroundColor: "#25D366" },
  bubbleOrange: { backgroundColor: Colors.light.secondary },
  bubbleRed: { backgroundColor: Colors.light.primary },
  chatBubble: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  chatText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: 1,
  },
  chatHint: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
});
