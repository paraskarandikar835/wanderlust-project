const express = require("express");
const router = express.Router();
const passport = require("passport");

const userController = require("../controllers/users");
const { saveRedirectUrl } = require("./middleware");



// SIGNUP

// show signup form
router.get("/signup", userController.renderSignupForm);

// handle signup
router.post("/signup", userController.signup);



// LOGIN

// show login form
router.get("/login", userController.renderLoginForm);

// handle login
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.login
);

// LOGOUT
router.get("/logout", userController.logout);


module.exports = router;