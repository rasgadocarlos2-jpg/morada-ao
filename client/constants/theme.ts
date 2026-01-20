import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#1A1A1A",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    buttonText: "#FFFFFF",
    tabIconDefault: "#687076",
    tabIconSelected: "#D62828",
    link: "#D62828",
    primary: "#D62828",
    primaryPressed: "#B91C1C",
    secondary: "#F77F00",
    success: "#059669",
    warning: "#F59E0B",
    error: "#DC2626",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F8F9FA",
    backgroundSecondary: "#F2F2F2",
    backgroundTertiary: "#E5E7EB",
    mapPin: "#D62828",
    userLocation: "#3B82F6",
    border: "#E5E7EB",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#9CA3AF",
    textMuted: "#6B7280",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#D62828",
    link: "#D62828",
    primary: "#D62828",
    primaryPressed: "#B91C1C",
    secondary: "#F77F00",
    success: "#059669",
    warning: "#F59E0B",
    error: "#DC2626",
    backgroundRoot: "#121212",
    backgroundDefault: "#1E1E1E",
    backgroundSecondary: "#2A2C2E",
    backgroundTertiary: "#353739",
    mapPin: "#D62828",
    userLocation: "#3B82F6",
    border: "#353739",
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
