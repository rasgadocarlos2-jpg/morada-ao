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
import * as Location from "expo-location";

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
      "Em qualquer canto de Angola, mesmo onde a rua não tem nome, o teu lugar tem um código único.",
    features: [
      { icon: "crosshair", text: "Cerca de 3 metros" },
      { icon: "map", text: "Funciona no Google Maps" },
    ],
  },
  {
    variant: "offline",
    title: "Funciona sem rede",
    description:
      "O código é calculado no teu telemóvel, a partir do GPS. Só o nome do bairro precisa de internet.",
    features: [
      { icon: "wifi-off", text: "Sem dados móveis" },
      { icon: "globe", text: "Em toda Angola" },
    ],
  },
  {
    variant: "share",
    title: "Partilha com qualquer um",
    description:
      "Envia a tua morada por WhatsApp ou SMS. Quem recebe abre o código no Google Maps e chega ao sítio.",
    features: [
      { icon: "message-circle", text: "WhatsApp, SMS ou imagem" },
      { icon: "user-check", text: "Quem recebe não precisa da app" },
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

  const handleNext = async () => {
    Haptics.selectionAsync();
    if (isLast) {
      // Pede a localização aqui; se for recusada, a App mostra o ecrã de permissão.
      try {
        const r = await Location.requestForegroundPermissionsAsync();
        track("location_permission_response", { granted: r.granted, can_ask_again: r.canAskAgain, from: "onboarding" });
      } catch {}
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
          {isLast ? "Mostrar a minha morada" : "Continuar"}
        </Button>
        <ThemedText style={[styles.privacy, { color: theme.textMuted, opacity: isLast ? 1 : 0 }]}>
          Pedimos a localização só para calcular o teu código.
        </ThemedText>
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
        { width: SCREEN_WIDTH, paddingTop: topInset + 72 },
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
            <View key={i} style={[styles.featureItem, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name={f.icon} size={14} color={theme.primary} />
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
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  featureText: {
    fontSize: 13,
    fontWeight: "600",
  },
  privacy: {
    fontSize: 12,
    textAlign: "center",
    marginTop: -Spacing.md,
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
