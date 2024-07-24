/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
    // Deletes ALL existing entries
    let pw = sha256.create();
    pw.update("root");
    await knex('table_name').del()
    await knex('table_name').insert(

        { username: "root", password: pw.hex() }
    );
};
