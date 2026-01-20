import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MapScreen from "@/screens/MapScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";

export type RootStackParamList = {
  Map: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Definições" />,
        }}
      />
    </Stack.Navigator>
  );
}
