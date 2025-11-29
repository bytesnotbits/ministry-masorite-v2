/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // SQLite doesn't support ALTER COLUMN directly, so we need to:
    // 1. Create new table with correct schema
    // 2. Copy data
    // 3. Drop old table
    // 4. Rename new table

    await knex.schema.createTable('territories_new', table => {
        table.increments('id').primary(); // Auto-incrementing ID
        table.string('number').notNullable();
        table.string('description');
    });

    // Copy existing data
    await knex.raw('INSERT INTO territories_new (id, number, description) SELECT id, number, description FROM territories');

    // Drop old table
    await knex.schema.dropTable('territories');

    // Rename new table
    await knex.schema.renameTable('territories_new', 'territories');
};

/**
 * @param { import("knex").Knex } knex  
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    // Revert to original schema
    await knex.schema.createTable('territories_new', table => {
        table.integer('id').primary();
        table.string('number').notNullable();
        table.string('description');
    });

    await knex.raw('INSERT INTO territories_new (id, number, description) SELECT id, number, description FROM territories');
    await knex.schema.dropTable('territories');
    await knex.schema.renameTable('territories_new', 'territories');
};
