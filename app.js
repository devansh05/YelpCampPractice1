//54/539 Editing, showing and deleting images displaying Thumbnails

if(process.env.NODE_ENV != 'production'){
  require('dotenv').config();
}

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

//Model for passport
const User = require('./models/user');

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

app.use(express.urlencoded({ extended: true }));
app.use(session(sessionConfig));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
//Passport Init
app.use(flash());

//Routes
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

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


//Custom Middlewares

app.use(async (req, res, next) => {
  res.locals.user_id = req.session.user_id;
  const currentUser = await User.findById(req.session.user_id);
  res.locals.currentUser = currentUser;
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