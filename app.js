require("dotenv").config();

const express = require("express");
// const ejs = require("ejs");
// const bodyParser = require("body-parser");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

const registration = require(__dirname + "/components/register");
const login = require(__dirname + "/components/home");

// ------ Module Routes -----
login.home(app);
registration.register(app);
require(__dirname + "/components/company_details")(app);

require(__dirname + "/components/profile")(app);

require(__dirname + "/components/contact")(app);

require(__dirname + "/components/dashboard")(app);
require(__dirname + "/components/payroll")(app);
require(__dirname + "/components/payslip")(app);
require(__dirname + "/components/bankadvice")(app);
require(__dirname + "/components/tier1")(app);
require(__dirname + "/components/tier2")(app);
require(__dirname + "/components/payee")(app);

// ------------------------------------------------------------------//

// ----------------------------------------------------------------------//

app.get("/services", (req, res) => {
  res.render("services");
});

app.get("/contact", (req, res) => {
  res.render("contact", { message: "" });
});

const port = 3500;
app.listen(process.env.PORT || port, function () {
  console.log("Server started on port " + port + " ............");
});
