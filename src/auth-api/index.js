const express = require('express');
const cors = require('cors');
const knexConfig = require('./knexfile').db;
const knex = require('knex')(knexConfig);
const uuid = require('uuid');
const sha256 = require('js-sha256');

const app = express();

app.use(express.json());
app.use(cors());

knex.schema.hasTable('users').then(function (exists) {
    if (!exists) {
        return knex.schema.createTable('users', function (t) {
            t.uuid('id').defaultTo(knex.fn.uuid());
            t.string("username", 100).unique();
            t.specificType("password", "CHAR(64)");
        })
    }
})

knex.schema.hasTable('user_perms').then(function (exists) {
    if (!exists) {
        return knex.schema.createTable('user_perms', function (t) {
            t.uuid('user_id');
            t.boolean("read");
            t.boolean("edit");
            t.boolean("admin");
            t
                .foreign('user_id')
                .references('users.id')
                .deferrable('deferred')
        });
    }
})

app.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!uuid.validate(id)) {
            return res.status(400).send("Invalid UUID");
        }

        const user = await knex
            .select('username').from('users').where('id', id)
            .then(function (response) {
                return response;
            })

        if (user.length !== 1)
            return res.status(400).send("No Users With the UUID");

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving data');
    }
});

app.post('/users', async (req, res) => {
    try {
        //let re = /[0-9A-Fa-f]{64}/g;

        if (!req.body)
            return res.status(400).send('POST Error');

        const { username, password } = req.body

        if (!username) {
            return res.status(400).send('Username is missing');
        }

        if (!password) {
            return res.status(400).send('Password is missing');
        }

        let pw = sha256.create();
        pw.update(password);

        let user = await knex('users')
            .select('username').where('username', username)
            .then(function (response) {
                return response;
            });

        if (user.length !== 0) {
            return res.status(400).send('Username already taken');
        }

        knex('users')
            .insert([{ username: username, password: pw.hex() }])
            .then(function () {
                res.send("user: " + username + " created Succesfully.");
            })
    } catch (error) {
        console.error(error);
        res.status(500).send('Error Creating User');
    }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
