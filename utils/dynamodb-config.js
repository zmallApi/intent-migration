require('dotenv').config();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

/**
 * Cliente DynamoDB para buscar configurações de tenant
 */
class DynamoDBConfig {
  constructor() {
    this.client = null;
    this.docClient = null;
    this.tableName = process.env.DYNAMODB_TENANTS_TABLE || 'proffitness-tenants';
    this.region = process.env.AWS_REGION || 'us-east-1';
  }

  /**
   * Inicializa o cliente DynamoDB
   */
  initializeClient() {
    if (!this.client) {
      const config = {
        region: this.region,
      };

      // Se estiver rodando localmente, usa credenciais do .env
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        config.credentials = {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        };
      }

      this.client = new DynamoDBClient(config);
      this.docClient = DynamoDBDocumentClient.from(this.client);
    }
  }

  /**
   * Busca configurações do tenant no DynamoDB
   * @param {string} tenantKey - Chave do tenant (empresa)
   * @returns {Promise<Object>} - Configurações do tenant
   */
  async getTenantConfig(tenantKey) {
    if (!tenantKey) {
      throw new Error('Tenant key is required');
    }

    this.initializeClient();

    try {
      console.log(`🔍 Buscando configurações do tenant: ${tenantKey} no DynamoDB...`);

      const command = new GetCommand({
        TableName: this.tableName,
        Key: {
          tenant_key: tenantKey,
        },
      });

      const response = await this.docClient.send(command);

      if (!response.Item) {
        throw new Error(`Tenant '${tenantKey}' não encontrado no DynamoDB`);
      }

      const config = response.Item;

      // Valida se possui as configurações necessárias do banco de dados
      // A estrutura pode ser: config.database.host OU config.host_postgresql
      const hasNestedStructure = config.database && config.database.host && config.database.name;
      const hasFlatStructure = config.host_postgresql && config.database_app;
      
      if (!hasNestedStructure && !hasFlatStructure) {
        throw new Error(`Configurações de banco de dados inválidas para tenant '${tenantKey}'`);
      }

      console.log(`✅ Configurações do tenant '${tenantKey}' carregadas com sucesso`);

      // Mapear estrutura flat (proffitness_tenant_connections) para nested
      if (hasFlatStructure) {
        return {
          tenantKey: config.tenant_key || tenantKey,
          name: config.nome_fantasia || config.razao_social || tenantKey,
          database: {
            host: config.host_postgresql,
            port: parseInt(config.porta_postgresql) || 5432,
            user: config.usuario_app,
            password: config.senha_app,
            name: config.database_app,
            ssl: false, // Ajustar conforme necessário
          },
          features: config.features || {},
          limits: config.limits || {},
          status: config.status === 'ativo' ? 'active' : config.status || 'active',
        };
      }

      // Estrutura nested (formato original)
      return {
        tenantKey: config.tenantKey || config.tenant_key,
        name: config.name || tenantKey,
        database: {
          host: config.database.host,
          port: config.database.port || 5432,
          user: config.database.user,
          password: config.database.password,
          name: config.database.name,
          ssl: config.database.ssl !== false, // default true
        },
        features: config.features || {},
        limits: config.limits || {},
        status: config.status || 'active',
      };

    } catch (error) {
      console.error(`❌ Erro ao buscar configurações do tenant '${tenantKey}':`, error.message);
      throw error;
    }
  }

  /**
   * Valida se o tenant está ativo
   * @param {Object} tenantConfig - Configurações do tenant
   * @returns {boolean}
   */
  validateTenantStatus(tenantConfig) {
    if (!tenantConfig || tenantConfig.status !== 'active') {
      throw new Error(`Tenant '${tenantConfig?.tenantKey}' não está ativo`);
    }
    return true;
  }

  /**
   * Obtém configuração de conexão formatada para Knex
   * @param {string} tenantKey - Chave do tenant
   * @param {string} environment - Ambiente (development, staging, production)
   * @param {boolean} useMigrationUser - Se true, usa credenciais de migration (superuser)
   * @returns {Promise<Object>} - Configuração Knex
   */
  async getKnexConfig(tenantKey, environment = 'development', useMigrationUser = false) {
    const tenantConfig = await this.getTenantConfig(tenantKey);
    this.validateTenantStatus(tenantConfig);

    const { database } = tenantConfig;

    // Se useMigrationUser=true e variáveis existem, sobrescreve credenciais
    const user = useMigrationUser && process.env.MIGRATION_DB_USER 
      ? process.env.MIGRATION_DB_USER 
      : database.user;
    
    const password = useMigrationUser && process.env.MIGRATION_DB_PASSWORD 
      ? process.env.MIGRATION_DB_PASSWORD 
      : database.password;

    // Debug: Log das credenciais sendo usadas (remover em produção)
    if (useMigrationUser) {
      console.log(`🔑 Usando credenciais de migration: user=${user}, password=${password ? '***' + password.slice(-3) : 'undefined'}`);
    }

    return {
      client: 'postgresql',
      connection: {
        host: database.host,
        port: database.port,
        user: user,
        password: password,
        database: database.name,
        ssl: database.ssl ? { rejectUnauthorized: false } : false,
      },
      pool: {
        min: environment === 'production' ? 5 : 2,
        max: environment === 'production' ? 20 : 10,
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
      },
      migrations: {
        directory: './migrations',
        tableName: 'knex_migrations',
      },
      seeds: {
        directory: './seeds',
      },
      debug: environment === 'development',
    };
  }
}

// Singleton instance
const dynamoDBConfig = new DynamoDBConfig();

module.exports = dynamoDBConfig;
