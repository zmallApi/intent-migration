# 🎯 Intent Radar - Guia de Setup

## ⚠️ IMPORTANTE - Isolamento de Bancos

O Intent Radar roda em um **banco de dados COMPLETAMENTE SEPARADO** do ProFitness:

| Projeto | Banco de Dados | Variáveis .env |
|---------|---------------|----------------|
| ProFitness | `proffitness_app` | `DB_*` |
| Intent Radar | `intent_radar_dev` | `IR_DB_*` |

**Nunca misture os dois!** As migrations do Intent Radar (100+) vão apenas para o banco `intent_radar_dev`.

## 📋 Visão Geral

Este guia descreve como configurar o banco de dados para o tenant **Intent Radar**, um sistema SaaS de automação de campanhas Google Ads baseado em intents (palavras-chave) e produtos de afiliados.

## 🏗️ Arquitetura do Schema

O schema Intent Radar inclui as seguintes entidades principais:

### 1. **Multi-tenant & Autenticação**
- `tenants` - Empresas/clientes
- `users` - Usuários por tenant
- `plans` - Planos de assinatura
- `subscriptions` - Assinaturas ativas

### 2. **Intents & Produtos**
- `intents` - Palavras-chave e intenções de busca
- `intent_trends` - Tendências históricas
- `products` - Produtos de afiliados
- `product_metrics` - Métricas de produtos
- `intent_product_map` - Mapeamento intent ↔ produto

### 3. **Afiliados**
- `affiliate_accounts` - Contas de afiliados por tenant
- `affiliate_links` - Links de afiliados gerados

### 4. **Google Ads**
- `google_ads_accounts` - Contas Google Ads conectadas
- `ad_campaigns` - Campanhas
- `ad_groups` - Grupos de anúncios
- `ads` - Anúncios individuais

### 5. **Criativos & Jobs**
- `creatives` - Textos e imagens reutilizáveis
- `ad_creatives` - Vínculo anúncios ↔ criativos
- `jobs` - Processamentos assíncronos
- `job_logs` - Logs de jobs

### 6. **Auditoria**
- `audit_logs` - Trilha de auditoria completa
- `usage_metrics` - Métricas de uso por tenant

## 🚀 Setup Rápido

### Opção 1: Setup Automático (Recomendado)

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env
copy .env.example .env
notepad .env

# 3. Criar banco de dados separado
npm run ir:create-db

# 4. Executar setup completo (migration + seed)
npm run ir:install
```

### Opção 2: Setup Manual

```bash
# 1. Executar apenas a migration
npm run migrate -- --local --action=latest

# 2. Executar seed específico
node seed.js --local --specific=100_intent_radar_initial_data.js
```

## ⚙️ Configuração do .env

```env
# ===== INTENT RADAR - Banco Separado =====
IR_DB_HOST=98.86.225.21
IR_DB_PORT=5432
IR_DB_USER=postgres
IR_DB_PASSWORD=Proffitness2025Ec2x!
IR_DB_NAME=intent_radar_dev

# ===== NÃO USAR - ProFitness =====
# DB_HOST, DB_USER, DB_NAME_APP (são do ProFitness)
```

## 📊 Dados Iniciais Incluídos

O seed `100_intent_radar_initial_data.js` cria:

### Planos de Assinatura
- **Starter** - $99/mês (10 campanhas, 100 intents, 50 produtos)
- **Professional** - $299/mês (50 campanhas, 1000 intents, 500 produtos)
- **Enterprise** - $999/mês (ilimitado)

### Tenant Demo
- **Nome**: Intent Radar
- **Slug**: `intent-radar`
- **Plano**: Professional

### Usuários
- **Admin**: `admin@intentradar.com` / `Admin@2026`
- **Developer**: `dev@intentradar.com` / `Dev@2026`

### Dados de Exemplo
- 5 intents (palavras-chave)
- 5 produtos (Amazon)
- Mapeamentos intent ↔ produto
- 2 contas de afiliados (Amazon, Impact)
- Métricas de uso do mês atual

## 🔍 Validação da Instalação

```bash
# Conectar ao PostgreSQL
psql -h 98.86.225.21 -U postgres -d intent_radar_db

# Verificar tabelas criadas
\dt

# Verificar dados inseridos
SELECT * FROM tenants;
SELECT * FROM users;
SELECT * FROM intents;
SELECT * FROM products;
```

## 📚 Estrutura de Arquivos Criados

```
migrations/
  └── 100_create_intent_radar_schema.js   # Schema completo

seeds/
  └── 100_intent_radar_initial_data.js    # Dados iniciais

scripts/
  └── setup_intent_radar_tenant.js        # Script de setup
```

## 🔄 Comandos Úteis

### Executar Migration
```bash
# Executar migration 100 (Intent Radar)
npm run migrate:intent-radar

# Rollback da última migration
npm run migrate:rollback -- --local

# Ver status das migrations
npm run migrate -- --local --action=status
```

### Executar Seeds
```bash
# Todos os seeds
npm run seed -- --local

# Seed específico do Intent Radar
npm run seed -- --local --specific=100_intent_radar_initial_data.js
```

### Reset Completo
```bash
# CUIDADO: Remove todos os dados
npm run migrate:reset -- --local
npm run seed -- --local
```

## 🎯 Próximos Passos

Após o setup, você pode:

1. **Configurar Google Ads**
   - Conectar conta Google Ads
   - Configurar OAuth2 tokens
   - Inserir customer_id

2. **Configurar Afiliados**
   - Adicionar credenciais Amazon Associates
   - Configurar outras plataformas (Impact, ShareASale, etc.)

3. **Importar Dados**
   - Importar lista de palavras-chave (intents)
   - Conectar produtos relevantes
   - Configurar mapeamentos automáticos

4. **Criar Primeira Campanha**
   - Selecionar intent
   - Escolher produto
   - Gerar anúncios automaticamente

## 🔐 Segurança

- ✅ Senhas armazenadas com bcrypt
- ✅ UUIDs como primary keys
- ✅ Foreign keys com CASCADE
- ✅ Índices em campos de busca
- ✅ Triggers automáticos para updated_at
- ✅ Audit logs para todas ações importantes

## 🐛 Troubleshooting

### Erro: "relation already exists"
A migration já foi executada. Use `--force` ou faça rollback primeiro.

```bash
npm run migrate:rollback -- --local
npm run setup:intent-radar
```

### Erro: "connection refused"
Verifique se o PostgreSQL está rodando e as credenciais no .env estão corretas.

### Erro: "bcryptjs not found"
Instale as dependências:

```bash
npm install
```

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- [README.md](./README.md) - Documentação geral
- [QUICKSTART.md](./QUICKSTART.md) - Guia rápido
- Logs de execução em `/logs`

---

**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2026
