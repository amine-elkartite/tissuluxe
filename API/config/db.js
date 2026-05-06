const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "tissuluxe_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "Z"
});

pool.getConnection()
  .then((connection) => {
    console.log("Connexion MySQL TissuLuxe établie");
    connection.release();
  })
  .catch((err) => {
    console.error("Connexion MySQL impossible:", err.message);
  });

module.exports = pool;
