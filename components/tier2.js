const connection = require("./database");
const authenticated = require("./home");

module.exports = function (tier2) {
  ///////// Tier 2 Return /////////
  tier2.get("/tier2", authenticated.checkAuthenticated, function (req, res) {
    connection.query(
      "Select * From employee_payroll_data",
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
};
