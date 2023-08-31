//Video - 51/504, 505 Passport Authentication
const express = require("express");
const app = express();
const router = express.Router();
const session = require("express-session");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const path = require("path");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const passport = require('passport');
require('./config/passportConfig')(passport);

// const LocalStrategy = require('passport-local').Strategy;

//Model for passport
// const User = require('./models/user');

//Error
const AppError = require("./utils/ExpressError");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const {
  campgroundSchema,
  reviewSchema,
} = require("./utilities/validationSchemas");

//Initiating db model
const campground = require("./models/campground");

//Setting up EJS
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//MiddleWares
const sessionConfig = {
  secret: "yelpCampSecretKeyDev",
  resave: false,
  saveUninitialized: "true",
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 2,
    maxAge: 1000 * 60 * 60 * 24 * 2,
  },
};

app.use(session(sessionConfig));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
//Passport Init
// User.createStrategy();
app.use(passport.initialize());
app.use(flash());
app.use(passport.session());
//add user from local strategy and call method authenticate there already added from plugin
// passport.use(new LocalStrategy(User.authenticate()));

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

//Routes
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

//Initiating db connection
mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Mongo Connected!");
  })
  .catch((error) => {
    console.log("Mongo Connection Error ", error);
  });

//initiating db
const db = mongoose.connection;
db.once("open", () => {
});


//Custom Middlewares
app.use((req, res, next) => {
  req.requestTime = Date.now();
  next();
});

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.failure = req.flash("failure");
  next();
});

//Routes Middlewares
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

const verifyPassword = (req, res, next) => {
  //this will run first tha the login api
  const { password } = req.query;
  if (password === "") {
    next(); //next middleware or function
  }
  res.status(404).send("Incorrect Password");
};

app.get("/login", verifyPassword, (req, res) => {
  res.send("Login success");
});

//Paths
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/admin", (req, res) => {
  throw new AppError("You are not an Admin!", 403);
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  res.status(statusCode).render("error", { err });
});

//Setting up local server
app.listen(3000, () => {
  console.log("Serving on 3000");
});