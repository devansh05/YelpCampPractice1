const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const {
  campgroundSchema,
} = require("../utilities/validationSchemas");
const Campground = require("../models/campground");

// Validation Middlewares
const validateCampgrounds = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  console.log("LOG  error ", error);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

//Routes
router.get(
  "/",
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

router.get("/new", (req, res) => {
  res.render("campgrounds/create");
});

router.get(
  "/:id",
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    );
    res.render("campgrounds/show", { campground });
  })
);

router.post(
  "/",
  validateCampgrounds,
  catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Inavlid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.get(
  "/edit/:id",
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

router.patch(
  "/edit/:id",
  validateCampgrounds,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`campgrounds/${updatedCampground._id}`);
  })
);

router.delete(
  "/delete/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

module.exports = router;
