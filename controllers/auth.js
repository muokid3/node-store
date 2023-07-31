const brcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

//const awsSdk = require("aws-sdk");
let aws = require("@aws-sdk/client-ses");
let { defaultProvider } = require("@aws-sdk/credential-provider-node");

const User = require("../models/user");
const { use } = require("../routes/admin");

const ses = new aws.SES({
  region: process.env.AWS_DEFAULT_REGION,
  defaultProvider,
});

let transporter = nodemailer.createTransport({
  SES: { ses, aws },
});

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  console.log(process.env.AWS_SECRET_ACCESS_KEY);

  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const pass = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password");
        return res.redirect("/login");
      }

      brcrypt
        .compare(pass, user.password)
        .then((matches) => {
          if (matches) {
            req.session.isLoggedIn = true;
            req.session.loggedInUser = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          }

          req.flash("error", "Invalid email or password");

          res.redirect("/login");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const pass = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((resp) => {
      if (resp) {
        req.flash("error", "Email already in use, please use a different one");

        return res.redirect("/signup");
      }
      return brcrypt
        .hash(pass, 12)
        .then((hashedPass) => {
          const user = new User({
            name: name,
            email: email,
            password: hashedPass,
            cart: { items: [] },
          });

          return user.save();
        })
        .then((result) => {
          transporter
            .sendMail({
              from: "shop@254fundi.com",
              to: email,
              subject: "Sign up Succcessful!",
              text: "You just signed up on the node store!",
              ses: {
                // optional extra arguments for SendRawEmail
                Tags: [
                  {
                    Name: "tag_name",
                    Value: "tag_value",
                  },
                ],
              },
            })
            .then((result) => {
              console.log(result);
              return res.redirect("/login");
            })
            .catch((err) => console.log(err));
        });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }

    const token = buffer.toString("hex");

    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash(
            "error",
            "We could not find a user with the given email in our records"
          );
          return res.redirect("/reset");
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 60 * 60 * 1000; //one hour from now
        return user.save();
      })
      .then((result) => {
        res.redirect("/reset");
        transporter
          .sendMail({
            from: "shop@254fundi.com",
            to: req.body.email,
            subject: "Password Reset",
            html: `
             <p> You requested for a password reset.</>
             <p>Please <a href="http://localhost:3000/reset/${token}">click here</a> to reset your password.</p>
             <p>This link is only valid for 60 minutes </p>
             `,
            ses: {
              // optional extra arguments for SendRawEmail
              Tags: [
                {
                  Name: "tag_name",
                  Value: "tag_value",
                },
              ],
            },
          })
          .then((result) => {
            console.log(result);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        resetToken: token,
        userId: user._id.toString(),
      });
    })
    .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
  const userId = req.body.userId;
  const resetToken = req.body.resetToken;
  const password = req.body.password;
  let resetUser;

  User.findOne({
    _id: userId,
    resetToken: resetToken,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      resetUser = user;

      return brcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;

      return resetUser.save();
    })
    .then((result) => {
      return res.redirect("login");
    })
    .catch((err) => console.log(err));
};
