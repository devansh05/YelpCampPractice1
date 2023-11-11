const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const { validateReviews, isLoggedIn, isReviewAuthor } = require("../middleware");
const Campground = require("../models/campground");
const Review = require("../models/review");

router.delete(
  "/:reviewId",
  isReviewAuthor,
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
  isLoggedIn,
  validateReviews,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campGround = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.session.user_id;
    campGround.reviews.push(review);
    await campGround.save();
    await review.save();
    res.redirect(`/campgrounds/${campGround._id}`);
  })
);

module.exports = router;
