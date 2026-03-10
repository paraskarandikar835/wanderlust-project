// Insert sample data into the database (Seeding)

require("dotenv").config({ path: "../.env" });

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const dbUrl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connected to DB");
  await initDb();
  mongoose.connection.close();
}

main().catch((err) => {
  console.log(err);
});

const initDb = async () => {
  await Listing.deleteMany({});

  const ownerId = new mongoose.Types.ObjectId("69a558a6321f83259915af87");

  const updatedData = initData.data.map((obj) => ({
    ...obj,
    owner: ownerId,
  }));

  await Listing.insertMany(updatedData);

  console.log("Data was initialized");
};