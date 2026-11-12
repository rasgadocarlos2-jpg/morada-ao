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
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
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

  return (
    <FlatList
      style={{ backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.md,
        paddingBottom: insets.bottom + Spacing["2xl"],
        paddingHorizontal: Spacing.lg,
      }}
      data={items}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => handleOpen(item)}
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: cardBg,
              borderColor: theme.border,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <View style={[styles.cardIcon, { backgroundColor: theme.iconBg }]}>
            <Feather
              name={PRESET_ICONS[item.preset] ?? "map-pin"}
              size={22}
              color={theme.primary}
            />
          </View>
          <View style={styles.cardBody}>
            <ThemedText style={styles.cardLabel}>{item.label}</ThemedText>
            <ThemedText style={[styles.cardCode, { color: theme.textSecondary }]}>
              {item.shortCode && item.reference
                ? `${item.shortCode} ${item.reference}`
                : item.fullCode}
            </ThemedText>
          </View>
          <View style={styles.cardActions}>
            <IconButton icon="copy" onPress={() => handleCopy(item)} theme={theme} />
            <IconButton icon="share-2" onPress={() => handleShare(item)} theme={theme} />
            <IconButton
              icon="trash-2"
              onPress={() => handleDelete(item)}
              theme={theme}
              danger
            />
          </View>
        </Pressable>
      )}
    />
  );
}

function IconButton({
  icon,
  onPress,
  theme,
  danger,
}: {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  theme: any;
  danger?: boolean;
}) {
  return (
    <Pressable
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconBtn,
        {
          backgroundColor: pressed ? theme.backgroundTertiary : "transparent",
        },
      ]}
    >
      <Feather
        name={icon}
        size={18}
        color={danger ? Colors.light.error : theme.textSecondary}
      />
    </Pressable>
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
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardCode: {
    fontSize: 13,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: "row",
    gap: 2,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
