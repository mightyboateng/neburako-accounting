const connection = require("./database");

module.exports = function (backadvice) {
  ///////// Bank Advice /////////
  backadvice.get("/bankadvice", function (req, res) {
    connection.query(
      "Select * From employee_payroll_data",
      function (err, PayrollFound, fields) {
        if (err) {
          console.log(err);
        }
        res.render("bankadvice", {
          page_name: "bankadvice",
          EmployeePayrollData: PayrollFound,
        });
      }
    );
  });
};
