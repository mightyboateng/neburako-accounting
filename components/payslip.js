const connection = require("./database");
const fomatter = require("./controllers");
const currentDate = require("./date_handler");
const ejs = require("ejs");
const pdf_ejs = require("html-pdf");
const pdf_creator = require("pdf-creator-node");
const fs = require("fs");
const path = require("path");
const url = require("url");
const authenticated = require("./home");

const utils = require("util");
const readFile = utils.promisify(fs.readFile);
const hb = require("handlebars");
const puppeteer = require("puppeteer");

const userNavDetail = require("./user");

let period;
///////// PaySlip /////////
module.exports = function (payslip) {
  payslip.get(
    "/payslip",
    authenticated.checkAuthenticated,
    function (req, res) {
      userNavDetail
        .userNavbarProfile(req.user)
        .then((userDetails) => {
          const navDetails = userDetails;
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
                  NavDetails: navDetails,
                });
              }
            );
          });
        })
        .catch((err) => {
          throw err;
        });
    }
  );

  payslip.post(
    "/employee-payslip-detalis",
    authenticated.checkAuthenticated,
    function (req, res) {
      const overlay = "add-overlay";
      const openPaySlipForm = "add-form";

      const options = {
        year: "numeric",
        month: "long",
      };
      const date = new Date(req.body.period);

      period = date.toLocaleDateString("en-US", options);

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

  payslip.get(
    "/download_payslip",
    authenticated.checkAuthenticated,
    (req, res) => {
      const file = path.join(__dirname, "..", req.user + "file.pdf");
      res.download(file);
    }
  );

  payslip.post(
    "/payslip",
    authenticated.checkAuthenticated,
    function (req, res) {
      userNavDetail
        .userNavbarProfile(req.user)
        .then((userDetails) => {
          let totalEarnings;
          let totalDeductions;
          let netPay;

          connection.query(
            "Select * From employee_payroll_data Where ID =" + req.body.printme,
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

              netPay = totalEarnings - totalDeductions;

              async function getTemplateHtml() {
                console.log("Loading template file in memory");
                try {
                  const invoicePath = path.join(
                    __dirname,
                    "..",
                    "views",
                    "print_payslip.html"
                  );

                  return await readFile(invoicePath, "utf8");
                } catch (err) {
                  return Promise.reject("Could not load html template");
                }
              }

              async function generatePdf() {
                let data = {
                  totalEarns: fomatter(totalEarnings),
                  Period: period,
                  CurrentDate: currentDate(),
                  totalDeductions: fomatter(totalDeductions),
                  netPay: fomatter(netPay),
                  Emp: EmployeeFound,
                };
                getTemplateHtml()
                  .then(async (res) => {
                    // Now we have the html code of our template in res object
                    // you can check by logging it on console
                    // console.log(res)
                    console.log("Compiing the template with handlebars");
                    const template = hb.compile(res, { strict: true });
                    // we have compile our code with handlebars
                    const result = template(data);
                    // We can use this to add dyamic data to our handlebas template at run time from database or API as per need. you can read the official doc to learn more https://handlebarsjs.com/
                    const html = result;
                    // we are using headless mode
                    const browser = await puppeteer.launch();
                    const page = await browser.newPage();
                    // We set the page content as the generated html by handlebars
                    await page.setContent(html);
                    // We use pdf function to generate the pdf in the same folder as this file.
                    await page.pdf({
                      path: req.user + "file.pdf",
                      format: "A4",
                      printBackground: true,
                    });
                    await browser.close();
                    console.log("PDF Generated");
                  })
                  .catch((err) => {
                    console.error(err);
                  });
              }

              generatePdf();

              res.render("print1_payslip", {
                Period: period,
                CurrentDate: currentDate(),
                EmployeePayrollData: EmployeeFound,
                TotalEarns: fomatter(totalEarnings),
                TotalDeducts: fomatter(totalDeductions),
                NetPay: fomatter(netPay),
                NavDetails: userDetails,
              });
            }
          );
        })
        .catch((err) => {
          throw err;
        });
    }
  );
};
