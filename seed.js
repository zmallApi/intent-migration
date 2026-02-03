#!/usr/bin/env node

const { Command } = require('commander');
const knex = require('knex');
const chalk = require('chalk');
const ora = require('ora');
require('dotenv').config();

const { getDynamicConfig } = require('./knexfile');
const localConfig = require('./knexfile');

const program = new Command();

program
  .version('1.0.0')
  .description('ProFitness Database Seed Tool')
  .option('-e, --env <environment>', 'Environment (development, staging, production)', 'development')
  .option('-t, --tenant <tenant>', 'Tenant key (obrigatório para modo DynamoDB)')
  .option('--local', 'Force local mode (ignore DynamoDB)')
  .option('-v, --verbose', 'Verbose output')
  .parse();

const options = program.opts();

const logger = {
  info: (message) => console.log(chalk.blue('ℹ️'), message),
  error: (message) => console.error(chalk.red('❌'), message),
  success: (message) => console.log(chalk.green('✅'), message),
  warning: (message) => console.log(chalk.yellow('⚠️'), message)
};

class SeedManager {
  constructor(options) {
    this.options = options;
    this.env = options.env;
    this.tenantKey = options.tenant;
    this.useLocal = options.local;
    this.verbose = options.verbose;
    this.useDynamoDB = !this.useLocal && !!this.tenantKey;
  }

  async run() {
    try {
      console.log(chalk.cyan('\n🌱 ProFitness Seed System\n'));
      
      logger.info(`Iniciando população de dados - Environment: ${this.env}`);

      if (!this.useLocal && !this.tenantKey) {
        throw new Error('TENANT_KEY é obrigatório. Use --tenant=<chave> ou --local');
      }

      const dbConfig = await this.getDatabaseConfig();
      await this.seedDatabase(dbConfig);

      console.log(chalk.green('\n✅ Seeds executados com sucesso!\n'));

    } catch (error) {
      logger.error(`Falha ao executar seeds: ${error.message}`);
      console.error(chalk.red('\n' + error.stack + '\n'));
      process.exit(1);
    }
  }

  async getDatabaseConfig() {
    if (this.useDynamoDB) {
      logger.info(`Buscando configurações do tenant '${this.tenantKey}' no DynamoDB...`);
      const config = await getDynamicConfig(this.tenantKey, this.env);
      if (!config) {
        throw new Error(`Não foi possível carregar configurações do tenant '${this.tenantKey}'`);
      }
      logger.success(`Configurações carregadas do DynamoDB`);
      return config;
    } else {
      logger.info('Usando configuração local (variáveis de ambiente)');
      return localConfig[this.env];
    }
  }

  async seedDatabase(dbConfig) {
    const spinner = ora('Conectando ao banco de dados...').start();
    
    try {
      const db = knex(dbConfig);
      
      // Testa conexão
      await db.raw('SELECT 1');
      spinner.succeed('Conectado ao banco de dados');

      if (this.verbose) {
        console.log(chalk.gray(`   Host: ${dbConfig.connection.host}`));
        console.log(chalk.gray(`   Database: ${dbConfig.connection.database}\n`));
      }

      // Executa seeds
      spinner.start('Executando seeds...');
      const result = await db.seed.run();
      
      spinner.succeed('Seeds executados');
      
      if (this.verbose && result && result[0] && result[0].length > 0) {
        console.log(chalk.gray(`   Seeds aplicados:`));
        result[0].forEach(seed => {
          console.log(chalk.gray(`   ✓ ${seed}`));
        });
      }

      await db.destroy();

    } catch (error) {
      spinner.fail(`Falha ao executar seeds: ${error.message}`);
      throw error;
    }
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  const seedManager = new SeedManager(options);
  seedManager.run().catch(error => {
    console.error(chalk.red('\n❌ Erro fatal:'), error.message);
    process.exit(1);
  });
}

module.exports = SeedManager;
