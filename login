// Load hash from your password DB.
bcrypt.compareSync("B4c0/\/", hash); // true
bcrypt.compareSync("not_bacon", hash); // false


 // const check_email_sql = "SELECT email FROM user_login WHERE email= ?";
    // connection.query(check_email_sql, [email], (err, foundEmail) => {
    //   if (err) throw err;

    //   if (foundEmail.length === 0) {
    //     return res.render("home", { Message: "Email does not exist" });
    //   }
    //   const check_password_sql =
    //     "SELECT password, id FROM user_login WHERE email= ?";
    //   connection.query(check_password_sql, [email], (err, foundPassword) => {
    //     if (err) throw err;

    //     bcrypt.compare(
    //       password,
    //       foundPassword[0].password,
    //       async (err, success) => {
    //         if (err) throw err;
    //         if (success === false) {
    //           return res.render("home", { Message: "Password is incorrect" });
    //         }
    //         if (success === true) {
    //           loginUserid = foundPassword[0].id;
    //           res.redirect("/dashboard");
    //         }
    //       }
    //     );
    //   });
    // });