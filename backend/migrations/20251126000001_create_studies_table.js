/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('studies', function (table) {
        table.integer('id').primary();
        table.integer('personId').references('id').inTable('people').onDelete('CASCADE');
        table.string('publication');
        table.string('currentLesson');
        table.string('lessonProgress');
        table.boolean('isActive').defaultTo(true);
        table.string('createdAt');
        table.json('goals');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('studies');
};
