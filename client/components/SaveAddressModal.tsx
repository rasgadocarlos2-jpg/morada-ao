import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  Easing,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { SavedAddressPreset } from "@/lib/storage";

interface Preset {
  key: SavedAddressPreset;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}

const PRESETS: Preset[] = [
  { key: "home", label: "Casa", icon: "home" },
  { key: "work", label: "Trabalho", icon: "briefcase" },
  { key: "family", label: "Família", icon: "heart" },
  { key: "friend", label: "Amigo", icon: "users" },
  { key: "business", label: "Negócio", icon: "shopping-bag" },
  { key: "other", label: "Outro", icon: "map-pin" },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { preset: SavedAddressPreset; label: string }) => void;
  defaultLabel?: string;
}

export function SaveAddressModal({ visible, onClose, onSave, defaultLabel }: Props) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const [preset, setPreset] = useState<SavedAddressPreset>("home");
  const [label, setLabel] = useState(defaultLabel ?? "Casa");

  useEffect(() => {
    if (visible) {
      setPreset("home");
      setLabel(defaultLabel ?? "Casa");
    }
  }, [visible, defaultLabel]);

  const handleSelect = (p: Preset) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    setPreset(p.key);
    setLabel(p.label);
  };

  const handleSave = () => {
    if (!label.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSave({ preset, label: label.trim() });
  };

  const cardBg = isDark ? theme.backgroundSecondary : theme.backgroundRoot;
  const inputBg = isDark ? theme.backgroundTertiary : theme.backgroundSecondary;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Animated.View
            style={styles.backdropView}
            entering={FadeIn.duration(260).easing(Easing.out(Easing.quad))}
            exiting={FadeOut.duration(220).easing(Easing.in(Easing.quad))}
          />
        </Pressable>

        <Animated.View
          entering={SlideInDown.duration(340).easing(Easing.out(Easing.cubic))}
          exiting={SlideOutDown.duration(240).easing(Easing.in(Easing.cubic))}
          style={[
            styles.sheet,
            {
              backgroundColor: cardBg,
              paddingBottom: insets.bottom + Spacing.xl,
            },
          ]}
        >
          <View style={[styles.dragHandle, { backgroundColor: theme.border }]} />

          <ThemedText type="h3" style={styles.title}>
            Guardar esta morada
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Escolhe um atalho ou dá-lhe um nome
          </ThemedText>

          <View style={styles.presetsGrid}>
            {PRESETS.map((p) => {
              const selected = preset === p.key;
              return (
                <Pressable
                  key={p.key}
                  onPress={() => handleSelect(p)}
                  style={[
                    styles.presetItem,
                    {
                      backgroundColor: selected ? theme.primarySoft : inputBg,
                      borderColor: selected ? theme.primary : "transparent",
                    },
                  ]}
                >
                  <Feather
                    name={p.icon}
                    size={22}
                    color={selected ? theme.primary : theme.text}
                  />
                  <ThemedText
                    style={[
                      styles.presetLabel,
                      {
                        color: selected ? theme.primary : theme.text,
                        fontWeight: selected ? "700" : "600",
                      },
                    ]}
                  >
                    {p.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.inputRow}>
            <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Nome
            </ThemedText>
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder="Ex: Casa dos pais"
              placeholderTextColor={theme.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: inputBg,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              maxLength={32}
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              style={[styles.cancelBtn, { backgroundColor: inputBg }]}
            >
              <ThemedText style={{ color: theme.text, fontWeight: "600" }}>
                Cancelar
              </ThemedText>
            </Pressable>
            <View style={{ flex: 1 }}>
              <Button
                onPress={handleSave}
                disabled={!label.trim()}
                style={{ backgroundColor: theme.primary }}
              >
                Guardar
              </Button>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdropView: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginTop: 4,
    marginBottom: Spacing.xl,
  },
  presetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  presetItem: {
    flexBasis: "31%",
    flexGrow: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    gap: 6,
    borderWidth: 2,
  },
  presetLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  inputRow: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    fontSize: 12,
    letterSpacing: 0.4,
    marginBottom: 6,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  input: {
    height: 52,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  cancelBtn: {
    paddingHorizontal: Spacing.xl,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
});
