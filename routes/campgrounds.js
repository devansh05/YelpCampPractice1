const express = require("express");
const multer = require("multer");
const upload = multer({dest: 'uploads/'})
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const { campgroundSchema } = require("../utilities/validationSchemas");
const campgrounds = require("../controllers/campgrounds");
const Campground = require("../models/campground");
const {
  isLoggedIn,
  validateCampgrounds,
  isPermitted,
} = require("../middleware");

// Validation Middlewares

//Routes
router.get("/", isLoggedIn, catchAsync(campgrounds.index));

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.get("/:id", isLoggedIn, catchAsync(campgrounds.showCampgrounds));

// router.post(
//   "/",
//   isLoggedIn,
//   validateCampgrounds,
//   catchAsync(campgrounds.createCampground)
// );

router.post(
  "/",
  upload.array('image'),
  (req, res) => {
    console.log('LOG 1 ',req.body, " FILES ",req.files)
    res.send();
  }
);

router.get(
  "/edit/:id",
  isLoggedIn,
  isPermitted,
  catchAsync(campgrounds.renderEditForm)
);

router.patch(
  "/edit/:id",
  isLoggedIn,
  isPermitted,
  validateCampgrounds,
  catchAsync(campgrounds.editCampground)
);

router.delete(
  "/delete/:id",
  isLoggedIn,
  isPermitted,
  catchAsync(campgrounds.deleteCampground)
);

module.exports = router;
