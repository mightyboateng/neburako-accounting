require("dotenv").config();
const mysql = require("mysql");
const fs = require("fs");

const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DATABASE,
  // ssl: { ca: fs.readFileSync(__dirname + "\\scale_ssl.txt") },
});

// ######### Connect to Database ########
connection.connect(function (err) {
  if (err) {
    console.log("Error");
    console.log(err);
  } else {
    console.log("Connected to databse");
  }
});

module.exports = connection;
