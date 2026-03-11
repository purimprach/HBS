const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "100.64.6.48",
  database: "HBS",
  password: "P@ssw0rd123",
  port: 5432,
});

module.exports = pool;