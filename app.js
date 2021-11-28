const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const url = require("url");
const mysql = require("mysql");

const app = express();
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(express.static("public"));

// ------------------------------------------------------------------//

let payeeTax;
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "employeepayrolldata",
});

function fomatter(num) {
  const displayNum = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
  return displayNum;
}

// ######### Connect to Database ########
connection.connect(function (err) {
  if (err) {
    console.log("Error");
    console.log(err);
  } else {
    console.log("Connected to databse");
  }
});

// ----------------------------------------------------------------------//

//////// Home Route ////////
app.get("/", function (req, res) {
  connection.query(
    "Select * From employee_payroll_data",
    function (err, EmployeePayrollResult, fields) {
      if (err) {
        console.log(err);
      }
      let totalBasicSalary = 0;
      let totalSSF = 0;
      let totalTaxableSalary = 0;
      let totalTier1 = 0;
      let totalTier2 = 0;
      let totalPaye = 0;
      let totalNetSalary = 0;
      const totalEmployees = EmployeePayrollResult.length;
      EmployeePayrollResult.forEach((element) => {
        const basicSalary = parseFloat(element.Basic_salary.replace(",", ""));
        const sSF = parseFloat(element.Basic_salary.replace(",", ""));
        const taxableSalary = parseFloat(
          element.Taxable_salary.replace(",", "")
        );
        const tier1 = parseFloat(element.Tier1_Returns.replace(",", ""));
        const tier2 = parseFloat(element.Tier1_Returns.replace(",", ""));
        const paye = parseFloat(element.Payee.replace(",", ""));
        const netSalary = parseFloat(element.Net_Salary.replace(",", ""));

        totalBasicSalary += basicSalary;
        totalSSF += sSF;
        totalTaxableSalary += taxableSalary;
        totalTier1 += tier1;
        totalTier2 += tier2;
        totalPaye += paye;
        totalNetSalary += netSalary;
      });

      res.render("home", {
        page_name: "dashboard",
        TotalEmployees: totalEmployees,
        TotalBasicSalary: fomatter(totalBasicSalary),
        TotalSSF: fomatter(totalSSF),
        TotalTaxableSalary: fomatter(totalTaxableSalary),
        TotalTier1: fomatter(totalTier1),
        TotalTier1: fomatter(totalTier2),
        TotalPaye: fomatter(totalPaye),
        TotalNetSalary: fomatter(totalNetSalary),
      });
    }
  );
});

// ----------------------------------------------------------------------//

///////// PayRoll //////////
app.get("/payroll", function (req, res) {
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

app.post("/payroll", function (req, res) {
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
        console.log("1 record add" + result.ID);
      }
    );
  }

  res.redirect("/payroll");
});

app.post("/employee-payroll-details", function (req, res) {
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

app.post("/edit-employee-payroll-data", function (req, res) {
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

app.post("/delete-employee", function (req, res) {
  const id = req.body.delete;
  const delete_sql = "DELETE FROM employee_payroll_data WHERE id = ?";
  connection.query(delete_sql, id, function (err, detailDeleted) {
    if (err) throw err;

    console.log("Employee Delected");
    res.redirect("/payroll");
  });
  console.log(req.body);
});

// ----------------------------------------------------------------------//

///////// PaySlip /////////
app.get("/payslip", function (req, res) {
  if (req.query.employeeID === undefined) {
  } else {
    connection.query(
      "Select * From employee_payroll_data Where ID =" + req.query.employeeID,
      function (err, EmployeeFound, fields) {
        if (err) {
          console.log(err);
        }
        console.log(EmployeeFound);
      }
    );
  }
  connection.query(
    "Select * From employee_payroll_data",
    function (err, PayrollFound, fields) {
      if (err) {
        console.log(err);
      }
      res.render("payslip", {
        page_name: "payslip",
        EmployeePayrollData: PayrollFound,

        AddOverlay: req.query.addOverlayCssProperty,
        OpenPaySlipForm: req.query.openPaySlipFormCssProperty,
      });
    }
  );
});

app.post("/employee-payslip-detalis", function (req, res) {
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
});

// ----------------------------------------------------------------------//

///////// Bank Advice /////////
app.get("/bankadvice", function (req, res) {
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

// ----------------------------------------------------------------------//

///////// Tier 1 Return /////////
app.get("/tier1", function (req, res) {
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

// ----------------------------------------------------------------------//

///////// Tier 2 Return /////////
app.get("/tier2", function (req, res) {
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

// ----------------------------------------------------------------------//

///////// Paye Returns /////////
app.get("/paye", function (req, res) {
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

// ----------------------------------------------------------------------//

const port = 3100;
app.listen(port, function () {
  console.log("Server started on port " + port + " ............");
});
