/**
 * Migration para adicionar o campo relevance_score na tabela tenants
 */

exports.up = async function(knex) {
  await knex.schema.alterTable('intents', function(table) {
    table.float('relevance_score').defaultTo(0).comment('Score de relevância do tenant');
  });
};

exports.down = async function(knex) {
  // Remove a coluna apenas se existir
  const hasColumn = await knex.schema.hasColumn('intents', 'relevance_score');
  if (hasColumn) {
    await knex.schema.alterTable('intents', function(table) {
      table.dropColumn('relevance_score');
    });
  }
};
