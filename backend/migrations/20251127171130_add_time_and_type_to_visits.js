/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.table('visits', function (table) {
        table.string('time');
        table.string('type');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.table('visits', function (table) {
        table.dropColumn('time');
        table.dropColumn('type');
    });
};
