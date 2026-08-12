// const dns = require("node:dns");

// dns.setServers([
//   "8.8.8.8",
//   "1.1.1.1"
// ]);

require("dotenv").config();
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

console.log(process.env.CLOUD_NAME);

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const User = require("./models/user.js");

const listingsRouter = require("./routes/listings");
const reviewsRouter = require("./routes/reviews");
const userRouter = require("./routes/user.js");

// MongoDB connection
const dbUrl = process.env.ATLASDB_URL;
console.log("DB URL:", dbUrl);
mongoose.connect(dbUrl)
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });


// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
  mongoUrl: process.env.ATLASDB_URL, // <-- Changed from DB_URL to ATLASDB_URL
  crypto: {
    secret: process.env.SECRET || "mysupersecretcode",
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("Error in MONGO SESSION STORE", err);
});
// Session configuration
const sessionConfig = {
  store,
  secret: process.env.SESSION_SECRET ||  "mysupersecretcode", 
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
};

app.use(session(sessionConfig));
app.use(flash());


// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Flash messages middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});


// Routes
app.get("/", (req, res) => {
  res.redirect("/listings");
});
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);


// Server
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});