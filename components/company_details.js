module.exports = function (company_details) {
  ///////// Company Details /////////
  company_details.get("/company-details", (req, res) => {
    res.render("company_details");
  });
};
