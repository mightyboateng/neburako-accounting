const connection = require("./database");
const bcrypt = require("bcryptjs");

module.exports = function (home) {
  ///////// Bank Advice /////////
  home.get("/", (req, res) => {
    res.render("home");
  });

  home.post("/", (req, res) => {
    const { email, password } = req.body;

    const check_email_sql = "SELECT email FROM user_login WHERE email= ?";
  });
};
