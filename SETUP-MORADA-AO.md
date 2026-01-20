# 🛠️ Setup Guide - Morada AO

Este guia ajuda-te a configurar o ambiente de desenvolvimento.

## 📋 Pré-requisitos

### Ferramentas necessárias:
- [Git](https://git-scm.com/downloads)
- [Flutter SDK](https://flutter.dev/docs/get-started/install) (versão 3.0 ou superior)
- [Android Studio](https://developer.android.com/studio) (para Android)
- [Xcode](https://developer.apple.com/xcode/) (para iOS, apenas Mac)
- [VS Code](https://code.visualstudio.com/) (recomendado)

### VS Code Extensions:
- Flutter
- Dart

---

## 🚀 Setup Rápido

### 1. Fork e Clone

```bash
# Fork o repo no GitHub (botão "Fork" no canto superior direito)

# Clone o teu fork
git clone https://github.com/[teu-username]/morada-ao.git
cd morada-ao

# Adiciona o repo original como upstream
git remote add upstream https://github.com/rasgadocarlos2-jpg/morada-ao.git

# Verifica os remotes
git remote -v
```

### 2. Verifica Flutter

```bash
# Verifica se Flutter está instalado corretamente
flutter doctor

# Se houver problemas, resolve-os antes de continuar
```

### 3. Instala Dependências

```bash
# Instala packages do projeto
flutter pub get
```

### 4. Executa a App

```bash
# Lista dispositivos disponíveis
flutter devices

# Executa no dispositivo/emulador
flutter run

# Ou especifica dispositivo
flutter run -d [device-id]
```

---

## 🌿 Workflow de Desenvolvimento

### Criar branch para trabalho

```bash
# Atualiza main
git checkout main
git pull upstream main

# Cria nova branch
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-bug
```

### Fazer mudanças

```bash
# 1. Edita os ficheiros
# 2. Testa localmente: flutter run
# 3. Formata código: flutter format .
# 4. Adiciona mudanças

git add .

# 5. Commit com mensagem descritiva
git commit -m "feat: adiciona funcionalidade X"

# 6. Push para o teu fork
git push origin feature/nome-da-feature
```

### Criar Pull Request

1. Vai ao teu fork no GitHub
2. Clica em "Compare & pull request"
3. Preenche o template
4. Submete!

---

## 🧪 Testar

### Testes automáticos

```bash
# Executa testes unitários
flutter test

# Executa testes com coverage
flutter test --coverage
```

### Testes manuais

**Checklist básico:**
- [ ] App abre sem erros
- [ ] GPS funciona
- [ ] Plus Code gera corretamente
- [ ] Partilha funciona (WhatsApp/SMS)
- [ ] Mapa carrega
- [ ] Performance aceitável

**Teste contexto angolano:**
- [ ] Testa com conexão 3G lenta
- [ ] Testa em Android antigo (se possível)
- [ ] Valida em localizações de Luanda
- [ ] Testa modo offline

---

## 🐛 Debug

### Hot Reload
```bash
# Durante execução:
# r - Hot reload (rápido)
# R - Hot restart (completo)
# q - Quit
```

### Debug Logs
```bash
# Vê logs em tempo real
flutter logs

# ou no VS Code:
# F5 - Start debugging
# Debug Console mostra logs
```

---

## 📁 Estrutura do Projeto

```
morada-ao/
├── lib/
│   ├── main.dart              # Entry point
│   ├── screens/               # Telas da app
│   ├── widgets/               # Componentes reutilizáveis
│   ├── models/                # Modelos de dados
│   ├── services/              # Serviços (GPS, etc)
│   └── utils/                 # Utilidades
├── assets/                    # Imagens, ícones
├── test/                      # Testes
├── android/                   # Configuração Android
├── ios/                       # Configuração iOS
├── pubspec.yaml               # Dependências
└── README.md
```

---

## ⚠️ Troubleshooting

### Problema: flutter doctor mostra erros

```bash
# Aceita licenças Android
flutter doctor --android-licenses

# Limpa e reinstala
flutter clean
flutter pub get
```

### Problema: App não instala no dispositivo

```bash
# Verifica dispositivos conectados
flutter devices

# Limpa build
flutter clean

# Rebuild
flutter run
```

### Problema: Erro de packages

```bash
# Limpa cache
flutter pub cache repair

# Remove e reinstala
rm pubspec.lock
flutter pub get
```

### Problema: Hot reload não funciona

```bash
# Faz hot restart (R)
# ou restart completo:
flutter run
```

---

## 🇦🇴 Testar em Contexto Angolano

### Simulação de conexão lenta:
**Android Studio:**
1. AVD Manager → Settings
2. Network Speed → EDGE (200 kbps)

**Chrome DevTools (para debug web):**
1. F12 → Network
2. Throttling → Slow 3G

### Localizações para testar:
```dart
// Luanda (Marginal)
-8.8159, 13.2306

// Cazenga
-8.8739, 13.2286

// Viana
-8.9230, 13.3770

// Benguela
-12.5763, 13.4055
```

---

## 💡 Boas Práticas

### Antes de commit:
```bash
# 1. Formata código
flutter format .

# 2. Analisa código
flutter analyze

# 3. Executa testes
flutter test

# 4. Verifica build
flutter build apk --debug
```

### Mensagens de commit:
Usa [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona partilha via WhatsApp
fix: corrige bug GPS em Luanda
docs: atualiza README
style: formata código
refactor: simplifica geração de código
test: adiciona testes de GPS
```

---

## 📚 Recursos

### Documentação:
- [Flutter Docs](https://flutter.dev/docs)
- [Dart Docs](https://dart.dev/guides)
- [Plus Codes](https://plus.codes/)

### Tutoriais:
- [Flutter Codelabs](https://flutter.dev/docs/codelabs)
- [Flutter YouTube](https://www.youtube.com/c/flutterdev)

### Comunidade:
- [GitHub Issues](https://github.com/rasgadocarlos2-jpg/morada-ao/issues)
- Email: carlos@rasgadolabs.com
- Instagram: [@rasgadolabs](https://instagram.com/rasgadolabs)

---

## 🎯 Próximos Passos

Depois de configurar:

1. Explora o código
2. Lê [CONTRIBUTING.md](CONTRIBUTING.md)
3. Escolhe uma [issue](https://github.com/rasgadocarlos2-jpg/morada-ao/issues)
4. Faz a tua primeira contribuição!

---

## 💬 Precisa de Ajuda?

Não hesites em:
- Abrir uma [issue](https://github.com/rasgadocarlos2-jpg/morada-ao/issues)
- Enviar email: carlos@rasgadolabs.com
- DM no Instagram: [@rasgadolabs](https://instagram.com/rasgadolabs)

Todos começámos algures! 🚀

---

**Made in Angola 🇦🇴 with ❤️**
