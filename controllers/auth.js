const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  //console.log(req.session);
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.user,
  });
};

exports.postLogin = (req, res, next) => {
  User.findById("64aea633575e67877fb7b153")
    .then((user) => {
      req.session.loggedInUser = user;
      req.session.save((err) => {
        console.log(err);
        res.redirect("/");
      });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
