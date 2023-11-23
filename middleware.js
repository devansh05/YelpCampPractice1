const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review");

const {
  campgroundSchema,
  reviewSchema,
} = require("./utilities/validationSchemas");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.session.user_id) {
    req.session.destroy();
    console.log("LOG ERROR. YOU ARE NOT LOGGED IN. PLEASE LOGIN AGAIN.");
    return res.redirect("/login");
  }
  next();
};

module.exports.validateCampgrounds = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else if (req.files.length > 3) {
    const msg = "You can only upload 3 images.";
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isPermitted = async (req, res, next) => {
  const { id } = req.params;
  const cp = await Campground.findById(id);

  if (!cp.author._id.equals(req.session.user_id)) {
    console.log("LOG You dont have permission to do this.");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports.validateReviews = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);

  if (!review.author._id.equals(req.session.user_id)) {
    console.log("LOG You dont have permission to do this.");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};
