const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const {
  validateReviews,
  isLoggedIn,
  isReviewAuthor,
} = require("../middleware");
const reviews = require("../controllers/reviews");

router.delete("/:reviewId", isReviewAuthor, catchAsync(reviews.deleteReview));

router.post(
  "/",
  isLoggedIn,
  validateReviews,
  catchAsync(reviews.createReviews)
);

module.exports = router;
