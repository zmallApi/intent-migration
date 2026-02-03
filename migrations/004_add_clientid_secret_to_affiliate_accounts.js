/**
 * Migration 004: adiciona clientid e secret em affiliate_accounts
 */

exports.up = async function(knex) {
  await knex.schema.table('affiliate_accounts', (table) => {
    table.string('clientid', 255);
    table.text('secret');
  });
};

exports.down = async function(knex) {
  await knex.schema.table('affiliate_accounts', (table) => {
    table.dropColumn('secret');
    table.dropColumn('clientid');
  });
};
