/**
 * Migration para criar a tabela marketplace_enrichment_ml
 */

exports.up = async function(knex) {
  await knex.schema.createTable('marketplace_enrichment_ml', function(table) {
    table.uuid('id').primary();

    table.uuid('intent_id').notNullable();
    table.uuid('product_id').notNullable();

    table.string('search_query', 255).notNullable();

    table.integer('total_results');
    table.decimal('avg_price', 10, 2);
    table.decimal('min_price', 10, 2);
    table.decimal('max_price', 10, 2);

    table.integer('total_sales_estimated');
    table.integer('avg_sales_per_listing');

    table.string('demand_level', 20);
    table.string('saturation_level', 20);
    table.string('price_alignment', 20);

    table.string('category_id', 50);
    table.string('category_name', 100);
    table.jsonb('condition_ratio');

    table.decimal('confidence_score', 3, 2);
    table.string('data_status', 20);

    table.timestamp('collected_at').notNullable();
    table.timestamp('expires_at').notNullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('marketplace_enrichment_ml');
};
