const connection = require("./database");
const authenticated = require("./home");
const userNavDetail = require("./user");
const fileUpload = require("express-fileupload");

module.exports = function (profile) {
  profile.use(fileUpload());

  profile.get("/profile", authenticated.checkAuthenticated, (req, res) => {
    userNavDetail
      .userNavbarProfile(req.user)
      .then((userDetails) => {
        const navDetails = userDetails;
        const sqi_id = "Select * from user_login where email = ?";
        connection.query(sqi_id, req.user, (err, foundUser) => {
          if (err) throw err;

          const userId = foundUser[0].id;
          const userName = foundUser[0].name;

          const detail_sql = "Select * from user_detail where user_id = ?";
          connection.query(detail_sql, userId, (err, foundDetail) => {
            if (err) throw err;

            res.render("profile", {
              page_name: "",
              UserDetail: foundDetail,
              NavDetails: navDetails,
              UserName: userName,
            });
          });
        });
      })
      .catch((err) => {
        throw err;
      });
  });

  profile.post("/profile", authenticated.checkAuthenticated, (req, res) => {
    if (req.body.btn !== "cancel") {
      console.log(req.body);

      const sql_user_details = "UPDATE user_detail SET ? WHERE user_id = ?";
      const sql_user = "UPDATE user_login SET name = ? WHERE id = ?";

      const sql_id = "SELECT id FROM user_login WHERE email= ?";
      connection.query(sql_id, req.user, (err, foundId) => {
        if (err) throw err;

        const userId = foundId[0].id;

        if (!req.files) {
          const userDetailsNoImage = {
            user_id: userId,
            company_name: req.body.company_name,
            company_address: req.body.address,
            er_number: req.body.er_number,
            tin: req.body.tin_number,
          };

          console.log(req.files);
          console.log("Files No No");

          connection.query(
            sql_user_details,
            [userDetailsNoImage, userId],
            function (err) {
              if (err) throw err;

              connection.query(
                sql_user,
                [req.body.user_name, userId],
                (err) => {
                  if (err) throw err;
                  return res.redirect("/profile");
                }
              );
            }
          );
        } else {
          console.log("Files Yes Yes");
          const file = req.files.image;
          const img_name = file.name;

          console.log(req.file.image);

          file.mv("public/images/uploaded_images/" + img_name, function (err) {
            if (err) throw err;

            const userDetails = {
              user_id: userId,
              company_name: req.body.company_name,
              image: img_name,
              company_address: req.body.address,
              er_number: req.body.er_number,
              tin: req.body.tin_number,
            };

            connection.query(
              sql_user_details,
              [userDetails, userId],
              function (err) {
                if (err) throw err;

                connection.query(
                  sql_user,
                  [req.body.user_name, userId],
                  (err) => {
                    if (err) throw err;
                    return res.redirect("/profile");
                  }
                );
              }
            );
          });
        }
      });
    } else {
      res.redirect("/profile");
    }
  });

  profile.get("/edit_profile", authenticated.checkAuthenticated, (req, res) => {
    const sqi_id = "Select * from user_login where email = ?";
    connection.query(sqi_id, req.user, (err, foundUser) => {
      if (err) throw err;
      const userName = foundUser[0].name;
      const userId = foundUser[0].id;

      const detail_sql = "Select * from user_detail where user_id = ?";
      connection.query(detail_sql, userId, (err, foundDetail) => {
        if (err) throw err;

        res.render("edit_profile", {
          CompanyDetail: foundDetail,
          UserName: userName,
        });
      });
    });
  });
};
