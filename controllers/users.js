const User = require("../models/user");

const bcrypt = require("bcrypt");

module.exports.renderUserForm = (req, res) => {
  res.render("users/register");
};

module.exports.registerUser = async (req, res, next) => {
  try {
    const { email, username, passwordHash } = req.body;
    const password = await bcrypt.hash(passwordHash, 12);
    const user = new User({ email, username, password });
    await user.save();
    req.session.user_id = user._id;
    res.redirect("/campgrounds");
  } catch (e) {
    console.log("LOG register error ", e);
    res.redirect("/register");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login");
};

module.exports.loginUser = async (req, res) => {
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
};

module.exports.logoutUser = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};