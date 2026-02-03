/**
 * Migration 100: Intent Radar Schema
 * 
 * Cria o schema completo para o tenant Intent Radar:
 * - Tenants e Users
 * - Plans & Billing
 * - Intents (palavras-chave e tendências)
 * - Products (produtos de afiliados)
 * - Intent <-> Product Mapping
 * - Affiliate Links
 * - Google Ads (campanhas, grupos, anúncios)
 * - Creatives
 * - Jobs & Logs
 * - Audit Logs
 */

exports.up = async function(knex) {
  // Criar extensão UUID
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // =========================================================
  // TENANTS (EMPRESAS)
  // =========================================================
  await knex.schema.createTable('tenants', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 255).notNullable();
    table.string('slug', 255).unique().notNullable();
    table.uuid('plan_id');
    table.string('status', 50).defaultTo('active');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.comment('Empresas/Tenants do sistema Intent Radar');
  });

  // =========================================================
  // USERS
  // =========================================================
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.uuid('cognito_user_id').notNullable().unique();
    table.uuid('tenant_id').notNullable();
    table.string('nome', 255).notNullable();
    table.string('cpf', 14).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('telefone', 20);
    table.date('data_nascimento');
    table.string('cognito_status', 50).defaultTo('FORCE_CHANGE_PASSWORD');
    table.string('status', 20).defaultTo('ativo');
    table.timestamp('ultimo_login', { useTz: true });
    table.timestamp('criado_em', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('atualizado_em', { useTz: true }).defaultTo(knex.fn.now());

    table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.index('tenant_id');
    table.index('email');
    table.index('cognito_user_id');

    table.comment('Usuários do sistema');
  });

  // =========================================================
  // PLANS & BILLING
  // =========================================================
  await knex.schema.createTable('plans', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 100).notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.jsonb('limits').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.comment('Planos de assinatura disponíveis');
  });

  await knex.schema.createTable('subscriptions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('tenant_id').notNullable();
    table.uuid('plan_id').notNullable();
    table.string('status', 50).defaultTo('active');
    table.timestamp('started_at').defaultTo(knex.fn.now());
    table.timestamp('renew_at');

    table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.foreign('plan_id').references('id').inTable('plans');
    table.index('tenant_id');
    table.index('status');

    table.comment('Assinaturas dos tenants');
  });

  await knex.schema.createTable('usage_metrics', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('tenant_id').notNullable();
    table.string('metric', 100).notNullable();
    table.integer('count').defaultTo(0);
    table.string('period', 7).notNullable(); // YYYY-MM
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.index('tenant_id');
    table.index('period');
    table.index(['tenant_id', 'metric', 'period']);

    table.comment('Métricas de uso por tenant');
  });

  // =========================================================
  // INTENTS (GLOBAL)
  // =========================================================
  await knex.schema.createTable('intents', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('keyword', 255).notNullable();
    table.string('country', 10);
    table.string('language', 10);
    table.integer('search_volume');
    table.decimal('cpc', 10, 2);
    table.decimal('competition', 5, 2);
    table.decimal('intent_score', 5, 2);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('keyword');
    table.index(['keyword', 'country', 'language']);

    table.comment('Palavras-chave e intenções de busca');
  });

  await knex.schema.createTable('intent_trends', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('intent_id').notNullable();
    table.date('date').notNullable();
    table.decimal('trend_score', 5, 2);

    table.foreign('intent_id').references('id').inTable('intents').onDelete('CASCADE');
    table.index('intent_id');
    table.index('date');
    table.index(['intent_id', 'date']);

    table.comment('Tendências históricas de intents');
  });

  // =========================================================
  // PRODUCTS (GLOBAL)
  // =========================================================
  await knex.schema.createTable('products', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('platform', 50).notNullable();
    table.string('external_id', 255).notNullable();
    table.string('name', 255).notNullable();
    table.string('category', 255);
    table.decimal('commission_percent', 5, 2);
    table.decimal('price', 10, 2);
    table.string('currency', 10);
    table.decimal('score', 5, 2);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.unique(['platform', 'external_id']);
    table.index('platform');
    table.index('category');

    table.comment('Produtos de afiliados disponíveis');
  });

  await knex.schema.createTable('product_metrics', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('product_id').notNullable();
    table.date('metric_date').notNullable();
    table.integer('sales_rank');
    table.decimal('conversion_rate', 5, 2);
    table.decimal('popularity_score', 5, 2);

    table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.index('product_id');
    table.index('metric_date');

    table.comment('Métricas históricas de produtos');
  });

  // =========================================================
  // INTENT <-> PRODUCT MAP
  // =========================================================
  await knex.schema.createTable('intent_product_map', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('intent_id').notNullable();
    table.uuid('product_id').notNullable();
    table.decimal('relevance_score', 5, 2);

    table.foreign('intent_id').references('id').inTable('intents').onDelete('CASCADE');
    table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.unique(['intent_id', 'product_id']);
    table.index('intent_id');
    table.index('product_id');

    table.comment('Mapeamento entre intents e produtos recomendados');
  });

  // =========================================================
  // AFFILIATE (TENANT)
  // =========================================================
  await knex.schema.createTable('affiliate_accounts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('tenant_id').notNullable();
    table.string('platform', 50).notNullable();
    table.string('external_account_id', 255);
    table.string('status', 50).defaultTo('active');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.index('tenant_id');
    table.index(['tenant_id', 'platform']);

    table.comment('Contas de afiliados dos tenants');
  });

  await knex.schema.createTable('affiliate_links', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('tenant_id').notNullable();
    table.uuid('product_id').notNullable();
    table.text('affiliate_url').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.foreign('product_id').references('id').inTable('products');
    table.index('tenant_id');
    table.index('product_id');

    table.comment('Links de afiliados por tenant/produto');
  });

  await knex.schema.createTable('clicks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('click_id', 50).unique().notNullable();
    table.uuid('tenant_id').notNullable();
    table.uuid('affiliate_link_id').notNullable();
    
    // Dados de tracking
    table.string('ip_address', 45);
    table.text('user_agent');
    table.text('referer');
    
    // UTM Parameters
    table.string('utm_source', 100);
    table.string('utm_medium', 100);
    table.string('utm_campaign', 100);
    table.string('utm_term', 255);
    table.string('utm_content', 255);
    
    // Geolocalização
    table.string('country', 100);
    table.string('city', 100);
    table.string('region', 100);
    table.decimal('latitude', 10, 8);
    table.decimal('longitude', 11, 8);
    
    // Device Info
    table.string('device_type', 20);
    table.string('browser', 50);
    table.string('browser_version', 20);
    table.string('os', 50);
    table.string('os_version', 20);
    
    // Conversão
    table.boolean('converted').defaultTo(false);
    table.decimal('conversion_value', 10, 2);
    table.string('conversion_currency', 3).defaultTo('BRL');
    
    // Timestamps
    table.timestamp('clicked_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('converted_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.foreign('affiliate_link_id').references('id').inTable('affiliate_links').onDelete('CASCADE');
    table.index(['tenant_id', 'clicked_at']);
    table.index(['affiliate_link_id', 'clicked_at']);
    table.index(['tenant_id', 'converted', 'clicked_at']);
    table.index('device_type');
    table.index('country');
    table.index('click_id');

    table.comment('Rastreamento de cliques em links de afiliados');
  });

  // =========================================================
  // GOOGLE ADS
  // =========================================================
  await knex.schema.createTable('google_ads_accounts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('tenant_id').notNullable();
    table.string('customer_id', 50).notNullable();
    table.text('refresh_token').notNullable();
    table.string('status', 50).defaultTo('active');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.index('tenant_id');

    table.comment('Contas Google Ads conectadas');
  });

  await knex.schema.createTable('google_ads_campaigns', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('tenant_id').notNullable();
    table.string('google_campaign_id', 50).notNullable();
    table.string('google_account_id', 50).notNullable();
    table.string('name', 255).notNullable();
    table.string('status', 20).notNullable();
    table.decimal('budget', 10, 2).notNullable();
    table.string('budget_currency', 3).notNullable();
    table.string('target_location', 10);
    table.uuid('intent_id');
    table.uuid('product_id');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.foreign('intent_id').references('id').inTable('intents');
    table.foreign('product_id').references('id').inTable('products');
    table.unique(['tenant_id', 'google_campaign_id']);
    table.index('tenant_id');
    table.index('status');

    table.comment('Campanhas Google Ads');
  });

  await knex.schema.createTable('campaign_stats', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('campaign_id').notNullable();
    table.bigInteger('impressions').defaultTo(0);
    table.bigInteger('clicks').defaultTo(0);
    table.decimal('cost', 10, 2).defaultTo(0);
    table.bigInteger('conversions').defaultTo(0);
    table.timestamp('synced_at').notNullable().defaultTo(knex.fn.now());

    table.foreign('campaign_id').references('id').inTable('google_ads_campaigns');
    table.unique('campaign_id');
    table.index('campaign_id');

    table.comment('Estatísticas de campanhas Google Ads');
  });

  await knex.schema.createTable('ad_groups', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('campaign_id').notNullable();
    table.string('google_adgroup_id', 100);
    table.string('keyword', 255);
    table.string('match_type', 50);

    table.foreign('campaign_id').references('id').inTable('google_ads_campaigns').onDelete('CASCADE');
    table.index('campaign_id');

    table.comment('Grupos de anúncios');
  });

  await knex.schema.createTable('ads', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('ad_group_id').notNullable();
    table.string('google_ad_id', 100);
    table.string('headline_1', 255);
    table.string('headline_2', 255);
    table.text('description');
    table.text('final_url');
    table.string('status', 50);

    table.foreign('ad_group_id').references('id').inTable('ad_groups').onDelete('CASCADE');
    table.index('ad_group_id');

    table.comment('Anúncios individuais');
  });

  // =========================================================
  // CREATIVES
  // =========================================================
  await knex.schema.createTable('creatives', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('type', 50); // text, image
    table.text('content');
    table.string('hash', 255);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('hash');
    table.index('type');

    table.comment('Criativos reutilizáveis (textos, imagens)');
  });

  await knex.schema.createTable('ad_creatives', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('ad_id').notNullable();
    table.uuid('creative_id').notNullable();

    table.foreign('ad_id').references('id').inTable('ads').onDelete('CASCADE');
    table.foreign('creative_id').references('id').inTable('creatives').onDelete('CASCADE');
    table.index('ad_id');
    table.index('creative_id');

    table.comment('Vínculo entre anúncios e criativos');
  });

  // =========================================================
  // JOBS & LOGS
  // =========================================================
  await knex.schema.createTable('jobs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('tenant_id').notNullable();
    
    // Tipo e status
    table.string('type', 50).notNullable();
    table.string('status', 20).notNullable().defaultTo('pending');
    table.string('priority', 10).defaultTo('normal');
    
    // Descrição
    table.text('description').notNullable();
    
    // Entidade relacionada
    table.string('entity_type', 50);
    table.uuid('entity_id');
    
    // Progresso
    table.integer('progress').defaultTo(0);
    table.integer('total_items');
    table.integer('processed_items').defaultTo(0);
    
    // Erros
    table.text('error_message');
    table.jsonb('error_details');
    
    // Metadados
    table.jsonb('metadata');
    
    // Timestamps
    table.timestamp('started_at');
    table.timestamp('completed_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.index(['tenant_id', 'created_at']);
    table.index(['status', 'priority']);
    table.index(['type', 'status']);
    table.index(['entity_type', 'entity_id']);

    table.comment('Jobs assíncronos e processamentos');
  });

  await knex.schema.createTable('job_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('job_id').notNullable();
    table.string('level', 20);
    table.text('message');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.foreign('job_id').references('id').inTable('jobs').onDelete('CASCADE');
    table.index('job_id');

    table.comment('Logs detalhados de jobs');
  });

  // =========================================================
  // AUDIT LOG
  // =========================================================
  await knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('tenant_id');
    table.uuid('user_id');
    table.string('action', 255);
    table.string('entity', 255);
    table.uuid('entity_id');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('tenant_id');
    table.index('user_id');
    table.index('entity');
    table.index('created_at');

    table.comment('Auditoria de ações no sistema');
  });

  // =========================================================
  // TRIGGERS para updated_at
  // =========================================================
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await knex.raw(`
    CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);

  await knex.raw(`
    CREATE TRIGGER update_users_atualizado_em
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
  
  await knex.raw(`
    DROP TRIGGER update_users_atualizado_em ON users;
    CREATE OR REPLACE FUNCTION update_atualizado_em_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.atualizado_em = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    CREATE TRIGGER update_users_atualizado_em
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_atualizado_em_column();
  `);

  await knex.raw(`
    CREATE TRIGGER update_intents_updated_at
    BEFORE UPDATE ON intents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
};

exports.down = async function(knex) {
  // Drop em ordem reversa (respeitando dependências)
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('job_logs');
  await knex.schema.dropTableIfExists('jobs');
  await knex.schema.dropTableIfExists('ad_creatives');
  await knex.schema.dropTableIfExists('creatives');
  await knex.schema.dropTableIfExists('ads');
  await knex.schema.dropTableIfExists('ad_groups');
  await knex.schema.dropTableIfExists('campaign_stats');
  await knex.schema.dropTableIfExists('google_ads_campaigns');
  await knex.schema.dropTableIfExists('google_ads_accounts');
  await knex.schema.dropTableIfExists('clicks');
  await knex.schema.dropTableIfExists('affiliate_links');
  await knex.schema.dropTableIfExists('affiliate_accounts');
  await knex.schema.dropTableIfExists('intent_product_map');
  await knex.schema.dropTableIfExists('product_metrics');
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('intent_trends');
  await knex.schema.dropTableIfExists('intents');
  await knex.schema.dropTableIfExists('usage_metrics');
  await knex.schema.dropTableIfExists('subscriptions');
  await knex.schema.dropTableIfExists('plans');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('tenants');

  // Drop triggers e funções
  await knex.raw('DROP TRIGGER IF EXISTS update_intents_updated_at ON intents');
  await knex.raw('DROP TRIGGER IF EXISTS update_users_atualizado_em ON users');
  await knex.raw('DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants');
  await knex.raw('DROP FUNCTION IF EXISTS update_atualizado_em_column()');
  await knex.raw('DROP FUNCTION IF EXISTS update_updated_at_column()');
};
