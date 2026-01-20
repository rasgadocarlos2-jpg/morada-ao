# Morada AO - Digital Address App for Angola

## Overview
Morada AO is a mobile app focused on Angola for generating digital addresses using Plus Codes (Open Location Code). The app creates unique codes for any location, perfect for areas without formal street addresses - enabling deliveries, emergency services, and easy location sharing.

## Key Features
- **GPS-based Plus Code Generation**: Automatically generates codes from your current location
- **Interactive Map**: Drag the map to select any location (fixed center pin)
- **Full Plus Code (Always Works)**: The primary, globally unique address code
- **Short Plus Code**: Easier to remember, but requires neighborhood/city context
- **One-tap Sharing**: Share via WhatsApp, SMS, or any messaging app
- **Copy to Clipboard**: Quick code copying with visual feedback
- **Reverse Geocoding**: Automatic neighborhood/city detection using OpenStreetMap
- **Offline-ready codes**: Plus Codes work without internet once generated

## Technical Architecture

### Frontend (Expo React Native)
- **Navigation**: Stack-based navigation (no tab bar - focused utility app)
- **Screens**:
  - OnboardingScreen: Educational intro for first-time users
  - PermissionScreen: Location permission request with clear explanation
  - MapScreen: Main map with Plus Code generation and sharing
  - SettingsScreen: App info and educational content

### Backend (Express.js)
- **API Endpoints**:
  - `GET /api/geocode?lat=&lng=`: Reverse geocoding via Nominatim/OSM
  - `GET /api/health`: Health check endpoint

### Key Libraries
- `react-native-maps`: Native map display (iOS/Android)
- `expo-location`: GPS location services
- `open-location-code`: Plus Code generation (encode/shorten/validate)
- `expo-clipboard`: Copy codes to clipboard
- `expo-haptics`: Tactile feedback on actions

## Design System
The app follows Angola-inspired design guidelines:
- **Primary Color**: #D62828 (Angolan Red)
- **Secondary Color**: #F77F00 (Warm Orange)
- **Typography**: System fonts with monospace for Plus Codes
- **Design Philosophy**: Utilitarian, trust-focused, map-centric

## Important Rules (From Spec)
1. Full Plus Code is the primary/official address
2. Short Plus Code is auxiliary - only used with valid neighborhood/city reference
3. Share links ALWAYS use the full code: `https://plus.codes/FULLCODE`
4. Users cannot manually enter Plus Codes - all codes generated from GPS/map
5. If no reference (bairro/cidade) is available, only the full code is shared

## Recent Changes
- 2026-01-19: Initial MVP build with all core features
- Platform-specific map component for web/native compatibility
- OpenLocationCode integration for Plus Code generation
- Nominatim API integration for reverse geocoding

## Project Structure
```
client/
  ├── App.tsx                    # Root component with onboarding flow
  ├── screens/
  │   ├── OnboardingScreen.tsx   # First-time user education
  │   ├── PermissionScreen.tsx   # Location permission request
  │   ├── MapScreen.tsx          # Main map and Plus Code display
  │   └── SettingsScreen.tsx     # App settings and info
  ├── components/
  │   ├── MapViewComponent.tsx   # Native map (iOS/Android)
  │   └── MapViewComponent.web.tsx # Web fallback
  ├── lib/
  │   ├── plusCodes.ts           # Plus Code generation utilities
  │   ├── geocoding.ts           # Reverse geocoding API client
  │   └── storage.ts             # AsyncStorage for onboarding state
  └── constants/
      └── theme.ts               # Colors, spacing, typography
server/
  └── routes.ts                  # API endpoints (geocoding proxy)
```

## Running the App
- **Web**: Port 8081 (preview only - maps require mobile)
- **Mobile (Expo Go)**: Scan QR code to test on physical device
- **Backend**: Port 5000 (API server)

## User Preferences
- Language: Portuguese (pt-PT/pt-AO)
- Target market: Angola
- Focus areas: Cazenga, Viana, Maianga, Kilamba, Benguela
