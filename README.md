# 📍 Morada AO

> **The National Digital Address Infrastructure for Angola**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Made in Angola](https://img.shields.io/badge/Made%20in-Angola-red.svg)](https://angola.ao)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-54-000.svg)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61dafb.svg)](https://reactnative.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)

---

## 🎯 O Problema

Milhões de pessoas em Angola vivem em zonas **sem nomes de ruas formais**. Esta realidade cria barreiras críticas:

| Setor | Impacto |
|-------|---------|
| 🚑 **Emergências** | Ambulâncias não conseguem localizar pacientes rapidamente |
| 📦 **Logística** | Entregas atrasam ou perdem-se; custos operacionais elevados |
| 🛒 **E-commerce** | Empresas hesitam em operar em Angola |
| 🏦 **Serviços Financeiros** | Bancos não conseguem verificar endereços para crédito |
| 🏛️ **Governo** | Censos e levantamentos imprecisos; planejamento urbano difícil |
| 🌍 **Inclusão Digital** | Milhões excluídos da economia digital |

---

## ✅ A Solução

**Morada AO** cria uma **infraestrutura de endereçamento digital** capaz de identificar qualquer localização em Angola com precisão.

Usando **Plus Codes** (Google Open Location Code), a aplicação gera moradas únicas, curtas e fáceis de partilhar — sem depender de internet ou de nomes de ruas formais.

### Vantagens

✅ **Funciona offline** — GPS + algoritmo local  
✅ **Preciso** — Até 3 metros de precisão  
✅ **Simples** — Código curto + nome de bairro  
✅ **Partilhável** — WhatsApp, SMS, email  
✅ **Grátis** — Código aberto, sem tracking  
✅ **Escalável** — Pronto para governo e empresas  

---

## 🚀 Funcionalidades

### MVP (Atual)
- ✅ Geração de Plus Codes em tempo real via GPS
- ✅ Modo offline completo
- ✅ Partilha via WhatsApp, SMS, clipboard
- ✅ Mapa interativo (OpenStreetMap)
- ✅ Reverse geocoding (nome do bairro/cidade)
- ✅ Interface em Português e Inglês
- ✅ Tema claro/escuro

### Próximas Fases
- 🚧 Histórico de moradas
- 🚧 Favoritos e pontos de interesse
- 🚧 Portal GIS (análise geoespacial)
- 🚧 Portal Business (integração para empresas)
- 🚧 API pública (SDKs para JavaScript, Python, Flutter)
- 🚧 Portal Government (estatísticas nacionais)
- 🚧 Integração com drones e IA
- 🚧 Dashboard de analytics

---

## 📱 Download

- [📲 Google Play](#) *(em breve)*
- [🍎 Apple App Store](#) *(em breve)*
- [🌐 Web](#) *(em desenvolvimento)*

---

## 🏗️ Arquitetura

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

### Stack Técnico

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React Native 0.81.5, Expo 54, TypeScript |
| **Backend** | Express.js, Node.js, TypeScript |
| **Database** | PostgreSQL 16, PostGIS 3.4, Drizzle ORM |
| **GIS** | PostGIS, Plus Codes, OpenStreetMap, Nominatim |
| **Autenticação** | JWT, Zod validation |
| **Testing** | Jest, React Native Testing Library, Playwright |
| **CI/CD** | GitHub Actions |
| **Deployment** | Docker, Kubernetes (pronto) |

---

## 📖 Documentação

- [**SETUP.md**](./SETUP-MORADA-AO.md) — Guia de configuração do ambiente
- [**CONTRIBUTING.md**](./CONTRIBUTING.md) — Como contribuir
- [**Architecture**](./docs/architecture.md) — Decisões arquiteturais
- [**API Docs**](./docs/api.md) — Endpoints e exemplos
- [**Database**](./docs/database.md) — Schema e migrations
- [**GIS Guide**](./docs/gis.md) — Tudo sobre PostGIS e geoespacial
- [**Roadmap**](./docs/roadmap.md) — Plano para os próximos 12 meses
- [**Security Policy**](./SECURITY.md) — Política de segurança

### Wiki

[Visite a Wiki](https://github.com/rasgadocarlos2-jpg/morada-ao/wiki) para:
- Architecture Deep Dive
- GIS Concepts
- Business Model
- Government Integration
- Deployment Guides

---

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- PostgreSQL 16
- Git

### Instalação (5 minutos)

```bash
# 1. Clone o repositório
git clone https://github.com/rasgadocarlos2-jpg/morada-ao.git
cd morada-ao

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com a sua DATABASE_URL

# 4. Migrações da base de dados
npm run db:push

# 5. Inicie o desenvolvimento
npm run expo:dev      # Terminal 1: Mobile
npm run server:dev    # Terminal 2: Backend
```

### Comandos Úteis

```bash
# Desenvolvimento
npm run expo:dev              # Expo dev server
npm run server:dev            # Express dev server
npm run lint:fix              # Lint + format
npm run check:types           # Type checking

# Produção
npm run expo:static:build     # Build Expo
npm run server:build          # Bundle backend
npm run server:prod           # Run production

# Testes
npm run test                  # Jest
npm test:coverage             # Com coverage
```

### Estrutura do Projeto

```
morada-ao/
├── client/                   # React Native app
│   ├── screens/             # Telas (Map, Settings, etc)
│   ├── components/          # Componentes reutilizáveis
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilitários (storage, query client)
│   ├── navigation/          # React Navigation
│   └── constants/           # Cores, spacing, themes
│
├── server/                   # Express backend
│   ├── index.ts             # Configuração do servidor
│   ├── routes.ts            # Endpoints da API
│   ├── storage.ts           # Database initialization
│   └── templates/           # HTML templates
│
├── shared/                   # Código compartilhado
│   └── schema.ts            # Drizzle ORM + Zod schemas
│
├── docs/                     # Documentação
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   ├── gis.md
│   └── roadmap.md
│
├── infra/                    # Infraestrutura
│   ├── docker/
│   ├── terraform/
│   └── kubernetes/
│
└── package.json
```

---

## 🤝 Contribuir

Adoraríamos a sua contribuição! Leia [CONTRIBUTING.md](./CONTRIBUTING.md) para:
- Como reportar bugs
- Como sugerir features
- Guia de desenvolvimento
- Padrões de código
- Processo de pull request

### Issues Bem-vindo(a)s

- 🐛 [Bug reports](https://github.com/rasgadocarlos2-jpg/morada-ao/issues/new?template=bug_report.md)
- ✨ [Feature requests](https://github.com/rasgadocarlos2-jpg/morada-ao/issues/new?template=feature_request.md)
- 📚 [Melhorias de documentação](https://github.com/rasgadocarlos2-jpg/morada-ao/issues/new?template=documentation.md)
- 🎓 [Good first issues](https://github.com/rasgadocarlos2-jpg/morada-ao/issues?q=label%3A%22good+first+issue%22)

---

## 📊 Roadmap

```
2025 Q1 ✅
├── MVP Mobile App
├── Plus Code Generation
├── Offline Mode
└── Basic Sharing

2025 Q2 🚧
├── History & Favorites
├── Business Portal (Beta)
├── Public API v1
└── Documentation Suite

2025 Q3 🎯
├── GIS Portal
├── Government Integration
├── Analytics Dashboard
└── SDK Releases (JS, Python, Flutter)

2025 Q4+ 🚀
├── AI-powered address suggestions
├── Drone integration
├── Mobile wallet integration
└── Enterprise features
```

Veja o [roadmap completo](./docs/roadmap.md) com detalhes técnicos.

---

## 🔐 Segurança

A sua privacidade é importante.

- ✅ **Sem tracking** — Nenhum dado pessoal é recolhido
- ✅ **Open source** — Código auditável
- ✅ **Offline first** — Funciona sem internet
- ✅ **Responsável** — [Política de Segurança](./SECURITY.md)

Para reportar vulnerabilidades, veja [SECURITY.md](./SECURITY.md).

---

## 📄 Licença

Este projeto está licenciado sob a [MIT License](./LICENSE).

Você é livre para usar, modificar e distribuir este software em projetos comerciais e pessoais.

---

## 💬 Contacto & Comunidade

- 🌐 **Website:** [rasgadolabs.com](https://rasgadolabs.com)
- 📧 **Email:** carlos@rasgadolabs.com
- 📱 **Instagram:** [@rasgadolabs](https://instagram.com/rasgadolabs)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/rasgadocarlos2-jpg/morada-ao/discussions)
- 🐦 **Twitter:** [@rasgadolabs](https://twitter.com/rasgadolabs)

---

## 🙏 Agradecimentos

- [Google Plus Codes](https://plus.codes/) — Algoritmo de endereçamento
- [OpenStreetMap](https://www.openstreetmap.org/) — Dados geográficos
- [PostGIS](https://postgis.net/) — Análise geoespacial
- [Expo](https://expo.dev/) — Plataforma React Native
- 🇦🇴 **Comunidade Angolana** — Inspiração e feedback

---

## 📈 Métricas & Status

- **Versão:** 1.0.0-beta
- **Última atualização:** 2025-07-23
- **Estado:** Produção (Beta)
- **Plataformas:** iOS, Android, Web (em breve)

---

<div align="center">

**Made in Angola 🇦🇴 with ❤️**

*Transformando a forma como Angola se endereça.*

[⭐ Star este repositório](https://github.com/rasgadocarlos2-jpg/morada-ao)

</div>
