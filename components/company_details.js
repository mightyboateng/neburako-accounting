const connection = require("./database"),
  registerUserId = require("./register"),
  fileUpload = require("express-fileupload");

module.exports = function (company_details) {
  company_details.use(fileUpload());

  company_details
    .route("/company_details")

    .get((req, res) => {
      if (registerUserId.getRegisteredUser() === undefined) {
        res.redirect("/");
      } else {
        res.render("company_details");
      }
    })

    .post((req, res) => {
      const email = registerUserId.getRegisteredUser();

      const sql_user_details = "INSERT INTO user_detail SET ?";

      const sql_id = "SELECT id FROM user_login WHERE email= ?";
      connection.query(sql_id, email, (err, foundId) => {
        if (err) throw err;

        const userId = foundId[0].id;

        if (!req.files) {
          const userDetailsNoImage = {
            user_id: userId,
            company_name: req.body.company_name,
            image: "",
            company_address: req.body.address,
            er_number: req.body.er_number,
            tin: req.body.tin,
          };

          connection.query(
            sql_user_details,
            userDetailsNoImage,
            function (err) {
              if (err) throw err;

              return res.redirect("/");
            }
          );
        } else {
          const file = req.files.image;
          const img_name = file.name;

          file.mv("public/images/uploaded_images/" + img_name, function (err) {
            if (err) throw err;

            const userDetails = {
              user_id: userId,
              company_name: req.body.company_name,
              image: img_name,
              company_address: req.body.address,
              er_number: req.body.er_number,
              tin: req.body.tin,
            };

            connection.query(sql_user_details, userDetails, function (err) {
              if (err) throw err;
              return res.redirect("/");
            });
          });
        }
      });
    });
};
