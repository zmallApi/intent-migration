/**
 * Migration 002: Add product_url to products table
 * 
 * Adiciona o campo product_url na tabela products
 */

exports.up = async function(knex) {
  await knex.schema.table('products', (table) => {
    table.string('product_url', 500).nullable();
  });
};

exports.down = async function(knex) {
  await knex.schema.table('products', (table) => {
    table.dropColumn('product_url');
  });
};
