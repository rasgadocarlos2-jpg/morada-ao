# 📊 PostHog Setup — Morada AO

Guia para configurar PostHog (product analytics + session replay) na app.

---

## 1. Criar projeto no PostHog

1. Vai a [eu.posthog.com](https://eu.posthog.com/) (região EU recomendada por GDPR)
2. Cria uma conta e um projeto chamado `morada-ao`
3. Copia a **Project API Key** (começa com `phc_...`)

---

## 2. Configurar variáveis

Cria/edita `.env` na raiz:

```bash
EXPO_PUBLIC_POSTHOG_API_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

> `EXPO_PUBLIC_*` fica exposto no bundle — é esperado para a Project API Key (não é um segredo).

---

## 3. Session Replay

O plugin `posthog-react-native-session-replay` já está no `app.json` e no `package.json`.

Precisas de rebuild do dev client:

```bash
npx eas build --profile development --platform all
```

A configuração em `client/lib/analytics.ts` já tem defaults seguros:
- `maskAllTextInputs: true` — não grava inputs
- `maskAllImages: false` — grava imagens (sem dados sensíveis na app)

**IMPORTANTE para submeter às lojas**: adiciona avisio na **política de privacidade** (ver `PRIVACY.md`) que recolhes sessões anónimas para melhorar a UX.

---

## 4. Eventos já implementados

Em `client/lib/analytics.ts`, com a função `track(name, props)`:

| Evento | Props | Onde |
|---|---|---|
| `onboarding_completed` | `slide_reached` | OnboardingScreen |
| `onboarding_skipped` | `slide_reached` | OnboardingScreen |
| `location_permission_response` | `granted`, `can_ask_again` | PermissionScreen |
| `code_copied` | `code_type`, `has_short` | MapScreen |
| `code_shared` | `has_short`, `action` | MapScreen |
| `settings_opened` | — | MapScreen |
| `$screen` (automático) | `screen_name` | NavigationContainer |
| `$exception` (automático) | message, stack | ErrorBoundary |

---

## 5. Dashboards sugeridos

No PostHog cria estes insights:

1. **Funnel de ativação**:
   `App Install → onboarding_completed → location_permission_response (granted) → code_copied`

2. **Core engagement** (daily):
   Quantos users únicos fazem `code_copied` OR `code_shared` por dia.

3. **Share rate**:
   `code_shared / code_copied` por semana.

4. **Permission denial rate**:
   `location_permission_response (granted:false) / total`.

5. **Session replay sampling**:
   Começa com 100% em dev/preview; em produção baixa para 10% para controlar custos.

---

## 6. Feature flags (opcional)

Para experiments A/B sem rebuild:

```ts
import PostHog from "posthog-react-native";

const flagEnabled = await posthog.isFeatureEnabled("new_bottom_sheet");
```

Alternativa: usar Firebase Remote Config (já configurado) para kill-switches críticos. PostHog é melhor para experiments comportamentais.

---

## 7. Verificar

- Abre a app → faz o onboarding → copia um código
- PostHog Console → **Activity** → vês os eventos a chegar em segundos
- Session Replay → aparece em ~1min após fim da sessão

---

## 📚 Links úteis

- [PostHog React Native docs](https://posthog.com/docs/libraries/react-native)
- [Session Replay for mobile](https://posthog.com/docs/session-replay/mobile)
- [PostHog EU console](https://eu.posthog.com/)
