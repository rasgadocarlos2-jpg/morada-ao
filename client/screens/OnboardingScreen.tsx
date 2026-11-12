import React, { useRef, useState, ComponentRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { OnboardingArt } from "@/components/OnboardingArt";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { setHasSeenOnboarding } from "@/lib/storage";
import { track } from "@/lib/analytics";

interface OnboardingScreenProps {
  onComplete: () => void;
}

type Variant = "map" | "offline" | "share";

interface Slide {
  variant: Variant;
  title: string;
  description: string;
  features: Array<{ icon: keyof typeof Feather.glyphMap; text: string }>;
}

const SLIDES: Slide[] = [
  {
    variant: "map",
    title: "A tua morada digital",
    description:
      "Em qualquer canto de Angola, mesmo sem nome de rua, há sempre uma morada. Nós ajudamos-te a encontrá-la.",
    features: [
      { icon: "map-pin", text: "Preciso ao metro" },
      { icon: "zap", text: "Gerado em segundos" },
    ],
  },
  {
    variant: "offline",
    title: "Funciona sempre",
    description:
      "Usa Plus Codes do Google — um sistema internacional. Depois do primeiro uso, continua a funcionar offline.",
    features: [
      { icon: "wifi-off", text: "Sem internet depois da 1ª vez" },
      { icon: "globe", text: "Cobertura em toda Angola" },
    ],
  },
  {
    variant: "share",
    title: "Partilha com qualquer um",
    description:
      "Manda a tua morada por WhatsApp, SMS ou cartão visual. Perfeito para entregas, Uber, emergências e visitas.",
    features: [
      { icon: "message-circle", text: "WhatsApp, SMS, email" },
      { icon: "image", text: "Também em imagem partilhável" },
    ],
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  const finish = async () => {
    await setHasSeenOnboarding(true);
    track("onboarding_completed", { slide_reached: index + 1 });
    onComplete();
  };

  const handleNext = () => {
    Haptics.selectionAsync();
    if (isLast) {
      finish();
    } else {
      const next = index + 1;
      scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * next, animated: true });
      setIndex(next);
    }
  };

  const handleSkip = async () => {
    track("onboarding_skipped", { slide_reached: index + 1 });
    await finish();
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (next !== index) setIndex(next);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <Pressable
        style={[styles.skipButton, { top: insets.top + Spacing.lg }]}
        onPress={handleSkip}
        hitSlop={20}
      >
        <ThemedText style={{ color: theme.textSecondary, fontWeight: "500" }}>
          Saltar
        </ThemedText>
      </Pressable>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scroll}
      >
        {SLIDES.map((slide, i) => (
          <SlideView
            key={i}
            slide={slide}
            topInset={insets.top}
            active={i === index}
          />
        ))}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === index ? theme.primary : theme.border,
                  width: i === index ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Button
          onPress={handleNext}
          style={[styles.button, { backgroundColor: theme.primary }]}
        >
          {isLast ? "Vamos a isso" : "Continuar"}
        </Button>
      </View>
    </View>
  );
}

function SlideView({
  slide,
  topInset,
  active,
}: {
  slide: Slide;
  topInset: number;
  active: boolean;
}) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.slide,
        { width: SCREEN_WIDTH, paddingTop: topInset + Spacing["4xl"] },
      ]}
    >
      <View>
        <OnboardingArt variant={slide.variant} />
      </View>

      <View style={styles.textContent}>
        <ThemedText type="h1" style={styles.headline}>
          {slide.title}
        </ThemedText>

        <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
          {slide.description}
        </ThemedText>

        <View style={styles.features}>
          {slide.features.map((f, i) => (
            <View key={i} style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: theme.iconBg }]}>
                <Feather name={f.icon} size={14} color={theme.primary} />
              </View>
              <ThemedText style={[styles.featureText, { color: theme.text }]}>
                {f.text}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipButton: {
    position: "absolute",
    right: Spacing.lg,
    zIndex: 10,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  scroll: { flex: 1 },
  slide: {
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
  },
  textContent: {
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    width: "100%",
  },
  headline: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  description: {
    textAlign: "center",
    marginBottom: Spacing.xl,
    fontSize: 16,
    lineHeight: 24,
  },
  features: {
    alignSelf: "stretch",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    gap: Spacing.xl,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    borderRadius: BorderRadius.full,
  },
});
