const connection = require("./database");
const authenticated = require("./home");

module.exports = function (payee) {
  ///////// Paye Returns /////////
  payee.get("/paye", authenticated.checkAuthenticated, function (req, res) {
    connection.query(
      "Select * From employee_payroll_data",
      function (err, PayrollFound, fields) {
        if (err) {
          console.log(err);
        }
        res.render("paye", {
          page_name: "paye",
          EmployeePayrollData: PayrollFound,
        });
      }
    );
  });
};
