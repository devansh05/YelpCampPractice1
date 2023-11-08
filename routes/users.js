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
      const password = await bcrypt.hash(passwordHash, 12)
      const user = new User({ email, username, password });
      await user.save();
      req.session.user_id = user._id;
      res.redirect("/campgrounds");
    } catch (e) {
      console.log('LOG register error ',e)
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
    console.log(
      "LOG ERROR LOGIN incorrect username or password ",
      username,
      password
    );
    res.redirect("/login");
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
