const express = require("express");
const router = express.Router({mergeParams : true});
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

const { reviewSchema } = require("../utilities/validationSchemas");
const Campground = require("../models/campground");
const Review = require("../models/review");

const validateReviews = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.delete(
  "/:reviewId",
  catchAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    //Pull operator in mongo that removes a value and all value that matches
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(req.params.reviewId);
    res.redirect(`/campgrounds/${id}`);
  })
);

router.post(
  "/",
  validateReviews,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campGround = await Campground.findById(id);
    const review = new Review(req.body.review);
    campGround.reviews.push(review);
    await campGround.save();
    await review.save();
    res.redirect(`/campgrounds/${campGround._id}`);
  })
);

module.exports = router;
