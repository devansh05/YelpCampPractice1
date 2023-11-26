//59/573 Implementing deployment config for Heroku

if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
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
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const MongoStore = require('connect-mongo');

//Model for passport
const User = require("./models/user");
const dbUrl = process.env.MONGO_DB_URL || "mongodb://127.0.0.1:27017/yelp-camp"

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

const secretKey = process.env.SECRET || 'yelpCampSecretKeyDev';

const store = MongoStore.create({
  mongoUrl: dbUrl,
  secret: secretKey,
  touchAfter: 24 * 60 * 60
})

store.on('error', function(e){
  console.log('Session Store Error', e)
})

const sessionConfig = {
  store,
  secret: secretKey,
  name: "session",
  resave: false,
  saveUninitialized: "true",
  cookie: {
    // httpOnly: true,
    // httpsOnly: true, //this only works on https
    // secure: true, //this will only work on https requests
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
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css",
  "http://localhost:3000/public/stylesheets/home.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css",
  "http://localhost:3000/public/stylesheets/home.css",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
  "https://source.unsplash.com/collection/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/ded08vkk3/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
        "https://source.unsplash.com/collection/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

//Routes
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

//Initiating db connection
// mongodb://127.0.0.1:27017/yelp-camp

mongoose
  .connect(process.env.MONGO_DB_URL)
  .then(() => {
    console.log("Mongo Connected!");
  })
  .catch((error) => {
    console.log("Mongo Connection Error", error);
  });

//initiating db
const db = mongoose.connection;
db.once("open", () => {});

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

//Setting up server
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Serving on port : ${port}`);
});
