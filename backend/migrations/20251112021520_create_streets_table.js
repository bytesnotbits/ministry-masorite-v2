/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('streets', table => {
    table.integer('id').primary();
    table.integer('territoryId').unsigned().notNullable();
    table.string('name').notNullable();
    table.foreign('territoryId').references('id').inTable('territories').onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('streets');
};
