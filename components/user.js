const connection = require("./database");

const sql_id = "SELECT id FROM user_login WHERE email= ?";
function getUserId(email) {
  connection.query(sql_id, email, (err, foundId) => {
    if (err) throw err;

    return foundId[0].id;
  });
}

module.exports = getUserId;
