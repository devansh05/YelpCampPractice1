//Video - 51/505 Passport
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

//Routes
const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");
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
db.once("open", () => {
});

//Setting up EJS
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(flash());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));

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

//Custom Middlewares
app.use((req, res, next) => {
  req.requestTime = Date.now();
  next();
});

app.use((req, res, next) => {
  console.log("LOG req.locals  ", req.flash(''));
  res.locals.success = req.flash("success");
  res.locals.failure = req.flash("failure");
  next();
});

//Routes Middlewares
app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);

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
  console.log('LOG Error  ',)
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