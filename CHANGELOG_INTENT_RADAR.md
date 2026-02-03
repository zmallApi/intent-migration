# 📝 Changelog - Intent Radar Migration

## Versão 1.0.0 - Janeiro 2026

### ✨ Novos Arquivos Criados

#### Migrations
- **`migrations/100_create_intent_radar_schema.js`**
  - Migration completa do schema Intent Radar
  - 21 tabelas criadas
  - Triggers automáticos para `updated_at`
  - Índices otimizados
  - Foreign keys com CASCADE

#### Seeds
- **`seeds/100_intent_radar_initial_data.js`**
  - 3 planos de assinatura (Starter, Professional, Enterprise)
  - Tenant "intent-radar" configurado
  - 2 usuários (admin e developer)
  - 5 intents de exemplo
  - 5 produtos de exemplo (Amazon)
  - Mapeamentos intent ↔ produto
  - 2 contas de afiliados
  - Métricas de uso

#### Scripts
- **`scripts/setup_intent_radar_tenant.js`**
  - Setup automático completo
  - Validação de instalação
  - Relatório detalhado

- **`scripts/intent_radar_helper.js`**
  - CLI helper com 4 comandos:
    - `status` - Verifica status da instalação
    - `install` - Instala schema + seed
    - `uninstall` - Remove schema
    - `reset` - Limpa e reinstala

#### Documentação
- **`INTENT_RADAR_SETUP.md`**
  - Guia completo de setup
  - Arquitetura do schema
  - Configuração detalhada
  - Troubleshooting

- **`README_INTENT_RADAR.md`**
  - Quick start guide
  - Comandos rápidos
  - Exemplos de uso
  - Referência rápida

- **`.env.intent-radar.example`**
  - Template de configuração
  - Todas as variáveis necessárias
  - Comentários explicativos

- **`CHANGELOG_INTENT_RADAR.md`** (este arquivo)
  - Histórico de alterações

### 🔧 Arquivos Modificados

#### `package.json`
Novos scripts adicionados:
```json
{
  "setup:intent-radar": "Setup completo",
  "migrate:intent-radar": "Migration rápida",
  "ir:status": "Verificar status",
  "ir:install": "Instalar schema",
  "ir:uninstall": "Remover schema",
  "ir:reset": "Reset completo"
}
```

### 📊 Estrutura do Schema

#### 1. Multi-tenant Core (4 tabelas)
- `tenants` - Empresas/clientes
- `users` - Usuários por tenant
- `plans` - Planos de assinatura
- `subscriptions` - Assinaturas ativas

#### 2. Intents & Analytics (4 tabelas)
- `intents` - Palavras-chave
- `intent_trends` - Tendências históricas
- `products` - Produtos de afiliados
- `product_metrics` - Métricas de produtos

#### 3. Mapeamento (1 tabela)
- `intent_product_map` - Relação intent ↔ produto

#### 4. Afiliados (2 tabelas)
- `affiliate_accounts` - Contas de afiliados
- `affiliate_links` - Links gerados

#### 5. Google Ads (4 tabelas)
- `google_ads_accounts` - Contas conectadas
- `ad_campaigns` - Campanhas
- `ad_groups` - Grupos de anúncios
- `ads` - Anúncios individuais

#### 6. Criativos (2 tabelas)
- `creatives` - Textos e imagens
- `ad_creatives` - Vínculos com anúncios

#### 7. Jobs & Logs (2 tabelas)
- `jobs` - Processamentos assíncronos
- `job_logs` - Logs detalhados

#### 8. Auditoria & Métricas (2 tabelas)
- `audit_logs` - Trilha de auditoria
- `usage_metrics` - Métricas de uso

**Total: 21 tabelas**

### 🚀 Como Usar

#### Instalação Rápida
```bash
npm install
copy .env.intent-radar.example .env
npm run ir:install
```

#### Verificar Status
```bash
npm run ir:status
```

#### Reset (se necessário)
```bash
npm run ir:reset
```

### 🔐 Credenciais Padrão

**Admin:**
- Email: admin@intentradar.com
- Senha: Admin@2026

**Developer:**
- Email: dev@intentradar.com
- Senha: Dev@2026

### ✅ Features Implementadas

- ✅ Schema completo com 21 tabelas
- ✅ Relacionamentos com Foreign Keys
- ✅ Índices para performance
- ✅ Triggers automáticos
- ✅ Seed com dados de exemplo
- ✅ Setup script automatizado
- ✅ CLI helper com 4 comandos
- ✅ Documentação completa
- ✅ Template .env
- ✅ Comandos npm shortcuts

### 🎯 Diferenças do Schema Original

| Item | Schema ProFitness | Schema Intent Radar |
|------|------------------|---------------------|
| **Foco** | Academia/Fitness | Marketing/Afiliados |
| **Tabelas** | 25+ tabelas | 21 tabelas |
| **Multi-tenant** | Via DynamoDB | Nativo no schema |
| **Autenticação** | Cognito | Email/Password |
| **Primary Keys** | Mixed (UUID/int) | UUID apenas |
| **Features** | Presença, Benefícios | Ads, Afiliados |

### 📦 Dependências

Todas as dependências já existentes no projeto:
- knex
- pg
- bcryptjs
- chalk
- ora
- commander
- dotenv

Nenhuma dependência adicional necessária.

### 🐛 Problemas Conhecidos

Nenhum problema conhecido no momento.

### 📅 Roadmap Futuro

- [ ] Migration para adicionar analytics avançados
- [ ] Seed com mais dados de exemplo
- [ ] Script de import em massa (CSV)
- [ ] Dashboard de métricas
- [ ] Integração com mais plataformas de afiliados
- [ ] AI/ML para recomendação de produtos

### 🤝 Compatibilidade

- ✅ Node.js 18+
- ✅ PostgreSQL 12+
- ✅ Knex.js 3.x
- ✅ Windows / Linux / macOS

### 📞 Suporte

Para dúvidas:
1. Consulte [README_INTENT_RADAR.md](./README_INTENT_RADAR.md)
2. Consulte [INTENT_RADAR_SETUP.md](./INTENT_RADAR_SETUP.md)
3. Verifique logs em `/logs`

---

**Autor**: Intent Radar Team  
**Data**: Janeiro 4, 2026  
**Versão**: 1.0.0
