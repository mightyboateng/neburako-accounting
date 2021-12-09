const connection = require("./database");
const fomatter = require("./controllers");

module.exports = function (dashboard) {
  //////// Home Route ////////
  dashboard.get("/dashboard", function (req, res) {
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

        res.render("dashboard", {
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
};
