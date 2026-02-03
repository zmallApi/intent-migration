/**
 * Migration 005: adiciona affiliate_account_id e FK em affiliate_links
 */

exports.up = async function(knex) {
  await knex.schema.table('affiliate_links', (table) => {
    table.uuid('affiliate_account_id');
    table.foreign('affiliate_account_id').references('id').inTable('affiliate_accounts').onDelete('SET NULL');
    table.index('affiliate_account_id');
  });
};

exports.down = async function(knex) {
  await knex.schema.table('affiliate_links', (table) => {
    table.dropForeign('affiliate_account_id');
    table.dropColumn('affiliate_account_id');
  });
};
