const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");

const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

// Check if user is logged in
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in.");
        return res.redirect("/login");
    }

    next();
};


// CREATE REVIEW
router.post(
    "/listings/:id/reviews",
    isLoggedIn,
    wrapAsync(async (req, res) => {

        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            req.flash("error", "Listing not found.");
            return res.redirect("/listings");
        }

        const newReview = new Review(req.body.review);

        // Logged-in user becomes author
        newReview.author = req.user._id;

        await newReview.save();

        // Store review ID inside listing
        listing.reviews.push(newReview._id);

        await listing.save();

        req.flash("success", "Review added successfully!");

        res.redirect(`/listings/${listing._id}`);
    })
);



// DELETE REVIEW
router.delete(
    "/listings/:id/reviews/:reviewId",
    isLoggedIn,
    wrapAsync(async (req, res) => {

        const { id, reviewId } = req.params;

        // Remove review ID from listing
        await Listing.findByIdAndUpdate(
            id,
            {
                $pull: {
                    reviews: reviewId
                }
            }
        );

        // Delete review document
        await Review.findByIdAndDelete(reviewId);

        req.flash("success", "Review deleted successfully!");

        res.redirect(`/listings/${id}`);
    })
);


module.exports = router;