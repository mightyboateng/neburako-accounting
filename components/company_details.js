const connection = require("./database");
const registerUserId = require("./register");
const checkAuthenticated = require("./home");

module.exports = function (company_details) {
  company_details
    .route("/company_details")
    .get(checkAuthenticated.checkNotAuthenticated, (req, res) => {
      res.render("company_details");
      console.log(registerUserId.getRegisterUser());
    })

    .post(checkAuthenticated.checkNotAuthenticated, (req, res) => {
      console.log("Yes Yes Yes");
      console.log(req.body);
    });
};
