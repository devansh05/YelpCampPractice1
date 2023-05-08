//Video - 410
//adding a new campground
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
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
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended: true}));

//Paths
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/campgrounds", async(req, res) => {
  const allCampgrounds = await Campground.find({});
  res.render('campgrounds/index', {allCampgrounds})
});

app.get("/campgrounds/new", (req, res) => {
  res.render('campgrounds/create');
})

app.get("/campgrounds/:id", async(req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render('campgrounds/show', {campground})
});

app.post("/campgrounds", async (req, res) => {
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
})

//Setting up local server
app.listen(3000, () => {
  console.log("Serving on 3000");
});
