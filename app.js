const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";

//Connect DB
mongoose.connect(MONGO_URL)
.then(() => {
    console.log("Connected to DB");
})
.catch((err) => {
    console.log(err);
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// IMPORTANT ORDER
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
        return req.body._method;
    }
}));

// app.engine("ejs", ejsMate);
// app.use(express.static(path.join(__dirname, "public")));

app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

// Make currUser available in every EJS file
app.use((req, res, next) => {
    res.locals.currUser = null;
    res.locals.success = "";
    res.locals.error = "";
    next();
});

// ROOT
app.get("/", (req, res) => {
    res.send("Root working");
});


// INDEX
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
});


// NEW
app.get("/listings/new", (req, res) => {
    res.render("listings/new");
});


// CREATE
// CREATE
app.post("/listings", wrapAsync(async (req, res) => {

    const listingData = req.body.listing;

    const imageUrl =
        listingData.image && listingData.image.trim() !== ""
            ? listingData.image
            : "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=60";

    const newListing = new Listing({
        ...listingData,
        image: {
            url: imageUrl,
            filename: "listingimage"
        }
    });

    await newListing.save();
    res.redirect("/listings");
}));

//Delete Route
app.delete("/listings/:id", async (req, res) => {
    const { id } = req.params;

    await Listing.findByIdAndDelete(id);

    res.redirect("/listings");
});

// SHOW (Single Listing Page)
app.get("/listings/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/show", { listing });
}));

// 404 handler (must be after all routes)
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// Error handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("Server running on port 8080");
});









