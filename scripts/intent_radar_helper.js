#!/usr/bin/env node

/**
 * Intent Radar - Migration Helper
 * 
 * Script auxiliar para operações comuns de migration do Intent Radar
 */

const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const knex = require('knex');
const path = require('path');
require('dotenv').config();

const knexConfig = require('../knexfile');

const program = new Command();

program
  .version('1.0.0')
  .description('Intent Radar Migration Helper');

// =========================================================
// Comando: Status
// =========================================================
program
  .command('status')
  .description('Verifica o status das migrations do Intent Radar')
  .action(async () => {
    console.log(chalk.cyan('\n📊 Status das Migrations - Intent Radar\n'));
    
    try {
      const env = process.env.NODE_ENV || 'development';
      const config = knexConfig[env];
      
      if (!config) {
        throw new Error(`Configuração '${env}' não encontrada. Verifique o knexfile.js`);
      }
      
      const db = knex(config);

      const spinner = ora('Conectando ao banco...').start();
      await db.raw('SELECT 1');
      spinner.succeed('Conectado');

      // Verificar migrations executadas
      spinner.start('Verificando migrations...');
      const migrations = await db('knex_migrations')
        .select('*')
        .orderBy('id', 'asc');
      spinner.succeed(`${migrations.length} migrations executadas`);

      // Verificar se a migration 001 existe
      const migration001 = migrations.find(m => m.name.includes('001_create_intent_radar_schema'));
      
      if (migration001) {
        console.log(chalk.green('\n✅ Schema Intent Radar: INSTALADO'));
        console.log(chalk.gray(`   Data: ${migration001.migration_time}`));
        console.log(chalk.gray(`   Batch: ${migration001.batch}`));
      } else {
        console.log(chalk.yellow('\n⚠️  Schema Intent Radar: NÃO INSTALADO'));
        console.log(chalk.gray('   Execute: npm run setup ou npm run ir:install'));
      }

      // Verificar tabelas
      spinner.start('Verificando tabelas...');
      const tables = await db.raw(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
      `);
      spinner.succeed(`${tables.rows.length} tabelas encontradas`);

      // Tabelas esperadas do Intent Radar
      const expectedTables = [
        'tenants', 'users', 'plans', 'subscriptions', 'usage_metrics',
        'intents', 'intent_trends', 'products', 'product_metrics',
        'intent_product_map', 'affiliate_accounts', 'affiliate_links',
        'google_ads_accounts', 'ad_campaigns', 'ad_groups', 'ads',
        'creatives', 'ad_creatives', 'jobs', 'job_logs', 'audit_logs'
      ];

      const missingTables = expectedTables.filter(
        table => !tables.rows.some(row => row.tablename === table)
      );

      if (missingTables.length === 0) {
        console.log(chalk.green('\n✅ Todas as tabelas do Intent Radar estão presentes'));
      } else {
        console.log(chalk.yellow(`\n⚠️  Tabelas faltando (${missingTables.length}):`));
        missingTables.forEach(table => console.log(chalk.gray(`   - ${table}`)));
      }

      // Verificar dados
      if (migration001) {
        spinner.start('Verificando dados...');
        const tenantCount = await db('tenants').count('* as count').first();
        const userCount = await db('users').count('* as count').first();
        const intentCount = await db('intents').count('* as count').first();
        const productCount = await db('products').count('* as count').first();
        spinner.succeed('Dados verificados');

        console.log(chalk.cyan('\n📈 Estatísticas:'));
        console.log(chalk.gray(`   Tenants: ${tenantCount.count}`));
        console.log(chalk.gray(`   Usuários: ${userCount.count}`));
        console.log(chalk.gray(`   Intents: ${intentCount.count}`));
        console.log(chalk.gray(`   Produtos: ${productCount.count}`));
      }

      console.log('');
      await db.destroy();

    } catch (error) {
      console.error(chalk.red('\n❌ Erro:', error.message));
      process.exit(1);
    }
  });

// =========================================================
// Comando: Install
// =========================================================
program
  .command('install')
  .description('Instala o schema Intent Radar (migration + seed)')
  .option('--skip-seed', 'Pular seed de dados iniciais')
  .action(async (options) => {
    console.log(chalk.cyan('\n🚀 Instalando Intent Radar Schema\n'));
    
    try {
      const env = process.env.NODE_ENV || 'development';
      const config = knexConfig[env];
      
      if (!config) {
        throw new Error(`Configuração '${env}' não encontrada. Verifique o knexfile.js`);
      }
      
      const db = knex(config);

      // 1. Conectar
      const spinner = ora('Conectando ao banco...').start();
      await db.raw('SELECT 1');
      spinner.succeed('Conectado');

      // 2. Verificar se já existe
      const existing = await db('knex_migrations')
        .where('name', 'like', '%001_create_intent_radar_schema%')
        .first();

      if (existing) {
        spinner.fail('Schema já instalado!');
        console.log(chalk.yellow('\n⚠️  Use "npm run migrate:rollback" para desinstalar primeiro\n'));
        await db.destroy();
        process.exit(1);
      }

      // 3. Executar migration
      spinner.start('Executando migration 001...');
      await db.migrate.up({
        directory: path.join(__dirname, '../migrations'),
        name: '001_create_intent_radar_schema.js'
      });
      spinner.succeed('Migration executada');

      // 4. Executar seed
      if (!options.skipSeed) {
        spinner.start('Inserindo dados iniciais...');
        await db.seed.run({
          directory: path.join(__dirname, '../seeds'),
          specific: '001_intent_radar_initial_data.js'
        });
        spinner.succeed('Dados inseridos');
      }

      console.log(chalk.green('\n✅ Intent Radar instalado com sucesso!\n'));
      
      await db.destroy();

    } catch (error) {
      console.error(chalk.red('\n❌ Erro:', error.message));
      console.error(chalk.gray(error.stack));
      process.exit(1);
    }
  });

// =========================================================
// Comando: Uninstall
// =========================================================
program
  .command('uninstall')
  .description('Remove o schema Intent Radar (CUIDADO: apaga dados!)')
  .option('--force', 'Força a remoção sem confirmação')
  .action(async (options) => {
    console.log(chalk.red('\n⚠️  ATENÇÃO: Esta operação irá APAGAR todos os dados!\n'));
    
    if (!options.force) {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise(resolve => {
        readline.question(chalk.yellow('Digite "CONFIRMAR" para continuar: '), resolve);
      });
      readline.close();

      if (answer !== 'CONFIRMAR') {
        console.log(chalk.yellow('\n⚠️  Operação cancelada\n'));
        process.exit(0);
      }
    }

    try {
      const env = process.env.NODE_ENV || 'development';
      const config = knexConfig[env];
      
      if (!config) {
        throw new Error(`Configuração '${env}' não encontrada. Verifique o knexfile.js`);
      }
      
      const db = knex(config);

      const spinner = ora('Conectando ao banco...').start();
      await db.raw('SELECT 1');
      spinner.succeed('Conectado');

      spinner.start('Removendo schema Intent Radar...');
      await db.migrate.down({
        directory: path.join(__dirname, '../migrations'),
        name: '001_create_intent_radar_schema.js'
      });
      spinner.succeed('Schema removido');

      console.log(chalk.green('\n✅ Intent Radar desinstalado\n'));
      
      await db.destroy();

    } catch (error) {
      console.error(chalk.red('\n❌ Erro:', error.message));
      process.exit(1);
    }
  });

// =========================================================
// Comando: Reset
// =========================================================
program
  .command('reset')
  .description('Remove e reinstala o schema (limpa dados)')
  .action(async () => {
    console.log(chalk.cyan('\n🔄 Reset do Intent Radar\n'));
    
    try {
      const env = process.env.NODE_ENV || 'development';
      const config = knexConfig[env];
      
      if (!config) {
        throw new Error(`Configuração '${env}' não encontrada. Verifique o knexfile.js`);
      }
      
      const db = knex(config);

      const spinner = ora('Conectando...').start();
      await db.raw('SELECT 1');
      spinner.succeed('Conectado');

      // 1. Rollback
      spinner.start('Removendo schema atual...');
      await db.migrate.down({
        directory: path.join(__dirname, '../migrations'),
        name: '001_create_intent_radar_schema.js'
      });
      spinner.succeed('Schema removido');

      // 2. Reinstalar
      spinner.start('Reinstalando schema...');
      await db.migrate.up({
        directory: path.join(__dirname, '../migrations'),
        name: '001_create_intent_radar_schema.js'
      });
      spinner.succeed('Schema reinstalado');

      // 3. Seed
      spinner.start('Inserindo dados iniciais...');
      await db.seed.run({
        directory: path.join(__dirname, '../seeds'),
        specific: '001_intent_radar_initial_data.js'
      });
      spinner.succeed('Dados inseridos');

      console.log(chalk.green('\n✅ Reset concluído!\n'));
      
      await db.destroy();

    } catch (error) {
      console.error(chalk.red('\n❌ Erro:', error.message));
      process.exit(1);
    }
  });

program.parse(process.argv);

// Se nenhum comando, mostrar help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
