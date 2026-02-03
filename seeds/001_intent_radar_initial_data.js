/**
 * Seed: Intent Radar - Dados Iniciais
 * 
 * Popula o banco com dados básicos para o tenant intent-radar:
 * - Planos de assinatura
 * - Tenant intent-radar
 * - Usuário admin
 * - Dados de exemplo para desenvolvimento
 */

exports.seed = async function(knex) {
  // Limpar tabelas (ordem reversa para respeitar FKs)
  await knex('audit_logs').del();
  await knex('job_logs').del();
  await knex('jobs').del();
  await knex('ad_creatives').del();
  await knex('creatives').del();
  await knex('ads').del();
  await knex('ad_groups').del();
  await knex('campaign_stats').del();
  await knex('google_ads_campaigns').del();
  await knex('google_ads_accounts').del();
  await knex('clicks').del();
  await knex('affiliate_links').del();
  await knex('affiliate_accounts').del();
  await knex('intent_product_map').del();
  await knex('product_metrics').del();
  await knex('products').del();
  await knex('intent_trends').del();
  await knex('intents').del();
  await knex('usage_metrics').del();
  await knex('subscriptions').del();
  await knex('users').del();
  await knex('tenants').del();
  await knex('plans').del();

  // =========================================================
  // PLANS
  // =========================================================
  const planIds = {
    starter: '00000000-0000-0000-0000-000000000001',
    professional: '00000000-0000-0000-0000-000000000002',
    enterprise: '00000000-0000-0000-0000-000000000003'
  };

  await knex('plans').insert([
    {
      id: planIds.starter,
      name: 'Starter',
      price: 99.00,
      limits: JSON.stringify({
        max_campaigns: 10,
        max_intents: 100,
        max_products: 50,
        api_calls_per_month: 10000
      })
    },
    {
      id: planIds.professional,
      name: 'Professional',
      price: 299.00,
      limits: JSON.stringify({
        max_campaigns: 50,
        max_intents: 1000,
        max_products: 500,
        api_calls_per_month: 100000
      })
    },
    {
      id: planIds.enterprise,
      name: 'Enterprise',
      price: 999.00,
      limits: JSON.stringify({
        max_campaigns: -1, // unlimited
        max_intents: -1,
        max_products: -1,
        api_calls_per_month: -1
      })
    }
  ]);

  // =========================================================
  // TENANT: Intent Radar
  // =========================================================
  const tenantId = '10000000-0000-0000-0000-000000000001';
  
  await knex('tenants').insert({
    id: tenantId,
    name: 'Intent Radar',
    slug: 'intent-radar',
    plan_id: planIds.professional,
    status: 'active'
  });

  // =========================================================
  // SUBSCRIPTION
  // =========================================================
  await knex('subscriptions').insert({
    tenant_id: tenantId,
    plan_id: planIds.professional,
    status: 'active',
    started_at: knex.fn.now(),
    renew_at: knex.raw("NOW() + INTERVAL '30 days'")
  });

  // =========================================================
  // USERS
  // =========================================================
  const cognitoUserId1 = '20000000-0000-0000-0000-000000000001';
  const cognitoUserId2 = '20000000-0000-0000-0000-000000000002';

  await knex('users').insert([
    {
      cognito_user_id: cognitoUserId1,
      tenant_id: tenantId,
      nome: 'Admin Intent Radar',
      cpf: '12345678901',
      email: 'admin@intentradar.com',
      telefone: '11999999999',
      cognito_status: 'CONFIRMED',
      status: 'ativo'
    },
    {
      cognito_user_id: cognitoUserId2,
      tenant_id: tenantId,
      nome: 'Dev Intent Radar',
      cpf: '98765432109',
      email: 'dev@intentradar.com',
      telefone: '11888888888',
      cognito_status: 'CONFIRMED',
      status: 'ativo'
    }
  ]);

  // =========================================================
  // INTENTS (Exemplos)
  // =========================================================
  const intents = await knex('intents').insert([
    {
      keyword: 'best running shoes',
      country: 'US',
      language: 'en',
      search_volume: 50000,
      cpc: 2.50,
      competition: 0.85,
      intent_score: 0.92
    },
    {
      keyword: 'wireless headphones',
      country: 'US',
      language: 'en',
      search_volume: 75000,
      cpc: 1.80,
      competition: 0.75,
      intent_score: 0.88
    },
    {
      keyword: 'yoga mat for beginners',
      country: 'US',
      language: 'en',
      search_volume: 30000,
      cpc: 1.20,
      competition: 0.60,
      intent_score: 0.85
    },
    {
      keyword: 'laptop for programming',
      country: 'US',
      language: 'en',
      search_volume: 45000,
      cpc: 3.50,
      competition: 0.90,
      intent_score: 0.95
    },
    {
      keyword: 'organic coffee beans',
      country: 'US',
      language: 'en',
      search_volume: 25000,
      cpc: 2.00,
      competition: 0.70,
      intent_score: 0.80
    }
  ]).returning('id');
  
  const intentIds = intents.map(row => row.id || row);

  // =========================================================
  // PRODUCTS (Exemplos)
  // =========================================================
  const products = await knex('products').insert([
    {
      platform: 'amazon',
      external_id: 'B08EXAMPLE1',
      name: 'Nike Air Zoom Pegasus 38',
      category: 'Sports & Outdoors',
      commission_percent: 4.00,
      price: 119.99,
      currency: 'USD',
      score: 4.7
    },
    {
      platform: 'amazon',
      external_id: 'B08EXAMPLE2',
      name: 'Sony WH-1000XM4 Wireless Headphones',
      category: 'Electronics',
      commission_percent: 3.00,
      price: 349.99,
      currency: 'USD',
      score: 4.8
    },
    {
      platform: 'amazon',
      external_id: 'B08EXAMPLE3',
      name: 'Manduka Pro Yoga Mat',
      category: 'Sports & Outdoors',
      commission_percent: 4.50,
      price: 89.99,
      currency: 'USD',
      score: 4.6
    },
    {
      platform: 'amazon',
      external_id: 'B08EXAMPLE4',
      name: 'Dell XPS 15 Developer Edition',
      category: 'Computers',
      commission_percent: 2.50,
      price: 1499.99,
      currency: 'USD',
      score: 4.5
    },
    {
      platform: 'amazon',
      external_id: 'B08EXAMPLE5',
      name: 'Lavazza Super Crema Whole Bean Coffee',
      category: 'Grocery',
      commission_percent: 8.00,
      price: 24.99,
      currency: 'USD',
      score: 4.7
    }
  ]).returning('id');
  
  const productIds = products.map(row => row.id || row);

  // =========================================================
  // INTENT <-> PRODUCT MAPPING
  // =========================================================
  await knex('intent_product_map').insert([
    { intent_id: intentIds[0], product_id: productIds[0], relevance_score: 0.95 },
    { intent_id: intentIds[1], product_id: productIds[1], relevance_score: 0.98 },
    { intent_id: intentIds[2], product_id: productIds[2], relevance_score: 0.92 },
    { intent_id: intentIds[3], product_id: productIds[3], relevance_score: 0.90 },
    { intent_id: intentIds[4], product_id: productIds[4], relevance_score: 0.88 }
  ]);

  // =========================================================
  // AFFILIATE ACCOUNTS
  // =========================================================
  const affiliateAccounts = await knex('affiliate_accounts').insert([
    {
      tenant_id: tenantId,
      platform: 'amazon',
      external_account_id: 'intentradar-20',
      status: 'active'
    },
    {
      tenant_id: tenantId,
      platform: 'hotmart',
      external_account_id: 'IR12345',
      status: 'active'
    }
  ]).returning('id');

  // =========================================================
  // AFFILIATE LINKS
  // =========================================================
  const affiliateLinksResult = await knex('affiliate_links').insert([
    {
      tenant_id: tenantId,
      product_id: productIds[0],
      affiliate_url: 'https://amzn.to/running-shoes-ir'
    },
    {
      tenant_id: tenantId,
      product_id: productIds[1],
      affiliate_url: 'https://amzn.to/wireless-headphones-ir'
    },
    {
      tenant_id: tenantId,
      product_id: productIds[2],
      affiliate_url: 'https://amzn.to/yoga-mat-ir'
    }
  ]).returning('id');
  
  const affiliateLinks = affiliateLinksResult.map(row => row.id || row);

  // =========================================================
  // CLICKS (Dados de exemplo)
  // =========================================================
  await knex('clicks').insert([
    {
      click_id: 'CLK-2026-000001',
      tenant_id: tenantId,
      affiliate_link_id: affiliateLinks[0],
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      referer: 'https://www.google.com',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'running-shoes-2026',
      country: 'United States',
      city: 'New York',
      device_type: 'desktop',
      browser: 'Chrome',
      os: 'Windows',
      converted: true,
      conversion_value: 119.99,
      clicked_at: knex.raw("NOW() - INTERVAL '2 days'"),
      converted_at: knex.raw("NOW() - INTERVAL '1 day'")
    },
    {
      click_id: 'CLK-2026-000002',
      tenant_id: tenantId,
      affiliate_link_id: affiliateLinks[1],
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
      utm_source: 'facebook',
      utm_medium: 'social',
      utm_campaign: 'headphones-promo',
      country: 'United States',
      city: 'Los Angeles',
      device_type: 'mobile',
      browser: 'Safari',
      os: 'iOS',
      converted: false,
      clicked_at: knex.raw("NOW() - INTERVAL '1 day'")
    },
    {
      click_id: 'CLK-2026-000003',
      tenant_id: tenantId,
      affiliate_link_id: affiliateLinks[2],
      ip_address: '192.168.1.102',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      utm_source: 'instagram',
      utm_medium: 'social',
      utm_campaign: 'yoga-lifestyle',
      country: 'United States',
      city: 'San Francisco',
      device_type: 'desktop',
      browser: 'Chrome',
      os: 'macOS',
      converted: true,
      conversion_value: 89.99,
      clicked_at: knex.raw("NOW() - INTERVAL '3 hours'"),
      converted_at: knex.raw("NOW() - INTERVAL '1 hour'")
    }
  ]);

  // =========================================================
  // GOOGLE ADS ACCOUNTS
  // =========================================================
  const googleAdsAccountResult = await knex('google_ads_accounts').insert({
    tenant_id: tenantId,
    customer_id: '1234567890',
    refresh_token: 'mock_refresh_token_for_dev',
    status: 'active'
  }).returning('id');
  
  const googleAdsAccountId = googleAdsAccountResult[0].id || googleAdsAccountResult[0];

  // =========================================================
  // GOOGLE ADS CAMPAIGNS
  // =========================================================
  const campaignsResult = await knex('google_ads_campaigns').insert([
    {
      tenant_id: tenantId,
      google_campaign_id: '12345678',
      google_account_id: '1234567890',
      name: 'Running Shoes - Search Campaign',
      status: 'ENABLED',
      budget: 50.00,
      budget_currency: 'USD',
      target_location: 'US',
      intent_id: intentIds[0],
      product_id: productIds[0]
    },
    {
      tenant_id: tenantId,
      google_campaign_id: '87654321',
      google_account_id: '1234567890',
      name: 'Wireless Headphones - Shopping',
      status: 'ENABLED',
      budget: 75.00,
      budget_currency: 'USD',
      target_location: 'US',
      intent_id: intentIds[1],
      product_id: productIds[1]
    },
    {
      tenant_id: tenantId,
      google_campaign_id: '11223344',
      google_account_id: '1234567890',
      name: 'Yoga Equipment - Display',
      status: 'PAUSED',
      budget: 30.00,
      budget_currency: 'USD',
      target_location: 'US',
      intent_id: intentIds[2],
      product_id: productIds[2]
    }
  ]).returning('id');
  
  const campaigns = campaignsResult.map(row => row.id || row);

  // =========================================================
  // CAMPAIGN STATS
  // =========================================================
  await knex('campaign_stats').insert([
    {
      campaign_id: campaigns[0],
      impressions: 15000,
      clicks: 450,
      cost: 375.50,
      conversions: 23
    },
    {
      campaign_id: campaigns[1],
      impressions: 22000,
      clicks: 680,
      cost: 612.40,
      conversions: 41
    },
    {
      campaign_id: campaigns[2],
      impressions: 8000,
      clicks: 180,
      cost: 156.00,
      conversions: 8
    }
  ]);

  // =========================================================
  // JOBS (Exemplos de jobs)
  // =========================================================
  await knex('jobs').insert([
    {
      tenant_id: tenantId,
      type: 'campaign_sync',
      status: 'completed',
      priority: 'normal',
      description: 'Sync Google Ads campaigns data',
      entity_type: 'google_ads_account',
      entity_id: googleAdsAccountId,
      progress: 100,
      total_items: 3,
      processed_items: 3,
      metadata: JSON.stringify({ sync_type: 'full', campaigns_synced: 3 }),
      started_at: knex.raw("NOW() - INTERVAL '30 minutes'"),
      completed_at: knex.raw("NOW() - INTERVAL '25 minutes'")
    },
    {
      tenant_id: tenantId,
      type: 'product_sync',
      status: 'running',
      priority: 'high',
      description: 'Sync Amazon product catalog',
      entity_type: 'affiliate_account',
      progress: 65,
      total_items: 100,
      processed_items: 65,
      metadata: JSON.stringify({ platform: 'amazon', category: 'all' }),
      started_at: knex.raw("NOW() - INTERVAL '10 minutes'")
    },
    {
      tenant_id: tenantId,
      type: 'intent_analysis',
      status: 'pending',
      priority: 'normal',
      description: 'Analyze trending intents',
      progress: 0,
      total_items: 50,
      processed_items: 0,
      metadata: JSON.stringify({ analysis_type: 'trends', period: 'last_7_days' })
    }
  ]);

  // =========================================================
  // USAGE METRICS (Exemplo do mês atual)
  // =========================================================
  const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM

  await knex('usage_metrics').insert([
    {
      tenant_id: tenantId,
      metric: 'campaigns_created',
      count: 3,
      period: currentPeriod
    },
    {
      tenant_id: tenantId,
      metric: 'api_calls',
      count: 2500,
      period: currentPeriod
    },
    {
      tenant_id: tenantId,
      metric: 'intents_tracked',
      count: 5,
      period: currentPeriod
    },
    {
      tenant_id: tenantId,
      metric: 'clicks_tracked',
      count: 3,
      period: currentPeriod
    },
    {
      tenant_id: tenantId,
      metric: 'conversions',
      count: 2,
      period: currentPeriod
    }
  ]);

  console.log('✅ Seed concluído: Intent Radar - Dados iniciais');
  console.log('📊 Tenant: Intent Radar (intent-radar)');
  console.log('👤 Usuários criados: 2');
  console.log('🎯 Intents: 5 | Produtos: 5 | Campanhas: 3');
  console.log('📈 Clicks rastreados: 3 | Conversões: 2');
  console.log('⚙️  Jobs de exemplo: 3');
};
