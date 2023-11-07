const express = require("express");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require("bcrypt");

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post(
  "/register",
  catchAsync(async (req, res, next) => {
    try {
      const { email, username, passwordHash } = req.body;
      const user = new User({ email, username, passwordHash });
      await user.save();
      req.session.user_id = user._id;
      res.redirect("/campgrounds");
    } catch (e) {
      console.log("LOG 2  ");
      console.error("LOG  e.message ", e.message);
      res.redirect("/register");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    console.error(
      "LOG ERROR LOGIN incorrect username or password ",
      username,
      password
    );
  } else {
    const foundUser = await User.findUserAndValidate(username, password);
    if (foundUser) {
      req.session.user_id = foundUser._id;
      const redirectUrl = req.session.returnTo || "/campgrounds";
      res.redirect(redirectUrl);
    } else {
      res.redirect("/login");
    }
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
