# 🔥 Firebase Setup — Morada AO

Guia passo-a-passo para configurar Firebase (Crashlytics, Analytics, Remote Config, Cloud Messaging) na app.

---

## 1. Criar o projeto no Firebase Console

1. Vai a [console.firebase.google.com](https://console.firebase.google.com/)
2. Clica **"Add project"** → nome: `morada-ao`
3. Ativa o **Google Analytics** (necessário para Crashlytics e eventos)
4. Escolhe/cria uma conta de Analytics

---

## 2. Registar as apps iOS e Android

### Android

1. No Firebase Console → Project settings → **Your apps** → adicionar **Android**
2. **Package name**: `com.moradaao.app` (tem de ser igual ao `android.package` do `app.json`)
3. **App nickname**: `Morada AO Android`
4. **SHA-1** (opcional agora, obrigatório mais tarde para Google Sign-in e App Links):
   ```bash
   npx eas credentials
   # Escolhe Android → production → "View keystore" → copia SHA-1
   ```
5. Descarrega **`google-services.json`**
6. Coloca em `./firebase/google-services.json`

### iOS

1. No Firebase Console → add app → **iOS**
2. **Bundle ID**: `com.moradaao.app`
3. **App nickname**: `Morada AO iOS`
4. Descarrega **`GoogleService-Info.plist`**
5. Coloca em `./firebase/GoogleService-Info.plist`

> ⚠️ Estes dois ficheiros **não** são comitados (já estão no `.gitignore`).

---

## 3. Instalar dependências

```bash
npm install
```

(Os pacotes `@react-native-firebase/*` já estão no `package.json`.)

---

## 4. Rebuild do dev client

Firebase é código nativo — precisas de um novo dev client depois de instalar:

```bash
npx eas build --profile development --platform android
npx eas build --profile development --platform ios
```

Instala o build no device.

---

## 5. Ativar os serviços no Console

### Crashlytics
- Firebase Console → **Crashlytics** → "Enable Crashlytics"
- Força um crash para verificar:
  ```ts
  import crashlytics from "@react-native-firebase/crashlytics";
  crashlytics().crash();
  ```
- O crash deve aparecer em ~5 minutos no dashboard

### Analytics
- Firebase Console → **Analytics** → aparece automaticamente
- Os eventos custom da app (`code_copied`, `code_shared`, etc.) aparecem em `Events` depois de 24h
- Marca eventos importantes como **conversions**: `onboarding_completed`, `code_shared`

### Remote Config
- Firebase Console → **Remote Config** → "Create configuration"
- Adiciona defaults, p.ex.:
  - `enable_new_onboarding` (boolean, false)
  - `share_message_template` (string)
  - `maintenance_mode` (boolean, false)

### Cloud Messaging (FCM)
- Firebase Console → **Project settings** → **Cloud Messaging**
- **iOS**: faz upload da APNs Authentication Key (`.p8`) da Apple Developer Portal
- **Android**: funciona automaticamente após o `google-services.json`

Para pedir token no cliente:
```ts
import messaging from "@react-native-firebase/messaging";
const token = await messaging().getToken();
```

---

## 6. Verificar

```bash
# Correr a app
npx expo start --dev-client

# Abrir a app
# Fazer: onboarding → permission → code copy → code share
# Verificar nos consoles do Firebase que os eventos chegam
```

---

## 7. Troubleshooting

**Crashes não aparecem no Crashlytics**
- Em iOS, Crashlytics só reporta crashes nativos **em releases**, não em dev. Testa com um build de preview.
- Força um crash: `crashlytics().crash()` (não é um `throw` — é um crash real)

**`google-services.json not found`**
- Confirma o path em `app.json` → `android.googleServicesFile`
- Confirma que o ficheiro está em `./firebase/google-services.json`

**Analytics events não aparecem**
- Delay normal: até 24h para aparecer no dashboard
- Para debug em tempo real: Firebase Console → Analytics → **DebugView**
- Ativa debug no Android: `adb shell setprop debug.firebase.analytics.app com.moradaao.app`

---

## 📚 Links úteis

- [React Native Firebase docs](https://rnfirebase.io/)
- [Expo + RNFirebase guide](https://rnfirebase.io/#expo)
- [Firebase Console](https://console.firebase.google.com/)
