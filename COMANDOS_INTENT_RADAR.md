# 🎯 Intent Radar - Guia de Comandos

## ⚠️ IMPORTANTE

O Intent Radar usa **banco de dados SEPARADO**:
- Banco: `intent_radar_dev` (não `proffitness_app`)
- Variáveis: `IR_DB_*` (não `DB_*`)

## 🚀 Instalação e Setup

### Primeira Instalação (Completa)
```bash
# Passo 1: Instalar dependências
npm install

# Passo 2: Copiar configuração
copy .env.intent-radar.example .env

# Passo 3: Editar .env (usar IR_DB_*)
notepad .env

# Passo 4: Criar banco separado
npm run ir:create-db

# Passo 5: Executar setup completo
npm run ir:install
```

### Instalação Rápida (Helper)
```bash
npm run ir:install
```

---

## 📊 Verificação e Status

### Ver Status Completo
```bash
npm run ir:status
```

**Output esperado:**
```
📊 Status das Migrations - Intent Radar

✓ Conectado
✓ 1 migrations executadas
✅ Schema Intent Radar: INSTALADO
✓ 21 tabelas encontradas
✅ Todas as tabelas do Intent Radar estão presentes

📈 Estatísticas:
   Tenants: 1
   Usuários: 2
   Intents: 5
   Produtos: 5
```

### Listar Todas as Migrations
```bash
npm run migrate -- --local --action=list
```

---

## 🔄 Operações de Manutenção

### Reset Completo (Limpa e Reinstala)
```bash
# CUIDADO: Apaga TODOS os dados!
npm run ir:reset
```

### Rollback da Última Migration
```bash
npm run migrate:rollback -- --local
```

### Executar Migration Específica
```bash
npm run migrate:up -- --local
```

---

## 🗑️ Desinstalação

### Remover Schema Intent Radar
```bash
# Com confirmação
npm run ir:uninstall

# Sem confirmação (força)
npm run ir:uninstall -- --force
```

---

## 🌱 Seeds (Dados Iniciais)

### Executar Seed Específico
```bash
npm run seed -- --local --specific=100_intent_radar_initial_data.js
```

### Executar Todos os Seeds
```bash
npm run seed:dev
```

---

## 🔍 Consultas SQL Úteis

### Acessar PostgreSQL
```bash
# INTENT RADAR (banco separado)
psql -h 98.86.225.21 -U postgres -d intent_radar_dev

# ProFitness (NÃO confundir!)
psql -h 98.86.225.21 -U postgres -d proffitness_app
```

### Ver Todas as Tabelas
```sql
\dt
```

### Ver Tenants
```sql
SELECT id, name, slug, status FROM tenants;
```

### Ver Usuários
```sql
SELECT email, role, status FROM users;
```

### Ver Intents
```sql
SELECT keyword, search_volume, cpc, intent_score 
FROM intents 
ORDER BY intent_score DESC;
```

### Ver Produtos
```sql
SELECT name, platform, price, commission_percent 
FROM products 
ORDER BY score DESC;
```

### Ver Mapeamento Intent → Produto
```sql
SELECT 
  i.keyword,
  p.name as product_name,
  ipm.relevance_score
FROM intent_product_map ipm
JOIN intents i ON i.id = ipm.intent_id
JOIN products p ON p.id = ipm.product_id
ORDER BY ipm.relevance_score DESC;
```

### Ver Campanhas Ativas
```sql
SELECT 
  c.id,
  i.keyword,
  p.name as product,
  c.status,
  c.budget
FROM ad_campaigns c
JOIN intents i ON i.id = c.intent_id
JOIN products p ON p.id = c.product_id
WHERE c.status = 'active';
```

---

## 🔧 Desenvolvimento

### Criar Nova Migration
```bash
npm run create:migration
# Seguir prompts interativos
```

### Criar Novo Seed
```bash
npm run create:seed
# Seguir prompts interativos
```

### Modo Desenvolvimento (Watch)
```bash
# Executar migrations em modo desenvolvimento
npm run migrate -- --local --verbose
```

---

## 🐛 Troubleshooting

### Erro: "Migration já executada"
```bash
# Fazer rollback
npm run ir:reset
```

### Erro: "Conexão recusada"
```bash
# Verificar se PostgreSQL está rodando
psql -h 98.86.225.21 -U postgres -l

# Testar conexão
npm run health
```

### Erro: "Permissão negada"
```bash
# Verificar credenciais no .env
cat .env | grep DB_

# Usar usuário com permissões adequadas
MIGRATION_DB_USER=postgres
MIGRATION_DB_PASSWORD=sua_senha
```

### Ver Logs Detalhados
```bash
# Executar com verbose
npm run migrate -- --local --verbose

# Ou com debug
DEBUG=* npm run migrate -- --local
```

---

## 📈 Monitoramento

### Ver Métricas de Uso
```sql
SELECT 
  metric,
  count,
  period
FROM usage_metrics
WHERE tenant_id = 'SEU_TENANT_ID'
ORDER BY period DESC;
```

### Ver Logs de Jobs
```sql
SELECT 
  j.type,
  j.status,
  j.started_at,
  j.finished_at,
  COUNT(jl.id) as log_count
FROM jobs j
LEFT JOIN job_logs jl ON jl.job_id = j.id
GROUP BY j.id
ORDER BY j.started_at DESC
LIMIT 10;
```

### Ver Auditoria
```sql
SELECT 
  action,
  entity,
  created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 20;
```

---

## 🎯 Comandoscreate-db` | Cria banco separado |
| `npm run ir: Rápidos (Cheat Sheet)

| Comando | Descrição |
|---------|-----------|
| `npm run ir:install` | Instala schema + dados |
| `npm run ir:status` | Verifica status |
| `npm run ir:reset` | Reset completo |
| `npm run ir:uninstall` | Remove schema |
| `npm run setup:intent-radar` | Setup completo |
| `npm run migrate:intent-radar` | Só migration |

---

## 📁 Estrutura de Arquivos

```
int-migration/
├── migrations/
│   └── 100_create_intent_radar_schema.js
├── seeds/
│   └── 100_intent_radar_initial_data.js
├── scripts/
│   ├── setup_intent_radar_tenant.js
│   └── intent_radar_helper.js
├── .env (criar a partir do .example)
├── .env.intent-radar.example
├── README_INTENT_RADAR.md
├── INTENT_RADAR_SETUP.md
├── CHANGELOG_INTENT_RADAR.md
└── COMANDOS_INTENT_RADAR.md (este arquivo)
```

---

## 🔐 Credenciais Padrão

Após `npm run ir:install`:

```
Admin:
  Email: admin@intentradar.com
  Senha: Admin@2026

Developer:
  Email: dev@intentradar.com
  Senha: Dev@2026
```

---

## ⚡ Fluxo de Trabalho Típico

### 1. Setup Inicial
```bash
npm install
copy .env.icreate-db
npm run ir:ntent-radar.example .env
npm run ir:install
npm run ir:status
```

### 2. Desenvolvimento
```bash
# Criar migration
npm run create:migration

# Executar migration
npm run migrate:up -- --local

# Verificar
npm run ir:status
```

### 3. Reset para Testes
```bash
npm run ir:reset
npm run ir:status
```

### 4. Produção
```bash
# Executar em produção (com DynamoDB)
NODE_ENV=production npm run migrate -- --tenant=intent-radar

# Ou local
npm run migrate -- --local --env=production
```

---

**Versão**: 1.0.0  
**Atualizado**: Janeiro 2026
