//Video - 48/487 Express Sessions
const express = require("express");
const app = express();
const session = require('express-session');
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const AppError = require("./utils/ExpressError");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const {
  campgroundSchema,
  reviewSchema,
} = require("./utilities/validationSchemas");

//Initiating db model
const campground = require("./models/campground");

//Routes
const campgrounds = require('./routes/campgorunds');
const reviews = require('./routes/reviews');

//Initiating db connection
mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => {
    console.log("Mongo Connected!");
  })
  .catch((error) => {
    console.log("Mongo Connection Error ", error);
  });

//initiating db
const db = mongoose.connection;
db.on("error", console.log.bind(console, "db connection error:"));
db.once("open", () => {
  console.log("db connected");
});

//Setting up EJS
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
  secret: 'yelpCampSecretKeyDev',
  resave: false,
  saveUninitialized: 'true',
  cookie : {
    httpOnly: true,
    expires : Date.now() + (1000 * 60 * 60 * 24 * 2),
    maxAge : 1000 * 60 * 60 * 24 * 2
  }
}

app.use(session(sessionConfig))

//Custom Middlewares
app.use((req, res, next) => {
  req.requestTime = Date.now();
  console.log("Custom Middleware ", req.method, req.path);
  next();
});

//Routes Middlewares
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews)

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
  console.log(err);
  res.status(statusCode).render("error", { err });
});

//Setting up local server
app.listen(3000, () => {
  console.log("Serving on 3000");
});
