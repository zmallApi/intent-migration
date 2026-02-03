# 🎯 Intent Radar - Quick Start

## ⚠️ IMPORTANTE - Banco de Dados Separado

O **Intent Radar usa um banco de dados SEPARADO** do ProFitness:
- ProFitness: `proffitness_app`
- Intent Radar: `intent_radar_dev`

## 📦 Instalação Rápida

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
copy .env.intent-radar.example .env

# 3. Editar .env com suas credenciais
notepad .env

# 4. Criar banco de dados separado
npm run ir:create-db

# 5. Instalar schema completo
npm run ir:install
```

## 🚀 Comandos Disponíveis

### Setup Inicial
```bash
# Instalação completa (recomendado)
npm run setup:intent-radar

# Ou usar helper
npm run ir:install
```

### Verificar Status
```bash
# Ver status das migrations e dados
npm run ir:status
```

### Reset (Limpar e Reinstalar)
```bash
# CUIDADO: Apaga todos os dados!
npm run ir:reset
```

### Desinstalar
```bash
# Remove o schema (CUIDADO!)
npm run ir:uninstall
```

## 📊 Schema Criado

O comando `ir:install` cria **21 tabelas**:

### Core
- ✅ `tenants` - Empresas
- ✅ `users` - Usuários
- ✅ `plans` - Planos
- ✅ `subscriptions` - Assinaturas

### Intents & Produtos
- ✅ `intents` - Palavras-chave
- ✅ `intent_trends` - Tendências
- ✅ `products` - Produtos afiliados
- ✅ `product_metrics` - Métricas
- ✅ `intent_product_map` - Mapeamento

### Afiliados
- ✅ `affiliate_accounts` - Contas
- ✅ `affiliate_links` - Links

### Google Ads
- ✅ `google_ads_accounts` - Contas
- ✅ `ad_campaigns` - Campanhas
- ✅ `ad_groups` - Grupos
- ✅ `ads` - Anúncios

### Criativos & Jobs
- ✅ `creatives` - Textos/Imagens
- ✅ `ad_creatives` - Vínculos
- ✅ `jobs` - Processamentos
- ✅ `job_logs` - Logs

### Auditoria
- ✅ `audit_logs` - Trilha de auditoria
- ✅ `usage_metrics` - Métricas de uso

## 🔐 Credenciais Padrão

Após instalação, use:

**Admin**
- Email: `admin@intentradar.com`
- Senha: `Admin@2026`

**Developer**
- Email: `dev@intentradar.com`
- Senha: `Dev@2026`

## 🎯 Exemplos de Uso

### Verificar Instalação
```bash
npm run ir:status
```

**Output esperado:**
```
📊 Status das Migrations - Intent Radar

✓ Conectado
✓ 1 migrations executadas

✅ Schema Intent Radar: INSTALADO
   Data: 2026-01-04 12:00:00
   Batch: 1

✓ 21 tabelas encontradas
✅ Todas as tabelas do Intent Radar estão presentes

📈 Estatísticas:
   Tenants: 1
   Usuários: 2
   Intents: 5
   Produtos: 5
```

### Acessar Banco
```bash
# PostgreSQL
psql -h 98.86.225.21 -U postgres -d intent_radar_db

# Ver tabelas
\dt

# Ver tenants
SELECT * FROM tenants;

# Ver usuários
SELECT email, role, status FROM users;
```

## 🔧 Troubleshooting

### Erro: "relation already exists"
```bash
# Fazer reset
npm run ir:reset
```

### Erro: "connection refused"
Verificar:
1. PostgreSQL está rodando?
2. Credenciais no `.env` estão corretas?
3. Firewall bloqueando porta 5432?

### Ver todas as migrations
```bash
npm run migrate -- --local --action=list
```

## 📁 Arquivos Criados

```
migrations/
  └── 100_create_intent_radar_schema.js    # Migration principal

seeds/
  └── 100_intent_radar_initial_data.js     # Dados iniciais

scripts/
  ├── setup_intent_radar_tenant.js         # Setup completo
  └── intent_radar_helper.js               # Helper CLI

.env.intent-radar.example                   # Template .env
INTENT_RADAR_SETUP.md                       # Documentação completa
```

## 🎓 Próximos Passos

1. **Configure Google Ads**
   ```sql
   INSERT INTO google_ads_accounts (tenant_id, customer_id, refresh_token)
   VALUES ('seu-tenant-id', 'seu-customer-id', 'seu-token');
   ```

2. **Configure Afiliados**
   ```sql
   UPDATE affiliate_accounts 
   SET external_account_id = 'seu-tag-amazon'
   WHERE platform = 'amazon';
   ```

3. **Importe Intents**
   ```sql
   INSERT INTO intents (keyword, country, language, search_volume, cpc)
   VALUES ('sua palavra-chave', 'BR', 'pt', 10000, 1.50);
   ```

4. **Crie Campanhas**
   - Use a API ou interface
   - Mapear intent → produto → campanha

## 📚 Documentação Completa

- [INTENT_RADAR_SETUP.md](./INTENT_RADAR_SETUP.md) - Guia detalhado
- [README.md](./README.md) - Documentação geral do projeto
- [QUICKSTART.md](./QUICKSTART.md) - Início rápido

## ⚡ Comandos Rápidos

| Comando | Descrição |
|---------|-----------|
| `npm run ir:install` | Instala schema |
| `npm run ir:status` | Verifica status |
| `npm run ir:reset` | Reset completo |
| `npm run ir:uninstall` | Remove schema |

---

**Versão**: 1.0.0  
**Data**: Janeiro 2026  
**Tenant**: intent-radar
