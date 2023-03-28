const mysql = require("mysql");
const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "****",
  database: "db_nucleic",
});
module.exports = db;
