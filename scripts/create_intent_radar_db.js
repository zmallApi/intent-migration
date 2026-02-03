#!/usr/bin/env node

/**
 * Script para criar o banco de dados do Intent Radar
 * 
 * Este script cria um banco de dados SEPARADO para o Intent Radar,
 * isolado do banco do ProFitness.
 */

const { Client } = require('pg');
const chalk = require('chalk');
const ora = require('ora');
require('dotenv').config();

async function createDatabase() {
  console.log(chalk.cyan('\n🎯 Criando Banco de Dados - Intent Radar\n'));

  const dbName = process.env.IR_DB_NAME || 'intent_radar_dev';
  const host = process.env.IR_DB_HOST || 'localhost';
  const port = process.env.IR_DB_PORT || 5432;
  const user = process.env.IR_DB_USER || 'profftness';
  const password = process.env.IR_DB_PASSWORD || 'profftness@2024';

  // Conectar ao banco postgres (default) para criar o novo banco
  const client = new Client({
    host,
    port,
    user,
    password,
    database: 'postgres'
  });

  try {
    const spinner = ora('Conectando ao PostgreSQL...').start();
    await client.connect();
    spinner.succeed('Conectado ao PostgreSQL');

    console.log(chalk.gray(`   Host: ${host}`));
    console.log(chalk.gray(`   Port: ${port}`));
    console.log(chalk.gray(`   User: ${user}\n`));

    // Verificar se o banco já existe
    spinner.start('Verificando se o banco já existe...');
    const checkResult = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (checkResult.rows.length > 0) {
      spinner.warn(`Banco '${dbName}' já existe`);
      console.log(chalk.yellow('\n⚠️  O banco de dados já existe. Nada a fazer.\n'));
      await client.end();
      return;
    }
    spinner.succeed('Banco não existe, criando...');

    // Criar o banco de dados
    spinner.start(`Criando banco '${dbName}'...`);
    await client.query(`CREATE DATABASE ${dbName} ENCODING 'UTF8'`);
    spinner.succeed(`Banco '${dbName}' criado com sucesso`);

    console.log(chalk.green('\n✅ Banco de dados criado!\n'));
    console.log(chalk.cyan('📋 Próximos passos:'));
    console.log(chalk.gray('   1. Execute: npm run ir:install'));
    console.log(chalk.gray('   2. Ou execute: npm run setup:intent-radar\n'));

    console.log(chalk.cyan('📊 Informações do Banco:'));
    console.log(chalk.gray(`   Nome: ${dbName}`));
    console.log(chalk.gray(`   Host: ${host}`));
    console.log(chalk.gray(`   Porta: ${port}`));
    console.log(chalk.gray(`   Usuário: ${user}\n`));

    await client.end();

  } catch (error) {
    console.error(chalk.red('\n❌ Erro ao criar banco de dados:\n'));
    console.error(chalk.red(error.message));
    
    if (error.code === 'ECONNREFUSED') {
      console.log(chalk.yellow('\n⚠️  Dicas:'));
      console.log(chalk.gray('   - PostgreSQL está rodando?'));
      console.log(chalk.gray('   - Host e porta estão corretos no .env?'));
    } else if (error.code === '28P01') {
      console.log(chalk.yellow('\n⚠️  Dicas:'));
      console.log(chalk.gray('   - Verifique o usuário e senha no .env'));
    }
    
    console.log('');
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createDatabase().catch(error => {
    console.error(chalk.red('\n❌ Erro fatal:'), error.message);
    process.exit(1);
  });
}

module.exports = createDatabase;
