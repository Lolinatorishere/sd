const express = require('express');
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const { cookieJwtAuth } = require("./middleware/cookieJwtAuth.js");
const { encrypt, decrypt } = require("./middleware/encryption.js");
const sha256 = require('js-sha256');

//if .jwt.js has not been created will error out
const jwt_key = require('./.jwt_key.js').key;
const knexConfig = require('./knexfile').db;
const knex = require('knex')(knexConfig);

const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

async function create_base_tables() {
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
}

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

//returns true or false depending on if the credentials are valid or not for that user
//does not processes the inputs for validation thats presumably done outside
//this function just checks if the credentials are valid or not
async function validateCredentials(username, password) {
    try {
        //guard clauses
        if (typeof username !== "string") {
            return false;
        } if (typeof password !== "string") {
            return false;
        }

        if (username.isEmpty) {
            return false;
        }

        if (password.isEmpty) {
            return false;
        }

        let user = await knex('users')
            .select("*")
            .where("username", username)
            .then(function (response) {
                return response;
            });

        if (user.length !== 1) {
            return false;
        }

        if (user[0].password !== password) {
            return false;
        }

        return {
            id: user[0].id,
            username: user[0].username,
            password: user[0].password
        };
    } catch (error) {
        return false;
    }
}

//check_root();

app.get('/user/:id', async (req, res) => {
    try {
        let { id } = req.params;
        let user = await knex("users")
            .select("username")
            .where("id", id)
            .then((response) => {
                return response;
            })

        if (user.length !== 1) {
            res.status(400).send("Invalid User ID");
        }

        return res.send(user[0]);

    } catch (error) {
        console.error(error);
        return res(500)
    }
});

app.post('/user/', cookieJwtAuth, async (req, res) => {
    try {
        //let re = /[0-9A-Fa-f]{64}/g;
        if (res.cookie) {
            delete res.cookie;
        }

        if (!req.body)
            return res.status(400).send('POST Error');

        let { username, password } = req.body

        if (!username) {
            return res.status(400).send('Username is missing');
        }

        username = username.trim();

        if (username.isEmpty) {
            return res.status(400).send("Username can't be Empty")
        }

        if (!password) {
            return res.status(400).send('Password is missing');
        }

        password = password.trim();

        if (password.isEmpty) {
            return res.status(400).send("Password can't be Empty")
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
                res.status(201).send("user: " + username + " created Succesfully.");
            })

        let user_id = await knex('users')
            .select('*')
            .where('username', username)
            .then(function (response) {
                return response;
            });

        await knex('user_perms')
            .insert([{ user_id: uuid.parse(user_id[0].id), user_permission_level: 0 }])
            .then();

        payload = {
            user_id: user_id[0].id,
            username: user_id[0].username,
            password: encrypt(user_id[0].password),
            permissions: "read"
        }

        const token = jwt.sign(payload, jwt_key, { expiresIn: "1h" });

        res.cookie("authentication", token, {
            httpOnly: true
        });

        res.cookie("authentication")

        return res.status(200);

    } catch (error) {
        console.error(error);
        return res.status(500).send('An Error Occured');
    }
})

