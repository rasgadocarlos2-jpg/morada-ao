# 🔐 Security Policy

## Relatório de Vulnerabilidades

A segurança é uma prioridade máxima para Morada AO. Se descobrir uma vulnerabilidade de segurança, **por favor, não a publique em issues públicas**. Em vez disso, reporte-a responsavelmente.

### Como Reportar

1. **Envie um email** para: `security@rasgadolabs.com`
   - Título: `[SECURITY] Vulnerabilidade encontrada em Morada AO`
   - Descreva a vulnerabilidade em detalhe
   - Incluir passos para reproduzir
   - Compartilhar impacto potencial

2. **Envie uma mensagem privada no GitHub**
   - [@rasgadocarlos2-jpg](https://github.com/rasgadocarlos2-jpg)

### Tempo de Resposta

- ⏱️ **Confirmação:** Dentro de 24-48 horas
- 🔧 **Investigação:** 3-7 dias
- 📋 **Correção:** Depende da severidade
- 📢 **Divulgação:** Coordenada após patch

---

## Política de Divulgação Responsável

Seguimos os princípios de **Responsible Disclosure**:

1. ✅ Reporta a vulnerabilidade
2. 🔍 Nós investigamos
3. 🔧 Nós criamos um patch
4. 📅 Nós anunciamos a correção
5. 🎉 Comunidade atualiza

**Não divulgamos detalhes públicos até 30 dias após o patch.**

---

## Práticas de Segurança

### No Código

- ✅ **Validação de entrada** — Zod schemas
- ✅ **Autenticação** — JWT com refresh tokens
- ✅ **Rate limiting** — Proteção contra brute force
- ✅ **CORS configurado** — Apenas origens confiáveis
- ✅ **Helmet.js** — Headers de segurança HTTP
- ✅ **SQL Injection prevention** — Drizzle ORM com prepared statements
- ✅ **HTTPS obrigatório** — Em produção
- ✅ **Secrets management** — Variáveis de ambiente, sem hardcoding

### Na Base de Dados

- ✅ **Row-Level Security (RLS)** — PostgreSQL
- ✅ **Encriptação de passwords** — bcrypt
- ✅ **Backups automáticos** — Diários
- ✅ **Auditoria** — Logs de todas as operações

### Na Infraestrutura

- ✅ **Firewall** — Regras estritas
- ✅ **WAF** — Cloudflare (em produção)
- ✅ **DDoS protection** — Rate limiting + WAF
- ✅ **SSL/TLS** — Certificados Let's Encrypt
- ✅ **Monitoramento** — Sentry + logs centralizados

### Na Aplicação Mobile

- ✅ **Sem armazenamento de dados sensíveis** — Apenas sessões
- ✅ **Certificado pinning** — Em breve
- ✅ **Offline seguro** — Sem cache de dados críticos
- ✅ **Permissões mínimas** — Apenas GPS e câmara quando necessário

---

## Checklist de Segurança

Antes de cada release:

- [ ] Audit das dependências (`npm audit`)
- [ ] Sem secrets commitados (`git-secrets`)
- [ ] Type checking completo (`tsc --noEmit`)
- [ ] Testes de segurança
- [ ] OWASP Top 10 review
- [ ] Pen testing (trimestral)

---

## Dependências

Monitoramos constantemente as dependências:

```bash
# Verificar vulnerabilidades
npm audit

# Atualizar dependências
npm update
npm audit fix

# Revisar versões antigas
npm outdated
```

Usamos **Dependabot** para PRs automáticas de segurança.

---

## Compliance & Standards

Seguimos:

- 🔒 **OWASP Top 10** — Mitigação de vulnerabilidades comuns
- 🛡️ **CWE Top 25** — Fraquezas mais perigosas
- 🇦🇴 **Leis de Proteção de Dados Angolana** — GDPR-inspired
- 📋 **ISO 27001** — Gestão de segurança da informação

---

## Histórico de Vulnerabilidades

| Data | Severidade | Descrição | Status |
|------|-----------|-----------|--------|
| - | - | Nenhuma vulnerabilidade reportada | ✅ |

---

## Contactos

| Função | Email | GitHub |
|--------|-------|--------|
| Security Lead | carlos@rasgadolabs.com | [@rasgadocarlos2-jpg](https://github.com/rasgadocarlos2-jpg) |

---

## Referências

- [OWASP Responsible Disclosure](https://owasp.org/www-community/Responsible_Disclosure)
- [Security.txt RFC 9116](https://datatracker.ietf.org/doc/html/rfc9116)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/nodejs-security/)

---

**Obrigado por ajudar a manter Morada AO seguro! 🙏**