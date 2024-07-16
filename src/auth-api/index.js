const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const knexConfig = require('./knexfile').db;
//if .jwt.js has not been created will error out
const jwt_key = require('./.jwt_key.js').key;
const knex = require('knex')(knexConfig);
const uuid = require('uuid');
const sha256 = require('js-sha256');

const app = express();

app.use(cors());
app.use(express.json());

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
            t.integer("user_permission_level").unsigned;
            t
                .foreign('user_id')
                .references('users.id')
                .deferrable('deferred')
        });
    }
})

async function check_root() {

    let root = await knex('users')
        .select('username')
        .where('username', "root")
        .then(function (response) {
            return response;
        });

    if (root.length === 1) {
        return;
    }

    try {
        let pw = sha256.create();
        pw.update("root");

        await knex('users')
            .insert([{ username: "root", password: pw.hex() }])
            .then(function () {
                console.log("root user created Succesfully.");
            });

        let root_id = await knex('users').select('id').where('username', "root").then(function (response) { return response; });

        await knex('user_perms')
            .insert([{ user_id: uuid.parse(root_id[0].id), user_permission_level: 2 }])
            .then(function () {
                console.log("root permissions set");
            });

    } catch (error) {
        console.error(error);
        return;
    }
}

check_root();

app.get('/auth/users/:id', async (req, res) => {
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

        return res.send(user);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving data');
    }
});

app.post('/auth/register/', async (req, res) => {
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

        await knex('users')
            .insert([{ username: username, password: pw.hex() }])
            .then(function () {
                res.send("user: " + username + " created Succesfully.");
            })

        let user_id = await knex('users').select('id').where('username', username).then(function (response) { return response; });

        await knex('user_perms')
            .insert([{ user_id: uuid.parse(user_id[0].id), user_permission_level: 0 }])
            .then(function () {
                return;
            });
        return res;
    } catch (error) {
        console.error(error);
        res.status(500).send('Error Creating User');
    }
})

app.post('/auth/login', async (req, res) => {
    try {
        if (!req.body)
            return res.status(400).send('POST Error');

        if (!req.body.username) {
            return res.status(400).send('Username is Missing')
        }

        if (!req.body.password) {
            return res.status(400).send('Password is Missing')
        }

        const { username, password } = req.body;
        let pw = sha256.create();
        pw.update(password);

        let user = await knex('users')
            .select('*')
            .where('username', username)
            .then(function (response) {
                return response;
            });

        if (user.length !== 1) {
            return res.status(403).send('Username or Password is Incorrect');
        }

        if (user[0].password !== pw.hex()) {
            return res.status(403).send('Username or Password is Incorrect');
        }

        let auth_level = await knex('user_perms')
            .select('user_permission_level')
            .where('user_id', user[0].id)
            .then(function (response) {
                return response;
            });

        let payload = {
            user_id: user[0].id,
            username: user[0].username,
        }

        const token = jwt.sign(payload, jwt_key, { expiresIn: "1h" });

        res.cookie("authentication", token, {
            httpOnly: true
        });
        return res.send("Test");
    } catch (error) {
        console.error(error);
        return res.status(500).send("An Error Occured please try again Later");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