app.put('/user/:id', cookieJwtAuth, async (req, res) => {
    try {

        let { id } = req.params;

        let non_parsed_id = id;
        id = uuid.parse(id);

        if (!req.user) {
            return res.status(401).send("Invalid Request");
        }

        let user = await knex("users")
            .select("username")
            .where("id", id)
            .then(function (response) {
                return response;
            })

        if (user.length !== 1) {
            return res.status(400).send("Invalid ID");
        }

        if (req.user.permissions !== "admin") {
            if (user[0].id !== req.user.user_id) {
                return res.status(403).send("Unauthorised Request");
            }
        }

        if (!req.body) {
            return res.status(400).send("Post Error");
        }

        let { username, password, permissions } = req.body
        let response = {};
        let new_password = undefined;
        let new_permission = undefined;

        if (username) {
            try {
                username = username.trim();

                let unique_username = await knex("users")
                    .select("username")
                    .where("username", username)
                    .then(function (response) {
                        return response;
                    });

                if (unique_username.length !== 0) {
                    throw new Error("That Username has Been Taken");
                }

                if (username.isEmpty) {
                    throw new Error("Username can't be Empty");
                }

                knex("users")
                    .update("username", username)
                    .where("id", id)
                    .then();

                response.username = ("Username changed to " + username);
            } catch (error) {
                console.error(error);
                response.username = error.message;
            }
        }

        if (password) {
            try {

                password = password.trim();

                if (password.length === 0) {
                    throw new Error("New Password can not be Empty");
                }

                pw = sha256.create();
                pw.update(password);

                knex("users")
                    .update("password", pw.hex())
                    .where("id", id)
                    .then()

                response.password = "User Password Altered";
                new_password = await encrypt(password);

            } catch (error) {
                response.password = error.message;
            }
        }

        if (permissions) {
            try {

                if (req.user.permissions !== "admin") {
                    throw new Error("Unauthorised Edit")
                }

                let permission_level = undefined;

                switch (permissions) {
                    case "view":
                        permission_level = 0;
                        break;
                    case "edit":
                        permission_level = 1;
                        break;
                    case "admin":
                        permission_level = 2;
                        break;
                    default:
                        throw new error("Invalid Auth Type");
                }

                if (non_parsed_id == req.user.user_id) {
                    let admins = await knex("user_perms")
                        .select("user_permission_level")
                        .where("user_permission_level", 2)
                        .then(function (response) {
                            return response;
                        })

                    if (admins.length <= 1) {
                        throw new Error("You need more than one admin to be able to alter admin user permissions");
                    }
                }

                knex("user_perms")
                    .update("user_permission_level", permission_level)
                    .where("user_id", id)
                    .then()

                new_permission = permission_level;

                response.permissions = "User Peremissions Altered";

            } catch (error) {
                response.permissions = error.message;
            }
        }

        if (non_parsed_id === req.user.user_id) {
            let youser = await knex("users")
                .select("*")
                .where("id", id)
                .then(function (response) {
                    return response;
                })

            let permission = "";

            let new_perms = await knex("user_perms")
                .select("user_permission_level")
                .where("user_id", id)
                .then(function (response) {
                    return response;
                })

            switch (new_perms[0].user_permission_level) {
                case 0:
                    permission = "read";
                    break;
                case 1:
                    permission = "edit";
                    break;
                case 2:
                    permission = "admin";
                    break;
                default:
                    permission = "read";
                    break;
            }

            let payload = {
                user_id: non_parsed_id,
                username: youser.username,
                password: await encrypt(youser.password),
                permissions: permission
            }

            if (username) {
                payload.username = username;
            }

            if (new_password !== undefined) {
                payload.password = new_password;
            }

            if (new_permission !== undefined) {
                payload.permissions = new_permission;
            }

            console.log(payload);

            const token = jwt.sign(payload, jwt_key, { expiresIn: "1h" });

            res.cookie("authentication", token, {
                httpOnly: true
            });
        }

        res.send(response);

    } catch (error) {
        console.error(error);
        return res.status(500).send("An Error Occured")
    }
})

app.delete('/user/:id', cookieJwtAuth, async (req, res) => {
    try {

        let { id } = req.params;
        id = uuid.parse(id);

        if (!req.user) {
            return res.status(401).send("Invalid Token");
        }

        if (req.user.permissions !== "admin") {
            return res.status(401).send("Invalid Authorisation Level");
        }

        let user = await knex("users")
            .select("*")
            .where("id", id)
            .then(function (response) {
                return response;
            })

        if (user.length !== 1) {
            return res.status(400).send("Id Does Not Exist")
        }

        let user_perms = await knex("user_perms")
            .select("*")
            .where("user_id", id)
            .then(function (response) {
                return response
            })

        if (user_perms[0].user_permission_level === 2) {
            let total_admins = await knex("user_perms")
                .select("*")
                .where("user_permission_level", 2)
                .then(function (response) {
                    return response
                })
            if (total_admins.length <= 1) {
                return res.status(401).send("You need more than one admin to be able to remove admin users");
            }
        }

        knex("users")
            .where("id", id)
            .del()
            .then()

        if (req.user.user_id === id) {
            res.cookie("authentication", "");
        }
        return res.send("User " + user[0].username + "  Deleted")

    } catch (error) {
        console.error(error);
        res.status(500).send("An Error Occured please try again Later");
    }
});

app.post('/login/', cookieJwtAuth, async (req, res) => {
    try {

        if (!req.body) {
            return res.status(400).send("POST error")
        }

        let { username, password } = req.body;
        let permission = undefined;

        pw = sha256.create();
        pw.update(password);

        let user = await validateCredentials(username, pw.hex());

        if (!user) {
            return res.status(400).send("Username or Password Incorrect");
        }

        let perm_level = await knex("user_perms")
            .select("user_permission_level")
            .where("user_id", user.id)
            .then(function (response) {
                return response;
            })

        switch (perm_level[0].user_permission_level) {
            case 0:
                permission = "read";
                break;
            case 1:
                permission = "edit";
                break;
            case 2:
                permission = "admin";
                break;
            default:
                permission = undefined;
                break;
        }

        if (permission === undefined) {
            throw new Error("undefined permission");
        }

        let payload = {
            user_id: user.id,
            username: user.username,
            password: await encrypt(user.password),
            permissions: permission
        }

        console.log(payload);

        const token = jwt.sign(payload, jwt_key, { expiresIn: "1h" });

        res.cookie("authentication", token, {
            httpOnly: true
        });
        return res.send("User Token Created");


    } catch (error) {
        console.error(error);
        return res.status(500).send("An Error Occured please try again Later");
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
