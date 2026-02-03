/**
 * Migration 006: Add `source` to products and add missing fields to intents
 * - products.source
 * - intents.source, status, risk_level, opportunity_score, last_enriched_at
 * - rename intent_score -> opportunity_score if present
 */

exports.up = async function(knex) {
  // Add `source` to products
  if (!(await knex.schema.hasColumn('products', 'source'))) {
    await knex.schema.table('products', (table) => {
      table.string('source', 100).nullable();
    });
  }

  // Add missing fields to intents
  if (!(await knex.schema.hasColumn('intents', 'source'))) {
    await knex.schema.table('intents', (table) => {
      table.string('source', 50).nullable();
    });
  }

  if (!(await knex.schema.hasColumn('intents', 'status'))) {
    await knex.schema.table('intents', (table) => {
      table.string('status', 20).defaultTo('draft');
    });
  }

  if (!(await knex.schema.hasColumn('intents', 'risk_level'))) {
    await knex.schema.table('intents', (table) => {
      table.integer('risk_level').nullable();
    });
  }

  if (!(await knex.schema.hasColumn('intents', 'opportunity_score'))) {
    await knex.schema.table('intents', (table) => {
      table.float('opportunity_score').nullable();
    });
  }

  if (!(await knex.schema.hasColumn('intents', 'last_enriched_at'))) {
    await knex.schema.table('intents', (table) => {
      table.timestamp('last_enriched_at').nullable();
    });
  }

  // If an older `intent_score` exists and `opportunity_score` does not, rename it.
  if ((await knex.schema.hasColumn('intents', 'intent_score')) && !(await knex.schema.hasColumn('intents', 'opportunity_score'))) {
    await knex.schema.table('intents', (table) => {
      table.renameColumn('intent_score', 'opportunity_score');
    });
  }
};

exports.down = async function(knex) {
  // Drop products.source if exists
  if (await knex.schema.hasColumn('products', 'source')) {
    await knex.schema.table('products', (table) => {
      table.dropColumn('source');
    });
  }

  // Try to rename opportunity_score back to intent_score if appropriate
  if ((await knex.schema.hasColumn('intents', 'opportunity_score')) && !(await knex.schema.hasColumn('intents', 'intent_score'))) {
    try {
      await knex.schema.table('intents', (table) => {
        table.renameColumn('opportunity_score', 'intent_score');
      });
    } catch (e) {
      // ignore rename failures during rollback
    }
  }

  // Drop remaining columns added to intents
  if (await knex.schema.hasColumn('intents', 'opportunity_score')) {
    await knex.schema.table('intents', (table) => {
      table.dropColumn('opportunity_score');
    });
  }

  if (await knex.schema.hasColumn('intents', 'source')) {
    await knex.schema.table('intents', (table) => {
      table.dropColumn('source');
    });
  }

  if (await knex.schema.hasColumn('intents', 'status')) {
    await knex.schema.table('intents', (table) => {
      table.dropColumn('status');
    });
  }

  if (await knex.schema.hasColumn('intents', 'risk_level')) {
    await knex.schema.table('intents', (table) => {
      table.dropColumn('risk_level');
    });
  }

  if (await knex.schema.hasColumn('intents', 'last_enriched_at')) {
    await knex.schema.table('intents', (table) => {
      table.dropColumn('last_enriched_at');
    });
  }
};
