const connection = require("./database");
const bcrypt = require("bcryptjs");
const checkNotAuthenticated = require("./home");

let userEmail;
exports.register = function (register) {
  register
    .route("/register")
    .get(checkNotAuthenticated.checkNotAuthenticated, (req, res) => {
      res.render("register", { Message: "" });
    })
    .post(checkNotAuthenticated.checkAuthenticated, (req, res) => {
      const { name, email, password, confirm_password } = req.body;
      userEmail = email;

      const check_email_sql = "SELECT email FROM user_login WHERE email= ?";

      try {
        connection.query(
          check_email_sql,
          [email],
          async function (err, numberOfEmails) {
            if (err) throw err;

            if (numberOfEmails.length > 0) {
              return res.render("register", {
                Message: "Email already exist",
              });
            } else if (password !== confirm_password) {
              return res.render("register", {
                Message: "Password do not match",
              });
            }
            const hashPassword = await bcrypt.hash(password, 10);

            const user = {
              name: name,
              email: email,
              password: hashPassword,
            };
            const register_sql = "INSERT INTO user_login SET ?";

            connection.query(register_sql, user, (err, result) => {
              if (err) throw err;
              if (result) return res.redirect("/company_details");
            });
          }
        );
      } catch (e) {
        console.log(e);
      }
    });
};

exports.getRegisterUser = function () {
  return userEmail;
};
