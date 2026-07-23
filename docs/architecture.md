# 🏗️ Morada AO - Architecture Documentation

## Overview

Morada AO é uma aplicação de endereçamento digital para Angola, construída com uma arquitetura **modular**, **escalável** e **offline-first**.

```
┌─────────────────────────────────────────────────────────────┐
│                     Morada AO Platform                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
    📱 Mobile   💼 Business  🏛️ Government
    (Expo)      Portal        Portal
        │          │          │
        └──────────┼──────────┘
                   │
          ┌────────▼────────┐
          │  API Gateway    │
          │ (Express.js)    │
          └────────┬────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   📊 PostgreSQL        🗺️ GIS Services
   + PostGIS           (PostGIS, OSM)
        │                     │
        └──────────┬──────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
🔐 Plus Codes  🗺️ OpenStreetMap  📍 Reverse Geo
(google-olc)   (Leaflet)        (Nominatim)
```

---

## Componentes Principais

### 1. 📱 **Cliente Mobile (React Native + Expo)**

#### Responsabilidades
- Interface do utilizador
- Captura de GPS
- Geração local de Plus Codes
- Partilha (WhatsApp, SMS, clipboard)
- Armazenamento local (AsyncStorage)
- Offline-first

#### Estrutura

```
client/
├── screens/                # Páginas principais
│   ├── MapScreen.tsx       # Mapa interativo + geração de código
│   ├── OnboardingScreen    # Educação inicial
│   ├── PermissionScreen    # Pedido de permissões
│   └── SettingsScreen      # Preferências
│
├── components/             # Componentes reutilizáveis
│   ├── MapViewComponent    # Integração com react-native-maps
│   ├── Button              # Botões customizados
│   ├── Card                # Cartões de conteúdo
│   ├── ErrorBoundary       # Tratamento de erros
│   └── Themed*             # Componentes com tema
│
├── hooks/                  # Custom hooks
│   ├── useTheme            # Gestão de tema
│   ├── useLocation         # Gestão de GPS
│   └── useAddresses        # Queries de endereços
│
├── lib/                    # Utilitários
│   ├── storage.ts          # Persistência local
│   ├── query-client.ts     # TanStack Query config
│   └── theme.ts            # Definições de cores
│
├── navigation/             # React Navigation
│   └── RootStackNavigator  # Pilha de navegação
│
└── constants/              # Valores fixos
    └── theme.ts            # Cores, spacing, etc
```

#### Fluxo de Dados

```
User Input (GPS)
    ↓
MapScreen.tsx
    ↓
useLocation hook
    ↓
Plus Code Generator (open-location-code)
    ↓
Reverse Geocoding (API → server)
    ↓
Display: Full Code + Short Code + Location Name
```

#### Offline-First Strategy

1. **GPS Local:** Plus Codes gerados localmente (sem internet)
2. **Cache:** Endereços recentes guardados em AsyncStorage
3. **Sync:** Quando online, sincroniza com servidor
4. **Fallback:** Se reverse geo falhar, mostra código completo

---

### 2. 🖥️ **Backend (Express.js + TypeScript)**

#### Responsabilidades
- Autenticação & autorização
- Reverse geocoding
- Persistência de dados
- APIs para portais business/government
- Logging & monitoramento

#### Estrutura

```
server/
├── index.ts                # Configuração Express
├── routes.ts               # Endpoints da API
├── storage.ts              # Inicialização DB
├── middleware/             # Middlewares (auth, CORS, etc)
├── controllers/            # Lógica de negócio
├── services/               # Serviços (geocoding, etc)
├── models/                 # Interfaces TypeScript
├── templates/              # HTML para landing page
```

#### Endpoints Principais

```
POST   /api/auth/register               # Criar conta
POST   /api/auth/login                  # Login
POST   /api/auth/refresh                # Renovar token

GET    /api/addresses                   # Lista de endereços
POST   /api/addresses                   # Criar endereço
GET    /api/addresses/:id               # Detalhe
PUT    /api/addresses/:id               # Editar
DELETE /api/addresses/:id               # Apagar

POST   /api/geocoding/reverse           # Reverse geocoding
GET    /api/health                      # Health check

GET    /api/gis/districts               # Dados GIS (futuro)
GET    /api/gis/areas                   # Áreas administrativas
```

#### Arquitetura de Camadas

```
Request
  ↓
Router (routes.ts)
  ↓
Middleware (auth, validation, CORS)
  ↓
Controller (lógica HTTP)
  ↓
Service (lógica de negócio)
  ↓
Database (Drizzle ORM)
  ↓
Response (JSON)
```

---

### 3. 📊 **Base de Dados (PostgreSQL + PostGIS)**

#### Schema

```sql
-- Utilizadores
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Endereços
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plus_code VARCHAR(8) NOT NULL,
  full_code VARCHAR(11) NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  location_name VARCHAR(255),
  district VARCHAR(255),
  province VARCHAR(255),
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, plus_code)
);

-- Índices geoespaciais
CREATE INDEX idx_addresses_location ON addresses USING GIST(
  geography(ST_Point(longitude, latitude))
);

-- Row-Level Security
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY addresses_isolation ON addresses
  USING (user_id = current_user_id())
  WITH CHECK (user_id = current_user_id());
```

#### Geoespacial com PostGIS

