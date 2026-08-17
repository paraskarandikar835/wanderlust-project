const express = require("express");
const router = express.Router();

const Listing = require("../models/listing");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner } = require("./middleware");

const listingController = require("../controllers/listings");


// Index + Create
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("image"),
        wrapAsync(listingController.createListing)
    );


// New
router.get("/new", isLoggedIn, listingController.renderNewForm);


// Search
router.get("/search", wrapAsync(async (req, res) => {

    const { q } = req.query;

    if (!q || !q.trim()) {
        return res.redirect("/listings");
    }

    const searchTerm = q.trim();

    const allListings = await Listing.find({
        $or: [
            { title: { $regex: searchTerm, $options: "i" } },
            { description: { $regex: searchTerm, $options: "i" } },
            { location: { $regex: searchTerm, $options: "i" } },
            { country: { $regex: searchTerm, $options: "i" } },
            { category: { $regex: searchTerm, $options: "i" } }
        ]
    });

    res.render("listings/index", {
        allListings,
        searchTerm
    });

}));


// Category Filter
router.get("/filter/:category", wrapAsync(async (req, res) => {

    const { category } = req.params;

    const allListings = await Listing.find({ category });

    res.render("listings/index", {
        allListings,
        category
    });

}));


// Show
router.get("/:id", wrapAsync(listingController.showListing));


// Update + Delete
router
    .route("/:id")
    .put(
        isLoggedIn,
        isOwner,
        upload.single("image"),
        wrapAsync(listingController.updateListing)
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroyListing)
    );


// Edit
router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm)
);


module.exports = router;