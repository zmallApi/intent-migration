#!/usr/bin/env node

/**
 * Script de Setup do Tenant Intent Radar
 * 
 * Este script configura o banco de dados para o tenant intent-radar:
 * 1. Executa a migration 100 (schema Intent Radar)
 * 2. Popula com dados iniciais via seed
 * 3. Valida a instalação
 */

const chalk = require('chalk');
const ora = require('ora');
const knex = require('knex');
const path = require('path');
require('dotenv').config();

const knexConfig = require('../knexfile');

class IntentRadarSetup {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    this.config = knexConfig[this.env];
    
    if (!this.config) {
      throw new Error(`Configuração '${this.env}' não encontrada no knexfile.js`);
    }
  }

  async run() {
    console.log(chalk.cyan('\n🎯 Intent Radar - Setup do Tenant\n'));

    try {
      // 1. Conectar ao banco
      const spinner = ora('Conectando ao banco de dados...').start();
      const db = knex(this.config);

      await db.raw('SELECT 1');
      spinner.succeed('Conectado ao banco de dados');

      console.log(chalk.gray(`   Host: ${this.config.connection.host}`));
      console.log(chalk.gray(`   Database: ${this.config.connection.database}\n`));

      // 2. Verificar se a migration 001 já foi executada
      spinner.start('Verificando migrations...');
      const migrations = await db('knex_migrations')
        .where('name', 'like', '%001_create_intent_radar_schema%')
        .select('*');

      if (migrations.length > 0) {
        spinner.warn('Migration 001 já foi executada anteriormente');
        
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });

        const answer = await new Promise(resolve => {
          readline.question(chalk.yellow('Deseja continuar mesmo assim? (s/N): '), resolve);
        });
        readline.close();

        if (answer.toLowerCase() !== 's') {
          console.log(chalk.yellow('\n⚠️  Setup cancelado pelo usuário\n'));
          await db.destroy();
          process.exit(0);
        }
      } else {
        spinner.succeed('Migrations verificadas');
      }

      // 3. Executar migration 100
      spinner.start('Executando migration 001 (Intent Radar Schema)...');
      await db.migrate.up({
        directory: path.join(__dirname, '../migrations'),
        name: '001_create_intent_radar_schema.js'
      });
      spinner.succeed('Migration 001 executada com sucesso');

      // 4. Executar seed
      spinner.start('Populando banco com dados iniciais...');
      await db.seed.run({
        directory: path.join(__dirname, '../seeds'),
        specific: '001_intent_radar_initial_data.js'
      });
      spinner.succeed('Dados iniciais inseridos');

      // 5. Validar instalação
      spinner.start('Validando instalação...');
      
      const tenantCount = await db('tenants').count('* as count').first();
      const userCount = await db('users').count('* as count').first();
      const intentCount = await db('intents').count('* as count').first();
      const productCount = await db('products').count('* as count').first();

      spinner.succeed('Instalação validada');

      // 6. Exibir resumo
      console.log(chalk.green('\n✅ Setup concluído com sucesso!\n'));
      console.log(chalk.cyan('📊 Resumo da Instalação:'));
      console.log(chalk.gray(`   Banco: ${this.config.connection.database}`));
      console.log(chalk.gray(`   Tenants: ${tenantCount.count}`));
      console.log(chalk.gray(`   Usuários: ${userCount.count}`));
      console.log(chalk.gray(`   Intents: ${intentCount.count}`));
      console.log(chalk.gray(`   Produtos: ${productCount.count}\n`));

      console.log(chalk.cyan('🔐 Credenciais de Acesso:'));
      console.log(chalk.white('   Admin:'));
      console.log(chalk.gray(`     Email: admin@intentradar.com`));
      console.log(chalk.gray(`     Senha: Admin@2026\n`));
      console.log(chalk.white('   Developer:'));
      console.log(chalk.gray(`     Email: dev@intentradar.com`));
      console.log(chalk.gray(`     Senha: Dev@2026\n`));

      console.log(chalk.cyan('📚 Próximos Passos:'));
      console.log(chalk.gray('   1. Configure as contas do Google Ads'));
      console.log(chalk.gray('   2. Configure as contas de afiliados'));
      console.log(chalk.gray('   3. Importe suas palavras-chave (intents)'));
      console.log(chalk.gray('   4. Conecte produtos relevantes\n'));

      await db.destroy();

    } catch (error) {
      console.error(chalk.red('\n❌ Erro durante o setup:\n'));
      console.error(chalk.red(error.message));
      console.error(chalk.gray('\n' + error.stack + '\n'));
      process.exit(1);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const setup = new IntentRadarSetup();
  setup.run().catch(error => {
    console.error(chalk.red('\n❌ Erro fatal:'), error.message);
    process.exit(1);
  });
}

module.exports = IntentRadarSetup;
