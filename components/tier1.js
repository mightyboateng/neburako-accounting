const connection = require("./database");
const authenticated = require("./home");
const fomatter = require("./controllers");
const fs = require("fs");
const utils = require("util");
const readFile = utils.promisify(fs.readFile);
const hb = require("handlebars");
const puppeteer = require("puppeteer");
const path = require("path");

const userNavDetail = require("./user");

let period;
module.exports = function (tier1) {
  tier1.get("/tier1", authenticated.checkAuthenticated, function (req, res) {
    userNavDetail
      .userNavbarProfile(req.user)
      .then((userDetails) => {
        const navDetails = userDetails;
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
              let totalTier1 = 0;
              PayrollFound.forEach((tier1) => {
                const tier1Return = parseFloat(
                  tier1.Tier1_Returns.replace(",", "")
                );
                totalTier1 += tier1Return;
              });

              res.render("tier1", {
                page_name: "tier1",
                TotalTier1: fomatter(totalTier1),
                EmployeePayrollData: PayrollFound,
                NavDetails: navDetails,
              });
            }
          );
        });
      })
      .catch((err) => {
        throw err;
      });
  });

  tier1.post(
    "/download_tier1",
    authenticated.checkAuthenticated,
    (req, res) => {
      const options = {
        year: "numeric",
        month: "long",
      };
      const date = new Date(req.body.period);

      period = date.toLocaleDateString("en-US", options);

      const sql_id = "SELECT id FROM user_login WHERE email= ?";

      connection.query(sql_id, req.user, (err, foundId) => {
        if (err) throw err;

        const userId = foundId[0].id;

        connection.query(
          "Select * from user_detail where user_id =" + userId,
          (err, foundDetails) => {
            if (err) throw err;

            const companyName = foundDetails[0].company_name;
            const companyAddress = foundDetails[0].company_address;
            const companyTin = foundDetails[0].tin;

            connection.query(
              "Select * From employee_payroll_data where user_id = " + userId,
              function (err, PayrollFound, fields) {
                if (err) {
                  console.log(err);
                }
                let totalTier1 = 0;
                PayrollFound.forEach((tier1) => {
                  const tier1Return = parseFloat(
                    tier1.Tier1_Returns.replace(",", "")
                  );
                  totalTier1 += tier1Return;
                });

                async function getTemplateHtml() {
                  console.log("Loading template file in memory");
                  try {
                    const invoicePath = path.join(
                      __dirname,
                      "..",
                      "views",
                      "print_tier1.html"
                    );

                    return await readFile(invoicePath, "utf8");
                  } catch (err) {
                    return Promise.reject("Could not load html template");
                  }
                }

                async function generatePdf() {
                  let data = {
                    Emp: PayrollFound,
                    totalTier1: fomatter(totalTier1),
                    Period: period,
                    CompanyName: companyName,
                    CompanyAddress: companyAddress,
                    CompanyTin: companyTin,
                  };
                  getTemplateHtml()
                    .then(async (res) => {
                      console.log("Compiing the template with handlebars");
                      const template = hb.compile(res, { strict: true });
                      const result = template(data);
                      const html = result;

                      const browser = await puppeteer.launch();
                      const page = await browser.newPage();

                      await page.setContent(html);

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

                res.render("print_tier1", {
                  TotalTier1: fomatter(totalTier1),
                  EmployeePayrollData: PayrollFound,
                  Period: period,
                  CompanyName: companyName,
                  CompanyAddress: companyAddress,
                  CompanyTin: companyTin,
                });
              }
            );
          }
        );
      });
    }
  );

  tier1.get("/tier1Returns", authenticated.checkAuthenticated, (req, res) => {
    const file = path.join(__dirname, "..", req.user + "file.pdf");
    res.download(file);
  });
};
