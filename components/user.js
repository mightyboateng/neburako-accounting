const connection = require("./database");

exports.userNavbarProfile = function (user) {
  return new Promise((resolve, reject) => {
    const sqi_id = "Select id from user_login where email = ?";

    connection.query(sqi_id, user, (err, foundId) => {
      if (err) throw err;

      const userId = foundId[0].id;

      const detail_sql = "Select * from user_detail where user_id = ?";

      connection.query(detail_sql, userId, (err, foundDetail) => {
        if (err) reject(err);

        resolve(foundDetail);
      });
    });
  });
};
