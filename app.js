const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");

const app = express();
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(express.static("public"));

// ------------------------------------------------------------------//
const employeeList = [];
const empCalculationList = [];
let payeeTax;

// ----------------------------------------------------------------------//

//////// Home Route ////////
app.get("/", function (req, res) {
  res.render("home", { page_name: "dashboard", EmployeeList: employeeList });
});

// ----------------------------------------------------------------------//

///////// PayRoll //////////
app.get("/payroll", function (req, res) {
  res.render("payroll", {
    page_name: "payroll",
    EmployeeList: employeeList,
    EmpCalculationList: empCalculationList,
  });
});

app.post("/payroll", function (req, res) {
  const empDetails = req.body;
  const basicSalary = parseInt(req.body.basicSalary);
  const taxAllowance = parseInt(req.body.taxAllowances);
  const totalReliefs = parseInt(req.body.totalReliefs);
  const ssf = parseInt(req.body.basicSalary) * 0.055;
  const nonTaxableAllowances = parseInt(req.body.nonTaxAllowances);
  const otherDeductions = parseInt(req.body.otherDeductions);
  const taxbleSalary = basicSalary - ssf + taxAllowance - totalReliefs;

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

  employeeList.push(empDetails);

  let netSalary =
    basicSalary -
    ssf +
    taxAllowance -
    payeeTax +
    nonTaxableAllowances -
    otherDeductions;

  function fomatter(num) {
    const displayNum = new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
    return displayNum;
  }

  empCalculation = {
    SSF: fomatter(ssf),
    Payee: fomatter(payeeTax),
    TaxableSalary: fomatter(taxbleSalary),
    NetSalary: fomatter(netSalary),
    TaxAllowance: fomatter(taxAllowance),
    NonTaxableAllowances: fomatter(nonTaxableAllowances),
    OtherDeductions: fomatter(otherDeductions),
    TotalReliefs: fomatter(totalReliefs),
  };
  empCalculationList.push(empCalculation);

  res.render("payroll", {
    page_name: "payroll",
    EmployeeList: employeeList,
    EmpCalculationList: empCalculationList,
  });
});

// ----------------------------------------------------------------------//

///////// PaySlip /////////
app.get("/payslip", function (req, res) {
  res.render("payslip", {
    page_name: "payslip",
    EmployeeList: employeeList,
    EmpCalculationList: empCalculationList,
  });
});

// ----------------------------------------------------------------------//

///////// Bank Advice /////////
app.get("/bankadvice", function (req, res) {
  res.render("bankadvice", {
    page_name: "bankadvice",
    EmployeeList: employeeList,
    EmpCalculationList: empCalculationList,
  });
});

// ----------------------------------------------------------------------//

///////// Tier 1 Return /////////
app.get("/tier1", function (req, res) {
  res.render("tier1", {
    page_name: "tier1",
    EmployeeList: employeeList,
    EmpCalculationList: empCalculationList,
  });
});

// ----------------------------------------------------------------------//

///////// Tier 2 Return /////////
app.get("/tier2", function (req, res) {
  res.render("tier2", {
    page_name: "tier2",
    EmployeeList: employeeList,
    EmpCalculationList: empCalculationList,
  });
});

// ----------------------------------------------------------------------//

///////// Paye Returns /////////
app.get("/paye", function (req, res) {
  res.render("paye", {
    page_name: "paye",
    EmployeeList: employeeList,
    EmpCalculationList: empCalculationList,
  });
});

// ----------------------------------------------------------------------//

app.listen(3100, function () {
  console.log("Server 3000 started.....");
});
