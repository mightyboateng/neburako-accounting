const connection = require("./database");

module.exports = function (payee) {
  ///////// Paye Returns /////////
  payee.get("/paye", function (req, res) {
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
