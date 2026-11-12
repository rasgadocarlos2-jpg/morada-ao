# 🛠️ Setup Guide — Morada AO

Guia para preparar o ambiente de desenvolvimento da app **Morada AO**.
A app usa **Expo + React Native + TypeScript** (não Flutter).

---

## 📋 Pré-requisitos

- [Node.js 20+](https://nodejs.org/)
- [Git](https://git-scm.com/downloads)
- [Expo CLI](https://docs.expo.dev/) — já incluído via `npx`
- Conta [Expo (EAS)](https://expo.dev/) — para builds de dev e produção
- Para iOS: Mac com Xcode 15+
- Para Android: Android Studio ou um device físico com Expo Go/Dev Client

Opcional mas recomendado:
- VS Code com as extensões: ESLint, Prettier, React Native Tools

---

## 🚀 Setup rápido

```bash
# 1. Clonar
git clone https://github.com/rasgadocarlos2-jpg/morada-ao.git
cd morada-ao

# 2. Instalar dependências
npm install

# 3. Login no EAS (se vais fazer builds)
npx eas login

# 4. Correr a app em dev
npx expo start
```

Depois escolhe no terminal: `a` (Android), `i` (iOS simulator), ou escaneia o QR code com Expo Go.

---

## 🔑 Variáveis de ambiente

Cria um `.env` na raiz (não comitado) com:

```bash
EXPO_PUBLIC_POSTHOG_API_KEY=phc_xxxxxxxxxxxx
EXPO_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

O Firebase não usa env vars — usa os ficheiros `google-services.json` (Android) e `GoogleService-Info.plist` (iOS). Ver [FIREBASE-SETUP.md](./FIREBASE-SETUP.md).

---

## 🏗️ Builds nativos

A app usa pacotes nativos (`@react-native-firebase/*`, `posthog-react-native-session-replay`), por isso **não funciona em Expo Go** — tens de criar um **dev client**:

```bash
# Primeira vez (gera um APK/IPA de dev que inclui os módulos nativos)
npx eas build --profile development --platform android
npx eas build --profile development --platform ios
```

Instala o build no device e depois corre `npx expo start --dev-client` para o Metro.

---

## 📁 Estrutura do projeto

```
morada-ao/
├── client/
│   ├── App.tsx                 # Entry point
│   ├── index.js
│   ├── screens/                # Telas (Map, Onboarding, Permission, Settings)
│   ├── components/             # Componentes partilhados
│   ├── navigation/             # React Navigation
│   ├── constants/              # Theme, cores, spacing
│   ├── hooks/                  # Custom hooks
│   └── lib/                    # Plus Codes, geocoding, analytics, storage
├── server/                     # Express server (landing page / API opcional)
├── shared/                     # Tipos partilhados cliente/servidor
├── assets/images/              # Ícones, splash, ilustrações
├── firebase/                   # google-services.json / GoogleService-Info.plist (gitignore)
├── app.json                    # Config Expo
├── eas.json                    # Config EAS (dev, preview, production)
└── package.json
```

---

## 🧪 Verificações antes de commit

```bash
# TypeScript
npm run check:types

# Lint
npm run lint

# Formatar
npm run format
```

---

## 🚢 Submeter às lojas

Ver [STORE-SUBMISSION.md](./STORE-SUBMISSION.md) para o checklist completo.

Resumo:

```bash
# Build de produção
npx eas build --profile production --platform all

# Submeter
npx eas submit --profile production --platform all
```

---

## 🐛 Troubleshooting

**`npx expo start` dá erro de Metro cache**
```bash
npx expo start --clear
```

**App crash depois de instalar packages Firebase**
Precisas de rebuilt o dev client — Firebase é código nativo:
```bash
npx eas build --profile development --platform android --clear-cache
```

**TypeScript: Cannot find module '@/lib/...'**
Verifica `babel.config.js` e `tsconfig.json` — o alias `@/*` deve apontar para `client/*`.

**Mapa não aparece em iOS**
Verifica que fizeste build com o dev client (não Expo Go) e que tens Google Maps SDK configurado se usas `provider="google"`.

---

## 🤝 Contribuir

Ver [CONTRIBUTING.md](./CONTRIBUTING.md).

---

**Made in Angola 🇦🇴 with ❤️**