```sql
-- Exemplo: Encontrar endereços num raio
SELECT * FROM addresses
WHERE ST_DWithin(
  geography(ST_Point(longitude, latitude)),
  geography(ST_Point(-8.8159, 13.2306)),  -- Luanda
  1000  -- 1 km
);

-- Índices para performance
CREATE INDEX idx_addresses_geom ON addresses
USING GIST(ST_GeomFromText('POINT(' || longitude || ' ' || latitude || ')', 4326));
```

---

### 4. 🌐 **APIs Externas**

#### Plus Codes (Google)
- **Biblioteca:** `open-location-code`
- **O que faz:** Converte latitude/longitude em código
- **Exemplo:** 
  ```
  Latitude: -8.8159
  Longitude: 13.2306
  → Plus Code: 6F9V2VQ6+RQ
  ```

#### Nominatim (OpenStreetMap)
- **URL:** `https://nominatim.openstreetmap.org`
- **O que faz:** Reverse geocoding (lat/lng → nome do local)
- **Exemplo:**
  ```
  -8.8159, 13.2306
  → "Marginal de Luanda, Luanda, Angola"
  ```

#### OpenStreetMap
- **O que faz:** Tiles de mapa
- **Vantagem:** Offline, sem chaves de API

---

## Fluxo de Dados End-to-End

### 1. Utilizador abre app

```
App.tsx
  ↓
checkInitialState()
  ├─ getHasSeenOnboarding()
  ├─ Location.getForegroundPermissionsAsync()
  └─ setAppState("ready" | "onboarding" | "permission")
```

### 2. Utilizador navega para o mapa

```
MapScreen.tsx
  ↓
useLocation hook
  ├─ Location.watchPositionAsync()
  ├─ Gera Plus Code (local, open-location-code)
  └─ Envia latitude/longitude para servidor
        ↓
  server/services/geocoding.ts
    ├─ Nominatim API call
    ├─ Estrutura resposta
    └─ Retorna: { fullCode, shortCode, locationName }
  ↓
Display em bottom sheet
```

### 3. Utilizador partilha

```
MapScreen FAB (Partilhar)
  ↓
ShareSheet.share()
  ├─ WhatsApp: `morada://CODE`
  ├─ SMS: `Minha morada: CODE`
  └─ Clipboard: `6F9V2VQ6+RQ`
```

---

## Decisões Arquiteturais (ADRs)

### ADR-001: React Native + Expo (vs Flutter)

**Decisão:** React Native + Expo

**Razões:**
- ✅ Code sharing entre web e mobile
- ✅ Comunidade grande
- ✅ Expo reduz complexidade de setup
- ✅ TypeScript para type safety

---

### ADR-002: Plus Codes (vs IP Geolocation)

**Decisão:** Plus Codes

**Razões:**
- ✅ Preciso (até 3 metros)
- ✅ Funciona offline
- ✅ Código curto e memorável
- ✅ Padrão internacional

---

### ADR-003: PostgreSQL + PostGIS (vs MongoDB)

**Decisão:** PostgreSQL + PostGIS

**Razões:**
- ✅ Dados estruturados = SQL
- ✅ PostGIS = análise geoespacial
- ✅ ACID compliance importante
- ✅ Melhor para governo

---

## Escalabilidade

### Horizontal

```
Load Balancer (Nginx)
  ├─ Server 1
  ├─ Server 2
  └─ Server 3
       ↓
  PostgreSQL (Primary)
       ↓
  Read Replicas (3x)
```

### Vertical

- **Cache layer:** Redis para sessões
- **CDN:** Cloudflare para assets
- **Database:** Índices, particionamento

---

## Segurança

### Autenticação
- JWT com refresh tokens
- Rotation de tokens a cada 7 dias
- Algoritmo: HS256

### Autorização
- Row-Level Security (PostgreSQL)
- Middleware de autenticação
- Rate limiting por IP

### Encriptação
- HTTPS obrigatório
- Passwords: bcrypt
- Secrets: variáveis de ambiente

---

## Testes

### Pirâmide de Testes

```
         ▲
        /│\
       / │ \    E2E (Cypress)
      /  │  \
     /───┼───\
    /    │    \  Integration (Jest + RTL)
   /─────┼─────\
  /      │      \ Unit Tests
 /───────┼───────\
┴────────┴────────┴
```

---

## Deployment

### Local
```bash
npm run expo:dev     # Mobile
npm run server:dev   # Backend
```

### Production (Docker)
```bash
docker-compose up -d
```

### Cloud (Kubernetes)
```bash
kubectl apply -f infra/kubernetes/
```

---

## Monitoramento

### Ferramentas
- **Sentry:** Error tracking
- **PostHog:** Product analytics
- **Prometheus:** Métricas
- **ELK Stack:** Logs centralizados

### Alertas
- CPU > 80%
- Memory > 85%
- Error rate > 1%
- Response time > 500ms

---

## Roadmap Técnico

| Q | Foco |
|---|------|
| Q1 2025 | MVP + Offline |
| Q2 2025 | Business Portal + API |
| Q3 2025 | GIS Portal + Analytics |
| Q4 2025 | Government Integration |

---

## Referências

- [React Native Docs](https://reactnative.dev/)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [PostGIS Manual](https://postgis.net/docs/)
- [Plus Codes](https://plus.codes/)