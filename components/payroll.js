const connection = require("./database");
const fomatter = require("./controllers");
const url = require("url");

let payeeTax;

module.exports = function (payroll) {
  payroll.get("/payroll", function (req, res) {
    let employeeFound = [];
    if (req.query.employeeID === undefined) {
    } else {
      connection.query(
        "Select * From employee_payroll_data Where ID =" + req.query.employeeID,
        function (err, EmployeeFound, fields) {
          if (err) {
            console.log(err);
          }
          employeeFound = EmployeeFound;
        }
      );
    }
    connection.query(
      "Select * From employee_payroll_data",
      function (err, PayrollFound, fields) {
        if (err) {
          console.log(err);
        }
        res.render("payroll", {
          page_name: "payroll",
          OpenPayrollForm: req.query.openPayrollFormCssProperty,
          AddOverlay: req.query.addOverlayCssProperty,
          EmployeePayrollData: PayrollFound,
          EmployeeDataFound: employeeFound,
        });
      }
    );
  });

  payroll.post("/payroll", function (req, res) {
    const basicSalary = parseInt(req.body.basicSalary);
    const taxAllowance = parseInt(req.body.taxAllowances);
    const totalReliefs = parseInt(req.body.totalReliefs);
    const ssf = parseInt(req.body.basicSalary) * 0.055;
    const nonTaxableAllowances = parseInt(req.body.nonTaxAllowances);
    const otherDeductions = parseInt(req.body.otherDeductions);
    const taxbleSalary = basicSalary - ssf + taxAllowance - totalReliefs;

    const tier1Amount = basicSalary * 0.135;

    if (taxbleSalary > 319) {
      let firstResult = taxbleSalary - 319;

      if (firstResult >= 100) {
        payeeTax = 5;

        let secondResult = firstResult - 100;
        if (secondResult >= 120) {
          payeeTax = (parseInt(payeeTax) + 12).toFixed(2);

          let thirdResult = secondResult - 120;
          if (thirdResult >= 3000) {
            payeeTax = (parseInt(payeeTax) + 525).toFixed(2);

            let fourthTax = thirdResult - 3000;
            if (fourthTax >= 16461) {
              payeeTax = (parseInt(payeeTax) + 4115.25).toFixed(2);

              let fifthTax = fourthTax - 16461;
              if (fifthTax > 0) {
                payeeTax = (parseInt(payeeTax) + fifthTax * 0.25).toFixed(2);
              }
            } else {
              payeeTax = (parseInt(payeeTax) + fourthTax * 0.25).toFixed(2);
            }
          } else {
            payeeTax = (parseInt(payeeTax) + thirdResult * 0.175).toFixed(2);
          }
        } else {
          payeeTax = (parseInt(payeeTax) + secondResult * 0.1).toFixed(2);
        }
      } else {
        payeeTax = (firstResult * 0.05).toFixed(2);
      }
    } else {
      console.log("no tax on salary");
    }

    const netSalary =
      basicSalary -
      ssf +
      taxAllowance -
      payeeTax +
      nonTaxableAllowances -
      otherDeductions;

    const employeePayrollDetail = {
      Employee_name: req.body.empName,
      Staff_id: req.body.staffID,
      Tin_number: req.body.tinNumber,
      Position: req.body.position,
      SSF_account_number: req.body.ssfNumber,
      BankBranch_BankName: req.body.bank,
      Bank_account_number: req.body.bankAccountNo,

      Basic_salary: fomatter(basicSalary),
      SSF: fomatter(ssf),
      Total_taxable_allowance: fomatter(taxAllowance),
      Total_reliefs: fomatter(totalReliefs),
      Taxable_salary: fomatter(taxbleSalary),
      Payee: fomatter(payeeTax),
      Non_taxable_allowance: fomatter(nonTaxableAllowances),
      Other_deductions: fomatter(otherDeductions),
      Net_Salary: fomatter(netSalary),
      Tier1_Returns: fomatter(tier1Amount),
    };

    //---- Updating Employee Payroll Data in the database table
    if (req.body.update) {
      const id = req.body.update;
      const update_sql = "UPDATE employee_payroll_data SET ? WHERE id= ?";
      connection.query(
        update_sql,
        [employeePayrollDetail, id],
        function (err, detailsUpdated) {
          if (err) throw err;
          console.log(detailsUpdated);
        }
      );
    }
    //---- Adding Employee Payroll Data to the database table
    else {
      const payroll_sql = "INSERT INTO employee_payroll_data SET ?";
      connection.query(
        payroll_sql,
        employeePayrollDetail,
        function (err, result) {
          if (err) {
            console.log(err);
          }
          console.log(result);
          console.log("1 record add" + result.ID);
        }
      );
    }

    res.redirect("/payroll");
  });

  payroll.post("/employee-payroll-details", function (req, res) {
    const overlay = "add-overlay";
    const openPaySlipForm = "add-form";

    res.redirect(
      url.format({
        pathname: "/payroll",
        query: {
          addOverlayCssProperty: overlay,
          openPayrollFormCssProperty: openPaySlipForm,
          employeeID: req.body.empID,
        },
      })
    );
  });

  payroll.post("/edit-employee-payroll-data", function (req, res) {
    connection.query(
      "Select * From employee_payroll_data Where ID =" + req.body.empID,
      function (err, EmployeeFound, fields) {
        if (err) {
          console.log(err);
        }
        res.render("edit_payroll_data", {
          page_name: "",
          EditEmployee: EmployeeFound,
        });
      }
    );
  });

  payroll.post("/delete-employee", function (req, res) {
    const id = req.body.delete;
    const delete_sql = "DELETE FROM employee_payroll_data WHERE id = ?";
    connection.query(delete_sql, id, function (err, detailDeleted) {
      if (err) throw err;

      console.log("Employee Delected");
      res.redirect("/payroll");
    });
    console.log(req.body);
  });
};
