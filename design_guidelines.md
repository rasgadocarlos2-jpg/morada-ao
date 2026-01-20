# Morada AO - Design Guidelines

## 1. Brand Identity

**Purpose**: Morada AO solves Angola's addressing crisis by providing reliable digital addresses using Plus Codes, enabling deliveries, emergency services, and location sharing in areas without formal street addresses.

**Aesthetic Direction**: **Utilitarian/Trust-focused**
- Bold, high-contrast interface optimized for outdoor readability
- Orange/red accent (Angola flag colors) to evoke national pride
- Clean, map-centric design that prioritizes function over decoration
- Educational tone: informative without being patronizing

**Memorable Element**: The persistent center pin on the map (user drags map, not pin) - an inverted interaction that feels unique and precise.

## 2. Navigation Architecture

**Root Navigation**: Stack-only (single-purpose utility app)

**Screen Flow**:
1. Splash/Onboarding (educational, dismissible after first use)
2. Location Permission Request
3. Main Map Screen (home)
4. Settings (accessed via header button)

No tab bar needed - this is a focused tool, not a multi-feature platform.

## 3. Screen-by-Screen Specifications

### 3.1 Splash/Onboarding Screen
**Purpose**: Educate first-time users on Plus Codes and why Morada AO exists.

**Layout**:
- Full-screen, non-scrollable
- Illustration at top (60% of screen)
- Text content below
- "Começar" button at bottom (fixed, safe area aware)
- Skip button in header (top-right, text only)

**Components**:
- Illustration: Map of Angola with Plus Code grid overlay
- Headline (H1): "A tua morada digital"
- Body text: "Em Angola, muitas zonas não têm nomes de ruas. Morada AO cria um código único para qualquer localização."
- Primary button: "Começar"

**Safe Area**: 
- Top: insets.top + Spacing.xl
- Bottom: insets.bottom + Spacing.xl

---

### 3.2 Permission Request Screen
**Purpose**: Request location access with clear explanation.

**Layout**:
- Centered content (icon, text, button)
- Non-scrollable

**Components**:
- System icon (location pin)
- Headline (H2): "Precisamos da tua localização"
- Body text: "Para gerar o código da tua morada, a app precisa saber onde estás."
- Primary button: "Permitir Localização"
- Secondary text button: "Explicar mais"

**Safe Area**: Standard centered layout

---

### 3.3 Main Map Screen (Home)
**Purpose**: Generate and display Plus Codes based on map location.

**Layout**:
- Header: Transparent, with Settings icon (top-right)
- Map fills entire screen (OpenStreetMap)
- Fixed center pin (SVG crosshair icon)
- Floating bottom sheet (draggable, non-dismissible)
- Floating action button (bottom-right): "Partilhar"

**Components**:

**Map Layer**:
- OpenStreetMap tiles
- User location indicator (blue dot with pulsing ring)
- Fixed center crosshair (does NOT move - map drags beneath it)

**Bottom Sheet** (white background, rounded top corners):
- Drag handle at top
- Section 1: "Morada segura (funciona sempre)"
  - Full Plus Code in monospace font, large, copyable
  - Copy button (icon only, right-aligned)
- Divider line
- Section 2: "Morada curta (mais fácil de lembrar)"
  - Short Plus Code + reference location
  - Warning text (small, muted): "O código curto precisa do nome do bairro ou cidade para funcionar."
- Current coordinates (lat/lng, small text, muted)

**Floating Action Button**:
- Position: bottom-right
- Offset: 16pt from right, above bottom sheet
- Icon: Share/send icon
- Label: "Partilhar"
- Drop shadow (specified in prompt)

**Safe Area**:
- Map: No insets (fills screen)
- Bottom sheet: Anchored to bottom edge (handles own safe area)
- FAB: Right: Spacing.lg, Bottom: bottomSheetPeekHeight + Spacing.xl

**Empty State**: If reverse geocoding fails, show:
- Full code only
- Message: "Adiciona manualmente o nome do bairro ao partilhar."

---

### 3.4 Settings Screen
**Purpose**: App preferences and information.

**Layout**:
- Standard header with back button (left)
- Scrollable list of settings

**Components**:
- Theme toggle (Light/Dark)
- Language (Português/English)
- About section: Version, attribution to Plus Codes
- Link: "Como funciona o Plus Code?"

**Safe Area**: Standard scrollable screen

---

## 4. Color Palette

**Primary (Angolan Red)**: `#D62828` - for CTAs, active states, selected pin
**Primary Variant**: `#B91C1C` - for pressed states

**Secondary (Warm Orange)**: `#F77F00` - for warnings, educational highlights

**Background**: 
- Light mode: `#FFFFFF`
- Dark mode: `#121212`

**Surface**:
- Light: `#F8F9FA`
- Dark: `#1E1E1E`

**Text**:
- Primary: `#1A1A1A` (light) / `#FFFFFF` (dark)
- Secondary: `#6B7280` (light) / `#9CA3AF` (dark)
- Muted: `#9CA3AF` (light) / `#6B7280` (dark)

**Semantic**:
- Success: `#059669`
- Warning: `#F59E0B`
- Error: `#DC2626`

**Map UI**:
- Pin/Crosshair: `#D62828`
- User location dot: `#3B82F6`

---

## 5. Typography

**Font**: Inter (Google Font) - excellent legibility at small sizes, technical feel.

**Type Scale**:
- H1 (Onboarding headline): 28pt, Bold
- H2 (Section headers): 20pt, Semibold
- Body: 16pt, Regular
- Small (coordinates, warnings): 14pt, Regular
- Code (Plus Codes): 20pt, Monospace (Roboto Mono), Medium

**Line Height**: 1.5 for body text, 1.2 for headings

---

## 6. Visual Design

**Icons**: Feather icons from @expo/vector-icons - clean, minimal

**Button Styles**:
- Primary: Filled, Primary color, 48pt height, 12pt border radius
- Secondary: Outlined, 1pt border, Primary color text
- Text button: No border, Primary color text, tap opacity 0.7

**Floating Elements**:
- FAB: Use specified shadow (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2)
- Bottom sheet: subtle elevation, no shadow on drag handle

**Interactive Feedback**:
- All touchables: opacity 0.8 on press OR scale 0.98
- Code copy buttons: flash green (Success color) on copy

---

## 7. Assets to Generate

**Required Assets**:

1. **icon.png** - App icon
   - Orange/red gradient background
   - White Plus Code grid symbol or location pin
   - WHERE USED: Device home screen

2. **splash-icon.png** - Splash screen icon
   - Same as app icon
   - WHERE USED: App launch screen

3. **onboarding-map.png** - Angola map with Plus Code overlay
   - Stylized Angola outline
   - Grid of Plus Code squares
   - Orange accent color
   - WHERE USED: Onboarding screen illustration

4. **empty-location.png** - No reverse geocoding data
   - Simple, minimal illustration
   - Pin with question mark
   - WHERE USED: Bottom sheet when location name unavailable

5. **avatar-placeholder.png** - User profile placeholder
   - Generic avatar (Angola flag colors)
   - WHERE USED: Settings screen (future feature)

**Optional**:
6. **tutorial-drag.png** - How to use the map
   - Animated hand gesture showing map drag
   - WHERE USED: First-time tooltip

---

**Design Principle**: Every pixel serves the core mission - generating accurate addresses. Clarity over cleverness. Trust over trendiness.