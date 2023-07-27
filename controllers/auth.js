const brcrypt = require("bcryptjs");
const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  //console.log(req.session);
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const pass = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
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
        return res.redirect("/");
      }
      return brcrypt.hash(pass, 12).then((hashedPass) => {
        const user = new User({
          name: name,
          email: email,
          password: hashedPass,
          cart: { items: [] },
        });

        return user.save();
      });
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
