/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('study_history', function (table) {
        table.integer('id').primary();
        table.integer('studyId').references('id').inTable('studies').onDelete('CASCADE');
        table.string('date');
        table.text('notes');
        table.string('nextSessionDate');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('study_history');
};
