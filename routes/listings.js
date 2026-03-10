const express = require("express");
const router = express.Router();

const Listing = require("../models/listing");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner } = require("./middleware");

const listingController = require("../controllers/listings");


// INDEX + CREATE
router
.route("/")
.get(wrapAsync(listingController.index))
.post(
  isLoggedIn,
  upload.single("listing[image]"),
  wrapAsync(listingController.createListing)
);


// NEW
router.get("/new", isLoggedIn, listingController.renderNewForm);


// CATEGORY FILTER
router.get("/filter/:category", async (req, res) => {
  const { category } = req.params;
  const allListings = await Listing.find({ category });
  res.render("listings/index", { allListings, category });
});


// SHOW
router.get("/:id", wrapAsync(listingController.showListing));


// UPDATE + DELETE
router
.route("/:id")
.put(
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"),
  wrapAsync(listingController.updateListing)
)
.delete(
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.destroyListing)
);


// EDIT
router.get(
"/:id/edit",
isLoggedIn,
isOwner,
wrapAsync(listingController.renderEditForm)
);

module.exports = router;