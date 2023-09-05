const mysql = require("mysql2");

let pool = mysql
  .createPool({
    host: "localhost",
    database: "db_hackathon",
    port: 3306,
    user: "longnguyen",
    password: "20052000",
  })
  .promise();

module.exports = pool;
