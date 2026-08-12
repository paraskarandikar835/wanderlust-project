const Listing = require("../models/listing");
const Review = require("../models/review");



module.exports.createReview = async (req, res) => {
  console.log("Review Body =", req.body);

  const { id } = req.params;

  const listing = await Listing.findById(id);

  const newReview = new Review(req.body.review);

  newReview.author = req.user._id;

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  req.flash("success", "Review added successfully!");

  res.redirect(`/listings/${id}`);
};