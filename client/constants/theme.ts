import { Platform } from "react-native";

// Brand tokens from the Morada AO brand book v1.0 — navy #0D1A2A + orange #EA5D1E.
export const Colors = {
  light: {
    text: "#0D1A2A",
    textSecondary: "#4A5A6E",
    textMuted: "#8792A3",
    buttonText: "#FFFFFF",
    tabIconDefault: "#8792A3",
    tabIconSelected: "#EA5D1E",
    link: "#EA5D1E",
    primary: "#EA5D1E",
    primaryPressed: "#CC4F17",
    primarySoft: "#FDECE2",
    secondary: "#0D1A2A",
    secondarySoft: "#F2EFE8",
    accent: "#EA5D1E",
    success: "#1D7D56",
    successSoft: "#DFF2E8",
    warning: "#C98914",
    warningSoft: "#FBEFD1",
    error: "#C65349",
    errorSoft: "#F8E6E4",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#FAFAF7",
    backgroundSecondary: "#F2EFE8",
    backgroundTertiary: "#E8E6DF",
    mapPin: "#EA5D1E",
    userLocation: "#0D1A2A",
    border: "#E8E6DF",
    iconBg: "#FDECE2",
    cardElevated: "#FFFFFF",
  },
  dark: {
    text: "#ECEFF3",
    textSecondary: "#B5BFCE",
    textMuted: "#7C8899",
    buttonText: "#FFFFFF",
    tabIconDefault: "#7C8899",
    tabIconSelected: "#FF7A3C",
    link: "#FF7A3C",
    primary: "#FF7A3C",
    primaryPressed: "#EA5D1E",
    primarySoft: "#3A1E13",
    secondary: "#ECEFF3",
    secondarySoft: "#15283C",
    accent: "#FF7A3C",
    success: "#34D399",
    successSoft: "#193226",
    warning: "#FBBF24",
    warningSoft: "#352A14",
    error: "#FF8A80",
    errorSoft: "#3A1E1E",
    backgroundRoot: "#0D1A2A",
    backgroundDefault: "#122132",
    backgroundSecondary: "#15283C",
    backgroundTertiary: "#1E2E42",
    mapPin: "#FF7A3C",
    userLocation: "#60A5FA",
    border: "#1E2E42",
    iconBg: "#15283C",
    cardElevated: "#122132",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  code: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "500" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Shadows = {
  fab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 4,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bottomSheet: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
};
