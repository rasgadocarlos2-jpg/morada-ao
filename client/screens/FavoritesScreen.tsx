import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";
import {
  SavedAddress,
  SavedAddressPreset,
  deleteAddress,
  getSavedAddresses,
} from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { track } from "@/lib/analytics";
import { generateShareMessage } from "@/lib/plusCodes";

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, "Favorites">;
}

const PRESET_ICONS: Record<SavedAddressPreset, keyof typeof Feather.glyphMap> = {
  home: "home",
  work: "briefcase",
  family: "heart",
  friend: "users",
  business: "shopping-bag",
  other: "map-pin",
};

export default function FavoritesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const [items, setItems] = useState<SavedAddress[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const list = await getSavedAddresses();
    setItems(list);
    setLoaded(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    track("favorites_opened");
  }, []);

  const handleOpen = (addr: SavedAddress) => {
    Haptics.selectionAsync();
    track("favorite_opened", { preset: addr.preset });
    navigation.navigate("Map", {
      focus: {
        latitude: addr.latitude,
        longitude: addr.longitude,
        label: addr.label,
      },
    });
  };

  const handleCopy = async (addr: SavedAddress) => {
    await Clipboard.setStringAsync(addr.fullCode);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    track("favorite_copied", { preset: addr.preset });
  };

  const handleShare = async (addr: SavedAddress) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: generateShareMessage({
          fullCode: addr.fullCode,
          shortCode: addr.shortCode,
          reference: addr.reference,
          latitude: addr.latitude,
          longitude: addr.longitude,
        }),
      });
      track("favorite_shared", { preset: addr.preset });
    } catch {}
  };

  const handleDelete = (addr: SavedAddress) => {
    Alert.alert(
      "Apagar morada?",
      `"${addr.label}" será removida das tuas moradas guardadas.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            await deleteAddress(addr.id);
            track("favorite_deleted", { preset: addr.preset });
            load();
          },
        },
      ]
    );
  };

  const cardBg = isDark ? theme.backgroundSecondary : theme.backgroundDefault;

  if (loaded && items.length === 0) {
    return (
      <View
        style={[
          styles.empty,
          {
            backgroundColor: theme.backgroundRoot,
            paddingTop: headerHeight,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <View style={[styles.emptyIcon, { backgroundColor: theme.iconBg }]}>
          <Feather name="bookmark" size={40} color={theme.primary} />
        </View>
        <ThemedText type="h3" style={styles.emptyTitle}>
          Ainda não guardaste nenhuma morada
        </ThemedText>
        <ThemedText style={[styles.emptyDesc, { color: theme.textSecondary }]}>
          No ecrã do mapa, carrega em "Guardar" para teres acesso rápido às tuas moradas favoritas.
        </ThemedText>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.emptyBtn,
            { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Feather name="map" size={18} color="#FFFFFF" />
          <ThemedText style={styles.emptyBtnText}>Abrir o mapa</ThemedText>
        </Pressable>
      </View>
    );
  }

  const handleMore = (addr: SavedAddress) => {
    Haptics.selectionAsync();
    Alert.alert(addr.label, addr.fullCode, [
      { text: "Copiar código", onPress: () => handleCopy(addr) },
      { text: "Apagar", style: "destructive", onPress: () => handleDelete(addr) },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  return (
    <FlatList
      style={{ backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.md,
        paddingBottom: insets.bottom + Spacing["2xl"],
        paddingHorizontal: Spacing.lg,
        flexGrow: 1,
      }}
      data={items}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      ListHeaderComponent={
        <ThemedText style={[styles.count, { color: theme.textSecondary }]}>
          {items.length === 1 ? "1 guardada" : `${items.length} guardadas`}
        </ThemedText>
      }
      ListFooterComponent={
        <View style={styles.footer}>
          <Pressable
            onPress={() => navigation.navigate("Map", {})}
            style={({ pressed }) => [
              styles.addBtn,
              { borderColor: theme.textSecondary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="plus" size={18} color={theme.primary} />
            <ThemedText style={[styles.addText, { color: theme.text }]}>
              Guardar o sítio onde estou
            </ThemedText>
          </Pressable>
          <View style={styles.tip}>
            <ThemedText style={styles.tipEyebrow}>DICA</ThemedText>
            <ThemedText style={styles.tipText}>
              Guarda a casa de quem visitas muito. Na próxima vez, partilhas a
              morada com um toque, sem lá estar.
            </ThemedText>
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => handleOpen(item)}
          onLongPress={() => handleMore(item)}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: cardBg, borderColor: theme.border, opacity: pressed ? 0.92 : 1 },
          ]}
        >
          <View style={styles.thumb}>
            <Feather name={PRESET_ICONS[item.preset] ?? "map-pin"} size={24} color="#FF7A3C" />
          </View>
          <View style={styles.cardBody}>
            <ThemedText style={styles.cardLabel} numberOfLines={1}>
              {item.label}
            </ThemedText>
            <ThemedText style={[styles.cardCode, { color: theme.text }]} numberOfLines={1}>
              {item.shortCode && item.reference
                ? `${item.shortCode} ${item.reference}`
                : item.fullCode}
            </ThemedText>
            <ThemedText style={[styles.cardSub, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.fullCode}
            </ThemedText>
          </View>
          <Pressable
            hitSlop={8}
            onPress={() => handleMore(item)}
            accessibilityLabel={`Mais opções de ${item.label}`}
            style={styles.moreBtn}
          >
            <Feather name="more-vertical" size={18} color={theme.textSecondary} />
          </Pressable>
          <Pressable
            onPress={() => handleShare(item)}
            accessibilityLabel={`Partilhar ${item.label}`}
            style={({ pressed }) => [styles.shareBtn, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Feather name="share-2" size={18} color="#FFFFFF" />
          </Pressable>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  emptyDesc: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
    lineHeight: 22,
  },
  emptyBtn: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
  },
  emptyBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  count: { fontSize: 12, fontFamily: (Fonts as any)?.mono || "monospace", marginBottom: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 18,
    gap: 14,
    borderWidth: 1,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: "#0D1A2A",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardLabel: { fontSize: 16, fontWeight: "700" },
  cardCode: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
    fontFamily: (Fonts as any)?.mono || "monospace",
  },
  cardSub: { fontSize: 12, marginTop: 2, fontFamily: (Fonts as any)?.mono || "monospace" },
  moreBtn: { width: 28, height: 44, alignItems: "center", justifyContent: "center" },
  shareBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#0D1A2A",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: { marginTop: 16, gap: 16 },
  addBtn: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  addText: { fontSize: 15, fontWeight: "600" },
  tip: { backgroundColor: "#0D1A2A", borderRadius: 18, padding: 18 },
  tipEyebrow: {
    fontSize: 11,
    letterSpacing: 2,
    color: "rgba(255,255,255,0.62)",
    fontFamily: (Fonts as any)?.mono || "monospace",
  },
  tipText: { fontSize: 15, lineHeight: 22, color: "#FFFFFF", marginTop: 8 },
});
