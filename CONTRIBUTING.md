# 🤝 Contribuir para Morada A0

Obrigado por considerares contribuir para este projeto! 

Este projeto nasce com respeito profundo pela cultura angolana e visa resolver problemas reais. Contribuições são bem-vindas desde que alinhadas com os valores do projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como posso contribuir?](#como-posso-contribuir)
- [Processo de desenvolvimento](#processo-de-desenvolvimento)
- [Guia de estilo](#guia-de-estilo)
- [Reportar bugs](#reportar-bugs)
- [Sugerir features](#sugerir-features)
- [Pull Requests](#pull-requests)

---

## 📜 Código de Conduta

Este projeto segue um código de conduta simples:

- **Respeito:** Trata todos com dignidade e respeito
- **Inclusão:** Todos são bem-vindos, independentemente de background
- **Construtividade:** Críticas devem ser construtivas e focadas no código
- **Colaboração:** Trabalhamos juntos para melhorar o projeto
- **Contexto cultural:** Respeitamos o contexto angolano e africano

Comportamentos inaceitáveis incluem assédio, discriminação, trolling, ou qualquer forma de desrespeito.

---

## 🚀 Como posso contribuir?

Há várias formas de contribuir:

### 1. 🐛 Reportar bugs
Encontraste um problema? [Abre uma issue](#reportar-bugs)

### 2. 💡 Sugerir melhorias
Tens ideias? [Cria uma feature request](#sugerir-features)

### 3. 📝 Melhorar documentação
- Corrigir typos
- Adicionar exemplos
- Traduzir (PT-AO ↔️ EN)
- Melhorar explicações

### 4. 💻 Escrever código
- Corrigir bugs
- Implementar features
- Melhorar performance
- Adicionar testes

### 5. 🎨 Design & UX
- Melhorar interface
- Criar assets visuais
- Testar usabilidade
- Dar feedback de UX

### 6. 🧪 Testar
- Testar em diferentes dispositivos
- Testar em Angola (internet lenta, Android antigo)
- Reportar problemas de UX
- Validar em contexto real

---

## 🛠️ Processo de Desenvolvimento

### Setup inicial

```bash
# 1. Fork o repositório
# 2. Clone o teu fork
git clone https://github.com/[teu-username]/[nome-do-projeto].git
cd [nome-do-projeto]

# 3. Adiciona o repo original como upstream
git remote add upstream https://github.com/rasgadolabs/[nome-do-projeto].git

# 4. Cria uma branch para o teu trabalho
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-bug
```

### Instalar dependências

```bash
# Para Flutter
flutter pub get

# Para React/Node
npm install

# Para Python
pip install -r requirements.txt
```

### Executar localmente

```bash
# Instruções específicas do projeto
# Ver README.md para detalhes
```

### Fazer mudanças

```bash
# 1. Faz as tuas alterações
# 2. Testa localmente
# 3. Commit com mensagem descritiva

git add .
git commit -m "feat: adiciona funcionalidade X"

# 4. Push para o teu fork
git push origin feature/nome-da-feature

# 5. Abre Pull Request no GitHub
```

---

## 📐 Guia de Estilo

### Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: melhora formatação (sem mudança de lógica)
refactor: refatora código (sem mudança de comportamento)
test: adiciona ou corrige testes
chore: tarefas de manutenção
```

**Exemplos:**
```
feat: adiciona partilha via WhatsApp
fix: corrige bug de localização em Luanda
docs: atualiza README com instruções de instalação
refactor: simplifica função de geração de código
```

### Código

**Flutter/Dart:**
```dart
// Use nomes descritivos em português ou inglês (consistente)
// Comentários em português
// Formatação: dart format

void gerarMorada(double latitude, double longitude) {
  // Implementação clara e comentada
}
```

**JavaScript/React:**
```javascript
// camelCase para variáveis e funções
// PascalCase para componentes
// Comentários em português

const gerarCodigo = (lat, lng) => {
  // Implementação
};
```

**Python:**
```python
# snake_case para funções e variáveis
# Docstrings em português
# Formatação: black

def gerar_plus_code(latitude: float, longitude: float) -> str:
    """
    Gera Plus Code a partir de coordenadas.
    
    Args:
        latitude: Latitude em graus decimais
        longitude: Longitude em graus decimais
    
    Returns:
        Plus Code no formato completo (ex: 6G226F+3M)
    """
    pass
```

---

## 🐛 Reportar Bugs

### Antes de reportar

1. **Pesquisa:** Verifica se já foi reportado em [Issues](../../issues)
2. **Versão:** Confirma que estás na versão mais recente
3. **Reproduz:** Tenta reproduzir o bug consistentemente

### Como reportar

Usa o template abaixo ou [cria uma issue](../../issues/new):

```markdown
**Descrição do bug**
Descrição clara do que aconteceu.

**Como reproduzir**
Passos para reproduzir:
1. Vai para '...'
2. Clica em '...'
3. Scroll até '...'
4. Vê o erro

**Comportamento esperado**
O que deveria acontecer.

**Screenshots**
Se aplicável, adiciona screenshots.

**Ambiente:**
 - Dispositivo: [ex: Samsung A10]
 - OS: [ex: Android 11]
 - Versão da app: [ex: 1.2.0]
 - Localização: [ex: Luanda, Angola]
 - Conexão: [ex: 3G lento]

**Contexto adicional**
Qualquer outra informação relevante.
```

---

## 💡 Sugerir Features

### Antes de sugerir

1. **Pesquisa:** Verifica se já foi sugerido
2. **Alinhamento:** Confirma que está alinhado com a missão do projeto
3. **Viabilidade:** Considera se é viável tecnicamente

### Como sugerir

```markdown
**A feature resolve que problema?**
Descrição clara do problema que a feature resolve.

**Solução proposta**
Como imaginás que a feature funcionaria?

**Alternativas consideradas**
Outras formas de resolver o mesmo problema.

**Contexto angolano**
Como isto se aplica especificamente em Angola?

**Mockups/Screenshots**
Se tiveres, adiciona imagens explicativas.
```

---

## 🔄 Pull Requests

### Checklist antes de submeter

- [ ] O código compila/roda sem erros
- [ ] Testaste localmente em diferentes cenários
- [ ] Adicionaste/atualizaste testes (se aplicável)
- [ ] Atualizaste a documentação (README, comentários)
- [ ] Commits seguem o padrão (Conventional Commits)
- [ ] Branch está atualizada com `main`
- [ ] Código segue o guia de estilo do projeto

### Processo de review

1. **Submete PR:** Com descrição clara do que mudou e porquê
2. **CI passa:** GitHub Actions executa testes automáticos
3. **Code review:** Mantainer revê o código
4. **Ajustes:** Faz mudanças solicitadas (se houver)
5. **Merge:** PR é aceite e incorporado ao projeto

### Template de PR

```markdown
## O que muda?
Descrição breve das mudanças.

## Por quê?
Contexto e motivação.

## Como testar?
Passos para testar as mudanças:
1. ...
2. ...

## Screenshots (se aplicável)
[Adiciona imagens]

## Checklist
- [ ] Código testado localmente
- [ ] Documentação atualizada
- [ ] Testes adicionados/atualizados
- [ ] Guia de estilo seguido
```

---

## 🌍 Contexto Angolano

Este projeto é desenvolvido **em Angola, para Angola**. Ao contribuir, considera:

### Realidades técnicas
- **Internet:** Muitos users têm 3G lento ou dados limitados
- **Dispositivos:** Android antigos (4.x, 5.x) ainda são comuns
- **Armazenamento:** Dispositivos com pouco espaço
- **Bateria:** Otimização de bateria é importante

### Contexto cultural
- **Língua:** Português de Angola (não PT-PT ou PT-BR)
- **Nomes:** Respeita nomes angolanos (não só nomes ocidentais)
- **Localizações:** Testa em Luanda, Benguela, Huambo, etc.
- **Use cases:** Pensa em musseques, zonas sem infraestrutura

### Exemplos reais
Ao testar ou documentar, usa exemplos angolanos:
- ✅ "Cazenga, Luanda"
- ✅ "Rua Comandante Valódia"
- ✅ "Kilamba Kiaxi"
- ❌ Não uses só "São Paulo" ou "Lisboa"

---

## 📞 Perguntas?

- **Issues:** [GitHub Issues](../../issues)
- **Email:** carlos@rasgadolabs.com
- **Instagram:** [@rasgadolabs](https://instagram.com/rasgadolabs)
- **Website:** [rasgadolabs.com](https://rasgadolabs.com)

---

## 🙏 Agradecimentos

Obrigado por dedicares tempo para melhorar este projeto!

Toda contribuição, grande ou pequena, é valorizada e apreciada.

---

**Made in Angola 🇦🇴 with ❤️**
