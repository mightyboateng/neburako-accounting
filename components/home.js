const connection = require("./database");
const passport = require("passport");
const session = require("express-session");
const flash = require("express-flash");
const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;
const checkNotAuth = require("./home");

passport.use(
  new LocalStrategy({ usernameField: "email" }, function (
    email,
    password,
    done
  ) {
    const user = email;
    try {
      const check_email_sql = "SELECT email FROM user_login WHERE email= ?";

      connection.query(check_email_sql, user, (err, foundEmail) => {
        if (err) throw err;

        if (foundEmail.length === 0) {
          console.log("User not found");
          return done(null, false, { message: "Email does not exist" });
        }
        const check_password_sql =
          "SELECT password FROM user_login WHERE email= ?";

        connection.query(
          check_password_sql,
          email,
          async (err, foundPassword) => {
            if (err) throw err;

            if (await bcrypt.compare(password, foundPassword[0].password)) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Password is incorrect" });
            }
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  })
);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

let loginUserid;
exports.home = function (home) {
  home.use(flash());
  home.use(
    session({
      secret: process.env.SECRET_SESSION,
      resave: false,
      saveUninitialized: false,
    })
  );
  home.use(passport.initialize());
  home.use(passport.session());

  home.get("/", checkNotAuth.checkNotAuthenticated, (req, res) => {
    res.render("home", { Message: "" });
  });

  home.post(
    "/",
    checkNotAuth.checkNotAuthenticated,
    passport.authenticate("local", {
      successRedirect: "/dashboard",
      failureRedirect: "/",
      failureFlash: true,
    })
  );

  home.get("/logout", checkNotAuth.checkAuthenticated, (req, res) => {
    req.logOut();
    res.redirect("/");
  });
};

exports.getLoginUserId = function () {
  return loginUserid;
};

exports.checkAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
};

exports.checkNotAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect("/dashboard");
  } else {
    return next();
  }
};
