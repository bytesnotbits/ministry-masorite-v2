/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('visits', function (table) {
        table.integer('id').primary();
        table.integer('houseId').references('id').inTable('houses').onDelete('CASCADE');
        table.integer('personId').references('id').inTable('people').onDelete('CASCADE');
        table.string('date');
        table.text('notes');
        table.boolean('isNotAtHome').defaultTo(false);
        table.boolean('isVisitAttempt').defaultTo(false);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('visits');
};
