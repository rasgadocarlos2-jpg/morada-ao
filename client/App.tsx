import React, { useState, useEffect } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

import RootStackNavigator from "@/navigation/RootStackNavigator";
import OnboardingScreen from "@/screens/OnboardingScreen";
import PermissionScreen from "@/screens/PermissionScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getHasSeenOnboarding } from "@/lib/storage";
import { useTheme } from "@/hooks/useTheme";
import { Colors } from "@/constants/theme";

type AppState = "loading" | "onboarding" | "permission" | "ready";

function AppContent() {
  const [appState, setAppState] = useState<AppState>("loading");
  const { theme } = useTheme();

  useEffect(() => {
    checkInitialState();
  }, []);

  const checkInitialState = async () => {
    const hasSeenOnboarding = await getHasSeenOnboarding();

    if (!hasSeenOnboarding) {
      setAppState("onboarding");
      return;
    }

    const permissionStatus = await Location.getForegroundPermissionsAsync();
    if (!permissionStatus.granted) {
      setAppState("permission");
      return;
    }

    setAppState("ready");
  };

  const handleOnboardingComplete = async () => {
    const permissionStatus = await Location.getForegroundPermissionsAsync();
    if (!permissionStatus.granted) {
      setAppState("permission");
    } else {
      setAppState("ready");
    }
  };

  const handlePermissionGranted = () => {
    setAppState("ready");
  };

  if (appState === "loading") {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (appState === "onboarding") {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  if (appState === "permission") {
    return <PermissionScreen onPermissionGranted={handlePermissionGranted} />;
  }

  return (
    <NavigationContainer>
      <RootStackNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={styles.root}>
            <KeyboardProvider>
              <AppContent />
              <StatusBar style="auto" />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
