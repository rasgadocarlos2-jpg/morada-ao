import React, { useState, useEffect, useRef, useCallback } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import * as Linking from "expo-linking";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

import RootStackNavigator from "@/navigation/RootStackNavigator";
import OnboardingScreen from "@/screens/OnboardingScreen";
import PermissionScreen from "@/screens/PermissionScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getHasSeenOnboarding } from "@/lib/storage";
import { useTheme } from "@/hooks/useTheme";
import { Colors } from "@/constants/theme";
import { initAnalytics, screen as trackScreen, track } from "@/lib/analytics";
import { parseDeepLink } from "@/lib/deeplink";
import { decodePlusCode } from "@/lib/plusCodes";

type AppState = "loading" | "onboarding" | "permission" | "ready";

const navLinking = {
  prefixes: [
    Linking.createURL("/"),
    "moradaao://",
    "https://moradaao.com",
  ],
  config: {
    screens: {
      Map: "",
      Settings: "settings",
      Favorites: "favorites",
      Search: "search",
    },
  },
};

function AppContent() {
  const [appState, setAppState] = useState<AppState>("loading");
  const { theme } = useTheme();
  const navRef = useRef<any>(null);
  const prevRouteRef = useRef<string | undefined>(undefined);
  const pendingCodeRef = useRef<string | null>(null);

  const handleIncomingUrl = useCallback((url: string | null) => {
    const code = parseDeepLink(url);
    if (!code) return;
    const decoded = decodePlusCode(code);
    if (!decoded) return;
    track("deeplink_received", { code });

    if (navRef.current?.isReady?.()) {
      navRef.current.navigate("Map", {
        focus: {
          latitude: decoded.latitudeCenter,
          longitude: decoded.longitudeCenter,
          code,
        },
      });
    } else {
      pendingCodeRef.current = code;
    }
  }, []);

  useEffect(() => {
    initAnalytics();
    checkInitialState();

    Linking.getInitialURL().then(handleIncomingUrl);
    const sub = Linking.addEventListener("url", ({ url }) =>
      handleIncomingUrl(url)
    );
    return () => sub.remove();
  }, [handleIncomingUrl]);

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
    setAppState(permissionStatus.granted ? "ready" : "permission");
  };

  const handlePermissionGranted = () => setAppState("ready");

  if (appState === "loading") {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.backgroundRoot },
        ]}
      >
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
    <NavigationContainer
      ref={navRef}
      linking={navLinking as any}
      onReady={() => {
        const current = navRef.current?.getCurrentRoute()?.name;
        prevRouteRef.current = current;
        if (current) trackScreen(current);

        if (pendingCodeRef.current) {
          const code = pendingCodeRef.current;
          pendingCodeRef.current = null;
          const decoded = decodePlusCode(code);
          if (decoded) {
            navRef.current?.navigate("Map", {
              focus: {
                latitude: decoded.latitudeCenter,
                longitude: decoded.longitudeCenter,
                code,
              },
            });
          }
        }
      }}
      onStateChange={() => {
        const current = navRef.current?.getCurrentRoute()?.name;
        if (current && current !== prevRouteRef.current) {
          prevRouteRef.current = current;
          trackScreen(current);
        }
      }}
    >
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
