import React from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import Svg, { Rect } from "react-native-svg";

interface SymbolProps {
  size?: number;
  bgColor?: string;
  markColor?: string;
  rounded?: boolean;
}

/**
 * The brand symbol — the "+" of Plus Code on a navy tile.
 * 7×7 unit grid, arms 1×4, corner radius 1u (420 reference viewBox).
 */
export function MoradaSymbol({
  size = 48,
  bgColor = "#0D1A2A",
  markColor = "#EA5D1E",
  rounded = true,
}: SymbolProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 420 420">
      <Rect
        width={420}
        height={420}
        fill={bgColor}
        rx={rounded ? 60 : 0}
      />
      <Rect x={180} y={90} width={60} height={240} fill={markColor} />
      <Rect x={90} y={180} width={240} height={60} fill={markColor} />
    </Svg>
  );
}

interface WordmarkProps {
  size?: number;
  color?: string;
  dotColor?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Wordmark MORADA·AO — Inter / system sans, 700, letter-spaced 0.14em, orange dot.
 */
export function MoradaWordmark({
  size = 14,
  color = "#0D1A2A",
  dotColor = "#EA5D1E",
  style,
}: WordmarkProps) {
  return (
    <View style={[styles.wmRow, style]}>
      <Text style={{ fontSize: size, fontWeight: "700", letterSpacing: size * 0.14, color }}>
        MORADA
      </Text>
      <Text
        style={{
          fontSize: size,
          fontWeight: "700",
          color: dotColor,
          marginHorizontal: size * 0.1,
        }}
      >
        ·
      </Text>
      <Text style={{ fontSize: size, fontWeight: "700", letterSpacing: size * 0.14, color }}>
        AO
      </Text>
    </View>
  );
}

interface LockupProps {
  size?: number;
  color?: string;
  bgColor?: string;
  markColor?: string;
  dotColor?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Horizontal lockup: symbol + wordmark side by side.
 */
export function MoradaLockup({
  size = 20,
  color = "#0D1A2A",
  bgColor = "#0D1A2A",
  markColor = "#EA5D1E",
  dotColor = "#EA5D1E",
  style,
}: LockupProps) {
  const symbolSize = size * 1.8;
  return (
    <View style={[styles.lockupRow, { gap: symbolSize * 0.3 }, style]}>
      <MoradaSymbol size={symbolSize} bgColor={bgColor} markColor={markColor} />
      <MoradaWordmark size={size} color={color} dotColor={dotColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  wmRow: { flexDirection: "row", alignItems: "center" },
  lockupRow: { flexDirection: "row", alignItems: "center" },
});
