/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function (knex) {
    return knex.schema.createTable('users', function (t) {
        t.uuid('id').defaultTo(knex.fn.uuid());
        t.string("username", 100).unique();
        t.specificType("password", "CHAR(64)");
    })
        .createTable('user_perms', function (t) {
            t.uuid('user_id');
            t.integer("user_permission_level").unsigned;
            t
                .foreign('user_id')
                .references('users.id')
                .deferrable('deferred')
        });



};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("user_perms").dropTable("users")

};
