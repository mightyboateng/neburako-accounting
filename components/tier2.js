const connection = require("./database");
const authenticated = require("./home");

module.exports = function (tier2) {
  ///////// Tier 2 Return /////////
  tier2.get("/tier2", authenticated.checkAuthenticated, function (req, res) {
    const sql_id = "SELECT id FROM user_login WHERE email= ?";

    connection.query(sql_id, req.user, (err, foundId) => {
      if (err) throw err;

      const userId = foundId[0].id;

      connection.query(
        "Select * From employee_payroll_data where user_id = " + userId,
        function (err, PayrollFound, fields) {
          if (err) {
            console.log(err);
          }
          res.render("tier2", {
            page_name: "tier2",
            EmployeePayrollData: PayrollFound,
          });
        }
      );
    });
  });
};
