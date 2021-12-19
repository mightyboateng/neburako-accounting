const connection = require("./database");

module.exports = function (backadvice) {
  ///////// Bank Advice /////////
  backadvice.get("/bankadvice", function (req, res) {
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
          res.render("bankadvice", {
            page_name: "bankadvice",
            EmployeePayrollData: PayrollFound,
          });
        }
      );
    });
  });
};
