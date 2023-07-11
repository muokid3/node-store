const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const mongoConnect = require("./util/database").mongoConnect;

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const User = require("./models/user");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("64acd1ee8f9dbf9b92b5c3dd")
    .then((user) => {
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(() => {
  User.findById("64acd1ee8f9dbf9b92b5c3dd")
    .then((result) => {
      if (result) {
        console.log("User already registered, stating server");
        console.log(result);
        app.listen(3000);
      } else {
        const user = new User("Dennis", "dennis@dennis.com");
        user
          .save()
          .then((user) => {
            console.log("New user has been registered, stating server");
            console.log(user);
            app.listen(3000);
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => console.log(err));
});
