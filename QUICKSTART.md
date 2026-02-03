# 🚀 Guia Rápido de Uso - ProFitness Migrations

## 📋 Pré-requisitos

1. **Node.js 18+** instalado
2. **PostgreSQL** rodando (local ou remoto)
3. **DynamoDB** configurado (para modo multi-tenant)
4. **Variáveis de ambiente** configuradas

## ⚡ Setup Rápido

### 1. Instalar Dependências

```bash
cd c:\Projeto\proffitness\proffitness-migration
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
copy .env.example .env

# Editar .env com suas configurações
notepad .env
```

## 🎯 Cenários de Uso

### 📦 Cenário 1: Desenvolvimento Local (SEM DynamoDB)

```bash
# 1. Configurar .env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME_APP=proffitness_dev

# 2. Executar migrations
npm run migrate -- --local

# 3. Executar seeds
npm run seed -- --local

# ✅ Pronto! Banco configurado com dados de demonstração
```

### 🌐 Cenário 2: Multi-tenant com DynamoDB

```bash
# 1. Configurar AWS no .env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua_key
AWS_SECRET_ACCESS_KEY=sua_secret
DYNAMODB_TENANTS_TABLE=proffitness-tenants

# 2. Executar migration para tenant específico
npm run migrate -- --tenant=minha-empresa

# 3. Executar seeds
npm run seed -- --tenant=minha-empresa

# ✅ Banco do tenant configurado!
```

### 🏢 Cenário 3: Múltiplos Tenants

```bash
# Migrar primeiro tenant
npm run migrate -- --tenant=empresa-alpha --env=production

# Migrar segundo tenant
npm run migrate -- --tenant=empresa-beta --env=production

# Migrar terceiro tenant
npm run migrate -- --tenant=empresa-gamma --env=production
```

## 🔍 Comandos Úteis

### Ver o que será executado (Dry Run)

```bash
npm run migrate -- --tenant=minha-empresa --dry-run --verbose
```

### Rollback de Última Migration

```bash
npm run rollback -- --tenant=minha-empresa
```

### Rollback Completo (CUIDADO!)

```bash
npm run rollback -- --tenant=minha-empresa --all --yes
```

### Verificar Status

```bash
node migrate.js --tenant=minha-empresa --action=status
```

## 📊 Estrutura DynamoDB

Sua tabela `proffitness-tenants` deve ter esta estrutura:

```json
{
  "tenantKey": "minha-empresa",
  "name": "Minha Empresa LTDA",
  "status": "active",
  "database": {
    "host": "my-db.us-east-1.rds.amazonaws.com",
    "port": 5432,
    "user": "proffitness_user",
    "password": "senha_segura_aqui",
    "name": "proffitness_minha_empresa",
    "ssl": true
  },
  "features": {
    "presence_tracking": true,
    "rewards_system": true
  },
  "limits": {
    "max_academias": 10,
    "max_alunos": 5000
  }
}
```

## 🐛 Troubleshooting

### Erro: "Tenant não encontrado"

```bash
# Verifique se existe no DynamoDB
aws dynamodb get-item \
  --table-name proffitness-tenants \
  --key '{"tenantKey": {"S": "sua-chave"}}'

# Ou use modo local
npm run migrate --local
```

### Erro: "Conexão recusada"

```bash
# Verifique se PostgreSQL está rodando
pg_isready

# Teste conexão manual
psql -h localhost -U postgres -d postgres
```

### Erro: "AWS credentials not found"

```bash
# Configure credenciais AWS
aws configure

# Ou defina no .env
AWS_ACCESS_KEY_ID=sua_key
AWS_SECRET_ACCESS_KEY=sua_secret
```

### Reset Completo do Banco

```bash
# ⚠️ CUIDADO: Isso apaga TUDO!
npm run migrate:reset
npm run seed:dev
```

## 📈 Workflow Recomendado

### Para Desenvolvimento

```bash
# 1. Setup inicial
npm install
copy .env.example .env

# 2. Migrar
npm run migrate --local

# 3. Popular dados
npm run seed:dev

# 4. Desenvolver...

# 5. Testar nova migration
npm run migrate:up

# 6. Se der erro, reverter
npm run rollback
```

### Para Produção

```bash
# 1. Testar em staging primeiro
npm run migrate -- --tenant=empresa-teste --env=staging

# 2. Verificar se funcionou
npm run health

# 3. Migrar em produção
npm run migrate -- --tenant=empresa-real --env=production

# 4. Verificar novamente
npm run health
```

## 🎓 Exemplos Práticos

### Adicionar Nova Academia

```bash
# 1. Migrar estrutura
npm run migrate -- --tenant=nova-academia

# 2. Popular dados iniciais
npm run seed -- --tenant=nova-academia

# 3. Verificar
psql -h <host> -U <user> -d <database> -c "SELECT * FROM academias;"
```

### Atualizar Estrutura Existente

```bash
# 1. Criar nova migration
node scripts/create_migration.js add_new_column

# 2. Editar arquivo gerado em migrations/

# 3. Aplicar
npm run migrate:up

# 4. Se der erro, reverter
npm run rollback
```

## 📚 Próximos Passos

1. ✅ Migrations executadas
2. ✅ Seeds populados
3. ⏭️ Configurar API backend
4. ⏭️ Integrar com Cognito
5. ⏭️ Configurar beacons
6. ⏭️ Deploy em produção

## 💡 Dicas

- Use `--verbose` para ver detalhes da execução
- Use `--dry-run` antes de executar em produção
- Faça backup antes de rollback
- Teste em staging antes de produção
- Documente alterações customizadas

## 🆘 Suporte

- **Documentação**: `README.md`
- **Estrutura**: `docs/tables.md`
- **Issues**: Abra um issue no repositório
- **Email**: suporte@proffitness.com.br

---

✨ **Pronto para começar!** Execute o primeiro comando e veja a mágica acontecer! ✨
