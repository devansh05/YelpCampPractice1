const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const users = require("../controllers/users");

router.get("/register", users.renderUserForm);

router.post("/register", catchAsync(users.registerUser));

router.get("/login", users.renderLoginForm);

router.post("/login", users.loginUser);

router.get("/logout", users.logoutUser);

module.exports = router;
