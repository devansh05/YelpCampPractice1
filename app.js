//Video - 43 / 443 Error Template
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const AppError = require("./utils/ExpressError");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");

//Initiating db model
const Campground = require("./models/campground");

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

//Custom Middlewares

app.use((req, res, next) => {
  req.requestTime = Date.now();
  console.log("Custom Middleware ", req.method, req.path);
  next();
});

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

app.get(
  "/campgrounds",
  catchAsync(async (req, res, next) => {
    const allCampgrounds = await Campground.find({});
    if (!allCampgrounds) {
      //we need to pass it through next and add return or else otherwise the ejs will also render
      // as next doesnot stop execution of further statements
      return next(new AppError("Unable to find campgrounds!", 403));
    } else {
      res.render("campgrounds/index", { allCampgrounds });
    }
  })
);

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/create");
});

app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/show", { campground });
  })
);

app.post(
  "/campgrounds",
  catchAsync(async (req, res, next) => {
    if(!req.body.campground) throw new ExpressError('Inavlid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.get(
  "/campgrounds/edit/:id",
  catchAsync(async (req, res, next) => {
    if (req.params.id) {
      const campground = await Campground.findById(req.params.id);
      res.render("campgrounds/edit", { campground });
    } else {
      // throw new Error('Unable to find post ID');
      return next(new Error("Unable to find post ID"));
    }
  })
);

app.patch(
  "/campgrounds/edit/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${updatedCampground._id}`);
  })
);

app.delete(
  "/campgrounds/delete/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

app.get("/admin", (req, res) => {
  throw new AppError("You are not an Admin!", 403);
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).send(message);
});

//Setting up local server
app.listen(3000, () => {
  console.log("Serving on 3000");
});
