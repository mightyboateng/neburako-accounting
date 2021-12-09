const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
// app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/js")));

// ------ Module Routes -----
require(__dirname + "/components/home")(app);
require(__dirname + "/components/register")(app);
require(__dirname + "/components/company_details")(app);

require(__dirname + "/components/dashboard")(app);
require(__dirname + "/components/payroll")(app);
require(__dirname + "/components/payslip")(app);
require(__dirname + "/components/bankadvice")(app);
require(__dirname + "/components/tier1")(app);
require(__dirname + "/components/tier2")(app);
require(__dirname + "/components/payee")(app);

// ------------------------------------------------------------------//

// ----------------------------------------------------------------------//

const port = 3100;
app.listen(port, function () {
  console.log("Server started on port " + port + " ............");
});
