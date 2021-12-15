const connection = require("./database");
const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;

exports.initialize = function (passport, getUserEmail) {
  const authenticateUser = async (email, password, done) => {
    const user = getUserEmail(email);

    try {
      const check_email_sql = "SELECT email FROM user_login WHERE email= ?";

      connection.query(check_email_sql, user, (err, foundEmail) => {
        if (err) throw err;

        if (foundEmail.length === 0) {
          console.log("User not found");
          return done(null, false, { message: "Email does not exist" });
        }
        const check_password_sql =
          "SELECT password FROM user_login WHERE email= ?";

        connection.query(check_password_sql, user, (err, foundPassword) => {
          if (err) throw err;

          bcrypt.compare(
            password,
            foundPassword[0].password,
            (err, success) => {
              if (err) throw err;
              if (success === false) {
                console.log("Not Verified Password");
                return done(null, false, { message: "Password is incorrect" });
              }
              if (success === true) {
                return done(null, user);
              }
            }
          );
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user, done) => {});
  passport.deserializeUser((id, done) => {});
};
