const Campground = require("../models/campground");

module.exports.index = async (req, res, next) => {
    const allCampgrounds = await Campground.find({});
    if (!allCampgrounds) {
      //we need to pass it through next and add return or else otherwise the ejs will also render
      // as next doesnot stop execution of further statements
      return next(new AppError("Unable to find campgrounds!", 403));
    } else {
      res.render("campgrounds/index", { allCampgrounds });
      req.flash('success', 'Here are all the available campgrounds.')
    }
  }

  module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/create");
  }

  module.exports.createCampground = async (req, res, next) => {
    req.flash('success', 'Successfully created a new campground.')
    // if(!req.body.campground) throw new ExpressError('Inavlid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    campground.author = req.session.user_id;
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  }

  module.exports.showCampgrounds = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("author");
    res.render("campgrounds/show", { campground });
  }

  module.exports.renderEditForm = async (req, res, next) => {
    if (req.params.id) {
      const campground = await Campground.findById(req.params.id);
      res.render("campgrounds/edit", { campground });
    } else {
      // throw new Error('Unable to find post ID');
      return next(new Error("Unable to find post ID"));
    }
  }

  module.exports.editCampground = async (req, res, next) => {
    const { id } = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    const imagesArr = req.files.map(f => ({url: f.path, filename: f.filename}));
    updatedCampground.images.push(...imagesArr);
    await updatedCampground.save()
    res.redirect(`/campgrounds/${updatedCampground._id}`);
  }

  module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  }