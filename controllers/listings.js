const Listing = require("../models/listing");


// INDEX
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
};


// NEW FORM
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};


// SHOW
module.exports.showListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate("reviews")
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    res.render("listings/show", { listing });
};


// CREATE
module.exports.createListing = async (req, res) => {

    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;

    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};


// EDIT FORM
module.exports.renderEditForm = async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;

    if(originalImageUrl){
        originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_250");
    }

    res.render("listings/edit", { listing, originalImageUrl });
};
// UPDATE
module.exports.updateListing = async (req, res) => {

    const { id } = req.params;

    // prevent image overwrite
    delete req.body.listing.image;

    let listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { new: true }
    );

    // update image only if new one uploaded
    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};


// DELETE
module.exports.destroyListing = async (req, res) => {

    const { id } = req.params;

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};