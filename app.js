const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

require("dotenv").config({ path: __dirname + "/.env" });

const path = require("path");
const errorController = require("./controllers/error");

const MONGO_DB_URI =
  "mongodb+srv://nodeuser:iv6ieHXdBfWww79R@cluster0.eyesdhv.mongodb.net/shop";

const store = new MongoDBStore({
  uri: MONGO_DB_URI,
  collection: "sessions",
});

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const User = require("./models/user");
const { redirect } = require("express/lib/response");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "Just a random text",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrf());
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.loggedInUser) {
    return next();
  }
  User.findById(req.session.loggedInUser._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      throw new Error(err);
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.loggedInUser;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use("/500", errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.redirect("/500");
});

mongoose
  .connect(MONGO_DB_URI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
