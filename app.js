require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");

const listingsRouter = require("./routes/listings.js");
const userRouter = require("./routes/user.js");

const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user.js");
const Review = require("./models/review.js");
const reviewsRouter = require("./routes/reviews.js");

const MONGO_URL = process.env.ATLASDB_URL;


// Connect to MongoDB
mongoose
    .connect(MONGO_URL)
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err);
    });


// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));


// Session
const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
};

app.use(session(sessionOptions));
app.use(flash());


// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Global variables
app.use((req, res, next) => {
    res.locals.currUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});


// Home
app.get("/", (req, res) => {
    res.redirect("/listings");
});


// Routes
app.use("/listings", listingsRouter);
app.use("/", reviewsRouter);
app.use("/", userRouter);


// 404
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});


// Error handling
app.use((err, req, res, next) => {

    console.log("========== ERROR ==========");
    console.log("Error name:", err.name);
    console.log("Error message:", err.message);

    const {
        statusCode = 500,
        message = "Something went wrong",
    } = err;

    res.status(statusCode).send(message);
});


// Start server
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});