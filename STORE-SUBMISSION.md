# 🚢 Store Submission Checklist — Morada AO

Checklist para lançar nas duas lojas.

---

## 📱 Antes de qualquer coisa

- [ ] `app.json` → `version` e `ios.buildNumber`/`android.versionCode` corretos
- [ ] Ícone (`assets/images/icon.png`) 1024×1024, sem transparência
- [ ] Splash screen testado em dark e light
- [ ] Firebase configurado ([FIREBASE-SETUP.md](./FIREBASE-SETUP.md))
- [ ] PostHog configurado ([POSTHOG-SETUP.md](./POSTHOG-SETUP.md))
- [ ] Política de privacidade **publicada em URL público**
      (p.ex. `https://rasgadolabs.com/morada-ao/privacy`)
      → copiar [PRIVACY.md](./PRIVACY.md) para o site
- [ ] Testado em device físico Android + iOS (não só simulador)
- [ ] Testado em 3G lento (DevTools → Network throttling)
- [ ] Testado com GPS desligado (fluxo de erro)
- [ ] Testado com permissão de localização negada

---

## 🤖 Google Play Store

### 1. Conta e setup
- [ ] Google Play Console account ($25 one-time)
- [ ] Criar app em Play Console → `MORADA AO`
- [ ] Preencher **Content rating** (Everyone)
- [ ] Preencher **Target audience** (13+)
- [ ] **Data safety form** (RGPD):
  - Location (approximate + precise) — collected, not shared, used for app functionality
  - App activity (analytics) — collected, not shared, used for analytics
  - Crash logs — collected, not shared, used for app functionality
  - **Encrypted in transit:** Yes
  - **User can request deletion:** Yes

### 2. Service account para EAS Submit
- [ ] Google Cloud Console → criar service account
- [ ] Role: `Service Account User` + no Play Console: `Admin` da app
- [ ] Download do JSON → `./google-play-service-account.json` (gitignore!)

### 3. Store listing
- [ ] App name: **MORADA AO**
- [ ] Short description (80 chars): `A tua morada digital em Angola — Plus Codes para qualquer lugar`
- [ ] Full description (4000 chars): ver `store/android-description.md` (abaixo)
- [ ] App icon (512×512)
- [ ] Feature graphic (1024×500)
- [ ] Screenshots mínimo 2, recomendado 8 (phone)
- [ ] Vídeo YouTube (opcional)
- [ ] Category: **Maps & Navigation**
- [ ] Email de contacto: carlos@rasgadolabs.com
- [ ] Privacy policy URL

### 4. Build & submit
```bash
npx eas build --profile production --platform android
npx eas submit --profile production --platform android
```

- [ ] Primeiro submit vai para **internal testing** track
- [ ] Testar com 1-2 testers
- [ ] Promote → **closed testing** (opcional)
- [ ] Promote → **production**
- [ ] Review Google: 1-7 dias

---

## 🍎 Apple App Store

### 1. Conta e setup
- [ ] Apple Developer Program ($99/ano)
- [ ] App Store Connect → **My Apps** → `+` → New App
- [ ] Bundle ID: `com.moradaao.app`
- [ ] SKU: `moradaao-001`
- [ ] Preencher `ascAppId` e `appleTeamId` no `eas.json`

### 2. App Privacy
- [ ] App Store Connect → App Privacy → preencher:
  - Location → **Precise** → used for App Functionality, linked to user? **No**
  - Diagnostics (crashes) → Linked to user? **No**
  - Product Interaction → Linked to user? **No**
- [ ] Tracking: **Does Not Track** (não fazemos cross-app tracking)

### 3. Store listing
- [ ] Nome: **MORADA AO** (max 30 chars)
- [ ] Subtítulo: `A tua morada digital em Angola` (30 chars)
- [ ] Keywords (100 chars): `morada,angola,plus code,gps,mapa,localização,entrega,luanda,endereço`
- [ ] Descrição (ver `store/ios-description.md` abaixo)
- [ ] Promotional text (170 chars)
- [ ] Support URL: `https://rasgadolabs.com`
- [ ] Marketing URL: `https://rasgadolabs.com/morada-ao`
- [ ] Privacy policy URL
- [ ] Screenshots:
  - 6.9" (iPhone 16 Pro Max): mínimo 2, recomendado 6
  - 6.5" (iPhone 11 Pro Max): mínimo 2
  - iPad 13" (opcional, só se suportas tablet — e suportas)
