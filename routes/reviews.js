const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("./middleware");

const reviewController = require("../controllers/reviews.js");

// POST REVIEW
router.post(
  "/",
  isLoggedIn,
  wrapAsync(reviewController.createReview)
);

// DELETE REVIEW
router.delete(
  "/:reviewId",
  isLoggedIn,
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;