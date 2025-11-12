/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('people', table => {
    table.integer('id').primary();
    table.integer('houseId').unsigned().nullable();
    table.string('name').notNullable();
    table.boolean('isRV').defaultTo(false);
    table.foreign('houseId').references('id').inTable('houses').onDelete('SET NULL');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('people');
};
