#!/usr/bin/env node

const { Command } = require('commander');
const knex = require('knex');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
require('dotenv').config();

const { getDynamicConfig } = require('./knexfile');
const localConfig = require('./knexfile');

const program = new Command();

program
  .version('1.0.0')
  .description('ProFitness Database Rollback Tool')
  .option('-e, --env <environment>', 'Environment (development, staging, production)', 'development')
  .option('-t, --tenant <tenant>', 'Tenant key (obrigatório para modo DynamoDB)')
  .option('-a, --all', 'Rollback all migrations')
  .option('--local', 'Force local mode (ignore DynamoDB)')
  .option('-v, --verbose', 'Verbose output')
  .option('-y, --yes', 'Skip confirmation')
  .parse();

const options = program.opts();

const logger = {
  info: (message) => console.log(chalk.blue('ℹ️'), message),
  error: (message) => console.error(chalk.red('❌'), message),
  success: (message) => console.log(chalk.green('✅'), message),
  warning: (message) => console.log(chalk.yellow('⚠️'), message)
};

class RollbackManager {
  constructor(options) {
    this.options = options;
    this.env = options.env;
    this.tenantKey = options.tenant;
    this.rollbackAll = options.all;
    this.useLocal = options.local;
    this.verbose = options.verbose;
    this.skipConfirmation = options.yes;
    this.useDynamoDB = !this.useLocal && !!this.tenantKey;
  }

  async run() {
    try {
      console.log(chalk.cyan('\n🔄 ProFitness Rollback System\n'));
      
      logger.warning('ATENÇÃO: Rollback irá reverter alterações no banco de dados!');
      
      if (!this.skipConfirmation) {
        const { confirmed } = await inquirer.prompt([{
          type: 'confirm',
          name: 'confirmed',
          message: `Confirma rollback ${this.rollbackAll ? 'COMPLETO' : 'da última migration'}?`,
          default: false
        }]);

        if (!confirmed) {
          logger.info('Rollback cancelado pelo usuário');
          process.exit(0);
        }
      }

      if (!this.useLocal && !this.tenantKey) {
        throw new Error('TENANT_KEY é obrigatório. Use --tenant=<chave> ou --local');
      }

      const dbConfig = await this.getDatabaseConfig();
      await this.rollbackDatabase(dbConfig);

      console.log(chalk.green('\n✅ Rollback executado com sucesso!\n'));

    } catch (error) {
      logger.error(`Falha no rollback: ${error.message}`);
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

  async rollbackDatabase(dbConfig) {
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

      // Executa rollback
      const action = this.rollbackAll ? 'rollback completo' : 'rollback da última batch';
      spinner.start(`Executando ${action}...`);
      
      const result = this.rollbackAll 
        ? await db.migrate.rollback(undefined, true) // rollback all
        : await db.migrate.rollback(); // rollback last batch
      
      spinner.succeed(`Rollback executado`);
      
      if (this.verbose && result && result[1] && result[1].length > 0) {
        console.log(chalk.gray(`   Migrations revertidas:`));
        result[1].forEach(migration => {
          console.log(chalk.gray(`   ✓ ${migration}`));
        });
      }

      await db.destroy();

    } catch (error) {
      spinner.fail(`Falha no rollback: ${error.message}`);
      throw error;
    }
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  const rollbackManager = new RollbackManager(options);
  rollbackManager.run().catch(error => {
    console.error(chalk.red('\n❌ Erro fatal:'), error.message);
    process.exit(1);
  });
}

module.exports = RollbackManager;
