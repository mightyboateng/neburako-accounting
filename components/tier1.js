const connection = require("./database");
const authenticated = require("./home");

module.exports = function (tier1) {
  ///////// Tier 1 Return /////////
  tier1.get("/tier1", authenticated.checkAuthenticated, function (req, res) {
    connection.query(
      "Select * From employee_payroll_data",
      function (err, PayrollFound, fields) {
        if (err) {
          console.log(err);
        }
        res.render("tier1", {
          page_name: "tier1",
          EmployeePayrollData: PayrollFound,
        });
      }
    );
  });
};
