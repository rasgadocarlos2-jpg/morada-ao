import React, { forwardRef } from "react";
import MapView, { PROVIDER_DEFAULT, MapType } from "react-native-maps";

interface MapViewComponentProps {
  style?: any;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onRegionChangeComplete?: (region: any) => void;
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  showsCompass?: boolean;
  mapType?: MapType;
  userInterfaceStyle?: "light" | "dark";
  children?: React.ReactNode;
}

export interface MapViewRef {
  animateToRegion: (region: any, duration?: number) => void;
}

export const MapViewComponent = forwardRef<MapViewRef, MapViewComponentProps>(
  (props, ref) => {
    return (
      <MapView
        ref={ref as any}
        provider={PROVIDER_DEFAULT}
        {...props}
      />
    );
  }
);
