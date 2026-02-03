/**
 * Migration 003: Add ads_risk_level to products table
 *
 * Adiciona a coluna `ads_risk_level` na tabela `products`
 */

exports.up = async function(knex) {
  await knex.schema.table('products', (table) => {
    table.string('ads_risk_level', 20).defaultTo('LOW');
  });
};

exports.down = async function(knex) {
  await knex.schema.table('products', (table) => {
    table.dropColumn('ads_risk_level');
  });
};
