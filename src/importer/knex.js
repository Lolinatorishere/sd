var config = require("./middleware/knexfile.js").db;
module.exports = require('knex')(config);

