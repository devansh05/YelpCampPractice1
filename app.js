//Video - 42 / 431
//deleting a campground
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const AppError = require('./AppError/AppError');

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
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(morgan('dev'));

//Middlewares

const verifyPassword = (req, res , next) => {
  //this will run first tha the login api
  const { password } = req.query;
  if (password === '') {
    next(); //next middleware or function
  }
  res.status(404).send('Incorrect Password');
}

app.get('/login', verifyPassword, (req, res) => {
  res.send('Login success');
})

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
});

app.get("/campgrounds/edit/:id", async(req, res) => {
  if(req.params.id){
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground})
  } else {
    throw new Error('Unable to find post ID');
  }
});

app.patch("/campgrounds/edit/:id", async (req, res) => {
  const {id} = req.params;
  const updatedCampground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
  res.redirect(`/campgrounds/${updatedCampground._id}`,);
})

app.delete("/campgrounds/delete/:id", async(req, res) => {
  const { id } = req.params;
  const deletedCampground = await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds')
})


app.get("/errorTest1", async(req, res) => {
  throw new AppError(401, 'Not found custom error');
  // intentionalError.print();
})

app.get("/errorTest2", async(req, res) => {
  intentionalError.print();
})

//using error middleware this should be placed at the end of all requests
// app.use((err, req, res, next) => {
//   const { status = 500 } = err;
//   console.log('LOG Error Middleware ',err, ' status ', status);
//   //calling next with err as an argument
//   next(err);
// });

app.use((err, req, res, next) => {
  const { status = 500, message = 'Error1' } = err;
  // console.log('LOG Error Middleware ',err, ' status ', status);
  res.status(status).send('ERROR!!!!!', status, ' Message ', message)
});

//Setting up local server
app.listen(3000, () => {
  console.log("Serving on 3000");
});
