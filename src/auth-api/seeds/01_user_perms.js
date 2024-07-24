/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
    // Deletes ALL existing entries
    let root_id = await knex('users').select('id')
        .where('username', "root")
        .then(function (response) { return response; });

    await knex('table_name').del()
    await knex('table_name').insert([
        { user_id: uuid.parse(root_id[0].id), user_permission_level: 2 }
    ]);
};
