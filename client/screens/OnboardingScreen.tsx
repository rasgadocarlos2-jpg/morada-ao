import React from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { setHasSeenOnboarding } from "@/lib/storage";

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const handleStart = async () => {
    await setHasSeenOnboarding(true);
    onComplete();
  };

  const handleSkip = async () => {
    await setHasSeenOnboarding(true);
    onComplete();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <Pressable
        style={[styles.skipButton, { top: insets.top + Spacing.lg }]}
        onPress={handleSkip}
        hitSlop={20}
      >
        <ThemedText style={{ color: theme.textSecondary }}>Saltar</ThemedText>
      </Pressable>

      <View style={[styles.content, { paddingTop: insets.top + Spacing["5xl"] }]}>
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <Image
            source={require("../../assets/images/onboarding-map.png")}
            style={styles.illustration}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          style={styles.textContent}
          entering={FadeInUp.delay(400).duration(600)}
        >
          <View style={styles.iconBadge}>
            <View style={[styles.iconCircle, { backgroundColor: Colors.light.primary }]}>
              <Feather name="map-pin" size={24} color="#FFFFFF" />
            </View>
          </View>

          <ThemedText type="h1" style={styles.headline}>
            A tua morada digital
          </ThemedText>

          <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
            Em Angola, muitas zonas não têm nomes de ruas. Morada AO cria um código único para qualquer localização.
          </ThemedText>

          <View style={styles.features}>
            <FeatureItem
              icon="check-circle"
              text="Funciona em qualquer lugar de Angola"
              color={theme.success}
            />
            <FeatureItem
              icon="share-2"
              text="Partilha fácil por WhatsApp ou SMS"
              color={theme.success}
            />
            <FeatureItem
              icon="navigation"
              text="Perfeito para entregas e emergências"
              color={theme.success}
            />
          </View>
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        entering={FadeInUp.delay(600).duration(600)}
      >
        <Button
          onPress={handleStart}
          style={[styles.button, { backgroundColor: Colors.light.primary }]}
        >
          Começar
        </Button>
      </Animated.View>
    </View>
  );
}

function FeatureItem({
  icon,
  text,
  color,
}: {
  icon: keyof typeof Feather.glyphMap;
  text: string;
  color: string;
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.featureItem}>
      <Feather name={icon} size={18} color={color} />
      <ThemedText style={[styles.featureText, { color: theme.textSecondary }]}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: "absolute",
    right: Spacing.lg,
    zIndex: 10,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  illustration: {
    width: "100%",
    height: 220,
    alignSelf: "center",
    marginBottom: Spacing["2xl"],
  },
  textContent: {
    alignItems: "center",
  },
  iconBadge: {
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  headline: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  description: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
    paddingHorizontal: Spacing.lg,
  },
  features: {
    alignSelf: "stretch",
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  featureText: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  button: {
    borderRadius: BorderRadius.md,
  },
});
