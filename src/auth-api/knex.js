var config = require("./knexfile.js").db;
module.exports = require('knex')(config);

