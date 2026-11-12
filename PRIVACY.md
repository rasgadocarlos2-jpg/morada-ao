# Política de Privacidade — Morada AO

**Última atualização:** 25 de outubro de 2026

A Morada AO ("nós", "a app") é uma aplicação gratuita desenvolvida pela
Rasgado Labs para gerar moradas digitais em Angola usando Plus Codes
(Open Location Code do Google).

Esta política explica que dados a app recolhe, para quê, e os teus direitos.

---

## 1. Dados que a app recolhe

### 1.1 Localização GPS
- **O quê:** latitude e longitude do dispositivo.
- **Porquê:** gerar o código Plus Code da tua localização atual.
- **Onde fica:** **processada apenas no dispositivo**. Não é enviada para
  servidores da Morada AO nem partilhada com terceiros.
- **Guardada:** a última localização conhecida é guardada **localmente** no
  dispositivo (AsyncStorage) para a app reabrir no mesmo sítio.

### 1.2 Dados de utilização (analytics)
Para melhorar a app recolhemos eventos **anónimos** através de:

- **Firebase Analytics** (Google)
- **PostHog** (hospedado na UE)

Eventos recolhidos:
- Abertura da app, telas visitadas
- Conclusão do onboarding
- Pedidos de permissão de localização (concedido/negado)
- Cópia e partilha de códigos (sem o código em si)
- Erros e crashes (via Firebase Crashlytics)

**Não** recolhemos: o teu nome, email, contactos, ficheiros, nem o
conteúdo das tuas moradas.

### 1.3 Session Replay (PostHog)
Em releases, uma pequena amostra de sessões anónimas pode ser gravada
(interações no ecrã) para melhorar a UX. Todas as entradas de texto são
automaticamente mascaradas.

### 1.4 Notificações push (Cloud Messaging)
Se aceitares notificações, o teu token FCM anónimo é guardado para enviar
mensagens relacionadas com a app. Não enviamos marketing.

---

## 2. Com quem partilhamos

- **Google (Firebase)** — Analytics, Crashlytics, Remote Config, FCM
  → [política de privacidade Google](https://policies.google.com/privacy)
- **PostHog** — product analytics e session replay (servidores na UE)
  → [política de privacidade PostHog](https://posthog.com/privacy)
- **OpenStreetMap** — tiles do mapa (processam o teu IP ao carregar tiles)
  → [política OSM](https://wiki.osmfoundation.org/wiki/Privacy_Policy)

Não vendemos nem partilhamos dados pessoais com mais ninguém.

---

## 3. Os teus direitos

Podes:
- **Desinstalar** a app a qualquer momento — remove todos os dados locais
- **Revogar** a permissão de localização nas definições do telemóvel
- **Pedir** que os teus dados anónimos de analytics sejam apagados:
  escreve para **carlos@rasgadolabs.com**

Ao abrigo do RGPD/GDPR (UE) e da Lei nº 22/11 (Angola — Proteção de Dados
Pessoais), tens direito a:
- Acesso aos teus dados
- Correção
- Eliminação
- Portabilidade
- Opor-te ao processamento

---

## 4. Crianças

A app não é dirigida a menores de 13 anos. Não recolhemos dados sabidos
de crianças.

---

## 5. Alterações a esta política

Podemos atualizar esta política. A versão atual estará sempre em
[rasgadolabs.com/privacy](https://rasgadolabs.com/privacy).

---

## 6. Contacto

Rasgado Labs
Email: **carlos@rasgadolabs.com**
Instagram: [@rasgadolabs](https://instagram.com/rasgadolabs)

---

**Made in Angola 🇦🇴**
