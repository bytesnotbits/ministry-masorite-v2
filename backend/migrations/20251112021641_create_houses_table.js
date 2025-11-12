/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('houses', table => {
    table.integer('id').primary();
    table.integer('streetId').unsigned().notNullable();
    table.string('address').notNullable();
    table.boolean('hasMailbox').defaultTo(false);
    table.boolean('noTrespassing').defaultTo(false);
    table.boolean('isCurrentlyNH').defaultTo(false);
    table.boolean('hasGate').defaultTo(false);
    table.boolean('isNotInterested').defaultTo(false);
    table.integer('consecutiveNHVisits').defaultTo(0);
    table.boolean('letterSent').defaultTo(false);
    table.string('lastLetterDate');
    table.foreign('streetId').references('id').inTable('streets').onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('houses');
};
