const connection = require("./database");

module.exports = function (tier2) {
  ///////// Tier 2 Return /////////
  tier2.get("/tier2", function (req, res) {
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
