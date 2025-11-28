/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('letter_campaigns', function (table) {
            table.increments('id');
            table.string('name').notNullable();
            table.timestamp('createdAt').defaultTo(knex.fn.now());
        })
        .createTable('letters', function (table) {
            table.increments('id');
            table.integer('campaignId').references('id').inTable('letter_campaigns').onDelete('CASCADE');
            table.integer('houseId').references('id').inTable('houses').onDelete('CASCADE');
            table.timestamp('createdAt').defaultTo(knex.fn.now());
        })
        .createTable('letter_templates', function (table) {
            table.increments('id');
            table.string('name').notNullable();
            table.text('content');
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .dropTable('letter_templates')
        .dropTable('letters')
        .dropTable('letter_campaigns');
};
