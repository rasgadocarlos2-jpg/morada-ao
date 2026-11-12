import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors, Fonts } from "@/constants/theme";
import {
  extractPlusCode,
  isValidPlusCode,
  isFullCode,
  decodePlusCode,
} from "@/lib/plusCodes";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { track } from "@/lib/analytics";

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, "Search">;
}

export default function SearchScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const code = extractPlusCode(input) ?? input.trim().toUpperCase();
  const valid = isValidPlusCode(code);
  const full = valid && isFullCode(code);
  const decoded = full ? decodePlusCode(code) : null;

  const inputBg = isDark ? theme.backgroundSecondary : theme.backgroundDefault;
  const monoFont = (Fonts as any)?.mono || "monospace";

  const handlePaste = async () => {
    Haptics.selectionAsync();
    const clip = await Clipboard.getStringAsync();
    if (clip) {
      setInput(clip);
      setError(null);
    }
  };

  const handleOpen = () => {
    if (!decoded) {
      setError(
        !valid
          ? "Esse código não parece ser um Plus Code válido."
          : "Precisas do código completo (ex: 6F3M576Q+2Q3)."
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    track("search_opened_code", { via: "manual" });
    navigation.navigate("Map", {
      focus: {
        latitude: decoded.latitudeCenter,
        longitude: decoded.longitudeCenter,
        code,
      },
    });
  };

  const openInGoogleMaps = async () => {
    const url = `https://www.google.com/maps/place/${encodeURIComponent(code)}`;
    track("search_opened_external", { app: "google" });
    await Linking.openURL(url);
  };

  const openInWaze = async () => {
    if (!decoded) return;
    const url = `https://waze.com/ul?ll=${decoded.latitudeCenter},${decoded.longitudeCenter}&navigate=yes`;
    track("search_opened_external", { app: "waze" });
    await Linking.openURL(url);
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing["2xl"],
        paddingHorizontal: Spacing.lg,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedText type="h2" style={styles.title}>
        Procurar morada
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        Cola um Plus Code recebido por WhatsApp, SMS ou qualquer app.
      </ThemedText>

      <View style={styles.inputWrap}>
        <TextInput
          value={input}
          onChangeText={(t) => {
            setInput(t);
            setError(null);
          }}
          placeholder="6F3M576Q+2Q3"
          placeholderTextColor={theme.textMuted}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={handleOpen}
          style={[
            styles.input,
            {
              backgroundColor: inputBg,
              color: theme.text,
              borderColor: error ? Colors.light.error : theme.border,
              fontFamily: monoFont,
            },
          ]}
        />
        <Pressable
          onPress={handlePaste}
          style={[styles.pasteBtn, { backgroundColor: theme.primary }]}
          hitSlop={8}
        >
          <Feather name="clipboard" size={16} color="#FFFFFF" />
          <ThemedText style={styles.pasteText}>Colar</ThemedText>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Feather name="alert-circle" size={14} color={Colors.light.error} />
          <ThemedText style={[styles.errorText, { color: Colors.light.error }]}>
            {error}
          </ThemedText>
        </View>
      ) : null}

      {decoded ? (
        <View style={[styles.preview, { backgroundColor: inputBg }]}>
          <View style={styles.previewHeader}>
            <View style={[styles.previewIcon, { backgroundColor: theme.primary }]}>
              <Feather name="check" size={16} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.previewTitle}>Código válido</ThemedText>
          </View>
          <ThemedText style={[styles.previewCode, { fontFamily: monoFont }]}>
            {code}
          </ThemedText>
          <ThemedText style={[styles.previewCoords, { color: theme.textSecondary }]}>
            {decoded.latitudeCenter.toFixed(6)}, {decoded.longitudeCenter.toFixed(6)}
          </ThemedText>

          <View style={{ height: Spacing.lg }} />

          <Button
            onPress={handleOpen}
            style={{ backgroundColor: theme.primary, marginBottom: Spacing.sm }}
          >
            Ver no mapa
          </Button>

          {Platform.OS !== "web" ? (
            <View style={styles.externalRow}>
              <Pressable
                onPress={openInGoogleMaps}
                style={[styles.externalBtn, { borderColor: theme.border }]}
              >
                <Feather name="map" size={16} color={theme.text} />
                <ThemedText style={styles.externalText}>Google Maps</ThemedText>
              </Pressable>
              <Pressable
                onPress={openInWaze}
                style={[styles.externalBtn, { borderColor: theme.border }]}
              >
                <Feather name="navigation" size={16} color={theme.text} />
                <ThemedText style={styles.externalText}>Waze</ThemedText>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={[styles.hint, { backgroundColor: inputBg }]}>
          <ThemedText style={[styles.hintTitle, { color: theme.textSecondary }]}>
            O que é um Plus Code?
          </ThemedText>
          <ThemedText style={[styles.hintBody, { color: theme.textSecondary }]}>
            É um código tipo <ThemedText style={{ fontFamily: monoFont }}>6F3M576Q+2Q3</ThemedText> que
            representa um lugar com precisão de alguns metros. Funciona em qualquer parte do mundo.
          </ThemedText>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: 4 },
  subtitle: { marginBottom: Spacing.xl, fontSize: 15 },
  inputWrap: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 56,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 1,
    borderWidth: 1,
  },
  pasteBtn: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 56,
    borderRadius: BorderRadius.md,
  },
  pasteText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  errorRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  errorText: { fontSize: 13, flex: 1 },
  preview: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  previewIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  previewTitle: { fontWeight: "600", fontSize: 15 },
  previewCode: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  previewCoords: { fontSize: 12 },
  externalRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  externalBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  externalText: { fontSize: 14, fontWeight: "500" },
  hint: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  hintTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    fontWeight: "700",
  },
  hintBody: { fontSize: 14, lineHeight: 22 },
});
