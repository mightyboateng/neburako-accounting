const connection = require("./database");
const fomatter = require("./controllers");
const ejs = require("ejs");
const pdf_ejs = require("html-pdf");
const path = require("path");
const url = require("url");
const authenticated = require("./home");

///////// PaySlip /////////
module.exports = function (payslip) {
  payslip.get(
    "/payslip",
    authenticated.checkAuthenticated,
    function (req, res) {
      let employeePayslipData = [];
      let totalEarnings;
      let totalDeductions;
      let netPay;
      if (req.query.employeeID === undefined) {
      } else {
        connection.query(
          "Select * From employee_payroll_data Where ID =" +
            req.query.employeeID,
          function (err, EmployeeFound, fields) {
            if (err) {
              console.log(err);
            }

            // Total Deductions
            const payee = parseInt(EmployeeFound[0].Payee.replace(",", ""));
            const sSF = parseInt(EmployeeFound[0].SSF.replace(",", ""));
            const otherDeductions = parseInt(
              EmployeeFound[0].Other_deductions.replace(",", "")
            );

            totalDeductions = payee + sSF + otherDeductions;

            // Total Eanrings
            const basicSalary = parseInt(
              EmployeeFound[0].Basic_salary.replace(",", "")
            );
            const taxableAllowance = parseInt(
              EmployeeFound[0].Total_taxable_allowance.replace(",", "")
            );
            const nonTaxableAllowance = parseInt(
              EmployeeFound[0].Non_taxable_allowance.replace(",", "")
            );

            totalEarnings =
              basicSalary + taxableAllowance + nonTaxableAllowance;

            employeePayslipData = EmployeeFound;

            netPay = totalEarnings - totalDeductions;
          }
        );
      }

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
            res.render("payslip", {
              page_name: "payslip",
              EmployeePayrollData: PayrollFound,
              TotalEarns: fomatter(totalEarnings),
              TotalDeducts: fomatter(totalDeductions),
              NetPay: fomatter(netPay),
              EmployeePayslip: employeePayslipData,
              AddOverlay: req.query.addOverlayCssProperty,
              OpenPaySlipForm: req.query.openPaySlipFormCssProperty,
            });
          }
        );
      });
    }
  );

  payslip.post(
    "/payslip",
    authenticated.checkAuthenticated,
    function (req, res) {
      ejs.renderFile(
        path.join(__dirname, "..", "views", "print_payslip.ejs"),
        (err, data) => {
          if (err) {
            console.log(err);
          } else {
            let options = {
              height: "11.7in",
              width: "8.3in",
              header: {
                height: "20mm",
              },
              footer: {
                height: "20mm",
              },
            };
            pdf_ejs
              .create(data, options)
              .toFile("report.pdf", function (err, data) {
                if (err) {
                  console.log(err);
                } else {
                  console.log("File created successfully");
                }
              });
          }
        }
      );
      res.redirect("/payslip");
    }
  );

  payslip.post(
    "/employee-payslip-detalis",
    authenticated.checkAuthenticated,
    function (req, res) {
      const overlay = "add-overlay";
      const openPaySlipForm = "add-form";

      res.redirect(
        url.format({
          pathname: "/payslip",
          query: {
            addOverlayCssProperty: overlay,
            openPaySlipFormCssProperty: openPaySlipForm,
            employeeID: req.body.empID,
          },
        })
      );
    }
  );
};
