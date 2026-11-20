import React from "react";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";

interface HeaderTitleProps {
  title: string;
}

export function HeaderTitle({ title }: HeaderTitleProps) {
  return <ThemedText style={styles.title}>{title}</ThemedText>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
});
