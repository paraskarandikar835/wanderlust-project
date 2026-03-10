const Listing = require("../models/listing");
const Review = require("../models/review");


// ==========================
// CREATE REVIEW
// ==========================
module.exports.createReview = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  const newReview = new Review(req.body.review);

  // attach logged-in user
  newReview.author = req.user._id;

  // push review to listing
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  req.flash("success", "Review added successfully!");

  res.redirect(`/listings/${id}`);
};


// ==========================
// DELETE REVIEW
// ==========================
module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId }
  });

  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review deleted successfully!");

  res.redirect(`/listings/${id}`);
};























