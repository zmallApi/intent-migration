#!/usr/bin/env node

const { Command } = require('commander');
const knex = require('knex');
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
require('dotenv').config();

const { getDynamicConfig } = require('./knexfile');
const localConfig = require('./knexfile');

const program = new Command();

program
  .version('1.0.0')
  .description('ProFitness Database Migration Tool with DynamoDB Integration')
  .option('-e, --env <environment>', 'Environment (development, staging, production)', 'development')
  .option('-a, --action <action>', 'Action (latest, up, down, rollback, reset)', 'latest')
  .option('-t, --tenant <tenant>', 'Tenant key (obrigatório para modo DynamoDB)')
  .option('-d, --database <database>', 'Database type (app, bi, both)', 'app')
  .option('--dry-run', 'Simulate migration without executing')
  .option('-v, --verbose', 'Verbose output')
  .option('--local', 'Force local mode (ignore DynamoDB)')
  .parse();

const options = program.opts();

/**
 * Logger simples
 */
const logger = {
  info: (message, meta = {}) => {
    console.log(chalk.blue('ℹ️'), message, meta);
  },
  error: (message, meta = {}) => {
    console.error(chalk.red('❌'), message, meta);
  },
  success: (message) => {
    console.log(chalk.green('✅'), message);
  },
  warning: (message) => {
    console.log(chalk.yellow('⚠️'), message);
  }
};

class MigrationManager {
  constructor(options) {
    this.options = options;
    this.env = options.env;
    this.action = options.action;
    this.tenantKey = options.tenant;
    this.databaseType = options.database;
    this.dryRun = options.dryRun;
    this.verbose = options.verbose;
    this.useLocal = options.local;
    this.useDynamoDB = !this.useLocal && !!this.tenantKey;
  }

  async run() {
    try {
      console.log(chalk.cyan('\n🚀 ProFitness Migration System\n'));
      
      logger.info('Iniciando processo de migração', {
        environment: this.env,
        action: this.action,
        database: this.databaseType,
        tenant: this.tenantKey || 'N/A',
        mode: this.useDynamoDB ? 'DynamoDB' : 'Local',
        dryRun: this.dryRun
      });

      if (this.dryRun) {
        logger.warning('DRY RUN MODE - Nenhuma alteração será feita\n');
      }

      // Valida se tenant key foi fornecida quando não está em modo local
      if (!this.useLocal && !this.tenantKey) {
        throw new Error(
          'TENANT_KEY é obrigatório. Use --tenant=<chave> ou --local para modo local'
        );
      }

      // Determina quais bancos de dados migrar
      const databases = await this.getDatabasesToMigrate();

      if (databases.length === 0) {
        throw new Error('Nenhuma configuração de banco de dados disponível');
      }

      // Executa migrações em cada banco
      for (const dbConfig of databases) {
        await this.migrateDatabase(dbConfig);
      }

      console.log(chalk.green('\n✅ Todas as migrações foram concluídas com sucesso!\n'));

    } catch (error) {
      logger.error('Falha na migração:', { error: error.message });
      console.error(chalk.red('\n' + error.stack + '\n'));
      process.exit(1);
    }
  }

  async getDatabasesToMigrate() {
    const databases = [];

    if (this.useDynamoDB) {
      // Modo DynamoDB - Busca configuração do tenant
      logger.info(`Buscando configurações do tenant '${this.tenantKey}' no DynamoDB...`);
      
      const dynamicConfig = await getDynamicConfig(this.tenantKey, this.env);
      
      if (!dynamicConfig) {
        throw new Error(`Não foi possível carregar configurações do tenant '${this.tenantKey}'`);
      }

      databases.push({
        name: `Application DB (${this.tenantKey})`,
        config: dynamicConfig,
        type: 'app',
        tenant: this.tenantKey
      });

      logger.success(`Configurações carregadas do DynamoDB para tenant '${this.tenantKey}'`);

    } else {
      // Modo Local - Usa variáveis de ambiente
      logger.info('Usando configuração local (variáveis de ambiente)');

      if (this.databaseType === 'app' || this.databaseType === 'both') {
        databases.push({
          name: 'Application DB (Local)',
          config: localConfig[this.env],
          type: 'app',
          tenant: 'local'
        });
      }

      if (this.databaseType === 'bi' || this.databaseType === 'both') {
        databases.push({
          name: 'BI DB (Local)',
          config: localConfig[`bi_${this.env}`],
          type: 'bi',
          tenant: 'local'
        });
      }
    }

    return databases;
  }

  async migrateDatabase(dbConfig) {
    const spinner = ora(`Conectando a ${dbConfig.name}...`).start();
    
    try {
      const db = knex(dbConfig.config);
      
      // Testa conexão
      await db.raw('SELECT 1');
      spinner.succeed(`Conectado a ${dbConfig.name}`);

      if (this.verbose) {
        console.log(chalk.gray(`   Host: ${dbConfig.config.connection.host}`));
        console.log(chalk.gray(`   Database: ${dbConfig.config.connection.database}`));
        console.log(chalk.gray(`   Tenant: ${dbConfig.tenant}\n`));
      }

      if (this.dryRun) {
        console.log(chalk.yellow(`   [DRY RUN] Simularia ação: ${this.action}\n`));
        await db.destroy();
        return;
      }

      // Executa ação de migração
      spinner.start(`Executando ${this.action} em ${dbConfig.name}...`);
      
      let result;
      switch (this.action) {
        case 'latest':
          result = await db.migrate.latest();
          break;
        case 'up':
          result = await db.migrate.up();
          break;
        case 'down':
          result = await db.migrate.down();
          break;
        case 'rollback':
          result = await db.migrate.rollback();
          break;
        case 'reset':
          await db.migrate.rollback(undefined, true);
          result = await db.migrate.latest();
          break;
        default:
          throw new Error(`Ação desconhecida: ${this.action}`);
      }

      // Obtém status da migração
      const currentVersion = await db.migrate.currentVersion();
      
      spinner.succeed(`${dbConfig.name} - Migração concluída (Versão: ${currentVersion})`);
      
      if (this.verbose && result && result[1] && result[1].length > 0) {
        console.log(chalk.gray(`   Migrações aplicadas:`));
        result[1].forEach(migration => {
          console.log(chalk.gray(`   ✓ ${migration}`));
        });
      }

      await db.destroy();

    } catch (error) {
      spinner.fail(`${dbConfig.name} - Falha na migração: ${error.message}`);
      throw error;
    }
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  const migrationManager = new MigrationManager(options);
  migrationManager.run().catch(error => {
    console.error(chalk.red('\n❌ Erro fatal:'), error.message);
    process.exit(1);
  });
}

module.exports = MigrationManager;
