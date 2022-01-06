require("dotenv").config();
const nodemailer = require("nodemailer");

module.exports = function (contact) {
  contact.post("/contact", (req, res) => {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "nananeburako@gmail.com",
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    var mailOptions = {
      from: req.body.user_email,
      to: "neburakoghana@gmail.com",
      subject: "Sending Email from Neburako Accounting Application",
      text: req.body.user_message,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);

        res.render("contact", { message: "Mail sent successfully" });
      }
    });
  });
};
