import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MapScreen from "@/screens/MapScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import FavoritesScreen from "@/screens/FavoritesScreen";
import SearchScreen from "@/screens/SearchScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";

export interface MapFocus {
  latitude: number;
  longitude: number;
  code?: string;
  label?: string;
}

export type RootStackParamList = {
  Map: { focus?: MapFocus } | undefined;
  Settings: undefined;
  Favorites: undefined;
  Search: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Definições" />,
        }}
      />
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Minhas moradas" />,
        }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Procurar código" />,
        }}
      />
    </Stack.Navigator>
  );
}