- [ ] App preview vídeo (15-30s, opcional)
- [ ] Categoria primária: **Navigation**, secundária: **Utilities**
- [ ] Age rating: 4+
- [ ] Copyright: `© 2026 Rasgado Labs`

### 4. Build & submit
```bash
npx eas build --profile production --platform ios
npx eas submit --profile production --platform ios
```

- [ ] Build aparece em App Store Connect → TestFlight
- [ ] Internal testing com 1-2 testers
- [ ] Submit for review
- [ ] Preencher **Review Information**: demo account N/A, notas:
  > A app usa GPS para gerar Plus Codes. Pode ser testada em qualquer
  > localização. Não requer login.
- [ ] Review Apple: 1-3 dias normalmente

---

## 📝 Descrições (copy)

### Google Play — Full description

```
A tua morada digital em Angola 🇦🇴

Em Angola, milhões vivem em zonas sem nomes de ruas formais. A Morada AO
resolve isso gerando um código único para QUALQUER localização, usando
Plus Codes (Open Location Code do Google) — o mesmo sistema que o Google
Maps usa em todo o mundo.

🎯 PERFEITO PARA:
• Partilhar a tua morada por WhatsApp, SMS ou chamada
• Entregas (Glovo, iFood, lojas, correios)
• Emergências (polícia, ambulância, bombeiros)
• Uber, Yango, Heetch e outros serviços
• Visitas de amigos e família
• Negócios sem morada formal

✓ FUNCIONA EM QUALQUER LUGAR
Mesmo onde não há nomes de rua, bairro ou número de porta.

✓ RÁPIDA E PRECISA
O código tem precisão de ~4m² — equivalente ao tamanho de um carro.

✓ GRÁTIS E SEM PUBLICIDADE
Para sempre. Sem anúncios, sem subscrições.

✓ SEM CONTA, SEM DADOS GUARDADOS
Não precisas de email, telefone, nem registar nada. A tua localização
nunca sai do teu telemóvel.

✓ FUNCIONA OFFLINE
Depois de abrires uma vez, funciona sem internet.

Feito em Angola com ❤️ para quem precisa.

Dúvidas? carlos@rasgadolabs.com
Instagram: @rasgadolabs
```

### iOS — Description (similar, até 4000 chars)

Mesma copy acima — iOS aceita a mesma estrutura.

---

## 🖼️ Screenshots sugeridos (6 slides)

1. **Hero** — Mapa com pin e código visível + headline "A tua morada digital"
2. **Partilha** — Modal de share com WhatsApp/SMS visível
3. **Onboarding slide 1** — Mapa Angola + "Em qualquer lugar"
4. **Code copy** — Botão a mostrar "Copiado ✓"
5. **Dark mode** — Mesma vista em dark
6. **Settings** — Tela de settings minimalista

Ferramenta sugerida: [screenshots.pro](https://screenshots.pro/) ou Figma com templates da App Store.

---

## ⏱️ Timeline estimada

| Fase | Tempo |
|---|---|
| Setup contas (Google Play + Apple Developer) | 1-3 dias (verificação) |
| Preparar assets (screenshots, descrições, política) | 1-2 dias |
| Primeiro build EAS | 20-40min por plataforma |
| Review Apple | 1-3 dias |
| Review Google | 1-7 dias |
| **Total realista** | **1-2 semanas** |

---

## 🚨 Reasons for rejection comuns

**Google Play:**
- Data safety form incompleto → preenche com cuidado
- Target audience errado → marca 13+ (não "children")
- Permission sem justificação → já temos no `app.json`

**Apple:**
- Screenshots não representam a app real → usa screenshots reais, não mockups
- Privacy policy URL que não funciona → testa o URL antes
- "Guideline 2.1 — Information Needed" → responde rápido via App Store Connect
- Permissions sem purpose string → já temos (`NSLocationWhenInUseUsageDescription`)
